# Memory

## 2026-07-07

### Mistake: mixing streaming and final return values in one turn function

We tried to make `run_turn_with_events(...)` both:

- stream events with `yield`
- return final `state` and `result` in the normal way

That is a bad shape because a generator function and a normal return flow do not fit together cleanly.

### Why it was wrong

- `yield` means the caller consumes values one by one
- `return` means the function finishes and hands back a final result
- trying to do both in one function made the runtime confusing and logically awkward

### Fix

Keep the concerns separate:

1. `run_turn(...)`
   - returns final `state` and `AgentRunResult`

2. `stream_turn_events(...)`
   - yields events one by one for streaming

3. If needed, a wrapper can coordinate both
   - but do not force one function to behave like both a generator and a normal return function

### Rule of thumb

If the goal is streaming, use `yield`.
If the goal is final output, use `return`.
If the goal is both, split the work into two functions or a wrapper.

### Better reference pattern: OpenAI Agents SDK

The cleaner pattern is:

- consume events from `result.stream_events()`
- after streaming ends, read `result.final_output`
- while streaming, `final_output` is `None`
- after completion, `final_output` contains the final answer

### Why this is better

- events and final output are both part of the same result object
- streaming stays streaming
- final output stays final output
- the caller gets a simple and clear API

### Lesson for our codebase

Prefer a design where:

1. the stream exposes events while the agent is working
2. the final result is read after the stream completes
3. the two concerns stay linked, but not mixed into one confusing return shape

## 2026-07-07

### Mistake: going in loops and making the design more confusing

We kept trying to explain the same streaming/result problem in slightly different shapes, which made the runtime design worse instead of clearer.

### Why it was wrong

- the discussion repeated the same mistake instead of settling the shape
- the code kept drifting between generator style, collected events, and final return values
- that created more confusion instead of a clean teaching path

### Fix

- stop re-litigating the same shape in different words
- choose one clean design and stick to it
- keep the tutorial and code aligned with that one design
- update memory when a mistake is repeated so we do not loop back into it

### Rule of thumb

If a runtime shape is already confusing, do not keep iterating on it verbally in circles.
Write down the mistake, write down the fix, and move to the cleaner shape once.
