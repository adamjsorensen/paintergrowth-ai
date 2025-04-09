import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ENHANCED_SYSTEM_PROMPT } from "@/components/proposal-generator/constants/templatePrompts";
import { ENHANCED_FIELDS } from "@/components/proposal-generator/constants/templateFields";
import { FieldConfig, parseFieldConfig, stringifyFieldConfig } from "@/types/prompt-templates";
import { usePromptTemplate } from "@/hooks/usePromptTemplate";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralTab from "@/components/prompt-builder/tabs/GeneralTab";
import FieldsTab from "@/components/prompt-builder/tabs/FieldsTab";
import PreviewTab from "@/components/prompt-builder/tabs/PreviewTab";

const ProposalGeneratorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [systemPrompt, setSystemPrompt] = useState(ENHANCED_SYSTEM_PROMPT);
  const {
    promptTemplate,
    fields,
    isLoading,
    isCreating,
    ensureEnhancedTemplateExists,
    fetchPromptTemplate
  } = usePromptTemplate(ENHANCED_FIELDS);
  const [templateName, setTemplateName] = useState("Enhanced Proposal Template");
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchPromptTemplate();
  }, []);

  useEffect(() => {
    if (promptTemplate) {
      setTemplateName(promptTemplate.name);
      setSystemPrompt(promptTemplate.system_prompt);
      setActive(promptTemplate.active);
    }
  }, [promptTemplate]);

  const handleFieldChange = useCallback((updatedFields: FieldConfig[]) => {
    // Optimistically update the local state
    // setFields(updatedFields);

    // // Persist the changes to the database
    // const saveData = {
    //   name: templateName,
    //   active: active,
    //   system_prompt: systemPrompt,
    //   field_config: stringifyFieldConfig(updatedFields),
    // };

    // supabase
    //   .from("prompt_templates")
    //   .update(saveData)
    //   .eq("id", promptTemplate?.id)
    //   .then(({ error }) => {
    //     if (error) {
    //       console.error("Error updating prompt template:", error);
    //       toast({
    //         title: "Error updating template",
    //         description: "Failed to update the prompt template.",
    //         variant: "destructive",
    //       });
    //       // Revert to the previous state in case of an error
    //       fetchPromptTemplate();
    //     } else {
    //       toast({
    //         title: "Template updated",
    //         description: "Prompt template updated successfully.",
    //       });
    //     }
    //   });
  }, [toast, templateName, systemPrompt, active, promptTemplate, fetchPromptTemplate]);

  const handleSave = async () => {
    if (!user) return;

    try {
      // Persist the changes to the database
      const saveData = {
        name: templateName,
        active: active,
        system_prompt: systemPrompt,
        field_config: stringifyFieldConfig(fields),
      };

      // If we have an existing record, update it
      if (promptTemplate?.id) {
        // Update existing template
        const { error } = await supabase
          .from("prompt_templates")
          .update(saveData)
          .eq("id", promptTemplate.id);

        if (error) throw error;
      } else {
        // Insert new template
        const { error } = await supabase
          .from("prompt_templates")
          .insert(saveData);

        if (error) throw error;
      }

      toast({
        title: "Template saved",
        description: "Your prompt template has been updated successfully.",
      });

      fetchPromptTemplate();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your template.",
        variant: "destructive",
      });
    }
  };

  return (
    <PageLayout title="Prompt Builder">
      <div className="max-w-5xl mx-auto pb-10">
        <Breadcrumb className="mb-6 ml-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              {/* Fix all BreadcrumbLink instances */}
              <BreadcrumbLink as={Link} to="/dashboard">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/admin/prompt-builder">
                Prompt Builder
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Proposal Generator</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        <Card>
          <CardHeader>
            <CardTitle>Proposal Generator Template</CardTitle>
            <CardDescription>
              Customize the prompt template used for generating proposals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="fields">Fields</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                  <GeneralTab
                    templateName={templateName}
                    setTemplateName={setTemplateName}
                    systemPrompt={systemPrompt}
                    setSystemPrompt={setSystemPrompt}
                    active={active}
                    setActive={setActive}
                  />
                </TabsContent>
                <TabsContent value="fields">
                  <FieldsTab
                    fields={fields}
                    onFieldChange={handleFieldChange}
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <PreviewTab
                    systemPrompt={systemPrompt}
                    fields={fields}
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-end mt-4">
          <Button onClick={handleSave} disabled={isLoading}>
            Save Template
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProposalGeneratorPage;
