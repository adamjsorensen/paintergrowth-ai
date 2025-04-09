import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  PromptTemplate, 
  FieldConfig, 
  parseFieldConfig, 
  stringifyFieldConfig 
} from "@/types/prompt-templates";
import PageLayout from "@/components/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import FieldBuilder from "@/components/prompt-builder/FieldBuilder";
import PromptPreview from "@/components/prompt-builder/PromptPreview";
import { v4 as uuidv4 } from 'uuid';

const promptSchema = z.object({
  name: z.string().min(1, "Display name is required"),
  active: z.boolean().default(false),
  system_prompt: z.string().min(1, "System prompt is required"),
});

type FormValues = z.infer<typeof promptSchema>;

const PromptBuilder = () => {
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate | null>(null);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("prompt-info");
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      name: "",
      active: false,
      system_prompt: "",
    },
  });

  useEffect(() => {
    const fetchPromptTemplate = async () => {
      try {
        const { data, error } = await supabase
          .from("prompt_templates")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        if (data) {
          const parsedTemplate = {
            ...data,
            field_config: parseFieldConfig(data.field_config)
          } as PromptTemplate;
          
          setPromptTemplate(parsedTemplate);
          setFields(parseFieldConfig(data.field_config));
          form.reset({
            name: data.name,
            active: data.active,
            system_prompt: data.system_prompt,
          });
        }
      } catch (error) {
        console.error("Error fetching prompt template:", error);
        toast({
          title: "Error",
          description: "Failed to load prompt template",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPromptTemplate();
  }, [form, toast]);

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
      
      if (promptTemplate) {
        // Update existing template
        response = await supabase
          .from("prompt_templates")
          .update(updatedTemplate)
          .eq("id", promptTemplate.id);
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

  if (loading) {
    return (
      <PageLayout title="Prompt Builder">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Prompt Builder">
      <div className="container mx-auto">
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
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Configure the basic settings for this prompt template</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Proposal Generator" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FormLabel className="block mb-2">Content Type</FormLabel>
                        <Input value="Proposal" disabled />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Active</FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="system-prompt" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Prompt</CardTitle>
                    <CardDescription>
                      Configure the system prompt that will be sent to the AI.
                      Use <code>{'{{field_key}}'}</code> syntax to insert field values.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="system_prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="You are a professional proposal writer. Create a proposal for {{job_type}} work for client {{client_name}}."
                              className="min-h-[300px] font-mono"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="fields" className="mt-6">
                <FieldBuilder fields={fields} setFields={setFields} />
              </TabsContent>
            </Tabs>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Preview how the form will look to users</CardDescription>
              </CardHeader>
              <CardContent>
                <PromptPreview 
                  systemPrompt={form.watch("system_prompt")}
                  fields={fields} 
                />
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </PageLayout>
  );
};

export default PromptBuilder;
