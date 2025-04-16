
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CompanyProfile } from "@/types/supabase";

export const useCompanyProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["companyProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
        
      if (error) {
        console.error("Error fetching company profile:", error);
        return null;
      }
      
      // Map database fields to template placeholders
      return {
        companyName: data.business_name || "",
        companyAddress: data.location || "",
        companyServices: data.services_offered || "",
        warranty: data.pricing_notes || "", // Using pricing_notes for warranty info
        logo_url: data.logo_url || null,
      } as const;
    },
    enabled: !!userId
  });
};
