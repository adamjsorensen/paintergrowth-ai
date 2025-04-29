
import React from 'react';
import { isValidTable, parseTableRows } from './tableUtils';

// Regex to match inline bold formatting
const boldRegex = /(\*\*.*?\*\*)/g;

// More flexible header regex to match headers anywhere in the text
const headerRegex = /(^|\n)(#{1,3})\s+(.+)($|\n)/g;

function formatInline(text: string): React.ReactNode {
  const parts = text.split(boldRegex);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

// Function to extract and handle headers within content
function processContentWithHeaders(content: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  
  // Process all headers, including those in the middle of paragraphs
  let lastIndex = 0;
  const matches: { index: number; level: number; content: string; length: number }[] = [];
  
  // Find all headers
  let match;
  while ((match = headerRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const isNewline = match[1] === '\n';
    const level = match[2].length;
    const headerContent = match[3];
    
    matches.push({
      index: match.index + (isNewline ? 1 : 0), // Adjust index if header starts with newline
      level: level,
      content: headerContent,
      length: fullMatch.length - (isNewline ? 1 : 0) // Adjust length if needed
    });
  }
  
  // Process content with headers
  matches.forEach((headerMatch, idx) => {
    // Add text before this header
    if (headerMatch.index > lastIndex) {
      const textBeforeHeader = content.substring(lastIndex, headerMatch.index);
      if (textBeforeHeader.trim()) {
        result.push(
          <p key={`text-${idx}`} className="mb-4">
            {formatInline(textBeforeHeader.trim())}
          </p>
        );
      }
    }
    
    // Add the header
    const HeaderTag = `h${headerMatch.level}` as keyof JSX.IntrinsicElements;
    result.push(
      <HeaderTag 
        key={`header-${idx}`} 
        className={`mt-${4 + (3 - headerMatch.level)} mb-2 font-bold text-${headerMatch.level === 1 ? '2xl' : headerMatch.level === 2 ? 'xl' : 'lg'}`}
      >
        {formatInline(headerMatch.content)}
      </HeaderTag>
    );
    
    lastIndex = headerMatch.index + headerMatch.length;
  });
  
  // Add remaining text after the last header
  if (lastIndex < content.length) {
    const remainingText = content.substring(lastIndex);
    if (remainingText.trim()) {
      result.push(
        <p key="remaining" className="mb-4">
          {formatInline(remainingText.trim())}
        </p>
      );
    }
  }
  
  return result;
}

function TableRenderer({ raw }: { raw: string }) {
  const rows = raw.trim().split('\n');
  
  if (!isValidTable(rows)) {
    console.warn('Invalid table format:', raw);
    return <p className="text-red-500">Invalid table format</p>;
  }

  const { headers, data } = parseTableRows(rows);

  return (
    <table className="w-full my-4 border border-gray-300 text-sm">
      <thead>
        <tr className="bg-gray-100">
          {headers.map((h, i) => (
            <th key={i} className="text-left p-2 border-b border-gray-300 font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {row.map((cell, j) => (
              <td key={j} className="p-2 border-b border-gray-200">{formatInline(cell)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function formatProposalText(text: string | null): React.ReactNode {
  if (!text) return null;

  // Split content into blocks (paragraphs, tables, etc.)
  const blocks = text.split(/\n{2,}/);
  
  return (
    <>
      {blocks.map((block, index) => {
        const trimmedBlock = block.trim();
        
        // Handle markdown-style tables
        if (trimmedBlock.startsWith('|')) {
          return <TableRenderer key={index} raw={trimmedBlock} />;
        }
        
        // Check if this block contains headers
        if (headerRegex.test(block)) {
          // Reset the regex lastIndex to ensure we can reuse it
          headerRegex.lastIndex = 0;
          return (
            <React.Fragment key={index}>
              {processContentWithHeaders(block)}
            </React.Fragment>
          );
        }

        // Handle regular paragraphs with line breaks
        const lines = block.split('\n');
        return (
          <p key={index} className="mb-4">
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                {formatInline(line)}
                {i < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}
