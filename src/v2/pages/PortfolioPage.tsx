import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Users, Plus } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, Stat, V, formatDate, Tone } from "../ui";
import { useV2 } from "../store";
import AddClientModal from "../components/AddClientModal";

export default function PortfolioPage() {
  const { clients, review, exceptions, chases } = useV2();
  const [adding, setAdding] = useState(false);

  const openEx = exceptions.filter((e) => e.status === "open");
  const openRev = review.filter((r) => r.status === "open");
  const openChase = chases.filter((c) => c.status !== "Resolved");

  return (
    <>
      <PageHeader
        title="Portfolio"
        subtitle="Health of every client in one view."
        action={<button className="v2-btn v2-btn-primary" onClick={() => setAdding(true)}><Plus size={15} /> Add client</button>}
      />

      {clients.length === 0 ? (
        <EmptyState
          icon={<Users size={22} />}
          title="Add your first client to get started"
          description="Once a client is added, their documents, reconciliation exceptions and MIS reports appear here."
          action={<button className="v2-btn v2-btn-primary" onClick={() => setAdding(true)}><Plus size={15} /> Add client</button>}
        />
      ) : (
        <>
          <div className="v2-grid-cards" style={{ marginBottom: 22 }}>
            <Stat label="Clients" value={clients.length} hint="Active engagements" />
            <Stat label="Open exceptions" value={openEx.length} tone={openEx.length ? "bad" : "neutral"} hint="Across the portfolio" />
            <Stat label="Awaiting review" value={openRev.length} hint="Low confidence extractions" />
            <Stat label="Open chases" value={openChase.length} hint="Documents still pending" />
          </div>

          <div className="v2-grid-cards">
            {clients.map((c) => {
              const ex = openEx.filter((e) => e.clientId === c.id).length;
              const rv = openRev.filter((r) => r.clientId === c.id).length;
              const ch = openChase.filter((h) => h.clientId === c.id).length;
              const status: { label: string; tone: Tone } = ex > 0
                ? { label: "Needs attention", tone: "bad" }
                : rv > 0 || ch > 0
                  ? { label: "Ready for review", tone: "warn" }
                  : { label: "All clear", tone: "good" };
              return (
                <Link key={c.id} to="/v2/clients/$clientId" params={{ clientId: c.id }} style={{ textDecoration: "none" }}>
                  <Card style={{ height: "100%" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "start" }}>
                      <h3 style={{ fontSize: 15.5, minWidth: 0 }}>{c.name}</h3>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: V.muted, marginTop: 4 }}>{c.entityType}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 16 }}>
                      {[
                        { k: "Exceptions", v: ex },
                        { k: "Review", v: rv },
                        { k: "Chases", v: ch },
                      ].map((m) => (
                        <div key={m.k} style={{ background: V.gray, borderRadius: 12, padding: "10px 12px" }}>
                          <div className="num" style={{ fontSize: 19, fontWeight: 600 }}>{m.v}</div>
                          <div style={{ fontSize: 10.5, color: V.muted, letterSpacing: ".05em", textTransform: "uppercase" }}>{m.k}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: V.body, marginTop: 14 }}>
                      Last MIS: {c.lastMis ? formatDate(c.lastMis) : "Not generated yet"}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <AddClientModal open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
