import type { Opportunity, RankedOpportunity } from "../types.js";

export function totalScore(opportunity: Opportunity): number {
  // Calculate the total score based on the individual scores
  return (
    opportunity.relevanceScore * 0.45 +
    opportunity.recencyScore * 0.2 +
    opportunity.effortScore * 0.2 +
    opportunity.confidenceScore * 0.15
  );
}

export function explain(opportunity: Opportunity): string[] {
  const reasons: string[] = [];

  // if (opportunity.relevanceScore >= 8) reasons.push("strong skill match");
  if (opportunity.relevanceScore >= 6) reasons.push("strong profile match");
  if (opportunity.recencyScore >= 7) reasons.push("fresh opportunity");
  if (opportunity.effortScore >= 7) reasons.push("approachable next step");
  if (opportunity.confidenceScore >= 7) reasons.push("credible source");

  return reasons;
}

export function rank(opportunities: Opportunity[]): RankedOpportunity[] {
  return opportunities
    .map((opportunity) => ({
      ...opportunity,
      totalScore: totalScore(opportunity),
      reasons: explain(opportunity),
    }))
    .sort((a, b) => b.totalScore - a.totalScore);
}
