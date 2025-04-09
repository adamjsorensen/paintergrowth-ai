
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PageLayout from "@/components/PageLayout";
import { Link } from "react-router-dom";
import { Gauge, PencilRuler, Database, Settings } from "lucide-react";

const AdminHub = () => {
  const adminCards = [
    {
      title: "Prompt Builder",
      description: "Configure AI prompt templates for different content types",
      icon: <PencilRuler className="h-6 w-6 text-paintergrowth-600" />,
      link: "/admin/prompt-builder",
    },
    {
      title: "AI Settings",
      description: "Configure AI model behavior and parameters",
      icon: <Settings className="h-6 w-6 text-paintergrowth-600" />,
      link: "/admin/ai-settings",
    },
    {
      title: "Vector Upload",
      description: "Upload and manage knowledge base documents",
      icon: <Database className="h-6 w-6 text-paintergrowth-600" />,
      link: "/admin/vector-upload",
    }
  ];

  return (
    <PageLayout title="Admin Dashboard">
      <div className="container mx-auto max-w-5xl">
        <p className="text-muted-foreground mb-8">
          Manage AI content generation, system settings, and knowledge base.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card, index) => (
            <Card key={index} className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  {card.icon}
                </div>
                <CardTitle className="mt-2">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link 
                  to={card.link} 
                  className="text-paintergrowth-600 hover:text-paintergrowth-800 font-medium text-sm"
                >
                  Configure →
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminHub;
