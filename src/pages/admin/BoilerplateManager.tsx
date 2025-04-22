
import { useState } from 'react';
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBoilerplateTexts, useBoilerplateMutations } from "@/hooks/useBoilerplate";
import { BoilerplateForm } from "@/components/boilerplate/BoilerplateForm";
import { BoilerplateText } from "@/types/boilerplate";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Trash, Plus } from "lucide-react";
import { PlaceholderManager } from "@/components/boilerplate/PlaceholderManager";

export default function BoilerplateManager() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("content");
  const { data: boilerplateTexts, isLoading } = useBoilerplateTexts();
  const { createBoilerplate, updateBoilerplate, deleteBoilerplate } = useBoilerplateMutations();

  const groupedTexts = boilerplateTexts?.reduce((acc, text) => {
    const key = text.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(text);
    return acc;
  }, {} as Record<string, BoilerplateText[]>) || {};

  const handleCreate = (data: Partial<BoilerplateText>) => {
    createBoilerplate.mutate(data as Omit<BoilerplateText, 'id' | 'version' | 'updated_at'>);
    setIsCreating(false);
  };

  const handleUpdate = (data: Partial<BoilerplateText>) => {
    if (editingId) {
      updateBoilerplate.mutate({ ...data, id: editingId });
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this boilerplate text?')) {
      deleteBoilerplate.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="Boilerplate Manager">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Boilerplate Manager">
      <div className="space-y-6">
        <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="content">Boilerplate Content</TabsTrigger>
            <TabsTrigger value="placeholders">Placeholder Defaults</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-6">
            {!isCreating && !editingId && (
              <Button onClick={() => setIsCreating(true)} className="mb-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Boilerplate Text
              </Button>
            )}

            {isCreating && (
              <BoilerplateForm
                onSubmit={handleCreate}
                onCancel={() => setIsCreating(false)}
              />
            )}

            {editingId && (
              <BoilerplateForm
                initialData={boilerplateTexts?.find(t => t.id === editingId)}
                onSubmit={handleUpdate}
                onCancel={() => setEditingId(null)}
              />
            )}

            {!isCreating && !editingId && (
              <Tabs defaultValue="terms_conditions">
                <TabsList>
                  <TabsTrigger value="terms_conditions">Terms & Conditions</TabsTrigger>
                  <TabsTrigger value="warranty">Warranty</TabsTrigger>
                  <TabsTrigger value="invoice_note">Invoice Notes</TabsTrigger>
                </TabsList>

                {Object.entries(groupedTexts).map(([type, texts]) => (
                  <TabsContent key={type} value={type}>
                    <div className="grid gap-4">
                      {texts.map((text) => (
                        <Card key={text.id}>
                          <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">
                              {text.locale === 'en-US' ? 'English (US)' : 'French (Canada)'}
                            </CardTitle>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingId(text.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(text.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-muted-foreground">
                              Version: {text.version}
                            </div>
                            <pre className="mt-2 whitespace-pre-wrap text-sm">
                              {text.content}
                            </pre>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </TabsContent>
          
          <TabsContent value="placeholders">
            <PlaceholderManager />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
