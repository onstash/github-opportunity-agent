import { fetchRawJobHits } from "./sources/jobs.js";
import { fetchRawOssHits } from "./sources/oss.js";

export type ToolDefinition<TArgs, TResult> = {
  name: string;
  description: string;
  execute: (args: TArgs) => Promise<TResult>;
}

export const searchJobsTool: ToolDefinition<{ query: string }, Awaited<ReturnType<typeof fetchRawJobHits>>> = {
  name: "search_jobs",
  description: "Search for job opportunities based on a query string.",
  execute: async ({ query }) => {
    return await fetchRawJobHits(query);
  },
};

export const searchOssTool: ToolDefinition<{ query: string }, Awaited<ReturnType<typeof fetchRawOssHits>>> = {
  name: "search_oss",
  description: "Search for open-source software opportunities based on a query string.",
  execute: async ({ query }) => {
    return await fetchRawOssHits(query);
  },
};

export const tools = {
  search_jobs: searchJobsTool,
  search_oss: searchOssTool,
};