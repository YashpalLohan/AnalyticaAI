"""
AnalyticaAI — Chat Message Model
Stores individual chat messages (user questions + AI responses).
"""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(SQLEnum(MessageRole), nullable=False)
    content = Column(Text, nullable=False)  # The text message
    response_data = Column(JSONB, nullable=True)  # Charts, tables, execution details
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    session = relationship("ChatSession", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage {self.id} - {self.role.value}>"
