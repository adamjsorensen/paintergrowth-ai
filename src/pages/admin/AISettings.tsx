
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase, AISettings as AISettingsType } from "@/integrations/supabase/client";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

interface AISettingsFormValues {
  model: string;
  temperature: number;
  max_tokens: number;
  default_system_prompt: string;
  default_user_prompt: string;
}

const AISettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const form = useForm<AISettingsFormValues>({
    defaultValues: {
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1024,
      default_system_prompt: "",
      default_user_prompt: ""
    }
  });

  useEffect(() => {
    const fetchAISettings = async () => {
      try {
        // Since we're using the generic supabase client without type updates,
        // we need to use 'any' for now
        const { data, error } = await supabase
          .from('ai_settings')
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          form.reset({
            model: data.model || "gpt-4o-mini",
            temperature: data.temperature || 0.7,
            max_tokens: data.max_tokens || 1024,
            default_system_prompt: data.default_system_prompt || "",
            default_user_prompt: data.default_user_prompt || ""
          });
          setSettingsId(data.id);
        }
      } catch (error) {
        console.error("Error fetching AI settings:", error);
        toast.error("Failed to load AI settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAISettings();
  }, [form]);

  const onSubmit = async (values: AISettingsFormValues) => {
    try {
      let operation;
      
      if (settingsId) {
        // Update existing settings
        operation = supabase
          .from('ai_settings')
          .update({
            model: values.model,
            temperature: values.temperature,
            max_tokens: values.max_tokens,
            default_system_prompt: values.default_system_prompt,
            default_user_prompt: values.default_user_prompt,
            updated_at: new Date().toISOString()
          })
          .eq("id", settingsId);
      } else {
        // Create new settings
        operation = supabase
          .from('ai_settings')
          .insert({
            model: values.model,
            temperature: values.temperature,
            max_tokens: values.max_tokens,
            default_system_prompt: values.default_system_prompt,
            default_user_prompt: values.default_user_prompt,
            updated_at: new Date().toISOString()
          });
      }

      const { error, data } = await operation;

      if (error) throw error;

      toast.success("AI settings saved successfully");
      
      if (!settingsId && data) {
        setSettingsId(data[0]?.id);
      }
    } catch (error) {
      console.error("Error saving AI settings:", error);
      toast.error("Failed to save AI settings");
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="AI Settings">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="AI Settings">
      <div className="container mx-auto max-w-3xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>AI Settings</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Card>
          <CardHeader>
            <CardTitle>Configure AI Behavior</CardTitle>
            <CardDescription>
              Customize how the AI generates content across the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Model</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select AI model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="gpt-4.5-preview">GPT-4.5 Preview</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose the OpenAI model to use for content generation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temperature: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={1}
                          step={0.1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                          className="pt-2"
                        />
                      </FormControl>
                      <FormDescription>
                        Lower values make responses more deterministic, higher values make responses more creative
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_tokens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Tokens</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          min={1}
                          max={16000}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of tokens (words/characters) in generated responses
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="default_system_prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default System Prompt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="You are a helpful assistant..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Default instructions to guide the AI's behavior
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="default_user_prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default User Prompt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="When generating content, please..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Default instructions to include with every user request
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">Save Settings</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AISettings;
