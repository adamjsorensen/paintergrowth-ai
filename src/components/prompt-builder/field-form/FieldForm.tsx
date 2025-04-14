
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FieldConfig, FieldOption } from "@/types/prompt-templates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import OptionInputs from "./OptionInputs";

interface FieldFormProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
  options: FieldOption[];
  setOptions: React.Dispatch<React.SetStateAction<FieldOption[]>>;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

const FieldForm: React.FC<FieldFormProps> = ({
  form,
  isEditing,
  options,
  setOptions,
  onSubmit,
  onCancel,
}) => {
  const [optionInput, setOptionInput] = useState({ value: "", label: "" });

  const handleAddOption = () => {
    if (!optionInput.value || !optionInput.label) return;
    
    setOptions((prev) => [...prev, { ...optionInput }]);
    setOptionInput({ value: "", label: "" });
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const needsOptions = () => {
    const currentType = form.watch("type");
    return ["select", "checkbox-group", "multi-select"].includes(currentType);
  };

  return (
    <Card className="my-4">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
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
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mt-6">
                    <div className="space-y-0.5">
                      <FormLabel>Required Field</FormLabel>
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
            
            {needsOptions() && (
              <OptionInputs 
                options={options}
                optionInput={optionInput}
                setOptionInput={setOptionInput}
                onAddOption={handleAddOption}
                onRemoveOption={handleRemoveOption}
              />
            )}
            
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Field" : "Add Field"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FieldForm;
