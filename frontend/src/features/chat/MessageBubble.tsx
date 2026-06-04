import { User, Sparkles } from 'lucide-react'
import type { ChatMessage } from '../../services/chat.service'

interface Props {
  message: ChatMessage
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex items-start gap-3 mb-4 justify-end">
        <div className="bg-blue text-linen px-4 py-3 max-w-[80%] border border-blue">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-linen" />
        </div>
      </div>
    )
  }

  // AI message
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-blue flex items-center justify-center flex-shrink-0">
        <Sparkles size={16} className="text-linen" />
      </div>
      <div className="bg-linen border border-border px-4 py-3 max-w-[80%]">
        <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{message.content}</p>
        
        {/* Chart suggestion badge */}
        {message.response_data?.chart_suggestion && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-ink-faint">
              💡 Suggested visualization: <span className="font-semibold text-ink">{message.response_data.chart_suggestion} chart</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
