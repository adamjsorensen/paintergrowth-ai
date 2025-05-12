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
    console.log(`useProposalForm - Field changed: ${fieldName} =`, value);
    console.log(`useProposalForm - Type of value: ${typeof value}`);
    
    // Special handling for roomsToPaint field (convert to matrix items)
    if (fieldName === 'roomsToPaint' && Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
      console.log('useProposalForm - Converting roomsToPaint string array to matrix items');
      
      // Find the matrix field
      const matrixField = fields.find(f => f.type === 'matrix-selector');
      if (matrixField && matrixField.options && typeof matrixField.options === 'object' && !Array.isArray(matrixField.options)) {
        const matrixConfig = matrixField.options;
        
        // Convert string array to matrix items
        const matrixItems = (value as string[]).map(roomName => {
          // Find matching row in config or create a new one
          const matchingRow = matrixConfig.rows?.find((r: any) => 
            r.label?.toLowerCase() === roomName.toLowerCase() || 
            r.id.toLowerCase() === roomName.toLowerCase()
          );
          
          if (matchingRow) {
            console.log(`useProposalForm - Found matching row for ${roomName}:`, matchingRow);
            const item: any = {
              id: matchingRow.id,
              label: matchingRow.label,
              selected: true
            };
            
            // Add default values for columns
            matrixConfig.columns?.forEach((col: any) => {
              if (col.type === "number" || col.id === matrixConfig.quantityColumnId) {
                item[col.id] = 1;
              } else if (col.type === "checkbox") {
                item[col.id] = true;
              }
            });
            
            return item;
          } else {
            console.log(`useProposalForm - Creating new row for ${roomName}`);
            // Create a new item with a sanitized ID
            const id = roomName.toLowerCase().replace(/\s+/g, '_');
            const item: any = {
              id,
              label: roomName,
              selected: true
            };
            
            // Add default values for columns
            matrixConfig.columns?.forEach((col: any) => {
              if (col.type === "number" || col.id === matrixConfig.quantityColumnId) {
                item[col.id] = 1;
              } else if (col.type === "checkbox") {
                item[col.id] = true;
              }
            });
            
            return item;
          }
        });
        
        console.log('useProposalForm - Setting matrix items:', matrixItems);
        
        // Find the matrix field name
        if (matrixField.name) {
          // Update the field values with both the original string array and the matrix items
          setFieldValues(prev => ({
            ...prev,
            [fieldName]: value,
            'surfacesToPaint': value, // Also update surfacesToPaint for compatibility
            [matrixField.name]: matrixItems // Use the actual field name for the matrix selector
          }));
          return;
        }
      }
    }
    
    // Normal field update
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
      
    console.log(`Checking required fields for modal step ${modalStep}:`, requiredModalFields);
    
    const allCompleted = requiredModalFields.every(
      fieldName => {
        const value = fieldValues[fieldName];
        const isCompleted = value !== undefined && 
                  value !== null && 
                  value !== "" &&
                  !(Array.isArray(value) && value.length === 0);
                  
        console.log(`Field ${fieldName} is ${isCompleted ? 'completed' : 'incomplete'} with value:`, value);
        return isCompleted;
      }
    );
    
    console.log(`Modal step ${modalStep} completion status:`, allCompleted);
    
    setModalStepCompleted(prev => ({
      ...prev,
      [modalStep]: allCompleted
    }));
    
    return allCompleted;
  };

  const handleSubmit = async () => {
    const missingRequiredFields = getRequiredFields()
      .filter(field => {
        const value = fieldValues[field.name];
        const isMissing = !value && value !== false && 
          !(Array.isArray(value) && (value as any[]).length > 0);
          
        console.log(`Required field ${field.name} is ${isMissing ? 'missing' : 'present'} with value:`, value);
        return isMissing;
      })
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
        // Log the project address to verify it's captured correctly
        console.log("Form submission - Project Address:", {
          projectAddress: fieldValues['projectAddress'],
          allFields: fieldValues
        });

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
            client_address: fieldValues['projectAddress'] as string || null,
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
      // Special handling for matrix items if they exist
      let finalFieldValues = { ...fieldValues };
      if (fieldValues['matrixItems']) {
        // Find the matrix field name
        const matrixField = fields.find(f => f.type === 'matrix-selector');
        if (matrixField) {
          finalFieldValues[matrixField.name] = fieldValues['matrixItems'];
        }
      }
      
      onGenerate(finalFieldValues, proposalId);
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