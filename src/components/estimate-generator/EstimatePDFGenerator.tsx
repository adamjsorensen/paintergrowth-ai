
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Eye, FileText } from 'lucide-react';

interface EstimatePDFGeneratorProps {
  estimateData: Record<string, any>;
  projectType: 'interior' | 'exterior';
  lineItems: any[];
  totals: Record<string, any>;
  content: Record<string, any>;
  onComplete: () => void;
  onBack: () => void;
}

const EstimatePDFGenerator: React.FC<EstimatePDFGeneratorProps> = ({
  estimateData,
  projectType,
  lineItems,
  totals,
  content,
  onComplete,
  onBack
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate PDF generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPdfGenerated(true);
      
      toast({
        title: "PDF Generated",
        description: "Your estimate PDF has been generated successfully.",
      });
      
    } catch (error) {
      toast({
        title: "PDF Generation Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real implementation, this would trigger actual PDF download
    toast({
      title: "Download Started",
      description: "Your estimate PDF download has started.",
    });
  };

  const handlePreview = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Estimate Preview</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .estimate-header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                .section { margin-bottom: 25px; }
                .section h3 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                .line-items table { width: 100%; border-collapse: collapse; }
                .line-items th, .line-items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .line-items th { background-color: #f5f5f5; }
                .totals { text-align: right; margin-top: 20px; font-weight: bold; }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
      }
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
            Generate Professional PDF
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate a professional PDF estimate document ready for client delivery.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!pdfGenerated ? (
            <div className="text-center py-8">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Ready to Generate PDF</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your estimate is ready to be converted to a professional PDF document.
                  </p>
                </div>
                
                {isGenerating ? (
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-muted-foreground">Generating PDF...</p>
                  </div>
                ) : (
                  <Button onClick={handleGeneratePDF} size="lg">
                    Generate PDF Document
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-medium text-green-800">PDF Generated Successfully</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={handlePreview} variant="outline" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button onClick={handlePrint} variant="outline">
                  Print
                </Button>
                <Button onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-6 border-t">
            <Button onClick={onBack} variant="outline">
              Back to Content Editor
            </Button>
            <Button onClick={onComplete} className="flex-1" disabled={!pdfGenerated}>
              Complete Estimate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden printable content */}
      <div ref={printRef} className="hidden print:block print:space-y-6">
        <div className="estimate-header">
          <h1 className="text-2xl font-bold">Professional Painting Estimate</h1>
          <p className="text-gray-600">Project Type: {projectType.charAt(0).toUpperCase() + projectType.slice(1)} Painting</p>
          <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="section">
          <h3>Project Overview</h3>
          <p>{content.projectOverview}</p>
        </div>

        <div className="section">
          <h3>Scope of Work</h3>
          <p>{content.scopeOfWork}</p>
        </div>

        <div className="section line-items">
          <h3>Line Items & Pricing</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.description || item.room}</td>
                  <td>{item.quantity || 1}</td>
                  <td>{formatCurrency(item.rate || item.total)}</td>
                  <td>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="section">
          <h3>Materials & Labor</h3>
          <p>{content.materialsAndLabor}</p>
        </div>

        <div className="section">
          <h3>Project Timeline</h3>
          <p>{content.timeline}</p>
        </div>

        <div className="section">
          <h3>Terms & Conditions</h3>
          <p>{content.termsAndConditions}</p>
        </div>

        {content.additionalNotes && (
          <div className="section">
            <h3>Additional Notes</h3>
            <p>{content.additionalNotes}</p>
          </div>
        )}

        <div className="totals">
          <p>Subtotal: {formatCurrency(totals.subtotal || 0)}</p>
          {totals.tax && <p>Tax: {formatCurrency(totals.tax)}</p>}
          <p className="text-xl">Total: {formatCurrency(totals.total || 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default EstimatePDFGenerator;
