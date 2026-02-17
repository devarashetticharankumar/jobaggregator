const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Add stealth plugin
puppeteer.use(StealthPlugin());

const DEBUG_LOG = path.join(__dirname, '../scraper_debug.log');

const scrapeJobs = async (urls) => {
    // Clear debug log for fresh session
    fs.writeFileSync(DEBUG_LOG, `--- Scrape Session Started: ${new Date().toISOString()} ---\n`);

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-http-cache',
            '--window-size=1920,1080'
        ]
    });

    const allJobs = [];

    try {
        for (const url of urls) {
            fs.appendFileSync(DEBUG_LOG, `\nTargeting URL: ${url}\n`);
            const page = await browser.newPage();

            await page.setCacheEnabled(false);
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

            try {
                await page.setViewport({ width: 1440, height: 900 });

                await page.goto(url, { waitUntil: 'load', timeout: 90000 });
                await new Promise(r => setTimeout(r, 7000));

                const isBlocked = await page.evaluate(() => {
                    const text = document.body.innerText;
                    return text.includes("Help Us Protect Glassdoor") || text.includes("Just a moment") || text.includes("security check");
                });

                if (isBlocked) {
                    fs.appendFileSync(DEBUG_LOG, `Cloudflare/Captcha detected for URL: ${url}\n`);
                    fs.writeFileSync(path.join(__dirname, '../glassdoor_block.html'), await page.content());
                }

                fs.appendFileSync(DEBUG_LOG, `Starting Deep Exploration (Show More + Scrolling)...\n`);

                const jobSelectors = [
                    "[data-test='jobListItem']",
                    "[class*='JobCard_jobCardWrapper']",
                    ".react-job-listing",
                    "[data-test='jobListing']"
                ];

                // DEEP EXPLORATION LOOP: Click "Show More" as long as it's there (limit 5 times) and scroll
                for (let i = 0; i < 6; i++) {
                    // Try to finding and clicking "Show More"
                    const moreBtn = await page.$('button[class*="JobCard_loadMore"], [data-test="load-more"]');
                    if (moreBtn) {
                        fs.appendFileSync(DEBUG_LOG, `Clicking 'Show More' (Iteration ${i + 1})...\n`);
                        await moreBtn.click().catch(() => { });
                        await new Promise(r => setTimeout(r, 3000));
                    }

                    // Scroll to bottom a bit
                    await page.evaluate(() => window.scrollBy(0, 1500));
                    await new Promise(r => setTimeout(r, 2000));

                    const count = (await page.$$(jobSelectors.join(", "))).length;
                    fs.appendFileSync(DEBUG_LOG, `Progress: ${count} jobs loaded.\n`);

                    if (count > 60) break; // Efficiency cap
                }

                let jobItems = await page.$$(jobSelectors.join(", "));
                const totalFound = jobItems.length;
                fs.appendFileSync(DEBUG_LOG, `Total cards captured for extraction: ${totalFound}\n`);

                if (totalFound === 0) {
                    fs.writeFileSync(path.join(__dirname, `../debug_zero_results_${Date.now()}.html`), await page.content());
                }

                const scrapedJobs = [];
                const seenKeys = new Set();

                // Extract up to 60 jobs per URL now that we click show more
                const limit = Math.min(totalFound, 60);

                for (let i = 0; i < limit; i++) {
                    jobItems = await page.$$(jobSelectors.join(", "));
                    const item = jobItems[i];
                    if (!item) continue;

                    try {
                        await item.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
                        await item.click().catch(() => { });
                        await new Promise(r => setTimeout(r, 1200));

                        const jobData = await page.evaluate((index, selList) => {
                            const cards = document.querySelectorAll(selList);
                            const card = cards[index];
                            if (!card) return null;

                            const titleEl = card.querySelector('[class*="JobCard_jobTitle"], [data-test="job-title"], a[data-test="job-link"]');
                            const companyEl = card.querySelector('[class*="EmployerProfile_compactEmployerName"], [data-test="employer-name"]');
                            const locationEl = card.querySelector('[class*="JobCard_location"], [data-test="location"]');
                            const salaryEl = card.querySelector('[class*="JobCard_salaryEstimate"], [data-test="detailSalary"]');
                            const linkEl = card.querySelector('a[class*="JobCard_trackingLink"], a[data-test="job-link"]');
                            const logoEl = card.querySelector('img[class*="avatar-base_Image"], img[data-test="employer-logo"]');

                            let fullDescription = "";
                            const detailSelectors = [
                                '[class*="JobDetails_jobDescription"]',
                                '[data-test="jobDescription"]',
                                '.jobDescriptionContent',
                                '#JobDescriptionContainer',
                                '.desc',
                                '[class*="job-description"]'
                            ];
                            for (const dSel of detailSelectors) {
                                const dPane = document.querySelector(dSel);
                                if (dPane && dPane.innerText.trim().length > 50) {
                                    fullDescription = dPane.innerText.trim();
                                    break;
                                }
                            }

                            if (!fullDescription) fullDescription = card.innerText.trim();

                            if (titleEl && (companyEl || logoEl)) {
                                let companyNameRaw = companyEl ? companyEl.innerText.trim() : "Unknown Company";
                                const companyName = companyNameRaw.replace(/\s+\d+(\.\d+)?\s*$/, "").trim();

                                return {
                                    jobTitle: titleEl.innerText.trim(),
                                    companyName: companyName,
                                    jobLocation: locationEl ? locationEl.innerText.trim() : 'Remote',
                                    salary: salaryEl ? salaryEl.innerText.trim() : '',
                                    description: fullDescription,
                                    ApplyLink: linkEl ? linkEl.href : window.location.href,
                                    companyLogo: logoEl ? (logoEl.src || logoEl.dataset.src) : 'https://i.imgur.com/0qGt7qj.png'
                                };
                            }
                            return null;
                        }, i, jobSelectors.join(", "));

                        if (jobData && jobData.jobTitle) {
                            const key = `${jobData.jobTitle.toLowerCase()}-${jobData.companyName.toLowerCase()}`;
                            if (!seenKeys.has(key)) {
                                seenKeys.add(key);
                                scrapedJobs.push(jobData);
                            }
                        }
                    } catch (cardErr) {
                        fs.appendFileSync(DEBUG_LOG, `Card ${i} Error: ${cardErr.message}\n`);
                    }
                }

                allJobs.push(...scrapedJobs);
                fs.appendFileSync(DEBUG_LOG, `URL Result: Found ${scrapedJobs.length} potential jobs.\n`);

            } catch (err) {
                fs.appendFileSync(DEBUG_LOG, `URL processing error: ${err.message}\n`);
                logger.error(`Error scraping ${url}: ${err.message}`);
            } finally {
                await page.close();
            }

            // Global limit for a single trigger session
            if (allJobs.length >= 100) break;
        }
    } catch (error) {
        fs.appendFileSync(DEBUG_LOG, `Global failure: ${error.message}\n`);
        logger.error(`Scraper process error: ${error.message}`);
    } finally {
        await browser.close();
        fs.appendFileSync(DEBUG_LOG, `--- Scrape Session Ended ---\n`);
    }

    return allJobs;
};

module.exports = { scrapeJobs };
