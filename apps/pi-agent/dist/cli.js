import { normalizeJob } from "./normalize/jobs.js";
import { normalizeOss } from "./normalize/oss.js";
import { rank } from "./ranking/rank.js";
const rawOssHits = [
    {
        repoName: "tanstack/query",
        repoUrl: "https://github.com/TanStack/query",
        repoOwner: "TanStack",
        issueTitle: "Improve docs for query invalidation",
        issueBody: "Looking for help improving beginner-facing docs.",
        labels: ["documentation", "good first issue"],
        stars: 18000,
        updatedAt: "2026-07-10T10:00:00Z",
        topics: ["typescript", "react", "data-fetching"],
    },
];
const rawJobHits = [
    {
        orgName: "Example DevTools",
        postingUrl: "https://github.com/example/jobs/issues/12",
        roleTitle: "Developer Relations Engineer",
        summary: "Looking for a TypeScript-heavy developer educator.",
        skills: ["typescript", "github", "developer tools"],
        updatedAt: "2026-07-09T08:00:00Z",
        source: "official_org",
    },
];
const profile = {
    skills: ["typescript", "react", "nodejs"],
    interests: ["open source", "developer tools"],
    targetRoles: ["developer advocate", "developer relations"],
};
const opportunities = [
    ...rawOssHits.map((hit) => normalizeOss(hit, profile)),
    ...rawJobHits.map((hit) => normalizeJob(hit, profile)),
];
const ranked = rank(opportunities);
for (const item of ranked) {
    console.log(`${item.kind.toUpperCase()}: ${item.title}`);
    console.log(`  org: ${item.organization}`);
    console.log(`  score: ${item.totalScore.toFixed(2)}`);
    console.log(`  reasons: ${item.reasons.join(", ") || "none yet"}`);
    console.log(`  url: ${item.url}`);
    console.log("");
}
