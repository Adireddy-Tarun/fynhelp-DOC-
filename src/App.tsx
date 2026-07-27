import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import AdminLayout, { AdminProtected } from "@/components/admin/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage.tsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.tsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.tsx";
import AdminUserDetailPage from "./pages/admin/AdminUserDetailPage.tsx";
import AdminAuditLogsPage from "./pages/admin/AdminAuditLogsPage.tsx";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage.tsx";
import AdminPlaceholderPage from "./pages/admin/AdminPlaceholderPage.tsx";
import AdminSubscriptionsPage from "./pages/admin/AdminSubscriptionsPage.tsx";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage.tsx";
import AdminAIMonitoringPage from "./pages/admin/AdminAIMonitoringPage.tsx";
import AdminFeatureFlagsPage from "./pages/admin/AdminFeatureFlagsPage.tsx";
import AdminCommunicationsPage from "./pages/admin/AdminCommunicationsPage.tsx";
import AdminSupportPage from "./pages/admin/AdminSupportPage.tsx";
import AdminSupportTicketDetailPage from "./pages/admin/AdminSupportTicketDetailPage.tsx";
import AdminSystemHealthPage from "./pages/admin/AdminSystemHealthPage.tsx";
import AdminContentPage from "./pages/admin/AdminContentPage.tsx";
import AdminCeoViewPage from "./pages/admin/AdminCeoViewPage.tsx";
import AdminWaitlistPage from "./pages/admin/AdminWaitlistPage.tsx";
import AdminInternalAccessPage from "./pages/admin/AdminInternalAccessPage.tsx";
import AdminMediaLibraryPage from "./pages/admin/AdminMediaLibraryPage.tsx";
import AdminBlogPage from "./pages/admin/AdminBlogPage.tsx";
import CAVerificationPage from "./pages/admin/CAVerificationPage.tsx";
import BlogAdminLoginPage from "./pages/admin/BlogAdminLoginPage.tsx";
import BlogAdminEditorPage from "./pages/admin/BlogAdminEditorPage.tsx";
import { BlogAdminProvider } from "./contexts/BlogAdminContext.tsx";
import InternLoginPage from "./pages/intern/InternLoginPage";
import InternResourcesPage from "./pages/intern/InternResourcesPage";
import ProtectedCeoRoute from "@/components/admin/ProtectedCeoRoute";
import Index from "./pages/Index.tsx";
import WaitlistPopup from "./components/WaitlistPopup";
import { Sentry } from "@/lib/monitoring";
import { usePageTracking } from "@/hooks/usePageTracking";

import PricingPage from "./pages/PricingPage.tsx";
import PublicSecurityPage from "./pages/SecurityPage.tsx";

import BlogPage from "./pages/BlogPage.tsx";
import BlogArticlePage from "./pages/BlogArticlePage.tsx";
import ResourcesPage from "./pages/ResourcesPage.tsx";
import UseCasesPage from "./pages/UseCasesPage.tsx";

import CommunityPage from "./pages/CommunityPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import CAFirmsPage from "./pages/CAFirmsPage.tsx";
import WaitlistPage from "./pages/WaitlistPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import CockpitPage from "./pages/dashboard/CockpitPage.tsx";
import CashFlowPage from "./pages/dashboard/CashFlowPage.tsx";

import LiquidityIntelligencePage from "./pages/dashboard/LiquidityIntelligencePage.tsx";
import RevenueIntelligencePage from "./pages/dashboard/RevenueIntelligencePage.tsx";
import ReceivablesPage from "./pages/dashboard/ReceivablesPage.tsx";
import PayablesPage from "./pages/dashboard/PayablesPage.tsx";
import GSTPage from "./pages/dashboard/GSTPage.tsx";
import HRPage from "./pages/dashboard/HRPage.tsx";
import FilingCalendarPage from "./pages/dashboard/FilingCalendarPage.tsx";
import FynnyChatPage from "./pages/dashboard/FynnyChatPage.tsx";
import CFOReportsPage from "./pages/dashboard/CFOReportsPage.tsx";
import BooksOfAccountsPage from "./pages/dashboard/BooksOfAccountsPage.tsx";

import InvestorPage from "./pages/dashboard/InvestorPage.tsx";
import ArchivedFeaturePage from "./pages/dashboard/ArchivedFeaturePage";
import ReportsPage from "./pages/intelligence/ReportsPage.tsx";
import CFOReportDetailPage from "./pages/dashboard/CFOReportDetailPage.tsx";
import VendorsPage from "./pages/dashboard/VendorsPage.tsx";
import CustomersPage from "./pages/dashboard/CustomersPage.tsx";
import CostPage from "./pages/dashboard/CostPage.tsx";
import CompliancePage from "./pages/dashboard/CompliancePage.tsx";
import AuditReadinessPage from "./pages/dashboard/AuditReadinessPage.tsx";
import PayrollPlannerPage from "./pages/dashboard/PayrollPlannerPage.tsx";

