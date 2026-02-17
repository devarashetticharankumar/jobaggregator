const { SCRAPE_TARGETS } = require("../config/targets");

const setupJobScraper = (db) => {
    console.log("Initializing Job Scraper Schedule...");

    const now = new Date();
    console.log(`Job Scraper Initialized. Server Time: ${now.toString()}`);

    const startContinuousScraping = async () => {
        let currentIndex = 0;

        while (true) {
            try {
                const target = SCRAPE_TARGETS[currentIndex];
                console.log(`\n--- Starting Scrape Cycle for: ${target.name} ---`);
                console.log(`Target URL: ${target.url}`);

                await scrapeAndPostJobs(db, target.url);

                console.log(`--- Finished Scrape Cycle for ${target.name} ---`);
                console.log("Waiting 30 seconds before next cycle...\n");

                currentIndex = (currentIndex + 1) % SCRAPE_TARGETS.length;
                await new Promise(resolve => setTimeout(resolve, 30000));

            } catch (error) {
                console.error("Continuous Scraper Error:", error);
                console.log("Error occurred. Waiting 1 minute before retrying...");
                await new Promise(resolve => setTimeout(resolve, 60000));
            }
        }
    };

    startContinuousScraping();
};

module.exports = setupJobScraper;
