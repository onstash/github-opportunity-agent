from github_opportunity_agent.models import Profile, RepoCandidate
from github_opportunity_agent.ranking import rank_repos
from github_opportunity_agent.runtime import run_llm_shaped_agent, run_rule_based_agent


def build_sample_profile() -> Profile:
    return Profile(
        skills=["Python", "LLMs", "GitHub"],
        experience_level="intermediate",
        interests=["open source", "automation", "developer tools"],
    )


def build_sample_repos() -> list[RepoCandidate]:
    return [
        RepoCandidate(
            name="agent-playground",
            description="A small repo for experimenting with agent workflows.",
            topics=["python", "automation", "agents"],
            stars=120,
        ),
        RepoCandidate(
            name="oss-digest",
            description="Collects interesting open source updates.",
            topics=["developer tools", "open source", "python"],
            stars=540,
        ),
        RepoCandidate(
            name="frontend-kit",
            description="A UI component library.",
            topics=["typescript", "react", "design"],
            stars=980,
        ),
    ]


def main() -> None:
    sample_prompt = "I want to learn how to rank open source repositories."
    rule_based_result = run_rule_based_agent(sample_prompt)
    state, llm_shaped_result = run_llm_shaped_agent(sample_prompt)

    profile = build_sample_profile()
    repos = build_sample_repos()
    ranked_repos = rank_repos(profile, repos)

    print("Rule-based agent")
    print(f"  action: {rule_based_result.action}")
    print(f"  output: {rule_based_result.output_text}")
    print()

    print("LLM-shaped agent")
    print(f"  agent state: {state}")
    print("  agent events:")
    for event in llm_shaped_result.stream_events():
        print(f"    {event.event_type}: {event.message}")
    print(f"  action: {llm_shaped_result.action}")
    print(f"  output: {llm_shaped_result.final_output}")
    print()

    print("Ranked repositories")
    for repo, score in ranked_repos:
        print(f"  {repo.name}: {score}")


if __name__ == "__main__":
    main()
