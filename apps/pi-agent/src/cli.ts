import { runOpportunityAgent } from "./agents/agent.js";
import type { UserProfile } from "./profile.js";

async function main() {
  const profile: UserProfile = {
    skills: ["typescript", "react", "nodejs"],
    interests: ["open source", "developer tools"],
    targetRoles: ["developer advocate", "developer relations"],
  };

  const result = await runOpportunityAgent(profile, "Looking for opportunities in open source and developer tools");

  for (const item of result.ranked) {
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