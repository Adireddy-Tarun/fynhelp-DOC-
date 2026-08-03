import { useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { Card, PageHeader } from "./AdminDashboardPage";
import { toast } from "sonner";

type Tab = "resources" | "glossary";

const RESOURCES: { id: string; title: string; type: string; category: string; date: string }[] = [];

const GLOSSARY: { id: string; term: string; definition: string; category: string; date: string }[] = [];

const TYPE_COLORS: Record<string, string> = { Video: "#9333EA", Template: "#3B82F6", Article: "#10B981" };

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("resources");
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div>
      <PageHeader title="Content Management" subtitle="Manage resources and glossary" />

      <div className="flex items-center gap-1 mb-5" style={{ borderBottom: "1px solid rgba(26,16,8,0.1)" }}>
        {(["resources", "glossary"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 capitalize"
            style={{
              fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14,
              color: tab === t ? "hsl(var(--fyn-ink))" : "hsl(var(--fyn-ink) / 0.5)",
              borderBottom: tab === t ? "3px solid #8B6914" : "3px solid transparent",
              marginBottom: -1,
            }}>
            {t === "resources" ? "Resources" : "Glossary"}
          </button>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => setEditorOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white"
          style={{ background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13 }}>
          <Plus size={14} /> {tab === "resources" ? "Add Resource" : "Add Term"}
        </button>
      </div>

      {tab === "resources" && (
        <Card>
          <Table headers={["Title", "Type", "Category", "Last Updated", ""]}>
            {RESOURCES.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", fontFamily: "Roboto, sans-serif", color: "hsl(var(--fyn-ink) / 0.5)" }}>No resources yet.</td></tr>
            )}
            {RESOURCES.map((r) => (
              <tr key={r.id} className="hover:bg-[hsl(var(--fyn-ink)/0.03)]" style={{ borderBottom: "1px solid rgba(26,16,8,0.05)" }}>
                <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink))", fontWeight: 500 }}>{r.title}</td>
                <td className="py-3 px-2"><span style={{ padding: "3px 9px", borderRadius: 6, fontWeight: 600, fontSize: 11, background: `${TYPE_COLORS[r.type] ?? "#8B6914"}20`, color: TYPE_COLORS[r.type] ?? "#8B6914" }}>{r.type}</span></td>
                <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{r.category}</td>
                <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.6)" }}>{r.date}</td>
                <td className="py-3 px-2"><RowActionsStub /></td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {tab === "glossary" && (
        <Card>
          <Table headers={["Term", "Definition", "Category", "Updated", ""]}>
            {GLOSSARY.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", fontFamily: "Roboto, sans-serif", color: "hsl(var(--fyn-ink) / 0.5)" }}>No glossary terms yet.</td></tr>
            )}
            {GLOSSARY.map((g) => (
              <tr key={g.id} className="hover:bg-[hsl(var(--fyn-ink)/0.03)]" style={{ borderBottom: "1px solid rgba(26,16,8,0.05)" }}>
                <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink))", fontWeight: 600, fontFamily: "Oswald, sans-serif" }}>{g.term}</td>
                <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink) / 0.8)" }}>{g.definition}</td>
                <td className="py-3 px-2" style={{ color: "hsl(var(--fyn-ink) / 0.7)" }}>{g.category}</td>
                <td className="py-3 px-2 whitespace-nowrap" style={{ color: "hsl(var(--fyn-ink) / 0.6)" }}>{g.date}</td>
                <td className="py-3 px-2"><RowActionsStub /></td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {editorOpen && (
        <SimpleEditorStub tab={tab} onClose={() => setEditorOpen(false)} />
      )}
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ fontFamily: "Roboto, sans-serif", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(26,16,8,0.08)" }}>
            {headers.map((h) => (
              <th key={h} className="text-left py-2.5 px-2"
                style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function RowActionsStub() {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => toast.info("Resource/glossary CRUD coming soon")} className="p-1.5 rounded-lg hover:bg-[hsl(var(--fyn-ink)/0.06)]"><Edit2 size={14} color="hsl(var(--fyn-ink) / 0.6)" /></button>
      <button onClick={() => toast.info("Resource/glossary CRUD coming soon")} className="p-1.5 rounded-lg hover:bg-[rgba(196,30,30,0.08)]"><Trash2 size={14} color="#C41E1E" /></button>
    </div>
  );
}

function SimpleEditorStub({ tab, onClose }: { tab: Tab; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(26,16,8,0.5)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "#FFFFFF", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, color: "hsl(var(--fyn-ink))" }}>
            {tab === "resources" ? "Add Resource" : "Add Glossary Term"}
          </h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink) / 0.65)" }}>
          {tab === "resources" ? "Resource" : "Glossary"} CRUD wiring is coming soon.
        </p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-white"
            style={{ background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)", fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 13 }}>Close</button>
        </div>
      </div>
    </div>
  );
}
