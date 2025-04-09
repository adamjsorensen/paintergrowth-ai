
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./components/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import ProposalGenerator from "./pages/ProposalGenerator";
import ViewProposal from "./pages/ViewProposal";
import SavedProposals from "./pages/SavedProposals";
import Profile from "./pages/Profile";
import PromptBuilder from "./pages/admin/PromptBuilder";
import AdminRoute from "./components/AdminRoute";
import ActivityLog from "./pages/admin/ActivityLog";
import GenerateIndex from "./pages/GenerateIndex";
import Dashboard from "./pages/Dashboard";
import { StylePreferencesProvider } from "./context/StylePreferencesContext";

const queryClient = new QueryClient();

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
              <Route path="/admin/prompt-builder" element={
                <AdminRoute>
                  <PromptBuilder />
                </AdminRoute>
              } />
              <Route path="/admin/logs/activity" element={
                <AdminRoute>
                  <ActivityLog />
                </AdminRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StylePreferencesProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
