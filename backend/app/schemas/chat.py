"""
AnalyticaAI — Chat Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Message schemas ────────────────────────────────────────────────────────

class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000, description="User's question or message")


class ChatMessageResponse(BaseModel):
    id: str
    role: str  # "user" or "assistant"
    content: str
    response_data: Optional[dict] = None  # Charts, tables, etc.
    created_at: datetime

    class Config:
        from_attributes = True


# ── Session schemas ────────────────────────────────────────────────────────

class ChatSessionResponse(BaseModel):
    id: str
    dataset_id: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = None

    class Config:
        from_attributes = True


class ChatSessionWithMessages(ChatSessionResponse):
    messages: list[ChatMessageResponse] = []


# ── Query request/response ─────────────────────────────────────────────────

class ChatQueryRequest(BaseModel):
    dataset_id: str
    message: str = Field(..., min_length=1, max_length=5000)
    session_id: Optional[str] = None  # If provided, continue existing session


class ChatQueryResponse(BaseModel):
    session_id: str
    message: ChatMessageResponse  # The AI's response message
    follow_up_suggestions: list[str] = []
