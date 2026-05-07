import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, TrendingUp, Shield, Briefcase, Users, Target, ArrowRight,
  DollarSign, BarChart3, PieChart, LineChart, Droplet, AlertCircle,
  FileCheck, Calculator, Wallet, Activity, Package, FileBarChart,
  GitBranch, Boxes, Sparkles, ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FynLogo from '@/components/FynLogo';

const USE_CASES = [
  { id: 1, category: 'finance', title: 'Monthly Financial Close Report', description: 'Generate period-end close reports with automated reconciliation and variance analysis from your ERP exports.', icon: BarChart3, gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FDC830 100%)', glowColor: 'rgba(247,147,30,0.4)', route: '/dashboard/reports?template=monthly-close' },
  { id: 2, category: 'finance', title: 'Budget vs. Actual Analysis', description: 'Compare budgeted figures against actuals across departments with automated variance commentary.', icon: PieChart, gradient: 'linear-gradient(135deg, #F7971E 0%, #FFD200 100%)', glowColor: 'rgba(255,210,0,0.4)', route: '/dashboard/reports?template=budget-vs-actual' },
  { id: 3, category: 'finance', title: 'Cash Flow Forecast', description: 'Build rolling cash flow forecasts from AR/AP data, bank statements, and revenue projections.', icon: Droplet, gradient: 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)', glowColor: 'rgba(47,128,237,0.4)', route: '/dashboard/cash-flow' },
  { id: 4, category: 'finance', title: 'P&L Statement Generator', description: 'Auto-generate monthly P&L statements with YoY comparisons and trend analysis.', icon: DollarSign, gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', glowColor: 'rgba(56,239,125,0.4)', route: '/dashboard/reports?template=pnl' },
  { id: 5, category: 'compliance', title: 'GST Return Preparation', description: 'Auto-generate GSTR-1, GSTR-3B with ITC reconciliation and filing readiness checks.', icon: FileCheck, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', glowColor: 'rgba(118,75,162,0.4)', route: '/dashboard/gst' },
  { id: 6, category: 'compliance', title: 'Audit Trail Documentation', description: 'Generate complete audit documentation with source traceability for every data point.', icon: GitBranch, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', glowColor: 'rgba(245,87,108,0.4)', route: '/dashboard/audit-readiness' },
  { id: 7, category: 'compliance', title: 'TDS Compliance Report', description: 'Automate TDS calculation, deduction tracking, and quarterly return generation.', icon: Calculator, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', glowColor: 'rgba(0,242,254,0.4)', route: '/dashboard/tds-tax' },
  { id: 8, category: 'operations', title: 'Weekly Operations Report', description: 'Aggregate operational KPIs from multiple systems into a structured weekly summary.', icon: Activity, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', glowColor: 'rgba(254,225,64,0.4)', route: '/dashboard/reports?template=weekly-ops' },
  { id: 9, category: 'operations', title: 'Vendor Performance Report', description: 'Analyze supplier performance, lead times, and inventory levels from procurement data.', icon: Package, gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', glowColor: 'rgba(48,207,208,0.4)', route: '/dashboard/vendors' },
  { id: 10, category: 'operations', title: 'Inventory Tracking Dashboard', description: 'Monitor stock levels, reorder points, and SKU performance across warehouses.', icon: Boxes, gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', glowColor: 'rgba(254,214,227,0.4)', route: '/dashboard/reports?template=inventory' },
  { id: 11, category: 'executive', title: 'Board Meeting Deck', description: 'Create quarterly board presentations from financial, product, and growth data sources.', icon: Target, gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', glowColor: 'rgba(255,8,68,0.4)', route: '/dashboard/reports?template=board-deck' },
  { id: 12, category: 'executive', title: 'Monthly Investor Update', description: 'Generate polished investor updates with KPIs, burn rate, milestones, and growth metrics.', icon: LineChart, gradient: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', glowColor: 'rgba(255,110,127,0.4)', route: '/dashboard/reports?template=investor-update' },
  { id: 13, category: 'executive', title: 'Executive KPI Dashboard', description: 'Build comprehensive executive dashboards pulling from finance, sales, and operations.', icon: FileBarChart, gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', glowColor: 'rgba(142,197,252,0.4)', route: '/dashboard/360' },
  { id: 14, category: 'hr', title: 'Headcount & Attrition Report', description: 'Track headcount changes, attrition rates, and hiring velocity from HRIS data exports.', icon: Users, gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', glowColor: 'rgba(60,186,146,0.4)', route: '/dashboard/hr' },
  { id: 15, category: 'hr', title: 'Compensation Benchmarking', description: 'Analyze compensation data against market benchmarks with equity and band distribution.', icon: Wallet, gradient: 'linear-gradient(135deg, #74ebd5 0%, #9face6 100%)', glowColor: 'rgba(159,172,230,0.4)', route: '/dashboard/payroll' },
];

const CATEGORIES = [
  { id: 'all', label: 'ALL', icon: Target, gradient: 'linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)' },
  { id: 'finance', label: 'FINANCE', icon: TrendingUp, gradient: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)' },
  { id: 'compliance', label: 'COMPLIANCE', icon: Shield, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'operations', label: 'OPERATIONS', icon: Briefcase, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'executive', label: 'EXECUTIVE', icon: Users, gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
  { id: 'hr', label: 'HR & PEOPLE', icon: Users, gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)' },
];

export default function UseCasesPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = USE_CASES.filter((useCase) => {
    const matchesCategory = activeCategory === 'all' || useCase.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      useCase.title.toLowerCase().includes(q) ||
      useCase.description.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const categoryCount = filteredCases.length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F4EDDA 0%, #FFF9F0 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Top Navigation Bar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(253,251,247,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(139,105,20,0.15)', padding: '20px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <motion.div whileHover={{ scale: 1.05 }} onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: 700, color: '#FFF', boxShadow: '0 4px 16px rgba(139,105,20,0.3)' }}>
              F
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '24px', fontWeight: 800, color: '#1A1008', letterSpacing: '-0.5px' }}>
              FYN<span style={{ background: 'linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Help</span>
            </span>
          </motion.div>
          <motion.button whileHover={{ scale: 1.05, x: -4 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(139,105,20,0.15)', color: '#1A1008', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(10px)', boxShadow: '0 2px 8px rgba(139,105,20,0.08)' }}>
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back to Home
          </motion.button>
        </div>
      </nav>

      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,30,30,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }}
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,105,20,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }}
      />

      <section style={{ padding: '80px 24px 60px', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Sparkles size={24} color="#8B6914" />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(26,16,8,0.6)', textTransform: 'uppercase' }}>USE CASE LIBRARY</p>
            <Sparkles size={24} color="#C41E1E" />
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '64px', fontWeight: 400, color: '#1A1008', marginBottom: '28px', lineHeight: 1.2 }}>
            {categoryCount} ways teams use <br />
            <motion.span
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ fontStyle: 'italic', background: 'linear-gradient(90deg, #C41E1E 0%, #8B6914 50%, #C41E1E 100%)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '72px', fontWeight: 700 }}
            >
              FYNHelp
            </motion.span>
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '20px', color: 'rgba(26,16,8,0.7)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.7, fontWeight: 500 }}>
            Browse real workflows across finance, compliance, operations, and more — all powered by your data.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          style={{ maxWidth: '700px', margin: '0 auto 48px' }}
        >
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(139,105,20,0.15)', backgroundImage: 'linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', border: '2px solid transparent' }}>
            <Search size={22} color="rgba(26,16,8,0.5)" style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search use cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '22px 24px 22px 64px', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '17px', color: '#1A1008', fontWeight: 500 }}
            />
          </div>
        </motion.div>
      </section>

      <section style={{ padding: '0 24px 48px', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '16px 32px',
                  borderRadius: '16px',
                  background: isActive ? cat.gradient : 'rgba(255,255,255,0.95)',
                  border: `2px solid ${isActive ? 'transparent' : 'rgba(139,105,20,0.15)'}`,
                  color: isActive ? '#FFF' : 'rgba(26,16,8,0.7)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: isActive ? '0 8px 24px rgba(0,0,0,0.2)' : '0 2px 8px rgba(139,105,20,0.08)',
                }}
              >
                <Icon size={20} strokeWidth={2.5} />
                {cat.label}
              </motion.button>
            );
          })}
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', color: 'rgba(26,16,8,0.5)', fontWeight: 600 }}>
          {categoryCount} USE CASE{categoryCount !== 1 ? 'S' : ''}
        </p>
      </section>

      <section style={{ padding: '0 24px 80px', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}
          >
            {filteredCases.map((useCase, idx) => (
              <UseCaseCard3D key={useCase.id} useCase={useCase} delay={idx * 0.05} onClick={() => navigate(useCase.route)} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredCases.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 24px' }}>
            <AlertCircle size={56} color="rgba(26,16,8,0.3)" style={{ marginBottom: '20px' }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', color: 'rgba(26,16,8,0.5)', fontWeight: 600 }}>
              No use cases found. Try a different search or category.
            </p>
          </motion.div>
        )}
      </section>

      <section style={{ padding: '100px 24px', background: 'rgba(139,105,20,0.05)', borderTop: '1px solid rgba(139,105,20,0.15)', position: 'relative', overflow: 'hidden' }}>
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', top: '50%', left: '50%', width: '400px', height: '400px', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(196,30,30,0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }}
        />
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '52px', fontWeight: 400, color: '#1A1008', marginBottom: '20px' }}>
              Don't see your use case?
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '20px', color: 'rgba(26,16,8,0.7)', marginBottom: '40px', lineHeight: 1.7, fontWeight: 500 }}>
              FYNHelp adapts to any data-to-document workflow. <br />
              Tell us what you're building.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/waitlist')}
              style={{
                padding: '20px 52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)',
                border: 'none',
                color: '#FFF',
                fontFamily: 'Inter, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 12px 40px rgba(139,105,20,0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              TRY NOW FOR FREE
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ArrowRight size={22} strokeWidth={3} />
              </motion.div>
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function UseCaseCard3D({ useCase, delay, onClick }: any) {
  const Icon = useCase.icon;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      whileHover={{ y: -12, rotateX: 5, rotateY: 2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.98)',
        border: '1px solid rgba(139,105,20,0.12)',
        borderRadius: '24px',
        padding: '42px',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        backdropFilter: 'blur(20px)',
        boxShadow: isHovered
          ? `0 24px 60px ${useCase.glowColor}, 0 12px 24px rgba(0,0,0,0.08)`
          : '0 8px 24px rgba(139,105,20,0.08)',
        minHeight: '340px',
        display: 'flex',
        flexDirection: 'column',
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      <motion.div
        animate={{ rotate: isHovered ? [0, 360] : 0 }}
        transition={{ duration: 3, repeat: isHovered ? Infinity : 0, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: -2,
          borderRadius: '24px',
          background: useCase.gradient,
          opacity: isHovered ? 0.6 : 0,
          transition: 'opacity 0.4s',
          pointerEvents: 'none',
          filter: 'blur(8px)',
        }}
      />

      <motion.div
        animate={{ rotateY: isHovered ? [0, 360] : 0, scale: isHovered ? 1.1 : 1 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '84px',
          height: '84px',
          borderRadius: '20px',
          background: useCase.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '26px',
          flexShrink: 0,
          boxShadow: isHovered ? `0 16px 40px ${useCase.glowColor}` : '0 8px 24px rgba(0,0,0,0.12)',
          position: 'relative',
          zIndex: 1,
          transformStyle: 'preserve-3d',
          transform: 'translateZ(20px)',
        }}
      >
        <motion.div animate={{ rotate: isHovered ? 360 : 0 }} transition={{ duration: 0.6 }}>
          <Icon size={44} color="#FFF" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '22px', fontWeight: 800, color: '#1A1008', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.3 }}>
          {useCase.title}
        </h3>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: 'rgba(26,16,8,0.7)', lineHeight: 1.7, marginBottom: '26px', flex: 1, fontWeight: 500 }}>
          {useCase.description}
        </p>
        <motion.div
          animate={{ x: isHovered ? 8 : 0 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: 700, background: useCase.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          Learn More
          <ArrowRight size={20} strokeWidth={3} style={{ color: '#8B6914' }} />
        </motion.div>
      </div>

      <motion.div
        animate={{ scale: isHovered ? 1 : 0, rotate: isHovered ? 0 : 45 }}
        style={{ position: 'absolute', top: 24, right: 24, width: '10px', height: '10px', borderRadius: '50%', background: useCase.gradient, boxShadow: `0 0 20px ${useCase.glowColor}` }}
      />
    </motion.div>
  );
}
