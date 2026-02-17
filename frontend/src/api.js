import axios from 'axios';

// Use the provided URL or fallback to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Ensure no trailing slash and append /api/jobs if it's missing (to handle users providing just the base domain)
const API_BASE = BASE_URL.trim().replace(/\/$/, "");
const JOBS_ENDPOINT = API_BASE.includes('/api') ? API_BASE : `${API_BASE}/api/jobs`;

console.log('API Base Configured:', JOBS_ENDPOINT);

export const fetchJobs = async () => {
    try {
        console.log('Fetching jobs from:', JOBS_ENDPOINT);
        const response = await axios.get(JOBS_ENDPOINT);
        return response.data;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
};

export const triggerManualScrape = async () => {
    try {
        const scrapeUrl = `${JOBS_ENDPOINT}/scrape`;
        console.log('Triggering manual scrape at:', scrapeUrl);
        const response = await axios.post(scrapeUrl, {}, {
            timeout: 900000 // 15 minutes
        });
        return response.data;
    } catch (error) {
        console.error('Error triggering scrape:', error);
        throw error;
    }
};
