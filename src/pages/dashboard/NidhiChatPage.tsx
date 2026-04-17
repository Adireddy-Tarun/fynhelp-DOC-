import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";

interface Message {
  role: "user" | "nidhi";
  content: string;
  timestamp: string;
}

const quickPrompts = [
  "What's my cash position?",
  "Who hasn't paid me this month?",
  "When is my next GST due?",
  "Simulate hiring 2 people",
  "What's my biggest financial risk right now?",
  "Generate my monthly CFO report",
];

const initialMessages: Message[] = [
  {
    role: "nidhi",
    content: "Good morning! I'm AI CFO Nidhi, your AI CFO. I've been monitoring your business overnight. Here's a quick update:\n\n• Your cash runway is 52 days — down 8 days from last week\n• ABC Electronics owes ₹8.4L, now 62 days overdue\n• Your GSTR-3B is due in 8 days — data is ready for review\n\nWhat would you like to know?",
    timestamp: "8:03 AM",
  },
];

const responses: Record<string, string> = {
  "What's my cash position?": "Your current cash position:\n\n• Bank balance: ₹12.4L (HDFC CA)\n• Available cash after commitments: ₹8.2L\n• Runway at current burn: 52 days\n• Cash in (expected this week): ₹3.1L from Sharma & Sons\n• Cash out (scheduled): ₹3.4L to Raj Textiles (Thursday)\n\nNet position is stable but your runway is in the amber zone. I recommend chasing ABC Electronics today.",
  "Who hasn't paid me this month?": "Here are your overdue receivables this month:\n\n1. ABC Electronics — ₹8.4L, 62 days overdue (HIGH RISK)\n2. Sharma & Sons — ₹3.1L, 38 days overdue (MEDIUM)\n3. Delhi Distributors — ₹5.7L, 12 days overdue (LOW)\n\nTotal overdue: ₹17.2L\nCollecting just ABC Electronics would add 15 days to your runway.\n\nShall I draft WhatsApp reminders for all three?",
  default: "Let me look into that for you. Based on your current business data, I can see several relevant factors. Would you like me to break this down in more detail, or would you prefer a summary with action items?",
};

