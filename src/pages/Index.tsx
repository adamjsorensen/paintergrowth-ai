
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import BenefitsSection from "@/components/BenefitsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  const { user, shouldRedirect, setShouldRedirect } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && shouldRedirect) {
      navigate("/dashboard");
      setShouldRedirect(false);
    }
  }, [user, navigate, shouldRedirect, setShouldRedirect]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
