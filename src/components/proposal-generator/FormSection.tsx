
import { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}

const FormSection = ({ title, children, icon }: FormSectionProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4 pb-2 border-b border-gray-100">
        {icon && <div className="mr-2 text-paintergrowth-600">{icon}</div>}
        <h3 className="text-base font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FormSection;
