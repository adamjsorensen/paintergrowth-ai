
import { supabase } from "@/integrations/supabase/client";

export type PromptPurpose = 'scope' | 'suggestion' | 'pdf_summary';

export interface EstimatePromptTemplate {
  id: string;
  name: string;
  purpose: PromptPurpose;
  model: string;
  temperature: number;
  prompt_text: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EstimatePromptTemplateInsert {
  name: string;
  purpose: PromptPurpose;
  model: string;
  temperature: number;
  prompt_text: string;
  active: boolean;
}

export const getActivePrompt = async (purpose: PromptPurpose): Promise<EstimatePromptTemplate | null> => {
  const { data, error } = await supabase
    .from('estimate_prompt_templates')
    .select('*')
    .eq('purpose', purpose)
    .eq('active', true)
    .single();

  if (error) {
    console.error('Error fetching active prompt:', error);
    return null;
  }

  return data;
};

export const getAllPrompts = async (): Promise<EstimatePromptTemplate[]> => {
  const { data, error } = await supabase
    .from('estimate_prompt_templates')
    .select('*')
    .order('purpose', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching prompts:', error);
    return [];
  }

  return data || [];
};

export const createPrompt = async (prompt: EstimatePromptTemplateInsert): Promise<EstimatePromptTemplate | null> => {
  // If setting this prompt as active, deactivate others with same purpose
  if (prompt.active) {
    await supabase
      .from('estimate_prompt_templates')
      .update({ active: false })
      .eq('purpose', prompt.purpose);
  }

  const { data, error } = await supabase
    .from('estimate_prompt_templates')
    .insert([prompt])
    .select()
    .single();

  if (error) {
    console.error('Error creating prompt:', error);
    return null;
  }

  return data;
};

export const updatePrompt = async (id: string, updates: Partial<EstimatePromptTemplateInsert>): Promise<EstimatePromptTemplate | null> => {
  // If setting this prompt as active, deactivate others with same purpose
  if (updates.active && updates.purpose) {
    await supabase
      .from('estimate_prompt_templates')
      .update({ active: false })
      .eq('purpose', updates.purpose)
      .neq('id', id);
  }

  const { data, error } = await supabase
    .from('estimate_prompt_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating prompt:', error);
    return null;
  }

  return data;
};

export const deletePrompt = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('estimate_prompt_templates')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting prompt:', error);
    return false;
  }

  return true;
};

export const duplicatePrompt = async (id: string): Promise<EstimatePromptTemplate | null> => {
  const { data: original, error: fetchError } = await supabase
    .from('estimate_prompt_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !original) {
    console.error('Error fetching prompt to duplicate:', fetchError);
    return null;
  }

  const duplicateData: EstimatePromptTemplateInsert = {
    name: `${original.name} (Copy)`,
    purpose: original.purpose,
    model: original.model,
    temperature: original.temperature,
    prompt_text: original.prompt_text,
    active: false // Duplicates are never active by default
  };

  return await createPrompt(duplicateData);
};
