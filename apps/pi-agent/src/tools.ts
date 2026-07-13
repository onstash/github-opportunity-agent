import { fetchRawJobHits } from "./sources/jobs.js";
import { fetchRawOssHits } from "./sources/oss.js";

export const tools = {
  search_jobs: fetchRawJobHits,
  search_oss: fetchRawOssHits,
};