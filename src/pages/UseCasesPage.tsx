import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, TrendingUp, Shield, Briefcase, Users, Target, ArrowRight,
  DollarSign, BarChart3, PieChart, LineChart, Droplet, AlertCircle,
  FileCheck, Calculator, Wallet, Activity, Package, FileBarChart,
  GitBranch, Boxes,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const USE_CASES = [
  { id: 1, category: 'finance', title: 'Monthly Financial Close Report', description: 'Generate period-end close reports with automated reconciliation and variance analysis from your ERP exports.', icon: BarChart3, iconColor: '#F59E0B', iconBg: 'rgba(245,158,11,0.1)' },
  { id: 2, category: 'finance', title: 'Budget vs. Actual Analysis', description: 'Compare budgeted figures against actuals across departments with automated variance commentary.', icon: PieChart, iconColor: '#10B981', iconBg: 'rgba(16,185,129,0.1)' },
  { id: 3, category: 'finance', title: 'Cash Flow Forecast', description: 'Build rolling cash flow forecasts from AR/AP data, bank statements, and revenue projections.', icon: Droplet, iconColor: '#06B6D4', iconBg: 'rgba(6,182,212,0.1)' },
  { id: 4, category: 'finance', title: 'P&L Statement Generator', description: 'Auto-generate monthly P&L statements with YoY comparisons and trend analysis from accounting data.', icon: DollarSign, iconColor: '#8B6914', iconBg: 'rgba(139,105,20,0.1)' },
  { id: 5, category: 'finance', title: 'Expense Categorization', description: 'Automatically categorize and analyze vendor spend with smart tagging and cost optimization suggestions.', icon: Wallet, iconColor: '#C41E1E', iconBg: 'rgba(196,30,30,0.1)' },
  { id: 6, category: 'finance', title: 'Revenue Recognition Report', description: 'Track MRR, ARR, churn, and revenue cohorts from subscription and payment data.', icon: TrendingUp, iconColor: '#10B981', iconBg: 'rgba(16,185,129,0.1)' },
  { id: 7, category: 'compliance', title: 'GST Return Preparation', description: 'Auto-generate GSTR-1, GSTR-3B with ITC reconciliation and filing readiness checks.', icon: FileCheck, iconColor: '#8B5CF6', iconBg: 'rgba(139,92,246,0.1)' },
  { id: 8, category: 'compliance', title: 'Audit Trail Documentation', description: 'Generate complete audit documentation with source traceability for every data point.', icon: GitBranch, iconColor: '#3B82F6', iconBg: 'rgba(59,130,246,0.1)' },
  { id: 9, category: 'compliance', title: 'TDS Compliance Report', description: 'Automate TDS calculation, deduction tracking, and quarterly return generation.', icon: Calculator, iconColor: '#14B8A6', iconBg: 'rgba(20,184,166,0.1)' },
  { id: 10, category: 'operations', title: 'Weekly Operations Report', description: 'Aggregate operational KPIs from multiple systems into a structured weekly summary.', icon: Activity, iconColor: '#F59E0B', iconBg: 'rgba(245,158,11,0.1)' },
  { id: 11, category: 'operations', title: 'Vendor Performance Report', description: 'Analyze supplier performance, lead times, and inventory levels from procurement data.', icon: Package, iconColor: '#8B6914', iconBg: 'rgba(139,105,20,0.1)' },
  { id: 12, category: 'operations', title: 'Inventory Tracking Dashboard', description: 'Monitor stock levels, reorder points, and SKU performance across warehouses.', icon: Boxes, iconColor: '#C41E1E', iconBg: 'rgba(196,30,30,0.1)' },
  { id: 13, category: 'executive', title: 'Board Meeting Deck', description: 'Create quarterly board presentations from financial, product, and growth data sources.', icon: Target, iconColor: '#C41E1E', iconBg: 'rgba(196,30,30,0.1)' },
  { id: 14, category: 'executive', title: 'Monthly Investor Update', description: 'Generate polished investor updates with KPIs, burn rate, milestones, and growth metrics.', icon: LineChart, iconColor: '#3B82F6', iconBg: 'rgba(59,130,246,0.1)' },
  { id: 15, category: 'executive', title: 'Executive KPI Dashboard', description: 'Build comprehensive executive dashboards pulling from finance, sales, and operations data.', icon: FileBarChart, iconColor: '#8B5CF6', iconBg: 'rgba(139,92,246,0.1)' },
];

