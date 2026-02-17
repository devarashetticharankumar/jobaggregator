import React from 'react';

const JobList = ({ jobs }) => {
    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 text-lg">No jobs found. Try triggering a scrape.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
                <div key={job._id || index} className="job-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{job.jobTitle}</h3>
                            <p className="text-indigo-600 font-medium">{job.companyName}</p>
                        </div>
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {job.employmentType}
                        </span>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center text-gray-500 text-sm">
                            <span className="mr-2">📍</span> {job.jobLocation}
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                            <span className="mr-2">💰</span>
                            {job.minPrice && job.maxPrice
                                ? `${job.minPrice} - ${job.maxPrice}`
                                : job.minPrice || 'Competitive Salary'}
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                            <span className="mr-2">📅</span> {job.postingDate || new Date(job.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {job.skills && job.skills.map((skill, sIdx) => (
                            <span key={sIdx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                {typeof skill === 'object' ? skill.label : skill}
                            </span>
                        ))}
                    </div>

                    <a
                        href={job.ApplyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-black transition-colors"
                    >
                        View Details
                    </a>
                </div>
            ))}
        </div>
    );
};

export default JobList;
