# Chapter 2: Messages, State, and Results

## Goal

This chapter explains what an agent needs to carry between steps.

An agent is not only about one input and one output.
It also needs a place to keep:

- the current messages
- the current state
- the latest result

That structure becomes important once we add events, sessions, logs, and branching.

## Why this matters

In Chapter 1, we saw the smallest possible agent loop.
That was enough to understand `observe -> decide -> act`.

Now we need to answer a new question:

Where does the agent keep track of what happened?

The answer is not “in the model only” and not “in a random list of strings.”
The answer is structured data.

## The three pieces

The runtime should keep three different ideas separate:

### 1. Messages

Messages are the conversation pieces that move through the runtime.

Example roles:

- `system`
- `user`
- `assistant`
- `tool`

### 2. State

State is what the agent knows right now.

In the first version, state can be very small:

- the current user request
- any notes about the current turn
- the running message list

### 3. Results

Results are what the agent returns after a step completes.

This should be structured so later code can inspect it instead of parsing raw text.

## Minimal data models

Here is the shape we want:

```python
from pydantic import BaseModel, Field


class AgentMessage(BaseModel):
    role: str
    content: str


class AgentState(BaseModel):
    messages: list[AgentMessage] = Field(default_factory=list)
    current_input: str = ""


class AgentRunResult(BaseModel):
    input_text: str
    action: str
    output_text: str
```

That is enough for a first-pass runtime.

## Why structured models help

Structured models make the agent easier to reason about because they let us:

- validate data
- avoid mixing state and output
- keep messages in a predictable shape
- add fields later without breaking the whole flow

This is one reason `pydantic` is a good fit here.

## A one-turn flow

Now let us connect the models to a single agent turn.

```python
def append_user_message(state: AgentState, user_input: str) -> AgentState:
    state.messages.append(AgentMessage(role="user", content=user_input))
    state.current_input = user_input
    return state


def append_assistant_message(state: AgentState, reply: str) -> AgentState:
    state.messages.append(AgentMessage(role="assistant", content=reply))
    return state
```

That gives us a minimal turn structure:

1. receive input
2. store the input as a message
3. produce a reply
4. store the reply as a message
5. return a structured result

## Example runtime shape

```python
def run_turn(user_input: str) -> AgentRunResult:
    state = AgentState()
    state = append_user_message(state, user_input)

    if "learn" in user_input.lower():
        action = "teach"
        output_text = "I should explain this from first principles."
    else:
        action = "respond"
        output_text = "I should answer directly."

    state = append_assistant_message(state, output_text)

    return AgentRunResult(
        input_text=state.current_input,
        action=action,
        output_text=output_text,
    )
```

This is still small, but it is more realistic than a pure one-shot helper.

The agent now has memory for the current turn, even if it is only a few messages long.

## What changed from Chapter 1

Chapter 1 had a simple loop:

```text
observe -> decide -> act
```

Chapter 2 adds the objects that carry that loop:

```text
messages + state + result
```

This is the bridge between a toy loop and a real agent runtime.

## Internal messages vs external input

One subtle but important idea is that the user input is not always the same as the agent's internal message list.

The agent may:

- accept plain text from the user
- turn that into structured messages
- add assistant or tool messages later

That separation is helpful because it lets the runtime grow without changing the outside interface too much.

## Suggested implementation rule

For the first version:

- keep state small
- keep message models explicit
- avoid hiding behavior behind too many helpers
- make every turn easy to inspect

## Chapter 2 Milestone

By the end of this chapter, the learner should be able to:

- explain the difference between messages, state, and results
- create a simple `AgentState`
- store a user message and an assistant reply
- return a structured result from one turn

## Suggested exercise

Extend `AgentState` with one extra field, such as:

- `session_id`
- `turn_number`
- `notes`

Then update `run_turn(...)` to populate that field.
