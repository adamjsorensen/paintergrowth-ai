import React, { useEffect, useState } from 'react';
import { formatProposalText } from '@/utils/formatProposalText';
import { Printer, Paintbrush, Mail, Phone, PaintRoller } from 'lucide-react';
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

  const defaultLogo = "/placeholder.svg";
  const logoUrl = companyProfile?.logo_url || defaultLogo;
  
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });
  
  const docNumber = `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const companyServices = companyProfile?.companyServices?.split(',').map(service => 
    service.trim()
  ).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-white font-sans">
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@400;600;700&display=swap');
        `
      }} />

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

      <div className="max-w-[750px] mx-auto px-8 print:max-w-none print:px-0 print:w-full">
        
        <div className="cover-page relative min-h-screen overflow-hidden print:break-after-page bg-white">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[#0061ff]" />
            <div 
              className="absolute inset-0 bg-white" 
              style={{ 
                clipPath: 'polygon(70% 0, 100% 0, 100% 100%, 40% 100%)'
              }}
            />
          </div>
          
          <div className="relative h-full container mx-auto px-12 py-16 flex flex-col">
            <div className="mb-12">
              <img
                src={companyProfile?.logo_url || "/placeholder.svg"}
                alt={companyProfile?.companyName || "Company Logo"}
                className="h-12 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>

            <div className="grid grid-cols-12 gap-8 flex-grow">
              <div className="col-span-6 flex flex-col justify-between">
                <div>
                  <h1 className="font-['Playfair_Display'] text-7xl font-bold text-[#0061ff] mb-8">
                    PROJECT<br />ESTIMATE
                  </h1>
                  
                  <div className="mt-12 space-y-6">
                    <p className="text-gray-600 font-['Inter'] text-lg">
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: '2-digit'
                      })}
                    </p>
                    <p className="text-gray-500 font-['Inter'] text-sm tracking-wider">
                      DOC-{Math.floor(1000 + Math.random() * 9000)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {companyProfile?.email && (
                    <a href={`mailto:${companyProfile.email}`} className="flex items-center text-gray-700 hover:text-[#0061ff] transition-colors no-underline group">
                      <Mail className="h-5 w-5 mr-3 text-[#0061ff]" />
                      <span className="font-['Inter'] font-semibold">{companyProfile.email}</span>
                    </a>
                  )}
                  
                  {companyProfile?.phone && (
                    <a href={`tel:${companyProfile.phone}`} className="flex items-center text-gray-700 hover:text-[#0061ff] transition-colors no-underline group">
                      <Phone className="h-5 w-5 mr-3 text-[#0061ff]" />
                      <span className="font-['Inter'] font-semibold">{companyProfile.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="col-span-5 col-start-8 flex flex-col justify-between text-white">
                <div>
                  <div className="flex items-center mb-8">
                    <div className="w-0.5 h-16 bg-white/60 mr-6" />
                    <div>
                      <p className="font-['Inter'] text-sm font-semibold tracking-widest uppercase mb-2">
                        Prepared For
                      </p>
                      <h2 className="font-['Playfair_Display'] text-3xl">
                        {metadata.clientName || "Client Name"}
                      </h2>
                    </div>
                  </div>

                  <div className="mt-12">
                    <h3 className="font-['Inter'] text-sm font-semibold tracking-widest uppercase mb-6">
                      Our Services
                    </h3>
                    <ul className="space-y-4">
                      {(companyProfile?.companyServices?.split(',') || [
                        'Residential & Commercial Painting',
                        'Interior & Exterior Painting'
                      ]).map((service, index) => (
                        <li key={index} className="flex items-start">
                          {index % 2 === 0 ? (
                            <PaintRoller className="h-4 w-4 mr-3 mt-1 text-white/80 flex-shrink-0" />
                          ) : (
                            <Paintbrush className="h-4 w-4 mr-3 mt-1 text-white/80 flex-shrink-0" />
                          )}
                          <span className="font-['Inter'] text-white/90">{service.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="font-['Inter'] text-sm text-white/60 mr-3">By</span>
                  <span className="font-['Playfair_Display'] text-xl">
                    {companyProfile?.companyName || "Company Name"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="prose max-w-none print:prose-sm leading-relaxed mt-8">
          {formatProposalText(proposal)}
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-sm text-gray-600 print:mt-8">
          <p>Generated by {companyProfile?.companyName || "Company"}</p>
          <p className="mt-1">© {new Date().getFullYear()} All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default PrintableProposal;
