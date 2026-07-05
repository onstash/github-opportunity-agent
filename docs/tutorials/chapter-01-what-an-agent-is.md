# Chapter 1: What an Agent Is

## Goal

This chapter introduces the most important idea in the whole tutorial:

An agent is not just "code that calls an LLM."

An agent is a loop that:

1. observes some input or state
2. decides what to do next
3. takes an action
4. produces a result

Later chapters will make this loop richer with messages, events, sessions, logs, and branching.
For now, we only need the smallest possible version.

## A script is not always an agent

Many ordinary programs take an input and return an output.

Example:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

This is useful code, but it is not much of an agent.
It does not inspect state, choose between possible actions, or behave like a runtime loop.

An agent usually has at least one decision point.

## The smallest possible agent loop

At a high level, an agent loop looks like this:

```text
input/state -> observe -> decide -> act -> result
```

That shape matters more than whether the agent uses:

- rules
- an LLM
- tools
- memory
- a UI

Those are implementation details built on top of the loop.

## First example: a toy non-LLM agent

We will start with a tiny rule-based agent.

Its job:

- look at a user's request
- decide what kind of help is needed
- return a simple action

### Example code

```python
def observe(user_input: str) -> str:
    return user_input.strip().lower()


def decide(observed_input: str) -> str:
    if "bug" in observed_input or "error" in observed_input:
        return "debug"
    if "learn" in observed_input or "understand" in observed_input:
        return "teach"
    return "respond"


def act(action: str, user_input: str) -> str:
    if action == "debug":
        return f"I should investigate the problem in: {user_input}"
    if action == "teach":
        return f"I should explain the concept in: {user_input}"
    return f"I should respond directly to: {user_input}"


def run_agent(user_input: str) -> str:
    observed_input = observe(user_input)
    action = decide(observed_input)
    result = act(action, user_input)
    return result
```

### What this teaches

This example already has the core agent shape:

- `observe(...)`
- `decide(...)`
- `act(...)`
- `run_agent(...)`

This is still simple, but it is closer to an agent than a plain one-line helper function because it has an explicit decision step.

## Why this counts as an agent

This toy version does not use an LLM, but it still follows an agent pattern:

- it inspects input
- it chooses between possible next actions
- it performs one of those actions
- it returns a result

That is enough for a first-principles mental model.

## Second example: the same loop in LLM-shaped form

Now let us map the same idea to an LLM-style agent.

We will not call a real model yet.
Instead, we will focus on the shape of the data.

### Example code

```python
def build_messages(user_input: str) -> list[dict[str, str]]:
    return [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": user_input},
    ]


def decide_with_model(messages: list[dict[str, str]]) -> str:
    user_text = messages[-1]["content"].lower()

    if "bug" in user_text or "error" in user_text:
        return "Let's debug this step by step."
    if "learn" in user_text or "understand" in user_text:
        return "Let me teach this from first principles."
    return "Here is a direct response."


def run_llm_shaped_agent(user_input: str) -> str:
    messages = build_messages(user_input)
    reply = decide_with_model(messages)
    return reply
```

### What changed

The loop is still the same.

Before:

- observe input
- choose an action
- produce a result

Now:

- build messages from input
- let a model-like step choose the response
- return the response

The details changed, but the runtime idea did not.

## The key lesson

An LLM does not create the agent pattern.
It only changes how the `decide` step works.

That means:

- some agents are rule-based
- some agents are LLM-based
- some agents mix both

But in all cases, the core structure is still:

```text
observe -> decide -> act
```

## Why we start with functions, not classes

At this stage, classes would add more structure than we need.

Plain functions help us see the runtime shape more clearly:

- input comes in
- one step hands work to the next
- the flow is easy to trace

Later, if the runtime grows more complex, we may introduce classes where they genuinely help.
But classes are not required to understand agents.

## How this connects to the rest of the tutorial

This chapter gave us the smallest working mental model.

The next chapters will gradually add:

- structured message models
- event streams
- sessions
- JSONL logs
- tree-based branching
- observability
- evals

Then we will apply the same runtime ideas to the GitHub opportunity agent.

## Chapter 1 Milestone

By the end of this chapter, the learner should be able to say:

- an agent is a loop, not just an API call
- the core shape is observe, decide, and act
- the same pattern works with and without an LLM
- functions are enough for the first version

## Suggested exercise

Modify the toy `decide(...)` function to recognize one more intent, such as:

- `plan`
- `summarize`
- `rank`

Then update `act(...)` so the agent produces a different result for that new action.
