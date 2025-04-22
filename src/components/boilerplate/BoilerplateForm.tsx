
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BoilerplateText, BoilerplateType } from '@/types/boilerplate';

interface BoilerplateFormProps {
  initialData?: BoilerplateText;
  onSubmit: (data: Partial<BoilerplateText>) => void;
  onCancel: () => void;
}

const LOCALES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'fr-CA', label: 'French (Canada)' },
];

const TYPES: { value: BoilerplateType; label: string }[] = [
  { value: 'terms_conditions', label: 'Terms & Conditions' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'invoice_note', label: 'Invoice Note' },
];

export function BoilerplateForm({ initialData, onSubmit, onCancel }: BoilerplateFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      type: 'terms_conditions' as BoilerplateType,
      locale: 'en-US',
      content: '',
    },
  });

  const [type, setType] = useState<BoilerplateType>(initialData?.type || 'terms_conditions');
  const [locale, setLocale] = useState(initialData?.locale || 'en-US');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{initialData ? 'Edit' : 'Create'} Boilerplate Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              defaultValue={type}
              onValueChange={(value: BoilerplateType) => setType(value)}
              {...register('type')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locale">Locale</Label>
            <Select 
              defaultValue={locale}
              onValueChange={setLocale}
              {...register('locale')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select locale" />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map(locale => (
                  <SelectItem key={locale.value} value={locale.value}>
                    {locale.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              {...register('content', { required: true })}
              placeholder="Enter boilerplate text with {{placeholders}}"
              className="min-h-[200px]"
            />
            {errors.content && (
              <p className="text-sm text-red-500">Content is required</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
