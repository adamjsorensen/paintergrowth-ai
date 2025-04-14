
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { FORM_SECTIONS } from "@/components/proposal-generator/constants/formSections";

interface SectionSelectProps {
  form: UseFormReturn<any>;
}

const SectionSelect = ({ form }: SectionSelectProps) => {
  return (
    <FormField
      control={form.control}
      name="sectionId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Form Section</FormLabel>
          <Select
            onValueChange={(value) => {
              console.log("Section changed to:", value);
              field.onChange(value);
            }}
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {FORM_SECTIONS.map(section => (
                <SelectItem key={section.id} value={section.id}>
                  {section.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SectionSelect;
