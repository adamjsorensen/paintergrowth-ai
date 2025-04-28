
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

/**
 * Process style preferences to format them for the prompt
 * @param stylePreferences Object containing style preferences like length and tone
 * @returns Object with processed style preferences ready for prompt insertion
 */
export function processStylePreferences(stylePreferences: any) {
  if (!stylePreferences) {
    return {
      lengthInstruction: "Use a standard length with balanced detail.",
      toneInstruction: "Use a professional tone.",
      additionalInstructions: ""
    };
  }

  // Process length preference
  let lengthInstruction = "";
  switch(stylePreferences.length) {
    case 0:
      lengthInstruction = "Make the proposal very concise and focused only on essential points. Minimize paragraph length and eliminate all non-essential details.";
      break;
    case 25:
      lengthInstruction = "Keep the proposal brief, including only key details and main points. Use short paragraphs and concise language.";
      break;
    case 50:
      lengthInstruction = "Use a standard length with balanced detail. Include enough information to be thorough but avoid being overly verbose.";
      break;
    case 75:
      lengthInstruction = "Create a detailed proposal with thorough explanations. Expand on important sections and provide more context where valuable.";
      break;
    case 100:
      lengthInstruction = "Develop a comprehensive proposal with extensive detail and context. Elaborate thoroughly on all sections and provide detailed explanations throughout.";
      break;
    default:
      lengthInstruction = "Use a standard length with balanced detail.";
  }

  // Process tone preference
  let toneInstruction = "";
  switch(stylePreferences.tone) {
    case "friendly":
      toneInstruction = "Use a friendly, approachable tone that builds rapport with the reader. Be conversational while maintaining professionalism.";
      break;
    case "professional":
      toneInstruction = "Use a formal, business-oriented tone throughout the proposal. Maintain professional language and structure.";
      break;
    case "bold":
      toneInstruction = "Use a confident, assertive tone that conveys expertise and certainty. Be direct and emphasize value propositions strongly.";
      break;
    case "chill":
      toneInstruction = "Use a relaxed, casual approach while still being professional. Adopt a conversational style that feels approachable and low-pressure.";
      break;
    default:
      toneInstruction = "Use a professional tone appropriate for business proposals.";
  }

  // Process additional options
  let additionalInstructions = "";
  if (stylePreferences.addUpsells) {
    additionalInstructions += " Include suggestions for value-added services or premium options that could enhance the project.";
  }

  return {
    lengthInstruction,
    toneInstruction,
    additionalInstructions
  };
}

