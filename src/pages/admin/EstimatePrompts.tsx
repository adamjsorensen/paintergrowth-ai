
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Copy, Trash2 } from "lucide-react";
import { EstimatePromptTemplate, getAllPrompts, deletePrompt, duplicatePrompt } from "@/utils/estimatePrompts";
import { EstimatePromptForm } from "@/components/admin/estimate-prompts/EstimatePromptForm";
import { EstimatePromptTable } from "@/components/admin/estimate-prompts/EstimatePromptTable";

const EstimatePrompts = () => {
  const [prompts, setPrompts] = useState<EstimatePromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<EstimatePromptTemplate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const loadPrompts = async () => {
    setLoading(true);
    const data = await getAllPrompts();
    setPrompts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const handleDelete = async (id: string) => {
    const success = await deletePrompt(id);
    if (success) {
      toast({
        title: "Prompt deleted",
        description: "The prompt template has been removed.",
      });
      await loadPrompts();
    } else {
      toast({
        title: "Error",
        description: "Failed to delete prompt template.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (id: string) => {
    const newPrompt = await duplicatePrompt(id);
    if (newPrompt) {
      toast({
        title: "Prompt duplicated",
        description: "A copy of the prompt has been created.",
      });
      await loadPrompts();
    } else {
      toast({
        title: "Error",
        description: "Failed to duplicate prompt template.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (prompt: EstimatePromptTemplate) => {
    setEditingPrompt(prompt);
    setIsFormOpen(true);
  };

  const handleFormSuccess = async () => {
    setIsFormOpen(false);
    setEditingPrompt(null);
    await loadPrompts();
    toast({
      title: "Prompt saved",
      description: "The prompt template has been saved successfully.",
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPrompt(null);
  };

  return (
    <PageLayout title="Estimate Prompt Manager">
      <div className="container mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold">Prompt Templates</h2>
            <p className="text-muted-foreground">
              Manage AI prompts used in the estimate generation process
            </p>
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-paintergrowth-600 hover:bg-paintergrowth-700">
                <Plus className="h-4 w-4 mr-2" />
                New Prompt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPrompt ? 'Edit Prompt Template' : 'Create New Prompt Template'}
                </DialogTitle>
              </DialogHeader>
              <EstimatePromptForm
                prompt={editingPrompt}
                onSuccess={handleFormSuccess}
                onCancel={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>

        <EstimatePromptTable
          prompts={prompts}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      </div>
    </PageLayout>
  );
};

export default EstimatePrompts;
