const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const nodemailer = require("nodemailer");
const slugify = require("slugify");
const { ObjectId } = require("mongodb");

// Note: You will need to bring your own validation schemas if you want to use them here.
// For now, I'm providing a basic mock or assuming you'll run this with a DB connection.
const jobSchema = {
    validate: (job) => ({ error: null }) // Basic mock for standalone use
};

puppeteer.use(StealthPlugin());

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

const templates = {
    about: [
        "The modern professional landscape is constantly evolving, requiring dedicated individuals who can adapt and thrive in dynamic settings. This specific role offers a comprehensive platform for high-impact contributions and professional excellence. At its core, the position is designed for those who possess a deep-seated passion for innovation and a meticulous approach to problem-solving. Joining this team means becoming part of a forward-thinking culture that values integrity, collaboration, and the pursuit of industry-leading standards. The successful candidate will find themselves immersed in a professional environment that encourages creative thinking and rewards initiative. We believe that true growth stems from a combination of technical proficiency and the ability to view challenges from multiple perspectives. This role is not just a job; it is a significant step in a career journey designed for those who aim to make a tangible difference in their respective field. Every day presents new opportunities to refine skills, engage with talented peers, and contribute to projects that have a lasting influence. The commitment to excellence is reflected in every aspect of the organizational structure, providing a stable yet exciting foundation for long-term career satisfaction.",
        "Navigating the complexities of today's market requires a unique blend of expertise and adaptability. We are currently seeking a professional who embodies these traits and is ready to take on a role that is both challenging and rewarding. This position is strategically positioned to drive meaningful results while offering the individual ample room for personal and professional development. The organizational philosophy centers on the belief that diverse perspectives lead to the most effective solutions. In this role, you will be empowered to explore new ideas, implement efficient processes, and collaborate with a group of like-minded experts. The work environment is characterized by a high degree of mutual respect and a collective drive toward achieving ambitious milestones. We prioritize a culture where open communication and continuous learning are the norm, rather than the exception. By joining our team, you are entering a space where your contributions are recognized and your potential is nurtured. This is an invitation to bring your expertise to a firm that is dedicated to setting new benchmarks in quality and innovation within the industry.",
        "In an era where industry standards are constantly being redefined, the need for skilled and motivated professionals has never been greater. This role provides a unique vantage point from which to influence key outcomes and contribute to the broader success of the organization. We are looking for an individual who is not only technically capable but also aligns with a culture of excellence and high-performance standards. The responsibilities inherent in this position require a balanced approach, combining strategic oversight with tactical execution. Our workplace is designed to foster professional maturity and encourage individuals to take ownership of their professional trajectory. We understand that the most successful projects are the result of collective effort and shared vision. Consequently, the workspace is highly collaborative, emphasizing the importance of team synergy and effective communication. By choosing to apply for this role, you are signaling your readiness to engage with complex tasks and contribute to a legacy of professional achievement. We are committed to providing the resources and support necessary for you to excel and reach your full career potential."
    ],
    growth: [
        "Professional development is a cornerstone of a fulfilling career, and this organization is deeply committed to the long-term growth of its members. We provide a structured yet flexible path for advancement, ensuring that every individual has the opportunity to expand their horizons. Through a combination of internal mentorship and access to specialized training resources, we empower our employees to stay at the cutting edge of industry trends. The career trajectory here is designed to reward merit and proactive leadership, offering a clear roadmap for those who aspire to senior roles. We believe that when our people grow, the organization grows as well, making personal development a mutual priority.",
        "The journey toward professional mastery is paved with continuous learning and the courage to take on new challenges. Within our framework, career advancement is seen as a natural progression of consistent excellence and a dedication to self-improvement. We offer numerous avenues for skill enhancement, ranging from collaborative workshops to independent study support. Our performance feedback mechanisms are designed to be constructive and forward-looking, helping individuals identify areas for improvement and celebrate their successes. This is an environment where curiosity is encouraged and the pursuit of knowledge is viewed as a vital component of professional identity.",
        "Success in the modern workplace is often defined by one's ability to evolve alongside the industry. Our organization fosters a culture of lifelong learning, providing the infrastructure needed for individuals to pivot and adapt as the market shifts. From internal project leads to specialized technical tracks, the opportunities for progression are diverse and tailored to individual strengths. We prioritize internal mobility, preferring to cultivate and promote talent from within our own ranks. This commitment to our workforce ensures a high degree of stability and a shared sense of purpose, making every contribution a building block for future leadership."
    ],
    insights: [
        "Staying competitive in today's workforce requires more than just technical skill; it necessitates an understanding of broader market dynamics and the ability to anticipate future needs. Professionals who succeed are those who maintain a proactive stance toward industry news and technological breakthroughs. Networking and cross-functional collaboration remain essential components of a successful career strategy, as they provide diverse perspectives that are essential for high-level problem solving. Furthermore, the integration of soft skills—such as emotional intelligence and effective communication—is increasingly becoming the differentiator for top-tier talent in every sector. Understanding the intersection of technology and human intuition is becoming a cornerstone of modern professional success.",
        "The rise of digital transformation has fundamentally altered the way we approach work, emphasizing the importance of agility and technological fluency. To thrive in this environment, individuals must be comfortable working with a variety of digital tools and platforms while maintaining a focus on core professional principles. Resilience and the ability to manage change are now considered critical competencies for any high-growth role. As organizations become more data-driven, the capacity to interpret complex information and translate it into actionable strategies is a skill that continues to see incredible demand across all major industries. Navigating these changes requires a commitment to lifelong learning and a flexible mindset.",
        "Industry experts agree that the future of work will be characterized by a hybrid approach to problem solving, blending human creativity with automated efficiency. This shift requires professionals to redefine their roles and focus on areas where human intuition and ethical judgment are irreplaceable. Continuous professional education is no longer optional but a fundamental requirement for those who wish to remain relevant. Building a personal brand centered on reliability, expertise, and a commitment to quality is the most effective way to ensure long-term career security in an increasingly competitive global marketplace. Mastering the nuances of professional collaboration is key to long-term stability."
    ],
    tips: [
        "To maximize your success in the interview process for this role, we recommend focusing on your ability to articulate complex technical concepts to non-technical stakeholders. Prepare specific examples from your past projects where you demonstrated leadership or innovative thinking. Researching the organization's recent market performance and strategic goals will also provide you with a significant advantage during discussions. Remember that soft skills and cultural alignment are often weighed as heavily as technical credentials in high-impact professional environments. Consistency and preparation are your strongest tools for landing a premier position.",
        "When preparing for a role of this caliber, it is essential to emphasize your commitment to quality and efficient process management. Highlighting your experience with collaborative tools and your approach to cross-team synergy will resonate well with hiring managers. We also suggest reviewing common industry-standard problem-solving frameworks to demonstrate your methodical approach to challenges. A successful candidate is often one who can show a balance between independent initiative and the ability to follow established organizational protocols. Your professional narrative should reflect a trajectory of steady growth and increased responsibility."
    ]
};

