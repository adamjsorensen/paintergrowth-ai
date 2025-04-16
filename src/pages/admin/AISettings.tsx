import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AISettings, AISettingsUpdate, ModelOptions } from "@/types/supabase";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

type FormValues = {
  model: ModelOptions;
  temperature: number;
  max_tokens: number;
  default_system_prompt: string;
  default_user_prompt: string;
};

const AISettingsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<FormValues>({
    defaultValues: {
      model: "gpt-4.1-mini", // Make sure this default exists among your new options if needed
      temperature: 0.7,
      max_tokens: 1024,
      default_system_prompt: "",
      default_user_prompt: "",
    },
  });

  // Fetch AI settings
  const { data: aiSettings, isLoading } = useQuery({
    queryKey: ["aiSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .limit(1)
        .single();
        
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching AI settings:", error);
        return null;
      }
      
      return data as AISettings;
    },
  });

  // Update AI settings
  const updateAISettings = useMutation({
    mutationFn: async (values: AISettingsUpdate) => {
      let result;
      
      if (aiSettings?.id) {
        // Update existing record
        const { data, error } = await supabase
          .from("ai_settings")
          .update(values)
          .eq("id", aiSettings.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from("ai_settings")
          .insert(values)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "AI settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["aiSettings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Set form values when settings data is loaded
  useEffect(() => {
    if (aiSettings) {
      form.reset({
        model: (aiSettings.model as ModelOptions) || "gpt-4o-mini",
        temperature: aiSettings.temperature || 0.7,
        max_tokens: aiSettings.max_tokens || 1024,
        default_system_prompt: aiSettings.default_system_prompt || "",
        default_user_prompt: aiSettings.default_user_prompt || "",
      });
    }
  }, [aiSettings, form]);

  const onSubmit = (values: FormValues) => {
    updateAISettings.mutate(values as AISettingsUpdate);
  };

  return (
    <PageLayout title="AI Settings">
      <div className="container mx-auto max-w-3xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>AI Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <Card>
          <CardHeader>
            <CardTitle>Global AI Configuration</CardTitle>
            <CardDescription>
              Configure the default settings for all AI features in the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
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
                              <SelectItem value="gpt-4o-mini">OpenAI GPT-4o-mini</SelectItem>
                              <SelectItem value="gpt-4o-mini-search-preview">OpenAI GPT-4o-mini Search Preview</SelectItem>
                              <SelectItem value="gpt-4.1-nano">OpenAI GPT-4.1 Nano</SelectItem>
                              <SelectItem value="gpt-4.1-mini">OpenAI GPT-4.1 Mini</SelectItem>
                              <SelectItem value="google/gemini-2.5-pro-exp-03-25:free">Google Gemini-2.5 Pro Exp (Free)</SelectItem>
                              <SelectItem value="anthropic/claude-3.5-haiku-20241022">Anthropic Claude-3.5 Haiku (20241022)</SelectItem>
                              <SelectItem value="x-ai/grok-3-mini-beta">X-AI Grok-3 Mini Beta</SelectItem>
                              {/* You can keep or adjust the existing legacy options as needed */}
                              <SelectItem value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</SelectItem>
                              <SelectItem value="gpt-4o">OpenAI GPT-4o</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the AI model to use for content generation
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
                            />
                          </FormControl>
                          <FormDescription>
                            Controls randomness: 0 is deterministic, 1 is very creative
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
                              min={1}
                              max={4096}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1024)}
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of tokens for AI responses (1-4096)
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
                              placeholder="Enter default system prompt for the AI"
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The default instructions given to the AI for all generations
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
                              placeholder="Enter default user prompt template"
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The default template for user prompts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full md:w-auto"
                    disabled={updateAISettings.isPending}
                  >
                    {updateAISettings.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AISettingsPage;