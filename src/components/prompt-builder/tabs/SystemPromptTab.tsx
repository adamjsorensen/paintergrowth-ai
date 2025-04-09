
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface SystemPromptTabProps {
  form: UseFormReturn<any>;
}

const SystemPromptTab: React.FC<SystemPromptTabProps> = ({ form }) => {
  return (
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
  );
};

export default SystemPromptTab;
