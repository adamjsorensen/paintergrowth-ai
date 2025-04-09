
import { ReactNode } from "react";
import Navbar from "./Navbar";

type PageLayoutProps = {
  title: string;
  children: ReactNode;
};

const PageLayout = ({ title, children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight mb-6">{title}</h1>
          {children}
        </div>
      </main>
    </div>
  );
};

export default PageLayout;
