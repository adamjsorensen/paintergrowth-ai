
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Loader2, AlertTriangle, Image } from 'lucide-react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFContent {
  coverPage: {
    title: string;
    clientName: string;
    projectAddress: string;
    estimateDate: string;
    estimateNumber: string;
    proposalNumber: string;
    estimatorName: string;
    estimatorEmail: string;
    estimatorPhone: string;
    clientPhone: string;
    clientEmail: string;
  };
  introductionLetter: {
    greeting: string;
    thankYouMessage: string;
    valueProposition: string;
    qualityCommitment: string;
    collaborationMessage: string;
    bookingInstructions: string;
    closing: string;
    ownerName: string;
    companyName: string;
    website: string;
  };
  projectDescription: {
    powerWashing: {
      description: string;
      areas: string[];
      notes: string[];
    };
    surfacePreparation: {
      includes: string[];
    };
    paintApplication: {
      description: string;
      notes: string[];
    };
    inclusions: string[];
    exclusions: string[];
    safetyAndCleanup: string[];
    specialConsiderations: string;
  };
  pricing: {
    subtotal: number;
    tax: number;
    total: number;
  };
  colorApprovals: Array<{
    colorCode: string;
    colorName: string;
    surfaces: string;
    approved: boolean;
  }>;
  addOns: {
    totalPrice: number;
    validityDays: number;
    depositPercent: number;
    optionalUpgrades: Array<{
      selected: boolean;
      description: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }>;
    projectAcceptance: {
      clientNameLine: string;
      dateLine: string;
      signatureLine: string;
      agreementText: string;
    };
  };
}

interface PDFGeneratorV2Props {
  estimateData: Record<string, any>;
  projectType: 'interior' | 'exterior';
  lineItems: any[];
  totals: Record<string, any>;
  onComplete: () => void;
}

