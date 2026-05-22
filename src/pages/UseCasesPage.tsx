import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FynLogo from '@/components/FynLogo';

/* ---------- FYNHELP palette ---------- */
const C = {
  ink: '#1A1008',
  inkSoft: '#2A1C10',
  beige: '#F4EDDA',
  beigeWarm: '#FBF6E8',
  red: '#C41E1E',
  redDark: '#8B1414',
  gold: '#8B6914',
  goldSoft: '#C9A84C',
  green: '#4A6B3A',
  line: 'rgba(244,237,218,0.10)',
  muted: 'rgba(244,237,218,0.55)',
  beigeMuted: 'rgba(26,16,8,0.60)',
};

/* ---------- Mock visuals (inline SVG, brand colors) ---------- */
const M = {
  Bars: () => (
    <svg viewBox="0 0 220 110" width="100%" height="100%">
      <line x1="0" y1="100" x2="220" y2="100" stroke={C.line} strokeWidth="1" />
      {[60, 75, 45, 90, 55, 80, 35, 70, 50, 85, 40].map((h, i) => (
        <g key={i}>
          <rect x={6 + i * 19} y={100 - h} width="12" height={h} rx="2"
            fill={i % 3 === 0 ? C.red : i % 3 === 1 ? C.goldSoft : 'rgba(244,237,218,0.25)'} />
        </g>
      ))}
    </svg>
  ),
  BudgetVActual: () => (
    <svg viewBox="0 0 220 110" width="100%" height="100%">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={10 + i * 34} y={30 + (i % 2) * 8} width="12" height={70 - (i % 2) * 8} rx="2" fill={C.goldSoft} opacity="0.5" />
          <rect x={24 + i * 34} y={20 + (i % 3) * 6} width="12" height={80 - (i % 3) * 6} rx="2" fill={C.red} />
        </g>
      ))}
    </svg>
  ),
  Line: () => (
    <svg viewBox="0 0 220 110" width="100%" height="100%">
      <path d="M0 90 L30 75 L60 80 L90 55 L120 60 L150 35 L180 40 L220 15" stroke={C.red} strokeWidth="2.2" fill="none" />
      <path d="M0 90 L30 75 L60 80 L90 55 L120 60 L150 35 L180 40 L220 15 L220 110 L0 110 Z" fill="url(#g1)" />
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={C.red} stopOpacity="0.35" />
          <stop offset="100%" stopColor={C.red} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  ),
  Rows: () => (
    <svg viewBox="0 0 220 110" width="100%" height="100%">
      {[20, 38, 56, 74, 92].map((y, i) => (
        <g key={i}>
          <rect x="6" y={y - 6} width="60" height="10" rx="2" fill="rgba(244,237,218,0.18)" />
          <rect x="72" y={y - 6} width={50 + i * 18} height="10" rx="2"
            fill={i === 1 ? C.red : i === 3 ? C.goldSoft : 'rgba(244,237,218,0.35)'} />
        </g>
      ))}
    </svg>
  ),
  KpiTiles: () => (
    <svg viewBox="0 0 220 110" width="100%" height="100%">
      {['99.2%', '1.2K', '4.5', '97%'].map((t, i) => (
        <g key={i}>
          <rect x={6 + i * 53} y="20" width="48" height="70" rx="6" fill="rgba(244,237,218,0.06)" stroke={C.line} />
          <text x={30 + i * 53} y="58" textAnchor="middle" fill={C.beige} fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700">{t}</text>
          <rect x={12 + i * 53} y="74" width="36" height="4" rx="2" fill={i === 1 ? C.red : C.goldSoft} opacity="0.7" />
        </g>
      ))}
    </svg>
  ),
  HBars: () => (
    <svg viewBox="0 0 220 110" width="100%" height="100%">
      {[140, 100, 170, 80, 120].map((w, i) => (
        <g key={i}>
          <rect x="6" y={10 + i * 18} width="50" height="10" rx="2" fill="rgba(244,237,218,0.15)" />
          <rect x="60" y={10 + i * 18} width={w} height="10" rx="2" fill={i === 0 || i === 2 ? C.red : C.goldSoft} opacity={i === 4 ? 0.6 : 1} />
        </g>
      ))}
    </svg>
  ),
  Stat: ({ a = '$5.4M', b = '34.2%', c = '847', d = '72' }) => (
    <svg viewBox="0 0 220 110" width="100%" height="100%">
      {[[a, '#C41E1E'], [b, '#8B6914'], [c, '#C41E1E'], [d, '#8B6914']].map(([t, col], i) => (
        <g key={i}>
          <rect x={6 + (i % 2) * 106} y={6 + Math.floor(i / 2) * 52} width="100" height="44" rx="6" fill="rgba(244,237,218,0.06)" stroke={C.line} />
          <text x={56 + (i % 2) * 106} y={34 + Math.floor(i / 2) * 52} textAnchor="middle" fill={C.beige} fontFamily="Georgia, serif" fontSize="16" fontWeight="700">{t as string}</text>
        </g>
      ))}
    </svg>
  ),
  Donut: () => (
    <svg viewBox="0 0 220 110" width="100%" height="100%">
      <circle cx="55" cy="55" r="38" fill="none" stroke="rgba(244,237,218,0.15)" strokeWidth="12" />
      <circle cx="55" cy="55" r="38" fill="none" stroke={C.red} strokeWidth="12" strokeDasharray="170 240" transform="rotate(-90 55 55)" />
      <text x="55" y="60" textAnchor="middle" fill={C.beige} fontFamily="Georgia,serif" fontSize="16" fontWeight="700">72%</text>
      {[20, 38, 56, 74].map((y, i) => (
        <g key={i}>
          <rect x="115" y={y - 6} width="90" height="8" rx="2" fill={i % 2 ? C.goldSoft : C.red} opacity={0.4 + i * 0.15} />
        </g>
      ))}
    </svg>
  ),
};

