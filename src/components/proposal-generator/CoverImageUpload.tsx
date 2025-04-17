
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ImageUp } from 'lucide-react';

interface CoverImageUploadProps {
  userId: string;
  onImageUpload: (imageUrl: string) => void;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({ userId, onImageUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `proposal-cover/global/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      onImageUpload(publicUrl);
      toast({
        title: 'Cover Image Uploaded',
        description: 'Your proposal cover image has been successfully uploaded.',
      });
    } catch (error) {
      console.error('Error uploading cover image:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error uploading your cover image.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
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
          type="button" 
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <ImageUp className="h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload Cover Image'}
        </Button>
      </label>
    </div>
  );
};

export default CoverImageUpload;
