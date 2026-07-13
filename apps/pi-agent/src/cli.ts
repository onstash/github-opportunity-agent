import { runOpportunityAgent } from "./agents/agent.js";
import type { UserProfile } from "./profile.js";

async function main() {
  const profile: UserProfile = {
    skills: ["typescript", "react", "nodejs"],
    interests: ["open source", "developer tools"],
    targetRoles: ["developer advocate", "developer relations"],
  };

  const userInput =
    process.argv.slice(2).join(" ").trim() || "typescript developer tools";
  const result = await runOpportunityAgent(profile, userInput);
  console.log(`query: ${result.userInput}`);
  console.log(`model: ${result.model.provider}/${result.model.name}`);
  console.log("");

  const totalOpportunities = result.ranked.length;
  if (!totalOpportunities) {
    console.log("No opportunities found.");
    console.log("");
    return;
  }

  console.log(`Found ${totalOpportunities} ${totalOpportunities === 1 ? "opportunity" : "opportunities"}:`);
  console.log("");

  for (const item of result.ranked) {
    console.log(`${item.kind.toUpperCase()}: ${item.title}`);
    console.log(`  org: ${item.organization}`);
    console.log(`  score: ${item.totalScore.toFixed(2)}`);
    console.log(
      `  components: query=${item.queryScore}, relevance=${item.relevanceScore}, recency=${item.recencyScore}, effort=${item.effortScore}, confidence=${item.confidenceScore}`,
    );
    console.log(`  reasons: ${item.reasons.join(", ") || "none yet"}`);
    console.log(`  url: ${item.url}`);
    console.log("");
  }
}

main().catch((err) => {
  console.error("Error:", err);
});
