interface Props {
  onPromptClick: (prompt: string) => void
}

const PROMPTS = [
  "What are the key trends in this data?",
  "Show me the top 10 entries",
  "What insights can you find?",
  "Are there any anomalies or outliers?",
]

export default function SuggestedPrompts({ onPromptClick }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
      {PROMPTS.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onPromptClick(prompt)}
          className="text-left px-4 py-3 border border-border bg-linen hover:bg-linen-dark transition-colors group"
        >
          <p className="text-xs text-ink font-semibold group-hover:text-blue transition-colors">
            {prompt}
          </p>
        </button>
      ))}
    </div>
  )
}
