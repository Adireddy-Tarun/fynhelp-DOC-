import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { supabase } from '@/integrations/supabase/client'

interface Message {
  role: 'user' | 'fynny'
  text: string
}

interface FynnyChatProps {
  orgId: string
  answers: string[]
}

const QUICK_QUESTIONS = [
  "What's my biggest expense?",
  'How long is my runway?',
  'Should I hire another person?',
  'How can I reduce costs?',
]

export function FynnyChat({ orgId, answers: _answers }: FynnyChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'fynny', text: "Hi! I'm Fynny, your AI CFO. Ask me anything about your finances." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMessage = text.trim()
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }])
    setInput('')
    setLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('fynny-chat', {
        body: { message: userMessage, orgId },
      })
      if (error) throw error
      setMessages((prev) => [...prev, { role: 'fynny', text: data.response }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        { role: 'fynny', text: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl flex flex-col h-[70vh]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'fynny' && (
              <div className="w-9 h-9 rounded-full bg-[#C41E1E] flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[75%] px-5 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-[#C41E1E] text-white rounded-tr-sm'
                  : 'bg-white/10 text-white border border-white/10 rounded-tl-sm'
              }`}
            >
              <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-white text-xs font-semibold">
                You
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-9 h-9 rounded-full bg-[#C41E1E] flex items-center justify-center flex-shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div className="px-5 py-3 rounded-2xl rounded-tl-sm bg-white/10 border border-white/10">
              <Loader size={18} className="text-white/70 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4 space-y-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about cash flow, expenses, runway..."
            disabled={loading}
            className="flex-1 px-5 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#C41E1E] transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-[#C41E1E] hover:bg-[#A01818] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              disabled={loading}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white text-xs transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
