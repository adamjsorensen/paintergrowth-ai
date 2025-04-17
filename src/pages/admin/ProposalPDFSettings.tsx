
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { useProposalPDFSettings } from "@/hooks/admin/useProposalPDFSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ProposalPDFSettings = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { uploadCoverImage, coverImageUrl } = useProposalPDFSettings();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      await uploadCoverImage(file);
      toast({
        title: "Success",
        description: "Cover image has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading cover image:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the cover image.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PageLayout title="Proposal PDF Settings">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Cover Image Settings</CardTitle>
            <CardDescription>
              Upload a cover image that will be shown on all printed proposals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coverImageUrl && (
                <div className="relative w-full max-w-md">
                  <img 
                    src={coverImageUrl} 
                    alt="Current cover" 
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
              )}
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="cover-image-upload"
                  disabled={isUploading}
                />
                <label htmlFor="cover-image-upload">
                  <Button 
                    variant="outline" 
                    disabled={isUploading}
                    className="flex items-center gap-2"
                  >
                    <ImageUp className="h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Upload New Cover Image'}
                  </Button>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default ProposalPDFSettings;
