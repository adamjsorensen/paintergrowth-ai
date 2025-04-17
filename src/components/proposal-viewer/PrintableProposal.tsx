import React, { useEffect, useState } from 'react';
import { formatProposalText } from '@/utils/formatProposalText';
import { Check, Printer, Paintbrush, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PrintableProposalProps {
  proposal: string;
  metadata: {
    clientName?: string;
    jobType?: string;
    status?: string;
  };
  companyProfile?: {
    companyName?: string;
    companyAddress?: string;
    companyServices?: string;
    warranty?: string;
    logo_url?: string;
  };
}

const PrintableProposal: React.FC<PrintableProposalProps> = ({
  proposal,
  metadata,
  companyProfile,
}) => {
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // If opened in a new window, trigger print automatically
    if (window.opener) {
      window.print();
    }
  }, []);

  useEffect(() => {
    const fetchCoverImage = async () => {
      const { data } = await supabase
        .from('proposal_pdf_settings')
        .select('cover_image_url')
        .single();
      
      setCoverImageUrl(data?.cover_image_url || null);
    };

    fetchCoverImage();
  }, []);

  // Default logo if none provided
  const defaultLogo = "/placeholder.svg";
  const logoUrl = companyProfile?.logo_url || defaultLogo;
  
  // Format the current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });
  
  // Parse company services
  const companyServices = companyProfile?.companyServices?.split(',').map(service => 
    service.trim()
  ).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Print Instructions - Hidden in Print */}
      <div className="p-4 mb-6 bg-blue-50 rounded-lg print:hidden">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Print Instructions
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          To save as PDF:
          <br />
          • Desktop: Select "Save as PDF" in the print dialog
          <br />
          • iOS: Tap the share icon and select "Print" or "Save as PDF"
          <br />
          • Android: Select "Save as PDF" in the print options
        </p>
      </div>

      {/* Proposal Content - Optimized for Print */}
      <div className="max-w-[750px] mx-auto px-8 print:max-w-none print:px-0 print:w-full">
        {/* Cover Logo - Top Left */}
        <div className="mb-4">
          <img
            src={logoUrl}
            alt={companyProfile?.companyName || "Company Logo"}
            className="max-h-[100px] w-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultLogo;
            }}
          />
        </div>
        
        {/* Cover Image (if available) */}
        {coverImageUrl && (
          <div className="w-full mx-6 print:mx-0 mb-8 overflow-hidden">
            <img
              src={coverImageUrl}
              alt="Proposal Cover"
              className="w-full h-[300px] object-cover rounded-md print:rounded-none border border-gray-200"
            />
          </div>
        )}

        {/* Cover Summary Section - Updated for print */}
        <div className="cover-summary grid grid-cols-1 sm:grid-cols-12 print:grid-cols-12 gap-6 relative mb-12 print:break-after-page">
          {/* Left Column */}
          <div className="sm:col-span-8 print:col-span-8">
            <h1 className="font-serif text-cover-h1 font-bold mb-2">PROJECT ESTIMATE</h1>
            <p className="text-cover-smallcaps text-gray-600 mb-6">DATE: {currentDate}</p>
            
            <h3 className="font-medium mb-3">We can help you with</h3>
            <ul className="mb-6 space-y-1">
              {companyServices.length > 0 ? (
                companyServices.map((service, index) => (
                  <li key={index} className="flex items-start">
                    <Paintbrush className="h-4 w-4 mr-2 mt-1 text-brand paint-icon flex-shrink-0" />
                    <span>{service}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-1 text-brand paint-icon flex-shrink-0" />
                    <span>Residential & Commercial Painting</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-1 text-brand paint-icon flex-shrink-0" />
                    <span>Interior & Exterior Painting</span>
                  </li>
                </>
              )}
            </ul>
            
            {/* Branded underline */}
            <div className="w-24 h-0.5 bg-brand mb-6"></div>
            
            {/* Contact info */}
            <div className="flex flex-wrap items-center text-sm gap-x-3 gap-y-2">
              {companyProfile?.companyName && (
                <a href={`mailto:info@${companyProfile.companyName.toLowerCase().replace(/\s+/g, '')}.com`} className="flex items-center">
                  <Mail className="h-4 w-4 mr-1 text-brand" />
                  <span>{`info@${companyProfile.companyName.toLowerCase().replace(/\s+/g, '')}.com`}</span>
                </a>
              )}
              <span className="text-gray-300 hidden sm:inline">|</span>
              <a href="tel:+15551234567" className="flex items-center">
                <Phone className="h-4 w-4 mr-1 text-brand" />
                <span>+1 555-123-4567</span>
              </a>
            </div>
          </div>
          
          {/* Vertical Rule (updated for all screen sizes) */}
          <div className="hidden sm:block print:block w-px bg-brand absolute inset-y-0 left-2/3"></div>
          
          {/* Right Column */}
          <div className="sm:col-span-4 print:col-span-4 relative z-10">
            {metadata.clientName ? (
              <>
                <h2 className="text-lg font-bold mb-1">{metadata.clientName}</h2>
                {metadata.jobType && (
                  <p className="text-gray-600 mb-4">{metadata.jobType}</p>
                )}
              </>
            ) : (
              <div className="border border-dashed border-gray-300 p-4 rounded-md">
                <p className="text-gray-400 italic">Client information not available</p>
              </div>
            )}
          </div>
          
          {/* Diagonal accent in bottom-right corner */}
          <div className="absolute bottom-0 right-0 w-[32%] h-[32%] bg-brand/90 print:bg-brand/70 clip-path-[polygon(70%_0,100%_0,100%_100%)] z-0"></div>
        </div>

        {/* Main Content */}
        <div className="prose max-w-none print:prose-sm leading-relaxed">
          {formatProposalText(proposal)}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-600 print:mt-8">
          <p>Generated by {companyProfile?.companyName || "Company"}</p>
          <p className="mt-1">© {new Date().getFullYear()} All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default PrintableProposal;
