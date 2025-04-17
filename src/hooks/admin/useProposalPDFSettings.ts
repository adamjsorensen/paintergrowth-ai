
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProposalPDFSettings = () => {
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCoverImageUrl();
  }, []);

  const fetchCoverImageUrl = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposal_pdf_settings')
        .select('cover_image_url')
        .maybeSingle();

      if (error && !error.message.includes('contains 0 rows')) {
        console.error('Error fetching cover image URL:', error);
      }

      setCoverImageUrl(data?.cover_image_url || null);
    } catch (err) {
      console.error('Unexpected error fetching cover image:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadCoverImage = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `global-${Date.now()}.${fileExt}`;
      const filePath = `proposal-cover/global/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      // First check if we have a record
      const { data: existingRecord } = await supabase
        .from('proposal_pdf_settings')
        .select('id')
        .maybeSingle();

      // Update or create settings record
      const { error: updateError } = await supabase
        .from('proposal_pdf_settings')
        .upsert({ 
          cover_image_url: publicUrl,
          id: existingRecord?.id || 1 // Use existing id or default to 1 for new record
        });

      if (updateError) {
        throw updateError;
      }

      setCoverImageUrl(publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error in uploadCoverImage:', error);
      throw error;
    }
  };

  return {
    coverImageUrl,
    uploadCoverImage,
    isLoading
  };
};
