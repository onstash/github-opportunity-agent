from github_opportunity_agent.models import Profile, RepoCandidate


def score_repo(profile: Profile, repo: RepoCandidate) -> int:
    """
    Score a repository candidate based on the user's profile.
    """
    score = 0
    skills_set = {skill.lower() for skill in profile.skills}
    topic_set = {topic.lower() for topic in repo.topics}
    interest_set = {interest.lower() for interest in profile.interests}
    # Score based on matching skills
    for skill in topic_set:
        if skill in skills_set:
            score += 10
    # Score based on experience level
    if profile.experience_level == "beginner" and repo.stars < 100:
        score += 5
    elif profile.experience_level == "intermediate" and repo.stars < 500:
        score += 10
    elif profile.experience_level == "advanced" and repo.stars >= 500:
        score += 15
    # Score based on interests
    for interest in interest_set:
        if interest in topic_set:
            score += 5
    return score


def rank_repos(
    profile: Profile,
    repo_candidates: list[RepoCandidate],
) -> list[tuple[RepoCandidate, int]]:
    """
    Rank repository candidates based on the user's profile.
    """
    ranked_candidates_with_scores = sorted(
        [(repo, score_repo(profile, repo)) for repo in repo_candidates],
        key=lambda item: item[1],
        reverse=True,
    )
    return ranked_candidates_with_scores
