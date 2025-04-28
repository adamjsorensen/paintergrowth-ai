import { createSupabaseClient } from "./utils.ts";

/**
 * Merges generated content with boilerplate texts
 */
export async function mergeWithBoilerplate(
  supabase: any,
  generatedContent: string,
  values: Record<string, any>
): Promise<string> {
  let finalContent = generatedContent;
  
  // Get the selected locale, default to en-US if not provided
  const locale = values.locale || 'en-US';
  
  // Fetch boilerplate texts
  const boilerplateTypes: string[] = [];
  if (values.includeTerms === true || values.includeTerms === "true") {
    boilerplateTypes.push('terms_conditions');
  }
  if (values.includeWarranty === true || values.includeWarranty === "true") {
    boilerplateTypes.push('warranty');
  }
  
  if (boilerplateTypes.length > 0) {
    console.log(`Fetching boilerplate types: ${boilerplateTypes.join(', ')} for locale: ${locale}`);
    
    // Fetch the requested boilerplate texts
    const { data: boilerplateTexts, error: boilerplateError } = await supabase
      .from('boilerplate_texts')
      .select('*')
      .in('type', boilerplateTypes)
      .eq('locale', locale);
      
    if (boilerplateError) {
      console.error('Error fetching boilerplate texts:', boilerplateError);
      return finalContent; // Return original content on error
    } 
    
    if (boilerplateTexts && boilerplateTexts.length > 0) {
      console.log(`Found ${boilerplateTexts.length} boilerplate texts`);
      
      // Fetch placeholder defaults
      const { data: placeholderDefaults, error: defaultsError } = await supabase
        .from('placeholder_defaults')
        .select('*');
        
      if (defaultsError) {
        console.error('Error fetching placeholder defaults:', defaultsError);
      }
      
      // Create defaults map
      const defaultsMap: Record<string, string> = {};
      if (placeholderDefaults) {
        placeholderDefaults.forEach((item: any) => {
          defaultsMap[item.placeholder] = item.default_value;
        });
      }
      
      // Merge boilerplate with generated content
      finalContent = await mergeBoilerplateContent(
        generatedContent,
        boilerplateTexts,
        values,
        defaultsMap
      );
      
      console.log("Successfully merged content with boilerplates");
    } else {
      console.log("No matching boilerplate texts found");
    }
  }
  
  return finalContent;
}

/**
 * Merges generated content with boilerplate texts
 */
export function mergeBoilerplateContent(
  generatedContent: string,
  boilerplateTexts: any[],
  values: Record<string, any>,
  defaultPlaceholders: Record<string, string> = {}
): string {
  let fullContent = generatedContent;
  
  // Process each boilerplate text
  for (const boilerplate of boilerplateTexts) {
    // Replace placeholders in the boilerplate content
    let processedContent = boilerplate.content;
    
    // Regular expression to match {{placeholder}} pattern
    const placeholderRegex = /{{([^{}]+)}}/g;
    
    // Replace placeholders with values
    processedContent = processedContent.replace(placeholderRegex, (match, placeholder) => {
      // Check if the value exists in provided values
      if (values[placeholder] !== undefined && values[placeholder] !== null) {
        return String(values[placeholder]);
      }
      
      // Check if the value exists in defaults
      if (defaultPlaceholders[placeholder]) {
        return defaultPlaceholders[placeholder];
      }
      
      // Keep the original placeholder if no value is found
      return match;
    });
    
    // Add section heading based on boilerplate type
    let sectionTitle = '';
    switch (boilerplate.type) {
      case 'terms_conditions':
        sectionTitle = '## Terms and Conditions';
        break;
      case 'warranty':
        sectionTitle = '## Warranty';
        break;
      case 'invoice_note':
        sectionTitle = '## Invoice Notes';
        break;
      default:
        sectionTitle = `## ${boilerplate.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
    }
    
    // Append boilerplate content with proper spacing and heading
    fullContent += `\n\n${sectionTitle}\n\n${processedContent}`;
  }
  
  return fullContent;
}
