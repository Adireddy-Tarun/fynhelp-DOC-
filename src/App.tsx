import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import ProtectedCeoRoute from "@/components/admin/ProtectedCeoRoute";
import Index from "./pages/Index.tsx";

import PricingPage from "./pages/PricingPage.tsx";
import PublicSecurityPage from "./pages/SecurityPage.tsx";

import BlogPage from "./pages/BlogPage.tsx";
import BlogArticlePage from "./pages/BlogArticlePage.tsx";
import ResourcesPage from "./pages/ResourcesPage.tsx";
import UseCasesPage from "./pages/UseCasesPage.tsx";

import CommunityPage from "./pages/CommunityPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import WaitlistPage from "./pages/WaitlistPage.tsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import CockpitPage from "./pages/dashboard/CockpitPage.tsx";
import Dashboard360Page from "./pages/dashboard/Dashboard360Page.tsx";
import CashFlowPage from "./pages/dashboard/CashFlowPage.tsx";
import RunwayPage from "./pages/dashboard/RunwayPage.tsx";
import LiquidityIntelligencePage from "./pages/dashboard/LiquidityIntelligencePage.tsx";
import ReceivablesPage from "./pages/dashboard/ReceivablesPage.tsx";
import PayablesPage from "./pages/dashboard/PayablesPage.tsx";
import SimulatorPage from "./pages/dashboard/SimulatorPage.tsx";
import GSTPage from "./pages/dashboard/GSTPage.tsx";
import TDSTaxPage from "./pages/dashboard/TDSTaxPage.tsx";
import HRPage from "./pages/dashboard/HRPage.tsx";
import FilingCalendarPage from "./pages/dashboard/FilingCalendarPage.tsx";
import NidhiChatPage from "./pages/dashboard/NidhiChatPage.tsx";
import CFOReportsPage from "./pages/dashboard/CFOReportsPage.tsx";
import CFOReportDetailPage from "./pages/dashboard/CFOReportDetailPage.tsx";
import VendorsPage from "./pages/dashboard/VendorsPage.tsx";
import CustomersPage from "./pages/dashboard/CustomersPage.tsx";
import CostPage from "./pages/dashboard/CostPage.tsx";
import CompliancePage from "./pages/dashboard/CompliancePage.tsx";
import AuditReadinessPage from "./pages/dashboard/AuditReadinessPage.tsx";
import PayrollPlannerPage from "./pages/dashboard/PayrollPlannerPage.tsx";
import WorkingCapitalPage from "./pages/dashboard/WorkingCapitalPage.tsx";
import MarketGrowthPage from "./pages/dashboard/MarketGrowthPage.tsx";
import BankingPage from "./pages/dashboard/BankingPage.tsx";
import DataImportPage from "./pages/dashboard/DataImportPage.tsx";
import CAPartnerPage from "./pages/dashboard/CAPartnerPage.tsx";
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
import AdminResourcesPage from "./pages/dashboard/AdminResourcesPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { CAAuthProvider } from "@/contexts/CAAuthContext";
import CALayout from "@/components/ca/CALayout";
import CALoginPage from "./pages/ca/CALoginPage";
import CARegisterPage from "./pages/ca/CARegisterPage";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminAuthProvider>
      <CAAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
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
            </Route>
            
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/security" element={<PublicSecurityPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/use-cases" element={<UseCasesPage />} />
            
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard/cockpit" element={<CockpitPage />} />
            <Route path="/dashboard/360" element={<Dashboard360Page />} />
            <Route path="/dashboard/cash-flow" element={<CashFlowPage />} />
            <Route path="/dashboard/runway" element={<RunwayPage />} />
            <Route path="/dashboard/liquidity" element={<LiquidityIntelligencePage />} />
            <Route path="/dashboard/receivables" element={<ReceivablesPage />} />
            <Route path="/dashboard/payables" element={<PayablesPage />} />
            <Route path="/dashboard/simulator" element={<SimulatorPage />} />
            <Route path="/dashboard/gst" element={<GSTPage />} />
            <Route path="/dashboard/tds-tax" element={<TDSTaxPage />} />
            <Route path="/dashboard/hr" element={<HRPage />} />
            <Route path="/dashboard/filing-calendar" element={<FilingCalendarPage />} />
            <Route path="/dashboard/nidhi" element={<NidhiChatPage />} />
            <Route path="/dashboard/reports" element={<CFOReportsPage />} />
            <Route path="/dashboard/reports/:id" element={<CFOReportDetailPage />} />
            <Route path="/dashboard/vendors" element={<VendorsPage />} />
            <Route path="/dashboard/customers" element={<CustomersPage />} />
            <Route path="/dashboard/cost" element={<CostPage />} />
            <Route path="/dashboard/compliance" element={<CompliancePage />} />
            <Route path="/dashboard/audit-readiness" element={<AuditReadinessPage />} />
            <Route path="/dashboard/payroll" element={<PayrollPlannerPage />} />
            <Route path="/dashboard/working-capital" element={<WorkingCapitalPage />} />
            <Route path="/dashboard/market-growth" element={<MarketGrowthPage />} />
            <Route path="/dashboard/banking" element={<BankingPage />} />
            <Route path="/dashboard/data-import" element={<DataImportPage />} />
            <Route path="/dashboard/ca-partner" element={<CAPartnerPage />} />
            <Route path="/dashboard/ca-access" element={<CAAccessOverviewPage />} />
            <Route path="/admin/resources" element={<AdminResourcesPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />}>
              <Route index element={null} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="business" element={<BusinessProfilePage />} />
              <Route path="team" element={<TeamAccessPage />} />
              <Route path="ca-access" element={<CAAccessPage />} />
            </Route>
            {/* CA Partner Portal */}
            <Route path="/ca/login" element={<CALoginPage />} />
            <Route path="/ca/register" element={<CARegisterPage />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </CAAuthProvider>
      </AdminAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
