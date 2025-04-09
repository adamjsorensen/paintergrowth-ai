
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldConfig } from "@/types/prompt-templates";
import FieldRenderer from "../preview-fields/FieldRenderer";

interface FormPreviewProps {
  fields: FieldConfig[];
  values: Record<string, any>;
  onValueChange: (fieldId: string, value: any) => void;
  onGeneratePreview: () => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({ 
  fields, 
  values, 
  onValueChange, 
  onGeneratePreview 
}) => {
  // Sort fields by order and divide them into basic and advanced categories
  const basicFields = fields
    .filter(field => field.complexity === 'basic')
    .sort((a, b) => a.order - b.order);
    
  const advancedFields = fields
    .filter(field => field.complexity === 'advanced')
    .sort((a, b) => a.order - b.order);

  return (
    <div>
      <h3 className="font-semibold mb-4">Form Preview</h3>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Essential Fields</h4>
            {basicFields.map((field) => (
              <div key={field.id}>
                <FieldRenderer
                  field={field}
                  value={values[field.id]}
                  onChange={(value) => onValueChange(field.id, value)}
                />
              </div>
            ))}
          </div>
          
          {advancedFields.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-muted-foreground">Advanced Fields</h4>
              {advancedFields.map((field) => (
                <div key={field.id}>
                  <FieldRenderer
                    field={field}
                    value={values[field.id]}
                    onChange={(value) => onValueChange(field.id, value)}
                  />
                </div>
              ))}
            </div>
          )}
          
          <Button className="w-full mt-4" onClick={onGeneratePreview}>
            Preview System Prompt
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormPreview;
