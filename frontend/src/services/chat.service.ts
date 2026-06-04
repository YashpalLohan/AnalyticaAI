import { apiClient } from '../lib/api-client'

// ── Message types ──────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  response_data?: {
    chart_suggestion?: string | null
    follow_up_suggestions?: string[]
  } | null
  created_at: string
}

// ── Session types ──────────────────────────────────────────────────────────

export interface ChatSession {
  id: string
  dataset_id: string
  title: string | null
  created_at: string
  updated_at: string
  message_count?: number
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[]
}

// ── Request/Response types ─────────────────────────────────────────────────

export interface ChatQueryRequest {
  dataset_id: string
  message: string
  session_id?: string | null
}

export interface ChatQueryResponse {
  session_id: string
  message: ChatMessage
  follow_up_suggestions: string[]
}

// ── Service ────────────────────────────────────────────────────────────────

const chatService = {
  /**
   * Send a message and get AI response
   */
  async sendMessage(request: ChatQueryRequest): Promise<ChatQueryResponse> {
    const res = await apiClient.post<ChatQueryResponse>('/chat/query', request, {
      timeout: 60000, // AI responses can take time
    })
    return res.data
  },

  /**
   * List all chat sessions for a dataset
   */
  async listSessions(datasetId: string): Promise<ChatSession[]> {
    const res = await apiClient.get<ChatSession[]>(`/chat/sessions/${datasetId}`)
    return res.data
  },

  /**
   * Get a session with all messages
   */
  async getSession(sessionId: string): Promise<ChatSessionWithMessages> {
    const res = await apiClient.get<ChatSessionWithMessages>(`/chat/sessions/${sessionId}/messages`)
    return res.data
  },

  /**
   * Delete a chat session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/chat/sessions/${sessionId}`)
  },
}

export default chatService
