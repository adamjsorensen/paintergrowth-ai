import React from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlignLeft, Code, Wand2 } from "lucide-react";
import PromptEditorTab from "@/components/prompt-builder/tabs/PromptEditorTab";
import FieldEditorTab from "@/components/prompt-builder/tabs/FieldEditorTab";
import PreviewTab from "@/components/prompt-builder/tabs/PreviewTab";
import { usePromptTemplate } from "@/hooks/usePromptTemplate";
import { ENHANCED_FIELDS } from "@/components/proposal-generator/constants/templateFields";
import { ENHANCED_SYSTEM_PROMPT } from "@/components/proposal-generator/constants/templatePrompts";
import { parseFieldConfig, stringifyFieldConfig, FieldConfig } from "@/types/prompt-templates";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FormPreview from "@/components/prompt-builder/preview-sections/FormPreview";
import PromptPreview from "@/components/prompt-builder/PromptPreview";

const PromptBuilderHub = () => {
  const { toast } = useToast();
  const {
    promptTemplate,
    fields,
    isLoading,
    isCreating,
    ensureEnhancedTemplateExists,
    fetchPromptTemplate
  } = usePromptTemplate(ENHANCED_FIELDS);
  
  const [systemPrompt, setSystemPrompt] = React.useState(ENHANCED_SYSTEM_PROMPT);
  const [fieldValues, setFieldValues] = React.useState<Record<string, any>>({});
  
  React.useEffect(() => {
    fetchPromptTemplate();
  }, []);
  
  React.useEffect(() => {
    if (promptTemplate) {
      setSystemPrompt(promptTemplate.system_prompt);
      
      // Initialize field values from the prompt template's field config
      const initialValues: Record<string, any> = {};
      promptTemplate.field_config.forEach(field => {
        initialValues[field.id] = getDefaultValue(field.type);
      });
      setFieldValues(initialValues);
    } else {
      // If no template, initialize field values from default fields
      const initialValues: Record<string, any> = {};
      ENHANCED_FIELDS.forEach(field => {
        initialValues[field.id] = getDefaultValue(field.type);
      });
      setFieldValues(initialValues);
      setSystemPrompt(ENHANCED_SYSTEM_PROMPT);
    }
  }, [promptTemplate]);
  
  const getDefaultValue = (type: string): any => {
    switch (type) {
      case 'text':
      case 'textarea':
      case 'select':
        return '';
      case 'number':
        return 0;
      case 'toggle':
        return false;
      case 'checkbox-group':
        return [];
      case 'date':
        return new Date().toISOString().split('T')[0];
      default:
        return '';
    }
  };
  
  const handleSystemPromptChange = (newPrompt: string) => {
    setSystemPrompt(newPrompt);
  };
  
  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues(prevValues => ({
      ...prevValues,
      [fieldId]: value,
    }));
  };
  
  const handleSaveTemplate = async () => {
    try {
      // Ensure the template exists
      await ensureEnhancedTemplateExists(
        "Enhanced Proposal Template",
        systemPrompt,
        fields
      );
      
      // Update the template with the new system prompt and field config
      const { error } = await supabase
        .from("prompt_templates")
        .update({
          system_prompt: systemPrompt,
          field_config: stringifyFieldConfig(fields),
        })
        .eq("name", "Enhanced Proposal Template");
        
      if (error) throw error;
      
      toast({
        title: "Template saved",
        description: "Your prompt template has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your template.",
        variant: "destructive",
      });
    }
  };
  
  const handlePreview = () => {
    console.log("Generating preview with values:", fieldValues);
  };

  return (
    <PageLayout title="Prompt Builder">
      <div className="container mx-auto">
        <Breadcrumb className="mb-6 ml-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              {/* Fix BreadcrumbLink */}
              <BreadcrumbLink as={Link} to="/dashboard">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Prompt Builder</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Card>
          <CardContent>
            <Tabs defaultValue="prompt" className="space-y-4">
              <TabsList>
                <TabsTrigger value="prompt">
                  <AlignLeft className="mr-2 h-4 w-4" />
                  Prompt Editor
                </TabsTrigger>
                <TabsTrigger value="fields">
                  <Code className="mr-2 h-4 w-4" />
                  Field Editor
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="prompt" className="space-y-4">
                <PromptEditorTab
                  systemPrompt={systemPrompt}
                  onSystemPromptChange={handleSystemPromptChange}
                />
              </TabsContent>
              <TabsContent value="fields" className="space-y-4">
                <FieldEditorTab fields={fields} />
              </TabsContent>
              <TabsContent value="preview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Form Preview</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      Interact with a preview of the form and see how the fields behave.
                    </p>
                    <FormPreview
                      fields={fields}
                      values={fieldValues}
                      onValueChange={handleFieldChange}
                      onGeneratePreview={handlePreview}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Prompt Preview</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      See the generated prompt based on the form values.
                    </p>
                    <PromptPreview
                      systemPrompt={systemPrompt}
                      fields={fields}
                      values={fieldValues}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2"
                onClick={handleSaveTemplate}
                disabled={isLoading || isCreating}
              >
                {isLoading || isCreating ? "Saving..." : "Save Template"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default PromptBuilderHub;
