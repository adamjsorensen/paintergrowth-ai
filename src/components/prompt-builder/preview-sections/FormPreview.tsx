
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
  return (
    <div>
      <h3 className="font-semibold mb-4">Form Preview</h3>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id}>
                <FieldRenderer
                  field={field}
                  value={values[field.id]}
                  onChange={(value) => onValueChange(field.id, value)}
                />
              </div>
            ))
          }
          
          <Button className="w-full mt-4" onClick={onGeneratePreview}>
            Preview System Prompt
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormPreview;
