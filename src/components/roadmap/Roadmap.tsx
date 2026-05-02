import React, { useEffect, useState } from 'react';

const Roadmap = () => {
  const [visible, setVisible] = useState(false);
  const [hoveredStop, setHoveredStop] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const stops = [
    { id: 1, name: 'Liquidity Intelligence', emoji: '💧', color: '#3B82F6', status: 'live' as const, desc: 'Cash flow tracking, runway forecast, burn rate alerts' },
    { id: 2, name: 'AI CFO Nidhi', emoji: '🤖', color: '#F43F5E', status: 'live' as const, desc: 'Conversational AI — ask any financial question' },
    { id: 3, name: 'CSV Upload', emoji: '📄', color: '#10B981', status: 'live' as const, desc: 'Bulk import bank statements, invoices, ledgers' },
    { id: 4, name: 'Revenue Intelligence', emoji: '📊', color: '#14B8A6', status: 'soon' as const, desc: 'MRR/ARR dashboards, cohort analysis, churn signals' },
    { id: 5, name: 'Cost Intelligence', emoji: '💰', color: '#F97316', status: 'soon' as const, desc: 'Expense categorization, vendor spend optimization' },
    { id: 6, name: 'Razorpay Sync', emoji: '⚡', color: '#6366F1', status: 'soon' as const, desc: 'Payment sync, settlement tracking, refund reconciliation' },
    { id: 7, name: 'GST & Tax Intelligence', emoji: '🏛️', color: '#F59E0B', status: 'soon' as const, desc: 'GST/TDS compliance, audit readiness, deadline alerts' },
    { id: 8, name: 'Workforce Intelligence', emoji: '👥', color: '#8B5CF6', status: 'soon' as const, desc: 'Payroll analytics, cost-per-employee, headcount ROI' },
    { id: 9, name: 'Zoho Books Sync', emoji: '📚', color: '#06B6D4', status: 'soon' as const, desc: 'Auto-pull invoices, expenses, contacts from Zoho' },
    { id: 10, name: 'CA Partner Ecosystem', emoji: '🤝', color: '#EC4899', status: 'soon' as const, desc: '800K CAs — partner portal & distribution' },
    { id: 11, name: 'Market & Growth', emoji: '🌍', color: '#10B981', status: 'soon' as const, desc: 'Market intelligence, competitive benchmarking' },
    { id: 12, name: 'Banking & Fintech', emoji: '🏦', color: '#6366F1', status: 'soon' as const, desc: 'Account Aggregator, open banking, credit insights' },
  ];

  // Path waypoints on the mountain — zigzag up
  const waypoints = [
    { x: 220, y: 770 },
    { x: 500, y: 710 },
    { x: 330, y: 645 },
    { x: 570, y: 585 },
    { x: 390, y: 525 },
    { x: 620, y: 465 },
    { x: 440, y: 405 },
    { x: 650, y: 350 },
    { x: 490, y: 295 },
    { x: 665, y: 240 },
    { x: 540, y: 185 },
    { x: 680, y: 130 },
  ];

  // Build path strings
  let greenPath = `M ${waypoints[0].x} ${waypoints[0].y}`;
  for (let i = 1; i <= 2; i++) greenPath += ` L ${waypoints[i].x} ${waypoints[i].y}`;

  let goldPath = `M ${waypoints[2].x} ${waypoints[2].y}`;
  for (let i = 3; i < waypoints.length; i++) goldPath += ` L ${waypoints[i].x} ${waypoints[i].y}`;
  goldPath += ' L 700 85';

  return (
    <div style={{
      background: 'linear-gradient(180deg, #F8F6F1 0%, #EDE9E0 100%)',
      minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem 1rem' }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
          fontWeight: 900, color: '#1a1814',
          letterSpacing: '-0.03em', margin: 0,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          Roadmap
        </h1>
        <p style={{
          color: '#C9A84C', fontWeight: 600,
          fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
          margin: '0.5rem 0 0',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease 0.2s',
        }}>
          Your Journey to Financial Excellence
        </p>
        <p style={{
          color: '#7A6F60',
          fontSize: 'clamp(0.82rem, 1.4vw, 0.95rem)',
          maxWidth: 520, margin: '0.7rem auto 0', lineHeight: 1.55,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease 0.4s',
        }}>
          From base to summit — 12 intelligence suites that give Indian SMEs the clarity of a full-time CFO.
        </p>
      </div>

      {/* Mountain Scene */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 1100, margin: '0 auto', padding: '0 0.5rem' }}>
        <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: 'auto', display: 'block' }}>

          {/* SKY */}
          <rect width="1200" height="900" fill="#EDEAE3" />

          {/* ===== BACK MOUNTAINS (low-poly) ===== */}
          {/* Left back mountain */}
          <polygon points="0,820 60,550 120,590 200,480 270,560 340,820" fill="#C8C2B8" />
          <polygon points="60,550 120,590 200,480" fill="#BAB4AA" />
          <polygon points="0,820 60,550 90,680 30,820" fill="#C0BAB0" />
          <polygon points="120,590 270,560 340,820 200,820" fill="#D0CAC0" />
          <polygon points="200,480 270,560 240,500" fill="#B5AFA5" />

          {/* Right back mountain */}
          <polygon points="880,820 960,530 1020,570 1090,470 1140,540 1200,820" fill="#C5BFB5" />
          <polygon points="960,530 1020,570 1090,470" fill="#B8B2A8" />
          <polygon points="880,820 960,530 980,660 900,820" fill="#BEB8AE" />
          <polygon points="1020,570 1140,540 1200,820 1060,820" fill="#CCC6BC" />

          {/* ===== MAIN MOUNTAIN (wide, centered, low-poly) ===== */}
          {/* Base shape */}
          <polygon points="120,820 380,450 480,500 560,350 630,400 700,80 750,220 820,320 900,450 1080,820" fill="#D6D0C6" />

          {/* Left face — lighter facets */}
          <polygon points="120,820 380,450 300,620" fill="#C2BCB2" />
          <polygon points="120,820 300,620 250,820" fill="#CCC6BC" />
          <polygon points="300,620 380,450 480,500 420,580" fill="#BFB9AF" />
          <polygon points="300,620 420,580 380,700 250,820" fill="#D2CCC2" />
          <polygon points="380,700 420,580 520,660 480,820" fill="#C8C2B8" />
          <polygon points="480,500 560,350 540,490" fill="#B8B2A8" />
          <polygon points="420,580 480,500 540,490 520,600" fill="#C5BFB5" />
          <polygon points="520,600 540,490 580,550 520,660" fill="#CCCABE" />
          <polygon points="560,350 630,400 600,380" fill="#B2ACA2" />
          <polygon points="540,490 560,350 600,380 580,470" fill="#BDB7AD" />

          {/* Right face — darker facets */}
          <polygon points="700,80 750,220 730,170" fill="#E8E2D8" />
          <polygon points="700,80 630,400 580,350 650,220" fill="#A8A29C" />
          <polygon points="700,80 750,220 820,320 770,200" fill="#ADA7A0" />
          <polygon points="750,220 820,320 800,280" fill="#A5A098" />
          <polygon points="820,320 900,450 870,400" fill="#B2ACA5" />
          <polygon points="900,450 1080,820 980,660" fill="#ABA5A0" />
          <polygon points="1080,820 980,660 1020,820" fill="#B5AFA8" />
          <polygon points="630,400 700,80 770,200 710,370" fill="#A5A098" />
          <polygon points="710,370 770,200 800,280 760,380" fill="#ADA7A2" />
          <polygon points="760,380 800,280 870,400 830,420" fill="#A8A2A0" />
          <polygon points="830,420 870,400 980,660 900,560" fill="#B0AAA5" />
          <polygon points="900,560 980,660 950,620" fill="#A5A098" />

          {/* Snow patches near summit */}
          <polygon points="670,160 700,80 730,170 710,185" fill="#F5F2EC" />
          <polygon points="700,80 715,125 705,105" fill="#FFFFFF" />
          <polygon points="650,210 670,160 690,200" fill="#EBE6DE" opacity="0.7" />
          <polygon points="620,280 645,230 665,270" fill="#E5E0D8" opacity="0.4" />
          <polygon points="560,350 590,310 610,345" fill="#E8E2DC" opacity="0.3" />

          {/* Additional ice/snow detail */}
          <polygon points="680,140 700,80 710,150" fill="#F8F5F0" opacity="0.6" />

          {/* ===== GROUND ===== */}
          <rect x="0" y="815" width="1200" height="85" fill="#C4B89C" />
          <rect x="0" y="810" width="1200" height="8" fill="#8B9E6B" opacity="0.45" />
          {/* Grass tufts */}
          {[40, 90, 150, 230, 310, 400, 500, 600, 700, 800, 900, 1000, 1080, 1140].map((gx, i) => (
            <path key={`g${i}`} d={`M${gx} 812 Q${gx + 5} 800 ${gx + 10} 812`} fill="#7A9E5A" opacity="0.5" />
          ))}

          {/* ===== TREES ===== */}
          {[
            { x: 50, s: 1.1 }, { x: 110, s: 0.8 }, { x: 190, s: 0.65 },
            { x: 350, s: 0.5 }, { x: 420, s: 0.4 },
            { x: 800, s: 0.45 }, { x: 870, s: 0.55 },
            { x: 960, s: 0.9 }, { x: 1040, s: 0.7 }, { x: 1110, s: 1.0 }, { x: 1160, s: 0.6 },
          ].map((t, i) => (
            <g key={`t${i}`}>
              <rect x={t.x - 1.5} y={812 - 16 * t.s} width="3" height={16 * t.s} fill="#6B4226" />
              <polygon
                points={`${t.x},${812 - 32 * t.s} ${t.x - 9 * t.s},${812 - 16 * t.s} ${t.x + 9 * t.s},${812 - 16 * t.s}`}
                fill={i % 2 === 0 ? '#2D5016' : '#3A6B24'} opacity="0.8"
              />
            </g>
          ))}
          {/* Slope trees */}
          {[
            { x: 200, y: 750, s: 0.4 }, { x: 310, y: 700, s: 0.35 },
            { x: 860, y: 710, s: 0.4 }, { x: 940, y: 750, s: 0.35 },
          ].map((t, i) => (
            <g key={`st${i}`}>
              <rect x={t.x - 1} y={t.y - 10 * t.s} width="2" height={10 * t.s} fill="#4A3520" />
              <polygon
                points={`${t.x},${t.y - 22 * t.s} ${t.x - 6 * t.s},${t.y - 10 * t.s} ${t.x + 6 * t.s},${t.y - 10 * t.s}`}
                fill="#1F3D0E" opacity="0.55"
              />
            </g>
          ))}

          {/* ===== GREEN PATH (completed: stops 1-3) ===== */}
          <path d={greenPath} stroke="#34C759" strokeWidth="3.5" fill="none" strokeDasharray="8 5" strokeLinecap="round" />

          {/* ===== GOLD PATH (remaining: stops 3-12) ===== */}
          <path d={goldPath} stroke="#C9A84C" strokeWidth="3" fill="none" strokeDasharray="8 5" strokeLinecap="round" opacity="0.65" />

          {/* ===== WAYPOINT DOTS ===== */}
          {waypoints.map((wp, i) => {
            const isCompleted = i < 3;
            const dotColor = isCompleted ? '#34C759' : '#C9A84C';
            return (
              <g key={`wp${i}`}>
                {/* Pulse ring */}
                {isCompleted && (
                  <circle cx={wp.x} cy={wp.y} r="7" fill="none" stroke="#34C759" strokeWidth="1.5" opacity="0.4">
                    <animate attributeName="r" values="7;15;7" dur="2.5s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={wp.x} cy={wp.y}
                  r={hoveredStop === i ? 9 : 6.5}
                  fill={dotColor} stroke="white" strokeWidth="2.5"
                  style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredStop(i)}
                  onMouseLeave={() => setHoveredStop(null)}
                />
              </g>
            );
          })}

          {/* ===== FLAG ===== */}
          <line x1="700" y1="82" x2="700" y2="48" stroke="#8B6914" strokeWidth="2.5" />
          <polygon points="700,48 730,58 700,68" fill="#E53E3E">
            <animateTransform attributeName="transform" type="rotate" values="-2,700,58;3,700,58;-2,700,58" dur="2s" repeatCount="indefinite" />
          </polygon>

          {/* ===== CLIMBER (at Stop 3) ===== */}
          <g>
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="2s" repeatCount="indefinite" />
            <circle cx={waypoints[2].x + 16} cy={waypoints[2].y - 16} r="5" fill="#F5D0A9" />
            <path d={`M${waypoints[2].x + 10} ${waypoints[2].y - 16} Q${waypoints[2].x + 16} ${waypoints[2].y - 24} ${waypoints[2].x + 22} ${waypoints[2].y - 16}`} fill="#5D4E37" />
            <rect x={waypoints[2].x + 11} y={waypoints[2].y - 11} width="10" height="13" rx="3" fill="#C0392B" />
            <rect x={waypoints[2].x + 19} y={waypoints[2].y - 9} width="5" height="8" rx="1.5" fill="#8B4513" />
            <line x1={waypoints[2].x + 13} y1={waypoints[2].y + 2} x2={waypoints[2].x + 12} y2={waypoints[2].y + 10} stroke="#2C3E50" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={waypoints[2].x + 19} y1={waypoints[2].y + 2} x2={waypoints[2].x + 21} y2={waypoints[2].y + 10} stroke="#2C3E50" strokeWidth="2.5" strokeLinecap="round" />
            <line x1={waypoints[2].x + 26} y1={waypoints[2].y - 12} x2={waypoints[2].x + 29} y2={waypoints[2].y + 8} stroke="#8B7355" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          {/* YOU ARE HERE */}
          <rect x={waypoints[2].x + 38} y={waypoints[2].y - 14} width="78" height="17" rx="4" fill="white" stroke="#C9A84C" strokeWidth="1" />
          <text x={waypoints[2].x + 77} y={waypoints[2].y - 2} textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#2C2418" style={{ fontFamily: 'DM Sans, sans-serif' }}>YOU ARE HERE</text>
          <polygon points={`${waypoints[2].x + 38},${waypoints[2].y - 5} ${waypoints[2].x + 34},${waypoints[2].y - 2} ${waypoints[2].x + 38},${waypoints[2].y + 1}`} fill="white" />

          {/* ===== PRODUCT CHIPS ===== */}
          {stops.map((stop, i) => {
            const wp = waypoints[i];
            const isLeft = i % 2 === 0;
            const chipW = 185;
            const chipH = 28;
            const gap = 18;
            const chipX = isLeft ? wp.x - chipW - gap : wp.x + gap;
            const chipY = wp.y - chipH / 2;
            const isHovered = hoveredStop === i;
            const isCompleted = i < 3;

            return (
              <g
                key={stop.id}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : `translateY(${8}px)`,
                  transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 70}ms`,
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHoveredStop(i)}
                onMouseLeave={() => setHoveredStop(null)}
              >
                {/* Connector line */}
                <line
                  x1={wp.x + (isLeft ? -8 : 8)} y1={wp.y}
                  x2={isLeft ? chipX + chipW : chipX} y2={wp.y}
                  stroke={isCompleted ? '#34C759' : '#C9A84C'}
                  strokeWidth="1" strokeDasharray="3 3" opacity="0.4"
                />

                {/* Chip bg */}
                <rect
                  x={chipX} y={chipY} width={chipW} height={chipH} rx="6"
                  fill={isHovered ? '#FFFFFF' : 'rgba(255,255,255,0.9)'}
                  stroke={isHovered ? (isCompleted ? '#34C759' : '#C9A84C') : 'rgba(0,0,0,0.05)'}
                  strokeWidth={isHovered ? 1.5 : 0.8}
                  style={{
                    filter: isHovered
                      ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))'
                      : 'drop-shadow(0 1px 4px rgba(0,0,0,0.05))',
                    transition: 'all 0.2s ease',
                  }}
                />

                {/* Icon */}
                <rect x={chipX + 4} y={chipY + 3} width="22" height="22" rx="5" fill={stop.color} />
                <text x={chipX + 15} y={chipY + 18} textAnchor="middle" fontSize="11">{stop.emoji}</text>

                {/* Name */}
                <text x={chipX + 32} y={chipY + 13} fontSize="9" fontWeight="600" fill="#2C2418" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {stop.name}
                </text>

                {/* Badge */}
                <rect
                  x={chipX + 32} y={chipY + 17}
                  width={stop.status === 'live' ? 25 : 29} height="8" rx="2.5"
                  fill={stop.status === 'live' ? '#34C759' : '#FF9F0A'}
                />
                <text
                  x={chipX + 32 + (stop.status === 'live' ? 12.5 : 14.5)} y={chipY + 23.5}
                  textAnchor="middle" fontSize="5" fontWeight="700" fill="white"
                  style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.06em' }}
                >
                  {stop.status === 'live' ? 'LIVE' : 'SOON'}
                </text>

                {/* Tooltip */}
                {isHovered && (
                  <g>
                    <rect x={chipX + 2} y={chipY - 20} width={chipW - 4} height="16" rx="4" fill="#1a1814" opacity="0.93" />
                    <text x={chipX + chipW / 2} y={chipY - 9} textAnchor="middle" fontSize="6.5" fill="white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {stop.desc}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ===== BIRDS ===== */}
          {[
            { x: 80, y: 100, s: 10, dur: 20 },
            { x: 280, y: 60, s: 8, dur: 25 },
            { x: 750, y: 50, s: 11, dur: 18 },
            { x: 500, y: 30, s: 7, dur: 28 },
            { x: 1000, y: 90, s: 9, dur: 22 },
            { x: 600, y: 350, s: 8, dur: 16 },
          ].map((b, i) => (
            <g key={`b${i}`} opacity={i === 5 ? 0.3 : 0.4}>
              <animateTransform attributeName="transform" type="translate" values={`0,0;${25 + i * 6},${-2 + i};0,0`} dur={`${b.dur}s`} repeatCount="indefinite" />
              <path
                d={`M${b.x - b.s / 2},${b.y} Q${b.x - b.s / 4},${b.y - b.s / 2.5} ${b.x},${b.y} Q${b.x + b.s / 4},${b.y - b.s / 2.5} ${b.x + b.s / 2},${b.y}`}
                stroke="#5D4E37" strokeWidth="1.2" fill="none" strokeLinecap="round"
              />
            </g>
          ))}

        </svg>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '2.5rem',
        padding: '1rem 1rem 3rem',
        fontSize: 'clamp(0.78rem, 1.2vw, 0.9rem)', color: '#7A6F60',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34C759' }} />
          <span>Live today</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF9F0A' }} />
          <span>Coming soon</span>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
