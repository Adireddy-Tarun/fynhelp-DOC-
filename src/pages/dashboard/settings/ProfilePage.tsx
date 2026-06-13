import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const RED = "#A93838";
const BORDER = "#E0D9C8";

const Card = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => (
  <div className="bg-card border rounded-lg p-6 mb-6 animate-fade-in" style={{ borderColor: BORDER }}>
    <h3 className="font-semibold text-[15px]" style={{ color: "#1A1008" }}>{title}</h3>
    {sub && <p className="text-[12px] mt-1" style={{ color: "rgba(26,16,8,0.60)" }}>{sub}</p>}
    <div className="mt-4 space-y-4">{children}</div>
  </div>
);

const inputCls = "w-full h-10 px-3 rounded-md border bg-card text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A93838]/30";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#1A1008" }}>{label}</label>
    {children}
  </div>
);

const ProfilePage = () => {
  const { profile, user } = useAuth();
  const [firstName, setFirstName] = useState(profile?.full_name?.split(" ")[0] ?? "");
  const [lastName, setLastName] = useState(profile?.full_name?.split(" ").slice(1).join(" ") ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const initials = ((firstName[0] || "") + (lastName[0] || "")).toUpperCase() || "U";

  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: "#1A1008" }}>Personal Information</h2>
      <p className="text-[13px] mb-6" style={{ color: "rgba(26,16,8,0.60)" }}>Update your name, email and contact details.</p>

      <Card title="Profile">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
            style={{ background: "rgba(169,56,56,0.12)", color: RED }}>{initials}</div>
          <button className="text-[13px] font-medium" style={{ color: RED }}
            onClick={() => toast("Photo upload coming soon")}>Change photo →</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name"><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} style={{ borderColor: BORDER }} /></Field>
          <Field label="Last name"><input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} style={{ borderColor: BORDER }} /></Field>
        </div>
        <Field label="Email address"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} style={{ borderColor: BORDER }} /></Field>
        <Field label="Phone number"><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputCls} style={{ borderColor: BORDER }} /></Field>
        <button className="px-5 py-2.5 rounded-md text-sm font-semibold text-white" style={{ background: RED }}
          onClick={() => toast.success("Profile updated")}>Save changes</button>
      </Card>

      <Card title="Role & Access">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Role"><input disabled value={profile?.role || "owner"} className={inputCls} style={{ borderColor: BORDER, background: "#FAF7F0", textTransform: "capitalize" }} /></Field>
          <Field label="Access level"><input disabled value="Admin" className={inputCls} style={{ borderColor: BORDER, background: "#FAF7F0" }} /></Field>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
