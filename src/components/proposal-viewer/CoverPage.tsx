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
      
      {/* Top black bar */}
      <div className="absolute top-0 left-0 right-0 h-[100px] bg-black z-30 p-8">       
      </div>
      
      {/* Left vertical accent stripe */}
      <div className="absolute top-[100px] left-0 bottom-0 w-20 bg-[#005ED6] z-20" />
      
      {/* Main content area */}
      <div className="absolute top-[100px] left-20 right-0 bottom-0 bg-white z-10">
        {/* Hero section with diagonal clip */}
        <div className="relative h-[60vh] w-full overflow-hidden">
          {/* Background with white peek-through offset */}
          <div className="absolute inset-0 bg-white transform translate-x-2 translate-y-2" />
          
          {/* Background image with clip path and blue overlay */}
          <div className="absolute inset-0 transform translate-x-4 translate-y-2">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${coverImageUrl || "/placeholder.svg"})`,
                clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0% 40%)'
              }}
            >
              {/* Blue tint overlay */}
              <div className="absolute inset-0 bg-[rgba(0,94,214,0.1)]" />
            </div>
            
            {/* White border along diagonal edge */}
            <div 
              className="absolute bg-white h-8 w-[120%]" 
              style={{ 
                transform: 'rotate(-18.5deg) translateY(-50%)',
                top: '40%',
                left: '-10%'
              }}
            />
          </div>
          
          {/* Title block */}
          <div className="absolute bg-black py-6 px-12 w-[90%] z-10" style={{ top: '40%', left: '5%' }}>
            <h1 className="font-['Playfair_Display'] text-6xl font-bold text-white uppercase">
              Project Estimate
            </h1>
            <div className="font-['Inter'] text-base text-white space-y-2">
          <p>Client Name: {metadata.clientName || "Client Name"}</p>
          <p>Client Phone: {metadata.clientPhone || "Phone Number"}</p>
          <p>Client Email: {metadata.clientEmail || "Email Address"}</p>
          <p>Project Address: {metadata.clientAddress || "Project Address"}</p>
        </div>
          </div>
        </div>
        
        {/* Services info card */}
        <div className="mx-12 -mt-12 bg-gray-100 shadow-lg rounded-lg p-8 relative z-20">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-['Inter']">Date: {today}</p>
              <p className="text-sm text-gray-600 font-['Inter']">Prepared By: {metadata.preparedBy || companyProfile?.owner_name || "PainterGrowth"}</p>
              <p className="text-sm text-gray-600 font-['Inter']">Business Address: {companyProfile?.location || "Business Address"}</p>
              <p className="text-xs text-gray-500 font-['Inter'] tracking-wider">Proposal #: {docNumber}</p>
            </div>
            <img
              src={logoUrl}
              alt={companyProfile?.business_name || "Company Logo"}
              className="h-10 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
          </div>
          
          <ol className="list-decimal list-inside space-y-2 text-gray-800 font-['Inter']">
            {companyServices.map((service, index) => (
              <li key={index}>{service}</li>
            ))}
          </ol>
          
          <div className="mt-6 flex justify-between items-center">
            
            <div>
              <p className="font-['Playfair_Display'] text-xl text-right">
                {companyProfile?.business_name || "Company Name"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Diagonal footer accent */}
      <div className="absolute left-0 right-0 bottom-0 h-16 z-30">
        <div className="absolute right-0 bottom-0 bg-[#005ED6] w-20 h-32 transform rotate-12 translate-x-8 translate-y-8" />
        
        <div className="absolute inset-0 bg-black py-4 flex justify-center items-center">
          <div className="flex items-center space-x-8">
            {companyProfile?.email && (
              <a href={`mailto:${companyProfile.email}`} className="flex items-center text-white no-underline group">
                <Mail className="h-5 w-5 mr-2 text-white" />
                <span className="font-['Inter'] text-sm">{companyProfile.email}</span>
              </a>
            )}
            
            {companyProfile?.phone && (
              <a href={`tel:${companyProfile.phone}`} className="flex items-center text-white no-underline group">
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
