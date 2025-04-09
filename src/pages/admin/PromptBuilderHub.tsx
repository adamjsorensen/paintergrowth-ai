
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const PromptBuilderHub = () => {
  const contentTypes = [
    {
      id: "proposal-generator",
      title: "Proposal Generator",
      description: "Configure the AI proposal generation template",
      icon: <FileText className="h-10 w-10 text-paintergrowth-600" />,
      link: "/admin/prompt-builder/proposal-generator"
    },
    {
      id: "new",
      title: "New Content Type",
      description: "Create a new AI content generation template",
      icon: <Plus className="h-10 w-10 text-muted-foreground" />,
      link: "#",
      disabled: true
    }
  ];

  return (
    <PageLayout title="Prompt Builder">
      <div className="container mx-auto">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/admin">Admin</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Prompt Builder</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Choose a content type to configure</h2>
          <p className="text-muted-foreground">Select the content generator you want to customize or create a new one.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentTypes.map((type) => (
            <Card 
              key={type.id} 
              className={`border border-gray-200 hover:shadow-md transition-shadow ${type.disabled ? 'opacity-70' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-4">{type.icon}</div>
                <CardTitle className="text-xl font-semibold text-center">{type.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{type.description}</CardDescription>
              </CardContent>
              <CardFooter className="pt-2 flex justify-center">
                <Button 
                  className="bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white w-full"
                  asChild
                  disabled={type.disabled}
                >
                  <Link to={type.link}>Configure</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default PromptBuilderHub;
