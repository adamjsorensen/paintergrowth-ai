
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LogOut, User } from "lucide-react";

interface ProfileData {
  id: string;
  business_name: string | null;
  location: string | null;
  created_at: string;
}

interface ProfileFormValues {
  business_name: string;
  location: string;
}

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const navigate = useNavigate();
  
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      business_name: "",
      location: "",
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
        
        setProfileData(data as ProfileData);
        form.reset({
          business_name: data.business_name || "",
          location: data.location || "",
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
          business_name: values.business_name,
          location: values.location
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setProfileData({
        ...(profileData as ProfileData),
        business_name: values.business_name,
        location: values.location
      });
      
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
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Update your business details</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="business_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your business name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2">
                    <Button type="submit">Save Changes</Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Business Name</h3>
                  <p className="mt-1">{profileData?.business_name || "Not provided"}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Location</h3>
                  <p className="mt-1">{profileData?.location || "Not provided"}</p>
                </div>
                
                <Button onClick={() => setIsEditing(true)}>Edit Business Info</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Profile;
