import { supabase } from "@/integrations/supabase/client";

export type PromptPurpose = 'scope' | 'suggestion' | 'pdf_summary' | 'pdf_generation';

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

// Data injection interface for dynamic prompt building
export interface PromptDataInjection {
  // For scope extraction
  roomsListForPrompt?: string;
  transcript?: string;
  
  // For estimate content generation
  projectType?: string;
  estimateData?: string;
  lineItems?: string;
  totals?: string;
  
  // For suggestion engine
  projectData?: string;
  currentEstimate?: string;
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

export const getActivePromptWithDataInjection = async (
  purpose: PromptPurpose, 
  injectionData?: PromptDataInjection
): Promise<{ prompt: string; model: string; temperature: number } | null> => {
  const template = await getActivePrompt(purpose);
  
  if (!template) {
    console.error(`No active prompt found for purpose: ${purpose}`);
    return null;
  }

  let processedPrompt = template.prompt_text;

  // Inject dynamic data if provided
  if (injectionData) {
    Object.entries(injectionData).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      if (value !== undefined && processedPrompt.includes(placeholder)) {
        processedPrompt = processedPrompt.replace(new RegExp(placeholder, 'g'), value);
      }
    });
  }

  return {
    prompt: processedPrompt,
    model: template.model,
    temperature: template.temperature
  };
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

// Validation helper to check if prompt contains required placeholders
export const validatePromptPlaceholders = (purpose: PromptPurpose, promptText: string): string[] => {
  const requiredPlaceholders: Record<PromptPurpose, string[]> = {
    scope: ['{roomsListForPrompt}', '{transcript}'],
    pdf_summary: ['{projectType}', '{estimateData}', '{lineItems}', '{totals}'],
    suggestion: ['{projectType}', '{estimateData}', '{lineItems}', '{totals}', '{roomsMatrix}', '{clientNotes}'],
    pdf_generation: ['{projectType}', '{estimateData}', '{lineItems}', '{totals}']
  };

  const required = requiredPlaceholders[purpose] || [];
  const missing = required.filter(placeholder => !promptText.includes(placeholder));
  
  return missing;
};
