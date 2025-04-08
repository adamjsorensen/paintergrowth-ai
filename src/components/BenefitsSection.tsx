
import { TrendingUp, Clock, Users, Rocket } from "lucide-react";

const BenefitsSection = () => {
  return (
    <section className="py-20 bg-paintergrowth-50" id="benefits">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-paintergrowth-900 mb-4">
            Why It Matters For Your Business
          </h2>
          <p className="text-muted-foreground text-lg">
            Our AI tools transform how painting contractors run their business, giving you back time while increasing profitability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 rounded-full bg-paintergrowth-100 flex items-center justify-center mb-5">
              <Clock className="h-6 w-6 text-paintergrowth-600" />
            </div>
            <h3 className="text-xl font-medium text-paintergrowth-800 mb-3">
              Work Less
            </h3>
            <p className="text-gray-600">
              Automate content creation and marketing efforts so you can focus on
              delivering quality work and managing your team. Reclaim your nights and weekends.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="h-12 w-12 rounded-full bg-paintergrowth-100 flex items-center justify-center mb-5">
              <TrendingUp className="h-6 w-6 text-paintergrowth-600" />
            </div>
            <h3 className="text-xl font-medium text-paintergrowth-800 mb-3">
              Earn More
            </h3>
            <p className="text-gray-600">
              Professional marketing content attracts higher-value clients and
              increases your conversion rates. Stop competing on price and start
              selling your expertise.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2 lg:col-span-1">
            <div className="h-12 w-12 rounded-full bg-paintergrowth-100 flex items-center justify-center mb-5">
              <Rocket className="h-6 w-6 text-paintergrowth-600" />
            </div>
            <h3 className="text-xl font-medium text-paintergrowth-800 mb-3">
              Scale Your Business
            </h3>
            <p className="text-gray-600">
              Build systems that let you delegate and grow. With consistent,
              quality content and marketing, you can build a painting business
              that runs efficiently even when you're not hands-on.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-8 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold text-paintergrowth-800 mb-4">
                A Business You'll Love
              </h3>
              <p className="text-gray-600 mb-6">
                Paintergrowth.ai helps you transform your painting business from
                a demanding job into a scalable company that works for you. Stop
                feeling overwhelmed by marketing and business growth - our AI
                tools give you the leverage to build the business you've always
                wanted.
              </p>
              <div className="flex items-center space-x-4">
                <Users className="h-6 w-6 text-paintergrowth-600" />
                <p className="text-sm text-gray-500">
                  Join hundreds of painting contractors already using
                  Paintergrowth.ai
                </p>
              </div>
            </div>
            <div className="md:w-1/3">
              <div className="bg-paintergrowth-600 text-white p-6 rounded-lg text-center">
                <h4 className="text-xl font-bold mb-2">Ready to start?</h4>
                <p className="mb-4 text-paintergrowth-100">
                  Try Paintergrowth.ai free for 14 days
                </p>
                <button className="w-full bg-white text-paintergrowth-700 py-2 px-4 rounded font-medium hover:bg-paintergrowth-50 transition-colors">
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
