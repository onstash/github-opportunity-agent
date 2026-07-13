import { normalizeJob } from "../normalize/jobs.js";
import { normalizeOss } from "../normalize/oss.js";
import type { UserProfile } from "../profile.js";
import type { RankedOpportunity } from "../types.js";
import { rank } from "../ranking/rank.js";
import { tools } from "../tools.js";
import { getDefaultModel, type SelectedModel } from "../models/default-model.js";

export async function runOpportunityAgent(profile: UserProfile, userInput: string): Promise<{
  userInput: string;
  model: SelectedModel;
  ranked: RankedOpportunity[];
}> {
  const defaultModel = getDefaultModel();
  const [rawJobHits, rawOssHits] = await Promise.all([
    tools.search_jobs(userInput),
    tools.search_oss(userInput),
  ]);

  const opportunities = [
    ...rawOssHits.map((hit) => normalizeOss(hit, profile)),
    ...rawJobHits.map((hit) => normalizeJob(hit, profile)),
  ];

  const ranked = rank(opportunities);
  return {
    userInput,
    model: defaultModel,
    ranked,
  };
}