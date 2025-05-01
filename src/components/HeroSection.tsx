
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 hero-gradient">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-10">
          <div className="space-y-4 max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-paintergrowth-900 tracking-tight">
              Revolutionize Your Painting Business with AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Paintergrowth.ai empowers painting contractors with AI tools to
              simplify operations, maximize profits, and unlock scalable growth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-slow">
            <Button 
              className="bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white px-8 py-6 text-lg"
              asChild
            >
              <Link to="/auth">Get Started Free</Link>
            </Button>
            <Button variant="outline" className="border-paintergrowth-300 text-paintergrowth-700 hover:bg-paintergrowth-50 px-8 py-6 text-lg">
              See Demo
            </Button>
          </div>

          <div className="w-full max-w-4xl mx-auto mt-12 relative animate-fade-in-slow">
            <div className="bg-white p-2 rounded-xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="w-full h-[400px] bg-paintergrowth-50 rounded-lg flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
                  <h3 className="text-paintergrowth-800 text-lg font-semibold mb-4">AI Content Generator</h3>
                  <div className="space-y-2 mb-6">
                    <div className="h-3 bg-paintergrowth-100 rounded-full w-full"></div>
                    <div className="h-3 bg-paintergrowth-100 rounded-full w-5/6"></div>
                    <div className="h-3 bg-paintergrowth-100 rounded-full w-4/6"></div>
                  </div>
                  <div className="bg-paintergrowth-600 text-white text-center py-2 rounded-md w-full">
                    Generate Content
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 -left-3 h-12 bg-gradient-to-t from-background to-transparent z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
