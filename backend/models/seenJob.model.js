const mongoose = require('mongoose');

const seenJobSchema = new mongoose.Schema({
    jobHash: {
        type: String,
        required: true,
        unique: true // Title + Company + Location hash
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // Automatically delete after 7 days to keep DB clean
    }
});

module.exports = mongoose.model('SeenJob', seenJobSchema);
