
/**
 * Validates if a row can be used as a table separator
 * A valid separator contains only dashes, colons, and pipes
 */
const isValidSeparator = (row: string): boolean => {
  // Remove all dashes, colons, and pipes
  const cleaned = row.replace(/[-:|]/g, '').trim();
  // If anything remains, it's not a valid separator
  return cleaned.length === 0;
};

/**
 * Cleans up a table row by removing extra pipes and whitespace
 */
const cleanTableRow = (row: string): string[] => {
  // Remove first and last pipe if they exist
  const trimmed = row.trim().replace(/^\||\|$/g, '');
  // Split by pipe and trim each cell
  return trimmed.split('|').map(cell => cell.trim());
};

/**
 * Validates if an array of rows forms a valid markdown table
 */
export const isValidTable = (rows: string[]): boolean => {
  if (rows.length < 3) return false;
  
  // Check if second row is a valid separator
  if (!isValidSeparator(rows[1])) return false;

  // Get number of columns from header
  const headerCells = cleanTableRow(rows[0]);
  
  // Check that all rows have the same number of columns
  return rows.every(row => cleanTableRow(row).length === headerCells.length);
};

export const parseTableRows = (rows: string[]): { headers: string[], data: string[][] } => {
  const headers = cleanTableRow(rows[0]);
  const data = rows.slice(2).map(cleanTableRow);
  
  return { headers, data };
};
