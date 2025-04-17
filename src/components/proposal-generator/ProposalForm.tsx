
import React, { useState } from "react";
import ModeToggle from "@/components/proposal-generator/ModeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProposalFormHeader from "@/components/proposal-generator/components/ProposalFormHeader";
import ProposalFormContent from "@/components/proposal-generator/components/ProposalFormContent";
import { FieldConfig } from "@/types/prompt-templates";
import { useProposalForm } from "@/components/proposal-generator/hooks/useProposalForm";
import ProposalBuilderModal from "@/components/proposal-generator/ProposalBuilderModal";

interface ProposalFormProps {
  fields: FieldConfig[];
  isGenerating: boolean;
  onGenerate: (fieldValues: Record<string, any>, proposalId: string) => Promise<void>;
  templateName?: string;
  projectType?: string;
}

const ProposalForm: React.FC<ProposalFormProps> = ({
  fields,
  isGenerating,
  onGenerate,
  templateName = "Proposal Generator",
  projectType = "interior"
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    fieldValues,
    formMode,
    setFormMode,
    getVisibleFields,
    handleFieldChange,
    handleSubmit,
    checkRequiredModalFields,
    modalStepCompleted
  } = useProposalForm(fields, isGenerating, onGenerate);
  
  const visibleFields = getVisibleFields();
  
  const projectFields = visibleFields.filter(
    field => !['style', 'scope'].includes(field.modalStep || '')
  );
  
  const styleFields = visibleFields.filter(
    field => field.modalStep === 'style'
  );
  
  const scopeFields = visibleFields.filter(
    field => field.modalStep === 'scope'
  );
  
  const hasModalFields = styleFields.length > 0 || scopeFields.length > 0;
  
  const submitForm = async () => {
    // Regular form submission without modal
    await handleSubmit();
  };
  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  return (
    <Card className="border shadow-sm">
      <ProposalFormHeader 
        formTitle={templateName}
        projectType={projectType}
      />
      
      <div className="flex items-center justify-between px-6 py-2 border-b">
        <ModeToggle
          basic={formMode === 'basic'}
          onChange={(mode) => setFormMode(mode)}
        />
      </div>
      
      <div className="p-6">
        <ProposalFormContent
          fields={projectFields}
          values={fieldValues}
          onValueChange={handleFieldChange}
        />
        
        <div className="mt-6 flex justify-end gap-4">
          {hasModalFields ? (
            <Button 
              onClick={openModal}
              className="mr-auto"
              variant="outline"
            >
              Style & Scope Options
            </Button>
          ) : null}
          
          <Button
            onClick={submitForm}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Proposal"}
          </Button>
        </div>
      </div>
      
      {hasModalFields && (
        <ProposalBuilderModal
          isOpen={isModalOpen}
          onClose={closeModal}
          styleFields={styleFields}
          scopeFields={scopeFields}
          values={fieldValues}
          onValueChange={handleFieldChange}
          onSubmit={handleSubmit}
          checkRequiredFields={checkRequiredModalFields}
          stepCompleted={modalStepCompleted}
        />
      )}
    </Card>
  );
};

export default ProposalForm;
