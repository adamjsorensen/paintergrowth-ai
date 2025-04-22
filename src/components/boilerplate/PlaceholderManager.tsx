
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBoilerplateTexts, usePlaceholderDefaults, useBoilerplateMutations } from '@/hooks/useBoilerplate';
import { extractPlaceholders } from '@/utils/boilerplateUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, PlusCircle, Save } from 'lucide-react';
import { PlaceholderDefault } from '@/types/boilerplate';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function PlaceholderManager() {
  const { data: boilerplateTexts } = useBoilerplateTexts();
  const { data: placeholderDefaults } = usePlaceholderDefaults();
  const { createPlaceholderDefault } = useBoilerplateMutations();
  const { toast } = useToast();
  const [allPlaceholders, setAllPlaceholders] = useState<string[]>([]);
  const [currentPlaceholder, setCurrentPlaceholder] = useState<string>('');
  const [defaultValue, setDefaultValue] = useState<string>('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlaceholderDefault>();

  // Extract all placeholders from boilerplate texts
  useEffect(() => {
    if (boilerplateTexts && boilerplateTexts.length > 0) {
      const placeholders = boilerplateTexts.flatMap(text => 
        extractPlaceholders(text.content)
      );
      setAllPlaceholders([...new Set(placeholders)]);
    }
  }, [boilerplateTexts]);

  const onSubmit = async (data: PlaceholderDefault) => {
    try {
      await createPlaceholderDefault.mutateAsync(data);
      reset();
      setCurrentPlaceholder('');
      setDefaultValue('');
    } catch (error) {
      console.error('Error creating placeholder default:', error);
    }
  };

  const handleUpdatePlaceholder = async (placeholder: string, value: string) => {
    try {
      const { error } = await supabase
        .from('placeholder_defaults')
        .update({ default_value: value })
        .eq('placeholder', placeholder);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Default value updated successfully",
      });
    } catch (error) {
      console.error('Error updating placeholder default:', error);
      toast({
        title: "Error",
        description: "Failed to update default value",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Placeholder Defaults</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="placeholder">Placeholder Name</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="placeholder"
                    {...register('placeholder', { required: true })}
                    value={currentPlaceholder}
                    onChange={(e) => setCurrentPlaceholder(e.target.value)}
                    placeholder="e.g. companyName"
                  />
                  {allPlaceholders.length > 0 && (
                    <select
                      className="h-10 px-3 rounded-md border"
                      onChange={(e) => {
                        if (e.target.value) setCurrentPlaceholder(e.target.value);
                      }}
                    >
                      <option value="">Select from detected...</option>
                      {allPlaceholders.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  )}
                </div>
                {errors.placeholder && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Placeholder name is required
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_value">Default Value</Label>
                <Input
                  id="default_value"
                  {...register('default_value', { required: true })}
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder="Default value when not provided"
                />
                {errors.default_value && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Default value is required
                  </p>
                )}
              </div>
            </div>
            <Button type="submit" className="mt-4">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Default Value
            </Button>
          </form>
        </CardContent>
      </Card>

      {placeholderDefaults && Object.keys(placeholderDefaults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Default Values</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placeholder</TableHead>
                  <TableHead>Default Value</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(placeholderDefaults).map(([placeholder, defaultValue]) => (
                  <TableRow key={placeholder}>
                    <TableCell className="font-medium">{{'{{'}{placeholder}{'}}'}}}</TableCell>
                    <TableCell>
                      <Input
                        defaultValue={defaultValue}
                        onChange={(e) => e.target.dataset.value = e.target.value}
                        data-placeholder={placeholder}
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          const input = document.querySelector(`input[data-placeholder="${placeholder}"]`) as HTMLInputElement;
                          if (input && input.dataset.value) {
                            handleUpdatePlaceholder(placeholder, input.dataset.value);
                          }
                        }}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
