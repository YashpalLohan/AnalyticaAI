"""
AnalyticaAI — Chat Endpoints

POST /api/v1/chat/query                      → send message, get AI response
GET  /api/v1/chat/sessions/{dataset_id}      → list sessions for a dataset
GET  /api/v1/chat/sessions/{session_id}/messages → get session with all messages
DELETE /api/v1/chat/sessions/{session_id}    → delete session
"""
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.chat import (
    ChatQueryRequest,
    ChatQueryResponse,
    ChatMessageResponse,
    ChatSessionResponse,
    ChatSessionWithMessages,
)
from app.services.chat_service import (
    send_message,
    get_session_with_messages,
    list_sessions,
    delete_session,
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post(
    "/query",
    status_code=status.HTTP_200_OK,
    response_model=ChatQueryResponse,
    summary="Send a chat message and get AI response",
)
async def query_dataset(
    request: ChatQueryRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Send a natural language question about a dataset.
    Returns the AI's response along with follow-up suggestions.
    """
    try:
        session, ai_message = await send_message(
            dataset_id=request.dataset_id,
            user_id=current_user.id,
            message_text=request.message,
            session_id=request.session_id,
            db=db,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Chat agent error for user %s: %s", current_user.id, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"code": "AGENT_ERROR", "message": str(exc)},
        )
    
    await db.commit()
    
    # Extract follow-up suggestions from response_data
    follow_ups = []
    if ai_message.response_data and "follow_up_suggestions" in ai_message.response_data:
        follow_ups = ai_message.response_data["follow_up_suggestions"]
    
    return ChatQueryResponse(
        session_id=session.id,
        message=ChatMessageResponse.model_validate(ai_message),
        follow_up_suggestions=follow_ups,
    )


@router.get(
    "/sessions/{dataset_id}",
    status_code=status.HTTP_200_OK,
    response_model=list[ChatSessionResponse],
    summary="List all chat sessions for a dataset",
)
async def get_sessions(
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all chat sessions for a specific dataset.
    Ordered by most recent first.
    """
    sessions = await list_sessions(dataset_id, current_user.id, db)
    
    # Count messages for each session
    session_responses = []
    for session in sessions:
        session_dict = {
            "id": session.id,
            "dataset_id": session.dataset_id,
            "title": session.title,
            "created_at": session.created_at,
            "updated_at": session.updated_at,
            "message_count": len(session.messages) if session.messages else 0,
        }
        session_responses.append(ChatSessionResponse(**session_dict))
    
    return session_responses


@router.get(
    "/sessions/{session_id}/messages",
    status_code=status.HTTP_200_OK,
    response_model=ChatSessionWithMessages,
    summary="Get a chat session with all messages",
)
async def get_session_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a specific chat session with full message history.
    """
    session = await get_session_with_messages(session_id, current_user.id, db)
    
    return ChatSessionWithMessages(
        id=session.id,
        dataset_id=session.dataset_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        message_count=len(session.messages),
        messages=[ChatMessageResponse.model_validate(msg) for msg in session.messages],
    )


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a chat session",
)
async def remove_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Delete a chat session and all its messages.
    """
    await delete_session(session_id, current_user.id, db)
    await db.commit()
    return None
