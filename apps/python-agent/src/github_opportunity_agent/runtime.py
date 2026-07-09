from github_opportunity_agent.models import (
    AgentEvent,
    AgentEventType,
    AgentMessage,
    AgentRunResult,
    AgentState,
)


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


def get_system_prompt_message() -> AgentMessage:
    return AgentMessage(
        role="system",
        content="You are a helpful assistant that reasons from first principles.",
    )


def decide_with_messages(messages: list[AgentMessage]) -> str:
    user_text = messages[-1].content.lower()

    if "bug" in user_text or "error" in user_text:
        return "debug"
    if "learn" in user_text or "understand" in user_text:
        return "teach"
    if "rank" in user_text or "repo" in user_text:
        return "rank"
    return "respond"


def emit_event(event_type: AgentEventType, message: str) -> AgentEvent:
    return AgentEvent(event_type=event_type, message=message)


def run_turn(state: AgentState, user_input: str) -> tuple[AgentState, AgentRunResult]:
    if len(state.messages) == 0:
        state.messages = [get_system_prompt_message()]

    state.messages.append(AgentMessage(role="user", content=user_input))
    state.status = "working"
    state.turn_number += 1

    action = decide_with_messages(state.messages)
    output_text = act(action, user_input)

    state.messages.append(AgentMessage(role="assistant", content=output_text))
    state.status = "success"

    result = AgentRunResult(
        input_text=user_input,
        action=action,
        output_text=output_text,
        final_output=output_text,
        events=[
            emit_event("agent_start", "An agent run has started."),
            emit_event("turn_start", "A new turn has started."),
            emit_event("message_start", "User message added."),
            emit_event("message_update", f"Decided action: {action}"),
            emit_event("message_update", "Assistant message added."),
            emit_event("message_end", "Turn completed successfully."),
            emit_event("agent_end", "Agent run completed successfully."),
        ],
    )
    return state, result


def run_llm_shaped_agent(user_input: str) -> tuple[AgentState, AgentRunResult]:
    state = AgentState()
    return run_turn(state, user_input)
