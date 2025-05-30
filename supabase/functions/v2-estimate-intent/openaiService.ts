
export async function callOpenRouterAPI(
  fullPrompt: string,
  functionDefinition: any,
  model: string,
  temperature: number
) {
  const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://supabase.com',
      'X-Title': 'Estimate Generator V2'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      functions: [functionDefinition],
      function_call: { name: "generate_pdf_content" },
      temperature: temperature
    })
  });

  if (!openRouterResponse.ok) {
    throw new Error(`OpenRouter API error: ${openRouterResponse.statusText}`);
  }

  return await openRouterResponse.json();
}

export function createFunctionDefinition() {
  return {
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
}
