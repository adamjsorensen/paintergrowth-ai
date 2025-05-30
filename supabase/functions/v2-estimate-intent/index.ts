
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts";

// Schema definitions
const UpsellItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  selected: z.boolean().default(false)
});

const ColorApprovalSchema = z.object({
  room: z.string(),
  colorName: z.string(),
  approved: z.boolean().default(false),
  signatureRequired: z.boolean().default(true)
});

const PDFContentSchema = z.object({
  coverPage: z.object({
    title: z.string(),
    clientName: z.string(),
    projectAddress: z.string(),
    estimateDate: z.string(),
    estimateNumber: z.string(),
    validUntil: z.string()
  }),
  introductionLetter: z.object({
    greeting: z.string(),
    projectOverview: z.string(),
    whyChooseUs: z.array(z.string()),
    nextSteps: z.string(),
    closing: z.string()
  }),
  scopeOfWork: z.object({
    preparation: z.array(z.string()),
    painting: z.array(z.string()),
    cleanup: z.array(z.string()),
    timeline: z.string()
  }),
  pricingSummary: z.object({
    subtotal: z.number(),
    tax: z.number(),
    discount: z.number().optional(),
    total: z.number(),
    paymentTerms: z.string()
  }),
  upsells: z.array(UpsellItemSchema),
  colorApprovals: z.array(ColorApprovalSchema),
  termsAndConditions: z.object({
    warranty: z.string(),
    materials: z.string(),
    scheduling: z.string(),
    changes: z.string()
  }),
  companyInfo: z.object({
    businessName: z.string(),
    contactInfo: z.string(),
    license: z.string(),
    insurance: z.string()
  })
});

type PDFContent = z.infer<typeof PDFContentSchema>;
type UpsellItem = z.infer<typeof UpsellItemSchema>;
type ColorApproval = z.infer<typeof ColorApprovalSchema>;

// Boilerplate cache
interface BoilerplateCache {
  terms_conditions?: string;
  warranty?: string;
  lastUpdated: number;
}

