
import React from 'react';
import { Mail, Phone } from 'lucide-react';

interface CoverPageProps {
  metadata: {
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    clientAddress?: string;
    preparedBy?: string;
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
  coverImageUrl?: string | null;
}

const CoverPage: React.FC<CoverPageProps> = ({
  metadata,
  companyProfile,
  coverImageUrl,
}) => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  });
  
  const docNumber = `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const companyServices = companyProfile?.services_offered?.split(',').map(service => 
    service.trim()
  ).filter(Boolean) || [
    'Residential & Commercial Painting',
    'Interior & Exterior Painting',
    'Cabinet Refinishing',
    'Color Consultation'
  ];

  const defaultLogo = "/placeholder.svg";
  const logoUrl = companyProfile?.logo_url || defaultLogo;

  return (
    <div className="cover-page relative min-h-screen overflow-hidden print:break-after-page">
      {/* Style imports */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500&display=swap');
        `
      }} />
      
      {/* Left vertical accent stripe */}
      <div className="absolute top-0 left-0 bottom-0 w-20 bg-[#005ED6] z-20" />
      
      {/* Main content area */}
      <div className="absolute top-0 left-20 right-0 bottom-0 bg-white z-10">
        {/* Hero section with diagonal clip */}
        <div className="relative h-[60vh] w-full">
          {/* Client info panel (left side) */}
          <div className="absolute left-12 top-10 z-30">
            <div className="space-y-2 font-['Inter']">
              <p className="text-base">
                <span className="font-semibold">Client Name: </span>
                <span>{metadata.clientName || "Client Name"}</span>
              </p>
              <p className="text-base">
                <span className="font-semibold">Client Phone: </span>
                <span>{metadata.clientPhone || "Phone Number"}</span>
              </p>
              <p className="text-base">
                <span className="font-semibold">Client Email: </span>
                <span>{metadata.clientEmail || "Email Address"}</span>
              </p>
              <p className="text-base">
                <span className="font-semibold">Project Address: </span>
                <span>{metadata.clientAddress || "Project Address"}</span>
              </p>
            </div>
          </div>
          
          {/* Diagonal hero image with clip path */}
          <div className="absolute right-0 top-0 h-full w-[65%]">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${coverImageUrl || "/placeholder.svg"})`,
                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)'
              }}
            >
              {/* Blue tint overlay */}
              <div className="absolute inset-0 bg-[rgba(0,94,214,0.1)]" />
            </div>
          </div>
          
          {/* Title block */}
          <div className="absolute top-0 left-0 bg-black py-4 px-6 z-30">
            <h1 className="font-['Playfair_Display'] text-6xl font-bold text-white uppercase">
              PROJECT ESTIMATE
            </h1>
          </div>
        </div>
        
        {/* Split info card */}
        <div className="mx-12 -mt-12 shadow-md rounded-lg relative z-20 overflow-hidden">
          {/* Top half - light gray */}
          <div className="bg-gray-100 p-6 flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-['Inter'] font-medium text-gray-800">Date: {today}</p>
              <p className="text-sm font-['Inter'] font-medium text-gray-800">
                Prepared By: {metadata.preparedBy || companyProfile?.owner_name || "PainterGrowth"}
              </p>
              <p className="text-sm font-['Inter'] font-medium text-gray-800">
                Business Address: {companyProfile?.location || "Business Address"}
              </p>
              <p className="text-sm font-['Inter'] font-medium text-gray-800">
                Proposal #: {docNumber}
              </p>
            </div>
            
            {/* Logo in top-right of card */}
            <div className="text-right">
              <img
                src={logoUrl}
                alt={companyProfile?.business_name || "Company Logo"}
                className="h-10 w-auto mb-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
              <p className="font-['Inter'] text-base font-medium text-gray-800">
                {companyProfile?.business_name || "Company Name"}
              </p>
            </div>
          </div>
          
          {/* Bottom half - white */}
          <div className="bg-white p-6 border-t border-gray-200">
            <ol className="list-decimal list-inside space-y-2 text-gray-800 font-['Inter']">
              {companyServices.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      
      {/* Footer bar */}
      <div className="absolute left-0 right-0 bottom-0 h-16 z-30">
        <div className="absolute inset-0 bg-black py-4 flex justify-center items-center">
          <div className="flex items-center">
            {companyProfile?.email && (
              <a href={`mailto:${companyProfile.email}`} className="flex items-center text-white no-underline group mx-6">
                <Mail className="h-5 w-5 mr-2 text-white" />
                <span className="font-['Inter'] text-sm">{companyProfile.email}</span>
              </a>
            )}
            
            {companyProfile?.phone && (
              <a href={`tel:${companyProfile.phone}`} className="flex items-center text-white no-underline group mx-6">
                <Phone className="h-5 w-5 mr-2 text-white" />
                <span className="font-['Inter'] text-sm">{companyProfile.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverPage;
