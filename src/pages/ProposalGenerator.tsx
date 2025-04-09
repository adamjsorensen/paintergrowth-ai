
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PromptTemplate, FieldConfig, parseFieldConfig, stringifyFieldConfig } from "@/types/prompt-templates";
import PageLayout from "@/components/PageLayout";
import { TemplateLoading, NoTemplateMessage } from "@/components/proposal-generator/LoadingStates";
import ProposalForm from "@/components/proposal-generator/ProposalForm";
import { useAuth } from "@/components/AuthProvider";
import { useStylePreferences } from "@/context/StylePreferencesContext";

type FieldValue = string | number | boolean | string[];

// Enhanced field configuration with updated complexity levels based on requirements
const ENHANCED_FIELDS: FieldConfig[] = [
  {
    id: 'clientName',
    label: 'Client Name',
    type: 'text',
    required: true,
    order: 10,
    placeholder: 'Enter client name',
    complexity: 'basic' // Essential field
  },
  {
    id: 'projectAddress',
    label: 'Project Address',
    type: 'textarea',
    required: true,
    order: 15,
    placeholder: 'Enter the full project address',
    complexity: 'basic' // Essential field
  },
  {
    id: 'jobType',
    label: 'Job Type',
    type: 'select',
    required: true,
    order: 20,
    options: [
      { value: 'interior', label: 'Interior' },
      { value: 'exterior', label: 'Exterior' },
      { value: 'cabinets', label: 'Cabinets' },
      { value: 'deck', label: 'Deck/Fence' },
      { value: 'commercial', label: 'Commercial' }
    ],
    complexity: 'basic' // Essential field
  },
  {
    id: 'squareFootage',
    label: 'Square Footage',
    type: 'number',
    required: false,
    order: 30,
    placeholder: 'Approx. square footage',
    complexity: 'advanced' // Advanced field
  },
  {
    id: 'surfacesToPaint',
    label: 'Surfaces to Paint',
    type: 'multi-select',
    required: true,
    order: 40,
    options: [
      { value: 'walls', label: 'Walls' },
      { value: 'ceilings', label: 'Ceilings' },
      { value: 'trim', label: 'Trim' },
      { value: 'doors', label: 'Doors' },
      { value: 'cabinets', label: 'Cabinets' }
    ],
    complexity: 'basic' // Essential field
  },
  {
    id: 'prepNeeds',
    label: 'Preparation Needs',
    type: 'checkbox-group',
    required: false,
    order: 50,
    options: [
      { value: 'scraping', label: 'Scraping' },
      { value: 'sanding', label: 'Sanding' },
      { value: 'powerwashing', label: 'Powerwashing' },
      { value: 'caulking', label: 'Caulking' },
      { value: 'patching', label: 'Patching' },
      { value: 'priming', label: 'Priming' }
    ],
    complexity: 'advanced' // Advanced field
  },
  {
    id: 'colorPalette',
    label: 'Preferred Colors / Palette',
    type: 'textarea',
    required: false,
    order: 60,
    placeholder: 'Describe your color preferences',
    complexity: 'advanced' // Advanced field - changed from basic
  },
  {
    id: 'timeline',
    label: 'Timeline or Start Date',
    type: 'date',
    required: false,
    order: 70,
    complexity: 'basic' // Essential field
  },
  {
    id: 'specialNotes',
    label: 'Special Notes',
    type: 'textarea',
    required: false,
    order: 80,
    placeholder: 'Any additional details or requirements',
    complexity: 'advanced' // Advanced field
  },
  {
    id: 'showDetailedScope',
    label: 'Show detailed scope of work',
    type: 'toggle',
    required: false,
    order: 90,
    complexity: 'advanced' // Advanced field
  },
  {
    id: 'breakoutQuote',
    label: 'Break out quote summary',
    type: 'toggle',
    required: false,
    order: 100,
    complexity: 'advanced' // Advanced field
  },
  {
    id: 'includeTerms',
    label: 'Include terms & conditions',
    type: 'toggle',
    required: false,
    order: 110,
    complexity: 'advanced' // Advanced field - changed from basic
  },
  {
    id: 'uploadFiles',
    label: 'Upload Files/Images',
    type: 'file-upload',
    required: false,
    order: 120,
    helpText: 'Upload reference images or documents',
    complexity: 'advanced' // Advanced field
  }
];

// Improved system prompt that utilizes all field types
const ENHANCED_SYSTEM_PROMPT = `You are a professional painting proposal writer for a painting contractor. Create a detailed, well-structured proposal for a {{jobType}} painting project for client {{clientName}} located at {{projectAddress}}.

Project Details:
- Square Footage: {{squareFootage}}
- Surfaces to Paint: {{surfacesToPaint}}
- Preparation Required: {{prepNeeds}}
- Color Preferences: {{colorPalette}}
- Timeline: {{timeline}}
- Special Notes: {{specialNotes}}

Include a professional introduction and background on your company. Then, describe the scope of work in detail.
{{#if showDetailedScope}}Please provide a very detailed scope of work listing each area and exactly what will be done.{{/if}}
{{#if breakoutQuote}}Include a detailed quote with line items for each component of the work.{{/if}}
{{#if includeTerms}}Include a professional terms and conditions section.{{/if}}

The proposal should be formatted professionally with clear sections for Introduction, Scope of Work, Price/Quote, Timeline, and {{#if includeTerms}}Terms & Conditions{{/if}}.

Make the proposal persuasive and highlight the quality of materials and workmanship that will be provided.`;

