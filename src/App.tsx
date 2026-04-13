import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
