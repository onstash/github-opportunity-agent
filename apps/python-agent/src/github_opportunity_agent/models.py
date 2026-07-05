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


class AgentRunResult(BaseModel):
    input_text: str
    action: str
    output_text: str
