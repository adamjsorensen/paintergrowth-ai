import React, { useState, useEffect } from "react";
import ModeToggle from "@/components/proposal-generator/ModeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProposalFormHeader from "@/components/proposal-generator/components/ProposalFormHeader";
import ProposalFormContent from "@/components/proposal-generator/components/ProposalFormContent";
import { FieldConfig } from "@/types/prompt-templates";
import { useProposalForm } from "@/components/proposal-generator/hooks/useProposalForm";
import ProposalBuilderModal from "@/components/proposal-generator/ProposalBuilderModal";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronRight, Settings2, FileText } from "lucide-react";
import { useGroupedPromptFields, hasModalFields } from "@/hooks/prompt-fields/useGroupedPromptFields";
import { useStylePreferences } from "@/context/StylePreferencesContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ProposalBoilerplateToggles from "@/components/proposal-generator/ProposalBoilerplateToggles";
import ProposalFormActions from "@/components/proposal-generator/ProposalFormActions";
import { sections } from "@/components/proposal-generator/constants/formSections";
import { useToast } from "@/hooks/use-toast";

interface ProposalFormProps {
  fields: FieldConfig[];
  isGenerating: boolean;
  onGenerate: (fieldValues: Record<string, any>, proposalId: string) => Promise<void>;
  templateName?: string;
  projectType?: "interior" | "exterior";
}

const ProposalForm: React.FC<ProposalFormProps> = ({
  fields,
  isGenerating,
  onGenerate,
  templateName = "Proposal Generator",
  projectType = "interior"
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const groupedFields = useGroupedPromptFields(fields);
  const { toast } = useToast();

  const {
    fieldValues,
    formMode,
    setFormMode,
    getVisibleFields,
    handleFieldChange,
    handleSubmit,
    checkRequiredModalFields,
    modalStepCompleted,
    hasAdvancedFields
  } = useProposalForm(fields, isGenerating, onGenerate);

  const visibleFields = getVisibleFields();

  const projectFields = visibleFields.filter(
    field => !field.modalStep || field.modalStep === 'main'
  );

  const hasModalFieldsValue = hasModalFields(groupedFields);

  const submitForm = async () => {
    await handleSubmit();
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const { hasSetPreferences } = useStylePreferences();

  useEffect(() => {
    if (hasSetPreferences) {
      setIsModalOpen(true);
    }
  }, [hasSetPreferences]);

  const [includeBoilerplate, setIncludeBoilerplate] = useState(false);
  const [includeTerms, setIncludeTerms] = useState(true);
  const [includeWarranty, setIncludeWarranty] = useState(true);

  useEffect(() => {
    handleFieldChange('includeBoilerplate', includeBoilerplate);
    handleFieldChange('includeTerms', includeTerms);
    handleFieldChange('includeWarranty', includeWarranty);
    handleFieldChange('locale', 'en-US');
  }, [includeBoilerplate, includeTerms, includeWarranty]);

  const handleModalComplete = async (): Promise<void> => {
    setIsModalOpen(false);
    return Promise.resolve();
  };

  const [currentTab, setCurrentTab] = useState(() => {
    const firstSection = sections.find(section => 
      fields.some(field => field.sectionId === section.id)
    );
    return firstSection?.id || sections[0]?.id;
  });

  const visibleSections = sections.filter(section =>
    fields.some(field => field.sectionId === section.id)
  );

  const currentTabIndex = visibleSections.findIndex(section => section.id === currentTab);
  const isLastTab = currentTabIndex === visibleSections.length - 1;

  const handleNext = () => {
    const nextSection = visibleSections[currentTabIndex + 1];
    if (nextSection) {
      setCurrentTab(nextSection.id);
    }
  };

  const handlePrevious = () => {
    const prevSection = visibleSections[currentTabIndex - 1];
    if (prevSection) {
      setCurrentTab(prevSection.id);
    }
  };

  const isFirstTab = currentTabIndex === 0;

  // Handle extracted information from transcript
  const handleInformationExtracted = (extractedData: Record<string, any>) => {
    if (!extractedData || !extractedData.fields) {
      toast({
        title: "No data extracted",
        description: "We couldn't extract any information from your transcript",
        variant: "destructive",
      });
      return;
    }
    
    // Map extracted fields to form fields
    extractedData.fields.forEach((field: any) => {
      if (field.formField && field.value) {
        handleFieldChange(field.formField, field.value);
      }
    });
    
    toast({
      title: "Form pre-filled",
      description: "Information from your transcript has been added to the form",
    });
  };

  return (
    <Card className="border border-gray-200 shadow-md rounded-xl overflow-hidden">
      <ProposalFormHeader 
        templateName={templateName}
        projectType={projectType}
        mode={hasAdvancedFields() ? formMode : undefined}
        onModeChange={hasAdvancedFields() ? setFormMode : undefined}
        visibleFieldCount={visibleFields.length}
        totalFieldCount={hasAdvancedFields() ? fields.length : undefined}
        onReopenModal={hasModalFieldsValue ? openModal : undefined}
      />
      
      <div className="p-6 sm:p-8">
        <ProposalFormContent
          fields={projectFields}
          values={fieldValues}
          onValueChange={handleFieldChange}
          currentTab={currentTab}
          onTabChange={setCurrentTab}
        />
        
        <ProposalBoilerplateToggles
          includeBoilerplate={includeBoilerplate}
          setIncludeBoilerplate={setIncludeBoilerplate}
          includeTerms={includeTerms}
          setIncludeTerms={setIncludeTerms}
          includeWarranty={includeWarranty}
          setIncludeWarranty={setIncludeWarranty}
        />

        <ProposalFormActions
          hasModalFields={hasModalFieldsValue}
          isModalOpen={isModalOpen}
          openModal={openModal}
          submitForm={submitForm}
          isGenerating={isGenerating}
          currentTab={currentTab}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isLastTab={isLastTab}
          isFirstTab={isFirstTab}
          onInformationExtracted={handleInformationExtracted}
        />
      </div>
      
      {hasModalFieldsValue && (
        <ProposalBuilderModal
          isOpen={isModalOpen}
          onClose={closeModal}
          fields={fields}
          values={fieldValues}
          onValueChange={handleFieldChange}
          onSubmit={handleModalComplete}
          checkRequiredFields={checkRequiredModalFields}
          stepCompleted={modalStepCompleted}
        />
      )}
    </Card>
  );
}

export default ProposalForm;