import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import SolutionsPage from "./pages/SolutionsPage.tsx";
import ProductsPage from "./pages/ProductsPage.tsx";
import PricingPage from "./pages/PricingPage.tsx";
import BlogPage from "./pages/BlogPage.tsx";
import ResourcesPage from "./pages/ResourcesPage.tsx";
import CommunityPage from "./pages/CommunityPage.tsx";
import AboutPage from "./pages/AboutPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx";
import SignInPage from "./pages/SignInPage.tsx";
import OnboardingPage from "./pages/OnboardingPage.tsx";
import CockpitPage from "./pages/dashboard/CockpitPage.tsx";
import Dashboard360Page from "./pages/dashboard/Dashboard360Page.tsx";
import CashFlowPage from "./pages/dashboard/CashFlowPage.tsx";
import ReceivablesPage from "./pages/dashboard/ReceivablesPage.tsx";
import SimulatorPage from "./pages/dashboard/SimulatorPage.tsx";
import GSTPage from "./pages/dashboard/GSTPage.tsx";
import HRPage from "./pages/dashboard/HRPage.tsx";
import FilingCalendarPage from "./pages/dashboard/FilingCalendarPage.tsx";
import NidhiChatPage from "./pages/dashboard/NidhiChatPage.tsx";
import CFOReportsPage from "./pages/dashboard/CFOReportsPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/solutions" element={<SolutionsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard/cockpit" element={<CockpitPage />} />
            <Route path="/dashboard/360" element={<Dashboard360Page />} />
            <Route path="/dashboard/cash-flow" element={<CashFlowPage />} />
            <Route path="/dashboard/receivables" element={<ReceivablesPage />} />
            <Route path="/dashboard/simulator" element={<SimulatorPage />} />
            <Route path="/dashboard/gst" element={<GSTPage />} />
            <Route path="/dashboard/hr" element={<HRPage />} />
            <Route path="/dashboard/filing-calendar" element={<FilingCalendarPage />} />
            <Route path="/dashboard/nidhi" element={<NidhiChatPage />} />
            <Route path="/dashboard/reports" element={<CFOReportsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
