
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CompanyProfile } from "@/types/supabase";

export function useCompanyProfileData(userId?: string) {
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
      
      return data as CompanyProfile;
    },
    enabled: !!userId,
  });
}
