
import { useState, useRef } from "react";
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
  const [localFile, setLocalFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Create local preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setLocalFile(file);
  };

  const handleUpload = async () => {
    if (!localFile || !user?.id) return;

    try {
      setUploading(true);
      
      // Create a unique file path using the user ID
      const fileExt = localFile.name.split('.').pop();
      const fileName = `${user.id}-avatar.${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, localFile, {
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

      // Clean up local preview
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setLocalFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    // Clean up local preview
    if (preview && preview !== currentAvatar) {
      URL.revokeObjectURL(preview);
    }
    
    // Reset to current avatar
    setPreview(currentAvatar);
    setLocalFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {preview ? 'Change Picture' : 'Upload Picture'}
          </Button>
          
          {localFile && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                Confirm Upload
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancel}
                disabled={uploading}
                className="flex items-center gap-2"
              >
                Cancel
              </Button>
            </>
          )}
          
          <input
            ref={fileInputRef}
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

