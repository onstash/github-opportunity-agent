import { scoreRelevance } from "../ranking/rank.js";
function scoreRecency(_updatedAt) {
    return 5;
}
function scoreJobEffort(_summary) {
    return 5;
}
function scoreJobConfidence(source) {
    if (source === "official_org")
        return 9;
    if (source === "repo_issue")
        return 7;
    return 5;
}
export function normalizeJob(hit, profile) {
    return {
        kind: "job",
        title: hit.roleTitle,
        url: hit.postingUrl,
        organization: hit.orgName,
        summary: hit.summary,
        topics: hit.skills,
        relevanceScore: scoreRelevance(hit.skills, profile),
        recencyScore: scoreRecency(hit.updatedAt),
        effortScore: scoreJobEffort(hit.summary),
        confidenceScore: scoreJobConfidence(hit.source),
    };
}
