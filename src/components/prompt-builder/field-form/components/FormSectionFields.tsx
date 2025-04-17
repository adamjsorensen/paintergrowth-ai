
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ModalStepType } from "@/hooks/prompt-fields/types";

interface FormSectionFieldsProps {
  form: UseFormReturn<any>;
}

const FormSectionFields: React.FC<FormSectionFieldsProps> = ({ form }) => {
  const modalStepOptions: { value: ModalStepType; label: string }[] = [
    { value: "main", label: "Main Form" },
    { value: "style", label: "Style Preferences" },
    { value: "scope", label: "Scope of Work" }
  ];

  return (
    <>
      <FormField
        control={form.control}
        name="label"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Field Label</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Client Name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Template Variable Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. clientName" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="helpText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Help Text (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Help text shown below the field" {...field} />
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
              <FormLabel>Placeholder (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Placeholder text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="modalStep"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modal Step</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select where this field should appear" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {modalStepOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default FormSectionFields;
