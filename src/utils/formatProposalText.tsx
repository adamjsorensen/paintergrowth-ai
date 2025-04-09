
import React from 'react';

/**
 * Formats plain text with basic markdown-like formatting:
 * - Paragraphs (separated by blank lines)
 * - Headers (lines starting with #)
 * - Bold text (**bold**)
 */
export function formatProposalText(text: string | null): React.ReactNode {
  if (!text) return null;
  
  // Split text into paragraphs (separated by one or more blank lines)
  const paragraphs = text.split(/\n{2,}/);
  
  return (
    <>
      {paragraphs.map((paragraph, index) => {
        // Check if the paragraph is a header (starts with # or ##)
        const headerMatch = paragraph.match(/^(#{1,3})\s+(.+)$/);
        
        if (headerMatch) {
          const level = headerMatch[1].length;
          const content = headerMatch[2];
          
          // Format bold text within headers
          const formattedContent = formatBoldText(content);
          
          switch (level) {
            case 1:
              return <h1 key={index} className="text-2xl font-bold mt-6 mb-2">{formattedContent}</h1>;
            case 2:
              return <h2 key={index} className="text-xl font-bold mt-5 mb-2">{formattedContent}</h2>;
            case 3:
              return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{formattedContent}</h3>;
            default:
              return <h4 key={index} className="text-md font-bold mt-3 mb-2">{formattedContent}</h4>;
          }
        }
        
        // Regular paragraph
        // Format bold text within paragraph
        const formattedContent = formatBoldText(paragraph);
        
        return (
          <p key={index} className="mb-4">
            {formattedContent}
          </p>
        );
      })}
    </>
  );
}

// Helper function to format bold text
function formatBoldText(text: string): React.ReactNode {
  if (!text.includes('**')) return text;
  
  // Find text between ** pairs and make it bold
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, i) => {
    // Check if this part is wrapped in **
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.substring(2, part.length - 2);
      return <strong key={i}>{boldText}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
