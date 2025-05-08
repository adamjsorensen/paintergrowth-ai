import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExtractedField {
  name: string;
  value: string | string[] | number | boolean;
  confidence: number;
  formField?: string;
}

interface InformationExtractionResultProps {
  extractedData: Record<string, any>;
  onAccept: () => void;
  onEdit: () => void;
}

const InformationExtractionResult: React.FC<InformationExtractionResultProps> = ({
  extractedData,
  onAccept,
  onEdit
}) => {
  // Group extracted fields by category
  const groupedFields: Record<string, ExtractedField[]> = {
    client: [],
    project: [],
    scope: [],
    other: []
  };
  
  // Process and group the extracted fields
  if (extractedData.fields && Array.isArray(extractedData.fields)) {
    extractedData.fields.forEach((field: ExtractedField) => {
      if (field.formField?.startsWith('client')) {
        groupedFields.client.push(field);
      } else if (field.formField?.startsWith('project')) {
        groupedFields.project.push(field);
      } else if (field.formField?.startsWith('scope')) {
        groupedFields.scope.push(field);
      } else {
        groupedFields.other.push(field);
      }
    });
  }
  
  // Format field value for display
  const formatValue = (value: string | string[] | number | boolean): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    } else if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    } else {
      return String(value);
    }
  };
  
  // Get confidence level badge variant
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return "default";
    } else if (confidence >= 0.5) {
      return "secondary";
    } else {
      return "outline";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Extracted Information</CardTitle>
        <CardDescription>
          Review the information extracted from your audio or transcript
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Client Information */}
        {groupedFields.client.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Client Information</h3>
            <div className="space-y-3">
              {groupedFields.client.map((field, index) => (
                <div key={index} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <p className="font-medium">{field.name}</p>
                    <p className="text-sm text-muted-foreground">{formatValue(field.value)}</p>
                  </div>
                  <Badge variant={getConfidenceBadge(field.confidence)}>
                    {Math.round(field.confidence * 100)}% confident
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Project Details */}
        {groupedFields.project.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Project Details</h3>
            <div className="space-y-3">
              {groupedFields.project.map((field, index) => (
                <div key={index} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <p className="font-medium">{field.name}</p>
                    <p className="text-sm text-muted-foreground">{formatValue(field.value)}</p>
                  </div>
                  <Badge variant={getConfidenceBadge(field.confidence)}>
                    {Math.round(field.confidence * 100)}% confident
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Scope of Work */}
        {groupedFields.scope.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Scope of Work</h3>
            <div className="space-y-3">
              {groupedFields.scope.map((field, index) => (
                <div key={index} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <p className="font-medium">{field.name}</p>
                    <p className="text-sm text-muted-foreground">{formatValue(field.value)}</p>
                  </div>
                  <Badge variant={getConfidenceBadge(field.confidence)}>
                    {Math.round(field.confidence * 100)}% confident
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Other Information */}
        {groupedFields.other.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Other Information</h3>
            <div className="space-y-3">
              {groupedFields.other.map((field, index) => (
                <div key={index} className="flex justify-between items-start border-b pb-2">
                  <div>
                    <p className="font-medium">{field.name}</p>
                    <p className="text-sm text-muted-foreground">{formatValue(field.value)}</p>
                  </div>
                  <Badge variant={getConfidenceBadge(field.confidence)}>
                    {Math.round(field.confidence * 100)}% confident
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* No data message */}
        {Object.values(groupedFields).every(group => group.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No information extracted</h3>
            <p className="text-sm text-muted-foreground">
              We couldn't extract any information from your transcript. Please try again or enter the information manually.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onEdit}>
          Edit Manually
        </Button>
        <Button onClick={onAccept}>
          <Check className="mr-2 h-4 w-4" />
          Use This Information
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InformationExtractionResult;