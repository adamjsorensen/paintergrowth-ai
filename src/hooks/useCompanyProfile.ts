
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
      
      // Return all fields directly from the database
      return data as CompanyProfile;
    },
    enabled: !!userId
  });
};
