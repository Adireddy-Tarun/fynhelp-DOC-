import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Bot,
  User,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Calendar,
  DollarSign,
  Clock,
} from 'lucide-react'
import { colors } from '@/lib/design-system'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface FynnyChatProps {
  data?: any
  /** Legacy props kept so existing callers keep working. */
  orgId?: string | null
  answers?: string[]
}

export function FynnyChat({ data }: FynnyChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hi! I'm Nidhi, your AI CFO. I've analyzed your financial data and I'm ready to help. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "What's my biggest cost driver?",
        'How can I extend my runway?',
        'Show me revenue trends',
        'Am I GST compliant?',
      ],
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const insights = {
    cash: data?.liquidity?.currentCash ?? 380000,
    runway: data?.liquidity?.runway ?? 1.8,
    burn: data?.liquidity?.monthlyBurn ?? 210000,
    revenue: data?.revenue?.totalRevenue ?? 420000,
    gstPayable:
      ((data?.revenue?.totalRevenue ?? 420000) * 0.18) -
      ((data?.cost?.totalCost ?? 630000) * 0.18 * 0.92),
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const generateAIResponse = (
    query: string,
  ): { content: string; suggestions?: string[] } => {
    const q = query.toLowerCase()

    if (q.includes('cost') || q.includes('expense')) {
      return {
        content: `Your biggest cost driver is **salaries at ₹${(insights.burn * 0.57 / 1000).toFixed(0)}K/month** (57% of burn). Second is vendor costs at ₹${(insights.burn * 0.27 / 1000).toFixed(0)}K/month.\n\nTo optimize:\n• Negotiate 45-day payment terms with top 3 vendors (saves ₹38K cash flow)\n• Review unused software licenses (potential ₹12K/month savings)\n• Consider 1 offshore hire vs local (saves ₹45K/month)`,
        suggestions: ['Show me vendor breakdown', "What's my burn multiple?", 'Cost trend last 6 months'],
      }
    }
    if (q.includes('runway') || q.includes('extend')) {
      const newDate = new Date(Date.now() + (insights.runway * 30 + 55) * 86400000)
      return {
        content: `Your current runway is **${insights.runway.toFixed(1)} months** (${Math.floor(insights.runway * 30)} days). To extend it:\n\n**Quick wins:**\n• Delay vendor payments by 15 days → +15 days runway\n• Accelerate receivables with 2% early payment discount → +22 days\n• Pause low-ROI marketing (LinkedIn Ads) → +18 days\n\n**Combined impact:** These 3 actions add **55 days** to your runway (takes you to ${newDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}).`,
        suggestions: ['Show me scenario planning', 'What if revenue drops 20%?', 'Calculate break-even point'],
      }
    }
    if (q.includes('revenue') || q.includes('growth')) {
      return {
        content: `Your revenue is **₹${(insights.revenue / 100000).toFixed(1)}L over 90 days** (₹${(insights.revenue / 3 / 100000).toFixed(1)}L/month average).\n\n**Key metrics:**\n• MoM growth: +15%\n• ARR projection: ₹${((insights.revenue / 3) * 12 / 10000000).toFixed(2)}Cr\n• LTV:CAC ratio: 3.2:1 (healthy)\n\n**Trend:** Revenue accelerating. Product sales up 23% MoM. You're on track to hit ₹1Cr ARR with 5 more customers at ₹1.5L average deal size.`,
        suggestions: ["What's my customer acquisition cost?", 'Show me cohort retention', 'Revenue forecast next quarter'],
      }
    }
    if (q.includes('gst') || q.includes('tax') || q.includes('complian')) {
      return {
        content: `**GST Status:**\n• Payable this month: ₹${(insights.gstPayable / 1000).toFixed(0)}K\n• ITC available: ₹${((insights.burn * 0.18 * 0.92) / 1000).toFixed(0)}K\n• 2 pending filings (GSTR-1 & GSTR-3B for March)\n• 1 active notice (ITC reversal demand)\n\n⚠️ **Action required:** File GSTR-3B by April 20 (5 days left) and respond to notice by April 20 to avoid ₹10K penalty.`,
        suggestions: ['Show me filing calendar', 'ITC reconciliation status', 'Vendor compliance check'],
      }
    }
    if (q.includes('cash') || q.includes('liquidity') || q.includes('forecast')) {
      const zeroDate = new Date(Date.now() + insights.runway * 30 * 86400000)
      return {
        content: `**Cash Position:**\n• Current balance: ₹${(insights.cash / 100000).toFixed(1)}L\n• Monthly burn: ₹${(insights.burn / 100000).toFixed(1)}L\n• Runway: ${insights.runway.toFixed(1)} months\n\n**Forecast:** At current burn, you'll hit ₹0 on ${zeroDate.toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}.\n\n**Recommendation:** With ${insights.runway.toFixed(1)} months runway, start fundraising conversations now or implement cost cuts within 30 days.`,
        suggestions: ['13-week cash forecast', "What's my working capital?", 'Cash conversion cycle'],
      }
    }
    return {
      content: `I can help you with:\n• **Liquidity:** Cash flow, runway, burn rate analysis\n• **Revenue:** Growth metrics, forecasting, unit economics\n• **Costs:** Expense optimization, vendor analysis\n• **GST & Tax:** Filing status, compliance, ITC reconciliation\n\nWhat would you like to explore?`,
      suggestions: ['Give me a financial summary', 'What should I prioritize?', 'Run scenario analysis'],
    }
  }

  const handleSendMessage = (message?: string) => {
    const content = (message ?? inputValue).trim()
    if (!content) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      const ai = generateAIResponse(content)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: ai.content,
          timestamp: new Date(),
          suggestions: ai.suggestions,
        },
      ])
      setIsTyping(false)
    }, 1200)
  }

  const renderContent = (text: string) => {
    // Bold **...** + line breaks
    const html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
    return { __html: html }
  }

  const quickActions = [
    { icon: TrendingUp, label: 'Revenue Analysis', query: 'Analyze my revenue trends' },
    { icon: AlertCircle, label: 'Cost Optimization', query: 'What are my biggest cost drivers?' },
    { icon: Calendar, label: 'Tax Deadlines', query: 'Show me upcoming tax deadlines' },
    { icon: DollarSign, label: 'Cash Forecast', query: 'Give me a 13-week cash forecast' },
  ]

  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col"
      style={{
        background: colors.bg.card,
        border: `1px solid ${colors.primary[500]}30`,
        height: '78vh',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-5 border-b"
        style={{
          borderColor: `${colors.primary[500]}30`,
          background: `linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.primary[900]} 100%)`,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.accent[500]} 0%, ${colors.accent[700]} 100%)`,
              boxShadow: `0 8px 24px ${colors.accent[500]}40`,
            }}
          >
            <Sparkles size={22} color="#fff" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl" style={{ color: colors.text.primary }}>
              Nidhi AI
            </h3>
            <p className="text-xs" style={{ color: colors.text.secondary }}>
              Your AI Chief Financial Officer
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: colors.success.main }}
          />
          <span className="text-xs font-semibold" style={{ color: colors.text.secondary }}>
            Online
          </span>
        </div>
      </div>

      {/* Quick Actions (only on first message) */}
      {messages.length === 1 && (
        <div className="px-6 pt-5">
          <p
            className="text-xs uppercase tracking-wider mb-3 font-semibold"
            style={{ color: colors.text.tertiary }}
          >
            Quick Actions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon
              return (
                <motion.button
                  key={action.label}
                  onClick={() => handleSendMessage(action.query)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  className="p-4 rounded-xl flex flex-col items-center gap-2 text-center"
                  style={{
                    background: colors.bg.tertiary,
                    border: `1px solid ${colors.primary[500]}30`,
                  }}
                >
                  <Icon size={20} color={colors.accent[500]} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    {action.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent[500]} 0%, ${colors.accent[700]} 100%)`,
                  }}
                >
                  <Bot size={18} color="#fff" />
                </div>
              )}

              <div
                className={`max-w-[78%] flex flex-col ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className="px-5 py-3 rounded-2xl"
                  style={{
                    background:
                      message.role === 'user'
                        ? `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[700]} 100%)`
                        : colors.bg.tertiary,
                    color: colors.text.primary,
                    border:
                      message.role === 'assistant'
                        ? `1px solid ${colors.primary[500]}30`
                        : 'none',
                    borderTopRightRadius: message.role === 'user' ? 6 : undefined,
                    borderTopLeftRadius: message.role === 'assistant' ? 6 : undefined,
                  }}
                >
                  <div
                    className="text-sm leading-relaxed [&_strong]:font-semibold"
                    style={{ color: colors.text.primary }}
                    dangerouslySetInnerHTML={renderContent(message.content)}
                  />
                </div>
                <span
                  className="text-[10px] mt-1 px-1"
                  style={{ color: colors.text.tertiary }}
                >
                  {message.timestamp.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>

                {message.suggestions && message.role === 'assistant' && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.suggestions.map((suggestion) => (
                      <motion.button
                        key={suggestion}
                        onClick={() => handleSendMessage(suggestion)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 rounded-lg text-xs font-semibold"
                        style={{
                          background: colors.bg.tertiary,
                          color: colors.text.secondary,
                          border: `1px solid ${colors.primary[500]}40`,
                        }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: colors.bg.tertiary,
                    border: `1px solid ${colors.primary[500]}40`,
                  }}
                >
                  <User size={18} color={colors.text.primary} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 justify-start"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${colors.accent[500]} 0%, ${colors.accent[700]} 100%)`,
              }}
            >
              <Bot size={18} color="#fff" />
            </div>
            <div
              className="px-5 py-3 rounded-2xl flex items-center gap-1.5"
              style={{
                background: colors.bg.tertiary,
                border: `1px solid ${colors.primary[500]}30`,
                borderTopLeftRadius: 6,
              }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: colors.text.tertiary }}
                  animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="px-6 py-4 border-t"
        style={{ borderColor: `${colors.primary[500]}30`, background: colors.bg.secondary }}
      >
        <div className="flex gap-3">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder="Ask Nidhi anything about your finances..."
            className="flex-1 px-5 py-3 rounded-2xl outline-none font-medium text-sm"
            style={{
              background: colors.bg.tertiary,
              color: colors.text.primary,
              border: `2px solid ${colors.primary[500]}30`,
            }}
          />
          <motion.button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isTyping}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(135deg, ${colors.accent[500]} 0%, ${colors.accent[700]} 100%)`,
              boxShadow: `0 8px 24px ${colors.accent[500]}40`,
            }}
          >
            <Send size={20} color="#fff" />
          </motion.button>
        </div>

        <div className="flex items-center justify-between mt-3 px-1">
          <p className="text-[11px]" style={{ color: colors.text.tertiary }}>
            Powered by Nidhi AI • All data encrypted
          </p>
          <div className="flex items-center gap-1.5">
            <Clock size={11} color={colors.text.tertiary} />
            <span className="text-[11px]" style={{ color: colors.text.tertiary }}>
              Responds in ~2 seconds
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
