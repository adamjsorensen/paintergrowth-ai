
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { FieldConfig } from "@/types/prompt-templates";

type FieldValue = string | number | boolean | string[] | any[];

export const useProposalForm = (
  fields: FieldConfig[],
  isGenerating: boolean,
  onGenerate: (fieldValues: Record<string, FieldValue>, proposalId: string) => Promise<void>
) => {
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>({});
  const [formMode, setFormMode] = useState<'basic' | 'advanced'>('basic');
  const [modalStepCompleted, setModalStepCompleted] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const getVisibleFields = () => {
    if (formMode === 'advanced') {
      return fields;
    } else {
      return fields.filter(field => field.complexity === 'basic' || field.required);
    }
  };

  const handleFieldChange = (fieldName: string, value: FieldValue) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const getRequiredFields = () => {
    return fields.filter(field => field.required);
  };
  
  const checkRequiredModalFields = (modalStep: string) => {
    const requiredModalFields = fields
      .filter(field => field.modalStep === modalStep && field.required)
      .map(field => field.name);
      
    const allCompleted = requiredModalFields.every(
      fieldName => fieldValues[fieldName] !== undefined && 
                  fieldValues[fieldName] !== null && 
                  fieldValues[fieldName] !== "" &&
                  !(Array.isArray(fieldValues[fieldName]) && fieldValues[fieldName].length === 0)
    );
    
    setModalStepCompleted(prev => ({
      ...prev,
      [modalStep]: allCompleted
    }));
    
    return allCompleted;
  };

  const handleSubmit = async () => {
    const missingRequiredFields = getRequiredFields()
      .filter(field => !fieldValues[field.name] && fieldValues[field.name] !== false && 
        !(Array.isArray(fieldValues[field.name]) && (fieldValues[field.name] as any[]).length > 0))
      .map(field => field.label);

    if (missingRequiredFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingRequiredFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const proposalId = uuidv4();

    if (user) {
      try {
        await supabase
          .from('saved_proposals')
          .insert({
            id: proposalId,
            user_id: user.id,
            title: `${fieldValues['clientName'] || 'New'} Proposal (Draft)`,
            content: "",
            client_name: fieldValues['clientName'] as string || null,
            client_phone: fieldValues['clientPhone'] as string || null,
            client_email: fieldValues['clientEmail'] as string || null,
            job_type: fieldValues['jobType'] as string || null,
            status: "pending"
          });
      } catch (error) {
        console.error("Error creating initial proposal record:", error);
        toast({
          title: "Error",
          description: "Failed to initialize proposal generation",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      onGenerate(fieldValues, proposalId);
      navigate(`/generate/proposal/${proposalId}`);
    } catch (error) {
      console.error("Error during generation redirect:", error);
      toast({
        title: "Error",
        description: "Failed to start proposal generation",
        variant: "destructive",
      });
    }
  };

  const hasAdvancedFields = () => {
    return fields.some(field => field.complexity === 'advanced');
  };

  return {
    fieldValues,
    formMode,
    setFormMode,
    getVisibleFields,
    handleFieldChange,
    handleSubmit,
    checkRequiredModalFields,
    modalStepCompleted,
    hasAdvancedFields
  };
};
