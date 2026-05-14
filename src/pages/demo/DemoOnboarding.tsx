import { useState, useEffect, useRef } from 'react'
import { Bot, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

const QUESTIONS = [
  "Hi! I'm Fynny, your AI CFO. What's your business name?",
  "What industry are you in?",
  "How many employees do you have?",
  "What's your approximate monthly revenue?",
  "What's your biggest financial challenge right now?"
]

interface Message {
  role: 'fynny' | 'user'
  text: string
}

export function DemoOnboarding() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'fynny', text: QUESTIONS[0] }
  ])
  const navigate = useNavigate()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const hasAccess = sessionStorage.getItem('demo_access') === 'true'
  if (!hasAccess) {
    window.location.href = '/demo/login'
    return null
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentInput.trim()) return

    const newMessages = [...messages, { role: 'user' as const, text: currentInput }]
    setMessages(newMessages)

    const newAnswers = [...answers, currentInput]
    setAnswers(newAnswers)
    setCurrentInput('')

    if (step < QUESTIONS.length - 1) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'fynny',
          text: QUESTIONS[step + 1]
        }])
        setStep(step + 1)
      }, 800)
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'fynny',
          text: "Perfect! I now understand your business. Let's upload your financial data so I can give you real insights. 📊"
        }])

        sessionStorage.setItem('demo_answers', JSON.stringify(newAnswers))

        setTimeout(() => {
          navigate('/demo/upload')
        }, 2000)
      }, 800)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1412] to-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#1a1412]/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-georgia font-bold text-white">
            FynHelp Demo
          </h1>
          <div className="text-white/60 text-sm">
            Step {step + 1} of {QUESTIONS.length}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#C41E1E] to-[#E85D5D] rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-georgia font-bold text-white mb-3">
            Meet Fynny
          </h2>
          <p className="text-xl text-white/70">
            Your AI CFO wants to know your business
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-6 h-[500px] overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 mb-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'fynny'
                  ? 'bg-gradient-to-br from-[#C41E1E] to-[#E85D5D]'
                  : 'bg-white/10'
              }`}>
                {msg.role === 'fynny' ? (
                  <Bot size={24} className="text-white" />
                ) : (
                  <span className="text-white font-bold text-sm">You</span>
                )}
              </div>

              <div className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                msg.role === 'user'
                  ? 'bg-white/10 text-white'
                  : 'bg-[#C41E1E]/20 text-white border border-[#C41E1E]/30'
              }`}>
                <p className="text-base leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#C41E1E] transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={!currentInput.trim()}
              className="px-8 py-4 bg-[#C41E1E] text-white rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              <Send size={24} />
            </button>
          </div>
        </form>

        <div className="mt-8">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Progress</span>
            <span>{Math.round((step / QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C41E1E] to-[#E85D5D] transition-all duration-500"
              style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoOnboarding
