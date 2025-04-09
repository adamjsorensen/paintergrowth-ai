
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, ChevronDown, Database, GanttChart, Menu, Settings, User as UserIcon, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
          
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data.is_admin);
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

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

  const getInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
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
          <Link to={user ? "/dashboard" : "/"} className="text-paintergrowth-800 font-bold text-xl">
            Paintergrowth.ai
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              {/* App Navigation for Authenticated Users */}
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/generate" className={navigationMenuTriggerStyle()}>
                      Generate
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link to="/saved" className={navigationMenuTriggerStyle()}>
                      Saved Proposals
                    </Link>
                  </NavigationMenuItem>
                  </NavigationMenuList>
              </NavigationMenu>
              
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-3">
                      Admin
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-60">
                    <DropdownMenuLabel>Admin Dashboard</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center w-full">
                        <GanttChart className="mr-2 h-4 w-4" />
                        <span>Admin Hub</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                        Content Management
                      </DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/prompt-builder" className="flex items-center w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Prompt Builder</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/ai-settings" className="flex items-center w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>AI Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/vector-upload" className="flex items-center w-full">
                          <Database className="mr-2 h-4 w-4" />
                          <span>Vector Upload</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/logs/activity" className="flex items-center w-full">
                          <GanttChart className="mr-2 h-4 w-4" />
                          <span>Activity Logs</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}   
              
              {/* User Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3 hover:bg-accent">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/company" className="cursor-pointer flex items-center">
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>Company Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {/* Marketing Navigation for Non-Authenticated Users */}
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

        {/* Mobile Navigation Sheet */}
        <div className="md:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                {sheetOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 pt-8">
                {user ? (
                  <>
                    <div className="flex items-center mb-6">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                    <Link 
                      to="/generate" 
                      className="text-lg py-2 hover:text-paintergrowth-600"
                      onClick={() => setSheetOpen(false)}
                    >
                      Generate
                    </Link>
                    <Link 
                      to="/saved" 
                      className="text-lg py-2 hover:text-paintergrowth-600"
                      onClick={() => setSheetOpen(false)}
                    >
                      Saved Proposals
                    </Link>
                    <Link 
                      to="/profile" 
                      className="text-lg py-2 hover:text-paintergrowth-600"
                      onClick={() => setSheetOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/profile/company" 
                      className="text-lg py-2 hover:text-paintergrowth-600"
                      onClick={() => setSheetOpen(false)}
                    >
                      Company Profile
                    </Link>
                    
                    {isAdmin && (
                      <>
                        <Separator className="my-2" />
                        <p className="text-sm font-medium text-muted-foreground mt-2">Admin</p>
                        <Link 
                          to="/admin" 
                          className="text-lg py-2 hover:text-paintergrowth-600"
                          onClick={() => setSheetOpen(false)}
                        >
                          Admin Hub
                        </Link>
                        <Link 
                          to="/admin/prompt-builder" 
                          className="text-lg py-2 hover:text-paintergrowth-600"
                          onClick={() => setSheetOpen(false)}
                        >
                          Prompt Builder
                        </Link>
                        <Link 
                          to="/admin/ai-settings" 
                          className="text-lg py-2 hover:text-paintergrowth-600"
                          onClick={() => setSheetOpen(false)}
                        >
                          AI Settings
                        </Link>
                        <Link 
                          to="/admin/vector-upload" 
                          className="text-lg py-2 hover:text-paintergrowth-600"
                          onClick={() => setSheetOpen(false)}
                        >
                          Vector Upload
                        </Link>
                        <Link 
                          to="/admin/logs/activity" 
                          className="text-lg py-2 hover:text-paintergrowth-600"
                          onClick={() => setSheetOpen(false)}
                        >
                          Activity Logs
                        </Link>
                      </>
                    )}
                    
                    <Separator className="my-2" />
                    
                    <Button 
                      variant="ghost" 
                      className="justify-start p-0 text-lg py-2 hover:text-paintergrowth-600 hover:bg-transparent"
                      onClick={() => {
                        handleLogout();
                        setSheetOpen(false);
                      }}
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <a 
                      href="#features" 
                      className="text-lg py-2 hover:text-paintergrowth-600"
                      onClick={() => setSheetOpen(false)}
                    >
                      Features
                    </a>
                    <a 
                      href="#benefits" 
                      className="text-lg py-2 hover:text-paintergrowth-600"
                      onClick={() => setSheetOpen(false)}
                    >
                      Benefits
                    </a>
                    <a 
                      href="#testimonials" 
                      className="text-lg py-2 hover:text-paintergrowth-600"
                      onClick={() => setSheetOpen(false)}
                    >
                      Testimonials
                    </a>
                    <Button 
                      className="mt-4 w-full bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white"
                      asChild
                    >
                      <Link to="/auth" onClick={() => setSheetOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
