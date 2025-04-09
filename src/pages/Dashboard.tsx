
import { useAuth } from "@/components/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import { PlusCircle } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Painter';
  
  return (
    <PageLayout title="Dashboard">
      <div className="flex flex-col items-center justify-center max-w-3xl mx-auto py-12">
        <div className="bg-soft-blue/20 rounded-xl p-8 w-full text-center mb-12">
          <h2 className="text-3xl font-medium mb-3 text-gray-800">Welcome back, {firstName}</h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            Your painting business partner is ready to help you grow. 
            Generate professional content, track your success, and build your business.
          </p>
        </div>
        
        <div className="w-full max-w-md">
          <Button 
            onClick={() => navigate("/generate")}
            className="w-full py-8 text-lg bg-paintergrowth-600/90 hover:bg-paintergrowth-600 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-3"
          >
            <PlusCircle className="h-6 w-6" />
            <span>Create New Content</span>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
