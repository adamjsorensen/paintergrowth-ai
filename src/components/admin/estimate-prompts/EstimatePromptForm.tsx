import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EstimatePromptTemplate, EstimatePromptTemplateInsert, createPrompt, updatePrompt, PromptPurpose } from "@/utils/estimatePrompts";

interface EstimatePromptFormProps {
  prompt?: EstimatePromptTemplate | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const purposeLabels: Record<PromptPurpose, string> = {
  scope: "Scope Extractor",
  suggestion: "Suggestion Engine", 
  pdf_summary: "PDF Summary",
  pdf_generation: "PDF Generation"
};

export const EstimatePromptForm = ({ prompt, onSuccess, onCancel }: EstimatePromptFormProps) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EstimatePromptTemplateInsert>({
    defaultValues: {
      name: prompt?.name || "",
      purpose: prompt?.purpose || "scope",
      model: prompt?.model || "gpt-4o",
      temperature: prompt?.temperature || 0.2,
      prompt_text: prompt?.prompt_text || "",
      active: prompt?.active || false
    }
  });

  const watchedPurpose = watch("purpose");
  const watchedActive = watch("active");

  const onSubmit = async (data: EstimatePromptTemplateInsert) => {
    setLoading(true);
    
    try {
      if (prompt) {
        await updatePrompt(prompt.id, data);
      } else {
        await createPrompt(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving prompt:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name", { required: "Name is required" })}
          placeholder="e.g. Scope Extractor v2"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Select
          value={watchedPurpose}
          onValueChange={(value: PromptPurpose) => setValue("purpose", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(purposeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          {...register("model", { required: "Model is required" })}
          placeholder="gpt-4o"
        />
        {errors.model && (
          <p className="text-sm text-destructive">{errors.model.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="temperature">Temperature</Label>
        <Input
          id="temperature"
          type="number"
          step="0.1"
          min="0"
          max="1"
          {...register("temperature", { 
            required: "Temperature is required",
            min: { value: 0, message: "Temperature must be at least 0" },
            max: { value: 1, message: "Temperature must be at most 1" },
            valueAsNumber: true
          })}
        />
        {errors.temperature && (
          <p className="text-sm text-destructive">{errors.temperature.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt_text">Prompt Text</Label>
        <Textarea
          id="prompt_text"
          rows={8}
          {...register("prompt_text", { 
            required: "Prompt text is required",
            minLength: { value: 10, message: "Prompt text must be at least 10 characters" }
          })}
          placeholder="Enter the prompt text..."
        />
        {errors.prompt_text && (
          <p className="text-sm text-destructive">{errors.prompt_text.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={watchedActive}
          onCheckedChange={(checked) => setValue("active", checked)}
        />
        <Label htmlFor="active">Active (only one prompt per purpose can be active)</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-paintergrowth-600 hover:bg-paintergrowth-700"
        >
          {loading ? "Saving..." : prompt ? "Update" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