const NidhiChatPage = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("EN");
  const [isTyping, setIsTyping] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    const currentInput = input;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const fullText = responses[currentInput] || responses.default;
      setIsStreaming(true);
      setStreamingText("");

      let idx = 0;
      const interval = setInterval(() => {
        idx++;
        setStreamingText(fullText.slice(0, idx));
        if (idx >= fullText.length) {
          clearInterval(interval);
          setIsStreaming(false);
          setStreamingText("");
          const nidhi: Message = {
            role: "nidhi",
            content: fullText,
            timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, nidhi]);
        }
      }, 15);
    }, 1200);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
        {/* Header bar */}
        <div className="flex items-center gap-3 px-8 flex-shrink-0" style={{ height: 64, background: "#1A1008" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#C41E1E", fontSize: 14 }}>N</div>
          <div className="flex-1">
            <p className="text-white font-serif" style={{ fontSize: 16 }}>AI CFO Nidhi</p>
            <p style={{ color: "#4ADE80", fontSize: 12 }}>● Live — monitoring your business</p>
          </div>
          <div className="flex gap-1">
            {["EN", "HI", "GU", "TA", "MR"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="transition-colors"
                style={{
                  fontSize: 12, padding: "4px 8px", borderRadius: 4,
                  background: lang === l ? "rgba(255,255,255,0.15)" : "transparent",
                  color: lang === l ? "#FFFFFF" : "rgba(255,255,255,0.40)",
                }}
              >{l}</button>
            ))}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto" style={{ background: "#FAF7F0", padding: "24px 32px" }}>
          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2 mb-6">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => setInput(p)}
                className="transition-all"
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #E0D9C8",
                  borderRadius: 100,
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#1A1008",
                  cursor: "pointer",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#C41E1E";
                  e.currentTarget.style.color = "#C41E1E";
                  e.currentTarget.style.background = "#FDF2F1";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#E0D9C8";
                  e.currentTarget.style.color = "#1A1008";
                  e.currentTarget.style.background = "#FFFFFF";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >{p}</button>
            ))}
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div style={{ maxWidth: m.role === "user" ? "60%" : "70%" }}>
                  {m.role === "nidhi" && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#C41E1E", fontSize: 14 }}>N</div>
                      <span style={{ color: "#8B6914", fontSize: 12, fontWeight: 500 }}>AI CFO Nidhi</span>
                      <span style={{ color: "rgba(26,16,8,0.30)", fontSize: 12 }}>{m.timestamp}</span>
                    </div>
                  )}
                  {m.role === "user" && (
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <span style={{ color: "rgba(26,16,8,0.30)", fontSize: 12 }}>{m.timestamp}</span>
                    </div>
                  )}
                  <div
                    className="whitespace-pre-wrap"
                    style={{
                      borderRadius: m.role === "nidhi" ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                      padding: "12px 16px",
                      fontSize: 14,
                      lineHeight: 1.7,
                      background: m.role === "nidhi" ? "#FFFFFF" : "#1A1008",
                      color: m.role === "nidhi" ? "#1A1008" : "#FFFFFF",
                      border: m.role === "nidhi" ? "1px solid #E0D9C8" : "none",
                      boxShadow: m.role === "nidhi" ? "0 1px 4px rgba(26,16,8,0.06)" : "none",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {isStreaming && streamingText && (
              <div className="flex justify-start">
                <div style={{ maxWidth: "70%" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#C41E1E", fontSize: 14 }}>N</div>
                    <span style={{ color: "#8B6914", fontSize: 12, fontWeight: 500 }}>AI CFO Nidhi</span>
                  </div>
                  <div
                    className="whitespace-pre-wrap"
                    style={{
                      borderRadius: "4px 12px 12px 12px",
                      padding: "12px 16px",
                      fontSize: 14,
                      lineHeight: 1.7,
                      background: "#FFFFFF",
                      color: "#1A1008",
                      border: "1px solid #E0D9C8",
                      boxShadow: "0 1px 4px rgba(26,16,8,0.06)",
                    }}
                  >
                    {streamingText}
                    <span className="inline-block" style={{ borderRight: "2px solid #C41E1E", animation: "blink 800ms step-end infinite", marginLeft: 1, height: "1em" }}>&nbsp;</span>
                  </div>
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div style={{ maxWidth: "70%" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "#C41E1E", fontSize: 14 }}>N</div>
                  </div>
                  <div style={{
                    borderRadius: "4px 12px 12px 12px",
                    padding: "12px 16px",
                    background: "#FFFFFF",
                    border: "1px solid #E0D9C8",
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}>
                    <span className="typing-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#C41E1E", display: "inline-block" }} />
                    <span className="typing-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#C41E1E", display: "inline-block" }} />
                    <span className="typing-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#C41E1E", display: "inline-block" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 flex items-center gap-3" style={{ padding: "16px 32px", background: "#FFFFFF", borderTop: "1px solid #E0D9C8", height: 80 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask AI CFO Nidhi anything about your business..."
            className="flex-1 outline-none"
            style={{
              height: 48,
              padding: "12px 16px",
              border: "1.5px solid #E0D9C8",
              borderRadius: 8,
              fontSize: 14,
              color: "#1A1008",
              background: "#FFFFFF",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "#C41E1E"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#E0D9C8"; }}
            aria-label="Message AI CFO Nidhi"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="flex items-center justify-center transition-all"
            style={{
              width: 48,
              height: 48,
              borderRadius: 6,
              background: input.trim() ? "#C41E1E" : "#E0D9C8",
              color: "#FFFFFF",
              fontSize: 20,
              fontWeight: 700,
              cursor: input.trim() ? "pointer" : "not-allowed",
            }}
          >→</button>
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(26,16,8,0.35)", padding: "4px 0 8px", background: "#FFFFFF" }}>Press Enter to send · Shift+Enter for new line</p>
      </div>
    </DashboardLayout>
  );
};

export default NidhiChatPage;
