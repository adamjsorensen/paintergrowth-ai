
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import StylePreferencesDialog from "@/components/proposal-generator/StylePreferencesDialog";

const GenerateIndex = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  const contentTypes = [
    {
      id: "proposal",
      title: "Proposal",
      description: "Generate professional painting proposals for your clients",
      icon: <FileText className="h-10 w-10 text-paintergrowth-600" />,
      onClick: () => setDialogOpen(true),
    },
    // Additional content types will be added here in the future
  ];

  return (
    <PageLayout title="Generate Content">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentTypes.map((contentType) => (
            <Card key={contentType.id} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-4">{contentType.icon}</div>
                <CardTitle className="text-xl font-semibold text-center">{contentType.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{contentType.description}</CardDescription>
              </CardContent>
              <CardFooter className="pt-2 flex justify-center">
                <Button 
                  className="bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white w-full"
                  onClick={contentType.onClick}
                >
                  Create {contentType.title}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <StylePreferencesDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </PageLayout>
  );
};

export default GenerateIndex;
