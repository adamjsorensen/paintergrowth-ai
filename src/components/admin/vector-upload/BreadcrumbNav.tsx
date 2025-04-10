
import { Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";

export const BreadcrumbWithLinks = () => {
  const location = useLocation();
  const isManagePage = location.pathname.includes("/manage");

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/admin">Admin</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {isManagePage ? (
            <BreadcrumbLink asChild>
              <Link to="/admin/vector-upload">Vector Upload</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>Vector Upload</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {isManagePage && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Manage Documents</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