const CATEGORIES = [
  { id: 'all', label: 'ALL', icon: Target },
  { id: 'finance', label: 'FINANCE', icon: TrendingUp },
  { id: 'compliance', label: 'COMPLIANCE', icon: Shield },
  { id: 'operations', label: 'OPERATIONS', icon: Briefcase },
  { id: 'executive', label: 'EXECUTIVE', icon: Users },
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

  const categoryCount =
    activeCategory === 'all' ? USE_CASES.length : USE_CASES.filter((u) => u.category === activeCategory).length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F4EDDA 0%, #FFF9F0 100%)' }}>
      <section style={{ padding: '80px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(26,16,8,0.6)', textTransform: 'uppercase', marginBottom: '16px' }}>
            USE CASE LIBRARY
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '48px', fontWeight: 400, color: '#1A1008', marginBottom: '24px', lineHeight: 1.2 }}>
            {categoryCount} ways teams use <br />
            <span style={{ fontStyle: 'italic', color: '#8B6914' }}>FYNHelp</span>
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', color: 'rgba(26,16,8,0.7)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Browse real workflows across finance, compliance, operations, and more — all powered by your data.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ maxWidth: '700px', margin: '0 auto 48px' }}
        >
          <div style={{ position: 'relative', background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(139,105,20,0.15)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)', boxShadow: '0 4px 16px rgba(139,105,20,0.08)' }}>
            <Search size={20} color="rgba(26,16,8,0.5)" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search use cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '20px 20px 20px 56px', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', fontSize: '16px', color: '#1A1008' }}
            />
          </div>
        </motion.div>
      </section>

      <section style={{ padding: '0 24px 48px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  background: isActive ? 'linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)' : 'rgba(255,255,255,0.9)',
                  border: `2px solid ${isActive ? 'transparent' : 'rgba(139,105,20,0.15)'}`,
                  color: isActive ? '#FFF' : 'rgba(26,16,8,0.7)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(10px)',
                  boxShadow: isActive ? '0 4px 12px rgba(139,105,20,0.3)' : 'none',
                }}
              >
                <Icon size={16} strokeWidth={2.5} />
                {cat.label}
              </motion.button>
            );
          })}
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'rgba(26,16,8,0.5)', fontWeight: 600 }}>
          {filteredCases.length} USE CASE{filteredCases.length !== 1 ? 'S' : ''}
        </p>
      </section>

      <section style={{ padding: '0 24px 80px', maxWidth: '1400px', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}
          >
            {filteredCases.map((useCase, idx) => (
              <UseCaseCard key={useCase.id} useCase={useCase} delay={idx * 0.05} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredCases.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 24px' }}>
            <AlertCircle size={48} color="rgba(26,16,8,0.3)" style={{ marginBottom: '16px' }} />
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: 'rgba(26,16,8,0.5)', fontWeight: 600 }}>
              No use cases found. Try a different search or category.
            </p>
          </motion.div>
        )}
      </section>

      <section style={{ padding: '80px 24px', background: 'rgba(139,105,20,0.05)', borderTop: '1px solid rgba(139,105,20,0.15)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '40px', fontWeight: 400, color: '#1A1008', marginBottom: '16px' }}>
              Don't see your use case?
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px', color: 'rgba(26,16,8,0.7)', marginBottom: '32px', lineHeight: 1.6 }}>
              FYNHelp adapts to any data-to-document workflow. <br />
              Tell us what you're building.
            </p>
            <button
              onClick={() => navigate('/waitlist')}
              style={{
                padding: '16px 40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)',
                border: 'none',
                color: '#FFF',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(139,105,20,0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              TRY NOW FOR FREE
              <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function UseCaseCard({ useCase, delay }: any) {
  const Icon = useCase.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -8 }}
      style={{
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid rgba(139,105,20,0.15)',
        borderRadius: '20px',
        padding: '32px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 16px rgba(139,105,20,0.08)',
        minHeight: '280px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: useCase.iconBg,
        border: '2px solid rgba(139,105,20,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px',
        flexShrink: 0,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 16px rgba(139,105,20,0.12)',
      }}>
        <Icon size={32} color={useCase.iconColor} strokeWidth={2} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '18px',
          fontWeight: 700,
          color: '#1A1008',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          lineHeight: 1.3,
        }}>
          {useCase.title}
        </h3>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: 'rgba(26,16,8,0.7)',
          lineHeight: 1.6,
          marginBottom: '20px',
          flex: 1,
        }}>
          {useCase.description}
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          fontWeight: 700,
          color: '#8B6914',
        }}>
          Learn More
          <ArrowRight size={16} strokeWidth={3} />
        </div>
      </div>
    </motion.div>
  );
}
