
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldConfig } from "@/types/prompt-templates";
import FieldRenderer from "../preview-fields/FieldRenderer";
import ModeToggle from "@/components/proposal-generator/ModeToggle";

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
  const [formMode, setFormMode] = useState<'basic' | 'advanced'>('basic');
  
  // Filter fields based on current mode
  const getVisibleFields = () => {
    if (formMode === 'advanced') {
      return fields;
    } else {
      // In basic mode, show only basic fields and required fields regardless of complexity
      return fields.filter(field => field.complexity === 'basic' || field.required);
    }
  };

  const visibleFields = getVisibleFields();
  
  // Sort fields by order and divide them into basic and advanced categories
  const basicFields = visibleFields
    .filter(field => field.complexity === 'basic')
    .sort((a, b) => a.order - b.order);
    
  const advancedFields = visibleFields
    .filter(field => field.complexity === 'advanced')
    .sort((a, b) => a.order - b.order);

  // Count how many fields are displayed vs. total available
  const visibleFieldCount = visibleFields.length;
  const totalFieldCount = fields.length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Form Preview</h3>
        <ModeToggle mode={formMode} onModeChange={setFormMode} />
      </div>
      
      {formMode === 'basic' && totalFieldCount > visibleFieldCount && (
        <div className="mb-2 text-xs text-muted-foreground">
          Showing {visibleFieldCount} of {totalFieldCount} fields
        </div>
      )}
      
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
