const Job = require('../models/job.model');
const { scrapeJobs } = require('../services/scraper.service');
const { transformJobData } = require('../services/transform.service');
const logger = require('../utils/logger');

const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 }).lean();

        // Clean up internal Mongoose fields for the frontend JSON view
        const cleanJobs = jobs.map(job => {
            const { _id, __v, createdAt, updatedAt, ...rest } = job;
            return rest;
        });

        res.status(200).json(cleanJobs);
    } catch (error) {
        logger.error(`Error fetching jobs: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
};

const ScraperState = require('../models/scraperState.model');
const SeenJob = require('../models/seenJob.model');
const crypto = require('crypto');

const triggerScrape = async (req, res) => {
    try {
        const urls = process.env.SOURCE_URLS ? process.env.SOURCE_URLS.split('|') : [];
        if (urls.length === 0) {
            return res.status(400).json({ message: 'No source URLs configured' });
        }

        // Get or initialize scraper state for sequential URL rotation
        let state = await ScraperState.findOne({});
        if (!state) {
            state = new ScraperState({ currentIndex: 0, totalUrls: urls.length });
            await state.save();
        }

        // Pick current URL and update state for next time
        const currentUrlIndex = state.currentIndex % urls.length;
        const urlToScrape = urls[currentUrlIndex];

        // Update index for next trigger
        state.currentIndex = (currentUrlIndex + 1) % urls.length;
        await state.save();

        logger.info(`Manual scrape triggered for URL index ${currentUrlIndex}: ${urlToScrape}`);

        // Scrape only the ONE current URL
        const rawJobs = await scrapeJobs([urlToScrape]);
        const structuredJobs = transformJobData(rawJobs);

        // Filter out jobs seen in PREVIOUS sessions to ensure "EVERY TIME NEW JOBS"
        const filteredNewJobs = [];
        for (const job of structuredJobs) {
            // Create a unique hash for the job
            const hash = crypto.createHash('md5')
                .update(`${job.jobTitle.trim().toLowerCase()}-${job.companyName.trim().toLowerCase()}-${job.jobLocation.trim().toLowerCase()}`)
                .digest('hex');

            const alreadySeen = await SeenJob.findOne({ jobHash: hash });
            if (!alreadySeen) {
                filteredNewJobs.push({ ...job, hash });
            }
        }

        logger.info(`Found ${structuredJobs.length} total, but only ${filteredNewJobs.length} are new since previous scrapes.`);

        // FRESH START: Clear old jobs (as requested)
        await Job.deleteMany({});
        logger.info('Existing jobs cleared for fresh scrape results');

        let addedCount = 0;
        for (const job of filteredNewJobs) {
            try {
                // Save to active display collection
                await Job.findOneAndUpdate(
                    {
                        jobTitle: job.jobTitle.trim(),
                        companyName: job.companyName.trim(),
                        jobLocation: job.jobLocation.trim()
                    },
                    job,
                    { upsert: true, new: true }
                );

                // Mark as seen permanently
                await SeenJob.findOneAndUpdate(
                    { jobHash: job.hash },
                    { jobHash: job.hash },
                    { upsert: true }
                );

                addedCount++;
            } catch (err) {
                continue;
            }
        }

        res.status(200).json({
            message: filteredNewJobs.length > 0
                ? `Scraping complete! Found ${filteredNewJobs.length} new jobs.`
                : "No new jobs found for this URL at this time.",
            jobsAdded: addedCount,
            jobs: filteredNewJobs,
            nextUrlIndex: state.currentIndex
        });
    } catch (error) {
        logger.error(`Error during scraping: ${error.message}`);
        res.status(500).json({ message: 'Scraping failed', error: error.message });
    }
};

module.exports = { getJobs, triggerScrape };
