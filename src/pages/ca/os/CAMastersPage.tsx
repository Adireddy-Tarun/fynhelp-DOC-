/**
 * Master Data — customers/vendors, items and FX rates.
 * Backed by ca_parties, ca_items and ca_fx_rates. No fabricated rows.
 */
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCAPortal } from "@/hooks/useCAPortal";
import { useCARole } from "@/hooks/useCARole";
import { useCAClientOptions } from "@/hooks/useCAClientOptions";
import { logCAAudit } from "@/lib/caAudit";
import { CA, CACard, CAButton, CABadge, CAEmpty, CAField, caInputStyle, caTh, caTd, inr, dateIN } from "@/components/ca/portalUi";
import { ModuleHeader } from "@/components/ca/os/primitives";

type Tab = "parties" | "items" | "currency";

interface Party {
  id: string; name: string; party_type: string; gstin: string | null; pan: string | null;
  email: string | null; phone: string | null; payment_terms_days: number; is_active: boolean;
}
interface Item {
  id: string; name: string; sku: string | null; hsn_code: string | null; uom: string;
  unit_price: number | null; gst_rate: number; category: string | null; is_active: boolean;
}
interface FxRate {
  id: string; base_currency: string; quote_currency: string; rate: number; rate_date: string; source: string;
}

const TABS: { key: Tab; label: string }[] = [
  { key: "parties", label: "Customers & Vendors" },
  { key: "items", label: "Items" },
  { key: "currency", label: "Currency & FX" },
];

