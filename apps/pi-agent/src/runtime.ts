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

export type RuntimeStreamChunk =
  | { type: "runtime_started" }
  | { type: "tool_selected"; toolName: string }
  | {
      type: "tool_executed";
      toolName: "search_oss";
      resultCount: number;
      result: Awaited<ReturnType<typeof searchOssTool.execute>>;
    }
  | {
      type: "tool_executed";
      toolName: "search_jobs";
      resultCount: number;
      result: Awaited<ReturnType<typeof searchJobsTool.execute>>;
    }
  | { type: "runtime_completed"; finalAssistantOutput: string };

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

function getRuntimeQuery(input: RuntimeInput): string {
  const linearMessages = toLinearMessages(input);
  const userMessage = [...linearMessages]
    .reverse()
    .find((message) => message.role === "user");
  return userMessage?.content ?? "";
}

function selectToolNames(query: string): Array<"search_oss" | "search_jobs"> {
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

  const toolNames: Array<"search_oss" | "search_jobs"> = [];

  if (shouldRunOss || runBothTools) {
    toolNames.push("search_oss");
  }

  if (shouldRunJobs || runBothTools) {
    toolNames.push("search_jobs");
  }

  return toolNames;
}

export async function executeRuntime(
  input: RuntimeInput,
): Promise<RuntimeExecutionResult> {
  const linearMessages = toLinearMessages(input);
  const events: RuntimeEvent[] = [];
  const toolNames: string[] = [];
  const toolResults: RuntimeExecutionResult["toolResults"] = {};
  let finalAssistantOutput = "";

  for await (const chunk of streamRuntime(input)) {
    switch (chunk.type) {
      case "runtime_started":
        events.push({ type: "runtime_started" });
        break;
      case "tool_selected":
        events.push({ type: "tool_selected", toolName: chunk.toolName });
        toolNames.push(chunk.toolName);
        break;
      case "tool_executed":
        events.push({
          type: "tool_executed",
          toolName: chunk.toolName,
          resultCount: chunk.resultCount,
        });
        if (chunk.toolName === "search_oss") {
          toolResults.search_oss = chunk.result;
        } else {
          toolResults.search_jobs = chunk.result;
        }
        break;
      case "runtime_completed":
        events.push({ type: "runtime_completed" });
        finalAssistantOutput = chunk.finalAssistantOutput;
        break;
    }
  }

  return {
    runtime: input,
    linearMessages,
    toolNames,
    events,
    toolResults,
    finalAssistantOutput,
  };
}

export async function* streamRuntime(
  input: RuntimeInput,
): AsyncGenerator<RuntimeStreamChunk> {
  const query = getRuntimeQuery(input);
  const toolNames = selectToolNames(query);

  yield { type: "runtime_started" };

  let totalCount = 0;

  for (const toolName of toolNames) {
    yield { type: "tool_selected", toolName };

    if (toolName === "search_oss") {
      const result = await searchOssTool.execute({ query });
      totalCount += result.length;
      yield {
        type: "tool_executed",
        toolName,
        resultCount: result.length,
        result,
      };
      continue;
    }

    const result = await searchJobsTool.execute({ query });
    totalCount += result.length;
    yield {
      type: "tool_executed",
      toolName,
      resultCount: result.length,
      result,
    };
  }

  yield {
    type: "runtime_completed",
    finalAssistantOutput: `Found ${totalCount} opportunities for your query.`,
  };
}
