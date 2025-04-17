
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FieldConfig } from "@/types/prompt-templates";
import { useProposalForm } from "./hooks/useProposalForm";
import ProposalFormHeader from "./components/ProposalFormHeader";
import ProposalFormContent from "./components/ProposalFormContent";
import { FORM_SECTIONS } from "./constants/formSections";
import ProposalBuilderModal from "./ProposalBuilderModal";

type FieldValue = string | number | boolean | string[] | any[];

interface EnhancedFieldConfig extends FieldConfig {
  value: FieldValue;
  onChange: (value: FieldValue) => void;
}

interface ProposalFormProps {
  fields: FieldConfig[];
  isGenerating: boolean;
  onGenerate: (fieldValues: Record<string, FieldValue>, proposalId: string) => Promise<void>;
  templateName: string;
  projectType?: 'interior' | 'exterior';
}

const ProposalForm = ({ fields, isGenerating, onGenerate, templateName, projectType = 'interior' }: ProposalFormProps) => {
  const [modalOpen, setModalOpen] = useState(true);
  const [completedModalSteps, setCompletedModalSteps] = useState<string[]>([]);
  const [savedModalStep, setSavedModalStep] = useState(0);

  const {
    fieldValues,
    formMode,
    setFormMode,
    getVisibleFields,
    handleFieldChange,
    handleSubmit
  } = useProposalForm(fields, isGenerating, onGenerate);

  // Filter fields by location (modal or main form)
  const modalFields = fields.filter(field => field.modalStep && field.modalStep !== 'main');
  const mainFormFields = fields.filter(field => !field.modalStep || field.modalStep === 'main');

  // Get visible fields for the main form
  const visibleMainFormFields = getVisibleFields().filter(field => !field.modalStep || field.modalStep === 'main');

  // Check for saved step when component mounts
  useEffect(() => {
    const savedStep = sessionStorage.getItem('proposalModalStep');
    if (savedStep) {
      setSavedModalStep(parseInt(savedStep, 10));
    }
  }, []);

  // Mark modal as complete when closed
  const handleModalComplete = () => {
    const modalSteps = Array.from(
      new Set(
        modalFields.map(field => field.modalStep)
      )
    );
    
    setCompletedModalSteps(modalSteps as string[]);
    setModalOpen(false);
    
    // Clear the saved step when modal is completed
    sessionStorage.removeItem('proposalModalStep');
  };

  // Re-open modal if user wants to edit
  const handleReopenModal = () => {
    setModalOpen(true);
  };

  const getFieldsBySection = () => {
    const result: Record<string, EnhancedFieldConfig[]> = {};
    
    FORM_SECTIONS.forEach(section => {
      result[section.id] = [];
    });
    
    visibleMainFormFields.forEach(field => {
      const sectionId = field.sectionId || 'additional';
      
      if (result[sectionId]) {
        result[sectionId].push({
          ...field,
          value: fieldValues[field.name] ?? (
            field.type === 'checkbox-group' || field.type === 'multi-select' || field.type === 'file-upload' 
              ? [] 
              : field.type === 'toggle' 
                ? false 
                : field.type === 'matrix-selector'
                  ? []
                  : ""
          ),
          onChange: (value: FieldValue) => handleFieldChange(field.name, value)
        });
      } else {
        result['additional'] = result['additional'] || [];
        result['additional'].push({
          ...field,
          value: fieldValues[field.name] ?? (
            field.type === 'checkbox-group' || field.type === 'multi-select' || field.type === 'file-upload' 
              ? [] 
              : field.type === 'toggle' 
                ? false 
                : field.type === 'matrix-selector'
                  ? []
                  : ""
          ),
          onChange: (value: FieldValue) => handleFieldChange(field.name, value)
        });
      }
    });
    
    Object.keys(result).forEach(sectionId => {
      result[sectionId].sort((a, b) => a.order - b.order);
    });
    
    return result;
  };

  const fieldsBySection = getFieldsBySection();

  // Show the modal settings button if there are modal fields and modal has been completed
  const showModalSettingsButton = modalFields.length > 0 && completedModalSteps.length > 0;

  return (
    <>
      {/* Builder modal */}
      <ProposalBuilderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        fields={modalFields}
        fieldValues={fieldValues}
        onFieldChange={handleFieldChange}
        onComplete={handleModalComplete}
        initialStep={savedModalStep}
      />

      <Card className="border-none shadow-md">
        <ProposalFormHeader 
          templateName={templateName}
          mode={formMode}
          onModeChange={setFormMode}
          visibleFieldCount={visibleMainFormFields.length}
          totalFieldCount={mainFormFields.length}
          projectType={projectType}
          onReopenModal={showModalSettingsButton ? handleReopenModal : undefined}
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
    </>
  );
};

export default ProposalForm;
