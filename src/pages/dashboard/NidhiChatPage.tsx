import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Sparkles, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, ArrowRight, Plus, Loader2, BarChart3,
  Calendar, Users, FileText, Zap, MessageCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

// ===== Design tokens =====
const C = {
  bg: "#0A0B0D",
  bg2: "#111214",
  card: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.08)",
  text: "#E5E7EB",
  textDim: "rgba(229,231,235,0.6)",
  textMuted: "rgba(229,231,235,0.4)",
  critical: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
  info: "#3B82F6",
  ai: "#C41E1E",
};

interface ContextCard {
  type: "metric" | "chart" | "alert" | "action";
  title: string;
  data: any;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  cards?: ContextCard[];
}

const suggestions = [
  "What's my cash position?",
  "Who hasn't paid me this month?",
  "When is my next GST due?",
  "Simulate hiring 2 people",
  "What's my biggest financial risk?",
  "Generate my monthly CFO report",
];

const quickActions = [
  { label: "New Report", icon: FileText },
  { label: "Cash Forecast", icon: BarChart3 },
  { label: "GST Calendar", icon: Calendar },
  { label: "Team Cost", icon: Users },
  { label: "Quick Insight", icon: Zap },
];

function generateAIResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("cash")) {
    return "Your current cash position is ₹4.2L, down 12% from last period. At the current burn rate of ₹1.1L/month, your runway is 52 days.\n\nImmediate recommendations:\n1. Accelerate collections on overdue invoices (₹2.1L outstanding >60 days)\n2. Review and optimize vendor payment terms\n3. Consider freezing discretionary marketing spend (potential ₹90K/month savings)\n\nThis would extend your runway to approximately 90 days.";
  }
  if (q.includes("paid") || q.includes("overdue") || q.includes("receivable")) {
    return "You have ₹17.2L overdue across 3 customers:\n\n• Electronics — ₹8.4L (67 days overdue)\n• Sharma & Sons — ₹3.1L (38 days overdue)\n• Delhi Distributors — ₹5.7L (12 days overdue)\n\nCollecting Electronics alone would extend runway by 15 days.";
  }
  if (q.includes("gst")) {
    return "Your next GSTR-3B is due in 8 days (15th of this month). Data is reconciled and ready for review. Estimated liability: ₹1.42L.";
  }
  return "I'm analyzing your request. Let me pull the relevant financial data and provide actionable insights.";
}

function generateContextCards(query: string): ContextCard[] {
  const q = query.toLowerCase();
  if (q.includes("cash")) {
    return [
      { type: "metric", title: "Cash Runway", data: { value: 52, unit: "days", change: -3 } },
      { type: "action", title: "Recommended Actions", data: { actions: [
        "Collect ₹2.1L overdue receivables",
        "Freeze marketing spend (₹90K/mo)",
        "Extend vendor terms by 15 days",
      ]}},
    ];
  }
  if (q.includes("overdue") || q.includes("paid")) {
    return [
      { type: "alert", title: "Critical Receivable", data: { severity: "critical", message: "Electronics: ₹8.4L (67 days)", action: "Send Reminder" }},
    ];
  }
  return [];
}