const USE_CASES = [
  { id: 1, category: 'finance', title: 'MONTHLY FINANCIAL CLOSE REPORT', desc: 'Generate period-end close reports with automated reconciliation and variance analysis from your ERP exports.', mock: <M.Bars /> },
  { id: 2, category: 'finance', title: 'BUDGET VS. ACTUAL ANALYSIS', desc: 'Compare budgeted figures against actuals across departments with automated variance commentary.', mock: <M.BudgetVActual /> },
  { id: 3, category: 'finance', title: 'CASH FLOW FORECAST', desc: 'Build rolling cash flow forecasts from AR/AP data, bank statements, and revenue projections.', mock: <M.Line /> },
  { id: 4, category: 'finance', title: 'P&L STATEMENT GENERATOR', desc: 'Auto-generate monthly P&L statements with YoY comparisons and trend analysis.', mock: <M.Line /> },

  { id: 5, category: 'compliance', title: 'GST RETURN PREPARATION', desc: 'Auto-generate GSTR-1, GSTR-3B with ITC reconciliation and filing readiness checks.', mock: <M.Rows /> },
  { id: 6, category: 'compliance', title: 'AUDIT TRAIL DOCUMENTATION', desc: 'Generate complete audit documentation with source traceability for every data point.', mock: <M.Rows /> },
  { id: 7, category: 'compliance', title: 'TDS COMPLIANCE REPORT', desc: 'Automate TDS calculation, deduction tracking, and quarterly return generation.', mock: <M.HBars /> },

  { id: 8, category: 'operations', title: 'WEEKLY OPERATIONS REPORT', desc: 'Aggregate operational KPIs from multiple systems into a structured weekly summary.', mock: <M.KpiTiles /> },
  { id: 9, category: 'operations', title: 'VENDOR PERFORMANCE REPORT', desc: 'Analyze supplier performance, lead times, and inventory levels from procurement data.', mock: <M.HBars /> },
  { id: 10, category: 'operations', title: 'INVENTORY TRACKING DASHBOARD', desc: 'Monitor stock levels, reorder points, and SKU performance across warehouses.', mock: <M.Rows /> },

  { id: 11, category: 'executive', title: 'BOARD MEETING DECK', desc: 'Create quarterly board presentations from financial, product, and growth data sources.', mock: <M.Stat /> },
  { id: 12, category: 'executive', title: 'MONTHLY INVESTOR UPDATE', desc: 'Generate polished investor updates with KPIs, burn rate, milestones, and growth metrics.', mock: <M.Line /> },
  { id: 13, category: 'executive', title: 'EXECUTIVE KPI DASHBOARD', desc: 'Build comprehensive executive dashboards pulling from finance, sales, and operations.', mock: <M.KpiTiles /> },

  { id: 14, category: 'hr', title: 'HEADCOUNT & ATTRITION REPORT', desc: 'Track headcount changes, attrition rates, and hiring velocity from HRIS data exports.', mock: <M.HBars /> },
  { id: 15, category: 'hr', title: 'COMPENSATION BENCHMARKING', desc: 'Analyze compensation data against market benchmarks with equity and band distribution.', mock: <M.Donut /> },
];

const CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'finance', label: 'FINANCE' },
  { id: 'compliance', label: 'COMPLIANCE' },
  { id: 'operations', label: 'OPERATIONS' },
  { id: 'executive', label: 'EXECUTIVE' },
  { id: 'hr', label: 'HR & PEOPLE' },
];

