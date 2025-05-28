import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, FileText, Upload, Database, Image } from "lucide-react";
import { Link } from "react-router-dom";

const AdminHub = () => {
  const adminTools = [
    {
      title: "Prompt Builder",
      description: "Configure and manage proposal generation templates",
      icon: <FileText className="h-10 w-10 text-paintergrowth-600" />,
      link: "/admin/prompt-builder"
    },
    {
      title: "AI Settings",
      description: "Configure global AI settings and default prompts",
      icon: <Settings className="h-10 w-10 text-paintergrowth-600" />,
      link: "/admin/ai-settings"
    },
    {
      title: "Vector Upload",
      description: "Upload and vectorize content for RAG implementation",
      icon: <Upload className="h-10 w-10 text-paintergrowth-600" />,
      link: "/admin/vector-upload"
    },
    {
      title: "Activity Logs",
      description: "View system activity and generation logs",
      icon: <Database className="h-10 w-10 text-paintergrowth-600" />,
      link: "/admin/logs/activity"
    },
    {
      title: "Proposal PDF Settings",
      description: "Configure cover image for proposal PDFs",
      icon: <Image className="h-10 w-10 text-paintergrowth-600" />,
      link: "/admin/proposal-settings"
    },
    {
      title: "Boilerplate Manager",
      description: "Manage proposal boilerplate content and placeholders",
      icon: <FileText className="h-10 w-10 text-paintergrowth-600" />,
      link: "/admin/boilerplate"
    },
    {
      title: "Estimate Prompts",
      description: "Manage AI prompts used in estimate generation",
      icon: <FileText className="h-10 w-10 text-paintergrowth-600" />,
      link: "/admin/estimate-prompts"
    }
  ];

  return (
    <PageLayout title="Admin Dashboard">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminTools.map((tool) => (
            <Card key={tool.title} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-4">{tool.icon}</div>
                <CardTitle className="text-xl font-semibold text-center">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{tool.description}</CardDescription>
              </CardContent>
              <CardFooter className="pt-2 flex justify-center">
                <Button 
                  className="bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white w-full"
                  asChild
                >
                  <Link to={tool.link}>Open {tool.title}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminHub;
