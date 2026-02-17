import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/jobs';

export const fetchJobs = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        throw error;
    }
};

export const triggerManualScrape = async () => {
    try {
        // Updated to match the backend-folder implementation (POST)
        const response = await axios.post(`${API_URL}/scrape`, {}, {
            timeout: 900000 // 15 minutes
        });
        return response.data;
    } catch (error) {
        console.error('Error triggering scrape:', error);
        throw error;
    }
};
