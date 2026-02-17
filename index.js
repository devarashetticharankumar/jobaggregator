require("dotenv").config();
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const setupJobScraper = require("./cron/jobScraper");
const scraperRoutes = require("./routes/jobRoutes");

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI;
if (!uri) {
    console.error("CRITICAL: MONGO_URI is not defined in .env");
    process.exit(1);
}

const client = new MongoClient(uri);

async function startServer() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db("job-portal-db");
        app.locals.db = db;

        // Initialize Scraper Cron
        setupJobScraper(db);

        // Routes
        app.use("/jobs", scraperRoutes);

        app.listen(port, () => {
            console.log(`Scraper Server running on http://localhost:${port}`);
        });

    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

startServer();
