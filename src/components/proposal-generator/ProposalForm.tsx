import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { RefreshCcw, User, CalendarDays, Palette, Home, FileText, Layers, Brush, Timer, ClipboardList, FileImage, Settings } from "lucide-react";
import { FieldConfig } from "@/types/prompt-templates";
import FormFieldRenderer from "./FormFieldRenderer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import FormSection from "./FormSection";
import ModeToggle from "./ModeToggle";

const FORM_SECTIONS = [
  {
    id: 'client',
    title: 'Client Information',
    icon: <User className="h-5 w-5" />,
    fields: ['clientName', 'projectAddress']
  },
  {
    id: 'project',
    title: 'Project Details',
    icon: <Layers className="h-5 w-5" />,
    fields: ['jobType', 'squareFootage']
  },
  {
    id: 'surfaces',
    title: 'Surfaces & Preparation',
    icon: <Brush className="h-5 w-5" />,
    fields: ['surfacesToPaint', 'prepNeeds']
  },
  {
    id: 'colors',
    title: 'Colors & Timeline',
    icon: <Palette className="h-5 w-5" />,
    fields: ['colorPalette', 'timeline']
  },
  {
    id: 'additional',
    title: 'Additional Information',
    icon: <ClipboardList className="h-5 w-5" />,
    fields: ['specialNotes']
  },
  {
    id: 'options',
    title: 'Proposal Options',
    icon: <Settings className="h-5 w-5" />,
    fields: ['showDetailedScope', 'breakoutQuote', 'includeTerms', 'uploadFiles']
  }
];

type FieldValue = string | number | boolean | string[];

interface ProposalFormProps {
  fields: FieldConfig[];
  isGenerating: boolean;
  onGenerate: (fieldValues: Record<string, FieldValue>, proposalId: string) => Promise<void>;
  templateName: string;
}

const ProposalForm = ({ fields, isGenerating, onGenerate, templateName }: ProposalFormProps) => {
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>({});
  const [formMode, setFormMode] = useState<'basic' | 'advanced'>('basic');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const getVisibleFields = () => {
    if (formMode === 'advanced') {
      return fields;
    } else {
      return fields.filter(field => field.complexity === 'basic' || field.required);
    }
  };

  const visibleFields = getVisibleFields();

  const handleFieldChange = (fieldId: string, value: FieldValue) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async () => {
    const missingRequiredFields = fields
      .filter(field => field.required)
      .filter(field => !fieldValues[field.id] && fieldValues[field.id] !== false && 
        !(Array.isArray(fieldValues[field.id]) && (fieldValues[field.id] as any[]).length > 0))
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

  const getFieldsBySection = () => {
    const result: Record<string, FieldConfig[]> = {};
    
    FORM_SECTIONS.forEach(section => {
      const sectionFields = visibleFields
        .filter(field => section.fields.includes(field.id))
        .sort((a, b) => a.order - b.order);
        
      if (sectionFields.length > 0) {
        result[section.id] = sectionFields;
      }
    });

    const remainingFields = visibleFields.filter(field => 
      !Object.values(result).flat().some(f => f.id === field.id)
    ).sort((a, b) => a.order - b.order);
    
    if (remainingFields.length > 0) {
      result['other'] = remainingFields;
    }
    
    return result;
  };

  const fieldsBySection = getFieldsBySection();

  const getFieldClass = (fieldId: string) => {
    if (['specialNotes', 'projectAddress', 'colorPalette'].includes(fieldId)) {
      return 'col-span-2';
    }
    return 'col-span-2 sm:col-span-1';
  };

  const visibleFieldCount = visibleFields.length;
  const totalFieldCount = fields.length;

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="bg-gray-50 border-b border-gray-100 rounded-t-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">{templateName}</CardTitle>
            <CardDescription>Fill out the form below to generate your professional proposal</CardDescription>
          </div>
          <div className="w-full sm:w-auto">
            <ModeToggle mode={formMode} onModeChange={setFormMode} />
          </div>
        </div>
        {formMode === 'basic' && totalFieldCount > visibleFieldCount && (
          <div className="mt-2 text-xs text-muted-foreground animate-fade-in">
            Showing {visibleFieldCount} of {totalFieldCount} fields. Switch to Advanced mode to see all options.
          </div>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {Object.entries(fieldsBySection).map(([sectionId, sectionFields]) => {
          if (sectionFields.length === 0) return null;
          
          const section = FORM_SECTIONS.find(s => s.id === sectionId);
          const isClientInfoSection = sectionId === 'client';
          
          return (
            <FormSection 
              key={sectionId} 
              title={section?.title || "Additional Information"} 
              icon={section?.icon}
              defaultOpen={isClientInfoSection}
            >
              <div className="grid grid-cols-2 gap-6">
                {sectionFields.map((field) => (
                  <div key={field.id} className={getFieldClass(field.id)}>
                    <FormFieldRenderer
                      field={field}
                      value={fieldValues[field.id] ?? (
                        field.type === 'checkbox-group' || field.type === 'multi-select' || field.type === 'file-upload' 
                          ? [] 
                          : field.type === 'toggle' 
                            ? false 
                            : ""
                      )}
                      onChange={(value) => handleFieldChange(field.id, value)}
                      isAdvanced={field.complexity === 'advanced'}
                    />
                  </div>
                ))}
              </div>
            </FormSection>
          );
        })}

        <div className="mt-8">
          <Button 
            className="w-full py-6 text-base bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white" 
            onClick={handleSubmit}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : "Generate Proposal"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalForm;