const phraseScrambler = (points) => {
    const starters = [
        "Individuals in this role will be expected to",
        "The primary focus involves the ability to",
        "Successful candidates will demonstrate a capacity to",
        "Key duties include the requirement to",
        "A fundamental aspect of the position is to",
        "The team relies on the professional's ability to",
        "Core expectations center around the need to"
    ];
    return points.map((p, i) => {
        const cleanPoint = p.replace(/^[•\-\*\d\.\s]+/, '').trim();
        const starter = starters[i % starters.length];
        return `<li><strong>${starter}:</strong> ${cleanPoint}</li>`;
    }).join("");
};

const rewriteJobDescription = async (originalDescription, jobTitle, company) => {
    try {
        console.log(`Generating SEO Optimized Content: ${jobTitle} at ${company}`);

        const findBullets = (text) => {
            let matches = text.match(/<li>(.*?)<\/li>/gi) || text.match(/[•\-\*]\s*(.*?)(?=\n|<br|$)/gi) || [];
            if (matches.length === 0 && text.length > 30) {
                matches = text.split(/[.!?\n]\s*/).filter(s => s.trim().length > 15).slice(0, 15);
            }
            return matches.map(m => m.replace(/<\/?[^>]+(>|$)/g, "").replace(/^[•\-\*\s]+/, "").trim()).filter(m => m.length > 3);
        };

        const allBullets = findBullets(originalDescription);
        const responsibilities = allBullets.slice(0, 8);
        const qualifications = allBullets.slice(8, 15);

        // Mix in more variety and SEO-focused phrases
        const introVariations = [
            `Are you ready to elevate your career as a ${jobTitle} at ${company}? This role is perfect for a self-motivated professional looking to make a real impact.`,
            `Join ${company} as their newest ${jobTitle}! We are seeking a dedicated expert who thrives in a collaborative, fast-paced environment.`,
            `${company} is actively searching for a talented ${jobTitle} to join our growing team. This is a unique opportunity to lead innovation and drive excellence.`
        ];

        const randomIntro = introVariations[Math.floor(Math.random() * introVariations.length)];
        const randomAbout = templates.about[Math.floor(Math.random() * templates.about.length)];
        const randomGrowth = templates.growth[Math.floor(Math.random() * templates.growth.length)];
        const randomInsights = templates.insights[Math.floor(Math.random() * templates.insights.length)];
        const randomTips = templates.tips[Math.floor(Math.random() * templates.tips.length)];

        const section1 = `<h3>Career Opportunity: ${jobTitle} at ${company}</h3><p>${randomIntro}</p><p>${randomAbout}</p>`;

        const respList = responsibilities.length >= 3 ? phraseScrambler(responsibilities) :
            phraseScrambler(["Lead key projects and deliver exceptional results.", "Collaborate with high-performance teams to achieve business goals.", "Optimize internal processes for maximum efficiency.", "Maintain professional standards and documentation rigor."]);
        const section2 = `<h3>Key Responsibilities & Duties</h3><ul>${respList}</ul>`;

        const qualList = qualifications.length >= 3 ? phraseScrambler(qualifications) :
            phraseScrambler(["Strong professional background in a related field.", "Exceptional problem-solving and analytical abilities.", "Proven track record of success in similar roles.", "Excellent interpersonal and communication skills."]);
        const section3 = `<h3>Requirements & Professional Qualifications</h3><ul>${qualList}</ul>`;

        const section4 = `<h3>Professional Growth & Workplace Environment</h3><p>${randomGrowth}</p>`;
        const section5 = `<h3>Industry Trends & Success Strategy</h3><p>${randomInsights}</p>`;
        const section6 = `<h3>Job Search Success & Interview Preparation</h3><p>${randomTips}</p>`;

        return `
            <div class="seo-job-description">
                ${section1}
                ${section2}
                ${section3}
                ${section4}
                ${section5}
                ${section6}
            </div>
        `;

    } catch (error) {
        console.error("SEO Content Generation Failed:", error);
        return originalDescription;
    }
};

