
import PageLayout from "@/components/PageLayout";
import { BreadcrumbWithLinks } from "@/components/admin/vector-upload/BreadcrumbNav";
import VectorUploadForm from "@/components/admin/vector-upload/VectorUploadForm";
import VectorDocumentsSection from "@/components/admin/vector-upload/VectorDocumentsSection";
import ContentPreviewSection from "@/components/admin/vector-upload/ContentPreviewSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileStack } from "lucide-react";

const VectorUploadPage = () => {
  return (
    <PageLayout title="Vector Upload">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-4">
          <BreadcrumbWithLinks />
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/vector-upload/manage" className="flex items-center gap-2">
              <FileStack size={16} />
              Manage Documents
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VectorUploadForm />
          </div>

          <div>
            <ContentPreviewSection className="mb-6" />
            <VectorDocumentsSection />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default VectorUploadPage;
