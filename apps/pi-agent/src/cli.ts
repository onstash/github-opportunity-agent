import { normalizeJob } from "./normalize/jobs.js";
import { normalizeOss } from "./normalize/oss.js";
import type { UserProfile } from "./profile.js";
import { rank } from "./ranking/rank.js";
import { tools } from "./tools.js";

async function main() {
  const profile: UserProfile = {
    skills: ["typescript", "react", "nodejs"],
    interests: ["open source", "developer tools"],
    targetRoles: ["developer advocate", "developer relations"],
  };

  const [rawJobHits, rawOssHits] = await Promise.all([
    tools.search_jobs(),
    tools.search_oss(),
  ]);

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
}

main().catch((err) => {
  console.error("Error:", err);
});