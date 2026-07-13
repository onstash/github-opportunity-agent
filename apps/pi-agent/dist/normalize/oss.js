import { scoreRelevance } from "../ranking/rank.js";
function scoreRecency(_updatedAt) {
    return 5;
}
function scoreOssEffort(labels) {
    const lowered = labels.map((label) => label.toLowerCase());
    if (lowered.includes("good first issue"))
        return 9;
    if (lowered.includes("help wanted"))
        return 7;
    return 5;
}
function scoreOssConfidence(stars) {
    if (stars >= 5000)
        return 9;
    if (stars >= 500)
        return 7;
    if (stars >= 50)
        return 6;
    return 4;
}
export function normalizeOss(hit, profile) {
    return {
        kind: "oss",
        title: hit.issueTitle ?? hit.repoName,
        url: hit.repoUrl,
        organization: hit.repoOwner,
        summary: hit.issueBody ?? `Contribute to ${hit.repoName}`,
        topics: [...hit.topics, ...hit.labels],
        relevanceScore: scoreRelevance(hit.topics, profile),
        recencyScore: scoreRecency(hit.updatedAt),
        effortScore: scoreOssEffort(hit.labels),
        confidenceScore: scoreOssConfidence(hit.stars),
    };
}
