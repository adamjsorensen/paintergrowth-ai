
import { ReactNode, useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
}

const FormSection = ({ title, children, icon, defaultOpen = false }: FormSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mb-6"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between pb-2 mb-2 border-b border-gray-100">
        <div className="flex items-center">
          {icon && <div className="mr-2 text-paintergrowth-600">{icon}</div>}
          <h3 className="text-base font-semibold text-gray-700">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FormSection;
