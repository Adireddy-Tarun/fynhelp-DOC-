import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Rocket, CheckCircle2 } from "lucide-react";
import { z } from "zod";

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

const waitlistSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(20),
  companyName: z.string().trim().min(1, "Company name is required").max(150),
  companyType: z.string().refine((v) => COMPANY_TYPES.includes(v), "Please select a company type"),
  companySize: z.string().refine((v) => COMPANY_SIZES.includes(v), "Please select a company size"),
  location: z.string().trim().min(1, "Location is required").max(100),
});

type FormData = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  companyType: string;
  companySize: string;
  location: string;
};

const initialForm: FormData = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  companyType: "",
  companySize: "",
  location: "",
};

export default function WaitlistPage() {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [position, setPosition] = useState<number | null>(null);

  const update = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const parsed = waitlistSchema.safeParse(formData);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first?.message ?? "Please fill in all fields correctly");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check duplicate + get count via secure RPC
      const { data: status, error: statusErr } = await supabase.rpc(
        "check_waitlist_status",
        { _email: parsed.data.email }
      );
      if (statusErr) throw statusErr;

      const row = Array.isArray(status) ? status[0] : status;
      if (row?.email_exists) {
        toast.error("This email is already on the waitlist");
        setIsSubmitting(false);
        return;
      }

      const newPosition = Number(row?.total_count ?? 0) + 1;

      const { error: insertError } = await supabase.from("waitlist").insert({
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        company_name: parsed.data.companyName,
        company_type: parsed.data.companyType,
        company_size: parsed.data.companySize,
        location: parsed.data.location,
        position: newPosition,
        is_converted: false,
      });
      if (insertError) throw insertError;

      setPosition(newPosition);
      setShowSuccess(true);
      toast.success(`You're #${newPosition} on the waitlist!`);

      // Trigger welcome email and surface a follow-up toast based on the result
      const emailToastId = toast.loading("Sending your welcome email…");
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          "send-waitlist-email",
          {
            body: {
              name: parsed.data.name,
              email: parsed.data.email.toLowerCase(),
              position: newPosition,
              companyType: parsed.data.companyType,
              companySize: parsed.data.companySize,
              location: parsed.data.location,
            },
          }
        );

        if (emailError) {
          // FunctionsHttpError exposes the response on .context — try to read the JSON body
          let serverMsg: string | undefined;
          try {
            const ctx = (emailError as { context?: Response }).context;
            if (ctx && typeof ctx.json === "function") {
              const body = await ctx.clone().json();
              serverMsg = body?.error;
            }
          } catch {
            /* ignore */
          }
          console.warn("Welcome email failed:", emailError, serverMsg);
          toast.error(serverMsg ?? "Welcome email failed to send. We'll retry shortly.", {
            id: emailToastId,
            description: "Your spot is saved — only the email had a hiccup.",
          });
        } else if (emailData && (emailData as { success?: boolean }).success === false) {
          const msg = (emailData as { error?: string }).error ?? "Welcome email could not be sent.";
          toast.error(msg, {
            id: emailToastId,
            description: "Your spot is saved — only the email had a hiccup.",
          });
        } else {
          toast.success("Welcome email sent — check your inbox.", { id: emailToastId });
        }
      } catch (emailErr) {
        console.warn("Welcome email error:", emailErr);
        toast.error("Welcome email failed to send.", {
          id: emailToastId,
          description: "Your spot is saved — only the email had a hiccup.",
        });
      }
    } catch (error) {
      console.error("Waitlist error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <main
        className="min-h-screen py-16 px-6"
        style={{
          background:
            "linear-gradient(180deg, #F9F7F4 0%, #FFFFFF 60%, #F9F7F4 100%)",
        }}
      >
        <div className="mx-auto" style={{ maxWidth: 600 }}>
          {!showSuccess ? (
            <>
              <header className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-fyn-red/10 text-fyn-red mb-6">
                  <Rocket className="w-8 h-8" />
                </div>
                <h1
                  className="font-serif font-bold text-fyn-ink mb-3"
                  style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", lineHeight: 1.15 }}
                >
                  Be first in line when we launch
                </h1>
                <p className="text-fyn-ink/70 text-base md:text-lg">
                  First 100 users get FYNHelp free for 6 months.
                </p>
              </header>

              <div className="bg-white rounded-2xl border border-fyn-ink/10 shadow-sm p-6 md:p-8">
                <WaitlistFormShared
                  onSuccess={(pos) => {
                    setPosition(pos);
                    setShowSuccess(true);
                  }}
                />
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-fyn-ink/10 shadow-sm p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-fyn-success/10 text-fyn-success mb-6">
                <CheckCircle2 className="w-12 h-12" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif font-bold text-3xl md:text-4xl text-fyn-ink mb-3">
                You're in! 🎉
              </h2>
              <p className="text-fyn-ink/70 text-base md:text-lg mb-2">
                Check your email for next steps. We'll notify you when we launch.
              </p>
              {position !== null && position <= 100 && (
                <p className="text-fyn-red font-semibold text-lg mb-8">
                  You're founder #{position} of 100
                </p>
              )}
              {position !== null && position > 100 && (
                <p className="text-fyn-ink/60 text-sm mb-8">
                  You're #{position} on the waitlist
                </p>
              )}
              <Link
                to="/"
                className="inline-block bg-fyn-ink text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Visit FYNHelp
              </Link>
            </div>
          )}
        </div>
      </main>
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 50 }}>
        <Link
          to="/admin/login"
          style={{
            display: "inline-block",
            fontSize: 12,
            fontWeight: 600,
            color: "#fff",
            background: "hsl(var(--fyn-ink))",
            padding: "8px 14px",
            borderRadius: 8,
            textDecoration: "none",
            fontFamily: "DM Sans, sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          Admin Access →
        </Link>
      </div>
    </Layout>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-lg border border-fyn-ink/15 bg-white text-fyn-ink placeholder-fyn-ink/40 focus:outline-none focus:border-fyn-red focus:ring-2 focus:ring-fyn-red/20 transition-all text-sm";

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-fyn-ink mb-1.5"
      >
        {label} {required && <span className="text-fyn-red">*</span>}
      </label>
      {children}
    </div>
  );
}
