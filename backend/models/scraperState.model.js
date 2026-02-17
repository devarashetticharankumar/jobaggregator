const mongoose = require('mongoose');

const scraperStateSchema = new mongoose.Schema({
    currentIndex: { type: Number, default: 0 },
    totalUrls: { type: Number, default: 11 }
}, {
    timestamps: true
});

const ScraperState = mongoose.model('ScraperState', scraperStateSchema);

module.exports = ScraperState;
