import { useState, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'

interface Props {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled = false }: Props) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    
    onSend(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Ask anything about your data... (Enter to send, Shift+Enter for new line)"
        rows={1}
        className="flex-1 px-3 py-2.5 text-sm border border-border bg-linen text-ink placeholder:text-ink-faint resize-none focus:outline-none focus:ring-1 focus:ring-blue disabled:opacity-50 disabled:cursor-not-allowed font-mono"
        style={{ minHeight: '42px', maxHeight: '120px' }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="btn-primary flex items-center gap-1.5 text-xs py-2.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ height: '42px' }}
      >
        <Send size={14} />
        Send
      </button>
    </div>
  )
}
