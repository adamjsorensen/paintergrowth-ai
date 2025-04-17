
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SystemPromptTabProps {
  form: UseFormReturn<any>;
}

const SystemPromptTab: React.FC<SystemPromptTabProps> = ({ form }) => {
  return (
    <div>
      <Tabs defaultValue="template" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="template">Template Prompt</TabsTrigger>
          <TabsTrigger value="override">System Override (Optional)</TabsTrigger>
        </TabsList>

        <TabsContent value="template">
          <h3 className="text-lg font-medium mb-4">Template Prompt</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Define the template with placeholders that will be filled with user input values.
          </p>
          
          <FormField
            control={form.control}
            name="template_prompt"
            render={({ field }) => (
              <FormItem>
                <FormDescription className="mb-4">
                  Configure the template prompt that will be sent to the AI.
                  Use <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{'{{field_key}}'}</code> syntax to insert field values.
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Create a proposal for {{job_type}} work for client {{client_name}}."
                    className="min-h-[300px] font-mono"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>
        
        <TabsContent value="override">
          <h3 className="text-lg font-medium mb-4">System Override (Optional)</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Optionally override the default system prompt for this template.
          </p>
          
          <FormField
            control={form.control}
            name="system_prompt_override"
            render={({ field }) => (
              <FormItem>
                <FormDescription className="mb-4">
                  If provided, this will override the global system prompt for this template only.
                  Leave blank to use the default system prompt.
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="You are a professional proposal writer..."
                    className="min-h-[300px] font-mono"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemPromptTab;
