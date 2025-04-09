
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { FieldConfig } from "@/types/prompt-templates";
import FormFieldRenderer from "./FormFieldRenderer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

type FieldValue = string | number | boolean;

interface ProposalFormProps {
  fields: FieldConfig[];
  isGenerating: boolean;
  onGenerate: (fieldValues: Record<string, FieldValue>, proposalId: string) => Promise<void>;
  templateName: string;
}

const ProposalForm = ({ fields, isGenerating, onGenerate, templateName }: ProposalFormProps) => {
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async () => {
    // Check if required fields are filled
    const missingRequiredFields = fields
      .filter(field => field.required)
      .filter(field => !fieldValues[field.id] && fieldValues[field.id] !== false)
      .map(field => field.label);

    if (missingRequiredFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingRequiredFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    const proposalId = uuidv4();

    // Create an empty proposal record in the database with pending status
    if (user) {
      try {
        await supabase
          .from('saved_proposals')
          .insert({
            id: proposalId,
            user_id: user.id,
            title: `${fieldValues['clientName'] || 'New'} Proposal (Draft)`,
            content: "",
            client_name: fieldValues['clientName'] as string || null,
            job_type: fieldValues['jobType'] as string || null,
            status: "pending"
          });
      } catch (error) {
        console.error("Error creating initial proposal record:", error);
        toast({
          title: "Error",
          description: "Failed to initialize proposal generation",
          variant: "destructive",
        });
        return;
      }
    }

    // Start the generation in the background and redirect to view page
    try {
      onGenerate(fieldValues, proposalId);
      navigate(`/generate/proposal/${proposalId}`);
    } catch (error) {
      console.error("Error during generation redirect:", error);
      toast({
        title: "Error",
        description: "Failed to start proposal generation",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="bg-gray-50 border-b border-gray-100 rounded-t-lg p-6">
        <CardTitle className="text-xl font-semibold">{templateName}</CardTitle>
        <CardDescription>Fill out the form below to generate your professional proposal</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {fields
          .sort((a, b) => a.order - b.order)
          .map((field) => (
            <FormFieldRenderer
              key={field.id}
              field={field}
              value={fieldValues[field.id] ?? ""}
              onChange={(value) => handleFieldChange(field.id, value)}
            />
          ))}

        <Button 
          className="w-full mt-4 bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white" 
          onClick={handleSubmit}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : "Generate Proposal"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProposalForm;
