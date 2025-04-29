
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  shouldRedirect: boolean;
  setShouldRedirect: (value: boolean) => void;
  onboardingCompleted: boolean | null;
  checkingOnboarding: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  shouldRedirect: true,
  setShouldRedirect: () => {},
  onboardingCompleted: null,
  checkingOnboarding: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Check onboarding status when auth state changes
        if (session?.user) {
          checkOnboardingStatus(session.user.id);
        } else {
          setOnboardingCompleted(null);
          setCheckingOnboarding(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Check onboarding status if we have a user
      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      } else {
        setOnboardingCompleted(null);
        setCheckingOnboarding(false);
      }
    });

    const checkOnboardingStatus = async (userId: string) => {
      try {
        setCheckingOnboarding(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error('Error fetching onboarding status:', error);
          setOnboardingCompleted(false); // Default to false if error
        } else {
          setOnboardingCompleted(!!data?.onboarding_completed);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        setOnboardingCompleted(false); // Default to false if error
      } finally {
        setCheckingOnboarding(false);
      }
    };

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      shouldRedirect, 
      setShouldRedirect,
      onboardingCompleted,
      checkingOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
};
