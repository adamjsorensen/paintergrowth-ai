import { CardContent } from "@/components/ui/card";
import { FieldConfig } from "@/types/prompt-templates";
import FormSection from "../FormSection";
import FormFieldRenderer from "../FormFieldRenderer";
import { FORM_SECTIONS } from "../constants/formSections";
import { useMemo } from "react";

interface EnhancedFieldConfig extends FieldConfig {
  value: string | number | boolean | string[] | any[];
  onChange: (value: any) => void;
}

interface ProposalFormContentProps {
  fieldsBySection: Record<string, EnhancedFieldConfig[]>;
}

const ProposalFormContent = ({ fieldsBySection }: ProposalFormContentProps) => {
  // Calculate subtotal from quote table for tax calculator
  const subtotal = useMemo(() => {
    let total = 0;

    Object.values(fieldsBySection).flat().forEach((field) => {
      if (field.type === 'quote-table' && Array.isArray(field.value)) {
        total += field.value.reduce((sum, item) => {
          if (!item || typeof item !== 'object') return sum;
          
          const price = typeof item.price === 'string' 
            ? parseFloat(item.price) || 0 
            : typeof item.price === 'number'
              ? item.price
              : 0;
              
          return sum + price;
        }, 0);
      }
    });

    return total;
  }, [fieldsBySection]);

  const getFieldClass = (fieldId: string, type: string) => {
    if (['specialNotes', 'projectAddress', 'colorPalette'].includes(fieldId)) {
      return 'col-span-2';
    }
    
    // Make table fields full width
    if (['quote-table', 'upsell-table', 'tax-calculator'].includes(type)) {
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
                <div key={field.id} className={getFieldClass(field.id, field.type)}>
                  <FormFieldRenderer
                    field={field}
                    value={field.value}
                    onChange={field.onChange}
                    isAdvanced={field.complexity === 'advanced'}
                    subtotal={field.type === 'tax-calculator' ? subtotal : undefined}
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
