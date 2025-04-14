
import * as XLSX from "xlsx";
import { read, extractRawText } from "mammoth";

export interface ParsedFile {
  content: string;
  error?: string;
}

export const parseFile = async (file: File): Promise<ParsedFile> => {
  const fileType = getFileType(file);
  
  try {
    switch (fileType) {
      case 'text':
        return parseTextFile(file);
      case 'word':
        return parseWordFile(file);
      case 'excel':
        return parseExcelFile(file);
      case 'csv':
        return parseCsvFile(file);
      case 'markdown':
        return parseTextFile(file);
      case 'json':
        return parseJsonFile(file);
      case 'css':
        return parseTextFile(file);
      default:
        return { 
          content: "", 
          error: `Unsupported file type: ${file.type || file.name.split('.').pop()}` 
        };
    }
  } catch (error) {
    console.error("Error parsing file:", error);
    return { 
      content: "", 
      error: `Error parsing file: ${error instanceof Error ? error.message : "Unknown error"}` 
    };
  }
};

const getFileType = (file: File): string => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension) return 'unknown';

  if (['txt', 'text'].includes(extension)) return 'text';
  if (['doc', 'docx'].includes(extension)) return 'word';
  if (['xls', 'xlsx'].includes(extension)) return 'excel';
  if (extension === 'csv') return 'csv';
  if (extension === 'md') return 'markdown';
  if (extension === 'json') return 'json';
  if (extension === 'css') return 'css';
  
  return 'unknown';
};

const parseTextFile = async (file: File): Promise<ParsedFile> => {
  const text = await file.text();
  return { content: text };
};

const parseWordFile = async (file: File): Promise<ParsedFile> => {
  const arrayBuffer = await file.arrayBuffer();
  
  try {
    const result = await extractRawText({arrayBuffer});
    return { content: result.value };
  } catch (error) {
    // Fallback to another method if extraction fails
    try {
      const fullResult = await read(arrayBuffer);
      return { content: fullResult.value };
    } catch (secondError) {
      console.error("Word parsing failed with both methods:", secondError);
      throw new Error("Failed to parse Word document");
    }
  }
};

const parseExcelFile = async (file: File): Promise<ParsedFile> => {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  
  const allSheetData: string[] = [];
  
  wb.SheetNames.forEach(sheetName => {
    const worksheet = wb.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
    
    allSheetData.push(`# Sheet: ${sheetName}`);
    
    if (jsonData.length > 0) {
      // Handle data with rows and columns
      const headers = Object.keys(jsonData[0]);
      
      // Add headers
      allSheetData.push(headers.join('\t'));
      
      // Add data rows
      jsonData.forEach(row => {
        const rowValues = headers.map(header => String(row[header] ?? '')).join('\t');
        allSheetData.push(rowValues);
      });
    } else {
      // Try to get raw cell values for empty sheets or unusual structures
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      const rows = [];
      
      for (let r = range.s.r; r <= range.e.r; ++r) {
        const rowData = [];
        for (let c = range.s.c; c <= range.e.c; ++c) {
          const cellAddress = XLSX.utils.encode_cell({r, c});
          const cell = worksheet[cellAddress];
          rowData.push(cell ? XLSX.utils.format_cell(cell) : '');
        }
        rows.push(rowData.join('\t'));
      }
      
      allSheetData.push(...rows);
    }
    
    allSheetData.push('\n');
  });
  
  return { content: allSheetData.join('\n') };
};

const parseCsvFile = async (file: File): Promise<ParsedFile> => {
  const text = await file.text();
  return { content: text };
};

const parseJsonFile = async (file: File): Promise<ParsedFile> => {
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    
    // Try to prettify the JSON for easier reading
    return { content: JSON.stringify(json, null, 2) };
  } catch (e) {
    // If parsing fails, return the raw text
    const text = await file.text();
    return { content: text };
  }
};
