import { getDefaultModel, type SelectedModel } from "./models/default-model.js";
import { searchJobsTool, searchOssTool, type ToolDefinition } from "./tools.js";

export type RuntimeMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type RuntimeInput = {
  model: SelectedModel;
  systemPrompt: string;
  messages: RuntimeMessage[];
  tools: ToolDefinition<any, any>[];
};

export type RuntimeExecutionResult = {
  runtime: RuntimeInput;
  linearMessages: RuntimeMessage[];
  toolNames: string[];
  events: RuntimeEvent[];
  toolResults: {
    search_oss?: Awaited<ReturnType<typeof searchOssTool.execute>>;
    search_jobs?: Awaited<ReturnType<typeof searchJobsTool.execute>>;
  };
  finalAssistantOutput: string;
};

export type RuntimeEvent =
  | { type: "runtime_started" }
  | { type: "tool_selected"; toolName: string }
  | { type: "tool_executed"; toolName: string; resultCount: number }
  | { type: "runtime_completed" };

export function toLinearMessages(input: RuntimeInput): RuntimeMessage[] {
  return [{ role: "system", content: input.systemPrompt }, ...input.messages];
}

export type RuntimeExecutionInput = {
  runtime: RuntimeInput;
  linearMessages: RuntimeMessage[];
  toolNames: string[];
};

export function prepareRuntimeExecution(
  input: RuntimeInput,
): RuntimeExecutionInput {
  return {
    runtime: input,
    linearMessages: toLinearMessages(input),
    toolNames: input.tools.map((tool) => tool.name),
  };
}

export function buildRuntimeInput(userInput: string): RuntimeInput {
  return {
    model: getDefaultModel(),
    systemPrompt:
      "You are a GitHub opportunity agent that compares open source and job opportunities for a user.",
    messages: [
      {
        role: "user",
        content: userInput,
      },
    ],
    tools: [searchOssTool, searchJobsTool],
  };
}

function shouldRunTool(query: string, keywords: string[]): boolean {
  const normalizedQuery = query.toLowerCase();
  return keywords.some((keyword) => normalizedQuery.includes(keyword));
}

export async function executeRuntime(
  input: RuntimeInput,
): Promise<RuntimeExecutionResult> {
  const linearMessages = toLinearMessages(input);
  const userMessage = [...linearMessages]
    .reverse()
    .find((message) => message.role === "user");
  const query = userMessage?.content ?? "";

  const events: RuntimeEvent[] = [{ type: "runtime_started" }];
  const toolNames: string[] = [];
  const toolResults: RuntimeExecutionResult["toolResults"] = {};

  const shouldRunOss = shouldRunTool(query, [
    "open source",
    "oss",
    "github",
    "repository",
    "repo",
  ]);
  const shouldRunJobs = shouldRunTool(query, [
    "job",
    "jobs",
    "hiring",
    "role",
    "career",
    "position",
  ]);
  const runBothTools = !shouldRunOss && !shouldRunJobs;

  if (shouldRunOss || runBothTools) {
    events.push({ type: "tool_selected", toolName: "search_oss" });
    toolNames.push("search_oss");
    const result = await searchOssTool.execute({ query });
    toolResults.search_oss = result;
    events.push({
      type: "tool_executed",
      toolName: "search_oss",
      resultCount: result.length,
    });
  }

  if (shouldRunJobs || runBothTools) {
    events.push({ type: "tool_selected", toolName: "search_jobs" });
    toolNames.push("search_jobs");
    const result = await searchJobsTool.execute({ query });
    toolResults.search_jobs = result;
    events.push({
      type: "tool_executed",
      toolName: "search_jobs",
      resultCount: result.length,
    });
  }

  events.push({ type: "runtime_completed" });

  const ossCount = toolResults.search_oss?.length ?? 0;
  const jobCount = toolResults.search_jobs?.length ?? 0;
  const totalCount = ossCount + jobCount;

  return {
    runtime: input,
    linearMessages,
    toolNames,
    events,
    toolResults,
    finalAssistantOutput: `Found ${totalCount} opportunities for your query.`,
  };
}