const CATEGORY_LABEL: Record<string, string> = {
  finance: 'Finance',
  compliance: 'Compliance',
  operations: 'Operations',
  executive: 'Executive',
  hr: 'HR & People',
};

const TYPE_PHRASES = [
  'Search use cases…',
  'cash flow forecast',
  'GST return preparation',
  'investor update',
  'board meeting deck',
];

export default function UseCasesPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');

  /* typing placeholder */
  useEffect(() => {
    let i = 0, j = 0, deleting = false;
    const tick = () => {
      const phrase = TYPE_PHRASES[i];
      if (!deleting) {
        j++;
        setPlaceholder(phrase.slice(0, j));
        if (j >= phrase.length) { deleting = true; setTimeout(tick, 1400); return; }
      } else {
        j--;
        setPlaceholder(phrase.slice(0, j));
        if (j <= 0) { deleting = false; i = (i + 1) % TYPE_PHRASES.length; }
      }
      setTimeout(tick, deleting ? 35 : 70);
    };
    const t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => USE_CASES.filter((u) => {
    const catOk = activeCategory === 'all' || u.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const qOk = !q || u.title.toLowerCase().includes(q) || u.desc.toLowerCase().includes(q);
    return catOk && qOk;
  }), [activeCategory, searchQuery]);

  const grouped = useMemo(() => {
    const order = ['finance', 'compliance', 'operations', 'executive', 'hr'];
    return order
      .map((cat) => ({ cat, items: filtered.filter((u) => u.category === cat) }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <div style={{ background: C.beige, minHeight: '100vh', color: C.ink, fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .uc-nav-btn:hover { background:${C.ink}; color:${C.beige}; }
        .uc-pill { transition: all .25s ease; }
        .uc-pill:hover { transform: translateY(-1px); }
        .uc-card { transition: transform .35s ease, box-shadow .35s ease, border-color .35s ease; }
        .uc-card:hover { transform: translateY(-6px); box-shadow: 0 24px 60px -20px rgba(196,30,30,0.45); border-color: ${C.red}; }
        .uc-card:hover .uc-mock { transform: scale(1.04); }
        .uc-mock { transition: transform .5s ease; }
        .uc-search-input::placeholder { color: rgba(244,237,218,0.45); }
        .uc-search-wrap:focus-within { border-color:${C.red}; box-shadow:0 0 0 4px rgba(196,30,30,0.18); }
        @keyframes ucCaret { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        .uc-caret { display:inline-block; width:2px; height:1em; background:${C.beige}; margin-left:2px; vertical-align:-2px; animation: ucCaret 1s steps(1) infinite; }
        .uc-cat-title::before {
          content:''; display:inline-block; width:8px; height:8px; border-radius:50%;
          background:${C.red}; margin-right:14px; vertical-align:middle;
          box-shadow: 0 0 0 4px rgba(196,30,30,0.12);
        }
        @media (max-width: 1024px){
          .uc-hero-h1 { font-size: clamp(40px, 8vw, 64px) !important; }
        }
        @media (max-width: 720px){
          .uc-grid { grid-template-columns: 1fr !important; }
          .uc-pills { gap: 8px !important; }
          .uc-pill { padding: 10px 16px !important; font-size: 12px !important; }
          .uc-nav { padding: 14px 16px !important; }
          .uc-section { padding-left: 16px !important; padding-right: 16px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="uc-nav" style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(244,237,218,0.85)', backdropFilter: 'blur(14px)',
        borderBottom: `1px solid rgba(26,16,8,0.08)`, padding: '18px 28px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <FynLogo size="md" showTagline={false} />
          </div>
          <button onClick={() => navigate('/')}
            className="uc-nav-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', border: `1.5px solid ${C.ink}`, background: 'transparent',
              color: C.ink, fontWeight: 700, fontSize: 13, letterSpacing: '0.5px',
              cursor: 'pointer', borderRadius: 0,
            }}>
            <ArrowLeft size={16} strokeWidth={2.5} /> BACK
          </button>
        </div>
      </nav>

      {/* HERO (dark band, beige type, red accent) */}
      <section className="uc-section" style={{
        background: `radial-gradient(1200px 500px at 50% 0%, rgba(196,30,30,0.18), transparent 70%), ${C.ink}`,
        color: C.beige, padding: '88px 28px 96px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <Sparkles size={16} color={C.goldSoft} />
            <span style={{ fontSize: 12, letterSpacing: '3px', color: C.muted, fontWeight: 700 }}>USE CASE LIBRARY</span>
            <Sparkles size={16} color={C.red} />
          </div>
          <h1 className="uc-hero-h1" style={{
            fontFamily: 'Georgia, "Playfair Display", serif',
            fontSize: 'clamp(48px, 6.4vw, 84px)', lineHeight: 1.04, fontWeight: 400, letterSpacing: '-0.02em',
            margin: 0, color: C.beige,
          }}>
            {USE_CASES.length} ways teams use<br />
            <em style={{ fontStyle: 'italic', color: C.red, fontWeight: 500 }}>Fynhelp</em>
          </h1>
          <p style={{
            marginTop: 26, fontSize: 17, lineHeight: 1.7, color: C.muted, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto',
          }}>
            Browse real workflows across finance, compliance, operations, and more — all powered by your data.
          </p>

          {/* Search */}
          <div className="uc-search-wrap" style={{
            marginTop: 38, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(244,237,218,0.06)', border: `1.5px solid rgba(244,237,218,0.18)`,
            padding: '14px 18px', borderRadius: 999, transition: 'all .25s',
          }}>
            <Search size={18} color={C.muted} />
            <input
              className="uc-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: C.beige, fontSize: 15, fontFamily: 'Inter, sans-serif',
              }}
            />
            {searchQuery === '' && <span className="uc-caret" />}
          </div>

          {/* Pills */}
          <div className="uc-pills" style={{
            marginTop: 28, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
          }}>
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  className="uc-pill"
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '11px 22px',
                    background: active ? C.beige : 'transparent',
                    color: active ? C.ink : C.beige,
                    border: `1.5px solid ${active ? C.beige : 'rgba(244,237,218,0.25)'}`,
                    fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', cursor: 'pointer',
                    borderRadius: 4,
                  }}>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* GROUPED RESULTS */}
      <section className="uc-section" style={{ padding: '72px 28px 40px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ fontSize: 11, letterSpacing: '2.5px', color: C.beigeMuted, fontWeight: 700, marginBottom: 32 }}>
          {filtered.length} USE CASE{filtered.length !== 1 ? 'S' : ''}
        </div>

        {grouped.map((group) => (
          <div key={group.cat} style={{ marginBottom: 72 }}>
            <h2 className="uc-cat-title" style={{
              fontFamily: 'Georgia, serif', fontSize: 36, fontWeight: 400, color: C.ink,
              marginBottom: 26, letterSpacing: '-0.01em',
            }}>
              {CATEGORY_LABEL[group.cat]}
            </h2>

            <div className="uc-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 22,
            }}>
              {group.items.map((u, idx) => (
                <motion.article
                  key={u.id}
                  className="uc-card"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  onClick={() => navigate('/waitlist')}
                  style={{
                    background: C.ink, color: C.beige,
                    border: `1px solid rgba(244,237,218,0.08)`,
                    borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column',
                  }}>
                  <div style={{
                    height: 168, padding: 18,
                    background: `linear-gradient(180deg, rgba(196,30,30,0.06) 0%, rgba(26,16,8,0) 100%)`,
                    borderBottom: `1px solid rgba(244,237,218,0.06)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div className="uc-mock" style={{ width: '100%', height: '100%' }}>{u.mock}</div>
                  </div>
                  <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    <h3 style={{
                      fontSize: 13, fontWeight: 800, letterSpacing: '1.2px',
                      color: C.beige, lineHeight: 1.35, margin: 0,
                    }}>
                      {u.title}
                    </h3>
                    <p style={{
                      fontSize: 13.5, color: C.muted, lineHeight: 1.6, margin: 0, flex: 1,
                    }}>
                      {u.desc}
                    </p>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 11, letterSpacing: '1.5px', fontWeight: 700, color: C.red, marginTop: 6,
                    }}>
                      EXPLORE <ArrowRight size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: C.beigeMuted }}>
            No use cases found. Try a different search or category.
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="uc-section" style={{
        padding: '88px 28px 120px',
        background: `linear-gradient(180deg, ${C.beige} 0%, ${C.beigeWarm} 100%)`,
        borderTop: `1px solid rgba(26,16,8,0.08)`,
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'Georgia, serif', fontSize: 'clamp(34px, 4.5vw, 52px)',
            fontWeight: 400, color: C.ink, margin: 0, letterSpacing: '-0.015em',
          }}>
            Don't see your use case?
          </h2>
          <p style={{ marginTop: 18, fontSize: 17, color: C.beigeMuted, lineHeight: 1.7 }}>
            Fynhelp adapts to any data-to-decision workflow.<br />Tell us what you're building.
          </p>
          <button onClick={() => navigate('/waitlist')} style={{
            marginTop: 34, padding: '16px 38px',
            background: C.red, color: C.beige, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 13, letterSpacing: '2px', borderRadius: 4,
            boxShadow: '0 14px 36px -12px rgba(196,30,30,0.55)',
            display: 'inline-flex', alignItems: 'center', gap: 10,
          }}>
            TRY NOW FOR FREE <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </section>
    </div>
  );
}
