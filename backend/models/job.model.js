const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    minPrice: { type: String },
    maxPrice: { type: String },
    salaryType: { type: String },
    jobLocation: { type: String },
    postingDate: { type: String },
    experienceLevel: { type: String },
    employmentType: { type: String },
    companyLogo: { type: String },
    description: { type: String },
    postedBy: { type: String, default: 'admin@yourdomain.com' },
    ApplyLink: { type: String },
    skills: [String]
}, {
    timestamps: true
});

// Compound index for duplicate filtering
jobSchema.index({ jobTitle: 1, companyName: 1, jobLocation: 1 }, { unique: true });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
