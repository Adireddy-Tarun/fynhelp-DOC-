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
    content: "Good morning! I'm Nidhi, your AI CFO. I've been monitoring your business overnight. Here's a quick update:\n\n• Your cash runway is 52 days — down 8 days from last week\n• ABC Electronics owes ₹8.4L, now 62 days overdue\n• Your GSTR-3B is due in 8 days — data is ready for review\n\nWhat would you like to know?",
    timestamp: "8:03 AM",
  },
];

const NidhiChatPage = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("EN");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulated Nidhi response
    setTimeout(() => {
      const responses: Record<string, string> = {
        "What's my cash position?": "Your current cash position:\n\n• Bank balance: ₹12.4L (HDFC CA)\n• Available cash after commitments: ₹8.2L\n• Runway at current burn: 52 days\n• Cash in (expected this week): ₹3.1L from Sharma & Sons\n• Cash out (scheduled): ₹3.4L to Raj Textiles (Thursday)\n\nNet position is stable but your runway is in the amber zone. I recommend chasing ABC Electronics today.",
        "Who hasn't paid me this month?": "Here are your overdue receivables this month:\n\n1. ABC Electronics — ₹8.4L, 62 days overdue (HIGH RISK)\n2. Sharma & Sons — ₹3.1L, 38 days overdue (MEDIUM)\n3. Delhi Distributors — ₹5.7L, 12 days overdue (LOW)\n\nTotal overdue: ₹17.2L\nCollecting just ABC Electronics would add 15 days to your runway.\n\nShall I draft WhatsApp reminders for all three?",
        default: "Let me look into that for you. Based on your current business data, I can see several relevant factors. Would you like me to break this down in more detail, or would you prefer a summary with action items?",
      };

      const nidhi: Message = {
        role: "nidhi",
        content: responses[input] || responses.default,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, nidhi]);
    }, 1200);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-fyn-ink-10">
          <div className="w-10 h-10 rounded-full bg-fyn-red flex items-center justify-center text-white font-bold">N</div>
          <div className="flex-1">
            <p className="text-fyn-ink font-serif text-lg">Nidhi</p>
            <p className="text-fyn-success text-xs">● Live — monitoring your business</p>
          </div>
          <div className="flex gap-1">
            {["EN", "HI", "GU", "TA", "MR"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs px-2 py-1 rounded ${lang === l ? "bg-fyn-ink text-white" : "text-fyn-ink/40 hover:bg-fyn-ink/5"}`}
              >{l}</button>
            ))}
          </div>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => { setInput(p); }}
              className="bg-fyn-beige-dark border border-fyn-ink-10 text-fyn-ink/60 text-xs px-3 py-1.5 rounded-full hover:border-fyn-ink/30 hover:text-fyn-ink"
            >{p}</button>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] ${m.role === "user" ? "order-1" : ""}`}>
                {m.role === "nidhi" && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-fyn-red flex items-center justify-center text-white text-xs font-bold">N</div>
                    <span className="text-fyn-ink/30 text-xs">{m.timestamp}</span>
                  </div>
                )}
                {m.role === "user" && (
                  <div className="flex items-center gap-2 mb-1 justify-end">
                    <span className="text-fyn-ink/30 text-xs">{m.timestamp}</span>
                  </div>
                )}
                <div className={`rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "nidhi" ? "bg-fyn-beige-dark border border-fyn-ink-10 text-fyn-ink/80" : "bg-fyn-ink text-white/90"
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask Nidhi anything about your business..."
            className="flex-1 h-11 px-4 bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg text-sm text-fyn-ink focus:outline-none focus:ring-2 focus:ring-fyn-red"
            aria-label="Message Nidhi"
          />
          <button onClick={sendMessage} className="bg-fyn-red text-white px-6 rounded-lg font-medium hover:opacity-90 transition-opacity">Send</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NidhiChatPage;
