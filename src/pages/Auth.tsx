
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { user, onboardingCompleted, checkingOnboarding } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      if (onboardingCompleted === false) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate, onboardingCompleted]);

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");

    try {
      emailSchema.parse(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEmailError(error.errors[0].message);
        isValid = false;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordError(error.errors[0].message);
        isValid = false;
      }
    }

    return isValid;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: "",
            },
          },
        });
        
        if (error) throw error;
        
        toast({
          title: "Sign up successful!",
          description: "Please check your email to confirm your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) throw error;
        
        toast({
          title: "Signed in successfully!",
          description: "Welcome back to Paintergrowth.ai!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication error",
        description: error.message || "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? "Create an account" : "Sign in to your account"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp
              ? "Enter your email below to create your account"
              : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full bg-paintergrowth-600 hover:bg-paintergrowth-700"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? "Loading..."
                : isSignUp
                ? "Create account"
                : "Sign in"}
            </Button>
            
            <div className="text-center text-sm">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <Button
                variant="link"
                className="text-paintergrowth-600 p-0"
                onClick={() => setIsSignUp(!isSignUp)}
                type="button"
              >
                {isSignUp ? "Sign in" : "Create one"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
