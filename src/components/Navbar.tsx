
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out.",
      });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-paintergrowth-600 h-8 w-8 rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <Link to="/" className="text-paintergrowth-800 font-bold text-xl">
            Paintergrowth.ai
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8 font-medium">
          {user && (
            <>
              <Link to="/generate" className="text-gray-600 hover:text-paintergrowth-600 transition-colors">
                Generate
              </Link>
              <Link to="/saved" className="text-gray-600 hover:text-paintergrowth-600 transition-colors">
                Saved Proposals
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-paintergrowth-600 transition-colors">
                Profile
              </Link>
            </>
          )}
          <a href="#features" className="text-gray-600 hover:text-paintergrowth-600 transition-colors">
            Features
          </a>
          <a href="#benefits" className="text-gray-600 hover:text-paintergrowth-600 transition-colors">
            Benefits
          </a>
          <a href="#testimonials" className="text-gray-600 hover:text-paintergrowth-600 transition-colors">
            Testimonials
          </a>
          
          {user ? (
            <Button 
              className="bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          ) : (
            <Button 
              className="bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white"
              asChild
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>

        <Button className="block md:hidden" variant="ghost">
          Menu
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
