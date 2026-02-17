const express = require("express");
const router = express.Router();
const { scrapeAndPostJobs } = require("../services/jobScraperService");
const { SCRAPE_TARGETS } = require("../config/targets");

// Manual scraping route
router.get("/scrape-jobs", async (req, res) => {
    try {
        const db = req.app.locals.db;

        // Initialize or increment rotation index
        if (req.app.locals.scrapeIndex === undefined) {
            req.app.locals.scrapeIndex = 0;
        } else {
            req.app.locals.scrapeIndex = (req.app.locals.scrapeIndex + 1) % SCRAPE_TARGETS.length;
        }

        const target = SCRAPE_TARGETS[req.app.locals.scrapeIndex];
        console.log(`Manual scraping triggered for: ${target.name} (${target.url})`);

        const allRecentJobs = await scrapeAndPostJobs(db, target.url, 10);
        res.json(allRecentJobs);
    } catch (error) {
        console.error("Manual scraping error:", error);
        res.status(500).send({ message: "Scraping failed", error: error.message });
    }
});

// Get all scraped jobs
router.get("/", async (req, res) => {
    try {
        const db = req.app.locals.db;
        const jobs = await db.collection("demoJobs").find({}).sort({ createdAt: -1 }).toArray();
        res.json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send({ message: "Failed to fetch jobs", error: error.message });
    }
});

module.exports = router;
