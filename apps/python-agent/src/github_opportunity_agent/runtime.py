from github_opportunity_agent.models import AgentMessage, AgentRunResult


def observe(user_input: str) -> str:
    return user_input.strip().lower()


def decide(observed_input: str) -> str:
    if "bug" in observed_input or "error" in observed_input:
        return "debug"
    if "learn" in observed_input or "understand" in observed_input:
        return "teach"
    if "rank" in observed_input or "repo" in observed_input:
        return "rank"
    return "respond"


def act(action: str, user_input: str) -> str:
    if action == "debug":
        return f"I should investigate the problem in: {user_input}"
    if action == "teach":
        return f"I should explain the concept in: {user_input}"
    if action == "rank":
        return f"I should rank candidate repositories for: {user_input}"
    return f"I should respond directly to: {user_input}"


def run_rule_based_agent(user_input: str) -> AgentRunResult:
    observed_input = observe(user_input)
    action = decide(observed_input)
    output_text = act(action, user_input)
    return AgentRunResult(
        input_text=user_input,
        action=action,
        output_text=output_text,
    )


def build_messages(user_input: str) -> list[AgentMessage]:
    return [
        AgentMessage(
            role="system",
            content="You are a helpful assistant that reasons from first principles.",
        ),
        AgentMessage(role="user", content=user_input),
    ]


def decide_with_messages(messages: list[AgentMessage]) -> str:
    user_text = messages[-1].content.lower()

    if "bug" in user_text or "error" in user_text:
        return "Let's debug this step by step."
    if "learn" in user_text or "understand" in user_text:
        return "Let me teach this from first principles."
    if "rank" in user_text or "repo" in user_text:
        return "Let me score the repository candidates."
    return "Here is a direct response."


def run_llm_shaped_agent(user_input: str) -> AgentRunResult:
    messages = build_messages(user_input)
    action = "model_reply"
    output_text = decide_with_messages(messages)
    return AgentRunResult(
        input_text=user_input,
        action=action,
        output_text=output_text,
    )
