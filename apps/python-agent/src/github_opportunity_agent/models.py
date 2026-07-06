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
    success: bool = True
    error: str | None = None
