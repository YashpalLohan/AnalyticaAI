"""
AnalyticaAI — Chat Service
Manages chat sessions, messages, and integrates with the chat agent.
"""
from __future__ import annotations

import io
import logging
from typing import Optional

import pandas as pd
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.agents.chat_agent import answer_question
from app.core.storage import get_storage
from app.models.chat_message import ChatMessage, MessageRole
from app.models.chat_session import ChatSession
from app.models.dataset import Dataset
from app.services.dataset_service import get_dataset

logger = logging.getLogger(__name__)


async def create_or_get_session(
    dataset_id: str,
    user_id: str,
    session_id: Optional[str],
    db: AsyncSession,
) -> ChatSession:
    """
    Get existing session or create a new one.
    """
    if session_id:
        # Try to get existing session
        result = await db.execute(
            select(ChatSession).where(
                ChatSession.id == session_id,
                ChatSession.user_id == user_id,
                ChatSession.dataset_id == dataset_id,
            )
        )
        session = result.scalar_one_or_none()
        if session:
            return session
    
    # Create new session
    session = ChatSession(
        dataset_id=dataset_id,
        user_id=user_id,
        title=None,  # Will be set from first message
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)
    return session


async def send_message(
    dataset_id: str,
    user_id: str,
    message_text: str,
    session_id: Optional[str],
    db: AsyncSession,
) -> tuple[ChatSession, ChatMessage]:
    """
    Process a user message and generate AI response.
    
    Returns:
        (session, ai_response_message)
    """
    # Verify dataset access
    dataset: Dataset = await get_dataset(dataset_id, user_id, db)
    
    # Get or create session
    session = await create_or_get_session(dataset_id, user_id, session_id, db)
    
    # Save user message
    user_message = ChatMessage(
        session_id=session.id,
        role=MessageRole.USER,
        content=message_text,
        response_data=None,
    )
    db.add(user_message)
    await db.flush()
    
    # Load the dataset
    storage = get_storage()
    content = await storage.download(dataset.storage_path)
    
    # Parse based on extension
    ext = dataset.file_extension
    try:
        if ext in ("csv", "txt"):
            df = pd.read_csv(io.BytesIO(content))
        elif ext in ("xlsx", "xls"):
            df = pd.read_excel(io.BytesIO(content))
        elif ext == "json":
            df = pd.read_json(io.BytesIO(content))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "UNSUPPORTED_FORMAT", "message": f"Cannot chat with .{ext} files"},
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"code": "DATASET_CORRUPTED", "message": f"Could not read dataset: {exc}"},
        )
    
    # Get AI response — let exceptions propagate so callers get a proper HTTP error
    result = await answer_question(df, message_text)
    answer_text = result["answer"]
    chart_suggestion = result.get("chart_suggestion")
    follow_ups = result.get("follow_up_suggestions", [])
    
    # Save AI response
    ai_message = ChatMessage(
        session_id=session.id,
        role=MessageRole.ASSISTANT,
        content=answer_text,
        response_data={
            "chart_suggestion": chart_suggestion,
            "follow_up_suggestions": follow_ups,
        },
    )
    db.add(ai_message)
    
    # Update session title from first message if not set
    if not session.title and len(message_text) > 0:
        session.title = message_text[:50] + ("..." if len(message_text) > 50 else "")
    
    await db.flush()
    await db.refresh(ai_message)
    
    return session, ai_message


async def get_session_with_messages(
    session_id: str,
    user_id: str,
    db: AsyncSession,
) -> ChatSession:
    """Get a chat session with all messages."""
    result = await db.execute(
        select(ChatSession)
        .where(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
        )
        .options(selectinload(ChatSession.messages))
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "SESSION_NOT_FOUND", "message": "Chat session not found"},
        )
    
    return session


async def list_sessions(
    dataset_id: str,
    user_id: str,
    db: AsyncSession,
) -> list[ChatSession]:
    """List all chat sessions for a dataset."""
    result = await db.execute(
        select(ChatSession)
        .where(
            ChatSession.dataset_id == dataset_id,
            ChatSession.user_id == user_id,
        )
        .order_by(ChatSession.updated_at.desc())
    )
    return list(result.scalars().all())


async def delete_session(
    session_id: str,
    user_id: str,
    db: AsyncSession,
) -> None:
    """Delete a chat session and all its messages."""
    result = await db.execute(
        select(ChatSession).where(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "SESSION_NOT_FOUND", "message": "Chat session not found"},
        )
    
    await db.delete(session)
