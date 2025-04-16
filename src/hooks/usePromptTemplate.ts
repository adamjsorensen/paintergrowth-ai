
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PromptTemplate, FieldConfig, parseFieldConfig, stringifyFieldConfig } from "@/types/prompt-templates";
import { useToast } from "@/hooks/use-toast";

// Hook for retrieving and managing prompt templates
export const usePromptTemplate = (defaultFields: FieldConfig[]) => {
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate | null>(null);
  const [fields, setFields] = useState<FieldConfig[]>(defaultFields);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Function to ensure the enhanced template exists in the database
  const ensureEnhancedTemplateExists = async (
    templateName: string,
    systemPrompt: string,
    fieldConfig: FieldConfig[]
  ) => {
    try {
      setIsCreating(true);
      
      // Check if any template exists
      const { data: existingTemplates, error: checkError } = await supabase
        .from("prompt_templates")
        .select("id")
        .eq("name", templateName)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // If the enhanced template doesn't exist, create it
      if (!existingTemplates) {
        console.log(`Creating ${templateName} template...`);
        
        // Create a properly structured saveData object for insert
        const saveData = {
          name: templateName,
          active: true,
          system_prompt: systemPrompt,
          field_config: stringifyFieldConfig(fieldConfig),
        };
        
        const { error: createError } = await supabase
          .from("prompt_templates")
          .insert([saveData]);
          
        if (createError) throw createError;
        
        console.log(`${templateName} template created successfully`);
        
        // Deactivate other templates if this one is active
        const { error: updateError } = await supabase
          .from("prompt_templates")
          .update({ active: false })
          .neq("name", templateName);
          
        if (updateError) {
          console.warn("Failed to deactivate other templates:", updateError);
        }
      }
    } catch (error) {
      console.error(`Error ensuring ${templateName} template exists:`, error);
    } finally {
      setIsCreating(false);
    }
  };

  // Fetch the prompt template from the database
  const fetchPromptTemplate = async () => {
    try {
      setIsLoading(true);
      
      // Get active prompt template or fall back to the latest one
      const { data, error } = await supabase
        .from("prompt_templates")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      // If no active template found, try to get any template
      if (!data) {
        const { data: anyTemplate, error: fallbackError } = await supabase
          .from("prompt_templates")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (fallbackError) throw fallbackError;
        
        if (anyTemplate) {
          // Safely parse the field_config, ensuring it's a string first
          const configStr = typeof anyTemplate.field_config === 'string' 
            ? anyTemplate.field_config 
            : JSON.stringify(anyTemplate.field_config);
          
          const parsedTemplate = {
            ...anyTemplate,
            field_config: parseFieldConfig(configStr)
          } as PromptTemplate;
          
          setPromptTemplate(parsedTemplate);
          setFields(parseFieldConfig(configStr));
          console.log("Using fallback template:", parsedTemplate.name);
          
          return parsedTemplate;
        } else {
          // Use default fields if no templates exist
          console.log("No templates found, using default fields");
          setPromptTemplate(null);
          setFields(defaultFields);
          
          return null;
        }
      } else {
        // Using active template
        // Safely parse the field_config, ensuring it's a string first
        const configStr = typeof data.field_config === 'string' 
          ? data.field_config 
          : JSON.stringify(data.field_config);
        
        const parsedTemplate = {
          ...data,
          field_config: parseFieldConfig(configStr)
        } as PromptTemplate;
        
        setPromptTemplate(parsedTemplate);
        setFields(parseFieldConfig(configStr));
        console.log("Using active template:", parsedTemplate.name);
        
        return parsedTemplate;
      }
    } catch (error) {
      console.error("Error fetching prompt template:", error);
      // Fall back to default fields on error
      setFields(defaultFields);
      setPromptTemplate(null);
      
      toast({
        title: "Error loading template",
        description: "Using default field configuration",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    promptTemplate,
    fields,
    isLoading,
    isCreating,
    ensureEnhancedTemplateExists,
    fetchPromptTemplate
  };
};
