
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export type Proposal = {
  id: string;
  title: string;
  content: string;
  client_name: string | null;
  job_type: string | null;
  created_at: string;
};

export const useSavedProposals = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProposals = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('saved_proposals')
        .select("*")
        .order("created_at", { ascending: false }) as { data: Proposal[] | null, error: any };
      
      if (error) throw error;
      
      setProposals(data || []);
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast({
        title: "Error loading proposals",
        description: "There was a problem loading your saved proposals.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProposal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_proposals')
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      setProposals(proposals.filter((p) => p.id !== id));
      
      toast({
        title: "Proposal deleted",
        description: "The proposal has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error("Error deleting proposal:", error);
      toast({
        title: "Error deleting proposal",
        description: "There was a problem deleting the proposal.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProposal = async (id: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('saved_proposals')
        .update({
          content: newContent,
          updated_at: new Date(),
        })
        .eq('id', id);

      if (error) throw error;

      setProposals(proposals.map(p => 
        p.id === id 
          ? { ...p, content: newContent }
          : p
      ));

      toast({
        title: "Changes saved",
        description: "Your proposal has been updated",
      });

      return true;
    } catch (error) {
      console.error("Error updating proposal:", error);
      toast({
        title: "Error saving changes",
        description: "There was a problem updating your proposal",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  return {
    proposals,
    isLoading,
    deleteProposal,
    updateProposal
  };
};
