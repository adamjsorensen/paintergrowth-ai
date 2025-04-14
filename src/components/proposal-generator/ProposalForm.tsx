
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FieldConfig } from "@/types/prompt-templates";
import { useProposalForm } from "./hooks/useProposalForm";
import ProposalFormHeader from "./components/ProposalFormHeader";
import ProposalFormContent from "./components/ProposalFormContent";
import { FORM_SECTIONS } from "./constants/formSections";

type FieldValue = string | number | boolean | string[];

// Add the EnhancedFieldConfig type that combines FieldConfig with additional properties
interface EnhancedFieldConfig extends FieldConfig {
  value: FieldValue;
  onChange: (value: FieldValue) => void;
}

interface ProposalFormProps {
  fields: FieldConfig[];
  isGenerating: boolean;
  onGenerate: (fieldValues: Record<string, FieldValue>, proposalId: string) => Promise<void>;
  templateName: string;
}

const ProposalForm = ({ fields, isGenerating, onGenerate, templateName }: ProposalFormProps) => {
  const {
    fieldValues,
    formMode,
    setFormMode,
    getVisibleFields,
    handleFieldChange,
    handleSubmit
  } = useProposalForm(fields, isGenerating, onGenerate);

  const visibleFields = getVisibleFields();

  const getFieldsBySection = () => {
    const result: Record<string, EnhancedFieldConfig[]> = {};
    
    // Initialize empty sections
    FORM_SECTIONS.forEach(section => {
      result[section.id] = [];
    });
    
    // Group fields by sectionId
    visibleFields.forEach(field => {
      const sectionId = field.sectionId || 'additional';
      
      if (result[sectionId]) {
        result[sectionId].push({
          ...field,
          value: fieldValues[field.id] ?? (
            field.type === 'checkbox-group' || field.type === 'multi-select' || field.type === 'file-upload' 
              ? [] 
              : field.type === 'toggle' 
                ? false 
                : ""
          ),
          onChange: (value: FieldValue) => handleFieldChange(field.id, value)
        });
      } else {
        // If sectionId doesn't match any predefined section, put in 'additional'
        result['additional'] = result['additional'] || [];
        result['additional'].push({
          ...field,
          value: fieldValues[field.id] ?? (
            field.type === 'checkbox-group' || field.type === 'multi-select' || field.type === 'file-upload' 
              ? [] 
              : field.type === 'toggle' 
                ? false 
                : ""
          ),
          onChange: (value: FieldValue) => handleFieldChange(field.id, value)
        });
      }
    });
    
    // Sort fields within each section by order
    Object.keys(result).forEach(sectionId => {
      result[sectionId].sort((a, b) => a.order - b.order);
    });
    
    return result;
  };

  const fieldsBySection = getFieldsBySection();

  return (
    <Card className="border-none shadow-md">
      <ProposalFormHeader 
        templateName={templateName}
        mode={formMode}
        onModeChange={setFormMode}
        visibleFieldCount={visibleFields.length}
        totalFieldCount={fields.length}
      />
      
      <ProposalFormContent fieldsBySection={fieldsBySection} />

      <div className="p-6 pt-2">
        <Button 
          className="w-full py-6 text-base bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white" 
          onClick={handleSubmit}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : "Generate Proposal"}
        </Button>
      </div>
    </Card>
  );
};

export default ProposalForm;