import DataImportPage from "./pages/dashboard/DataImportPage.tsx";
import ImportPage from "./pages/dashboard/ImportPage";

import CAAccessOverviewPage from "./pages/dashboard/CAAccessOverviewPage.tsx";
import SettingsPage from "./pages/dashboard/settings/SettingsPage.tsx";
import ProfilePage from "./pages/dashboard/settings/ProfilePage.tsx";
import SecurityPage from "./pages/dashboard/settings/SecurityPage.tsx";
import NotificationsPage from "./pages/dashboard/settings/NotificationsPage.tsx";
import BillingPage from "./pages/dashboard/settings/BillingPage.tsx";
import IntegrationsPage from "./pages/dashboard/settings/IntegrationsPage.tsx";
import BusinessProfilePage from "./pages/dashboard/settings/BusinessProfilePage.tsx";
import TeamAccessPage from "./pages/dashboard/settings/TeamAccessPage.tsx";
import CAAccessPage from "./pages/dashboard/settings/CAAccessPage.tsx";
import LanguagePage from "./pages/dashboard/settings/LanguagePage.tsx";
import InvoicesListPage from "./pages/dashboard/InvoicesListPage.tsx";
import ExpensesListPage from "./pages/dashboard/ExpensesListPage.tsx";
import EmployeesListPage from "./pages/dashboard/EmployeesListPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import MyCAPage from "./pages/dashboard/MyCAPage.tsx";
import DemoLogin from "./pages/demo/DemoLogin.tsx";
import DemoUpload from "./pages/demo/DemoUpload.tsx";
import DemoOnboarding from "./pages/demo/DemoOnboarding.tsx";
import CADemoPage from "./pages/demo/CADemoPage.tsx";
import DemoModeBanner from "./components/demo/DemoModeBanner";
import IntelligencePage from "./pages/intelligence/IntelligencePage.tsx";
// Demo-only tree (fully isolated from /dashboard)
import DemoIntelligencePage from "./demo/pages/DemoIntelligencePage.tsx";
import DemoReportsPage from "./demo/pages/DemoReportsPage.tsx";
import DemoCustomersPage from "./demo/pages/DemoCustomersPage.tsx";
import DemoVendorsPage from "./demo/pages/DemoVendorsPage.tsx";
import DemoInvoicesPage from "./demo/pages/DemoInvoicesPage.tsx";
import DemoExpensesPage from "./demo/pages/DemoExpensesPage.tsx";
import DemoEmployeesPage from "./demo/pages/DemoEmployeesPage.tsx";
import DemoCustomerPage from "./demo/pages/details/DemoCustomerPage.tsx";
import DemoVendorPage from "./demo/pages/details/DemoVendorPage.tsx";
import DemoInvoicePage from "./demo/pages/details/DemoInvoicePage.tsx";
import DemoExpensePage from "./demo/pages/details/DemoExpensePage.tsx";
import DemoGstFilingPage from "./demo/pages/details/DemoGstFilingPage.tsx";
import DemoRiskPage from "./demo/pages/details/DemoRiskPage.tsx";
import DemoInsurancePage from "./demo/pages/details/DemoInsurancePage.tsx";
import DemoEmployeePage from "./demo/pages/details/DemoEmployeePage.tsx";
import DemoDealPage from "./demo/pages/details/DemoDealPage.tsx";
import DemoBankTxnPage from "./demo/pages/details/DemoBankTxnPage.tsx";
import {
  DecisionSimulatorComingSoon,
  MarketGrowthComingSoon,
  BankingComingSoon,
  CAPartnerComingSoon,
} from "./pages/coming-soon/ComingSoonPages.tsx";
import DashboardLayout from "./components/DashboardLayout.tsx";
import { CAAuthProvider } from "@/contexts/CAAuthContext";
import CALayout from "@/components/ca/CALayout";
import CALoginPage from "./pages/ca/CALoginPage";
import CARegisterPage from "./pages/ca/CARegisterPage";
import CAOnboardingPage from "./pages/ca/CAOnboardingPage.tsx";
import CAVerificationPendingPage from "./pages/ca/CAVerificationPendingPage.tsx";
import CADashboardPage from "./pages/ca/CADashboardPage";
import CAClientsPage from "./pages/ca/CAClientsPage";
import CAAddClientPage from "./pages/ca/CAAddClientPage";
import CAClientDetailPage from "./pages/ca/CAClientDetailPage";
import CAFilingCalendarPage from "./pages/ca/CAFilingCalendarPage";
import CAGstPortfolioPage from "./pages/ca/CAGstPortfolioPage";
import CATdsTrackerPage from "./pages/ca/CATdsTrackerPage";
import CACompliancePage from "./pages/ca/CACompliancePage";
import CAItcReconPage from "./pages/ca/CAItcReconPage";
import CAReportsPage from "./pages/ca/CAReportsPage";
import CABulkActionsPage from "./pages/ca/CABulkActionsPage";
import CAPortfolioHealthPage from "./pages/ca/CAPortfolioHealthPage";
import CARevenuePage from "./pages/ca/CARevenuePage";
import CANotificationsPage from "./pages/ca/CANotificationsPage";
import CASettingsPage from "./pages/ca/CASettingsPage";

