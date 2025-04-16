
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface FieldTypeSectionProps {
  form: UseFormReturn<any>;
}

const FieldTypeSection = ({ form }: FieldTypeSectionProps) => {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Field Type</FormLabel>
          <Select
            onValueChange={(value) => {
              console.log("Field type changed to:", value);
              field.onChange(value);
            }}
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="textarea">Text Area</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="toggle">Toggle</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="checkbox-group">Checkbox Group</SelectItem>
              <SelectItem value="multi-select">Multi Select</SelectItem>
              <SelectItem value="file-upload">File Upload</SelectItem>
              <SelectItem value="quote-table">Quote Table</SelectItem>
              <SelectItem value="upsell-table">Upsell Table</SelectItem>
              <SelectItem value="tax-calculator">Tax Calculator</SelectItem>
              <SelectItem value="matrix-selector">Matrix Selector</SelectItem>
              <SelectItem value="scope-of-work">Scope of Work</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FieldTypeSection;
