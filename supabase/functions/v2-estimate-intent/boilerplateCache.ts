
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

let cachedBoilerplate: Record<string, any> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getBoilerplateTexts(supabaseClient: any) {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedBoilerplate && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Using cached boilerplate texts');
    return cachedBoilerplate;
  }
  
  try {
    console.log('Fetching boilerplate texts from database');
    
    const { data: boilerplateData, error } = await supabaseClient
      .from('boilerplate_texts')
      .select('*')
      .eq('active', true);
    
    if (error) {
      console.error('Error fetching boilerplate:', error);
      return getDefaultBoilerplate();
    }
    
    // Convert array to object keyed by section
    const boilerplate = boilerplateData.reduce((acc: Record<string, any>, item: any) => {
      acc[item.section] = item.content;
      return acc;
    }, {});
    
    // Cache the result
    cachedBoilerplate = boilerplate;
    cacheTimestamp = now;
    
    console.log('Boilerplate texts cached successfully');
    return boilerplate;
    
  } catch (error) {
    console.error('Failed to fetch boilerplate texts:', error);
    return getDefaultBoilerplate();
  }
}

function getDefaultBoilerplate() {
  return {
    introduction: 'Thank you for considering our painting services for your project.',
    powerWashing: 'We will thoroughly clean all surfaces to ensure proper paint adhesion.',
    surfacePreparation: 'All surfaces will be properly prepared including scraping, sanding, and priming as needed.',
    paintApplication: 'We use only high-quality paints and materials for lasting results.',
    safetyAndCleanup: 'We maintain a clean and safe work environment throughout the project.',
    specialConsiderations: 'Please note any special requirements or concerns for this project.'
  };
}
