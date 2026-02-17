const express = require('express');
const router = express.Router();
const { getJobs, triggerScrape } = require('../controllers/jobs.controller');

router.get('/', getJobs);
router.post('/scrape', triggerScrape);

module.exports = router;
