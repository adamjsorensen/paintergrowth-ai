
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Loader2 } from 'lucide-react';
import { useCompanyProfile } from '@/hooks/useCompanyProfile';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '@supabase/auth-helpers-react';

interface BlueprintData {
  coverPage: {
    title: string;
    clientName: string;
    projectAddress: string;
    estimateDate: string;
    estimateNumber: string;
    validUntil: string;
  };
  projectOverview: {
    description: string;
    projectType: string;
    totalRooms: number;
    keyFeatures: string[];
  };
  scopeOfWork: {
    preparation: string[];
    painting: string[];
    cleanup: string[];
    timeline: string;
  };
  lineItems: {
    items: any[];
    subtotal: number;
    notes: string;
  };
  addOns: {
    available: any[];
    recommended: string[];
    pricing: string;
  };
  pricing: {
    subtotal: number;
    tax: number;
    total: number;
    paymentTerms: string;
  };
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
  signatures: {
    contractorSignature: string;
    clientSignature: string;
    acceptanceText: string;
  };
}

interface EstimatePDFGeneratorProps {
  estimateData: Record<string, any>;
  projectType: 'interior' | 'exterior';
  lineItems: any[];
  totals: Record<string, any>;
  onComplete: () => void;
}

const EstimatePDFGenerator: React.FC<EstimatePDFGeneratorProps> = ({
  estimateData,
  projectType,
  lineItems,
  totals,
  onComplete
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: companyProfile } = useCompanyProfile(user?.id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprintData, setBlueprintData] = useState<BlueprintData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate blueprint data when component mounts
  useEffect(() => {
    generateBlueprintData();
  }, []);

  const generateBlueprintData = async () => {
    setIsGenerating(true);
    setError(null);
    
    console.log('Generating PDF blueprint data...');

    try {
      // Prepare enhanced data payload
      const enhancedPayload = {
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
        purpose: 'pdf_generation'
      };

      const { data, error: functionError } = await supabase.functions.invoke('generate-estimate-content', {
        body: enhancedPayload
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data) {
        throw new Error('No blueprint data generated');
      }

      console.log('Blueprint data generated:', data);
      setBlueprintData(data);
      
      toast({
        title: "Blueprint Generated",
        description: "Your professional estimate blueprint is ready for download.",
      });

    } catch (err) {
      console.error('Error generating blueprint data:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate blueprint data');
      
      toast({
        title: "Generation Failed",
        description: "Failed to generate estimate blueprint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    if (!blueprintData) return;

    setIsGenerating(true);
    
    try {
      const element = document.getElementById('blueprint-preview');
      if (!element) {
        throw new Error('Blueprint preview element not found');
      }

      // Generate canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
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
      
      // Generate filename
      const clientName = blueprintData.coverPage.clientName.replace(/[^a-zA-Z0-9]/g, '_');
      const date = new Date().toISOString().split('T')[0];
      const filename = `${clientName}_Estimate_${date}.pdf`;
      
      // Download PDF
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
            Professional Estimate Blueprint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isGenerating && !blueprintData && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">Generating professional blueprint...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Blueprint Generation Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <div className="mt-3">
                    <Button 
                      onClick={generateBlueprintData}
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

          {blueprintData && (
            <>
              {/* Blueprint Preview */}
              <div id="blueprint-preview" className="bg-white p-8 border rounded-lg shadow-sm space-y-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
                {/* Cover Page */}
                <div className="text-center border-b pb-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{blueprintData.coverPage.title}</h1>
                  <div className="text-lg text-gray-600 space-y-1">
                    <p><strong>Client:</strong> {blueprintData.coverPage.clientName}</p>
                    <p><strong>Project Address:</strong> {blueprintData.coverPage.projectAddress}</p>
                    <p><strong>Estimate Date:</strong> {blueprintData.coverPage.estimateDate}</p>
                    <p><strong>Estimate #:</strong> {blueprintData.coverPage.estimateNumber}</p>
                    <p><strong>Valid Until:</strong> {blueprintData.coverPage.validUntil}</p>
                  </div>
                </div>

                {/* Project Overview */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Project Overview</h2>
                  <p className="text-gray-700 mb-3">{blueprintData.projectOverview.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Project Type:</strong> {blueprintData.projectOverview.projectType}</div>
                    <div><strong>Total Rooms:</strong> {blueprintData.projectOverview.totalRooms}</div>
                  </div>
                  <div className="mt-3">
                    <strong>Key Features:</strong>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      {blueprintData.projectOverview.keyFeatures.map((feature, index) => (
                        <li key={index} className="text-gray-700">{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Scope of Work */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Scope of Work</h2>
                  <div className="grid gap-4">
                    <div>
                      <strong>Preparation:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {blueprintData.scopeOfWork.preparation.map((item, index) => (
                          <li key={index} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Painting:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {blueprintData.scopeOfWork.painting.map((item, index) => (
                          <li key={index} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Cleanup:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1">
                        {blueprintData.scopeOfWork.cleanup.map((item, index) => (
                          <li key={index} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Timeline:</strong> {blueprintData.scopeOfWork.timeline}
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Line Items</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-left">Description</th>
                          <th className="border border-gray-300 px-3 py-2 text-right">Qty</th>
                          <th className="border border-gray-300 px-3 py-2 text-right">Unit Price</th>
                          <th className="border border-gray-300 px-3 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blueprintData.lineItems.items.map((item, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-3 py-2">{item.description}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right">{item.quantity}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{blueprintData.lineItems.notes}</div>
                </div>

                {/* Pricing Summary */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Pricing Summary</h2>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(blueprintData.pricing.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(blueprintData.pricing.tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(blueprintData.pricing.total)}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <strong>Payment Terms:</strong> {blueprintData.pricing.paymentTerms}
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Terms and Conditions</h2>
                  <div className="space-y-3 text-sm">
                    <div><strong>Warranty:</strong> {blueprintData.termsAndConditions.warranty}</div>
                    <div><strong>Materials:</strong> {blueprintData.termsAndConditions.materials}</div>
                    <div><strong>Scheduling:</strong> {blueprintData.termsAndConditions.scheduling}</div>
                    <div><strong>Changes:</strong> {blueprintData.termsAndConditions.changes}</div>
                  </div>
                </div>

                {/* Company Info */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Company Information</h2>
                  <div className="space-y-2 text-sm">
                    <div><strong>Business:</strong> {blueprintData.companyInfo.businessName}</div>
                    <div><strong>Contact:</strong> {blueprintData.companyInfo.contactInfo}</div>
                    <div><strong>License:</strong> {blueprintData.companyInfo.license}</div>
                    <div><strong>Insurance:</strong> {blueprintData.companyInfo.insurance}</div>
                  </div>
                </div>

                {/* Signatures */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-1">Acceptance</h2>
                  <p className="text-sm text-gray-700 mb-4">{blueprintData.signatures.acceptanceText}</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="border-b border-gray-400 pb-1 mb-2">Contractor Signature</div>
                      <div className="text-sm text-gray-600">Date: _______________</div>
                    </div>
                    <div>
                      <div className="border-b border-gray-400 pb-1 mb-2">Client Signature</div>
                      <div className="text-sm text-gray-600">Date: _______________</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button onClick={generateBlueprintData} variant="outline" disabled={isGenerating}>
                  Regenerate Blueprint
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

export default EstimatePDFGenerator;

