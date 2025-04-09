
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { File, Lock } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

const PromptBuilderHub = () => {
  const promptTypes = [
    {
      title: "Proposal Generator",
      description: "Configure the AI prompt template for generating client proposals",
      icon: <File className="h-5 w-5 text-paintergrowth-600" />,
      link: "/admin/prompt-builder/proposal-generator",
      disabled: false
    },
    {
      title: "New Content Type",
      description: "Add a new AI content generator type (coming soon)",
      icon: <Lock className="h-5 w-5 text-gray-400" />,
      link: "#",
      disabled: true
    }
  ];

  return (
    <PageLayout title="Prompt Builder">
      <div className="container mx-auto max-w-5xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} to="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Prompt Builder</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Choose a content type to configure</h2>
          <p className="text-muted-foreground">
            Select the type of content for which you want to configure the AI prompt template.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promptTypes.map((type, index) => (
            <Card 
              key={index} 
              className={`transition-all ${type.disabled ? 'opacity-60' : 'hover:shadow-md'}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  {type.icon}
                </div>
                <CardTitle className="mt-2">{type.title}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {!type.disabled ? (
                  <Link 
                    to={type.link} 
                    className="text-paintergrowth-600 hover:text-paintergrowth-800 font-medium text-sm"
                  >
                    Configure →
                  </Link>
                ) : (
                  <span className="text-gray-400 text-sm">Coming soon</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default PromptBuilderHub;
