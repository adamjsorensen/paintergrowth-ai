
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";

interface LogoUploadProps {
  userId: string | undefined;
  currentLogo: string | null;
  onLogoUpdated: (url: string | null) => void;
}

const LogoUpload = ({ userId, currentLogo, onLogoUpdated }: LogoUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogo);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !userId) return;

    const file = e.target.files[0];
    
    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload JPG or PNG files only",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Create a unique file path using the user ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);
        
      // Update preview
      setPreview(publicUrl);
      
      // Notify parent component
      onLogoUpdated(publicUrl);
      
      toast({
        title: "Logo uploaded",
        description: "Your company logo has been updated",
      });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!preview) return;
    
    try {
      setUploading(true);
      
      // Extract the filename from the URL
      const fileName = preview.split('/').pop();
      
      if (fileName) {
        // Remove file from storage
        const { error } = await supabase.storage
          .from('company-logos')
          .remove([fileName]);
          
        if (error) throw error;
      }
      
      // Clear the preview
      setPreview(null);
      
      // Notify parent component
      onLogoUpdated(null);
      
      toast({
        title: "Logo removed",
        description: "Your company logo has been removed",
      });
    } catch (error: any) {
      console.error('Error removing logo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove the logo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="logo">Company Logo</Label>
      
      <div className="border rounded-lg p-4 space-y-4">
        {/* Logo preview */}
        {preview && (
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-gray-50 p-4 rounded border w-full max-w-xs flex justify-center items-center h-[100px]">
              <img 
                src={preview} 
                alt="Company Logo" 
                className="max-h-[100px] max-w-full object-contain"
              />
            </div>
          </div>
        )}
        
        {/* Upload controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('logo-upload')?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {preview ? 'Change Logo' : 'Upload Logo'}
          </Button>
          
          {preview && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemoveLogo}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          )}
          
          <input
            id="logo-upload"
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        
        <p className="text-xs text-muted-foreground">
          Recommended: square logo, PNG or JPG, max 2MB. This logo will appear on your proposals.
        </p>
      </div>
    </div>
  );
};

export default LogoUpload;
