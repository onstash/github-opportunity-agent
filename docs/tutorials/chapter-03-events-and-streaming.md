# Chapter 3: Events and Streaming

## Goal

This chapter introduces a second runtime primitive:

events.

If messages and state tell us what the agent knows, events tell us what the agent is doing right now.

That matters because a real agent should not feel like a black box.
It should be able to stream progress while it works.

## Why events matter

An agent can be slow, multi-step, or uncertain.

If we only show the final answer, the user cannot see:

- when the agent started
- when a turn began
- when a message was created
- when a step updated
- when the turn ended
- whether something failed

Events make the runtime observable.
They are also the foundation for:

- terminal UI updates
- session logs
- replay
- debugging

## Messages are not enough

Messages describe conversation content.

Events describe runtime activity.

Those are related, but they are not the same thing.

For example:

- a `user` message says what the user asked
- a `message_start` event says the assistant started producing a message
- a `message_update` event says partial output arrived
- a `message_end` event says that message is complete

## The event model

For the first version, keep the event model very small and explicit.

```python
from pydantic import BaseModel


class AgentEvent(BaseModel):
    event_type: str
    message: str
```

That is enough to teach the idea.

Later, you can split this into more specific event types if needed.

## Common event types

A good first set of event types is:

- `agent_start`
- `turn_start`
- `message_start`
- `message_update`
- `message_end`
- `turn_end`
- `agent_end`
- `error`

These are the minimum events that make a turn understandable from the outside.

## A simple streaming helper

Here is a very small way to emit events:

```python
def emit_event(event_type: str, message: str) -> AgentEvent:
    return AgentEvent(event_type=event_type, message=message)
```

You can imagine a real terminal UI printing each event as it arrives.

## Event-driven turn flow

Now we can connect events to a turn.

```python
def run_turn_with_events(state: AgentState, user_input: str) -> tuple[AgentState, AgentRunResult, list[AgentEvent]]:
    events: list[AgentEvent] = []

    events.append(emit_event("turn_start", "A new turn has started."))

    if len(state.messages) == 0:
        state.messages = [get_system_prompt_message()]

    state.messages.append(AgentMessage(role="user", content=user_input))
    events.append(emit_event("message_start", "User message added."))

    state.status = "working"
    state.turn_number += 1

    action = decide_with_messages(state.messages)
    events.append(emit_event("message_update", f"Decided action: {action}"))

    output_text = act(action, user_input)

    state.messages.append(AgentMessage(role="assistant", content=output_text))
    events.append(emit_event("message_end", "Assistant message completed."))

    state.status = "success"
    events.append(emit_event("turn_end", "Turn completed successfully."))

    return (
        state,
        AgentRunResult(
            input_text=user_input,
            action=action,
            output_text=output_text,
        ),
        events,
    )
```

This is still simple, but now the runtime can explain itself step by step.

## What streaming means

Streaming does not have to mean fancy networking.

For the first version, streaming can simply mean:

- the runtime produces events as it works
- the terminal prints them as they happen
- the user sees progress before the final result

That is enough to make the agent feel alive.

## Why this helps the terminal UI

A terminal UI becomes much more useful when it can show:

- the current turn
- the current action
- partial progress
- completion
- errors

Even if the interface is just `print(...)` at first, the event structure lets you upgrade later without changing the core runtime shape.

## Error events

Real systems fail, so we should already reserve room for failure.

A simple pattern is:

```python
events.append(emit_event("error", "Something went wrong."))
state.status = "failed"
```

That gives the runtime a place to record failure instead of silently crashing.

## Chapter 3 Milestone

By the end of this chapter, the learner should be able to:

- explain the difference between messages and events
- create a small event model
- emit events during a turn
- understand how streaming makes the runtime observable

## Suggested exercise

Add one new event type, such as:

- `thought_start`
- `thought_end`
- `tool_start`
- `tool_end`

Then update the event-emitting turn function to produce that event too.
