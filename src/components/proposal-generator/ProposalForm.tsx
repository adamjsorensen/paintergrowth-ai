
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { FieldConfig } from "@/types/prompt-templates";
import FormFieldRenderer from "./FormFieldRenderer";

type FieldValue = string | number | boolean;

interface ProposalFormProps {
  fields: FieldConfig[];
  isGenerating: boolean;
  onGenerate: (fieldValues: Record<string, FieldValue>) => void;
  templateName: string;
}

const ProposalForm = ({ fields, isGenerating, onGenerate, templateName }: ProposalFormProps) => {
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>({});

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = () => {
    onGenerate(fieldValues);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">{templateName}</h2>
      <div className="space-y-6">
        {fields
          .sort((a, b) => a.order - b.order)
          .map((field) => (
            <FormFieldRenderer
              key={field.id}
              field={field}
              value={fieldValues[field.id] ?? ""}
              onChange={(value) => handleFieldChange(field.id, value)}
            />
          ))}

        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : "Generate Proposal"}
        </Button>
      </div>
    </div>
  );
};

export default ProposalForm;
