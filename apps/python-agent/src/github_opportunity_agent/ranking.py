from github_opportunity_agent.models import Profile, RepoCandidate

def score_repo(profile: Profile, repo: RepoCandidate) -> int:
    """
    Score a repository candidate based on the user's profile.
    """
    score = 0
    skills_set = set([skill.lower() for skill in profile.skills])
    # Score based on matching skills
    for skill in repo.topics:
      if skill.lower() in skills_set:
          score += 10
    # Score based on experience level
    if profile.experience_level == "beginner" and repo.stars < 100:
        score += 5
    elif profile.experience_level == "intermediate" and repo.stars < 500:
        score += 10
    elif profile.experience_level == "advanced" and repo.stars >= 500:
        score += 15
    # Score based on interests
    for interest in profile.interests:
        if interest in repo.topics:
            score += 5
    return score

def rank_repos(profile: Profile, repo_candidates: list[RepoCandidate]) -> list[(RepoCandidate, int)]:
  """
  Rank the repository candidates based on the user's profile.

  Args:
      profile (Profile): The user's profile containing skills, experience level, and interests.
      repo_candidates (list[RepoCandidate]): A list of repository candidates to rank.

  Returns:
      list[(RepoCandidate, int)]: A list of tuples containing repository candidates and their scores, sorted by relevance to the user's profile.
  """
  ranked_candidates_with_scores = sorted([(repo, score_repo(profile, repo)) for repo in repo_candidates], key=lambda x: x[1], reverse=True)
  return ranked_candidates_with_scores
