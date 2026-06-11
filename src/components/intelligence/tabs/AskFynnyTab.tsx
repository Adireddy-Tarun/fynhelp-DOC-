import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { IntelCard, ACCENT, Badge } from "../_primitives";

const QUICK_PROMPTS = [
  "What's my runway?",
  "Who are my top 3 overdue customers?",
  "Where should I cut costs?",
  "How's my GST compliance?",
  "Should I raise the next round?",
];

const WELCOME = "Hi, I'm Fynny — your virtual CFO. Ask me anything about your cash, revenue, costs, taxes, or growth. I see your live financial data in real time.";

type Msg = { role: "user" | "assistant"; text: string };

export default function AskFynnyTab() {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: WELCOME }]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "assistant", text: "Based on your data: your runway is 4.6 months at the current burn. Top concern: receivables — ₹3.72L overdue past 60 days. Call your top 3 overdue customers this week to free up working capital." }]);
    setInput("");
  };

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-4">
      <IntelCard className="!p-0" title={undefined}>
        <div className="px-5 py-3 border-b border-[rgba(26,16,8,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT.red}, ${ACCENT.redLight})` }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-serif text-base font-semibold text-fyn-ink">Fynny — Virtual CFO</p>
              <p className="text-[11px] text-[#6B6B6B]">Powered by Lovable AI</p>
            </div>
          </div>
          <Badge tone="green">● ONLINE</Badge>
        </div>

        <div className="p-5 space-y-3 min-h-[420px] max-h-[520px] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-lg text-sm ${m.role === "user" ? "text-white" : "text-fyn-ink"}`}
                style={m.role === "user" ? { background: ACCENT.red } : { background: "rgba(26,16,8,0.04)" }}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[rgba(26,16,8,0.08)] flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask Fynny anything…"
            className="flex-1 px-3 py-2 text-sm bg-white rounded-md focus:outline-none focus:ring-2"
            style={{ border: "1px solid rgba(26,16,8,0.12)" }}
          />
          <button onClick={() => send(input)} className="px-3 rounded-md text-white" style={{ background: ACCENT.red }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </IntelCard>

      <div className="space-y-3">
        <IntelCard title="Quick Actions">
          <div className="space-y-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                className="w-full text-left text-xs px-3 py-2 rounded-md text-fyn-ink transition-colors"
                style={{ background: "rgba(26,16,8,0.04)" }}
              >
                {p}
              </button>
            ))}
          </div>
        </IntelCard>

        <IntelCard title="Today's Briefing">
          <ul className="space-y-2 text-xs text-fyn-ink">
            <li>• Cash: ₹45.3L (4.6 mo runway)</li>
            <li>• 6 overdue invoices, ₹4.8L outstanding</li>
            <li>• GSTR-3B due in 3 days</li>
            <li>• Top customer: ENT Corp ₹12.4L</li>
          </ul>
        </IntelCard>
      </div>
    </div>
  );
}
