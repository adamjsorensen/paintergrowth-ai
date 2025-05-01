
import React, { useEffect, useState } from 'react';
import { formatProposalText } from '@/utils/formatProposalText';
import { Printer, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CoverPage from './CoverPage';

// --- Helper Functions ---
const sanitizeFilename = (name: string): string => {
  // Remove invalid characters (/\<>:"|?*) and replace multiple spaces/newlines with single space
  const cleaned = name
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid chars with underscore
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
  // Limit length to avoid issues (e.g., 200 chars)
  return cleaned.substring(0, 200);
};

const generateFilename = (metadata: PrintableProposalProps['metadata']): string => {
  const clientName = metadata.clientName || 'Client';
  const clientAddress = metadata.clientAddress || 'Address';
  // Format date as YYYY-MM-DD using 'en-CA' locale which is reliable for this format
  const date = new Date().toLocaleDateString('en-CA');

  const baseName = `${clientName} - ${clientAddress} - ${date}`;
  // No need to add .pdf here, the browser's "Save as PDF" usually handles it.
  return sanitizeFilename(baseName);
};


// Add print-specific styles
const printStyles = `
  @page {
    margin: 0.75in;
    size: 8.5in 11in;
  }
  /* Ensure cover page takes a full page */
  .print\\:page-break-after {
    page-break-after: always;
  }
  /* Improve prose readability in print */
  .print\\:prose-sm {
    font-size: 10pt; /* Adjust as needed */
    line-height: 1.5;
  }
  /* Hide print instructions */
  .print\\:hidden {
    display: none;
  }
  /* Ensure full width in print */
  .print\\:max-w-none { max-width: none; }
  .print\\:w-full { width: 100%; }
  .print\\:mx-0 { margin-left: 0; margin-right: 0; }
  .print\\:mt-4 { margin-top: 1rem; } /* Adjust top margin after cover page */
  .print\\:mt-8 { margin-top: 2rem; } /* Adjust footer margin */
`;

interface PrintableProposalProps {
  proposal: string;
  metadata: {
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    clientAddress?: string;
    preparedBy?: string;
    preparedByTitle?: string;
    jobType?: string;
    status?: string;
  };
  companyProfile?: {
    business_name?: string;
    location?: string;
    services_offered?: string;
    logo_url?: string;
    email?: string;
    phone?: string;
    owner_name?: string;
  };
}

const PrintableProposal: React.FC<PrintableProposalProps> = ({
  proposal,
  metadata,
  companyProfile,
}) => {
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [printCountdown, setPrintCountdown] = useState<number | null>(null);

  // Effect for fetching cover image
  useEffect(() => {
    const fetchCoverImage = async () => {
      // Ensure Supabase client is initialized before using
      if (!supabase) {
        console.error("Supabase client not initialized.");
        return;
      }
      try {
        const { data, error } = await supabase
          .from('proposal_pdf_settings')
          .select('cover_image_url')
          .maybeSingle(); // Use maybeSingle to handle 0 or 1 row gracefully

        if (error) {
          console.error("Error fetching cover image:", error.message);
        } else {
          setCoverImageUrl(data?.cover_image_url || null);
        }
      } catch (err) {
        console.error("Unexpected error fetching cover image:", err);
      }
    };

    fetchCoverImage();
  }, []); // Empty dependency array ensures this runs once on mount

  // Effect for printing and setting title
  useEffect(() => {
    const originalTitle = document.title; // Store original title

    // Generate and set the new title for the print dialog filename
    const filename = generateFilename(metadata);
    document.title = filename;

    // Function to restore title
    const restoreTitle = () => {
      document.title = originalTitle;
    };

    // Add listener for after printing (or cancelling)
    window.addEventListener('afterprint', restoreTitle);

    // Trigger print dialog only if opened via window.opener
    // Use a 5 second timeout to ensure title is set before print dialog opens
    let printTimeoutId: NodeJS.Timeout | null = null;
    if (window.opener) {
      // Start countdown
      setPrintCountdown(5);
      
      // Update countdown every second
      const countdownInterval = setInterval(() => {
        setPrintCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Trigger print after 5 seconds
      printTimeoutId = setTimeout(() => {
        window.print();
      }, 5000); // 5 second delay
    }

    // Cleanup function: restore title and remove listener
    return () => {
      if (printTimeoutId) {
        clearTimeout(printTimeoutId);
      }
      restoreTitle(); // Restore title if component unmounts before afterprint
      window.removeEventListener('afterprint', restoreTitle);
    };
    // Depend on metadata object reference. If metadata content changes causing a re-render
    // with a new object reference, this effect will re-run.
  }, [metadata]);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Inject print styles */}
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* Print countdown notification */}
      {printCountdown !== null && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white py-2 px-4 rounded-md shadow-lg flex items-center gap-2 z-50 print:hidden">
          <Clock className="h-5 w-5" />
          <span>Print dialog will open in {printCountdown} seconds...</span>
        </div>
      )}

      <div className="p-4 mb-6 bg-blue-50 rounded-lg print:hidden">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Print Instructions
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          To save as PDF:
          <br />
          • Desktop: Select "Save as PDF" in the print dialog's destination. The filename will be pre-filled.
          <br />
          • Mobile: Use the Share menu, then select "Print". Choose "Save as PDF" if available, or print to a PDF printer app.
        </p>
      </div>

      {/* Use print utility classes for layout */}
      <div className="max-w-[750px] mx-auto px-4 sm:px-8 print:max-w-none print:w-full print:mx-0 print:px-0">

        {/* Cover Page */}
        {/* Ensure CoverPage itself doesn't add excessive margins conflicting with @page */}
        <div className="print:page-break-after">
          <CoverPage 
            metadata={metadata}
            companyProfile={companyProfile}
            coverImageUrl={coverImageUrl}
          />
        </div>

        {/* Proposal Content */}
        {/* Apply print-specific prose styles */}
        <div className="prose max-w-none print:prose-sm leading-relaxed mt-8 print:mt-4">
          {formatProposalText(proposal)}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-600 print:mt-8">
          <p>Generated by {companyProfile?.business_name || "Company"}</p>
          <p className="mt-1">© {new Date().getFullYear()} All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default PrintableProposal;
