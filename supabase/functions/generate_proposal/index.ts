
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  if (!openRouterApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenRouter API key not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { prompt_id, field_values, proposal_id, user_email } = await req.json();
    
    if (!prompt_id) {
      return new Response(
        JSON.stringify({ error: 'Missing prompt_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!proposal_id) {
      return new Response(
        JSON.stringify({ error: 'Missing proposal_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update the proposal record to indicate processing
    await supabase
      .from('saved_proposals')
      .update({ status: 'generating' })
      .eq('id', proposal_id);

    // Get user ID from proposal record
    const { data: proposalData } = await supabase
      .from('saved_proposals')
      .select('user_id')
      .eq('id', proposal_id)
      .single();
    
    const user_id = proposalData?.user_id;

    // Fetch the prompt template
    const { data: promptTemplate, error: promptError } = await supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', prompt_id)
      .maybeSingle();
    
    if (promptError) {
      console.error('Error fetching prompt template:', promptError);
      
      // Update proposal status to failed
      await supabase
        .from('saved_proposals')
        .update({ status: 'failed', content: 'Failed to fetch prompt template: ' + promptError.message })
        .eq('id', proposal_id);

      // Log the failed generation
      await supabase
        .from('generation_logs')
        .insert({
          user_id,
          user_email: user_email || 'unknown',
          prompt_id,
          proposal_id,
          model_used: 'openai/gpt-4o-mini',
          system_prompt: 'Failed to fetch prompt template',
          final_prompt: 'Generate a detailed proposal based on the information provided.',
          user_input: field_values,
          status: 'failed',
          ai_response: 'Failed to fetch prompt template: ' + promptError.message,
          rag_context: 'Coming soon'
        });
        
      return new Response(
        JSON.stringify({ error: 'Failed to fetch prompt template: ' + promptError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If prompt not found but ID is the default placeholder, use a default system prompt
    if (!promptTemplate && prompt_id === "00000000-0000-0000-0000-000000000000") {
      console.log('Using default prompt template for placeholder ID');
      
      // Use a simple default system prompt
      let systemPrompt = "You are a professional proposal writer for a painting contractor. " +
        "Create a detailed painting proposal based on the provided information. " +
        "Include an introduction, scope of work, pricing details, and a professional conclusion.";
      
      // Process field values directly
      Object.entries(field_values).forEach(([key, value]) => {
        systemPrompt += `\n- ${key}: ${JSON.stringify(value)}`;
      });

      console.log('Using default system prompt');

      // Call OpenRouter API
      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': 'https://lovable.dev',
          'X-Title': 'Proposal Generator'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Generate a detailed proposal based on the information provided.' }
          ],
          temperature: 0.7,
          max_tokens: 1500
        }),
      });

      console.log('OpenRouter API response status:', openRouterResponse.status);

      if (!openRouterResponse.ok) {
        const errorData = await openRouterResponse.text();
        console.error('OpenRouter API error:', errorData);
        
        // Update the proposal record to indicate failure
        await supabase
          .from('saved_proposals')
          .update({ 
            status: 'failed', 
            content: 'Failed to generate content from OpenRouter: ' + errorData 
          })
          .eq('id', proposal_id);
          
        // Log the failed generation
        await supabase
          .from('generation_logs')
          .insert({
            user_id,
            user_email: user_email || 'unknown',
            prompt_id,
            proposal_id,
            model_used: 'openai/gpt-4o-mini',
            system_prompt: systemPrompt,
            final_prompt: 'Generate a detailed proposal based on the information provided.',
            user_input: field_values,
            status: 'failed',
            ai_response: 'Failed to generate content from OpenRouter: ' + errorData,
            rag_context: 'Coming soon'
          });
          
        return new Response(
          JSON.stringify({ error: 'Failed to generate content from OpenRouter' }),
          { status: openRouterResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await openRouterResponse.json();
      console.log('OpenRouter API response received successfully');
      
      const generatedContent = data.choices[0].message.content;

      // Update the proposal record with the generated content
      const { error: updateError } = await supabase
        .from('saved_proposals')
        .update({
          content: generatedContent,
          status: 'completed'
        })
        .eq('id', proposal_id);

      if (updateError) {
        console.error('Error updating proposal:', updateError);
        
        // Log the failed generation
        await supabase
          .from('generation_logs')
          .insert({
            user_id,
            user_email: user_email || 'unknown',
            prompt_id,
            proposal_id,
            model_used: 'openai/gpt-4o-mini',
            system_prompt: systemPrompt,
            final_prompt: 'Generate a detailed proposal based on the information provided.',
            user_input: field_values,
            status: 'failed',
            ai_response: 'Error updating proposal: ' + updateError.message,
            rag_context: 'Coming soon'
          });
        
        return new Response(
          JSON.stringify({ error: 'Failed to save generated proposal: ' + updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log the successful generation
      await supabase
        .from('generation_logs')
        .insert({
          user_id,
          user_email: user_email || 'unknown',
          prompt_id,
          proposal_id,
          model_used: 'openai/gpt-4o-mini',
          system_prompt: systemPrompt,
          final_prompt: 'Generate a detailed proposal based on the information provided.',
          user_input: field_values,
          status: 'success',
          ai_response: generatedContent,
          rag_context: 'Coming soon'
        });

      console.log('Proposal updated successfully with ID:', proposal_id);

      return new Response(
        JSON.stringify({ success: true, proposal_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If no prompt template and not using the default, return error
    if (!promptTemplate) {
      console.error('No prompt template found for ID:', prompt_id);
      
      // Update proposal status to failed
      await supabase
        .from('saved_proposals')
        .update({ 
          status: 'failed',
          content: `Prompt template with ID ${prompt_id} not found`
        })
        .eq('id', proposal_id);
        
      // Log the failed generation
      await supabase
        .from('generation_logs')
        .insert({
          user_id,
          user_email: user_email || 'unknown',
          prompt_id,
          proposal_id,
          model_used: 'openai/gpt-4o-mini',
          system_prompt: `Prompt template with ID ${prompt_id} not found`,
          final_prompt: 'Generate a detailed proposal based on the information provided.',
          user_input: field_values,
          status: 'failed',
          ai_response: `Prompt template with ID ${prompt_id} not found`,
          rag_context: 'Coming soon'
        });
        
      return new Response(
        JSON.stringify({ error: `Prompt template with ID ${prompt_id} not found` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process the system prompt - replace all {{field_key}} with actual values
    let systemPrompt = promptTemplate.system_prompt;
    Object.entries(field_values).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      systemPrompt = systemPrompt.replace(regex, String(value));
    });

    console.log('Processed system prompt:', systemPrompt);
    console.log('Starting OpenRouter API call...');

    // Call OpenRouter API
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': 'https://lovable.dev', // Replace with your actual domain
        'X-Title': 'Proposal Generator'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate a detailed proposal based on the information provided.' }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
    });

    console.log('OpenRouter API response status:', openRouterResponse.status);

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error('OpenRouter API error:', errorData);
      
      // Update the proposal record to indicate failure
      await supabase
        .from('saved_proposals')
        .update({ 
          status: 'failed',
          content: 'Failed to generate content from OpenRouter: ' + errorData 
        })
        .eq('id', proposal_id);
        
      // Log the failed generation
      await supabase
        .from('generation_logs')
        .insert({
          user_id,
          user_email: user_email || 'unknown',
          prompt_id,
          proposal_id,
          model_used: 'openai/gpt-4o-mini',
          system_prompt: systemPrompt,
          final_prompt: 'Generate a detailed proposal based on the information provided.',
          user_input: field_values,
          status: 'failed',
          ai_response: 'Failed to generate content from OpenRouter: ' + errorData,
          rag_context: 'Coming soon'
        });
        
      return new Response(
        JSON.stringify({ error: 'Failed to generate content from OpenRouter' }),
        { status: openRouterResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await openRouterResponse.json();
    console.log('OpenRouter API response received successfully');
    
    const generatedContent = data.choices[0].message.content;

    // Update the proposal record with the generated content
    const { error: updateError } = await supabase
      .from('saved_proposals')
      .update({
        content: generatedContent,
        status: 'completed'
      })
      .eq('id', proposal_id);

    if (updateError) {
      console.error('Error updating proposal:', updateError);
      
      // Log the failed generation
      await supabase
        .from('generation_logs')
        .insert({
          user_id,
          user_email: user_email || 'unknown',
          prompt_id,
          proposal_id,
          model_used: 'openai/gpt-4o-mini',
          system_prompt: systemPrompt,
          final_prompt: 'Generate a detailed proposal based on the information provided.',
          user_input: field_values,
          status: 'failed',
          ai_response: 'Error updating proposal: ' + updateError.message,
          rag_context: 'Coming soon'
        });
      
      return new Response(
        JSON.stringify({ error: 'Failed to save generated proposal: ' + updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the successful generation
    await supabase
      .from('generation_logs')
      .insert({
        user_id,
        user_email: user_email || 'unknown',
        prompt_id,
        proposal_id,
        model_used: 'openai/gpt-4o-mini',
        system_prompt: systemPrompt,
        final_prompt: 'Generate a detailed proposal based on the information provided.',
        user_input: field_values,
        status: 'success',
        ai_response: generatedContent,
        rag_context: 'Coming soon'
      });

    console.log('Proposal updated successfully with ID:', proposal_id);

    return new Response(
      JSON.stringify({ success: true, proposal_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in generate_proposal function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
