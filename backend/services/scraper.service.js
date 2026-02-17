const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

// Add stealth plugin
puppeteer.use(StealthPlugin());

const DEBUG_LOG = path.join(__dirname, '../scraper_debug.log');

const scrapeJobs = async (urls) => {
    logger.info(`--- Scrape Session Started: ${new Date().toISOString()} ---`);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-http-cache',
                '--window-size=1920,1080'
            ]
        });
    } catch (launchError) {
        logger.error(`FAILED TO LAUNCH BROWSER: ${launchError.message}`);
        throw new Error(`Browser launch failed. This usually means Puppeteer/Chromium dependencies are missing on the server. ${launchError.message}`);
    }

    const allJobs = [];

    try {
        for (const url of urls) {
            logger.info(`Targeting URL: ${url}`);
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
                    logger.warn(`Cloudflare/Captcha detected for URL: ${url}`);
                }

                logger.info(`Starting Deep Exploration (Show More + Scrolling)...`);

                const jobSelectors = [
                    "[data-test='jobListItem']",
                    "[class*='JobCard_jobCardWrapper']",
                    ".react-job-listing",
                    "[data-test='jobListing']"
                ];

                // DEEP EXPLORATION LOOP: Click "Show More" as long as it's there (limit 5 times) and scroll
                for (let i = 0; i < 6; i++) {
                    const moreBtn = await page.$('button[class*="JobCard_loadMore"], [data-test="load-more"]');
                    if (moreBtn) {
                        logger.info(`Clicking 'Show More' (Iteration ${i + 1})...`);
                        await moreBtn.click().catch(() => { });
                        await new Promise(r => setTimeout(r, 3000));
                    }

                    await page.evaluate(() => window.scrollBy(0, 1500));
                    await new Promise(r => setTimeout(r, 2000));

                    const count = (await page.$$(jobSelectors.join(", "))).length;
                    logger.info(`Progress: ${count} jobs loaded.`);

                    if (count > 60) break;
                }

                let jobItems = await page.$$(jobSelectors.join(", "));
                const totalFound = jobItems.length;
                logger.info(`Total cards captured for extraction: ${totalFound}`);

                const scrapedJobs = [];
                const seenKeys = new Set();
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
                        logger.error(`Card ${i} Error: ${cardErr.message}`);
                    }
                }

                allJobs.push(...scrapedJobs);
                logger.info(`URL Result: Found ${scrapedJobs.length} potential jobs.`);

            } catch (err) {
                logger.error(`Error scraping ${url}: ${err.message}`);
            } finally {
                if (page) await page.close();
            }

            // Global limit for a single trigger session
            if (allJobs.length >= 100) break;
        }
    } catch (error) {
        logger.error(`Scraper process error: ${error.message}`);
    } finally {
        if (browser) await browser.close();
        logger.info(`--- Scrape Session Ended ---`);
    }

    return allJobs;
};

module.exports = { scrapeJobs };
