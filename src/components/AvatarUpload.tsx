
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface AvatarUploadProps {
  currentAvatar: string | null;
  onAvatarUpdated: (url: string | null) => void;
}

const AvatarUpload = ({ currentAvatar, onAvatarUpdated }: AvatarUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatar);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user?.id) return;

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
      const fileName = `${user.id}-avatar.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Update preview
      setPreview(publicUrl);
      
      // Update profile in users table
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (profileUpdateError) {
        throw profileUpdateError;
      }
      
      // Notify parent component
      onAvatarUpdated(publicUrl);
      
      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!preview || !user?.id) return;
    
    try {
      setUploading(true);
      
      // Extract the filename from the URL
      const fileName = preview.split('/').pop();
      
      if (fileName) {
        // Remove file from storage
        const { error: storageError } = await supabase.storage
          .from('avatars')
          .remove([fileName]);
          
        if (storageError) throw storageError;
      }
      
      // Clear avatar in profiles table
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (profileUpdateError) {
        throw profileUpdateError;
      }
      
      // Clear the preview
      setPreview(null);
      
      // Notify parent component
      onAvatarUpdated(null);
      
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed",
      });
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove the avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="avatar">Profile Picture</Label>
      
      <div className="border rounded-lg p-4 space-y-4">
        {/* Avatar preview */}
        {preview && (
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-gray-50 p-4 rounded border w-full max-w-xs flex justify-center items-center h-[200px]">
              <img 
                src={preview} 
                alt="Profile Avatar" 
                className="max-h-[200px] max-w-full object-cover rounded-full"
              />
            </div>
          </div>
        )}
        
        {/* Upload controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('avatar-upload')?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {preview ? 'Change Picture' : 'Upload Picture'}
          </Button>
          
          {preview && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemoveAvatar}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          )}
          
          <input
            id="avatar-upload"
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        
        <p className="text-xs text-muted-foreground">
          Recommended: square profile picture, PNG or JPG, max 2MB.
        </p>
      </div>
    </div>
  );
};

export default AvatarUpload;
