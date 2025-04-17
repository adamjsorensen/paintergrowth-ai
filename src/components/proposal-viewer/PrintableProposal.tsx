
import React, { useEffect, useState } from 'react';
import { formatProposalText } from '@/utils/formatProposalText';
import { Check, Printer, Paintbrush, PaintBrush, Mail, Phone, PaintRoller } from 'lucide-react';
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
    email?: string;
    phone?: string;
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
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });
  
  // Generate document number placeholder
  const docNumber = `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Parse company services
  const companyServices = companyProfile?.companyServices?.split(',').map(service => 
    service.trim()
  ).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Google Fonts for PDF - Will be properly loaded in print */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600&display=swap');
        `
      }} />

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

      {/* PDF Content - Optimized for Print */}
      <div className="max-w-[750px] mx-auto px-8 print:max-w-none print:px-0 print:w-full">
        
        {/* Cover Page - New Design */}
        <div className="cover-page print:break-after-page">
          {/* Top Brand Bar */}
          <div className="w-full h-8 bg-[#0061ff] relative">
            <div className="container mx-auto px-12 h-full flex items-center">
              <img
                src={logoUrl}
                alt={companyProfile?.companyName || "Company Logo"}
                className="h-6 w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = defaultLogo;
                }}
              />
            </div>
          </div>
          
          {/* Hero Image with Overlay */}
          <div className="relative w-full h-[70vh] overflow-hidden">
            {/* Background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : 'url(/placeholder.svg)',
              }}
            />
            
            {/* Blue overlay */}
            <div className="absolute inset-0 bg-[#0061ff]/40"></div>
            
            {/* Title & Client block */}
            <div className="absolute bottom-0 left-0 p-8 text-white container mx-auto px-12">
              <h1 className="font-['Playfair_Display'] text-5xl font-bold mb-2">PROJECT ESTIMATE</h1>
              <p className="font-['Playfair_Display'] text-base">
                Prepared for:
                <span className="ml-2 font-semibold">
                  {metadata.clientName || "Client Name"}
                </span>
              </p>
            </div>
          </div>
          
          {/* Date + Doc ID row */}
          <div className="container mx-auto px-12 py-4 grid grid-cols-12 items-center">
            <div className="col-span-6 text-xs font-['Inter'] uppercase tracking-wider">
              DATE: {today}
            </div>
            <div className="col-span-6 text-right text-xs font-['Inter'] text-gray-500">
              {docNumber}
            </div>
          </div>
          
          {/* Info Card */}
          <div className="container mx-auto px-12 py-6">
            <div className="bg-[#f3f4f6] rounded-md shadow-md p-6 max-w-[70%]">
              <h3 className="font-medium mb-4 font-['Inter']">Our Professional Services</h3>
              <ul className="space-y-3">
                {companyServices.length > 0 ? (
                  companyServices.map((service, index) => (
                    <li key={index} className="flex items-start">
                      {index % 2 === 0 ? (
                        <PaintRoller className="h-4 w-4 mr-2 mt-1 text-[#0061ff] flex-shrink-0" />
                      ) : (
                        <Paintbrush className="h-4 w-4 mr-2 mt-1 text-[#0061ff] flex-shrink-0" />
                      )}
                      <span className="font-['Inter']">{service}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start">
                      <PaintRoller className="h-4 w-4 mr-2 mt-1 text-[#0061ff] flex-shrink-0" />
                      <span className="font-['Inter']">Residential & Commercial Painting</span>
                    </li>
                    <li className="flex items-start">
                      <Paintbrush className="h-4 w-4 mr-2 mt-1 text-[#0061ff] flex-shrink-0" />
                      <span className="font-['Inter']">Interior & Exterior Painting</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
          
          {/* Watermark */}
          <div className="absolute bottom-0 right-0 w-1/4 h-1/4 opacity-5 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
              <path d="M18 3v4c0 2-2 4-4 4H6c-2 0-4-2-4-4V3" />
              <path d="M10 11v4c0 2-2 4-4 4H2" />
              <path d="M22 19h-4c-2 0-4-2-4-4v-4" />
            </svg>
          </div>
          
          {/* Footer Bar */}
          <div className="w-full bg-[#0061ff] py-4 mt-auto">
            <div className="container mx-auto px-12 grid grid-cols-12">
              <div className="col-span-12 flex justify-end items-center text-white space-x-6">
                {companyProfile?.email && (
                  <a href={`mailto:${companyProfile.email}`} className="flex items-center text-white no-underline">
                    <Mail className="h-5 w-5 mr-2" />
                    <span className="font-['Inter'] font-semibold text-lg">{companyProfile.email}</span>
                  </a>
                )}
                
                {companyProfile?.phone && (
                  <a href={`tel:${companyProfile.phone}`} className="flex items-center text-white no-underline">
                    <Phone className="h-5 w-5 mr-2" />
                    <span className="font-['Inter'] font-semibold text-lg">{companyProfile.phone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="prose max-w-none print:prose-sm leading-relaxed mt-8">
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
