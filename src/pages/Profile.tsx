
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileCompanyLink from "@/components/ProfileCompanyLink";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setFullName(data.full_name || "");
          setAvatarUrl(data.avatar_url || "");
          setBusinessName(data.business_name || "");
          setLocation(data.location || "");
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const updates = {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        business_name: businessName,
        location: location,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (fullName) {
      const names = fullName.split(" ");
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
      }
      return fullName.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <PageLayout title="Profile">
      <div className="container max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 space-y-2">
                <div className="text-xl font-semibold">{fullName || user?.email}</div>
                <div className="text-muted-foreground">{user?.email}</div>
                <div className="text-sm">{businessName && `${businessName}${location ? `, ${location}` : ""}`}</div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName || ""}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={avatarUrl || ""}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessName || ""}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter your business name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location || ""}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Company Profile Link */}
        <ProfileCompanyLink />
      </div>
    </PageLayout>
  );
};

export default Profile;
