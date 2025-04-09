
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  PromptTemplate, 
  FieldConfig, 
  parseFieldConfig
} from "@/types/prompt-templates";
import PageLayout from "@/components/PageLayout";
import PromptBuilderForm from "@/components/prompt-builder/PromptBuilderForm";

const PromptBuilder = () => {
  const [promptTemplate, setPromptTemplate] = useState<PromptTemplate | null>(null);
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPromptTemplate = async () => {
      try {
        const { data, error } = await supabase
          .from("prompt_templates")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

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
          description: "Failed to load prompt template",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPromptTemplate();
  }, [toast]);

  if (loading) {
    return (
      <PageLayout title="Prompt Builder">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Prompt Builder">
      <div className="container mx-auto max-w-5xl">
        <div className="p-6">
          <PromptBuilderForm 
            initialTemplate={promptTemplate} 
            initialFields={fields}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default PromptBuilder;
