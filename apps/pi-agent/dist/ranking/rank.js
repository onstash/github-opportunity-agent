export function totalScore(opportunity) {
    // Calculate the total score based on the individual scores
    return (opportunity.relevanceScore * 0.45 +
        opportunity.recencyScore * 0.2 +
        opportunity.effortScore * 0.2 +
        opportunity.confidenceScore * 0.15);
}
export function explain(opportunity) {
    const reasons = [];
    if (opportunity.relevanceScore >= 8)
        reasons.push("strong skill match");
    if (opportunity.relevanceScore >= 6)
        reasons.push("strong profile match");
    if (opportunity.recencyScore >= 7)
        reasons.push("fresh opportunity");
    if (opportunity.effortScore >= 7)
        reasons.push("approachable next step");
    if (opportunity.confidenceScore >= 7)
        reasons.push("credible source");
    return reasons;
}
export function rank(opportunities) {
    return opportunities
        .map((opportunity) => ({
        ...opportunity,
        totalScore: totalScore(opportunity),
        reasons: explain(opportunity),
    }))
        .sort((a, b) => b.totalScore - a.totalScore);
}
export function scoreRelevance(topics, profile) {
    const topicSet = new Set(topics.map((topic) => topic.toLowerCase()));
    const profileTerms = [
        ...profile.skills,
        ...profile.interests,
        ...profile.targetRoles,
    ].map((term) => term.toLowerCase());
    let matches = 0;
    for (const term of profileTerms) {
        if (topicSet.has(term)) {
            matches += 1;
        }
    }
    return Math.min(10, matches * 3);
}
