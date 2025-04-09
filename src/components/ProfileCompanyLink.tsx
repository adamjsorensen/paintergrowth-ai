
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

const ProfileCompanyLink = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Profile
        </CardTitle>
        <CardDescription>
          Add more information about your company to personalize AI-generated content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground">
          Your company details help our AI create more relevant and personalized content for your business.
        </p>
        <Button asChild>
          <Link to="/profile/company">Manage Company Information</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProfileCompanyLink;
