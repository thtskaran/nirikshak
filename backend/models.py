# models.py

from datetime import datetime
from enum import Enum
from typing import List, Optional, Any, Dict

from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict

# Helper for handling MongoDB's ObjectId in Pydantic V2
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, *args, **kwargs):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema, handler):
        field_schema.update(type="string")


# --- Enums matching the Prisma Schema ---
class DeploymentStatus(str, Enum):
    PENDING = "PENDING"
    DEPLOYED = "DEPLOYED"
    STOPPED = "STOPPED"
    ERROR = "ERROR"

class LogVerdict(str, Enum):
    SAFE = "SAFE"
    UNSAFE = "UNSAFE"

class SCode(str, Enum):
    S1 = "S1"
    S2 = "S2"
    S3 = "S3"
    S4 = "S4"
    S5 = "S5"
    S6 = "S6"
    S7 = "S7"
    S8 = "S8"
    S9 = "S9"
    S10 = "S10"
    S11 = "S11"
    S12 = "S12"
    S13 = "S13"
    S14 = "S14"

# --- Pydantic Models for MongoDB Collections ---
class BaseModelWithID(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )

class Model(BaseModelWithID):
    name: str
    provider: Optional[str] = "Ollama"
    tags: List[str] = []
    parameters: Optional[int] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class Deployment(BaseModelWithID):
    modelId: PyObjectId
    name: str
    description: Optional[str] = None
    systemPrompt: str
    temperature: float = 0.7
    endpoint: str  # This will be the unique slug, e.g., /proxy/my-test-model
    containerId: Optional[str] = None
    containerName: Optional[str] = None # Docker networking uses names
    status: DeploymentStatus = DeploymentStatus.PENDING
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class LogEntry(BaseModelWithID):
    deploymentId: PyObjectId
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    requestSample: Optional[str] = None  # In a real system, this would be an S3 link
    responseSample: Optional[str] = None # S3 link
    verdict: LogVerdict
    sCode: Optional[SCode] = None

class RedTeamReport(BaseModelWithID):
    deploymentId: PyObjectId
    reportDoc: Optional[str] = None # Path to the generated PDF
    safe: bool
    description: Optional[str] = None
    conversation: Optional[Any] = None # Store the full JSON conversation
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

# --- Models for API Request Bodies ---
class DeploymentRequest(BaseModel):
    modelId: str # Sent as string from frontend
    name: str
    description: Optional[str] = None
    systemPrompt: str
    temperature: float = 0.7

class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    stream: bool = False