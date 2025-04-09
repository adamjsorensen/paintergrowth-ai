
import { FieldConfig } from "@/types/prompt-templates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, ChevronUp, ChevronDown } from "lucide-react";

interface FieldCardProps {
  field: FieldConfig;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const FieldCard: React.FC<FieldCardProps> = ({
  field,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  return (
    <Card className="relative border border-gray-200 hover:border-gray-300 transition-all">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{field.label}</h4>
              {field.required && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                  Required
                </span>
              )}
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded capitalize">
                {field.type}
              </span>
            </div>
            
            <p className="text-sm text-gray-500">
              Field key: <code className="bg-gray-100 px-1 py-0.5 rounded">{`{{${field.id}}}`}</code>
            </p>
            
            {field.helpText && (
              <p className="text-sm text-gray-500">{field.helpText}</p>
            )}
            
            {field.type === "select" && field.options && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">Options:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {field.options.map((option, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-xs px-2 py-0.5 rounded"
                    >
                      {option.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onDelete}
            >
              <span className="h-4 w-4">×</span>
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
      
      <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onMoveUp}
          disabled={isFirst}
        >
          <ChevronUp className="h-4 w-4" />
          <span className="sr-only">Move up</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onMoveDown}
          disabled={isLast}
        >
          <ChevronDown className="h-4 w-4" />
          <span className="sr-only">Move down</span>
        </Button>
      </div>
    </Card>
  );
};

export default FieldCard;
