import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CompanyProfile, CompanyProfileUpdate, ToneOptions, TeamSizeOptions } from "@/types/supabase";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type FormValues = {
  business_name: string;
  location: string;
  services_offered: string;
  team_size: TeamSizeOptions;
  pricing_notes: string;
  preferred_tone: ToneOptions;
  brand_keywords: string[];
  currentKeyword: string;
};

const CompanyProfilePage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");

  const form = useForm<FormValues>({
    defaultValues: {
      business_name: "",
      location: "",
      services_offered: "",
      team_size: "1",
      pricing_notes: "",
      preferred_tone: "professional",
      brand_keywords: [],
      currentKeyword: "",
    },
  });

  const { data: companyProfile, isLoading } = useQuery({
    queryKey: ["companyProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (error) {
        console.error("Error fetching company profile:", error);
        return null;
      }
      
      return data as CompanyProfile;
    },
    enabled: !!user?.id,
  });

  const updateCompanyProfile = useMutation({
    mutationFn: async (values: CompanyProfileUpdate) => {
      if (!user?.id) throw new Error("User not authenticated");

      const updatedValues = {
        ...values,
        user_id: user.id,
        brand_keywords: keywords,
      };

      const { data, error } = await supabase
        .from("company_profiles")
        .upsert(updatedValues)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your company profile has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["companyProfile"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (companyProfile) {
      form.reset({
        business_name: companyProfile.business_name || "",
        location: companyProfile.location || "",
        services_offered: companyProfile.services_offered || "",
        team_size: (companyProfile.team_size as TeamSizeOptions) || "1",
        pricing_notes: companyProfile.pricing_notes || "",
        preferred_tone: (companyProfile.preferred_tone as ToneOptions) || "professional",
        brand_keywords: [],
        currentKeyword: "",
      });
      
      setKeywords(companyProfile.brand_keywords || []);
    }
  }, [companyProfile, form]);

  const onSubmit = (values: FormValues) => {
    const { currentKeyword, ...submitValues } = values;
    updateCompanyProfile.mutate(submitValues as CompanyProfileUpdate);
  };

  const addKeyword = () => {
    if (currentKeyword && !keywords.includes(currentKeyword)) {
      setKeywords([...keywords, currentKeyword]);
      setCurrentKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <PageLayout title="Company Profile">
      <div className="container max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Your company information helps personalize AI-generated content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="business_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your business name" {...field} />
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
                            <Input placeholder="City, State" {...field} />
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
                            placeholder="Describe the services your company offers" 
                            className="min-h-[100px]" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="team_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Size</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select team size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">Just me</SelectItem>
                              <SelectItem value="2-5">2-5 people</SelectItem>
                              <SelectItem value="6-10">6-10 people</SelectItem>
                              <SelectItem value="11-20">11-20 people</SelectItem>
                              <SelectItem value="21-50">21-50 people</SelectItem>
                              <SelectItem value="51+">51+ people</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferred_tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Tone</FormLabel>
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
                        <FormLabel>Pricing Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add information about your pricing structure" 
                            className="min-h-[100px]" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Brand Keywords</FormLabel>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={currentKeyword}
                        onChange={(e) => setCurrentKeyword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter keyword and press Enter"
                        className="flex-1"
                      />
                      <Button type="button" onClick={addKeyword}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {keywords.map((keyword) => (
                        <Badge key={keyword} className="py-1 px-3 flex items-center gap-1">
                          {keyword}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full md:w-auto"
                    disabled={updateCompanyProfile.isPending}
                  >
                    {updateCompanyProfile.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CompanyProfilePage;
