
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

  // Boilerplate inclusion toggles
  const [includeBoilerplate, setIncludeBoilerplate] = useState(false);
  const [includeTerms, setIncludeTerms] = useState(true);
  const [includeWarranty, setIncludeWarranty] = useState(true);
  
  // Update field values when toggles change
  useEffect(() => {
    handleFieldChange('includeBoilerplate', includeBoilerplate);
    handleFieldChange('includeTerms', includeTerms);
    handleFieldChange('includeWarranty', includeWarranty);
    // Set locale to en-US by default
    handleFieldChange('locale', 'en-US');
  }, [includeBoilerplate, includeTerms, includeWarranty]);
  
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
        
        {/* Boilerplate inclusion options */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium">Include Standard Content</h3>
            </div>
            <Switch
              checked={includeBoilerplate}
              onCheckedChange={setIncludeBoilerplate}
              id="include-boilerplate"
            />
          </div>
          
          {includeBoilerplate && (
            <div className="mt-4 pl-6 space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-terms" className="text-sm">Terms & Conditions</Label>
                <Switch
                  checked={includeTerms}
                  onCheckedChange={setIncludeTerms}
                  id="include-terms"
                  disabled={!includeBoilerplate}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="include-warranty" className="text-sm">Warranty Information</Label>
                <Switch
                  checked={includeWarranty}
                  onCheckedChange={setIncludeWarranty}
                  id="include-warranty"
                  disabled={!includeBoilerplate}
                />
              </div>
            </div>
          )}
        </div>
        
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
          fields={fields}
          values={fieldValues}
          onValueChange={handleFieldChange}
          onSubmit={handleSubmit}
          checkRequiredFields={checkRequiredModalFields}
          stepCompleted={modalStepCompleted}
        />
      )}
    </Card>
  );
}

export default ProposalForm;