// ... existing transformDescription ...

const scrapeAndPostJobs = async (db, targetUrl, limit = 0) => {
    // ... setup code unchanged ...
    const jobCollections = db.collection("demoJobs");
    const subscriptionsCollection = db.collection("EmailSubscriptions");
    let browser = null;
    let browserRetries = 3;

    while (browserRetries > 0) {
        try {
            console.log(`\n🚀 Launching Browser (Attempt ${4 - browserRetries})...`);
            // ... existing launch ...
            browser = await puppeteer.launch({
                headless: true,
                ignoreHTTPSErrors: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-accelerated-2d-canvas",
                    "--disable-gpu",
                    "--window-size=1920,1080",
                    "--disable-web-security",
                    "--disable-features=IsolateOrigins,site-per-process",
                ],
                executablePath:
                    process.env.NODE_ENV === "production"
                        ? process.env.PUPPETEER_EXECUTABLE_PATH
                        : puppeteer.executablePath(),
            });

            const page = await browser.newPage();

            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            const userAgents = [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            ];
            await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);

            await page.setViewport({ width: 1366, height: 768 });
            await page.setDefaultNavigationTimeout(60000);

            console.log(`Scraping URL: ${targetUrl}`);
            await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
            await new Promise(r => setTimeout(r, 5000));

            let title = await page.title();
            console.log(`Page Title: ${title}`);

            if (title.includes("Just a moment") || title.includes("Security Challenge")) {
                console.log("Detected Cloudflare check. Waiting 45s for verification to complete...");
                await new Promise(r => setTimeout(r, 45000));
                title = await page.title();
                console.log(`Page Title after wait: ${title}`);
            }

            const bodyText = await page.evaluate(() => document.body.innerText).catch(() => "");
            if (bodyText.includes("Pardon Our Interruption") || title.includes("Human Verification") || title.includes("Just a moment")) {
                console.log("Still blocked. Attempting one reload...");
                await page.reload({ waitUntil: "domcontentloaded" });
                await new Promise(r => setTimeout(r, 10000));
                title = await page.title();
                if (title.includes("Just a moment")) {
                    throw new Error("Blocked by Glassdoor (Persistent)");
                }
            }

            try {
                await page.evaluate(async () => {
                    for (let i = 0; i < 8; i++) {
                        window.scrollBy(0, 800);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                });
            } catch (e) { console.warn("Scroll error (ignoring):", e.message); }

            const rawJobs = await page.evaluate(() => {
                const selectors = [
                    "li[data-test='jobListing']",
                    ".react-job-listing",
                    "li[class*='react-job-listing']",
                    "li[class*='job']",
                    "li[class*='JobsList']"
                ];
                let jobElements = document.querySelectorAll(selectors.join(", "));
                return Array.from(jobElements).map((job) => {
                    const linkElement = job.querySelector("a[class*='title'], a[data-test='job-link'], a");
                    let companyNameRaw = job.querySelector("div[class*='employer'], span[class*='employer'], div[class*='company'], span[class*='company']")?.innerText || "Unknown";
                    const companyName = companyNameRaw.replace(/\s+\d+(\.\d+)?\s*$/, "").trim();
                    const logoElement = job.querySelector("img[class*='logo'], img[class*='avatar'], .employerLogo img");

                    return {
                        glassdoorLink: linkElement?.href || "",
                        companyName: companyName,
                        jobLocation: job.querySelector("div[class*='loc'], span[class*='loc'], [data-test='emp-location']")?.innerText || "Remote",
                        jobTitle: linkElement?.innerText || "Untitled Job",
                        listingLogo: logoElement?.src || null
                    };
                }).filter(j => j.glassdoorLink && j.jobTitle !== "Untitled Job");
            });

            if (!rawJobs || rawJobs.length === 0) throw new Error("No jobs found");

            let jobsToProcess = limit > 0 ? rawJobs.slice(0, limit) : rawJobs;
            console.log(`✅ Discovered ${rawJobs.length} potential jobs. Processing ${jobsToProcess.length}...`);
            const validatedJobs = [];

            let count = 0;
            for (const job of jobsToProcess) {
                count++;
                console.log(`[${count}/${jobsToProcess.length}] Processing: ${job.jobTitle} @ ${job.companyName}`);
                // Skip the database check to ensure we return all discovered jobs in the JSON
                /*
                const existingJob = await jobCollections.findOne({
                    $or: [{ glassdoorLink: job.glassdoorLink }, { jobTitle: job.jobTitle, companyName: job.companyName }]
                });
                if (existingJob) {
                    console.log(`Skipping existing: ${job.jobTitle}`);
                    continue;
                }
                */

                let finalJob = {
                    jobTitle: job.jobTitle,
                    companyName: job.companyName,
                    minPrice: " ",
                    maxPrice: "Competitive Salary",
                    salaryType: "Yearly",
                    jobLocation: job.jobLocation,
                    postingDate: new Date().toISOString().split('T')[0],
                    experienceLevel: "Mid-Level",
                    employmentType: "Full-time",
                    companyLogo: "https://jobnirvana.netlify.app/images/logo.png",
                    description: "Loading description...",
                    postedBy: "jobhunt2580@gmail.com",
                    ApplyLink: job.glassdoorLink,
                    skills: ["Software Development"]
                };

                try {
                    const detailPage = await browser.newPage();
                    await detailPage.setRequestInterception(true);
                    detailPage.on('request', (req) => {
                        if (['stylesheet', 'font', 'media', 'image'].includes(req.resourceType())) req.abort();
                        else req.continue();
                    });

                    await detailPage.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
                    await detailPage.goto(job.glassdoorLink, { waitUntil: "domcontentloaded", timeout: 45000 });
                    await new Promise(r => setTimeout(r, 2000));

                    const details = await detailPage.evaluate(() => {
                        const descriptionNode = document.querySelector("div[class*='jobDescription'], div[class*='desc'], .jobDescriptionContent");
                        if (!descriptionNode) return { description: "Description not found. See application link.", employmentType: "Full-time", experienceLevel: "Mid-Level", salaryRange: null, companyLogo: null };

                        // Capture the innerText for a clean text representation
                        const rawDescription = descriptionNode.innerText.trim();

                        return {
                            description: rawDescription,
                            employmentType: document.querySelector("div[class*='employment'], span[class*='type']")?.innerText || "Full-time",
                            experienceLevel: document.querySelector("div[class*='experience'], span[class*='level']")?.innerText || "Mid-Level",
                            salaryRange: document.querySelector("div[class*='salary'], span[class*='salary']")?.innerText || null,
                            companyLogo: document.querySelector("img[class*='logo'], img[class*='avatar']")?.src || null
                        };
                    });

                    // Advanced Apply Link Extraction: Track Redirection (Node.js Context)
                    let directApplyUrl = null;
                    try {
                        const jlIdMatch = job.glassdoorLink.match(/jl=(\d+)/);
                        if (jlIdMatch) {
                            const jlId = jlIdMatch[1];
                            const partnerUrl = `https://www.glassdoor.co.in/partner/jobListing.htm?jobListingId=${jlId}`;
                            console.log(`Resolving direct link via partner URL for: ${job.jobTitle}`);

                            const resolverPage = await browser.newPage();
                            // Use a mobile user agent which often triggers more direct redirects
                            await resolverPage.setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1");

                            await resolverPage.setRequestInterception(true);
                            resolverPage.on('request', req => {
                                const url = req.url();
                                const isDoc = req.resourceType() === 'document' || req.resourceType() === 'navigation';

                                if (isDoc && !url.includes('glassdoor.co') && !url.includes('facebook') && !url.includes('linkedin') && !url.includes('twitter') && !url.includes('google')) {
                                    directApplyUrl = url;
                                }
                                req.continue();
                            });

                            try {
                                console.log(`Navigating to partner link with mobile UA...`);
                                await resolverPage.goto(partnerUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
                                // Wait for the redirect to finish
                                let wait = 8;
                                while (wait > 0 && !directApplyUrl) {
                                    await new Promise(r => setTimeout(r, 1000));
                                    const curr = resolverPage.url();
                                    if (!curr.includes('glassdoor.co')) {
                                        directApplyUrl = curr;
                                        break;
                                    }
                                    wait--;
                                }
                            } catch (e) {
                                console.log(`Partner redirect resolution timed out but may have captured URL: ${e.message}`);
                            }
                            await resolverPage.close();
                        }
                    } catch (e) {
                        console.warn(`Could not resolve partner apply link: ${e.message}`);
                    }

                    await detailPage.close();

                    // Assign the direct link if found and external
                    if (directApplyUrl && !directApplyUrl.includes('glassdoor.co')) {
                        finalJob.ApplyLink = directApplyUrl;
                        console.log(`Captured Direct Link: ${finalJob.ApplyLink}`);
                    }

                    // Apply SEO Rewriting
                    finalJob.description = await rewriteJobDescription(details.description, job.jobTitle, job.companyName);
                    finalJob.companyLogo = details.companyLogo || job.listingLogo || "https://jobnirvana.netlify.app/images/logo.png";
                    finalJob.employmentType = details.employmentType;
                    finalJob.experienceLevel = details.experienceLevel;

                    if (details.salaryRange) {
                        const salaryMatch = details.salaryRange.match(/\$?(\d+[kT]?)\s*[–-]\s*\$?(\d+[kT]?)/i);
                        if (salaryMatch) {
                            finalJob.minPrice = salaryMatch[1].replace("T", "k");
                            finalJob.maxPrice = salaryMatch[2].replace("T", "k");
                        }
                    }

                } catch (detailErr) {
                    console.error(`Detail scrape failed for ${job.jobTitle}: ${detailErr.message}`);
                    finalJob.description = "See application link for details.";
                }

                validatedJobs.push(finalJob);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

            if (validatedJobs.length > 0) {
                // await jobCollections.insertMany(validatedJobs);
                console.log(`Successfully scraped ${validatedJobs.length} jobs.`);

                const subscribers = await subscriptionsCollection.find({}).toArray();
                const subscriberEmails = subscribers.map(s => s.email);
                if (subscriberEmails.length > 0) {
                    const sampleJob = validatedJobs[0];
                    let mailOptions = {
                        from: process.env.EMAIL_USERNAME,
                        to: subscriberEmails.join(", "),
                        subject: `New Job Alert: ${sampleJob.jobTitle}`,
                        html: `<h3>New Opportunities Discovered</h3>
                               <p><strong>${sampleJob.jobTitle}</strong> at <strong>${sampleJob.companyName}</strong></p>
                               <p>We've just listed new high-quality job opportunities matched to your preferences.</p>
                               <a href="https://jobnirvana.netlify.app/job/${sampleJob.slug}" style="padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">View Job Details</a>`
                    };
                    try {
                        await transporter.sendMail(mailOptions);
                        console.log(`Email alerts sent to ${subscriberEmails.length} subscribers.`);
                    } catch (e) { console.error("Failed to send email alerts:", e.message); }
                }
            }

            await browser.close();
            return validatedJobs;

        } catch (error) {
            console.error(`Browser Session Failed (Attempt ${4 - browserRetries}):`, error.message);
            if (browser) try { await browser.close(); } catch (e) { }
        }
        browserRetries--;
        await new Promise(r => setTimeout(r, 5000));
    }
    return [];
};

module.exports = { scrapeAndPostJobs };
