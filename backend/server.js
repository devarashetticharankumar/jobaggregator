const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const jobRoutes = require('./routes/jobs.routes');
const setupCron = require('./cron/scrape.cron');
const logger = require('./utils/logger');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/jobs', jobRoutes);
// Alternate route for scrape trigger
app.use('/api', jobRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Job Aggregator API is running...');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    // Start automation
    setupCron();
});

// Set timeout to 15 minutes (900000ms) to accommodate large scrapes
server.timeout = 900000;
