
import React, { useState } from "react";
import ModeToggle from "@/components/proposal-generator/ModeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProposalFormHeader from "@/components/proposal-generator/components/ProposalFormHeader";
import ProposalFormContent from "@/components/proposal-generator/components/ProposalFormContent";
import { FieldConfig } from "@/types/prompt-templates";
import { useProposalForm } from "@/components/proposal-generator/hooks/useProposalForm";
import ProposalBuilderModal from "@/components/proposal-generator/ProposalBuilderModal";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronRight, Settings2 } from "lucide-react";
import { useGroupedPromptFields, hasModalFields } from "@/hooks/prompt-fields/useGroupedPromptFields";

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
    modalStepCompleted
  } = useProposalForm(fields, isGenerating, onGenerate);
  
  const visibleFields = getVisibleFields();
  
  // Filter fields that should appear in the main form (not in modal)
  const projectFields = visibleFields.filter(
    field => !field.modalStep || field.modalStep === 'main'
  );
  
  const hasModalFieldsValue = hasModalFields(groupedFields);
  
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
    <Card className="border border-gray-200 shadow-md rounded-xl overflow-hidden">
      <ProposalFormHeader 
        templateName={templateName}
        projectType={projectType}
        mode={formMode}
        onModeChange={setFormMode}
        visibleFieldCount={visibleFields.length}
        totalFieldCount={fields.length}
        onReopenModal={hasModalFieldsValue ? openModal : undefined}
      />
      
      <div className="p-6 sm:p-8">
        <ProposalFormContent
          fields={projectFields}
          values={fieldValues}
          onValueChange={handleFieldChange}
        />
        
        <div className="mt-8 border-t pt-6 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
          {hasModalFieldsValue ? (
            <Button 
              onClick={openModal}
              className="sm:mr-auto flex items-center gap-2 w-full sm:w-auto justify-center"
              variant="outline"
              size="lg"
            >
              <Settings2 className="h-4 w-4" />
              <span>Style & Scope Options</span>
            </Button>
          ) : <div className="sm:mr-auto" />}
          
          <Button
            onClick={submitForm}
            disabled={isGenerating}
            size="lg"
            className={cn(
              "w-full sm:w-auto px-8 transition-all duration-300",
              "bg-blue-600 hover:bg-blue-700 text-white", 
              "shadow-md hover:shadow-lg",
              "flex items-center justify-center gap-2",
              "min-w-[200px]"
            )}
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Proposal</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
      
      {hasModalFieldsValue && (
        <ProposalBuilderModal
          isOpen={isModalOpen}
          onClose={closeModal}
          fields={fields}  // Pass all fields instead of separate arrays
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
