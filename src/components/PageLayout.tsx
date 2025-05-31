
import { ReactNode } from "react";

type PageLayoutProps = {
  title: string;
  children: ReactNode;
};

const PageLayout = ({ title, children }: PageLayoutProps) => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">{title}</h1>
      {children}
    </div>
  );
};

export default PageLayout;
