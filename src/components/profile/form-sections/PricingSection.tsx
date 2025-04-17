
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CompanyProfileFormValues } from "@/types/companyProfile";

interface PricingSectionProps {
  form: UseFormReturn<CompanyProfileFormValues>;
}

export const PricingSection = ({ form }: PricingSectionProps) => {
  return (
    <FormField
      control={form.control}
      name="pricing_notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Pricing Notes</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Add information about your pricing structure" 
              className="min-h-[100px]" 
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
