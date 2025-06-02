
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Loader2, AlertTriangle } from 'lucide-react';
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
      const element = document.getElementById('pdf-preview-v2');
      if (!element) {
        throw new Error('PDF preview element not found');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
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
                <div className="p-8 min-h-screen border-b-2 border-gray-300 page-break">
                  {/* Logo placeholder */}
                  <div className="mb-8">
                    <div className="border-2 border-black p-4 inline-block">
                      <div className="text-center">
                        <div className="text-2xl font-bold">YOUR</div>
                        <div className="text-2xl font-bold">LOGO</div>
                        <div className="text-sm">PLACEHOLDER</div>
                      </div>
                    </div>
                  </div>

                  {/* Project Photo Placeholder */}
                  <div className="mb-8">
                    <div className="w-full h-80 bg-blue-300 border-2 border-blue-400 flex items-center justify-center">
                      <span className="text-gray-700 text-lg">Project Photo Placeholder</span>
                    </div>
                  </div>

                  {/* Project Estimate Title */}
                  <h1 className="text-3xl font-bold mb-8 text-black">PROJECT ESTIMATE</h1>

                  {/* Estimate Details */}
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div><strong>Date:</strong></div>
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
                <div className="p-8 min-h-screen border-b-2 border-gray-300 page-break">
                  <div className="mb-8">
                    <div className="border-2 border-black p-4 inline-block">
                      <div className="text-center">
                        <div className="text-2xl font-bold">YOUR</div>
                        <div className="text-2xl font-bold">LOGO</div>
                        <div className="text-sm">PLACEHOLDER</div>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-8">INTRODUCTION</h2>
                  
                  <div className="space-y-4 text-gray-800 leading-relaxed">
                    <p>{pdfContent.introductionLetter.greeting}</p>
                    <p>{pdfContent.introductionLetter.thankYouMessage}</p>
                    <p>{pdfContent.introductionLetter.valueProposition}</p>
                    <p>{pdfContent.introductionLetter.qualityCommitment}</p>
                    <p>{pdfContent.introductionLetter.collaborationMessage}</p>
                    <p>{pdfContent.introductionLetter.bookingInstructions}</p>
                    <p className="mt-6">{pdfContent.introductionLetter.closing}</p>
                    <div className="mt-4">
                      <p>({pdfContent.introductionLetter.ownerName})</p>
                      <p>({pdfContent.introductionLetter.companyName})</p>
                    </div>
                    <p className="mt-8 text-center italic">
                      More information about us is also available at: {pdfContent.introductionLetter.website}
                    </p>
                  </div>
                </div>

                {/* Page 3 - Description of Project */}
                <div className="p-8 min-h-screen border-b-2 border-gray-300 page-break">
                  <div className="mb-8">
                    <div className="border-2 border-black p-4 inline-block">
                      <div className="text-center">
                        <div className="text-2xl font-bold">YOUR</div>
                        <div className="text-2xl font-bold">LOGO</div>
                        <div className="text-sm">PLACEHOLDER</div>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-8">DESCRIPTION OF PROJECT</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-bold text-lg mb-2">POWER WASHING AND/OR PREP FOR PAINTING</h3>
                      <p className="mb-2">{pdfContent.projectDescription.powerWashing.description}</p>
                      <p className="mb-2">Areas included in the wash:</p>
                      <ol className="list-decimal list-inside ml-4">
                        {pdfContent.projectDescription.powerWashing.areas.map((area, index) => (
                          <li key={index}>{area}</li>
                        ))}
                      </ol>
                      {pdfContent.projectDescription.powerWashing.notes.map((note, index) => (
                        <p key={index} className="mt-2">**{note}</p>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-2">SURFACE PREPARATION</h3>
                      <p className="mb-2">INCLUDES:</p>
                      {pdfContent.projectDescription.surfacePreparation.includes.map((item, index) => (
                        <p key={index} className="mb-1">** {item}</p>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-2">PAINT APPLICATION:</h3>
                      <p className="mb-2">**{pdfContent.projectDescription.paintApplication.description}</p>
                      {pdfContent.projectDescription.paintApplication.notes.map((note, index) => (
                        <p key={index} className="mb-2">++{note}</p>
                      ))}
                      <p className="font-bold mt-4">PREPARE AND PAINT EXTERIOR OF THE HOME.</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-2">INCLUSIONS:</h3>
                      {pdfContent.projectDescription.inclusions.map((item, index) => (
                        <p key={index} className="mb-1">{item}</p>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-2">EXCLUSIONS:</h3>
                      {pdfContent.projectDescription.exclusions.map((item, index) => (
                        <p key={index} className="mb-1">{item}</p>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-2">SAFETY, SETUP & CLEAN UP</h3>
                      {pdfContent.projectDescription.safetyAndCleanup.map((item, index) => (
                        <p key={index} className="mb-2">** {item}</p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Page 4 - Pricing and Color Approvals */}
                <div className="p-8 min-h-screen border-b-2 border-gray-300 page-break">
                  <div className="mb-8">
                    <div className="border-2 border-black p-4 inline-block">
                      <div className="text-center">
                        <div className="text-2xl font-bold">YOUR</div>
                        <div className="text-2xl font-bold">LOGO</div>
                        <div className="text-sm">PLACEHOLDER</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Special Considerations */}
                    <div>
                      <h3 className="font-bold text-lg mb-2">SPECIAL CONSIDERATIONS</h3>
                      <p>{pdfContent.projectDescription.specialConsiderations}</p>
                    </div>

                    {/* Pricing Summary */}
                    <div className="text-right space-y-2">
                      <div className="flex justify-between">
                        <span>Quote Subtotal:</span>
                        <span>{formatCurrency(pdfContent.pricing.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sales Tax (X%):</span>
                        <span>{formatCurrency(pdfContent.pricing.tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(pdfContent.pricing.total)}</span>
                      </div>
                    </div>

                    {/* Color Approvals Section */}
                    <div className="bg-cyan-100 p-6 border-2 border-cyan-200">
                      <h3 className="text-xl font-bold mb-4">Color Approvals</h3>
                      <div className="border-2 border-purple-400 bg-purple-100 p-4">
                        {pdfContent.colorApprovals.map((color, index) => (
                          <div key={index} className="mb-4">
                            <div><strong>Color {index + 1} ({color.colorCode}):</strong> {color.colorName}</div>
                            <div><strong>Surfaces:</strong> {color.surfaces}</div>
                          </div>
                        ))}
                        
                        <div className="mt-6 border-t-2 border-purple-400 pt-4">
                          <div className="flex justify-between items-center">
                            <span>Approved by _________________________ on _________________</span>
                          </div>
                          <div className="text-center mt-2">
                            <span>(Client Signature)</span>
                            <span className="ml-20">(Date)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page 5 - Add-ons & Signing Authorization */}
                <div className="p-8 min-h-screen page-break">
                  <div className="mb-8">
                    <div className="border-2 border-black p-4 inline-block">
                      <div className="text-center">
                        <div className="text-2xl font-bold">YOUR</div>
                        <div className="text-2xl font-bold">LOGO</div>
                        <div className="text-sm">PLACEHOLDER</div>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold mb-8">ADD ONS & SIGNING AUTHORIZATION</h2>

                  <div className="space-y-8">
                    <div className="text-xl font-semibold">
                      Total Price: {formatCurrency(pdfContent.addOns.totalPrice)}
                    </div>

                    <div className="bg-gray-100 p-4">
                      <p className="text-center font-medium">
                        Estimate Valid for {pdfContent.addOns.validityDays} days. A {pdfContent.addOns.depositPercent}% deposit is required to confirm proposal
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-4">OPTIONAL UPGRADES</h3>
                      <table className="w-full border-collapse border border-gray-400">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border border-gray-400 p-2"></th>
                            <th className="border border-gray-400 p-2 text-left">Description</th>
                            <th className="border border-gray-400 p-2">Qty</th>
                            <th className="border border-gray-400 p-2">Unit Price</th>
                            <th className="border border-gray-400 p-2">Line Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pdfContent.addOns.optionalUpgrades.map((upgrade, index) => (
                            <tr key={index}>
                              <td className="border border-gray-400 p-2 text-center">
                                <input type="checkbox" checked={upgrade.selected} readOnly />
                              </td>
                              <td className="border border-gray-400 p-2">{upgrade.description}</td>
                              <td className="border border-gray-400 p-2 text-center">{upgrade.quantity}</td>
                              <td className="border border-gray-400 p-2 text-right">{formatCurrency(upgrade.unitPrice)}</td>
                              <td className="border border-gray-400 p-2 text-right">{formatCurrency(upgrade.lineTotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-6">Project Acceptance:</h3>
                      <div className="space-y-8">
                        <div className="flex justify-between">
                          <div>
                            <div className="border-b-2 border-black w-80 mb-2"></div>
                            <div>Client Name</div>
                          </div>
                          <div>
                            <div className="border-b-2 border-black w-48 mb-2"></div>
                            <div>Date</div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="border-b-2 border-black w-80 mb-2"></div>
                          <div>Client Signature</div>
                        </div>

                        <div className="text-sm leading-relaxed">
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
