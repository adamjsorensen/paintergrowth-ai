
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Mustache from "https://esm.sh/mustache@4.2.0";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

export async function updateProposalStatus(
  supabase, 
  proposalId, 
  status, 
  content = null
) {
  const updateData: Record<string, any> = { status };
  if (content !== null) {
    updateData.content = content;
  }

  return await supabase
    .from('saved_proposals')
    .update(updateData)
    .eq('id', proposalId);
}

export async function fetchPromptTemplate(supabase, promptId) {
  return await supabase
    .from('prompt_templates')
    .select('*')
    .eq('id', promptId)
    .single();
}

export async function fetchAISettings(supabase) {
  const { data, error } = await supabase
    .from('ai_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Failed to fetch AI settings:', error);
    return {
      default_system_prompt: "You are a professional proposal writer. Create a detailed, well-organized proposal.",
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1024,
      seed_prompt: "Please write a proposal based on the information provided."
    };
  }

  return data;
}

export async function logGeneration(supabase, logData) {
  try {
    const { error } = await supabase.from('generation_logs').insert([logData]);
    if (error) {
      console.error('Failed to log generation:', error);
    }
  } catch (e) {
    console.error('Error logging generation:', e);
  }
}

export function renderPrompt(tpl: string, vars: Record<string, any>) {
  // Stringify any complex objects manually
  const safeVars = Object.fromEntries(
    Object.entries(vars).map(([k, v]) =>
      [k, typeof v === "object" ? JSON.stringify(v, null, 2) : v]
    )
  );
  const out = Mustache.render(tpl, safeVars);
  const unresolved = out.match(/{{[^}]+}}/g);
  if (unresolved?.length) {
    throw new Error(`Unresolved placeholders: ${unresolved.join(",")}`);
  }
  return out;
}
