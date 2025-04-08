
import { PaintBucket, Sparkles, Clock, ArrowRight, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FeaturesSection = () => {
  const features = [
    {
      icon: <PaintBucket className="h-6 w-6 text-paintergrowth-600" />,
      title: "Industry-Specific AI",
      description:
        "Trained on top-performing painting business content to generate results specifically for your industry.",
    },
    {
      icon: <Sparkles className="h-6 w-6 text-paintergrowth-600" />,
      title: "Low-To-No Prompt",
      description:
        "Skip the learning curve. Our AI understands your business context without complex prompting.",
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-paintergrowth-600" />,
      title: "Custom Tailored",
      description:
        "Content automatically tailored to your business style, services, and target clientele.",
    },
    {
      icon: <Clock className="h-6 w-6 text-paintergrowth-600" />,
      title: "Time-Saving",
      description:
        "Generate weeks worth of content in minutes, freeing you to focus on your core business.",
    },
  ];

  return (
    <section className="py-20" id="features">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-paintergrowth-900 mb-4">
            AI Tools Designed for Painting Contractors
          </h2>
          <p className="text-muted-foreground text-lg">
            Our industry-specific AI tools handle your content so you can focus on growing your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="mb-2">{feature.icon}</div>
                <CardTitle className="text-xl text-paintergrowth-800">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <a
            href="#"
            className="inline-flex items-center text-paintergrowth-600 font-medium hover:text-paintergrowth-700 transition-colors"
          >
            Learn more about our features
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
