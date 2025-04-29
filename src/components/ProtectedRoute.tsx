
import { useAuth } from "./AuthProvider";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading, onboardingCompleted, checkingOnboarding } = useAuth();

  if (isLoading || checkingOnboarding) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  // Redirect to onboarding if not completed
  if (onboardingCompleted === false) {
    return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