const ProposalGenerator = () => {
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate | null>(null);
  const [fields, setFields] = useState<FieldConfig[]>(ENHANCED_FIELDS);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);
  const [isLoadingGeneration, setIsLoadingGeneration] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { preferences } = useStylePreferences();

  // Function to ensure the enhanced template exists in the database
  const ensureEnhancedTemplateExists = async () => {
    try {
      setIsCreatingTemplate(true);
      
      // Check if any template exists
      const { data: existingTemplates, error: checkError } = await supabase
        .from("prompt_templates")
        .select("id")
        .eq("name", "Enhanced Proposal Generator")
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      // If the enhanced template doesn't exist, create it
      if (!existingTemplates) {
        console.log("Creating enhanced template...");
        
        // Fix: Create a properly structured saveData object for insert
        const saveData = {
          name: "Enhanced Proposal Generator",
          active: true,
          system_prompt: ENHANCED_SYSTEM_PROMPT,
          field_config: stringifyFieldConfig(ENHANCED_FIELDS),
        };
        
        const { error: createError } = await supabase
          .from("prompt_templates")
          .insert([saveData]);
          
        if (createError) throw createError;
        
        console.log("Enhanced template created successfully");
        
        // Deactivate other templates if this one is active
        const { error: updateError } = await supabase
          .from("prompt_templates")
          .update({ active: false })
          .neq("name", "Enhanced Proposal Generator");
          
        if (updateError) {
          console.warn("Failed to deactivate other templates:", updateError);
        }
      }
    } catch (error) {
      console.error("Error ensuring enhanced template exists:", error);
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  // Fetch the prompt template from the database
  useEffect(() => {
    const fetchPromptTemplate = async () => {
      try {
        setIsLoadingTemplate(true);
        
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
            const parsedTemplate = {
              ...anyTemplate,
              field_config: parseFieldConfig(anyTemplate.field_config)
            } as PromptTemplate;
            
            setPromptTemplate(parsedTemplate);
            setFields(parseFieldConfig(anyTemplate.field_config));
            console.log("Using fallback template:", parsedTemplate.name);
            
            // If we're using a fallback template, ensure the enhanced template exists
            await ensureEnhancedTemplateExists();
          } else {
            // Use enhanced fields if no templates exist
            console.log("No templates found, using enhanced fields");
            setPromptTemplate(null);
            setFields(ENHANCED_FIELDS);
            
            // Create the enhanced template
            await ensureEnhancedTemplateExists();
          }
        } else {
          // Using active template
          const parsedTemplate = {
            ...data,
            field_config: parseFieldConfig(data.field_config)
          } as PromptTemplate;
          
          setPromptTemplate(parsedTemplate);
          setFields(parseFieldConfig(data.field_config));
          console.log("Using active template:", parsedTemplate.name);
          
          // If the active template is not the enhanced one, ensure it exists anyway
          if (parsedTemplate.name !== "Enhanced Proposal Generator") {
            await ensureEnhancedTemplateExists();
          }
        }
      } catch (error) {
        console.error("Error fetching prompt template:", error);
        // Fall back to enhanced fields on error
        setFields(ENHANCED_FIELDS);
        setPromptTemplate(null);
        
        toast({
          title: "Error loading template",
          description: "Using default field configuration",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTemplate(false);
      }
    };

    fetchPromptTemplate();
  }, [toast]);

  const handleGenerate = async (values: Record<string, FieldValue>, proposalId: string) => {
    try {
      setIsLoadingGeneration(true);

      // First, ensure the proposal record has the correct pending status
      if (user) {
        await supabase
          .from('saved_proposals')
          .update({ 
            status: "generating" 
          })
          .eq('id', proposalId);
      }

      // Add style preferences to the values
      const valuesWithPreferences = {
        ...values,
        _stylePreferences: preferences
      };

      console.log("Generating proposal with values:", valuesWithPreferences);

      // Start the proposal generation in the background
      const response = await supabase.functions.invoke('generate_proposal', {
        body: {
          // Use the actual template ID if available, otherwise use a default ID
          prompt_id: promptTemplate?.id || "00000000-0000-0000-0000-000000000000",
          field_values: valuesWithPreferences,
          proposal_id: proposalId
        }
      });

      if (response.error) {
        if (user) {
          await supabase
            .from('saved_proposals')
            .update({ 
              status: "failed" 
            })
            .eq('id', proposalId);
        }
        
        throw new Error(response.error.message || "Failed to generate proposal");
      }

      console.log("Generation started successfully for proposal:", proposalId);
    } catch (error) {
      console.error("Generation error:", error);
      
      if (user) {
        await supabase
          .from('saved_proposals')
          .update({ 
            status: "failed" 
          })
          .eq('id', proposalId);
      }
      
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGeneration(false);
    }
  };

  if (isLoadingTemplate || isCreatingTemplate) {
    return (
      <PageLayout title="Generate Proposal">
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          <TemplateLoading />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Generate Proposal">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <ProposalForm 
          fields={fields}
          isGenerating={isLoadingGeneration}
          onGenerate={handleGenerate}
          templateName={promptTemplate?.name || "Painting Proposal"}
        />
      </div>
    </PageLayout>
  );
};

export default ProposalGenerator;
