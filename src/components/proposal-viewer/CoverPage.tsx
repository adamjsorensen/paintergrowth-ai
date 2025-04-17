
import React from 'react';
import { Paintbrush, Mail, Phone, PaintRoller } from 'lucide-react';

interface CoverPageProps {
  metadata: {
    clientName?: string;
  };
  companyProfile?: {
    companyName?: string;
    companyAddress?: string;
    companyServices?: string;
    logo_url?: string;
    email?: string;
    phone?: string;
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
  
  const companyServices = companyProfile?.companyServices?.split(',').map(service => 
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
      
      {/* Top black bar with logo */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-black flex items-center px-12 z-30">
        <img
          src={logoUrl}
          alt={companyProfile?.companyName || "Company Logo"}
          className="h-10 w-auto"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
      </div>
      
      {/* Left vertical accent stripe with rotated text */}
      <div className="absolute top-16 left-0 bottom-0 w-20 bg-[#005ED6] z-20 flex items-center justify-center">
        <div className="transform -rotate-90 whitespace-nowrap">
          <span className="font-['Inter'] text-sm tracking-widest uppercase text-white font-medium">
            Prepared For
          </span>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="absolute top-16 left-20 right-0 bottom-0 bg-white z-10">
        {/* Hero section with diagonal clip */}
        <div className="relative h-[60vh] w-full overflow-hidden">
          {/* Background with white peek-through offset */}
          <div className="absolute inset-0 bg-white transform translate-x-2 translate-y-2"></div>
          
          {/* Background image with clip path and blue overlay */}
          <div className="absolute inset-0 transform translate-x-4 translate-y-4">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${coverImageUrl || "/placeholder.svg"})`,
                clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0% 30%)'
              }}
            >
              {/* Blue tint overlay */}
              <div className="absolute inset-0 bg-[rgba(0,94,214,0.1)]"></div>
            </div>
            
            {/* White border along diagonal edge */}
            <div 
              className="absolute bg-white h-8 w-[120%]" 
              style={{ 
                transform: 'rotate(-18.5deg) translateY(-50%)',
                top: '30%',
                left: '-10%'
              }}
            ></div>
          </div>
          
          {/* Angled title block */}
          <div 
            className="absolute bg-black py-6 px-12 w-[90%] z-10"
            style={{ 
              transform: 'rotate(-2deg)',
              top: '40%',
              left: '5%'
            }}
          >
            <h1 className="font-['Playfair_Display'] text-6xl font-bold text-white uppercase">
              Project Estimate
            </h1>
            <p className="font-['Inter'] text-base italic text-white mt-2">
              Prepared for: {metadata.clientName || "Client Name"}
            </p>
          </div>
        </div>
        
        {/* Services info card */}
        <div 
          className="mx-12 -mt-12 bg-gray-100 shadow-lg rounded-lg p-8 transform -rotate-1 relative z-20"
        >
          <h3 className="font-['Inter'] text-xl font-medium text-gray-800 mb-4">Our Services</h3>
          <div className="grid grid-cols-2 gap-4">
            {companyServices.map((service, index) => (
              <div key={index} className="flex items-center">
                {index % 2 === 0 ? (
                  <PaintRoller className="h-5 w-5 mr-3 text-[#0041A8] flex-shrink-0" />
                ) : (
                  <Paintbrush className="h-5 w-5 mr-3 text-[#0041A8] flex-shrink-0" />
                )}
                <span className="font-['Inter'] text-base text-gray-800">{service}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 font-['Inter']">
                {today}
              </p>
              <p className="text-xs text-gray-500 font-['Inter'] tracking-wider">
                {docNumber}
              </p>
            </div>
            <div>
              <p className="font-['Playfair_Display'] text-xl text-right">
                {companyProfile?.companyName || "Company Name"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Diagonal footer accent */}
      <div className="absolute left-0 right-0 bottom-0 h-16 z-30">
        {/* Blue wedge in bottom-right */}
        <div 
          className="absolute right-0 bottom-0 bg-[#005ED6] w-20 h-32 transform rotate-12 translate-x-8 translate-y-8"
        ></div>
        
        {/* Black footer bar */}
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
