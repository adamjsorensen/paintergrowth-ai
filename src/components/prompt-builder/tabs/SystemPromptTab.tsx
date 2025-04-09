
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
      <FormField
        control={form.control}
        name="system_prompt"
        render={({ field }) => (
          <FormItem>
            <FormDescription className="mb-2">
              Configure the system prompt that will be sent to the AI.
              Use <code>{'{{field_key}}'}</code> syntax to insert field values.
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
