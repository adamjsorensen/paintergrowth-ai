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
