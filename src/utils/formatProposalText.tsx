
import React from 'react';
import { isValidTable, parseTableRows } from './tableUtils';

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
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
              <td key={j} className="p-2 border-b border-gray-200">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function formatProposalText(text: string | null): React.ReactNode {
  if (!text) return null

  const paragraphs = text.split(/\n{2,}/)

  return (
    <>
      {paragraphs.map((paragraph, index) => {
        // Handle markdown-style tables
        if (paragraph.trim().startsWith('|')) {
          return <TableRenderer key={index} raw={paragraph} />;
        }

        // Headers
        const headerMatch = paragraph.match(/^(#{1,3})\s+(.+)$/)
        if (headerMatch) {
          const level = headerMatch[1].length
          const content = formatInline(headerMatch[2])
          const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements
          return (
            <HeaderTag key={index} className={`mt-${4 + (3 - level)} mb-2 font-bold text-${level === 1 ? '2xl' : level === 2 ? 'xl' : 'lg'}`}>
              {content}
            </HeaderTag>
          )
        }

        // Paragraph with single line breaks handled
        const lines = paragraph.split('\n')
        return (
          <p key={index} className="mb-4">
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                {formatInline(line)}
                {i < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        )
      })}
    </>
  )
}
