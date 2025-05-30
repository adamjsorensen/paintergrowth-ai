
// Boilerplate cache
interface BoilerplateCache {
  terms_conditions?: string;
  warranty?: string;
  lastUpdated: number;
}

let cache: BoilerplateCache = { lastUpdated: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getBoilerplateTexts(supabaseClient: any): Promise<{ terms_conditions: string; warranty: string }> {
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
