
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/AuthProvider";

interface MobileMenuProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  avatarUrl: string | null;
  getInitials: () => string;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  handleLogout: () => Promise<void>;
}

export const MobileMenu = ({
  isAuthenticated,
  isAdmin,
  avatarUrl,
  getInitials,
  sheetOpen,
  setSheetOpen,
  handleLogout,
}: MobileMenuProps) => {
  const { user } = useAuth();

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          {sheetOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <div className="flex flex-col gap-4 pt-8">
          {isAuthenticated ? (
            <>
              <div className="flex items-center mb-6">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.email}</p>
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
                  <div className="h-px bg-border my-2"></div>
                  <p className="text-sm text-muted-foreground mb-2">Admin</p>
                  <Link 
                    to="/admin" 
                    className="text-lg py-2 hover:text-paintergrowth-600"
                    onClick={() => setSheetOpen(false)}
                  >
                    Admin Dashboard
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
  );
};
