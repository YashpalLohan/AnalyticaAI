import { Component, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message }
  }

  componentDidCatch(err: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', err, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-linen flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-error bg-error/5 p-8 text-center">
            <AlertTriangle size={32} className="text-error mx-auto mb-4" />
            <p className="label-blue mb-2">Unexpected Error</p>
            <h2 className="text-xl font-black uppercase tracking-tight text-ink mb-3">
              Something went wrong
            </h2>
            <p className="text-xs text-ink-faint mb-6 font-mono break-all">
              {this.state.message}
            </p>
            <button
              className="btn-primary text-xs py-2.5 px-6"
              onClick={() => window.location.href = '/dashboard'}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
