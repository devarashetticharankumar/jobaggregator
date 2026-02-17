const logger = require('../utils/logger');
const seoService = require('./seo.service');

const formatSEOTitle = (title, location, minSalary, maxSalary) => {
    let salaryInfo = "Competitive Salary";

    const formatNumber = (val) => {
        if (!val || val === " " || isNaN(val)) return null;
        return '$' + Number(val).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const formattedMax = formatNumber(maxSalary);
    const formattedMin = formatNumber(minSalary);

    if (formattedMax && maxSalary !== "Competitive Salary") {
        salaryInfo = formattedMax;
    } else if (formattedMin) {
        salaryInfo = formattedMin;
    }

    return `${title} Jobs in ${location || 'USA'} – Salary ${salaryInfo} – Apply Now`;
};

const transformJobData = (rawJobs) => {
    const today = new Date().toISOString().split('T')[0];
    const transformedJobs = [];
    const seenJobs = new Set();

    rawJobs.forEach(raw => {
        // Unique key for duplication filtering
        const uniqueKey = `${raw.jobTitle?.toLowerCase()}|${raw.companyName?.toLowerCase()}`;

        if (seenJobs.has(uniqueKey)) return;
        seenJobs.add(uniqueKey);

        // Simple skill extraction from description
        const commonSkills = ['REACT', 'NODE.JS', 'MONGODB', 'EXPRESS', 'PYTHON', 'JAVA', 'SQL', 'AWS', 'DOCKER', 'KUBERNETES', 'TAILWIND CSS', 'JAVASCRIPT', 'TYPESCRIPT', 'DEVOP'];
        const extractedSkills = [];
        if (raw.description) {
            commonSkills.forEach(skill => {
                if (raw.description.toUpperCase().includes(skill)) {
                    extractedSkills.push(skill);
                }
            });
        }

        // Parse salary if possible
        let minPrice = " ";
        let maxPrice = "Competitive Salary";
        if (raw.salary) {
            const isK = raw.salary.toUpperCase().includes('K');
            const matches = raw.salary.replace(/[$,K,k,₹]/g, '').match(/\d+/g);
            if (matches && matches.length >= 2) {
                minPrice = isK ? parseInt(matches[0]) * 1000 : matches[0];
                maxPrice = isK ? parseInt(matches[1]) * 1000 : matches[1];
            } else if (matches && matches.length === 1) {
                minPrice = isK ? parseInt(matches[0]) * 1000 : matches[0];
            }
        }

        // Apply SEO Expansion
        const expandedDescription = seoService.expandDescription({
            jobTitle: raw.jobTitle,
            companyName: raw.companyName,
            jobLocation: raw.jobLocation,
            description: raw.description
        });

        transformedJobs.push({
            jobTitle: formatSEOTitle(raw.jobTitle, raw.jobLocation, minPrice, maxPrice),
            companyName: raw.companyName,
            minPrice: minPrice,
            maxPrice: maxPrice,
            salaryType: "Yearly",
            jobLocation: raw.jobLocation,
            postingDate: today,
            experienceLevel: raw.description?.toLowerCase().includes('senior') ? 'Senior' :
                raw.description?.toLowerCase().includes('junior') ? 'Junior' : 'Mid-Level',
            employmentType: raw.description?.toLowerCase().includes('contract') ? 'Contract' : 'Full-time',
            companyLogo: raw.companyLogo || "https://i.imgur.com/0qGt7qj.png",
            description: expandedDescription, // Uses the 600+ word SEO content
            postedBy: "jobhunt2580@gmail.com",
            ApplyLink: raw.ApplyLink,
            skills: extractedSkills.length > 0 ? extractedSkills : ['Software Development']
        });
    });

    logger.info(`Transformed ${transformedJobs.length} unique jobs with SEO content.`);
    return transformedJobs;
};

module.exports = { transformJobData };
