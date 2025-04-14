
import React from "react";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";

interface FieldTogglesProps {
  form: UseFormReturn<any>;
}

const FieldToggles = ({ form }: FieldTogglesProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="required"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel>Required Field</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={(checked) => {
                  console.log("Required changed to:", checked);
                  field.onChange(checked);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="complexity"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel>Advanced Field</FormLabel>
            </div>
            <FormControl>
              <Switch
                checked={field.value === 'advanced'}
                onCheckedChange={(checked) => {
                  const value = checked ? 'advanced' : 'basic';
                  console.log("Complexity changed to:", value);
                  field.onChange(value);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};

export default FieldToggles;
