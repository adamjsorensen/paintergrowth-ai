import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import SaveProposalDialog from "@/components/SaveProposalDialog";

// Form validation schema
const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  jobType: z.enum(["interior", "exterior", "cabinets"]),
  squareFootage: z.coerce.number().min(10, "Please enter valid square footage"),
  tone: z.enum(["professional", "friendly", "casual"]),
  additionalNotes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ProposalGenerator = () => {
  const [proposal, setProposal] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      jobType: "interior",
      squareFootage: undefined,
      tone: "professional",
      additionalNotes: "",
    },
  });

  const handleGenerate = async (values: FormValues) => {
    try {
      setIsGenerating(true);
      
      // For MVP, we'll simulate a delay and return hardcoded content
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const projectType = values.jobType.charAt(0).toUpperCase() + values.jobType.slice(1);
      const toneStyle = values.tone === "professional" 
        ? "formal and detailed" 
        : values.tone === "friendly" 
          ? "warm and personable" 
          : "casual and conversational";
      
      // Generate a sample proposal based on form values
      const proposalText = `
# Professional Painting Proposal for ${values.clientName}

## Project Overview
This proposal outlines our comprehensive ${projectType} Painting Service for your ${values.squareFootage} sq. ft. property.

## Our Approach
Our team specializes in high-quality ${projectType.toLowerCase()} painting services. We'll begin with thorough preparation of all surfaces, including cleaning, sanding, and priming as needed. Premium paints and materials will be used throughout the project to ensure a lasting finish.

## Project Timeline
Based on the ${values.squareFootage} sq. ft. area, we estimate this project will take approximately ${Math.ceil(values.squareFootage / 500)} days to complete, weather and conditions permitting.

## Investment
Our professional ${projectType.toLowerCase()} painting service for a property of ${values.squareFootage} sq. ft. is competitively priced at $${(values.squareFootage * 3.5).toFixed(2)}.

${values.additionalNotes ? `## Additional Notes\n${values.additionalNotes}` : ''}

We look forward to transforming your space with our professional painting services. Please let us know if you have any questions.

PainterGrowth Professional Painting
Generated with CrewkitAI by PainterGrowth
      `;
      
      setProposal(proposalText);
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was a problem generating your proposal. Please try again.",
        variant: "destructive",
      });
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal);
      toast({
        title: "Copied to clipboard",
        description: "The proposal has been copied to your clipboard.",
      });
    }
  };

  const handleSave = () => {
    setShowSaveDialog(true);
  };

  return (
    <PageLayout title="Generate Proposal">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC Properties" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="interior">Interior</SelectItem>
                          <SelectItem value="exterior">Exterior</SelectItem>
                          <SelectItem value="cabinets">Cabinets</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="squareFootage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Square Footage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="2000" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any specific details or requirements..." 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Generate Proposal"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Output Section */}
          <div>
            {proposal ? (
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
      {showSaveDialog && (
        <SaveProposalDialog
          open={showSaveDialog}
          onOpenChange={setShowSaveDialog}
          proposalContent={proposal || ""}
          clientName={form.getValues().clientName}
          jobType={form.getValues().jobType}
        />
      )}
    </PageLayout>
  );
};

export default ProposalGenerator;
