import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Copy, Save, ArrowLeft } from "lucide-react";
import LoadingAnimation from "@/components/proposal-generator/LoadingAnimation";
import SaveProposalDialog from "@/components/SaveProposalDialog";

const ViewProposal = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<{
    clientName?: string;
    jobType?: string;
    status?: string;
  }>({});
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const pollCountRef = useRef(0);
  const maxPolls = 30;

  useEffect(() => {
    if (!id || !user) return;

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
  }, [id, user, toast, maxPolls]);

  const handleCopy = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal);
      toast({
        title: "Copied to clipboard",
        description: "The proposal has been copied to your clipboard",
      });
    }
  };

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  const handleBack = () => {
    navigate("/generate/proposal");
  };

  if (loading) {
    return (
      <PageLayout title="Generating Proposal">
        <LoadingAnimation />
      </PageLayout>
    );
  }

  if (!proposal) {
    return (
      <PageLayout title="Proposal Not Found">
        <div className="container mx-auto max-w-5xl py-8 px-4">
          <Card className="border-none shadow-md">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Proposal Not Found</h2>
              <p className="text-gray-600 mb-8">
                We couldn't find this proposal or it's still being generated. 
                You can go back and try again.
              </p>
              <Button onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Proposal Form
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Your Proposal">
      <div className="container mx-auto max-w-5xl py-8 px-4">
        <Button 
          variant="outline" 
          className="mb-4"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Form
        </Button>
        
        <Card className="border-none shadow-md">
          <CardHeader className="bg-gray-50 border-b border-gray-100 rounded-t-lg p-6">
            <CardTitle className="text-2xl">Generated Proposal</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="prose prose-blue max-w-none whitespace-pre-wrap font-sans">
              {proposal}
            </div>
          </CardContent>
          <CardFooter className="py-4 px-8 bg-gray-50 border-t border-gray-100 rounded-b-lg flex justify-end gap-3">
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button variant="secondary" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && proposal && (
        <SaveProposalDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          proposalContent={proposal}
          clientName={metadata.clientName || ""}
          jobType={metadata.jobType || ""}
          existingId={id}
        />
      )}
    </PageLayout>
  );
};

export default ViewProposal;
