
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface FormSectionFieldsProps {
  form: UseFormReturn<any>;
}

const FormSectionFields = ({ form }: FormSectionFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="label"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Field Label</FormLabel>
            <FormControl>
              <Input placeholder="Client Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="helpText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Help Text</FormLabel>
            <FormControl>
              <Input placeholder="Enter a helpful description for this field" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="placeholder"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Placeholder</FormLabel>
            <FormControl>
              <Input placeholder="Enter placeholder text" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default FormSectionFields;
