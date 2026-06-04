"""
AnalyticaAI — Chat Agent
LangChain-based agent for natural language queries on DataFrames.
Uses Groq's Llama 3.3 70B model for high-quality responses.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any

import pandas as pd
from langchain_experimental.agents import create_pandas_dataframe_agent

from app.core.llm import get_llm

logger = logging.getLogger(__name__)


def get_chat_agent(df: pd.DataFrame):
    """
    Create a LangChain agent that can answer questions about a DataFrame.
    
    Args:
        df: The pandas DataFrame to query
        
    Returns:
        A LangChain agent executor
    """
    # Use the shared LLM factory so all config (model, temp, tokens, API key)
    # comes from settings in one place.
    llm = get_llm()
    
    agent = create_pandas_dataframe_agent(
        llm,
        df,
        verbose=True,
        agent_type="openai-tools",  # Stable alias for tool-calling with Groq
        allow_dangerous_code=True,  # Required for df operations
        prefix="""You are a data analyst assistant. You have access to a pandas DataFrame named 'df'.
        
When answering:
1. Be concise and specific with numbers
2. If asked for insights, provide 2-3 key findings
3. If asked for visualizations, describe what chart would be appropriate
4. Format large numbers with commas (e.g., 1,234,567)
5. Use percentages when comparing values
6. Always verify your calculations

Example responses:
- "Revenue totaled $1,234,567 across 5 products, with Product A leading at $567,890 (46% of total)"
- "Top 3 customers by orders: Alice (45 orders), Bob (32), Charlie (28)"
        """,
        max_iterations=5,
        handle_parsing_errors=True,  # Recover from LLM output format errors
    )
    
    return agent


async def answer_question(df: pd.DataFrame, question: str) -> dict[str, Any]:
    """
    Answer a natural language question about a DataFrame.
    
    Args:
        df: The pandas DataFrame to query
        question: User's natural language question
        
    Returns:
        dict with keys:
            - answer: str — The AI's text response
            - chart_suggestion: str | None — Type of chart if applicable
            - follow_up_suggestions: list[str] — Suggested follow-up questions
    """
    agent = get_chat_agent(df)
    
    # agent.invoke() is synchronous — run it in a thread pool so we don't
    # block the async event loop.
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, lambda: agent.invoke({"input": question}))
    
    # Extract the answer
    answer_text = result.get("output", "I couldn't process that question. Please try rephrasing.")
    
    # Generate follow-up suggestions based on the question type
    follow_ups = _generate_follow_ups(question, df)
    
    # Detect if a chart would be helpful
    chart_suggestion = _detect_chart_suggestion(question, answer_text)
    
    return {
        "answer": answer_text,
        "chart_suggestion": chart_suggestion,
        "follow_up_suggestions": follow_ups,
    }


def _generate_follow_ups(question: str, df: pd.DataFrame) -> list[str]:
    """Generate contextual follow-up question suggestions."""
    q_lower = question.lower()
    suggestions = []
    
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    categorical_cols = df.select_dtypes(include="object").columns.tolist()
    
    if "top" in q_lower or "best" in q_lower or "highest" in q_lower:
        suggestions.append("What about the bottom performers?")
        if len(numeric_cols) > 1:
            suggestions.append(f"How does {numeric_cols[0]} correlate with {numeric_cols[1]}?")
    
    if "revenue" in q_lower or "sales" in q_lower or "total" in q_lower:
        suggestions.append("What's the trend over time?")
        if categorical_cols:
            suggestions.append(f"Break this down by {categorical_cols[0]}")
    
    if "average" in q_lower or "mean" in q_lower:
        suggestions.append("What's the distribution like?")
        suggestions.append("Are there any outliers?")
    
    if "trend" in q_lower or "over time" in q_lower:
        suggestions.append("What's driving this trend?")
        suggestions.append("Are there any seasonal patterns?")
    
    # Generic fallbacks
    if not suggestions:
        if numeric_cols:
            suggestions.append(f"What's the average {numeric_cols[0]}?")
        if categorical_cols and len(categorical_cols) > 0:
            suggestions.append(f"Show me the distribution of {categorical_cols[0]}")
        suggestions.append("What insights can you find in this data?")
    
    return suggestions[:3]  # Max 3 suggestions


def _detect_chart_suggestion(question: str, answer: str) -> str | None:
    """Detect if a chart would enhance the answer."""
    q_lower = question.lower()
    a_lower = answer.lower()
    
    # Distribution questions
    if any(word in q_lower for word in ["distribution", "spread", "range", "histogram"]):
        return "histogram"
    
    # Comparison questions
    if any(word in q_lower for word in ["compare", "vs", "versus", "difference"]):
        return "bar"
    
    # Trend questions
    if any(word in q_lower for word in ["trend", "over time", "time series", "growth", "change"]):
        return "line"
    
    # Top/Bottom questions (usually good with bar charts)
    if any(word in q_lower for word in ["top", "bottom", "best", "worst", "highest", "lowest"]):
        return "bar"
    
    # Correlation questions
    if any(word in q_lower for word in ["correlation", "relationship", "correlated"]):
        return "scatter"
    
    # Count responses often benefit from bar charts
    if "count" in a_lower or "number of" in a_lower:
        return "bar"
    
    return None
