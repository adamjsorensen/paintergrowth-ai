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
    validUntil: string;
  };
  introductionLetter: {
    greeting: string;
    projectOverview: string;
    whyChooseUs: string[];
    nextSteps: string;
    closing: string;
  };
  scopeOfWork: {
    preparation: string[];
    painting: string[];
    cleanup: string[];
    timeline: string;
  };
  pricingSummary: {
    subtotal: number;
    tax: number;
    discount?: number;
    total: number;
    paymentTerms: string;
  };
  upsells: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    selected: boolean;
  }>;
  colorApprovals: Array<{
    room: string;
    colorName: string;
    approved: boolean;
    signatureRequired: boolean;
  }>;
  termsAndConditions: {
    warranty: string;
    materials: string;
    scheduling: string;
    changes: string;
  };
  companyInfo: {
    businessName: string;
    contactInfo: string;
    license: string;
    insurance: string;
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
      // Prepare sample upsells and color approvals (in real app, these would come from form data)
      const sampleUpsells = [
        {
          id: 'premium-prep',
          title: 'Premium Surface Preparation',
          description: 'Complete sanding, patching, and primer application',
          price: 450,
          selected: false
        },
        {
          id: 'trim-painting',
          title: 'Trim and Molding',
          description: 'Professional trim painting with precision finish',
          price: 320,
          selected: false
        }
      ];

      const sampleColorApprovals = [
        {
          room: 'Living Room',
          colorName: 'Warm White (SW 7004)',
          approved: false,
          signatureRequired: true
        },
        {
          room: 'Kitchen',
          colorName: 'Sea Salt (SW 6204)',
          approved: false,
          signatureRequired: true
        }
      ];

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
        addOns: estimateData.addOns || [],
        upsells: sampleUpsells,
        colorApprovals: sampleColorApprovals
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
              <div id="pdf-preview-v2" className="bg-white p-8 border rounded-lg shadow-sm space-y-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                {/* Cover Page */}
                <div className="text-center border-b pb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{pdfContent.coverPage.title}</h1>
                  <div className="text-lg text-gray-600 space-y-1">
                    <p><strong>Client:</strong> {pdfContent.coverPage.clientName}</p>
                    <p><strong>Project Address:</strong> {pdfContent.coverPage.projectAddress}</p>
                    <p><strong>Estimate Date:</strong> {pdfContent.coverPage.estimateDate}</p>
                    <p><strong>Estimate #:</strong> {pdfContent.coverPage.estimateNumber}</p>
                    <p><strong>Valid Until:</strong> {pdfContent.coverPage.validUntil}</p>
                  </div>
                </div>

                {/* Introduction Letter */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Personal Message</h2>
                  <div className="space-y-3 text-gray-700">
                    <p>{pdfContent.introductionLetter.greeting}</p>
                    <p>{pdfContent.introductionLetter.projectOverview}</p>
                    <div>
                      <strong>Why Choose Us:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {pdfContent.introductionLetter.whyChooseUs.map((reason, index) => (
                          <li key={index}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                    <p>{pdfContent.introductionLetter.nextSteps}</p>
                    <p className="italic">{pdfContent.introductionLetter.closing}</p>
                  </div>
                </div>

                {/* Scope of Work */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Scope of Work</h2>
                  <div className="grid gap-4">
                    <div>
                      <strong>Preparation:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {pdfContent.scopeOfWork.preparation.map((item, index) => (
                          <li key={index} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Painting:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {pdfContent.scopeOfWork.painting.map((item, index) => (
                          <li key={index} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Cleanup:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {pdfContent.scopeOfWork.cleanup.map((item, index) => (
                          <li key={index} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Timeline:</strong> {pdfContent.scopeOfWork.timeline}
                    </div>
                  </div>
                </div>

                {/* Pricing Summary (NO line items table) */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Pricing Summary</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(pdfContent.pricingSummary.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(pdfContent.pricingSummary.tax)}</span>
                      </div>
                      {pdfContent.pricingSummary.discount && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-{formatCurrency(pdfContent.pricingSummary.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(pdfContent.pricingSummary.total)}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <strong>Payment Terms:</strong> {pdfContent.pricingSummary.paymentTerms}
                    </div>
                  </div>
                </div>

                {/* Upsells Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Optional Upgrades</h2>
                  <div className="space-y-3">
                    {pdfContent.upsells.map((upsell, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={upsell.selected} readOnly className="h-4 w-4" />
                            <div>
                              <strong>{upsell.title}</strong>
                              <p className="text-sm text-gray-600">{upsell.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatCurrency(upsell.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Approvals Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Color Approvals</h2>
                  <div className="space-y-4">
                    {pdfContent.colorApprovals.map((approval, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <strong>{approval.room}</strong>
                            <p className="text-gray-600">{approval.colorName}</p>
                          </div>
                          <input type="checkbox" checked={approval.approved} readOnly className="h-4 w-4" />
                        </div>
                        {approval.signatureRequired && (
                          <div className="border-t pt-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Client Approval:</span>
                              <span className="text-sm text-gray-600">Date:</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <div className="border-b border-gray-400 w-48"></div>
                              <div className="border-b border-gray-400 w-24"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Terms and Conditions</h2>
                  <div className="space-y-3 text-sm">
                    <div><strong>Warranty:</strong> {pdfContent.termsAndConditions.warranty}</div>
                    <div><strong>Materials:</strong> {pdfContent.termsAndConditions.materials}</div>
                    <div><strong>Scheduling:</strong> {pdfContent.termsAndConditions.scheduling}</div>
                    <div><strong>Changes:</strong> {pdfContent.termsAndConditions.changes}</div>
                  </div>
                </div>

                {/* Company Info */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Company Information</h2>
                  <div className="space-y-2 text-sm">
                    <div><strong>Business:</strong> {pdfContent.companyInfo.businessName}</div>
                    <div><strong>Contact:</strong> {pdfContent.companyInfo.contactInfo}</div>
                    <div><strong>License:</strong> {pdfContent.companyInfo.license}</div>
                    <div><strong>Insurance:</strong> {pdfContent.companyInfo.insurance}</div>
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
