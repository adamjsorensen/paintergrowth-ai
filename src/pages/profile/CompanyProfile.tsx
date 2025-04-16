
import { useAuth } from "@/components/AuthProvider";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyProfileData } from "@/hooks/profile/useCompanyProfileData";
import CompanyProfileForm from "@/components/profile/CompanyProfileForm";

const CompanyProfilePage = () => {
  const { user } = useAuth();
  const { data: companyProfile, isLoading } = useCompanyProfileData(user?.id);

  return (
    <PageLayout title="Company Profile">
      <div className="container max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Your company information helps personalize AI-generated content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CompanyProfileForm 
              userId={user?.id}
              initialData={companyProfile}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CompanyProfilePage;