export default function CAMastersPage() {
  const { firmId, userId } = useCAPortal();
  const { can } = useCARole();
  const { clients } = useCAClientOptions();
  const [tab, setTab] = useState<Tab>("parties");
  const [businessId, setBusinessId] = useState("");
  const [parties, setParties] = useState<Party[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [rates, setRates] = useState<FxRate[]>([]);
  const editable = can("manage_clients");

  const [pForm, setPForm] = useState({ name: "", party_type: "customer", gstin: "", pan: "", email: "", phone: "", payment_terms_days: "30" });
  const [iForm, setIForm] = useState({ name: "", sku: "", hsn_code: "", uom: "NOS", unit_price: "", gst_rate: "18", category: "" });
  const [fForm, setFForm] = useState({ base_currency: "USD", quote_currency: "INR", rate: "", rate_date: new Date().toISOString().slice(0, 10) });

  useEffect(() => {
    if (!businessId && clients.length) setBusinessId(clients[0].business_id);
  }, [clients, businessId]);

  const load = useCallback(async () => {
    if (!firmId) return;
    if (businessId) {
      const [{ data: p }, { data: i }] = await Promise.all([
        supabase.from("ca_parties").select("id, name, party_type, gstin, pan, email, phone, payment_terms_days, is_active")
          .eq("ca_firm_id", firmId).eq("business_id", businessId).order("name"),
        supabase.from("ca_items").select("id, name, sku, hsn_code, uom, unit_price, gst_rate, category, is_active")
          .eq("ca_firm_id", firmId).eq("business_id", businessId).order("name"),
      ]);
      setParties((p ?? []) as Party[]);
      setItems((i ?? []) as Item[]);
    }
    const { data: f } = await supabase.from("ca_fx_rates")
      .select("id, base_currency, quote_currency, rate, rate_date, source")
      .eq("ca_firm_id", firmId).order("rate_date", { ascending: false }).limit(60);
    setRates((f ?? []) as FxRate[]);
  }, [firmId, businessId]);

  useEffect(() => { void load(); }, [load]);

  const addParty = async () => {
    if (!firmId || !businessId || !pForm.name.trim()) return toast.error("Name is required");
    const { error } = await supabase.from("ca_parties").insert({
      ca_firm_id: firmId, business_id: businessId, name: pForm.name.trim(), party_type: pForm.party_type,
      gstin: pForm.gstin.trim() || null, pan: pForm.pan.trim() || null, email: pForm.email.trim() || null,
      phone: pForm.phone.trim() || null, payment_terms_days: Number(pForm.payment_terms_days || 30),
    });
    if (error) return toast.error(error.message);
    await logCAAudit({ firmId, businessId, entityType: "party", action: "party_created", detail: { name: pForm.name, type: pForm.party_type } });
    toast.success("Party added");
    setPForm({ name: "", party_type: "customer", gstin: "", pan: "", email: "", phone: "", payment_terms_days: "30" });
    await load();
  };

  const addItem = async () => {
    if (!firmId || !businessId || !iForm.name.trim()) return toast.error("Name is required");
    const { error } = await supabase.from("ca_items").insert({
      ca_firm_id: firmId, business_id: businessId, name: iForm.name.trim(), sku: iForm.sku.trim() || null,
      hsn_code: iForm.hsn_code.trim() || null, uom: iForm.uom.trim() || "NOS",
      unit_price: iForm.unit_price ? Number(iForm.unit_price) : null, gst_rate: Number(iForm.gst_rate || 18),
      category: iForm.category.trim() || null,
    });
    if (error) return toast.error(error.message);
    await logCAAudit({ firmId, businessId, entityType: "item", action: "item_created", detail: { name: iForm.name } });
    toast.success("Item added");
    setIForm({ name: "", sku: "", hsn_code: "", uom: "NOS", unit_price: "", gst_rate: "18", category: "" });
    await load();
  };

  const addRate = async () => {
    if (!firmId || !fForm.rate) return toast.error("Rate is required");
    const { error } = await supabase.from("ca_fx_rates").insert({
      ca_firm_id: firmId, base_currency: fForm.base_currency.toUpperCase(),
      quote_currency: fForm.quote_currency.toUpperCase(), rate: Number(fForm.rate),
      rate_date: fForm.rate_date, created_by: userId ?? null,
    });
    if (error) return toast.error(error.message);
    toast.success("Rate recorded");
    setFForm({ ...fForm, rate: "" });
    await load();
  };

  const clientPicker = (
    <CACard style={{ padding: 16, marginBottom: 18 }}>
      <CAField label="Client">
        <select value={businessId} onChange={(e) => setBusinessId(e.target.value)} style={{ ...caInputStyle, maxWidth: 340 }}>
          {clients.length === 0 && <option value="">No clients yet</option>}
          {clients.map((c) => <option key={c.business_id} value={c.business_id}>{c.client_name}</option>)}
        </select>
      </CAField>
    </CACard>
  );

  return (
    <div>
      <ModuleHeader
        title="Master Data"
        subtitle="Counterparty, item and currency masters that dimension every transaction — customers, vendors, HSN-coded items and dated exchange rates."
        right={editable ? undefined : <CABadge tone="grey">Read only</CABadge>}
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            fontFamily: CA.sans, fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
            color: tab === t.key ? "#fff" : CA.muted, background: tab === t.key ? CA.teal : "#fff",
            border: `0.5px solid ${tab === t.key ? CA.teal : CA.line}`, borderRadius: 999, padding: "7px 16px", cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {tab !== "currency" && clientPicker}

      {tab === "parties" && (
        <>
          {editable && (
            <CACard style={{ padding: 18, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
                <CAField label="Name"><input value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} style={caInputStyle} /></CAField>
                <CAField label="Type">
                  <select value={pForm.party_type} onChange={(e) => setPForm({ ...pForm, party_type: e.target.value })} style={caInputStyle}>
                    <option value="customer">Customer</option><option value="vendor">Vendor</option><option value="both">Both</option>
                  </select>
                </CAField>
                <CAField label="GSTIN"><input value={pForm.gstin} onChange={(e) => setPForm({ ...pForm, gstin: e.target.value })} style={caInputStyle} /></CAField>
                <CAField label="PAN"><input value={pForm.pan} onChange={(e) => setPForm({ ...pForm, pan: e.target.value })} style={caInputStyle} /></CAField>
                <CAField label="Email"><input value={pForm.email} onChange={(e) => setPForm({ ...pForm, email: e.target.value })} style={caInputStyle} /></CAField>
                <CAField label="Payment terms (days)"><input type="number" value={pForm.payment_terms_days} onChange={(e) => setPForm({ ...pForm, payment_terms_days: e.target.value })} style={caInputStyle} /></CAField>
              </div>
              <div style={{ marginTop: 14 }}><CAButton onClick={addParty}>Add party</CAButton></div>
            </CACard>
          )}
          <CACard style={{ padding: 4 }}>
            {parties.length === 0 ? <CAEmpty title="No customers or vendors yet" hint="Add the client's counterparties to dimension receivables and payables." /> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Name", "Type", "GSTIN", "PAN", "Contact", "Terms"].map((h) => <th key={h} style={caTh}>{h}</th>)}</tr></thead>
                  <tbody>
                    {parties.map((p) => (
                      <tr key={p.id}>
                        <td style={caTd}>{p.name}</td>
                        <td style={caTd}><CABadge tone={p.party_type === "vendor" ? "amber" : "teal"}>{p.party_type}</CABadge></td>
                        <td style={{ ...caTd, fontFamily: CA.mono, fontSize: 12 }}>{p.gstin ?? "—"}</td>
                        <td style={{ ...caTd, fontFamily: CA.mono, fontSize: 12 }}>{p.pan ?? "—"}</td>
                        <td style={caTd}>{p.email ?? p.phone ?? "—"}</td>
                        <td style={caTd}>{p.payment_terms_days}d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CACard>
        </>
      )}

      {tab === "items" && (
        <>
          {editable && (
            <CACard style={{ padding: 18, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
                <CAField label="Item name"><input value={iForm.name} onChange={(e) => setIForm({ ...iForm, name: e.target.value })} style={caInputStyle} /></CAField>
                <CAField label="SKU"><input value={iForm.sku} onChange={(e) => setIForm({ ...iForm, sku: e.target.value })} style={caInputStyle} /></CAField>
                <CAField label="HSN / SAC"><input value={iForm.hsn_code} onChange={(e) => setIForm({ ...iForm, hsn_code: e.target.value })} style={caInputStyle} /></CAField>
                <CAField label="UOM"><input value={iForm.uom} onChange={(e) => setIForm({ ...iForm, uom: e.target.value })} style={caInputStyle} /></CAField>
                <CAField label="Unit price (₹)"><input type="number" value={iForm.unit_price} onChange={(e) => setIForm({ ...iForm, unit_price: e.target.value })} style={caInputStyle} /></CAField>
                <CAField label="GST rate (%)"><input type="number" value={iForm.gst_rate} onChange={(e) => setIForm({ ...iForm, gst_rate: e.target.value })} style={caInputStyle} /></CAField>
              </div>
              <div style={{ marginTop: 14 }}><CAButton onClick={addItem}>Add item</CAButton></div>
            </CACard>
          )}
          <CACard style={{ padding: 4 }}>
            {items.length === 0 ? <CAEmpty title="No items yet" hint="Add the goods or services this client sells to enable item-level analysis." /> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Item", "SKU", "HSN/SAC", "UOM", "Unit price", "GST"].map((h) => <th key={h} style={caTh}>{h}</th>)}</tr></thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={i.id}>
                        <td style={caTd}>{i.name}</td>
                        <td style={{ ...caTd, fontFamily: CA.mono, fontSize: 12 }}>{i.sku ?? "—"}</td>
                        <td style={{ ...caTd, fontFamily: CA.mono, fontSize: 12 }}>{i.hsn_code ?? "—"}</td>
                        <td style={caTd}>{i.uom}</td>
                        <td style={caTd}>{i.unit_price === null ? "—" : inr(i.unit_price)}</td>
                        <td style={caTd}>{i.gst_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CACard>
        </>
      )}

      {tab === "currency" && (
        <>
          {editable && (
            <CACard style={{ padding: 18, marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
                <CAField label="Base currency"><input value={fForm.base_currency} onChange={(e) => setFForm({ ...fForm, base_currency: e.target.value })} style={caInputStyle} /></CAField>
                <CAField label="Quote currency"><input value={fForm.quote_currency} onChange={(e) => setFForm({ ...fForm, quote_currency: e.target.value })} style={caInputStyle} /></CAField>
                <CAField label="Rate"><input type="number" step="0.0001" value={fForm.rate} onChange={(e) => setFForm({ ...fForm, rate: e.target.value })} style={caInputStyle} /></CAField>
                <CAField label="Rate date"><input type="date" value={fForm.rate_date} onChange={(e) => setFForm({ ...fForm, rate_date: e.target.value })} style={caInputStyle} /></CAField>
              </div>
              <div style={{ marginTop: 14 }}><CAButton onClick={addRate}>Record rate</CAButton></div>
            </CACard>
          )}
          <CACard style={{ padding: 4 }}>
            {rates.length === 0 ? <CAEmpty title="No exchange rates recorded" hint="Record dated rates to translate foreign-currency transactions into INR." /> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr>{["Pair", "Rate", "Date", "Source"].map((h) => <th key={h} style={caTh}>{h}</th>)}</tr></thead>
                  <tbody>
                    {rates.map((r) => (
                      <tr key={r.id}>
                        <td style={{ ...caTd, fontFamily: CA.mono }}>{r.base_currency}/{r.quote_currency}</td>
                        <td style={{ ...caTd, fontFamily: CA.mono, fontVariantNumeric: "tabular-nums" }}>{Number(r.rate).toFixed(4)}</td>
                        <td style={caTd}>{dateIN(r.rate_date)}</td>
                        <td style={caTd}>{r.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CACard>
        </>
      )}
    </div>
  );
}
