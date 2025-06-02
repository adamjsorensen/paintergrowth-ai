
export async function callOpenRouterAPI(
  fullPrompt: string,
  functionDefinition: any,
  model: string,
  temperature: number
) {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!openRouterApiKey) {
    throw new Error('OPENROUTER_API_KEY not found in environment variables');
  }

  console.log(`Calling OpenRouter with model: ${model}, temperature: ${temperature}`);

  // Convert the function definition to the new tools format
  const toolDefinition = {
    type: "function",
    function: functionDefinition
  };

  const requestBody = {
    model: model,
    messages: [
      {
        role: 'user',
        content: fullPrompt
      }
    ],
    tools: [toolDefinition],
    tool_choice: { type: "function", function: { name: "generate_pdf_content" } },
    temperature: temperature,
    max_tokens: 4000
  };

  console.log('OpenRouter request body prepared');

  const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://supabase.com',
      'X-Title': 'Estimate Generator V2'
    },
    body: JSON.stringify(requestBody)
  });

  if (!openRouterResponse.ok) {
    const errorText = await openRouterResponse.text();
    console.error(`OpenRouter API error (${openRouterResponse.status}):`, errorText);
    throw new Error(`OpenRouter API error: ${openRouterResponse.status} - ${errorText}`);
  }

  const result = await openRouterResponse.json();
  console.log('OpenRouter API call successful');
  
  return result;
}

export function createFunctionDefinition() {
  return {
    name: "generate_pdf_content",
    description: "Generate structured PDF content for painting estimates matching the exact template format",
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
            proposalNumber: { type: "string" },
            estimatorName: { type: "string" },
            estimatorEmail: { type: "string" },
            estimatorPhone: { type: "string" },
            clientPhone: { type: "string" },
            clientEmail: { type: "string" }
          },
          required: ["title", "clientName", "projectAddress", "estimateDate", "estimateNumber", "proposalNumber", "estimatorName", "estimatorEmail", "estimatorPhone", "clientPhone", "clientEmail"]
        },
        introductionLetter: {
          type: "object",
          properties: {
            greeting: { type: "string" },
            thankYouMessage: { type: "string" },
            valueProposition: { type: "string" },
            qualityCommitment: { type: "string" },
            collaborationMessage: { type: "string" },
            bookingInstructions: { type: "string" },
            closing: { type: "string" },
            ownerName: { type: "string" },
            companyName: { type: "string" },
            website: { type: "string" }
          },
          required: ["greeting", "thankYouMessage", "valueProposition", "qualityCommitment", "collaborationMessage", "bookingInstructions", "closing", "ownerName", "companyName", "website"]
        },
        projectDescription: {
          type: "object",
          properties: {
            powerWashing: {
              type: "object",
              properties: {
                description: { type: "string" },
                areas: { type: "array", items: { type: "string" } },
                notes: { type: "array", items: { type: "string" } }
              }
            },
            surfacePreparation: {
              type: "object",
              properties: {
                includes: { type: "array", items: { type: "string" } }
              }
            },
            paintApplication: {
              type: "object",
              properties: {
                description: { type: "string" },
                notes: { type: "array", items: { type: "string" } }
              }
            },
            inclusions: { type: "array", items: { type: "string" } },
            exclusions: { type: "array", items: { type: "string" } },
            safetyAndCleanup: { type: "array", items: { type: "string" } },
            specialConsiderations: { type: "string" }
          },
          required: ["powerWashing", "surfacePreparation", "paintApplication", "inclusions", "exclusions", "safetyAndCleanup", "specialConsiderations"]
        },
        pricing: {
          type: "object",
          properties: {
            subtotal: { type: "number" },
            tax: { type: "number" },
            total: { type: "number" }
          },
          required: ["subtotal", "tax", "total"]
        },
        colorApprovals: {
          type: "array",
          items: {
            type: "object",
            properties: {
              colorCode: { type: "string" },
              colorName: { type: "string" },
              surfaces: { type: "string" },
              approved: { type: "boolean" }
            }
          }
        },
        addOns: {
          type: "object",
          properties: {
            totalPrice: { type: "number" },
            validityDays: { type: "number" },
            depositPercent: { type: "number" },
            optionalUpgrades: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  selected: { type: "boolean" },
                  description: { type: "string" },
                  quantity: { type: "number" },
                  unitPrice: { type: "number" },
                  lineTotal: { type: "number" }
                }
              }
            },
            projectAcceptance: {
              type: "object",
              properties: {
                clientNameLine: { type: "string" },
                dateLine: { type: "string" },
                signatureLine: { type: "string" },
                agreementText: { type: "string" }
              }
            }
          },
          required: ["totalPrice", "validityDays", "depositPercent", "optionalUpgrades", "projectAcceptance"]
        }
      },
      required: ["coverPage", "introductionLetter", "projectDescription", "pricing", "colorApprovals", "addOns"]
    }
  };
}
