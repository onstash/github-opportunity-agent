from typing_extensions import TypeAlias, Literal

from pydantic import BaseModel, Field


class Profile(BaseModel):
    skills: list[str] = Field(default_factory=list)
    experience_level: str = "beginner"
    interests: list[str] = Field(default_factory=list)


class RepoCandidate(BaseModel):
    name: str
    description: str
    topics: list[str] = Field(default_factory=list)
    stars: int = 0


class AgentMessage(BaseModel):
    role: str
    content: str
    message_type: str | None = None
    timestamp: str | None = None
    id: str | None = None
    parent_id: str | None = None


class AgentState(BaseModel):
    messages: list[AgentMessage] = Field(default_factory=list)
    status: str = "idle"
    turn_number: int = 0


class AgentRunResult(BaseModel):
    input_text: str
    action: str
    output_text: str
    final_output: str | None = None
    events: list["AgentEvent"] = Field(default_factory=list)
    success: bool = True
    error: str | None = None

    def stream_events(self):
        yield from self.events


AgentEventType: TypeAlias = Literal[
    "agent_start",
    "turn_start",
    "message_start",
    "message_update",
    "message_end",
    "turn_end",
    "agent_end",
    "error",
]


class AgentEvent(BaseModel):
    event_type: AgentEventType
    message: str