export default function NidhiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([{
      id: "1",
      role: "assistant",
      content: "Good morning. I'm CFO Fynny, your CFO. I've been monitoring your business overnight. Here's a quick update:\n\n• Your cash runway is 52 days — down 3 days from last week\n• Electronics owes ₹8.4L, now 67 days overdue\n• Your GSTR-3B is due in 8 days — ready for review\n\nWhat would you like to know?",
      timestamp: new Date(),
      cards: [
        { type: "metric", title: "Cash Position", data: { value: 420000, change: -12 }},
        { type: "alert", title: "Overdue Receivable", data: { severity: "critical", message: "Electronics: ₹8.4L (67 days)", action: "Send Reminder" }},
      ],
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSend = () => {
    if (!input.trim() || isThinking) return;
    const text = input;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() }]);
    setInput("");
    setShowSuggestions(false);
    setIsThinking(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(text),
        timestamp: new Date(),
        cards: generateContextCards(text),
      }]);
      setIsThinking(false);
    }, 1400);
  };

  const handleSuggestionClick = (s: string) => {
    setInput(s);
    inputRef.current?.focus();
  };

  return (
    <DashboardLayout>
      <style>{`
        @keyframes nidhiPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.4); } }
        @keyframes nidhiTyping { 0%,100% { opacity: 0.2; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }
        .nidhi-input::placeholder { color: ${C.textMuted}; }
        .nidhi-scroll::-webkit-scrollbar { width: 8px; }
        .nidhi-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      <div style={{
        display: "flex", flexDirection: "column",
        height: "calc(100vh - 64px)",
        background: C.bg, color: C.text,
        fontFamily: "Inter, sans-serif",
      }}>
        {/* Header */}
        <div style={{
          flexShrink: 0,
          padding: "16px 24px",
          background: C.bg2,
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.ai}, #8B0000)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 18, color: "#fff",
                boxShadow: `0 0 24px ${C.ai}55`,
              }}>N</div>
              <span style={{
                position: "absolute", bottom: 0, right: 0,
                width: 12, height: 12, borderRadius: "50%",
                background: C.success, border: `2px solid ${C.bg2}`,
                animation: "nidhiPulse 2s ease-in-out infinite",
              }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>CFO Fynny</div>
              <div style={{ fontSize: 12, color: C.textDim }}>Monitoring your business · Live</div>
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 999,
            background: "rgba(196,30,30,0.1)", border: `1px solid ${C.ai}55`,
            fontSize: 12, fontWeight: 500, color: C.ai,
          }}>
            <Sparkles size={14} />
            AI-Powered
          </div>
        </div>

        {/* Messages */}
        <div className="nidhi-scroll" style={{
          flex: 1, overflowY: "auto",
          padding: "24px clamp(16px, 4vw, 32px)",
        }}>
          <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
            <AnimatePresence initial={false}>
              {messages.map(m => <MessageBubble key={m.id} message={m} />)}
            </AnimatePresence>

            {isThinking && (
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <Avatar />
                <div style={{
                  padding: "14px 18px", borderRadius: "4px 14px 14px 14px",
                  background: C.card, border: `1px solid ${C.border}`,
                  display: "flex", gap: 6, alignItems: "center",
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 7, height: 7, borderRadius: "50%", background: C.ai,
                      animation: `nidhiTyping 1.2s ease-in-out ${i * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            {showSuggestions && messages.length <= 1 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                  Try asking
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 8,
                }}>
                  {suggestions.map((s, i) => (
                    <SuggestionButton key={i} suggestion={s} onClick={handleSuggestionClick} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div style={{
          flexShrink: 0,
          padding: "16px clamp(16px, 4vw, 24px)",
          background: C.bg2,
          borderTop: `1px solid ${C.border}`,
        }}>
          <div style={{ maxWidth: 880, margin: "0 auto" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  ref={inputRef}
                  className="nidhi-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                  placeholder="Ask CFO Fynny anything about your business..."
                  disabled={isThinking}
                  style={{
                    width: "100%", height: 52,
                    padding: "0 20px",
                    background: C.card,
                    border: `2px solid ${C.ai}44`,
                    borderRadius: 12,
                    color: C.text, fontSize: 16, fontFamily: "Inter, sans-serif",
                    outline: "none",
                    transition: "border-color 0.2s",
                    opacity: isThinking ? 0.6 : 1,
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = C.ai; }}
                  onBlur={e => { e.currentTarget.style.borderColor = `${C.ai}44`; }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                style={{
                  height: 52, padding: "0 22px",
                  display: "flex", alignItems: "center", gap: 8,
                  background: input.trim() && !isThinking ? C.ai : "rgba(255,255,255,0.06)",
                  color: input.trim() && !isThinking ? "#fff" : C.textMuted,
                  border: "none", borderRadius: 12,
                  fontSize: 14, fontWeight: 600,
                  cursor: input.trim() && !isThinking ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  boxShadow: input.trim() && !isThinking ? `0 4px 16px ${C.ai}55` : "none",
                }}
              >
                {isThinking ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span style={{ display: "none" }} className="nidhi-send-label">Send</span>
              </button>
            </div>

            {/* Quick actions */}
            <div style={{
              marginTop: 12,
              display: "flex", flexWrap: "wrap", gap: 8,
            }}>
              {quickActions.map(a => <QuickActionChip key={a.label} label={a.label} icon={a.icon} />)}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ===== Sub-components =====
function Avatar() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${C.ai}, #8B0000)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: 14, color: "#fff",
    }}>N</div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAI = message.role === "assistant";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: "flex", gap: 12,
        flexDirection: isAI ? "row" : "row-reverse",
        alignItems: "flex-start",
      }}
    >
      {isAI ? <Avatar /> : (
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: "rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 600, fontSize: 13, color: C.text,
        }}>You</div>
      )}

      <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 10, alignItems: isAI ? "flex-start" : "flex-end" }}>
        <div style={{
          padding: "14px 18px",
          borderRadius: isAI ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
          background: isAI ? C.card : C.ai,
          border: isAI ? `1px solid ${C.border}` : "none",
          color: isAI ? C.text : "#fff",
          fontSize: 16, lineHeight: 1.6,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {message.content}
        </div>

        {message.cards && message.cards.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10, width: "100%",
          }}>
            {message.cards.map((c, i) => <ContextCardComponent key={i} card={c} />)}
          </div>
        )}

        <div style={{ fontSize: 12, color: C.textMuted }}>
          {message.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </motion.div>
  );
}

