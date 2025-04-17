
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { CompanyProfileFormValues } from "@/types/companyProfile";

interface BusinessInfoSectionProps {
  form: UseFormReturn<CompanyProfileFormValues>;
}

export const BusinessInfoSection = ({ form }: BusinessInfoSectionProps) => {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="business_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Your business name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="City, State" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="services_offered"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Services Offered</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe the services your company offers" 
                className="min-h-[100px]" 
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
