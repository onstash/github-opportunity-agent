import { buildRuntimeInput, streamRuntime } from "./runtime.js";

async function main() {
  const userInput =
    process.argv.slice(2).join(" ").trim() || "typescript developer tools";
  const runtime = buildRuntimeInput(userInput);

  for await (const chunk of streamRuntime(runtime)) {
    console.log(JSON.stringify(chunk));
  }
}

main().catch((err) => {
  console.error("Error:", err);
});