function ContextCardComponent({ card }: { card: ContextCard }) {
  if (card.type === "metric") {
    const v = card.data.value;
    const display = typeof v === "number" && v > 1000
      ? `₹${(v / 100000).toFixed(1)}L`
      : `${v}${card.data.unit ? "" : ""}`;
    return (
      <div style={{
        padding: 16, borderRadius: 10,
        background: C.card, border: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ fontSize: 12, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.5 }}>{card.title}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{display}</span>
          {card.data.unit && <span style={{ fontSize: 14, color: C.textDim }}>{card.data.unit}</span>}
        </div>
        {card.data.change !== undefined && (
          <div style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: 13, fontWeight: 600,
            color: card.data.change > 0 ? C.success : C.critical,
          }}>
            {card.data.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(card.data.change)}%
          </div>
        )}
      </div>
    );
  }

  if (card.type === "alert") {
    const color = card.data.severity === "critical" ? C.critical : C.warning;
    return (
      <div style={{
        padding: 16, borderRadius: 10,
        background: `${color}10`, border: `1px solid ${color}55`,
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} color={color} />
          <span style={{ fontSize: 13, fontWeight: 600, color }}>{card.title}</span>
        </div>
        <div style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>{card.data.message}</div>
        {card.data.action && (
          <button style={{
            marginTop: 4, alignSelf: "flex-start",
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 6,
            background: color, color: "#fff", border: "none",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            {card.data.action}
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    );
  }

  if (card.type === "action") {
    return (
      <div style={{
        padding: 16, borderRadius: 10,
        background: C.card, border: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", gap: 10,
        gridColumn: "1 / -1",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{card.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {card.data.actions.map((a: string, i: number) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: C.textDim, lineHeight: 1.5 }}>
              <CheckCircle2 size={14} color={C.success} style={{ marginTop: 3, flexShrink: 0 }} />
              <span>{a}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

function SuggestionButton({ suggestion, onClick }: { suggestion: string; onClick: (s: string) => void }) {
  return (
    <button
      onClick={() => onClick(suggestion)}
      style={{
        padding: "12px 14px",
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 10, color: C.text,
        fontSize: 14, fontWeight: 500, fontFamily: "Inter, sans-serif",
        cursor: "pointer", textAlign: "left",
        display: "flex", alignItems: "center", gap: 8,
        transition: "all 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${C.ai}88`; e.currentTarget.style.background = "rgba(196,30,30,0.06)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}
    >
      <MessageCircle size={14} color={C.ai} style={{ flexShrink: 0 }} />
      <span style={{ wordBreak: "break-word" }}>{suggestion}</span>
    </button>
  );
}

function QuickActionChip({ label, icon: Icon }: { label: string; icon: any }) {
  return (
    <button style={{
      display: "flex", alignItems: "center", gap: 6,
      padding: "6px 12px", borderRadius: 999,
      background: C.card, border: `1px solid ${C.border}`,
      color: C.textDim, fontSize: 12, fontWeight: 500,
      cursor: "pointer", transition: "all 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = `${C.ai}66`; }}
    onMouseLeave={e => { e.currentTarget.style.color = C.textDim; e.currentTarget.style.borderColor = C.border; }}
    >
      <Plus size={12} />
      <Icon size={12} />
      {label}
    </button>
  );
}