// Route-tree-scoped provider wrappers.
// Each wrapper mounts ONLY the auth context(s) its own route tree needs,
// so CA pages never mount AuthProvider/AdminAuthProvider and vice versa.

function MainAppProviders() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

function AdminAppProviders() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}

function CAAppProviders() {
  return (
    <CAAuthProvider>
      <Outlet />
    </CAAuthProvider>
  );
}

const queryClient = new QueryClient();

function RouteTracker() {
  usePageTracking();
  return null;
}

const ErrorFallback = ({ error }: { error: unknown }) => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4EDDA" }}>
    <div style={{ textAlign: "center", maxWidth: 400, padding: "0 24px" }}>
      <p style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: 500, color: "#1A1008", marginBottom: "12px" }}>Something went wrong</p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "rgba(26,16,8,0.6)", marginBottom: "24px" }}>Our team has been notified and is looking into it.</p>
      <button onClick={() => (window.location.href = "/")} style={{ padding: "10px 24px", background: "#C41E1E", color: "#fff", border: "none", borderRadius: "8px", fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>Return to Home</button>
    </div>
  </div>
);

const App = () => (
  <Sentry.ErrorBoundary fallback={ErrorFallback}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteTracker />
          <WaitlistPopup />

        <Routes>
          {/* ===== ADMIN TREE: only mounts AdminAuthProvider ===== */}
          <Route element={<AdminAppProviders />}>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminProtected><AdminLayout /></AdminProtected>}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="ceo-view" element={<ProtectedCeoRoute><AdminCeoViewPage /></ProtectedCeoRoute>} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="waitlist" element={<AdminWaitlistPage />} />
              <Route path="users/:id" element={<AdminUserDetailPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
              <Route path="ai-monitoring" element={<AdminAIMonitoringPage />} />
              <Route path="content" element={<AdminContentPage />} />
              <Route path="support" element={<AdminSupportPage />} />
              <Route path="support/:id" element={<AdminSupportTicketDetailPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="communications" element={<AdminCommunicationsPage />} />
              <Route path="feature-flags" element={<AdminFeatureFlagsPage />} />
              <Route path="system-health" element={<AdminSystemHealthPage />} />
              <Route path="internal-access" element={<AdminInternalAccessPage />} />
              <Route path="media" element={<AdminMediaLibraryPage />} />
              <Route path="blog" element={<AdminBlogPage />} />
              <Route path="ca-verification" element={<CAVerificationPage />} />
            </Route>
            
          </Route>

          {/* ===== CA TREE: only mounts CAAuthProvider ===== */}
          <Route element={<CAAppProviders />}>
            <Route path="/ca/login" element={<CALoginPage />} />
            <Route path="/ca/register" element={<CARegisterPage />} />
            <Route path="/ca/onboarding" element={<CAOnboardingPage />} />
            <Route path="/ca/verification-pending" element={<CAVerificationPendingPage />} />
            <Route path="/ca" element={<CALayout />}>
              <Route path="dashboard" element={<CADashboardPage />} />
              <Route path="clients" element={<CAClientsPage />} />
              <Route path="clients/add" element={<CAAddClientPage />} />
              <Route path="client/:id" element={<CAClientDetailPage />} />
              <Route path="filing-calendar" element={<CAFilingCalendarPage />} />
              <Route path="gst-portfolio" element={<CAGstPortfolioPage />} />
              <Route path="tds-tracker" element={<CATdsTrackerPage />} />
              <Route path="compliance" element={<CACompliancePage />} />
              <Route path="itc-recon" element={<CAItcReconPage />} />
              <Route path="reports" element={<CAReportsPage />} />
              <Route path="bulk-actions" element={<CABulkActionsPage />} />
              <Route path="portfolio-health" element={<CAPortfolioHealthPage />} />
              <Route path="revenue" element={<CARevenuePage />} />
              <Route path="notifications" element={<CANotificationsPage />} />
              <Route path="settings" element={<CASettingsPage />} />
              <Route path="settings/team" element={<CASettingsPage />} />
              <Route path="settings/notifications" element={<CASettingsPage />} />
              <Route path="settings/defaults" element={<CASettingsPage />} />
              <Route path="settings/billing" element={<CASettingsPage />} />
            </Route>
          </Route>

          {/* ===== BLOG ADMIN TREE: standalone, only mounts BlogAdminProvider ===== */}
          <Route
            element={
              <BlogAdminProvider>
                <Outlet />
              </BlogAdminProvider>
            }
          >
            <Route path="/blog-admin/login" element={<BlogAdminLoginPage />} />
            <Route path="/blog-admin/editor" element={<BlogAdminEditorPage />} />
            <Route path="/blog-admin" element={<Navigate to="/blog-admin/login" replace />} />
            <Route path="/intern/login" element={<InternLoginPage />} />
            <Route path="/intern/resources" element={<InternResourcesPage />} />
            <Route path="/intern" element={<Navigate to="/intern/login" replace />} />
          </Route>



          {/* ===== MAIN APP TREE: only mounts AuthProvider (public site, demo, real client dashboard) ===== */}
          <Route element={<MainAppProviders />}>
            <Route path="/" element={<Index />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/security" element={<PublicSecurityPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/use-cases" element={<UseCasesPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/ca-firms" element={<CAFirmsPage />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/demo/login" element={<DemoLogin />} />
            <Route path="/demo/upload" element={<DemoUpload />} />
            <Route path="/demo/onboarding" element={<DemoOnboarding />} />
            <Route path="/demo/ca" element={<CADemoPage />} />
            <Route path="/demo/dashboard" element={<Navigate to="/demo/liquidity" replace />} />
            <Route path="/demo" element={<Navigate to="/demo/liquidity" replace />} />
            <Route path="/demo/cockpit"    element={<Navigate to="/demo/liquidity" replace />} />
            <Route path="/demo/liquidity"  element={<DemoIntelligencePage tab="liquidity" />} />
            <Route path="/demo/revenue"    element={<DemoIntelligencePage tab="revenue" />} />
            <Route path="/demo/cost"       element={<DemoIntelligencePage tab="cost" />} />
            <Route path="/demo/gst"        element={<DemoIntelligencePage tab="gst" />} />
            <Route path="/demo/governance" element={<DemoIntelligencePage tab="governance" />} />
            <Route path="/demo/hr"         element={<DemoIntelligencePage tab="hr" />} />
            <Route path="/demo/investor"   element={<DemoIntelligencePage tab="investor" />} />
            <Route path="/demo/fynny"      element={<DemoIntelligencePage tab="fynny" />} />
            <Route path="/demo/reports"    element={<DemoReportsPage />} />
            <Route path="/demo/customers"  element={<DemoCustomersPage />} />
            <Route path="/demo/customers/:id" element={<DemoCustomerPage />} />
            <Route path="/demo/vendors"    element={<DemoVendorsPage />} />
            <Route path="/demo/vendors/:id" element={<DemoVendorPage />} />
            <Route path="/demo/invoices"   element={<DemoInvoicesPage />} />
            <Route path="/demo/invoices/:id" element={<DemoInvoicePage />} />
            <Route path="/demo/expenses"   element={<DemoExpensesPage />} />
            <Route path="/demo/expenses/:id" element={<DemoExpensePage />} />
            <Route path="/demo/employees"  element={<DemoEmployeesPage />} />
            <Route path="/demo/employees/:id" element={<DemoEmployeePage />} />
            <Route path="/demo/gst/:id"    element={<DemoGstFilingPage />} />
            <Route path="/demo/risks/:id"  element={<DemoRiskPage />} />
            <Route path="/demo/insurance/:id" element={<DemoInsurancePage />} />
            <Route path="/demo/deals/:id"  element={<DemoDealPage />} />
            <Route path="/demo/bank/:id"   element={<DemoBankTxnPage />} />
            <Route path="/demo/decision-simulator" element={<DemoModeBanner><DecisionSimulatorComingSoon /></DemoModeBanner>} />
            <Route path="/demo/market-growth"      element={<DemoModeBanner><MarketGrowthComingSoon /></DemoModeBanner>} />
            <Route path="/demo/banking"            element={<DemoModeBanner><BankingComingSoon /></DemoModeBanner>} />
            <Route path="/demo/ca-partner"         element={<DemoModeBanner><CAPartnerComingSoon /></DemoModeBanner>} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<Navigate to="/login" replace />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            <Route path="/dashboard/cockpit"   element={<DashboardLayout><IntelligencePage mode="live" tab="liquidity" /></DashboardLayout>} />
            <Route path="/dashboard/360" element={<Navigate to="/dashboard/liquidity" replace />} />
            <Route path="/dashboard/cash-flow" element={<CashFlowPage />} />
            <Route path="/dashboard/runway" element={<Navigate to="/dashboard/liquidity" replace />} />
            <Route path="/dashboard/liquidity"            element={<DashboardLayout><IntelligencePage mode="live" tab="liquidity" /></DashboardLayout>} />
            <Route path="/dashboard/revenue-intelligence" element={<DashboardLayout><IntelligencePage mode="live" tab="revenue" /></DashboardLayout>} />
            <Route path="/dashboard/cost"                 element={<DashboardLayout><IntelligencePage mode="live" tab="cost" /></DashboardLayout>} />
            <Route path="/dashboard/gst"                  element={<DashboardLayout><IntelligencePage mode="live" tab="gst" /></DashboardLayout>} />
            <Route path="/dashboard/compliance"           element={<DashboardLayout><ArchivedFeaturePage /></DashboardLayout>} />
            <Route path="/dashboard/hr"                   element={<DashboardLayout><ArchivedFeaturePage /></DashboardLayout>} />
            <Route path="/dashboard/investor"             element={<DashboardLayout><InvestorPage /></DashboardLayout>} />
            <Route path="/dashboard/receivables" element={<ReceivablesPage />} />
            <Route path="/dashboard/payables" element={<PayablesPage />} />
            <Route path="/dashboard/simulator" element={<DashboardLayout><ArchivedFeaturePage /></DashboardLayout>} />
            <Route path="/dashboard/decision-simulator" element={<DashboardLayout><ArchivedFeaturePage /></DashboardLayout>} />
            <Route path="/dashboard/tds-tax" element={<Navigate to="/dashboard/gst?tab=tds" replace />} />
            <Route path="/dashboard/filing-calendar" element={<FilingCalendarPage />} />
            <Route path="/dashboard/fynny-chat" element={<DashboardLayout><IntelligencePage mode="live" tab="fynny" /></DashboardLayout>} />
            <Route path="/dashboard/reports" element={<ReportsPage mode="live" />} />
            <Route path="/dashboard/reports/books" element={<BooksOfAccountsPage />} />
            <Route path="/dashboard/reports/:id" element={<CFOReportDetailPage />} />
            <Route path="/dashboard/vendors" element={<VendorsPage />} />

            <Route path="/dashboard/customers" element={<CustomersPage />} />
            <Route path="/dashboard/invoices" element={<InvoicesListPage />} />
            <Route path="/dashboard/expenses" element={<ExpensesListPage />} />
            <Route path="/dashboard/employees" element={<EmployeesListPage />} />
            <Route path="/dashboard/audit-readiness" element={<AuditReadinessPage />} />
            <Route path="/dashboard/payroll" element={<PayrollPlannerPage />} />
            <Route path="/dashboard/working-capital" element={<Navigate to="/dashboard/liquidity" replace />} />
            <Route path="/dashboard/market-growth" element={<DashboardLayout><ArchivedFeaturePage /></DashboardLayout>} />
            <Route path="/dashboard/banking" element={<DashboardLayout><ArchivedFeaturePage /></DashboardLayout>} />
            <Route path="/dashboard/data-import" element={<DataImportPage />} />
            <Route path="/dashboard/import" element={<DashboardLayout><ImportPage /></DashboardLayout>} />
            
            <Route path="/dashboard/ca-partner" element={<DashboardLayout><ArchivedFeaturePage /></DashboardLayout>} />
            <Route path="/dashboard/ca-access" element={<CAAccessOverviewPage />} />
            <Route path="/dashboard/my-ca" element={<DashboardLayout><MyCAPage /></DashboardLayout>} />
            <Route path="/dashboard/settings" element={<SettingsPage />}>
              <Route index element={<Navigate to="/dashboard/settings/personal" replace />} />
              <Route path="personal" element={<ProfilePage />} />
              <Route path="profile" element={<Navigate to="/dashboard/settings/personal" replace />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="language" element={<LanguagePage />} />
              <Route path="preferences" element={<Navigate to="/dashboard/settings/language" replace />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="business" element={<BusinessProfilePage />} />
              <Route path="team" element={<TeamAccessPage />} />
              <Route path="ca-access" element={<CAAccessPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </Sentry.ErrorBoundary>
);

export default App;

