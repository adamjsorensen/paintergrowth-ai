
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
  // Basic checks
  if (rows.length < 3) return false;
  
  // Check if second row is a valid separator
  if (!isValidSeparator(rows[1])) return false;

  // Get number of columns from header
  const headerCells = cleanTableRow(rows[0]);
  if (headerCells.length === 0) return false;
  
  // We don't strictly enforce the same number of columns for all rows
  // as long as there is at least one column and the separator row looks valid
  return true;
};

/**
 * Parses table rows into headers and data
 * Now more tolerant of inconsistent column counts
 */
export const parseTableRows = (rows: string[]): { headers: string[], data: string[][] } => {
  const headers = cleanTableRow(rows[0]);
  const columnCount = headers.length;
  
  // Process data rows
  const data = rows.slice(2).map(row => {
    const cells = cleanTableRow(row);
    
    // Ensure consistent number of columns by padding or truncating
    if (cells.length < columnCount) {
      // Add empty cells if row has fewer columns than header
      return [...cells, ...Array(columnCount - cells.length).fill('')];
    } else if (cells.length > columnCount) {
      // Truncate if row has more columns than header
      return cells.slice(0, columnCount);
    }
    return cells;
  });
  
  return { headers, data };
};
