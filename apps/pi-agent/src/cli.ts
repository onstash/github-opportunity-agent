import { runOpportunityAgent } from "./agents/agent.js";
import type { UserProfile } from "./profile.js";
import { buildRuntimeInput, executeRuntime, prepareRuntimeExecution, toLinearMessages } from "./runtime.js";

// async function main() {
//   const profile: UserProfile = {
//     skills: ["typescript", "react", "nodejs"],
//     interests: ["open source", "developer tools"],
//     targetRoles: ["developer advocate", "developer relations"],
//   };

//   const userInput =
//     process.argv.slice(2).join(" ").trim() || "typescript developer tools";
//   const _result =  await runOpportunityAgent(profile, userInput);
//   const result = prepareRuntimeExecution(_result.runtime);
//   console.log(`query: ${_result.userInput}`);
//   console.log(`model: ${result.runtime.model.provider}/${result.runtime.model.name}`);
//   for (const message of result.linearMessages) {
//     console.log(`  ${message.role}: ${message.content}`);
//   }
//   console.log("");

//   const totalOpportunities = _result.ranked.length;
//   if (!totalOpportunities) {
//     console.log("No opportunities found.");
//     console.log("");
//     return;
//   }

//   console.log(`Found ${totalOpportunities} ${totalOpportunities === 1 ? "opportunity" : "opportunities"}:`);
//   console.log("");

//   for (const item of _result.ranked) {
//     console.log(`${item.kind.toUpperCase()}: ${item.title}`);
//     console.log(`  org: ${item.organization}`);
//     console.log(`  score: ${item.totalScore.toFixed(2)}`);
//     console.log(
//       `  components: query=${item.queryScore}, relevance=${item.relevanceScore}, recency=${item.recencyScore}, effort=${item.effortScore}, confidence=${item.confidenceScore}`,
//     );
//     console.log(`  reasons: ${item.reasons.join(", ") || "none yet"}`);
//     console.log(`  url: ${item.url}`);
//     console.log("");
//   }
// }

async function main() {
  const userInput = process.argv.slice(2).join(" ").trim();
  const runtime = buildRuntimeInput(userInput);
  const execution = await executeRuntime(runtime);

  console.log("tools:", execution.toolNames);
  console.log("events:", execution.events);
  console.log("summary:", execution.finalAssistantOutput);
}

main().catch((err) => {
  console.error("Error:", err);
});
