
import { FieldConfig } from "@/types/prompt-templates";
import { Separator } from "@/components/ui/separator";
import { Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import FieldList from "./FieldList";

interface FallbackFieldsProps {
  fields: FieldConfig[];
  onEditField: (field: FieldConfig) => void;
  onDeleteField: (fieldId: string) => void;
  onMoveField: (fieldId: string, direction: "up" | "down") => void;
}

const FallbackFields = ({ fields, onEditField, onDeleteField, onMoveField }: FallbackFieldsProps) => {
  const [isOpen, setIsOpen] = useState(true);

  if (fields.length === 0) return null;

  return (
    <div className="mt-8">
      <Separator className="my-6" />
      
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full group">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Info className="h-4 w-4" />
            <h3 className="text-sm font-medium">Fallback Fields ({fields.length})</h3>
          </div>
          <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            Click to {isOpen ? 'hide' : 'show'}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <div className="rounded-lg border border-dashed p-4 bg-muted/30">
            <p className="text-sm text-muted-foreground mb-4">
              These are default fields that will be used if no custom fields are defined in the database.
            </p>
            <FieldList
              fields={fields}
              onEditField={onEditField}
              onDeleteField={onDeleteField}
              onMoveField={onMoveField}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default FallbackFields;
