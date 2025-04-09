
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface CompanyFormValues {
  business_name: string;
  location: string;
  services_offered: string;
  team_size: string;
  pricing_notes: string;
  preferred_tone: string;
  brand_keywords: string[];
}

const CompanyProfile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState("");
  
  const form = useForm<CompanyFormValues>({
    defaultValues: {
      business_name: "",
      location: "",
      services_offered: "",
      team_size: "",
      pricing_notes: "",
      preferred_tone: "professional",
      brand_keywords: []
    }
  });

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("company_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
          
        if (error && error.code !== "PGRST116") {
          throw error;
        }
        
        if (data) {
          form.reset({
            business_name: data.business_name || "",
            location: data.location || "",
            services_offered: data.services_offered || "",
            team_size: data.team_size || "",
            pricing_notes: data.pricing_notes || "",
            preferred_tone: data.preferred_tone || "professional",
            brand_keywords: data.brand_keywords || []
          });
        }
      } catch (error) {
        console.error("Error fetching company profile:", error);
        toast.error("Failed to load company profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompanyProfile();
  }, [user, form]);
  
  const onSubmit = async (values: CompanyFormValues) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("company_profiles")
        .upsert({
          user_id: user.id,
          business_name: values.business_name,
          location: values.location,
          services_offered: values.services_offered,
          team_size: values.team_size,
          pricing_notes: values.pricing_notes,
          preferred_tone: values.preferred_tone,
          brand_keywords: values.brand_keywords,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
        
      if (error) throw error;
      
      toast.success("Company profile updated successfully");
    } catch (error) {
      console.error("Error updating company profile:", error);
      toast.error("Failed to update company profile");
    }
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;
    
    const keywords = form.getValues("brand_keywords") || [];
    if (keywords.includes(newKeyword.trim())) {
      setNewKeyword("");
      return;
    }
    
    form.setValue("brand_keywords", [...keywords, newKeyword.trim()]);
    setNewKeyword("");
  };

  const handleRemoveKeyword = (index: number) => {
    const keywords = form.getValues("brand_keywords") || [];
    form.setValue("brand_keywords", keywords.filter((_, i) => i !== index));
  };
  
  if (isLoading) {
    return (
      <PageLayout title="Company Profile">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout title="Company Profile">
      <div className="max-w-3xl mx-auto">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/profile">Profile</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Company Profile</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Alert className="mb-6 bg-blue-50 border border-blue-100">
          <InfoIcon className="h-5 w-5 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Your company information helps personalize AI-generated content.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Update details about your business to improve AI-generated proposals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <Input placeholder="City, State or Region" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="services_offered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services Offered</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the services your business provides" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Briefly list your main services, separated by commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="team_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Size</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1-5, 6-20, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferred_tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Communication Tone</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="friendly">Friendly</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="funny">Funny</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="pricing_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pricing Information</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="General notes about your pricing structure" 
                          className="min-h-[80px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This helps the AI generate more accurate pricing suggestions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="brand_keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand Keywords</FormLabel>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {field.value?.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {keyword}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveKeyword(index)}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="Add a keyword"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddKeyword();
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleAddKeyword}
                        >
                          Add
                        </Button>
                      </div>
                      <FormDescription>
                        Words that describe your brand identity (e.g., reliable, innovative)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit">Save Changes</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CompanyProfile;