const PDFGeneratorV2: React.FC<PDFGeneratorV2Props> = ({
  estimateData,
  projectType,
  lineItems,
  totals,
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
  const [pdfContent, setPdfContent] = useState<PDFContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);

  useEffect(() => {
    generatePDFContent();
  }, []);

  const generatePDFContent = async () => {
    setIsGenerating(true);
    setError(null);
    setDiagnosticData(null);
    
    console.log('Generating PDF content with V2 architecture...');

    try {
      const payload = {
        estimateData,
        projectType,
        lineItems,
        totals,
        roomsMatrix: estimateData.roomsMatrix || [],
        clientNotes: estimateData.clientNotes || '',
        companyProfile: companyProfile || {},
        clientInfo: {
          name: estimateData.clientName || 'Valued Client',
          address: estimateData.address || 'Project Address',
          phone: estimateData.clientPhone || '',
          email: estimateData.clientEmail || ''
        },
        taxRate: totals.taxRate || '0%',
        addOns: estimateData.addOns || []
      };

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

      console.log('PDF content generated successfully:', data);
      setPdfContent(data);
      
      toast({
        title: "Content Generated",
        description: "Your professional estimate content is ready for download.",
      });

    } catch (err) {
      console.error('Error generating PDF content:', err);
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
      
      const clientName = pdfContent.coverPage.clientName.replace(/[^a-zA-Z0-9]/g, '_');
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
                      <div><strong>Date:</strong> {pdfContent.coverPage.estimateDate}</div>
                      <div><strong>Estimator Name:</strong> {pdfContent.coverPage.estimatorName}</div>
                      <div><strong>Estimator Email:</strong> {pdfContent.coverPage.estimatorEmail}</div>
                      <div><strong>Estimator Phone:</strong> {pdfContent.coverPage.estimatorPhone}</div>
                      <div><strong>Client Name:</strong> {pdfContent.coverPage.clientName}</div>
                      <div><strong>Client Phone:</strong> {pdfContent.coverPage.clientPhone}</div>
                      <div><strong>Client Email:</strong> {pdfContent.coverPage.clientEmail}</div>
                      <div><strong>Project Address:</strong> {pdfContent.coverPage.projectAddress}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-semibold">Proposal #: {pdfContent.coverPage.proposalNumber}</div>
                    </div>
                  </div>
                </div>

                {/* Page 2 - Introduction */}
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

                  <h2 className="text-3xl font-bold mb-8 text-black">INTRODUCTION</h2>
                  
                  <div className="space-y-6 text-gray-800 leading-relaxed text-base">
                    <p>{pdfContent.introductionLetter.greeting}</p>
                    <p>{pdfContent.introductionLetter.thankYouMessage}</p>
                    <p>{pdfContent.introductionLetter.valueProposition}</p>
                    <p>{pdfContent.introductionLetter.qualityCommitment}</p>
                    <p>{pdfContent.introductionLetter.collaborationMessage}</p>
                    <p>{pdfContent.introductionLetter.bookingInstructions}</p>
                    <p className="mt-8">{pdfContent.introductionLetter.closing}</p>
                    <div className="mt-6">
                      <p>({pdfContent.introductionLetter.ownerName})</p>
                      <p>({pdfContent.introductionLetter.companyName})</p>
                    </div>
                    <p className="mt-12 text-center italic text-lg">
                      More information about us is also available at: {pdfContent.introductionLetter.website}
                    </p>
                  </div>
                </div>

                {/* Page 3 - Description of Project */}
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

                  <h2 className="text-3xl font-bold mb-8 text-black">DESCRIPTION OF PROJECT</h2>

                  <div className="space-y-8">
                    <div>
                      <h3 className="font-bold text-xl mb-4 text-black">POWER WASHING AND/OR PREP FOR PAINTING</h3>
                      <p className="mb-4 text-base">{pdfContent.projectDescription.powerWashing.description}</p>
                      <p className="mb-3 font-semibold">Areas included in the wash:</p>
                      <ol className="list-decimal list-inside ml-4 space-y-1">
                        {pdfContent.projectDescription.powerWashing.areas.map((area, index) => (
                          <li key={index} className="text-base">{area}</li>
                        ))}
                      </ol>
                      {pdfContent.projectDescription.powerWashing.notes.map((note, index) => (
                        <p key={index} className="mt-3 text-base">**{note}</p>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-bold text-xl mb-4 text-black">SURFACE PREPARATION</h3>
                      <p className="mb-3 font-semibold">INCLUDES:</p>
                      {pdfContent.projectDescription.surfacePreparation.includes.map((item, index) => (
                        <p key={index} className="mb-2 text-base">** {item}</p>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-bold text-xl mb-4 text-black">PAINT APPLICATION:</h3>
                      <p className="mb-4 text-base">**{pdfContent.projectDescription.paintApplication.description}</p>
                      {pdfContent.projectDescription.paintApplication.notes.map((note, index) => (
                        <p key={index} className="mb-3 text-base">++{note}</p>
                      ))}
                      <p className="font-bold mt-6 text-lg">PREPARE AND PAINT EXTERIOR OF THE HOME.</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-xl mb-4 text-black">INCLUSIONS:</h3>
                      {pdfContent.projectDescription.inclusions.map((item, index) => (
                        <p key={index} className="mb-2 text-base">{item}</p>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-bold text-xl mb-4 text-black">EXCLUSIONS:</h3>
                      {pdfContent.projectDescription.exclusions.map((item, index) => (
                        <p key={index} className="mb-2 text-base">{item}</p>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-bold text-xl mb-4 text-black">SAFETY, SETUP & CLEAN UP</h3>
                      {pdfContent.projectDescription.safetyAndCleanup.map((item, index) => (
                        <p key={index} className="mb-3 text-base">** {item}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Page 4 - Pricing and Color Approvals */}
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
                    {/* Special Considerations */}
                    <div>
                      <h3 className="font-bold text-xl mb-4 text-black">SPECIAL CONSIDERATIONS</h3>
                      <p className="text-base">{pdfContent.projectDescription.specialConsiderations}</p>
                    </div>

                    {/* Pricing Summary */}
                    <div className="text-right space-y-3 text-lg">
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">Quote Subtotal:</span>
                        <span className="font-bold">{formatCurrency(pdfContent.pricing.subtotal)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">Sales Tax:</span>
                        <span className="font-bold">{formatCurrency(pdfContent.pricing.tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-2xl border-t-2 border-black pt-4">
                        <span>Total:</span>
                        <span>{formatCurrency(pdfContent.pricing.total)}</span>
                      </div>
                    </div>

                    {/* Color Approvals Section */}
                    <div className="bg-cyan-50 p-8 border-2 border-cyan-300 rounded-lg">
                      <h3 className="text-2xl font-bold mb-6 text-black">Color Approvals</h3>
                      <div className="border-2 border-purple-400 bg-purple-50 p-6 rounded-lg">
                        {pdfContent.colorApprovals.map((color, index) => (
                          <div key={index} className="mb-6 text-base">
                            <div><strong>Color {index + 1} ({color.colorCode}):</strong> {color.colorName}</div>
                            <div><strong>Surfaces:</strong> {color.surfaces}</div>
                          </div>
                        ))}
                        
                        <div className="mt-8 border-t-2 border-purple-400 pt-6">
                          <div className="flex justify-between items-center text-base">
                            <span>Approved by _________________________ on _________________</span>
                          </div>
                          <div className="text-center mt-3">
                            <span>(Client Signature)</span>
                            <span className="ml-32">(Date)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page 5 - Add-ons & Signing Authorization */}
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

                  <h2 className="text-3xl font-bold mb-8 text-black">ADD ONS & SIGNING AUTHORIZATION</h2>

                  <div className="space-y-10">
                    <div className="text-2xl font-bold text-center">
                      Total Price: {formatCurrency(pdfContent.addOns.totalPrice)}
                    </div>

                    <div className="bg-gray-100 p-6 rounded-lg">
                      <p className="text-center font-bold text-lg">
                        Estimate Valid for {pdfContent.addOns.validityDays} days. A {pdfContent.addOns.depositPercent}% deposit is required to confirm proposal
                      </p>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold mb-6 text-black">OPTIONAL UPGRADES</h3>
                      <table className="w-full border-collapse border-2 border-gray-600">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border border-gray-600 p-3 text-left"></th>
                            <th className="border border-gray-600 p-3 text-left font-bold">Description</th>
                            <th className="border border-gray-600 p-3 text-center font-bold">Qty</th>
                            <th className="border border-gray-600 p-3 text-center font-bold">Unit Price</th>
                            <th className="border border-gray-600 p-3 text-center font-bold">Line Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pdfContent.addOns.optionalUpgrades.map((upgrade, index) => (
                            <tr key={index} className="text-base">
                              <td className="border border-gray-600 p-3 text-center">
                                <input type="checkbox" checked={upgrade.selected} readOnly className="w-4 h-4" />
                              </td>
                              <td className="border border-gray-600 p-3">{upgrade.description}</td>
                              <td className="border border-gray-600 p-3 text-center">{upgrade.quantity}</td>
                              <td className="border border-gray-600 p-3 text-right">{formatCurrency(upgrade.unitPrice)}</td>
                              <td className="border border-gray-600 p-3 text-right font-bold">{formatCurrency(upgrade.lineTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
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
                          <p>{pdfContent.addOns.projectAcceptance.agreementText}</p>
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
