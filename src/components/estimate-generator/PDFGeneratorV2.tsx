
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Loader2, AlertTriangle, Image } from 'lucide-react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SimplePDFContent {
  projectOverview: string;
  scopeOfWork: string;
  materialsAndLabor: string;
  timeline: string;
  termsAndConditions: string;
  additionalNotes: string;
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
  const [pdfContent, setPdfContent] = useState<SimplePDFContent | null>(null);
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

  // Create structured data for the PDF layout from the simple content
  const createPDFData = () => {
    if (!pdfContent) return null;

    const currentDate = new Date().toLocaleDateString();
    const estimateNumber = `EST-${Date.now()}`;
    const proposalNumber = `PROP-${Date.now()}`;

    return {
      coverPage: {
        estimateDate: currentDate,
        estimateNumber,
        proposalNumber,
        clientName: estimateData.clientName || estimateData.client_name || 'Valued Client',
        clientPhone: estimateData.clientPhone || estimateData.client_phone || '',
        clientEmail: estimateData.clientEmail || estimateData.client_email || '',
        projectAddress: estimateData.projectAddress || estimateData.address || 'Project Address',
        estimatorName: companyProfile?.contact_name || companyProfile?.owner_name || 'Project Estimator',
        estimatorEmail: companyProfile?.email || 'estimator@company.com',
        estimatorPhone: companyProfile?.phone || '(555) 123-4567'
      },
      content: pdfContent,
      pricing: {
        subtotal: totals.subtotal || 0,
        tax: totals.tax || 0,
        total: totals.total || 0
      },
      companyInfo: {
        name: companyProfile?.company_name || 'Your Company',
        website: companyProfile?.website || 'www.yourcompany.com'
      }
    };
  };

  const pdfData = createPDFData();

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

          {pdfContent && pdfData && (
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
                      <div><strong>Date:</strong> {pdfData.coverPage.estimateDate}</div>
                      <div><strong>Estimator Name:</strong> {pdfData.coverPage.estimatorName}</div>
                      <div><strong>Estimator Email:</strong> {pdfData.coverPage.estimatorEmail}</div>
                      <div><strong>Estimator Phone:</strong> {pdfData.coverPage.estimatorPhone}</div>
                      <div><strong>Client Name:</strong> {pdfData.coverPage.clientName}</div>
                      <div><strong>Client Phone:</strong> {pdfData.coverPage.clientPhone}</div>
                      <div><strong>Client Email:</strong> {pdfData.coverPage.clientEmail}</div>
                      <div><strong>Project Address:</strong> {pdfData.coverPage.projectAddress}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold">Proposal #: {pdfData.coverPage.proposalNumber}</div>
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
                    <p>{pdfContent.projectOverview}</p>
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
                    <p>{pdfContent.scopeOfWork}</p>
                  </div>
                </div>

                {/* Page 4 - Materials and Labor + Timeline */}
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

                  <div className="space-y-10">
                    <div>
                      <h3 className="font-bold text-xl mb-4 text-black">MATERIALS AND LABOR</h3>
                      <p className="text-base text-gray-800 leading-relaxed">{pdfContent.materialsAndLabor}</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-xl mb-4 text-black">PROJECT TIMELINE</h3>
                      <p className="text-base text-gray-800 leading-relaxed">{pdfContent.timeline}</p>
                    </div>

                    {/* Pricing Summary */}
                    <div className="text-right space-y-3 text-lg">
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">Quote Subtotal:</span>
                        <span className="font-bold">{formatCurrency(pdfData.pricing.subtotal)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">Sales Tax:</span>
                        <span className="font-bold">{formatCurrency(pdfData.pricing.tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-2xl border-t-2 border-black pt-4">
                        <span>Total:</span>
                        <span>{formatCurrency(pdfData.pricing.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page 5 - Terms and Conditions + Additional Notes */}
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
                      <h3 className="text-2xl font-bold mb-6 text-black">TERMS AND CONDITIONS</h3>
                      <p className="text-base text-gray-800 leading-relaxed">{pdfContent.termsAndConditions}</p>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold mb-6 text-black">ADDITIONAL NOTES</h3>
                      <p className="text-base text-gray-800 leading-relaxed">{pdfContent.additionalNotes}</p>
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
                          <p>By signing above, I acknowledge that I have read and agree to the terms and conditions outlined in this estimate. I authorize {pdfData.companyInfo.name} to proceed with the work as described.</p>
                        </div>
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
