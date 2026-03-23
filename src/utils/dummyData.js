function generateDummyResult(formData) {
  const name = formData.projectName || "the project";
  const stack = formData.techStack || "React, Node.js, PostgreSQL";
  const parts = stack.split(",").map((s) => s.trim());

  return {
    elevatorPitch: `${name} is a production-grade application I built to solve a real-world problem at scale. Using ${stack}, I architected a system that delivers a seamless user experience while maintaining high performance and reliability. The project demonstrates my ability to take an idea from concept to a fully deployed, user-facing product — handling everything from database schema design to UI/UX decisions.`,

    detailedExplanation: `${name} started as a solution to a gap I noticed in existing tools. I began with a thorough requirements analysis, breaking the problem into clearly defined modules.\n\nOn the frontend, I used ${parts[0] || "React"} to build a component-driven UI focused on responsiveness and accessibility. On the backend, I implemented RESTful APIs with authentication, input validation, and error handling.\n\nI set up a CI/CD pipeline to automate testing and deployments, and used environment-based config to manage staging vs production. The result is a scalable, maintainable codebase following industry best practices.`,

    techStackJustification: `Every technology in ${name} was chosen deliberately:\n\n• ${parts[0] || "React"}: Chosen for its component reusability and large ecosystem — it let me move fast while keeping the UI maintainable.\n\n• ${parts[1] || "Node.js"}: Enabled a unified JavaScript codebase, reducing context switching and improving velocity.\n\n• ${parts[2] || "PostgreSQL"}: Selected for its strong ACID guarantees and the relational nature of the data.\n\nI evaluated alternatives for each choice and made tradeoffs based on team expertise, community support, and long-term maintainability.`,

    challengesAndSolutions: `The most significant challenge I faced was: "${formData.challenge}".\n\nMy approach:\n1. I broke the problem down into smaller, testable hypotheses.\n2. I researched existing solutions and patterns used in industry.\n3. I implemented a prototype, measured its performance, and iterated.\n\nThe breakthrough came when I re-evaluated core assumptions before diving deep into implementation. This reduced complexity significantly and unblocked progress. It reinforced the value of stepping back before writing more code.`,

    interviewQA: [
      {
        q: `What was your biggest technical decision in ${name}?`,
        a: `Choosing the right data architecture was critical. I spent time upfront designing the schema and API contracts before writing any business logic. This prevented costly refactors later and kept the team aligned.`,
      },
      {
        q: "How did you ensure code quality and maintainability?",
        a: `I enforced consistent code style with ESLint and Prettier, wrote unit and integration tests for all critical paths, and used PR reviews as a learning opportunity. Every feature was developed in a feature branch and merged only after passing CI checks.`,
      },
      {
        q: "How would you scale this if user load 10x'd?",
        a: `I'd identify bottlenecks using APM tooling first. Likely candidates are database query performance and API throughput. I'd introduce read replicas, add Redis caching, and consider extracting high-load services into independently scalable microservices.`,
      },
      {
        q: "What would you do differently if you started over?",
        a: `I'd invest more in observability from day one — structured logging, distributed tracing, and alerting. I added these reactively after a production issue, and doing it proactively would have saved significant debugging time.`,
      },
    ],
  };
}
export { generateDummyResult };