const logger = require('../utils/logger');

/**
 * Helper to get a random variation from an array
 */
const getRandomVariation = (variations) => {
    return variations[Math.floor(Math.random() * variations.length)];
};

/**
 * Service to expand job descriptions into SEO-optimized, unique content.
 * 100% Paraphrased for AdSense Safety.
 */
const expandDescription = (job) => {
    const { jobTitle, companyName, jobLocation, description } = job;

    // Clean description to remove source-specific footprints
    const cleanRaw = (description || "")
        .replace(/glassdoor/gi, 'our portal')
        .replace(/apply now/gi, 'join the team')
        .replace(/click here/gi, 'proceed')
        .substring(0, 2000); // Limit context size

    // VARIATIONS TO REDUCE PLAGIARISM

    const introVariations = [
        `Are you looking to elevate your career in the world of technology? ${companyName} is currently seeking a passionate and driven ${jobTitle} to join their team in ${jobLocation}. This role offers a unique opportunity to work with cutting-edge technologies and contribute to projects that make a real-world impact.`,
        `Discover a new professional milestone at ${companyName}, where we are hiring a dedicated ${jobTitle} for our ${jobLocation} office. This position is perfect for those who want to innovate and grow within a industry-leading organization while tackling complex challenges.`,
        `Join ${companyName} in ${jobLocation} as our next ${jobTitle}. We are looking for talented individuals who thrive in fast-paced environments and are eager to contribute to the next generation of technological solutions. Your expertise will be key to our continued success.`
    ];

    const marketContextVariations = [
        `In today's competitive job market, finding a role that matches your skills and offers growth is essential. This ${jobTitle} position is designed for individuals who are not just looking for a job, but a career milestone.`,
        `The professional landscape is evolving, and ${companyName} is at the forefront of this change. We offer more than just a vacancy; we provide a platform for you to excel and define the future of ${jobTitle} roles.`,
        `Stepping into this role at ${companyName} means joining a community of innovators. We prioritize professional development and ensure that every ${jobTitle} has the tools they need to succeed in ${jobLocation}.`
    ];

    const roleImpactVariations = [
        `The role of a ${jobTitle} at ${companyName} is pivotal to the organization's success. You will be responsible for a wide range of tasks that require both technical proficiency and strategic thinking. From day-to-day operations to long-term project planning, your contributions will be felt across the entire department.`,
        `As a ${jobTitle}, your influence will extend across our technical stack and business operations. ${companyName} relies on this role to bridge the gap between innovation and execution, ensuring that our ${jobLocation} operations remain world-class.`,
        `Your mission as a ${jobTitle} at ${companyName} will be to drive excellence. Whether you are optimizing existing systems or building new ones, your work will directly impact our billions of users and the broader tech community in ${jobLocation}.`
    ];

    const cultureVariations = [
        `Specifically, your work will involve collaborating with cross-functional teams to solve complex problems. As a ${jobTitle}, you are expected to bring innovative solutions to the table, helping to streamline processes and improve overall efficiency. The ${jobLocation} office is known for its collaborative culture.`,
        `Collaboration is at the heart of what we do at ${companyName}. You will work alongside some of the brightest minds in the industry, sharing insights and learning new perspectives every day. Our ${jobLocation} team is diverse, inclusive, and ready to welcome you.`,
        `We believe that the best ideas come from diverse teams. As a ${jobTitle} in our ${jobLocation} office, you will have the freedom to experiment and the support to succeed. Join a culture that celebrates creativity and rewards hard work.`
    ];

    // NEW SECTION: PARAPHRASED SUMMARY (REPLACES RAW TEXT)
    const summaryVariations = [
        `The ${jobTitle} at ${companyName} focuses on delivering high-quality results within the ${jobLocation} tech ecosystem. Key priorities include maintaining system integrity, driving collaborative design initiatives, and ensuring that all technical outputs align with global best practices. Candidates are expected to bring a proactive mindset to troubleshooting and a keen eye for detail in every phase of the project lifecycle.`,
        `In this capacity at ${companyName}, you will lead critical initiatives that shape the technological landscape in ${jobLocation}. The role emphasizes strategic implementation, team-wide synergy, and the continuous optimization of existing frameworks. Your background in ${jobTitle} will be essential for navigating the complex requirements of this high-impact position.`,
        `Success as a ${jobTitle} in ${jobLocation} involves more than just technical skill; it requires leadership and vision. At ${companyName}, you will be tasked with overseeing essential development streams, collaborating with diverse stakeholders, and fostering an environment of technical excellence. This is a rare opportunity to define how ${companyName} interacts with the global market.`
    ];

    const futureVariations = [
        `The tech landscape in ${jobLocation} is rapidly changing, and the demand for skilled ${jobTitle} professionals is at an all-high. Companies like ${companyName} are leading the charge by investing in talent that can adapt to new challenges. This role is not just about the present; it's about building the future.`,
        `The future of technology is being written today in ${jobLocation}. By joining ${companyName} as a ${jobTitle}, you are positioning yourself at the center of this transformation. We are committed to staying ahead of the curve and want you to lead the way.`,
        `In a world where technology defines everything, your role as a ${jobTitle} at ${companyName} is more important than ever. We are building the infrastructure for tomorrow, and your contributions in ${jobLocation} will be the foundation.`
    ];

    const footerVariations = [
        `If you are ready to take the next step in your professional journey, this ${jobTitle} position at ${companyName} is the perfect choice. With a competitive salary, excellent benefits, and a supportive team in ${jobLocation}, there has never been a better time to apply.`,
        `Don't miss out on this chance to work with a leader in the field. Apply today to become the newest ${jobTitle} at ${companyName} and start your journey in ${jobLocation}. We look forward to seeing the impact you will make.`,
        `Your path to success starts here. Join ${companyName} in ${jobLocation} and see where your talent can take you. This ${jobTitle} role is open now, and we are excited to meet our next team member.`
    ];

    // Build sections with bold headers and randomized content
    const introduction = `
<h2>Exciting Opportunity: ${jobTitle} at ${companyName} in ${jobLocation}</h2>
<p>${getRandomVariation(introVariations)}</p>
<p>${getRandomVariation(marketContextVariations)}</p>
    `;

    const deepDive = `
<h3><b>In-Depth Role Overview and Impact</b></h3>
<p>${getRandomVariation(roleImpactVariations)}</p>
<p>${getRandomVariation(cultureVariations)}</p>
    `;

    const professionalSummary = `
<h3><b>Professional Career Breakdown</b></h3>
<p>${getRandomVariation(summaryVariations)}</p>
<p>Working as a ${jobTitle} requires a deep commitment to quality and a strong alignment with ${companyName}'s core values. In the ${jobLocation} market, this role serves as a benchmark for professional excellence. We encourage applicants to highlight their unique strengths and how their personal career goals align with the strategic mission of ${companyName}.</p>
    `;

    const responsibilitiesSection = `
<h3><b>Key Responsibilities and Requirements</b></h3>
<p>While the specific duties may vary, the following are the core components of the ${jobTitle} role at ${companyName}:</p>
<ul>
    <li>Designing and implementing robust solutions that align with strategic goals in ${jobLocation}.</li>
    <li>Participating in code reviews and design sessions to ensure quality and scalability.</li>
    <li>Collaborating with stakeholders to gather requirements and translate them into technical specifications.</li>
    <li>Troubleshooting and resolving complex issues in a timely manner.</li>
    <li>Contributing to a culture of continuous learning and professional growth within ${companyName}.</li>
</ul>
<p>Candidates should possess a strong background in industry standards and an intuitive understanding of ${jobTitle} principles. The role at ${companyName} is highly sought after in ${jobLocation}, and successful individuals will demonstrate both technical mastery and exceptional communication skills.</p>
    `;

    const industryContext = `
<h3><b>The Future of ${jobTitle} Roles</b></h3>
<p>${getRandomVariation(futureVariations)}</p>
<p>Furthermore, ${companyName} is committed to being an equal opportunity employer, fostering a diverse and inclusive workplace. They believe that different perspectives lead to better solutions, and as a ${jobTitle}, you will be encouraged to share your unique insights. This commitment to diversity is one of the many reasons why ${companyName} is considered a top employer in the ${jobLocation} region.</p>
    `;

    const footer = `
<h3><b>Why You Should Apply Today</b></h3>
<p>${getRandomVariation(footerVariations)}</p>
    `;

    // Combine all sections (NO RAW SOURCE TEXT INCLUDED)
    const fullContent = `
        ${introduction}
        ${deepDive}
        ${professionalSummary}
        ${responsibilitiesSection}
        ${industryContext}
        ${footer}
    `.trim();

    // Ensure it's substantial (simple word count check)
    const wordCount = fullContent.split(/\s+/).length;
    logger.info(`Expanded and REWRITTEN description for ${jobTitle} to approx ${wordCount} words for AdSense safety.`);

    return fullContent;
};

module.exports = { expandDescription };
