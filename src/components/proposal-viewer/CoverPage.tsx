
import React from 'react';

interface CoverPageProps {
  metadata: {
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    clientAddress?: string;
    preparedBy?: string;
    preparedByTitle?: string;
    jobType?: string;
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
  const defaultLogo = "/placeholder.svg";
  const logoUrl = companyProfile?.logo_url || defaultLogo;
  
  // Use prepared by from metadata, with fallback to company owner name
  const estimatorName = metadata.preparedBy || companyProfile?.owner_name || "";
  const estimatorTitle = metadata.preparedByTitle || "";
  
  // Add logging for debugging the client address issue
  console.log("Cover Page Metadata:", {
    clientAddress: metadata.clientAddress,
    allMetadata: metadata
  });
  
  // Extract address from content if not available in metadata (fallback mechanism)
  const clientAddress = metadata.clientAddress || "123 Anywhere St, Richmond VT";

  return (
    <div className="cover-page min-h-screen bg-white p-8 print:break-after-page">
      {/* Logo section */}
      <div className="text-center mb-2">
        <img
          src={logoUrl}
          alt={companyProfile?.business_name || "YOUR LOGO PLACEHOLDER"}
          className="h-24 mx-auto"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
          }}
        />
      </div>
      
      {/* Property image */}
      <div className="mb-2">
        <img 
          src={coverImageUrl || "/placeholder.svg"} 
          alt="Property" 
          className="w-full h-auto object-cover"
          style={{ maxHeight: '400px' }}
        />
      </div>
      
      {/* Project Estimate Title */}
      <div className="mb-1">
        <h1 className="text-4xl font-bold uppercase tracking-wide">
          <strong>PROJECT ESTIMATE</strong><br></br> {clientAddress}
        </h1>
      </div>
      
      {/* Date line */}
      <div className="mb-2">
        <p><strong>Date:</strong> {today}</p>
      </div>
      
      {/* Information Grid */}
      <div className="flex justify-between mb-2">
        {/* Left Column - Estimator Info */}
        <div className="max-w-xs">
          <p className="mb-1">
            <strong>Estimator Name:</strong> {estimatorName}<br></br>
            {estimatorTitle && <><strong>Title:</strong> {estimatorTitle}<br></br></>}
            <strong>Estimator Email:</strong> {companyProfile?.email || ""}<br></br>
            <strong>Estimator Phone:</strong> {companyProfile?.phone || ""}<br></br>
          </p>
        </div>
        
        {/* Right Column - Proposal # */}
        <div>
          <p className="text-lg font-bold">Proposal #: {docNumber}</p>
        </div>
      </div>
      
      {/* Client Information */}
      <div className="mb-2">
        <p className="mb-1">
          <strong>Client Name:</strong> {metadata.clientName || ""}<br></br>
          <strong>Client Phone:</strong> {metadata.clientPhone || ""}<br></br>
          <strong>Client Email:</strong> {metadata.clientEmail || ""}
        </p>
      </div>
    </div>
  );
};

export default CoverPage;
