
/**
 * Find unresolved placeholders in a prompt template
 */
export const findUnresolvedPlaceholders = (prompt: string, values: Record<string, any>): string[] => {
  const placeholderRegex = /{{([^{}]+)}}/g;
  const matches = [...prompt.matchAll(placeholderRegex)];
  const unresolvedPlaceholders = [];

  for (const match of matches) {
    const placeholder = match[1];
    // Skip conditional blocks
    if (!placeholder.startsWith('#if') && !values[placeholder]) {
      unresolvedPlaceholders.push(placeholder);
    }
  }

  return unresolvedPlaceholders;
};
