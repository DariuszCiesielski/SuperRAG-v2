import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LegalErrorBoundary from "@/components/legal/LegalErrorBoundary";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Notebook from "./pages/Notebook";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy loaded Legal pages
const Legal = lazy(() => import("./pages/Legal"));
const LegalCase = lazy(() => import("./pages/LegalCase"));
const LegalLibrary = lazy(() => import("./pages/LegalLibrary"));
const LegalDocumentGenerator = lazy(() => import("./pages/LegalDocumentGenerator"));

const queryClient = new QueryClient();

// Loading fallback for Legal pages
const LegalLoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Ładowanie...</div>
  </div>
);

const AppContent = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute fallback={<Landing />}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notebook"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <Notebook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notebook/:id"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <Notebook />
          </ProtectedRoute>
        }
      />
      <Route path="/auth" element={<Auth />} />
      <Route path="/pricing" element={<Pricing />} />
      {/* Legal Assistant routes - lazy loaded with error boundary */}
      <Route
        path="/legal"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <LegalErrorBoundary>
              <Suspense fallback={<LegalLoadingFallback />}>
                <Legal />
              </Suspense>
            </LegalErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/legal/case/:id"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <LegalErrorBoundary>
              <Suspense fallback={<LegalLoadingFallback />}>
                <LegalCase />
              </Suspense>
            </LegalErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/legal/library"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <LegalErrorBoundary>
              <Suspense fallback={<LegalLoadingFallback />}>
                <LegalLibrary />
              </Suspense>
            </LegalErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/legal/generator"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <LegalErrorBoundary>
              <Suspense fallback={<LegalLoadingFallback />}>
                <LegalDocumentGenerator />
              </Suspense>
            </LegalErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;
