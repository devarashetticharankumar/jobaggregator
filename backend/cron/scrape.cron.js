const cron = require('node-cron');
const axios = require('axios');
const logger = require('../utils/logger');

// Run every 6 hours
const setupCron = () => {
    cron.schedule('0 */6 * * *', async () => {
        logger.info('Automated cron scrape started');
        try {
            // Internal request to the scrape endpoint
            // Using localhost as it runs on the same server
            const port = process.env.PORT || 5000;
            await axios.post(`http://localhost:${port}/api/scrape`);
            logger.info('Automated cron scrape completed successfully');
        } catch (error) {
            logger.error(`Automated cron scrape failed: ${error.message}`);
        }
    });

    logger.info('Cron job scheduled: every 6 hours');
};

module.exports = setupCron;
