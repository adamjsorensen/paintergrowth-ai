
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

interface SystemPromptTabProps {
  form: UseFormReturn<any>;
}

const SystemPromptTab: React.FC<SystemPromptTabProps> = ({ form }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">System Prompt</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Define the instructions that will guide the AI in generating proposals.
      </p>
      
      <FormField
        control={form.control}
        name="system_prompt"
        render={({ field }) => (
          <FormItem>
            <FormDescription className="mb-4">
              Configure the system prompt that will be sent to the AI.
              Use <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{'{{field_key}}'}</code> syntax to insert field values.
            </FormDescription>
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
    </div>
  );
};

export default SystemPromptTab;
