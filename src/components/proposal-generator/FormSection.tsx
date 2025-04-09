
import { ReactNode, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
}

const FormSection = ({ title, children, icon, defaultOpen = false }: FormSectionProps) => {
  const [collapsed, setCollapsed] = useState(!defaultOpen);

  return (
    <div className="mb-8">
      <div 
        className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 cursor-pointer" 
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center">
          {icon && <div className="mr-2 text-paintergrowth-600">{icon}</div>}
          <h3 className="text-base font-semibold text-gray-700">{title}</h3>
        </div>
        <button 
          type="button" 
          className="text-gray-500 hover:text-gray-800 transition-colors"
          aria-label={collapsed ? "Expand section" : "Collapse section"}
        >
          {collapsed ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronUp className="h-5 w-5" />
          )}
        </button>
      </div>
      <div 
        className={`space-y-4 transition-all duration-300 ease-in-out ${
          collapsed ? 'h-0 opacity-0 overflow-hidden' : 'opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default FormSection;
