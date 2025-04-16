
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  return createClient(supabaseUrl, supabaseKey);
}

export async function updateProposalStatus(supabase, proposalId, status, content = null) {
  const updateData: { status: string; content?: string } = { status };
  
  if (content) {
    updateData.content = content;
  }
  
  return supabase
    .from('saved_proposals')
    .update(updateData)
    .eq('id', proposalId);
}

export async function getProposalUserId(supabase, proposalId) {
  const { data } = await supabase
    .from('saved_proposals')
    .select('user_id')
    .eq('id', proposalId)
    .single();
  
  return data?.user_id;
}

export async function fetchPromptTemplate(supabase, promptId) {
  return supabase
    .from('prompt_templates')
    .select('*')
    .eq('id', promptId)
    .maybeSingle();
}

export async function fetchPromptFields(supabase) {
  return supabase
    .from('prompt_fields')
    .select('*')
    .eq('active', true)
    .order('section')
    .order('order_position');
}

export async function logGeneration(supabase, {
  user_id,
  user_email,
  prompt_id,
  proposal_id,
  model_used,
  system_prompt,
  final_prompt,
  user_input,
  status,
  ai_response,
  rag_context
}) {
  return supabase
    .from('generation_logs')
    .insert({
      user_id,
      user_email,
      prompt_id,
      proposal_id,
      model_used,
      system_prompt,
      final_prompt,
      user_input,
      status,
      ai_response,
      rag_context
    });
}

export async function fetchAISettings(supabase) {
  const { data } = await supabase
    .from('ai_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    temperature: data?.temperature ?? 0.7,
    model: data?.model ?? 'gpt-4o-mini',
    max_tokens: data?.max_tokens ?? 1500
  };
}
