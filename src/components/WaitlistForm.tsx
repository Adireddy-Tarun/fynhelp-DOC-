import { useState, FormEvent } from "react";

const WAITLIST_FN_URL =
  "https://wiknwxniwqvsxgyzqqxu.supabase.co/functions/v1/waitlist-signup";

const COMPANY_TYPES = [
  "E-commerce & D2C",
  "SaaS & Technology",
  "Manufacturing",
  "Professional Services",
  "Healthcare",
  "Education",
  "Retail",
  "Other",
];

const COMPANY_SIZES = ["1-10", "10-50", "50-100", "100-250", "250+"];

type FormData = {
  email: string;
  name: string;
  company_name: string;
  phone: string;
  company_type: string;
  company_size: string;
  location: string;
};

const initial: FormData = {
  email: "",
  name: "",
  company_name: "",
  phone: "",
  company_type: "",
  company_size: "",
  location: "",
};

type Variant = "light" | "dark";

interface WaitlistFormProps {
  variant?: Variant;
  /** Show only the most-essential fields (email, name, company). */
  compact?: boolean;
  className?: string;
}

export default function WaitlistForm({
  variant = "light",
  compact = false,
  className = "",
}: WaitlistFormProps) {
  const [data, setData] = useState<FormData>(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({
    type: "",
    text: "",
  });

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setData((p) => ({ ...p, [field]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const email = data.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(WAITLIST_FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, email: email.toLowerCase() }),
      });
      const body = await res.json().catch(() => ({}));

      if (res.ok && (body?.success ?? true)) {
        setMessage({
          type: "success",
          text: "✅ Successfully joined! Check your email.",
        });
        setData(initial);
      } else {
        setMessage({
          type: "error",
          text: body?.error || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  const isDark = variant === "dark";

  const inputCls = isDark
    ? "w-full px-4 py-3 rounded-lg border border-white/30 bg-white text-fyn-ink placeholder-fyn-ink/50 text-sm focus:outline-none focus:ring-4 focus:ring-white/40 disabled:opacity-60"
    : "w-full px-4 py-3 rounded-lg border border-fyn-ink/15 bg-white text-fyn-ink placeholder-fyn-ink/40 text-sm focus:outline-none focus:border-fyn-red focus:ring-2 focus:ring-fyn-red/20 transition-all";

  const labelCls = isDark
    ? "block text-sm font-medium text-white mb-1.5"
    : "block text-sm font-medium text-fyn-ink mb-1.5";

  const buttonCls = isDark
    ? "w-full inline-flex items-center justify-center gap-2 bg-white text-fyn-ink font-bold text-base md:text-lg px-10 py-4 rounded-lg shadow-md hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/60 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
    : "w-full font-semibold text-white py-3.5 rounded-lg bg-fyn-red transition-all duration-200 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed";

  const helperCls = isDark
    ? "text-white/70 text-xs text-center pt-1"
    : "text-xs text-fyn-ink/50 text-center pt-1";

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wl-email" className={labelCls}>
            Email <span className={isDark ? "text-white" : "text-fyn-red"}>*</span>
          </label>
          <input
            id="wl-email"
            type="email"
            required
            value={data.email}
            onChange={set("email")}
            placeholder="you@company.com"
            className={inputCls}
            disabled={loading}
            maxLength={255}
          />
        </div>

        <div>
          <label htmlFor="wl-name" className={labelCls}>Name</label>
          <input
            id="wl-name"
            type="text"
            value={data.name}
            onChange={set("name")}
            placeholder="Your full name"
            className={inputCls}
            disabled={loading}
            maxLength={100}
          />
        </div>
      </div>

      {!compact && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="wl-company" className={labelCls}>Company Name</label>
              <input
                id="wl-company"
                type="text"
                value={data.company_name}
                onChange={set("company_name")}
                placeholder="Your company"
                className={inputCls}
                disabled={loading}
                maxLength={150}
              />
            </div>
            <div>
              <label htmlFor="wl-phone" className={labelCls}>Phone Number</label>
              <input
                id="wl-phone"
                type="tel"
                value={data.phone}
                onChange={set("phone")}
                placeholder="9876543210"
                className={inputCls}
                disabled={loading}
                maxLength={20}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="wl-ctype" className={labelCls}>Company Type</label>
              <select
                id="wl-ctype"
                value={data.company_type}
                onChange={set("company_type")}
                className={inputCls}
                disabled={loading}
              >
                <option value="">Select company type</option>
                {COMPANY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="wl-csize" className={labelCls}>Company Size</label>
              <select
                id="wl-csize"
                value={data.company_size}
                onChange={set("company_size")}
                className={inputCls}
                disabled={loading}
              >
                <option value="">Select company size</option>
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="wl-loc" className={labelCls}>Location / City</label>
            <input
              id="wl-loc"
              type="text"
              value={data.location}
              onChange={set("location")}
              placeholder="Bengaluru"
              className={inputCls}
              disabled={loading}
              maxLength={100}
            />
          </div>
        </>
      )}

      <button type="submit" disabled={loading} className={buttonCls}>
        {loading ? "Joining..." : "Join the Waitlist →"}
      </button>

      {message.text && (
        <p
          role="status"
          aria-live="polite"
          className={
            message.type === "success"
              ? isDark
                ? "text-sm font-medium text-center text-white bg-white/15 py-2.5 px-3 rounded-lg"
                : "text-green-600 text-sm mt-2 text-center"
              : isDark
                ? "text-sm font-medium text-center text-white bg-black/20 py-2.5 px-3 rounded-lg"
                : "text-red-600 text-sm mt-2 text-center"
          }
        >
          {message.text}
        </p>
      )}

      <p className={helperCls}>
        No spam. We'll only email you about FYNHelp launch updates.
      </p>
    </form>
  );
}
