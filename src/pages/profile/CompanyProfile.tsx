
import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { supabase, CompanyProfile } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const CompanyProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [servicesOffered, setServicesOffered] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [pricingNotes, setPricingNotes] = useState("");
  const [preferredTone, setPreferredTone] = useState("");
  const [brandKeywords, setBrandKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  
  // Fetch company profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("company_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching company profile:", error);
        } else if (data) {
          setProfileData(data);
          setBusinessName(data.business_name || "");
          setLocation(data.location || "");
          setServicesOffered(data.services_offered || "");
          setTeamSize(data.team_size || "");
          setPricingNotes(data.pricing_notes || "");
          setPreferredTone(data.preferred_tone || "");
          setBrandKeywords(data.brand_keywords || []);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  // Save company profile
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSaving(true);
      
      const profileUpdate = {
        user_id: user.id,
        business_name: businessName,
        location,
        services_offered: servicesOffered,
        team_size: teamSize,
        pricing_notes: pricingNotes,
        preferred_tone: preferredTone,
        brand_keywords: brandKeywords,
        updated_at: new Date().toISOString()
      };
      
      if (profileData) {
        // Update existing profile
        const { error } = await supabase
          .from("company_profiles")
          .update(profileUpdate)
          .eq("user_id", user.id);
          
        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from("company_profiles")
          .insert(profileUpdate);
          
        if (error) throw error;
      }
      
      toast({
        title: "Profile saved",
        description: "Your company profile has been updated successfully.",
      });
      
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const addKeyword = () => {
    const keyword = keywordInput.trim();
    if (keyword && !brandKeywords.includes(keyword)) {
      setBrandKeywords([...brandKeywords, keyword]);
      setKeywordInput("");
    }
  };
  
  const removeKeyword = (keyword: string) => {
    setBrandKeywords(brandKeywords.filter(k => k !== keyword));
  };

  return (
    <PageLayout title="Company Profile">
      <div className="max-w-3xl mx-auto pb-10">
        <Breadcrumb className="mb-6 ml-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/dashboard">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/profile">
                Profile
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Company Details</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Tell us about your painting business to help generate better proposals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input 
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Painting Company Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Service Area/Location</Label>
                  <Input 
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Seattle Metro Area"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="servicesOffered">Services Offered</Label>
                  <Textarea 
                    id="servicesOffered"
                    rows={3}
                    value={servicesOffered}
                    onChange={(e) => setServicesOffered(e.target.value)}
                    placeholder="Interior painting, exterior painting, cabinet refinishing, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Select 
                    value={teamSize} 
                    onValueChange={setTeamSize}
                  >
                    <SelectTrigger id="teamSize">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo - Just Me</SelectItem>
                      <SelectItem value="small">Small Team (2-5 people)</SelectItem>
                      <SelectItem value="medium">Medium Team (6-15 people)</SelectItem>
                      <SelectItem value="large">Large Team (16+ people)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pricingNotes">Pricing Notes</Label>
                  <Textarea 
                    id="pricingNotes"
                    rows={3}
                    value={pricingNotes}
                    onChange={(e) => setPricingNotes(e.target.value)}
                    placeholder="Optional notes about your pricing structure or ranges"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferredTone">Preferred Communication Tone</Label>
                  <Select 
                    value={preferredTone} 
                    onValueChange={setPreferredTone}
                  >
                    <SelectTrigger id="preferredTone">
                      <SelectValue placeholder="Select preferred tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional & Formal</SelectItem>
                      <SelectItem value="friendly">Friendly & Approachable</SelectItem>
                      <SelectItem value="casual">Casual & Conversational</SelectItem>
                      <SelectItem value="technical">Technical & Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brandKeywords">Brand Keywords</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="brandKeywords"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="e.g., Quality, Reliable, Premium"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addKeyword();
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={addKeyword}
                      disabled={!keywordInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {brandKeywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="px-2 py-1">
                        {keyword}
                        <button 
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {brandKeywords.length === 0 && (
                      <p className="text-sm text-muted-foreground">No keywords added yet</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CompanyProfilePage;
