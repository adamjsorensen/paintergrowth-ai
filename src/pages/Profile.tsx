
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Building2, ChevronRight, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileData {
  id: string;
  business_name: string | null;
  location: string | null;
  created_at: string;
  full_name?: string | null;
  avatar_url?: string | null;
  company_name?: string | null;
  updated_at?: string;
  is_admin?: boolean | null;
}

interface ProfileFormValues {
  full_name: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const navigate = useNavigate();
  
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      full_name: "",
    },
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select("*")
          .eq('id', user.id)
          .single();
          
        if (error) {
          throw error;
        }
        
        // Ensure data has the expected structure
        const profileWithDefaults: ProfileData = {
          id: data.id,
          business_name: data.business_name || null,
          location: data.location || null,
          created_at: data.created_at || "",
          full_name: data.full_name || null,
          avatar_url: data.avatar_url || null,
          company_name: data.company_name || null,
          updated_at: data.updated_at || "",
          is_admin: data.is_admin || null
        };
        
        setProfileData(profileWithDefaults);
        form.reset({
          full_name: profileWithDefaults.full_name || "",
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user, form]);
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };
  
  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      if (profileData) {
        setProfileData({
          ...profileData,
          full_name: values.full_name,
        });
      }
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };
  
  if (isLoading) {
    return (
      <PageLayout title="Your Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Your Profile">
      <div className="max-w-2xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your account details and profile information</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Full Name</h3>
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-2">
                        <Button type="submit" size="sm">Save</Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="flex justify-between items-center mt-1">
                    <p>{profileData?.full_name || "Not provided"}</p>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Email Address</h3>
                <p className="mt-1">{user?.email}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Account Created</h3>
                <p className="mt-1">
                  {user?.created_at && format(new Date(user.created_at), "MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>Manage your company details for AI content generation</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/profile/company"
              className="group flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
            >
              <div>
                <h3 className="font-medium">Company Profile</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your company information to improve AI-generated proposals
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Profile;
