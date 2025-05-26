import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import ProposalGenerator from "./pages/ProposalGenerator";
import ViewProposal from "./pages/ViewProposal";
import SavedProposals from "./pages/SavedProposals";
import Profile from "./pages/Profile";
import AdminRoute from "./components/AdminRoute";
import ActivityLog from "./pages/admin/ActivityLog";
import GenerateIndex from "./pages/GenerateIndex";
import Dashboard from "./pages/Dashboard";
import { StylePreferencesProvider } from "./context/StylePreferencesContext";
import PromptBuilderHub from "./pages/admin/PromptBuilderHub";
import PromptBuilder from "./pages/admin/PromptBuilder";
import AdminHub from "./pages/admin/AdminHub";
import AISettings from "./pages/admin/AISettings";
import VectorUpload from "./pages/admin/VectorUpload";
import DocumentManager from "./pages/admin/DocumentManager";
import CompanyProfile from "./pages/profile/CompanyProfile";
import PrintProposal from "./pages/PrintProposal";
import ProposalPDFSettings from "./pages/admin/ProposalPDFSettings";
import BoilerplateManager from "./pages/admin/BoilerplateManager";
import Onboarding from "./pages/Onboarding";
import EstimateGenerator from "./pages/EstimateGenerator";

// Wrapper component to handle redirect with params
const RedirectToPrint = () => {
  const location = useLocation();
  const id = location.pathname.split('/').pop() || '';
  return <Navigate to={`/proposal/print/${id}`} replace />;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StylePreferencesProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/generate" element={
                <ProtectedRoute>
                  <GenerateIndex />
                </ProtectedRoute>
              } />
              <Route path="/generate/proposal" element={
                <ProtectedRoute>
                  <ProposalGenerator />
                </ProtectedRoute>
              } />
              <Route path="/generate/estimate" element={
                <ProtectedRoute>
                  <EstimateGenerator />
                </ProtectedRoute>
              } />
              <Route path="/generate/proposal/:id" element={
                <ProtectedRoute>
                  <ViewProposal />
                </ProtectedRoute>
              } />
              <Route path="/saved" element={
                <ProtectedRoute>
                  <SavedProposals />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/company" element={
                <ProtectedRoute>
                  <CompanyProfile />
                </ProtectedRoute>
              } />
              
              {/* Original print proposal route */}
              <Route path="/proposal/print/:id" element={
                <ProtectedRoute>
                  <PrintProposal />
                </ProtectedRoute>
              } />
              
              {/* Adding alternative route for /print/proposal/:id format */}
              <Route path="/print/proposal/:id" element={
                <ProtectedRoute>
                  <PrintProposal />
                </ProtectedRoute>
              } />
              
              {/* Redirect old format to new format if needed */}
              <Route path="/print/:id" element={
                <ProtectedRoute>
                  <RedirectToPrint />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminHub />
                </AdminRoute>
              } />
              <Route path="/admin/prompt-builder" element={
                <AdminRoute>
                  <PromptBuilderHub />
                </AdminRoute>
              } />
              <Route path="/admin/prompt-builder/proposal-generator" element={
                <AdminRoute>
                  <PromptBuilder />
                </AdminRoute>
              } />
              <Route path="/admin/ai-settings" element={
                <AdminRoute>
                  <AISettings />
                </AdminRoute>
              } />
              <Route path="/admin/vector-upload" element={
                <AdminRoute>
                  <VectorUpload />
                </AdminRoute>
              } />
              <Route path="/admin/vector-upload/manage" element={
                <AdminRoute>
                  <DocumentManager />
                </AdminRoute>
              } />
              <Route path="/admin/logs/activity" element={
                <AdminRoute>
                  <ActivityLog />
                </AdminRoute>
              } />
              <Route path="/admin/proposal-settings" element={
                <AdminRoute>
                  <ProposalPDFSettings />
                </AdminRoute>
              } />
              <Route path="/admin/boilerplate" element={
                <AdminRoute>
                  <BoilerplateManager />
                </AdminRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StylePreferencesProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;