let cache: BoilerplateCache = { lastUpdated: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getBoilerplateTexts(supabaseClient: any): Promise<{ terms_conditions: string; warranty: string }> {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cache.terms_conditions && cache.warranty && (now - cache.lastUpdated) < CACHE_TTL) {
    return {
      terms_conditions: cache.terms_conditions,
      warranty: cache.warranty
    };
  }

  // Fetch fresh data
  const { data: boilerplateData, error } = await supabaseClient
    .from('boilerplate_texts')
    .select('type, content')
    .in('type', ['terms_conditions', 'warranty'])
    .eq('locale', 'en-US');

  if (error) {
    console.error('Error fetching boilerplate texts:', error);
    // Return cached data if available, otherwise defaults
    return {
      terms_conditions: cache.terms_conditions || 'Standard terms and conditions apply.',
      warranty: cache.warranty || '1-year warranty on workmanship.'
    };
  }

  // Update cache
  const termsData = boilerplateData.find(item => item.type === 'terms_conditions');
  const warrantyData = boilerplateData.find(item => item.type === 'warranty');
  
  cache = {
    terms_conditions: termsData?.content || 'Standard terms and conditions apply.',
    warranty: warrantyData?.content || '1-year warranty on workmanship.',
    lastUpdated: now
  };

  return {
    terms_conditions: cache.terms_conditions,
    warranty: cache.warranty
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const body = await req.json();
    const { 
      estimateData, 
      projectType, 
      lineItems, 
      totals, 
      roomsMatrix, 
      clientNotes,
      companyProfile,
      clientInfo,
      taxRate,
      addOns,
      upsells = [],
      colorApprovals = []
    } = body;

    console.log('Processing estimate intent with structured data');

    // Fetch boilerplate texts with caching
    const boilerplate = await getBoilerplateTexts(supabaseClient);

    // Get active prompt template
    const { data: promptTemplate, error: promptError } = await supabaseClient
      .from('estimate_prompt_templates')
      .select('*')
      .eq('purpose', 'pdf_generation')
      .eq('active', true)
      .single();

    if (promptError || !promptTemplate) {
      console.error('No active prompt template found');
      return new Response(
        JSON.stringify({ error: 'No active PDF generation prompt template found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare structured data for AI
    const currentDate = new Date();
    const estimateNumber = `EST-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
    
    const structuredInput = {
      estimateData: JSON.stringify(estimateData, null, 2),
      projectType,
      totals: JSON.stringify(totals, null, 2),
      roomsMatrix: roomsMatrix ? JSON.stringify(roomsMatrix, null, 2) : 'Not provided',
      clientNotes: clientNotes || 'No additional notes',
      companyProfile: companyProfile ? JSON.stringify(companyProfile, null, 2) : 'Not provided',
      clientInfo: clientInfo ? JSON.stringify(clientInfo, null, 2) : 'Not provided',
      taxRate: taxRate || '0%',
      boilerplateTexts: JSON.stringify(boilerplate, null, 2),
      upsells: JSON.stringify(upsells, null, 2),
      colorApprovals: JSON.stringify(colorApprovals, null, 2),
      estimateNumber,
      currentDate: currentDate.toLocaleDateString('en-US'),
      validUntil: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US')
    };

    // Replace placeholders in prompt
    let fullPrompt = promptTemplate.prompt_text;
    Object.entries(structuredInput).forEach(([key, value]) => {
      fullPrompt = fullPrompt.replace(new RegExp(`{${key}}`, 'g'), value || '');
    });

    console.log('Calling OpenRouter with function calling mode');

    // Use OpenAI function calling with structured schema
    const functionDefinition = {
      name: "generate_pdf_content",
      description: "Generate structured PDF content for painting estimates",
      parameters: {
        type: "object",
        properties: {
          coverPage: {
            type: "object",
            properties: {
              title: { type: "string" },
              clientName: { type: "string" },
              projectAddress: { type: "string" },
              estimateDate: { type: "string" },
              estimateNumber: { type: "string" },
              validUntil: { type: "string" }
            },
            required: ["title", "clientName", "projectAddress", "estimateDate", "estimateNumber", "validUntil"]
          },
          introductionLetter: {
            type: "object",
            properties: {
              greeting: { type: "string" },
              projectOverview: { type: "string" },
              whyChooseUs: { type: "array", items: { type: "string" } },
              nextSteps: { type: "string" },
              closing: { type: "string" }
            },
            required: ["greeting", "projectOverview", "whyChooseUs", "nextSteps", "closing"]
          },
          scopeOfWork: {
            type: "object",
            properties: {
              preparation: { type: "array", items: { type: "string" } },
              painting: { type: "array", items: { type: "string" } },
              cleanup: { type: "array", items: { type: "string" } },
              timeline: { type: "string" }
            },
            required: ["preparation", "painting", "cleanup", "timeline"]
          },
          pricingSummary: {
            type: "object",
            properties: {
              subtotal: { type: "number" },
              tax: { type: "number" },
              discount: { type: "number" },
              total: { type: "number" },
              paymentTerms: { type: "string" }
            },
            required: ["subtotal", "tax", "total", "paymentTerms"]
          },
          upsells: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                price: { type: "number" },
                selected: { type: "boolean" }
              }
            }
          },
          colorApprovals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                room: { type: "string" },
                colorName: { type: "string" },
                approved: { type: "boolean" },
                signatureRequired: { type: "boolean" }
              }
            }
          },
          termsAndConditions: {
            type: "object",
            properties: {
              warranty: { type: "string" },
              materials: { type: "string" },
              scheduling: { type: "string" },
              changes: { type: "string" }
            },
            required: ["warranty", "materials", "scheduling", "changes"]
          },
          companyInfo: {
            type: "object",
            properties: {
              businessName: { type: "string" },
              contactInfo: { type: "string" },
              license: { type: "string" },
              insurance: { type: "string" }
            },
            required: ["businessName", "contactInfo", "license", "insurance"]
          }
        },
        required: ["coverPage", "introductionLetter", "scopeOfWork", "pricingSummary", "termsAndConditions", "companyInfo"]
      }
    };

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://supabase.com',
        'X-Title': 'Estimate Generator V2'
      },
      body: JSON.stringify({
        model: promptTemplate.model,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        functions: [functionDefinition],
        function_call: { name: "generate_pdf_content" },
        temperature: promptTemplate.temperature
      })
    });

    if (!openRouterResponse.ok) {
      throw new Error(`OpenRouter API error: ${openRouterResponse.statusText}`);
    }

    const result = await openRouterResponse.json();
    const functionCall = result.choices[0]?.message?.function_call;

    if (!functionCall || functionCall.name !== "generate_pdf_content") {
      throw new Error('AI did not use function calling properly');
    }

    // Parse and validate the function call arguments
    let generatedContent;
    try {
      const parsedArgs = JSON.parse(functionCall.arguments);
      generatedContent = PDFContentSchema.parse(parsedArgs);
      console.log('PDF content validated successfully');
    } catch (validationError) {
      console.error('Validation failed:', validationError);
      
      // Return diagnostic error PDF instead of fallback
      return new Response(
        JSON.stringify({
          error: 'AI_VALIDATION_FAILED',
          message: 'Generated content failed validation',
          rawResponse: functionCall.arguments,
          validationErrors: validationError.errors || validationError.message
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('PDF intent processed successfully');

    return new Response(
      JSON.stringify(generatedContent),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in v2-estimate-intent function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'PROCESSING_FAILED',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
