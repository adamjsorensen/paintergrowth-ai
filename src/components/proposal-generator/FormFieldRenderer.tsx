
import { FieldConfig } from "@/types/prompt-templates";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormFieldRendererProps {
  field: FieldConfig;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}

const FormFieldRenderer = ({ field, value, onChange }: FormFieldRendererProps) => {
  const { id, label, type, required, helpText, placeholder, options } = field;
  
  switch (type) {
    case "text":
      return (
        <div className="space-y-2" key={id}>
          <Label htmlFor={id}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={id}
            placeholder={placeholder || ""}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
          {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
        </div>
      );
    
    case "textarea":
      return (
        <div className="space-y-2" key={id}>
          <Label htmlFor={id}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Textarea
            id={id}
            placeholder={placeholder || ""}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
          {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
        </div>
      );
    
    case "select":
      return (
        <div className="space-y-2" key={id}>
          <Label htmlFor={id}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Select
            value={(value as string) || ""}
            onValueChange={(newValue) => onChange(newValue)}
          >
            <SelectTrigger id={id}>
              <SelectValue placeholder={placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
        </div>
      );
    
    case "number":
      return (
        <div className="space-y-2" key={id}>
          <Label htmlFor={id}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={id}
            type="number"
            placeholder={placeholder || ""}
            value={(value as number) || ""}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            required={required}
            min={field.min}
            max={field.max}
            step={field.step}
          />
          {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
        </div>
      );
    
    case "toggle":
      return (
        <div className="flex justify-between items-center space-x-2 py-2" key={id}>
          <div>
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
          </div>
          <Switch
            id={id}
            checked={value as boolean || false}
            onCheckedChange={(checked) => onChange(checked)}
          />
        </div>
      );
    
    case "date":
      return (
        <div className="space-y-2" key={id}>
          <Label htmlFor={id}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Input
            id={id}
            type="date"
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            required={required}
          />
          {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
        </div>
      );
    
    default:
      return null;
  }
};

export default FormFieldRenderer;
