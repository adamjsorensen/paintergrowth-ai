
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { NavLogo } from "./navbar/NavLogo";
import { AdminMenu } from "./navbar/AdminMenu";
import { UserMenu } from "./navbar/UserMenu";
import { MobileMenu } from "./navbar/MobileMenu";
import { useNavProfile } from "@/hooks/useNavProfile";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { avatarUrl, isAdmin, getInitials } = useNavProfile();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
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
        <NavLogo isAuthenticated={!!user} />

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/generate" className={navigationMenuTriggerStyle()}>
                      Generate
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/generate/estimate" className={navigationMenuTriggerStyle()}>
                      Estimate (Voice)
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/saved" className={navigationMenuTriggerStyle()}>
                      Saved Proposals
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              
              {isAdmin && <AdminMenu />}
              <UserMenu avatarUrl={avatarUrl} getInitials={getInitials} />
            </>
          ) : (
            <>
              <a href="#features" className="text-gray-600 hover:text-paintergrowth-600 transition-colors">
                Features
              </a>
              <a href="#benefits" className="text-gray-600 hover:text-paintergrowth-600 transition-colors">
                Benefits
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-paintergrowth-600 transition-colors">
                Testimonials
              </a>
              <Button 
                className="bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white ml-4"
                asChild
              >
                <Link to="/auth">Sign In</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <MobileMenu
            isAuthenticated={!!user}
            isAdmin={isAdmin}
            avatarUrl={avatarUrl}
            getInitials={getInitials}
            sheetOpen={sheetOpen}
            setSheetOpen={setSheetOpen}
            handleLogout={handleLogout}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
