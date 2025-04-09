
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldConfig, FieldType, FieldOption } from "@/types/prompt-templates";
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
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { v4 as uuidv4 } from "uuid";
import { Check, ChevronDown, ChevronUp, Plus, Edit } from "lucide-react";
import FieldCard from "./FieldCard";

interface FieldBuilderProps {
  fields: FieldConfig[];
  setFields: React.Dispatch<React.SetStateAction<FieldConfig[]>>;
}

const fieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.enum(["text", "textarea", "select", "number", "toggle", "date", "checkbox-group", "multi-select", "file-upload"]),
  required: z.boolean().default(false),
  helpText: z.string().optional(),
  placeholder: z.string().optional(),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

const FieldBuilder: React.FC<FieldBuilderProps> = ({ fields, setFields }) => {
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [options, setOptions] = useState<FieldOption[]>([]);
  const [optionInput, setOptionInput] = useState({ value: "", label: "" });

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      label: "",
      type: "text",
      required: false,
      helpText: "",
      placeholder: "",
    },
  });

  const handleAddField = (values: FieldFormValues) => {
    const fieldId = values.label.toLowerCase().replace(/\s+/g, "_");
    
    const newField: FieldConfig = {
      id: fieldId,
      label: values.label,
      type: values.type as FieldType,
      required: values.required,
      helpText: values.helpText,
      placeholder: values.placeholder,
      order: fields.length + 1,
    };
    
    if (values.type === "select" && options.length > 0) {
      newField.options = [...options];
    }
    
    setFields((prev) => [...prev, newField]);
    setIsAddingField(false);
    setOptions([]);
    form.reset();
  };

  const handleUpdateField = (values: FieldFormValues) => {
    if (!editingFieldId) return;
    
    setFields((prev) =>
      prev.map((field) => {
        if (field.id === editingFieldId) {
          const updatedField: FieldConfig = {
            ...field,
            label: values.label,
            type: values.type as FieldType,
            required: values.required,
            helpText: values.helpText,
            placeholder: values.placeholder,
          };
          
          if (values.type === "select") {
            updatedField.options = [...options];
          } else {
            delete updatedField.options;
          }
          
          return updatedField;
        }
        return field;
      })
    );
    
    setEditingFieldId(null);
    setOptions([]);
    form.reset();
  };

  const handleEditField = (field: FieldConfig) => {
    setEditingFieldId(field.id);
    setOptions(field.options || []);
    
    form.reset({
      label: field.label,
      type: field.type,
      required: field.required,
      helpText: field.helpText || "",
      placeholder: field.placeholder || "",
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setFields((prev) => 
      prev.filter((field) => field.id !== fieldId)
        .map((field, index) => ({ ...field, order: index + 1 }))
    );
  };

  const handleMoveField = (fieldId: string, direction: "up" | "down") => {
    setFields((prev) => {
      const fieldIndex = prev.findIndex((field) => field.id === fieldId);
      if (fieldIndex === -1) return prev;
      
      const newFields = [...prev];
      
      if (direction === "up" && fieldIndex > 0) {
        // Swap with previous field
        [newFields[fieldIndex - 1], newFields[fieldIndex]] = 
          [newFields[fieldIndex], newFields[fieldIndex - 1]];
      } else if (direction === "down" && fieldIndex < newFields.length - 1) {
        // Swap with next field
        [newFields[fieldIndex], newFields[fieldIndex + 1]] = 
          [newFields[fieldIndex + 1], newFields[fieldIndex]];
      }
      
      // Update order
      return newFields.map((field, index) => ({ ...field, order: index + 1 }));
    });
  };

  const handleAddOption = () => {
    if (!optionInput.value || !optionInput.label) return;
    
    setOptions((prev) => [...prev, { ...optionInput }]);
    setOptionInput({ value: "", label: "" });
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const renderFieldForm = () => {
    const isEditing = !!editingFieldId;
    
    return (
      <Card className="my-4">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(isEditing ? handleUpdateField : handleAddField)} className="space-y-4">
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
              
              {form.watch("type") === "select" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Options</FormLabel>
                  </div>
                  
                  <div className="space-y-2">
                    {options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input value={option.value} disabled className="w-1/3" />
                        <Input value={option.label} disabled className="w-1/3" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <FormLabel className="block mb-2">Value</FormLabel>
                      <Input
                        value={optionInput.value}
                        onChange={(e) => setOptionInput({ ...optionInput, value: e.target.value })}
                        placeholder="option_value"
                      />
                    </div>
                    <div className="flex-1">
                      <FormLabel className="block mb-2">Label</FormLabel>
                      <Input
                        value={optionInput.label}
                        onChange={(e) => setOptionInput({ ...optionInput, label: e.target.value })}
                        placeholder="Option Label"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddOption}
                      className="mb-[1px]"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingField(false);
                    setEditingFieldId(null);
                    setOptions([]);
                    form.reset();
                  }}
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

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Input Fields</h3>
          {!isAddingField && !editingFieldId && (
            <Button onClick={() => setIsAddingField(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          )}
        </div>
        
        {(isAddingField || editingFieldId) && renderFieldForm()}
        
        <div className="space-y-4">
          {fields.length === 0 && !isAddingField && (
            <div className="text-center py-8 text-gray-500">
              <p>No fields added yet.</p>
              <p className="text-sm">Click "Add Field" to create your first input field.</p>
            </div>
          )}
          
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                onEdit={() => handleEditField(field)}
                onDelete={() => handleDeleteField(field.id)}
                onMoveUp={() => handleMoveField(field.id, "up")}
                onMoveDown={() => handleMoveField(field.id, "down")}
                isFirst={field.order === 1}
                isLast={field.order === fields.length}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldBuilder;
