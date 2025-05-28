
export async function callOpenAI(prompt: string, openAIApiKey: string): Promise<any> {
  console.log('Calling OpenAI with prompt for transcript:', prompt.substring(0, 200) + '...');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting structured information from painting project transcripts. IMPORTANT: Return ONLY the JSON object without any markdown formatting, code blocks, or additional text. Do not wrap your response in ```json or ``` blocks.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  console.log('OpenAI response:', content);

  let extractedData;
  try {
    extractedData = JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse OpenAI response as JSON:', content);
    throw new Error('Invalid JSON response from OpenAI');
  }

  console.log('Successfully extracted data:', extractedData);
  return extractedData;
}
