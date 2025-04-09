
import { CardContent } from "@/components/ui/card";
import { FieldConfig } from "@/types/prompt-templates";
import FormSection from "../FormSection";
import FormFieldRenderer from "../FormFieldRenderer";
import { FORM_SECTIONS } from "../constants/formSections";

interface EnhancedFieldConfig extends FieldConfig {
  value: string | number | boolean | string[];
  onChange: (value: any) => void;
}

interface ProposalFormContentProps {
  fieldsBySection: Record<string, EnhancedFieldConfig[]>;
}

const ProposalFormContent = ({ fieldsBySection }: ProposalFormContentProps) => {
  const getFieldClass = (fieldId: string) => {
    if (['specialNotes', 'projectAddress', 'colorPalette'].includes(fieldId)) {
      return 'col-span-2';
    }
    return 'col-span-2 sm:col-span-1';
  };

  return (
    <CardContent className="p-6">
      {Object.entries(fieldsBySection).map(([sectionId, sectionFields]) => {
        if (sectionFields.length === 0) return null;
        
        const section = FORM_SECTIONS.find(s => s.id === sectionId);
        const isClientInfoSection = sectionId === 'client';
        
        return (
          <FormSection 
            key={sectionId} 
            title={section?.title || "Additional Information"} 
            icon={section?.icon}
            defaultOpen={isClientInfoSection}
          >
            <div className="grid grid-cols-2 gap-6">
              {sectionFields.map((field) => (
                <div key={field.id} className={getFieldClass(field.id)}>
                  <FormFieldRenderer
                    field={field}
                    value={field.value}
                    onChange={field.onChange}
                    isAdvanced={field.complexity === 'advanced'}
                  />
                </div>
              ))}
            </div>
          </FormSection>
        );
      })}
    </CardContent>
  );
};

export default ProposalFormContent;
