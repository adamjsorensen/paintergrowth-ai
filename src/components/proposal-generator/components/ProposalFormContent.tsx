
import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldConfig } from "@/types/prompt-templates";
import FormSection from "@/components/proposal-generator/FormSection";
import FormFieldRenderer from "@/components/proposal-generator/FormFieldRenderer";
import { sections } from "@/components/proposal-generator/constants/formSections";

interface ProposalFormContentProps {
  fields: FieldConfig[];
  values: Record<string, any>;
  onValueChange: (field: string, value: any) => void;
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

const ProposalFormContent = ({
  fields,
  values,
  onValueChange,
  currentTab,
  onTabChange,
}: ProposalFormContentProps) => {
  // Group fields by section
  const groupedFields = useMemo(() => {
    const grouped: Record<string, FieldConfig[]> = {};
    
    sections.forEach((section) => {
      grouped[section.id] = [];
    });
    
    fields.forEach((field) => {
      const sectionId = field.sectionId || 'meta';
      if (!grouped[sectionId]) {
        grouped[sectionId] = [];
      }
      grouped[sectionId].push(field);
    });
    
    return grouped;
  }, [fields]);
  
  const visibleSectionCount = useMemo(() => {
    return sections.filter(section => 
      groupedFields[section.id] && 
      groupedFields[section.id].length > 0
    ).length;
  }, [groupedFields]);

  const defaultTab = sections[0]?.id;
  
  return (
    <>
      {visibleSectionCount <= 1 ? (
        // If there's only one section, don't show tabs
        <div className="space-y-8">
          {sections.map((section) => {
            const sectionFields = groupedFields[section.id] || [];
            if (sectionFields.length === 0) return null;
            
            return (
              <FormSection 
                key={section.id} 
                title={section.label}
                description={section.description}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sectionFields.map((field) => (
                    <div 
                      key={field.id} 
                      className={['scope-of-work', 'quote-table', 'upsell-table', 'matrix-selector'].includes(field.type) ? 'md:col-span-2' : ''}
                    >
                      <FormFieldRenderer
                        field={field}
                        value={values[field.name]}
                        onChange={(value) => onValueChange(field.name, value)}
                        isAdvanced={field.complexity === 'advanced'}
                      />
                    </div>
                  ))}
                </div>
              </FormSection>
            );
          })}
        </div>
      ) : (
        <Tabs 
          value={currentTab || defaultTab} 
          onValueChange={onTabChange}
          className="w-full"
        >
          <TabsList className="mb-6 grid w-full" style={{ 
            gridTemplateColumns: `repeat(${visibleSectionCount}, minmax(0, 1fr))` 
          }}>
            {sections.map((section) => {
              const sectionFields = groupedFields[section.id] || [];
              if (sectionFields.length === 0) return null;
              
              return (
                <TabsTrigger key={section.id} value={section.id}>
                  {section.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {sections.map((section) => {
            const sectionFields = groupedFields[section.id] || [];
            if (sectionFields.length === 0) return null;
            
            return (
              <TabsContent key={section.id} value={section.id} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sectionFields.map((field) => (
                    <div 
                      key={field.id} 
                      className={['scope-of-work', 'quote-table', 'upsell-table', 'matrix-selector'].includes(field.type) ? 'md:col-span-2' : ''}
                    >
                      <FormFieldRenderer
                        field={field}
                        value={values[field.name]}
                        onChange={(value) => onValueChange(field.name, value)}
                        isAdvanced={field.complexity === 'advanced'}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </>
  );
};

export default ProposalFormContent;
