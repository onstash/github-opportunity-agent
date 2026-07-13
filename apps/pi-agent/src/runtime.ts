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
