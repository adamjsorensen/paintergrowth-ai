
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useProposalPDFSettings = () => {
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCoverImageUrl();
  }, []);

  const fetchCoverImageUrl = async () => {
    const { data, error } = await supabase
      .from('proposal_pdf_settings')
      .select('cover_image_url')
      .single();

    if (error) {
      console.error('Error fetching cover image URL:', error);
      return;
    }

    setCoverImageUrl(data?.cover_image_url || null);
  };

  const uploadCoverImage = async (file: File) => {
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

    // Update settings table
    const { error: updateError } = await supabase
      .from('proposal_pdf_settings')
      .upsert({ 
        cover_image_url: publicUrl,
        id: (await supabase.from('proposal_pdf_settings').select('id').single()).data?.id || undefined
      });

    if (updateError) {
      throw updateError;
    }

    setCoverImageUrl(publicUrl);
    return publicUrl;
  };

  return {
    coverImageUrl,
    uploadCoverImage,
  };
};
