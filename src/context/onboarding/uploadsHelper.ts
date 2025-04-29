
import { supabase } from "@/integrations/supabase/client";
import { File } from "@/types/file";

export const uploadFile = async (
  file: File, 
  bucket: string, 
  folder: string, 
  userId: string
): Promise<string | null> => {
  if (!userId || !file) return null;
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
      
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error(`Error uploading ${bucket} file:`, error);
    return null;
  }
};
