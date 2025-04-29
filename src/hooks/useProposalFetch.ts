
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProposalData {
  content: string | null;
  metadata: {
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    clientAddress?: string;
    jobType?: string;
    status?: string;
    preparedBy?: string;
    preparedByTitle?: string;
  };
}

export const useProposalFetch = (id: string | undefined, userId: string | undefined) => {
  const [proposal, setProposal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<{
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    clientAddress?: string;
    jobType?: string;
    status?: string;
    preparedBy?: string;
    preparedByTitle?: string;
  }>({});
  const { toast } = useToast();
  const pollCountRef = useRef(0);
  const maxPolls = 30;

  useEffect(() => {
    if (!id || !userId) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        console.log(`Polling attempt ${pollCountRef.current + 1}/${maxPolls}`);
        
        const { data, error } = await supabase
          .from("saved_proposals")
          .select("*")
          .eq("id", id)
          .single();

        if (!isMounted) return;

        if (error) {
          console.error("Error fetching proposal:", error);
          pollCountRef.current += 1;
          
          if (pollCountRef.current >= maxPolls) {
            clearInterval(pollInterval);
            setLoading(false);
            toast({
              title: "Error fetching proposal",
              description: "We couldn't find your proposal. Please try again.",
              variant: "destructive",
            });
          }
          return;
        }

        if (data) {
          console.log("Proposal data received:", { 
            id: data.id, 
            status: data.status,
            contentLength: data.content ? data.content.length : 0 
          });
          
          if (data.status === "pending" || data.status === "generating") {
            pollCountRef.current += 1;
            console.log(`Proposal still generating. Poll count: ${pollCountRef.current}`);
            
            if (pollCountRef.current >= maxPolls) {
              clearInterval(pollInterval);
              setLoading(false);
              toast({
                title: "Generation timed out",
                description: "The proposal generation took too long. Please try again.",
                variant: "destructive",
              });
            }
            return;
          }

          if (data.status === "completed" && data.content) {
            setProposal(data.content);
            setMetadata({
              clientName: data.client_name,
              clientPhone: data.client_phone,
              clientEmail: data.client_email,
              jobType: data.job_type,
              status: data.status
            });
            clearInterval(pollInterval);
            setLoading(false);
          } else if (data.status === "failed") {
            clearInterval(pollInterval);
            setLoading(false);
            toast({
              title: "Generation failed",
              description: "The proposal generation failed. Please try again.",
              variant: "destructive",
            });
          } else {
            pollCountRef.current += 1;
            console.log(`Unexpected data state. Status: ${data.status}, Poll count: ${pollCountRef.current}`);
            
            if (pollCountRef.current >= maxPolls) {
              clearInterval(pollInterval);
              setLoading(false);
              toast({
                title: "Generation timed out",
                description: "The proposal generation took too long. Please try again.",
                variant: "destructive",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error polling for proposal:", error);
        pollCountRef.current += 1;
        
        if (pollCountRef.current >= maxPolls && isMounted) {
          clearInterval(pollInterval);
          setLoading(false);
          toast({
            title: "Error occurred",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
        }
      }
    }, 2000); // Poll every 2 seconds

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [id, userId, toast, maxPolls]);

  return { proposal, loading, metadata, setProposal };
};
