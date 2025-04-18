
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface PromptInfoTabProps {
  form: UseFormReturn<any>;
}

const PromptInfoTab: React.FC<PromptInfoTabProps> = ({ form }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Basic Information</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Configure the basic settings for your prompt template.
      </p>
      
      <div className="space-y-6">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormLabel className="block mb-2">Content Type</FormLabel>
            <Input value="Proposal" disabled />
          </div>
          
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
      </div>
    </div>
  );
};

export default PromptInfoTab;
