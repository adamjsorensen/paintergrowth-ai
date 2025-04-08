
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const CTASection = () => {
  const benefits = [
    "No complex prompting required",
    "Industry-specific AI training",
    "Business-focused content generation",
    "14-day free trial, no credit card required",
  ];

  return (
    <section className="py-20 bg-paintergrowth-600 text-white">
      <div className="container px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Painting Business?
          </h2>
          <p className="text-xl text-paintergrowth-100 max-w-2xl mx-auto">
            Join the painting contractors who are working less, earning more, and
            building businesses they love with Paintergrowth.ai.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 bg-paintergrowth-700 rounded-lg"
              >
                <CheckCircle className="h-6 w-6 mb-2 text-paintergrowth-300" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <Button className="bg-white text-paintergrowth-700 hover:bg-paintergrowth-50 px-8 py-6 text-lg font-medium">
              Start Your Free Trial
            </Button>
            <p className="mt-4 text-sm text-paintergrowth-200">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
