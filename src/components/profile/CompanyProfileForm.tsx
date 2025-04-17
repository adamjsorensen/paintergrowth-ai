
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CompanyProfileFormValues, CompanyProfileUpdate } from "@/types/companyProfile";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import LogoUpload from "@/components/LogoUpload";
import { ContactInfoSection } from "./form-sections/ContactInfoSection";
import { BusinessInfoSection } from "./form-sections/BusinessInfoSection";
import { PreferencesSection } from "./form-sections/PreferencesSection";
import { KeywordsSection } from "./form-sections/KeywordsSection";
import { PricingSection } from "./form-sections/PricingSection";

interface CompanyProfileFormProps {
  userId?: string;
  initialData: any;
  isLoading: boolean;
}

const CompanyProfileForm = ({ userId, initialData, isLoading }: CompanyProfileFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [keywords, setKeywords] = useState<string[]>(initialData?.brand_keywords || []);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialData?.logo_url || null);

  const form = useForm<CompanyProfileFormValues>({
    defaultValues: {
      business_name: initialData?.business_name || "",
      location: initialData?.location || "",
      services_offered: initialData?.services_offered || "",
      team_size: initialData?.team_size || "1",
      pricing_notes: initialData?.pricing_notes || "",
      preferred_tone: initialData?.preferred_tone || "professional",
      brand_keywords: [],
      currentKeyword: "",
      owner_name: initialData?.owner_name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
    },
  });

  const updateCompanyProfile = useMutation({
    mutationFn: async (values: Omit<CompanyProfileFormValues, "currentKeyword">) => {
      if (!userId) throw new Error("User not authenticated");

      const updatedValues: CompanyProfileUpdate = {
        user_id: userId,
        business_name: values.business_name,
        location: values.location,
        services_offered: values.services_offered,
        team_size: values.team_size,
        pricing_notes: values.pricing_notes,
        preferred_tone: values.preferred_tone,
        brand_keywords: keywords,
        logo_url: logoUrl,
        owner_name: values.owner_name,
        email: values.email,
        phone: values.phone,
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

  const onSubmit = (values: CompanyProfileFormValues) => {
    const { currentKeyword, ...submitValues } = values;
    updateCompanyProfile.mutate(submitValues);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-6">
          <LogoUpload 
            userId={userId} 
            currentLogo={logoUrl} 
            onLogoUpdated={setLogoUrl} 
          />
        </div>

        <ContactInfoSection form={form} />
        <BusinessInfoSection form={form} />
        <PreferencesSection form={form} />
        <PricingSection form={form} />
        <KeywordsSection 
          initialKeywords={keywords} 
          onKeywordsChange={setKeywords} 
        />

        <Button 
          type="submit" 
          className="w-full md:w-auto"
          disabled={updateCompanyProfile.isPending}
        >
          {updateCompanyProfile.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </Form>
  );
};

export default CompanyProfileForm;
