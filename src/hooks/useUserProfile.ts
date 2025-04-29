
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUserProfile = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    full_name?: string | null;
    job_title?: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, job_title")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          throw error;
        }

        setData(data);
      } catch (error) {
        console.error("Failed to fetch user profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  return { data, isLoading };
};
