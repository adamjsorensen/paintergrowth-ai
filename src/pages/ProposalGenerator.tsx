
import { useState, useEffect } from "react";
import { z } from "zod";
import { Copy, Save, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PromptTemplate, FieldConfig, parseFieldConfig } from "@/types/prompt-templates";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import PageLayout from "@/components/PageLayout";
import SaveProposalDialog from "@/components/SaveProposalDialog";
import { Progress } from "@/components/ui/progress";

type FieldValue = string | number | boolean;

const ProposalGenerator = () => {
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate | null>(null);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>({});
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true);
  const [isLoadingGeneration, setIsLoadingGeneration] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { toast } = useToast();

  // Fetch the active prompt template on component mount
  useEffect(() => {
    const fetchActivePromptTemplate = async () => {
      try {
        const { data, error } = await supabase
          .from("prompt_templates")
          .select("*")
          .eq("active", true)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const parsedTemplate = {
            ...data,
            field_config: parseFieldConfig(data.field_config)
          } as PromptTemplate;
          
          setPromptTemplate(parsedTemplate);
          setFields(parseFieldConfig(data.field_config));
        }
      } catch (error) {
        console.error("Error fetching prompt template:", error);
        toast({
          title: "Error",
          description: "Could not load proposal template",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTemplate(false);
      }
    };

    fetchActivePromptTemplate();
  }, [toast]);

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleGenerate = async () => {
    if (!promptTemplate) {
      toast({
        title: "Error",
        description: "No prompt template available",
        variant: "destructive",
      });
      return;
    }

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

    try {
      setIsLoadingGeneration(true);
      setProposal(null);

      const response = await supabase.functions.invoke('generate_proposal', {
        body: {
          prompt_id: promptTemplate.id,
          field_values: fieldValues
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate proposal");
      }

      setProposal(response.data.content);
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGeneration(false);
    }
  };

  const handleCopy = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal);
      toast({
        title: "Copied to clipboard",
        description: "The proposal has been copied to your clipboard",
      });
    }
  };

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  const renderField = (field: FieldConfig) => {
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
              value={(fieldValues[id] as string) || ""}
              onChange={(e) => handleFieldChange(id, e.target.value)}
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
              value={(fieldValues[id] as string) || ""}
              onChange={(e) => handleFieldChange(id, e.target.value)}
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
              value={(fieldValues[id] as string) || ""}
              onValueChange={(value) => handleFieldChange(id, value)}
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
              value={(fieldValues[id] as number) || ""}
              onChange={(e) => handleFieldChange(id, parseFloat(e.target.value))}
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
              checked={fieldValues[id] as boolean || false}
              onCheckedChange={(checked) => handleFieldChange(id, checked)}
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
              value={(fieldValues[id] as string) || ""}
              onChange={(e) => handleFieldChange(id, e.target.value)}
              required={required}
            />
            {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (isLoadingTemplate) {
    return (
      <PageLayout title="Generate Proposal">
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!promptTemplate) {
    return (
      <PageLayout title="Generate Proposal">
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Active Template</h2>
            <p className="text-gray-600">
              There is no active proposal template. Please set up a template in the admin section.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Generate Proposal">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">{promptTemplate.name}</h2>
              <div className="space-y-6">
                {fields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => renderField(field))}
  
                <Button 
                  className="w-full" 
                  onClick={handleGenerate}
                  disabled={isLoadingGeneration}
                >
                  {isLoadingGeneration ? (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : "Generate Proposal"}
                </Button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div>
            {isLoadingGeneration ? (
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col justify-center items-center h-full">
                  <div className="space-y-4 text-center">
                    <RefreshCcw className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <h3 className="font-medium">Generating your proposal...</h3>
                    <Progress value={65} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      This may take a few moments
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : proposal ? (
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="mb-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleSave}>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  </div>
                  <div className="prose prose-blue max-w-none overflow-auto">
                    <div className="whitespace-pre-wrap font-sans">
                      {proposal}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed border-gray-300 rounded-lg p-12 text-center">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-600">No Proposal Generated Yet</h3>
                  <p className="text-sm text-gray-500">
                    Fill out the form and click "Generate Proposal" to create your customized proposal
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && proposal && (
        <SaveProposalDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          proposalContent={proposal}
          clientName={fieldValues['clientName'] as string || ''}
          jobType={fieldValues['jobType'] as string || ''}
        />
      )}
    </PageLayout>
  );
};

export default ProposalGenerator;
