
// Error codes for better debugging
export const ERROR_CODES = {
  E_DB_SCHEMA: 'Database schema error',
  E_OPENROUTER_FAIL: 'OpenRouter API failure',
  E_NO_PROMPT_TEMPLATE: 'No prompt template found',
  E_MISSING_API_KEY: 'Missing OpenRouter API key',
  E_VALIDATION_FAILED: 'AI response validation failed'
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
