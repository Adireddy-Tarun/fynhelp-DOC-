const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
import { z } from "npm:zod@3.23.8";

const RESEND_API_URL = "https://api.resend.com";

const BodySchema = z.object({
  name: z.string().min(1).max(150),
  email: z.string().email().max(255),
  position: z.number().int().positive(),
  companyType: z.string().max(100).optional(),
  companySize: z.string().max(50).optional(),
  location: z.string().max(150).optional(),
});

function buildEmail(name: string, position: number) {
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const subject = `You're in. Founder #${position} of 100 — Welcome to FYNHelp 🎉`;
  const text = `Hi ${firstName},

You're officially one of the first 100 founders to get early access to FYNHelp.

Free. For 6 months. No catches. No credit card. Just you, your business, and an AI CFO who actually shows up.

---

Before we tell you what FYNHelp does, let us tell you why we built it.

A few years ago, Tarun and Nidhi — the two humans behind FYNHelp — were running Dark Capital. An elite, luxury, sugar-free chocolate company. Sounds fancy. It was. Until it wasn't.

We had orders. We had customers. We had a brand we were genuinely proud of.

What we didn't have — was any idea where our money was going.

We had cash in the account one week. Then we didn't. And we had absolutely no explanation for why. Our Razorpay dashboard said one thing. Our bank said another. Our brain said "maybe it's fine?"

It was not fine.

We had a CA. A very talented CA. Who we are convinced was also managing the social calendars of seventeen other businesses, a wedding, and possibly a small government. Because when we had a financial crisis at 11pm on a Tuesday — which, by the way, financial crises exclusively happen at 11pm on Tuesdays — he was unavailable. For three days.

He sent us a report on Day 4. The problem had already solved itself. Badly.

We had an accountant who we somehow expected to be a CFO, a financial therapist, and a fortune teller. That's not fair to him. That's not fair to us. And that's not how a business should run.

Dark Capital closed.

Not because the product wasn't good. Not because the market wasn't there. But because we were flying completely blind — financially. We had money. We had no intelligence about that money. And by the time we had clarity, it was too late to act on it.

That moment is why FYNHelp exists.

Because we genuinely believe that if we'd had real-time financial intelligence — not reports, not spreadsheets, not a CA who replies after the fire is out — Dark Capital might still be alive today.

We built the AI CFO we desperately needed back then. We named her Nidhi.

She doesn't ghost you. She doesn't send reports 3 days late. She doesn't sleep. And she will never, ever make you feel stupid for not knowing your burn rate at 11pm on a Tuesday.

---

As one of our first 100 founders, here's what you get:

✦ Full access to FYNHelp — free for 6 months
✦ Founding Member badge — permanently on your account
✦ Direct line to us — Tarun and Nidhi — for feedback, feature requests, and the occasional rant about CAs
✦ Locked-in early adopter pricing when we go paid — forever

---

We're not building another accounting tool.
We're not building another dashboard.
We're building the financial intelligence layer that every Indian founder deserved but could never afford.

You're one of the first 100 people who believed in that before anyone else did.

That means something to us. More than you know.

Welcome to FYNHelp. Nidhi is ready when you are.

→ Access Your Dashboard - Coming Week of May 15

With gratitude (and mild sleep deprivation),
Tarun & Nidhi
Co-Founders, FYNHelp

P.S. — If you have a CA who ghosts you too, tell us. We have a support group. It's called FYNHelp. You're already in it.`;

  const html = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;color:#1A1008;background:#F9F7F4;padding:32px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;border:1px solid rgba(26,16,8,0.08);">
<p style="font-size:16px;line-height:1.6;">Hi <strong>${firstName}</strong>,</p>
<p style="font-size:16px;line-height:1.6;">You're officially <strong>founder #${position} of 100</strong> to get early access to FYNHelp.</p>
<p style="font-size:16px;line-height:1.6;">Free. For 6 months. No catches. No credit card. Just you, your business, and an AI CFO who actually shows up.</p>
<hr style="border:none;border-top:1px solid rgba(26,16,8,0.1);margin:24px 0;">
<pre style="font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#1A1008;white-space:pre-wrap;word-wrap:break-word;">${text
    .split("\n\n")
    .slice(2)
    .join("\n\n")
    .replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!))}</pre>
<p style="margin-top:32px;color:#8B6914;font-size:13px;">— Tarun &amp; Nidhi, Co-Founders, FYNHelp</p>
</div></body></html>`;

  return { subject, text, html };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const json = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, email, position } = parsed.data;
    const { subject, text, html } = buildEmail(name, position);

    const response = await fetch(`${RESEND_API_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Tarun & Nidhi <onboarding@resend.dev>",
        to: [email],
        subject,
        text,
        html,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Resend error", response.status, data);
      return new Response(
        JSON.stringify({ error: `Email send failed [${response.status}]`, details: data }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("send-waitlist-email error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
