
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { 
  PromptTemplate, 
  FieldConfig, 
  stringifyFieldConfig 
} from "@/types/prompt-templates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import FieldBuilder from "@/components/prompt-builder/FieldBuilder";
import PromptInfoTab from "@/components/prompt-builder/tabs/PromptInfoTab";
import SystemPromptTab from "@/components/prompt-builder/tabs/SystemPromptTab";
import PreviewTab from "@/components/prompt-builder/tabs/PreviewTab";
import { useToast } from "@/hooks/use-toast";

const promptSchema = z.object({
  name: z.string().min(1, "Display name is required"),
  active: z.boolean().default(false),
  system_prompt: z.string().min(1, "System prompt is required"),
});

type FormValues = z.infer<typeof promptSchema>;

interface PromptBuilderFormProps {
  initialTemplate: PromptTemplate | null;
  initialFields: FieldConfig[];
}

const PromptBuilderForm: React.FC<PromptBuilderFormProps> = ({ initialTemplate, initialFields }) => {
  const [fields, setFields] = useState<FieldConfig[]>(initialFields);
  const [activeTab, setActiveTab] = useState("prompt-info");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      name: initialTemplate?.name || "",
      active: initialTemplate?.active || false,
      system_prompt: initialTemplate?.system_prompt || "",
    },
  });

  const handleSaveTemplate = async (values: FormValues) => {
    try {
      setSaving(true);
      
      const updatedTemplate = {
        name: values.name,
        active: values.active,
        system_prompt: values.system_prompt,
        field_config: stringifyFieldConfig(fields),
        updated_at: new Date().toISOString(),
      };
      
      let response;
      
      if (initialTemplate) {
        // Update existing template
        response = await supabase
          .from("prompt_templates")
          .update(updatedTemplate)
          .eq("id", initialTemplate.id);
      } else {
        // Create new template
        response = await supabase
          .from("prompt_templates")
          .insert([updatedTemplate]);
      }
      
      if (response.error) throw response.error;
      
      toast({
        title: "Success",
        description: "Prompt template saved successfully",
      });
      
    } catch (error) {
      console.error("Error saving prompt template:", error);
      toast({
        title: "Error",
        description: "Failed to save prompt template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSaveTemplate)} className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Configure Proposal Generator</h2>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prompt-info">Prompt Info</TabsTrigger>
            <TabsTrigger value="system-prompt">System Prompt</TabsTrigger>
            <TabsTrigger value="fields">Input Fields</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompt-info" className="mt-6">
            <PromptInfoTab form={form} />
          </TabsContent>
          
          <TabsContent value="system-prompt" className="mt-6">
            <SystemPromptTab form={form} />
          </TabsContent>
          
          <TabsContent value="fields" className="mt-6">
            <FieldBuilder fields={fields} setFields={setFields} />
          </TabsContent>
        </Tabs>
        
        <PreviewTab 
          systemPrompt={form.watch("system_prompt")} 
          fields={fields}
        />
      </form>
    </Form>
  );
};

export default PromptBuilderForm;
