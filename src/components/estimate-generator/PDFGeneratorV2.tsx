
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Loader2, AlertTriangle, Image } from 'lucide-react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ComprehensivePDFContent {
  coverPage: {
    estimateDate: string;
    estimateNumber: string;
    proposalNumber: string;
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    projectAddress: string;
    estimatorName: string;
    estimatorEmail: string;
    estimatorPhone: string;
  };
  projectOverview: string;
  scopeOfWork: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }>;
  addOns: Array<{
    description: string;
    price: number;
    selected: boolean;
  }>;
  pricing: {
    subtotal: number;
    tax: number;
    total: number;
    taxRate: string;
  };
  termsAndConditions: string;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
  signatures: {
    clientSignatureRequired: boolean;
    warrantyInfo: string;
  };
}

interface PDFGeneratorV2Props {
  estimateData: Record<string, any>;
  projectType: 'interior' | 'exterior';
  lineItems: any[];
  totals: Record<string, any>;
  estimateFields?: any[];
  onComplete: () => void;
}

const PDFGeneratorV2: React.FC<PDFGeneratorV2Props> = ({
  estimateData,
  projectType,
  lineItems,
  totals,
  estimateFields = [],
  onComplete
}) => {
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);
  
  const { data: companyProfile } = useCompanyProfile(user?.id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfContent, setPdfContent] = useState<ComprehensivePDFContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);

  useEffect(() => {
    generatePDFContent();
  }, []);

  const generatePDFContent = async () => {
    setIsGenerating(true);
    setError(null);
    setDiagnosticData(null);
    
    console.log('PDFGeneratorV2 - Starting generation with estimateData:', estimateData);
    console.log('PDFGeneratorV2 - Totals:', totals);
    console.log('PDFGeneratorV2 - Company profile:', companyProfile);

    try {
      // Prepare comprehensive payload with all available data
      const payload = {
        estimateData: {
          ...estimateData,
          clientName: estimateData.clientName || estimateData.client_name || 'Valued Client',
          clientEmail: estimateData.clientEmail || estimateData.client_email || '',
          clientPhone: estimateData.clientPhone || estimateData.client_phone || '',
          projectAddress: estimateData.projectAddress || estimateData.address || 'Project Address',
          timeline: estimateData.timeline || '',
          specialNotes: estimateData.specialNotes || estimateData.clientNotes || '',
          colorPalette: estimateData.colorPalette || '',
          prepNeeds: estimateData.prepNeeds || [],
          surfacesToPaint: estimateData.surfacesToPaint || [],
          roomsToPaint: estimateData.roomsToPaint || []
        },
        projectType,
        lineItems,
        totals: {
          subtotal: totals.subtotal || 0,
          tax: totals.tax || 0,
          total: totals.total || 0,
          taxRate: totals.taxRate || '0%'
        },
        roomsMatrix: estimateData.roomsMatrix || [],
        clientNotes: estimateData.specialNotes || estimateData.clientNotes || '',
        companyProfile: companyProfile || {},
        clientInfo: {
          name: estimateData.clientName || estimateData.client_name || 'Valued Client',
          address: estimateData.projectAddress || estimateData.address || 'Project Address',
          phone: estimateData.clientPhone || estimateData.client_phone || '',
          email: estimateData.clientEmail || estimateData.client_email || ''
        },
        taxRate: totals.taxRate || '0%',
        addOns: estimateData.addOns || [],
        upsells: estimateData.upsells || [],
        colorApprovals: estimateData.colorApprovals || []
      };

      console.log('PDFGeneratorV2 - Final payload being sent:', payload);

      const { data, error: functionError } = await supabase.functions.invoke('v2-estimate-intent', {
        body: payload
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data) {
        throw new Error('No content generated');
      }

      // Handle validation errors gracefully
      if (data.error === 'AI_VALIDATION_FAILED') {
        setError('AI generated invalid content structure');
        setDiagnosticData(data);
        
        toast({
          title: "Content Structure Error",
          description: "AI response failed validation. Check diagnostic data below.",
          variant: "destructive",
        });
        return;
      }

      console.log('PDFGeneratorV2 - PDF content generated successfully:', data);
      setPdfContent(data);
      
      toast({
        title: "Content Generated",
        description: "Your professional estimate content is ready for download.",
      });

    } catch (err) {
      console.error('PDFGeneratorV2 - Error generating PDF content:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF content');
      
      toast({
        title: "Generation Failed",
        description: "Failed to generate estimate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    if (!pdfContent) return;

    setIsGenerating(true);
    
    try {
      // Create PDF with proper page handling
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Get all page elements
      const pages = document.querySelectorAll('.pdf-page');
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i] as HTMLElement;
        
        if (i > 0) {
          pdf.addPage();
        }
        
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: page.offsetWidth,
          height: page.offsetHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        
        const imgX = (pageWidth - imgWidth * ratio) / 2;
        const imgY = 0;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      }
      
      const clientName = (estimateData.clientName || estimateData.client_name || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
      const date = new Date().toISOString().split('T')[0];
      const filename = `${clientName}_Estimate_${date}.pdf`;
      
      pdf.save(filename);
      
      toast({
        title: "PDF Downloaded",
        description: `Estimate saved as ${filename}`,
      });

      onComplete();
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast({
        title: "PDF Generation Failed",
        description: "Failed to create PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Professional Estimate Generator V2
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isGenerating && !pdfContent && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">Generating structured content...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Content Generation Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  
                  {diagnosticData && (
                    <details className="mt-3">
                      <summary className="text-sm cursor-pointer text-red-600 hover:text-red-800">
                        View Diagnostic Data
                      </summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                        {JSON.stringify(diagnosticData, null, 2)}
                      </pre>
                    </details>
                  )}
                  
                  <div className="mt-3">
                    <Button 
                      onClick={generatePDFContent}
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {pdfContent && (
            <>
              <div id="pdf-preview-v2" className="bg-white max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                
                {/* Page 1 - Cover Page */}
                <div className="pdf-page p-8 min-h-screen border-b-2 border-gray-300" style={{ pageBreakAfter: 'always' }}>
                  {/* Logo Section */}
                  <div className="mb-8">
                    {companyProfile?.logo_url ? (
                      <img 
                        src={companyProfile.logo_url} 
                        alt="Company Logo" 
                        className="h-16 w-auto object-contain"
                      />
                    ) : (
                      <div className="border-2 border-black p-4 inline-block">
                        <div className="text-center">
                          <div className="text-2xl font-bold">YOUR</div>
                          <div className="text-2xl font-bold">LOGO</div>
                          <div className="text-sm">PLACEHOLDER</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Project Photo Placeholder */}
                  <div className="mb-8">
                    <div className="w-full h-80 bg-blue-100 border-2 border-blue-300 flex items-center justify-center rounded-lg">
                      <div className="text-center text-gray-600">
                        <Image className="h-12 w-12 mx-auto mb-2" />
                        <span className="text-lg">Project Photo Placeholder</span>
                        <p className="text-sm mt-1">Upload project photos to replace this</p>
                      </div>
                    </div>
                  </div>

                  {/* Project Estimate Title */}
                  <h1 className="text-4xl font-bold mb-8 text-black text-center">PROJECT ESTIMATE</h1>

                  {/* Estimate Details */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div><strong>Date:</strong> {pdfContent.coverPage?.estimateDate || new Date().toLocaleDateString()}</div>
                      <div><strong>Estimator Name:</strong> {pdfContent.coverPage?.estimatorName || companyProfile?.owner_name || 'Project Estimator'}</div>
                      <div><strong>Estimator Email:</strong> {pdfContent.coverPage?.estimatorEmail || companyProfile?.email || 'estimator@company.com'}</div>
                      <div><strong>Estimator Phone:</strong> {pdfContent.coverPage?.estimatorPhone || companyProfile?.phone || '(555) 123-4567'}</div>
                      <div><strong>Client Name:</strong> {pdfContent.coverPage?.clientName || estimateData.clientName || 'Valued Client'}</div>
                      <div><strong>Client Phone:</strong> {pdfContent.coverPage?.clientPhone || estimateData.clientPhone || ''}</div>
                      <div><strong>Client Email:</strong> {pdfContent.coverPage?.clientEmail || estimateData.clientEmail || ''}</div>
                      <div><strong>Project Address:</strong> {pdfContent.coverPage?.projectAddress || estimateData.projectAddress || 'Project Address'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold">Proposal #: {pdfContent.coverPage?.proposalNumber || `PROP-${Date.now()}`}</div>
                    </div>
                  </div>
                </div>

                {/* Page 2 - Project Overview */}
                <div className="pdf-page p-8 min-h-screen border-b-2 border-gray-300" style={{ pageBreakAfter: 'always' }}>
                  <div className="mb-8">
                    {companyProfile?.logo_url ? (
                      <img 
                        src={companyProfile.logo_url} 
                        alt="Company Logo" 
                        className="h-16 w-auto object-contain"
                      />
                    ) : (
                      <div className="border-2 border-black p-4 inline-block">
                        <div className="text-center">
                          <div className="text-2xl font-bold">YOUR</div>
                          <div className="text-2xl font-bold">LOGO</div>
                          <div className="text-sm">PLACEHOLDER</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold mb-8 text-black">PROJECT OVERVIEW</h2>
                  
                  <div className="space-y-6 text-gray-800 leading-relaxed text-base">
                    <p>{pdfContent.projectOverview || 'Thank you for considering our painting services for your project. This estimate provides a comprehensive overview of the proposed work.'}</p>
                  </div>
                </div>

                {/* Page 3 - Scope of Work */}
                <div className="pdf-page p-8 min-h-screen border-b-2 border-gray-300" style={{ pageBreakAfter: 'always' }}>
                  <div className="mb-8">
                    {companyProfile?.logo_url ? (
                      <img 
                        src={companyProfile.logo_url} 
                        alt="Company Logo" 
                        className="h-16 w-auto object-contain"
                      />
                    ) : (
                      <div className="border-2 border-black p-4 inline-block">
                        <div className="text-center">
                          <div className="text-2xl font-bold">YOUR</div>
                          <div className="text-2xl font-bold">LOGO</div>
                          <div className="text-sm">PLACEHOLDER</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold mb-8 text-black">SCOPE OF WORK</h2>

                  <div className="space-y-6 text-gray-800 leading-relaxed text-base">
                    <p>{pdfContent.scopeOfWork || 'We will provide complete interior/exterior painting services including surface preparation, primer application, and finish coats using premium materials.'}</p>
                  </div>
                </div>

                {/* Page 4 - Line Items & Add-Ons */}
                <div className="pdf-page p-8 min-h-screen border-b-2 border-gray-300" style={{ pageBreakAfter: 'always' }}>
                  <div className="mb-8">
                    {companyProfile?.logo_url ? (
                      <img 
                        src={companyProfile.logo_url} 
                        alt="Company Logo" 
                        className="h-16 w-auto object-contain"
                      />
                    ) : (
                      <div className="border-2 border-black p-4 inline-block">
                        <div className="text-center">
                          <div className="text-2xl font-bold">YOUR</div>
                          <div className="text-2xl font-bold">LOGO</div>
                          <div className="text-sm">PLACEHOLDER</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold mb-8 text-black">LINE ITEMS & PRICING</h2>

                  {/* Line Items Table */}
                  <div className="mb-8">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 p-2 text-left">Description</th>
                          <th className="border border-gray-300 p-2 text-center">Qty</th>
                          <th className="border border-gray-300 p-2 text-center">Unit</th>
                          <th className="border border-gray-300 p-2 text-right">Unit Price</th>
                          <th className="border border-gray-300 p-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(pdfContent.lineItems || lineItems || []).map((item: any, index: number) => (
                          <tr key={index}>
                            <td className="border border-gray-300 p-2">{item.description}</td>
                            <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                            <td className="border border-gray-300 p-2 text-center">{item.unit}</td>
                            <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.unitPrice || item.unit_price || 0)}</td>
                            <td className="border border-gray-300 p-2 text-right">{formatCurrency(item.total || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add-Ons Section */}
                  {(pdfContent.addOns || estimateData.addOns || []).length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-4 text-black">OPTIONAL ADD-ONS</h3>
                      <div className="space-y-2">
                        {(pdfContent.addOns || estimateData.addOns || []).map((addon: any, index: number) => (
                          <div key={index} className="flex justify-between border-b pb-2">
                            <span>{addon.description}</span>
                            <span className="font-semibold">{formatCurrency(addon.price || 0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Page 5 - Pricing Summary */}
                <div className="pdf-page p-8 min-h-screen border-b-2 border-gray-300" style={{ pageBreakAfter: 'always' }}>
                  <div className="mb-8">
                    {companyProfile?.logo_url ? (
                      <img 
                        src={companyProfile.logo_url} 
                        alt="Company Logo" 
                        className="h-16 w-auto object-contain"
                      />
                    ) : (
                      <div className="border-2 border-black p-4 inline-block">
                        <div className="text-center">
                          <div className="text-2xl font-bold">YOUR</div>
                          <div className="text-2xl font-bold">LOGO</div>
                          <div className="text-sm">PLACEHOLDER</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold mb-8 text-black">PRICING SUMMARY</h2>

                  <div className="max-w-md ml-auto">
                    <div className="space-y-4 text-lg">
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">Subtotal:</span>
                        <span className="font-bold">{formatCurrency(pdfContent.pricing?.subtotal || totals.subtotal || 0)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">Tax ({pdfContent.pricing?.taxRate || totals.taxRate || '0%'}):</span>
                        <span className="font-bold">{formatCurrency(pdfContent.pricing?.tax || totals.tax || 0)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-2xl border-t-2 border-black pt-4">
                        <span>Total:</span>
                        <span>{formatCurrency(pdfContent.pricing?.total || totals.total || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 space-y-6 text-gray-800 leading-relaxed">
                    <h3 className="text-xl font-bold text-black">Payment Terms</h3>
                    <p>Payment in full is due upon completion of work. All invoices not paid in full after 15 days will be subject to a 2% per month interest charge.</p>
                  </div>
                </div>

                {/* Page 6 - Terms and Conditions */}
                <div className="pdf-page p-8 min-h-screen border-b-2 border-gray-300" style={{ pageBreakAfter: 'always' }}>
                  <div className="mb-8">
                    {companyProfile?.logo_url ? (
                      <img 
                        src={companyProfile.logo_url} 
                        alt="Company Logo" 
                        className="h-16 w-auto object-contain"
                      />
                    ) : (
                      <div className="border-2 border-black p-4 inline-block">
                        <div className="text-center">
                          <div className="text-2xl font-bold">YOUR</div>
                          <div className="text-2xl font-bold">LOGO</div>
                          <div className="text-sm">PLACEHOLDER</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold mb-8 text-black">TERMS AND CONDITIONS</h2>
                  
                  <div className="space-y-6 text-gray-800 leading-relaxed text-base">
                    <p>{pdfContent.termsAndConditions || 'Standard terms and conditions apply. Payment schedule and warranty information will be provided with the final contract.'}</p>
                  </div>
                </div>

                {/* Page 7 - Company Info & Signatures */}
                <div className="pdf-page p-8 min-h-screen">
                  <div className="mb-8">
                    {companyProfile?.logo_url ? (
                      <img 
                        src={companyProfile.logo_url} 
                        alt="Company Logo" 
                        className="h-16 w-auto object-contain"
                      />
                    ) : (
                      <div className="border-2 border-black p-4 inline-block">
                        <div className="text-center">
                          <div className="text-2xl font-bold">YOUR</div>
                          <div className="text-2xl font-bold">LOGO</div>
                          <div className="text-sm">PLACEHOLDER</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-10">
                    <div>
                      <h3 className="text-2xl font-bold mb-6 text-black">COMPANY INFORMATION</h3>
                      <div className="space-y-2">
                        <div><strong>Company:</strong> {pdfContent.companyInfo?.name || companyProfile?.business_name || 'Your Company'}</div>
                        <div><strong>Address:</strong> {pdfContent.companyInfo?.address || companyProfile?.location || 'Company Address'}</div>
                        <div><strong>Phone:</strong> {pdfContent.companyInfo?.phone || companyProfile?.phone || '(555) 123-4567'}</div>
                        <div><strong>Email:</strong> {pdfContent.companyInfo?.email || companyProfile?.email || 'contact@company.com'}</div>
                      </div>
                    </div>

                    <div className="mt-16">
                      <h3 className="text-2xl font-bold mb-8 text-black">Project Acceptance:</h3>
                      <div className="space-y-10">
                        <div className="flex justify-between">
                          <div>
                            <div className="border-b-2 border-black w-96 mb-3"></div>
                            <div className="text-lg">Client Name</div>
                          </div>
                          <div>
                            <div className="border-b-2 border-black w-64 mb-3"></div>
                            <div className="text-lg">Date</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="border-b-2 border-black w-96 mb-3"></div>
                          <div className="text-lg">Client Signature</div>
                        </div>

                        <div className="text-base leading-relaxed bg-gray-50 p-6 rounded-lg">
                          <p>By signing above, I acknowledge that I have read and agree to the terms and conditions outlined in this estimate. I authorize {companyProfile?.business_name || 'Your Company'} to proceed with the work as described.</p>
                        </div>

                        {pdfContent.signatures?.warrantyInfo && (
                          <div className="mt-8">
                            <h4 className="text-lg font-bold mb-4">Warranty Information</h4>
                            <p className="text-sm text-gray-700">{pdfContent.signatures.warrantyInfo}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={generatePDFContent} variant="outline" disabled={isGenerating}>
                  Regenerate Content
                </Button>
                <Button 
                  onClick={generatePDF} 
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFGeneratorV2;
