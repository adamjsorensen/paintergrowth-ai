
/**
 * Validates template placeholders against provided values
 */
export const validatePlaceholders = (prompt: string, values: Record<string, any>): string[] => {
  const placeholderRegex = /{{([^{}]+)}}/g;
  const matches = [...prompt.matchAll(placeholderRegex)];
  
  const unresolvedPlaceholders = matches
    .map(match => match[1])
    .filter(placeholder => {
      // Ignore conditional blocks
      if (placeholder.startsWith('#if')) return false;
      // Check if value exists and is not undefined/null
      return values[placeholder] === undefined || values[placeholder] === null;
    });

  if (unresolvedPlaceholders.length > 0) {
    console.warn('Unresolved placeholders:', unresolvedPlaceholders);
  }

  return unresolvedPlaceholders;
};
