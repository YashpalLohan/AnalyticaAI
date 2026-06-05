import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import chatService, { ChatMessage } from '../../services/chat.service'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'
import SuggestedPrompts from './SuggestedPrompts'
import GuestLimitModal from '../../components/GuestLimitModal'
import { useGuestLimit } from '../../hooks/useGuestLimit'

interface Props {
  datasetId: string
}

// ── Typing indicator ───────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center flex-shrink-0">
        <Sparkles size={16} className="text-linen" />
      </div>
      <div className="bg-linen border border-border px-4 py-3 max-w-[80%]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-ink-faint animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function ChatTab({ datasetId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [followUps, setFollowUps] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { checkLimit, showModal, closeModal, usageLeft } = useGuestLimit()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Try to load existing session on mount
  useEffect(() => {
    chatService.listSessions(datasetId)
      .then(sessions => {
        if (sessions.length > 0) {
          const latest = sessions[0]
          setSessionId(latest.id)
          return chatService.getSession(latest.id)
        }
      })
      .then(session => {
        if (session) {
          setMessages(session.messages)
        }
      })
      .catch(() => {
        // No sessions yet, start fresh
      })
  }, [datasetId])

  const handleSendMessage = async (text: string) => {
    if (!checkLimit()) return   // blocks if guest limit reached

    // Add user message immediately
    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setFollowUps([])
    setLoading(true)

    try {
      const response = await chatService.sendMessage({
        dataset_id: datasetId,
        message: text,
        session_id: sessionId,
      })

      // Update session ID if it's a new session
      if (!sessionId) {
        setSessionId(response.session_id)
      }

      // Replace temp user message with real one, add AI response
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== userMsg.id)
        // Find the actual user message from the session (we need to fetch it or just keep temp)
        return [...withoutTemp, userMsg, response.message]
      })

      // Update follow-ups
      setFollowUps(response.follow_up_suggestions || [])
    } catch (err: any) {
      toast.error('Failed to send message. Please try again.')
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== userMsg.id))
    } finally {
      setLoading(false)
    }
  }

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt)
  }

  // ── Empty state ──
  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-col h-[600px]">
        {showModal && <GuestLimitModal onClose={closeModal} />}
        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 border border-border bg-linen">
          <MessageSquare size={48} className="text-ink-faint mb-4" />
          <p className="label-blue mb-2">AI Data Assistant</p>
          <p className="text-sm text-ink font-semibold mb-2">Ask anything about your data</p>
          <p className="text-xs text-ink-faint text-center max-w-md mb-8">
            Use natural language to explore your dataset. Ask for insights, trends, comparisons, and more.
          </p>
          
          {/* Suggested prompts */}
          <SuggestedPrompts onPromptClick={handlePromptClick} />
        </div>

        {/* Input at bottom */}
        <div className="border-t border-border bg-linen-dark p-4">
          <ChatInput onSend={handleSendMessage} disabled={loading} />
        </div>
      </div>
    )
  }

  // ── Chat interface ──
  return (
    <div className="flex flex-col h-[600px]">
      {showModal && <GuestLimitModal onClose={closeModal} />}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 border border-border bg-linen">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {loading && <TypingIndicator />}
        
        {/* Follow-up suggestions (shown after AI response) */}
        {!loading && followUps.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {followUps.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(prompt)}
                className="text-xs px-3 py-1.5 border border-border bg-linen-dark hover:bg-linen transition-colors text-ink-faint hover:text-ink"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-linen-dark p-4">
        <ChatInput onSend={handleSendMessage} disabled={loading} />
      </div>
    </div>
  )
}
