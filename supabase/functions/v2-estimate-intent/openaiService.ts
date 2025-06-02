
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
    tool_choice: { type: "function", function: { name: "generate_comprehensive_pdf_content" } },
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
    name: "generate_comprehensive_pdf_content",
    description: "Generate comprehensive PDF content for painting estimates with all 9 required sections",
    parameters: {
      type: "object",
      properties: {
        coverPage: {
          type: "object",
          properties: {
            estimateDate: {
              type: "string",
              description: "Current date for the estimate"
            },
            estimateNumber: {
              type: "string", 
              description: "Unique estimate number"
            },
            proposalNumber: {
              type: "string",
              description: "Unique proposal number"
            },
            clientName: {
              type: "string",
              description: "Client's full name"
            },
            clientPhone: {
              type: "string",
              description: "Client's phone number"
            },
            clientEmail: {
              type: "string",
              description: "Client's email address"
            },
            projectAddress: {
              type: "string",
              description: "Project address"
            },
            estimatorName: {
              type: "string",
              description: "Estimator's name"
            },
            estimatorEmail: {
              type: "string",
              description: "Estimator's email"
            },
            estimatorPhone: {
              type: "string",
              description: "Estimator's phone number"
            }
          },
          required: ["estimateDate", "estimateNumber", "proposalNumber", "clientName", "clientPhone", "clientEmail", "projectAddress", "estimatorName", "estimatorEmail", "estimatorPhone"]
        },
        projectOverview: {
          type: "string",
          description: "Comprehensive overview of the painting project including client details and project summary"
        },
        scopeOfWork: {
          type: "string", 
          description: "Detailed description of all work to be performed"
        },
        lineItems: {
          type: "array",
          items: {
            type: "object",
            properties: {
              description: {
                type: "string",
                description: "Description of the line item"
              },
              quantity: {
                type: "number",
                description: "Quantity of the item"
              },
              unit: {
                type: "string",
                description: "Unit of measurement"
              },
              unitPrice: {
                type: "number",
                description: "Price per unit"
              },
              total: {
                type: "number",
                description: "Total price for this line item"
              }
            },
            required: ["description", "quantity", "unit", "unitPrice", "total"]
          },
          description: "Array of line items with pricing"
        },
        addOns: {
          type: "array",
          items: {
            type: "object",
            properties: {
              description: {
                type: "string",
                description: "Description of the add-on service"
              },
              price: {
                type: "number",
                description: "Price of the add-on"
              },
              selected: {
                type: "boolean",
                description: "Whether this add-on is selected"
              }
            },
            required: ["description", "price", "selected"]
          },
          description: "Array of optional add-on services"
        },
        pricing: {
          type: "object",
          properties: {
            subtotal: {
              type: "number",
              description: "Subtotal amount"
            },
            tax: {
              type: "number",
              description: "Tax amount"
            },
            total: {
              type: "number",
              description: "Total amount including tax"
            },
            taxRate: {
              type: "string",
              description: "Tax rate percentage"
            }
          },
          required: ["subtotal", "tax", "total", "taxRate"]
        },
        termsAndConditions: {
          type: "string",
          description: "Terms and conditions for the project"
        },
        companyInfo: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Company name"
            },
            address: {
              type: "string",
              description: "Company address"
            },
            phone: {
              type: "string",
              description: "Company phone number"
            },
            email: {
              type: "string",
              description: "Company email"
            },
            website: {
              type: "string",
              description: "Company website (optional)"
            }
          },
          required: ["name", "address", "phone", "email"]
        },
        signatures: {
          type: "object",
          properties: {
            clientSignatureRequired: {
              type: "boolean",
              description: "Whether client signature is required"
            },
            warrantyInfo: {
              type: "string",
              description: "Warranty information text"
            }
          },
          required: ["clientSignatureRequired", "warrantyInfo"]
        }
      },
      required: ["coverPage", "projectOverview", "scopeOfWork", "lineItems", "addOns", "pricing", "termsAndConditions", "companyInfo", "signatures"]
    }
  };
}
