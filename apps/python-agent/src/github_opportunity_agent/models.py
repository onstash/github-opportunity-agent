from pydantic import BaseModel

class Profile(BaseModel):
  skills: list[str]
  experience_level: str
  interests: list[str]

class RepoCandidate(BaseModel):
  name: str
  description: str
  topics: list[str]
  stars: int = 0
