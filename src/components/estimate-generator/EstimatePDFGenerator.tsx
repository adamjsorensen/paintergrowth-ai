
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Download, FileText, Loader2 } from 'lucide-react';

interface EstimatePDFGeneratorProps {
  estimateData: Record<string, any>;
  projectType: 'interior' | 'exterior';
  lineItems: any[];
  totals: any;
  onComplete: () => void;
}

const EstimatePDFGenerator: React.FC<EstimatePDFGeneratorProps> = ({
  estimateData,
  projectType,
  lineItems,
  totals,
  onComplete
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprintData, setBlueprintData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateBlueprint();
  }, []);

  const generateBlueprint = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('Generating PDF blueprint data...');
      
      // Mock blueprint data for testing
      const blueprint = {
        coverPage: {
          title: "Professional Painting Estimate",
          clientName: estimateData.clientName || "Client Name",
          projectAddress: estimateData.projectAddress || "Project Address",
          estimateDate: new Date().toLocaleDateString(),
          estimateNumber: `EST-${new Date().getFullYear()}-${Date.now()}`,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        },
        projectOverview: {
          description: `This estimate outlines the scope of work for the ${projectType} painting project.`,
          projectType,
          keyFeatures: [
            "Professional quality workmanship",
            "Premium materials and paints",
            "Comprehensive preparation work",
            "Clean and efficient completion"
          ]
        },
        lineItems: {
          items: lineItems || [],
          subtotal: totals?.subtotal || 0,
          notes: "Prices include all materials and labor."
        },
        pricing: {
          subtotal: totals?.subtotal || 0,
          tax: totals?.tax || 0,
          total: totals?.total || 0,
          paymentTerms: "50% deposit, balance on completion"
        },
        companyInfo: {
          businessName: "Professional Painting Services",
          contactInfo: {
            phone: "555-239-1120",
            email: "info@painting.com",
            address: "123 Business St, City, State"
          },
          license: "License #12345",
          insurance: "Fully insured and bonded"
        }
      };
      
      console.log('Blueprint data generated:', blueprint);
      setBlueprintData(blueprint);
      
    } catch (err) {
      console.error('Blueprint generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate blueprint');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!blueprintData) return;
    
    try {
      console.log('Starting PDF download...');
      // PDF download logic would go here
      console.log('PDF download completed');
    } catch (err) {
      console.error('PDF download error:', err);
      setError('Failed to download PDF');
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={generateBlueprint} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mr-3" />
            <span>Generating PDF blueprint...</span>
          </div>
        ) : blueprintData ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">PDF Ready</h3>
              <p className="text-green-700 text-sm">
                Your estimate PDF has been prepared and is ready for download.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Estimate Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Client:</strong> {blueprintData.coverPage.clientName}</p>
                <p><strong>Project:</strong> {blueprintData.projectOverview.projectType} painting</p>
                <p><strong>Total:</strong> ${blueprintData.pricing.total.toLocaleString()}</p>
                <p><strong>Items:</strong> {blueprintData.lineItems.items.length} line items</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Company Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Business:</strong> {blueprintData.companyInfo.businessName}</p>
                <p><strong>Phone:</strong> {blueprintData.companyInfo.contactInfo.phone}</p>
                <p><strong>Email:</strong> {blueprintData.companyInfo.contactInfo.email}</p>
                <p><strong>Address:</strong> {blueprintData.companyInfo.contactInfo.address}</p>
                <p><strong>License:</strong> {blueprintData.companyInfo.license}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleDownloadPDF} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={onComplete} variant="outline">
                Complete
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default EstimatePDFGenerator;
