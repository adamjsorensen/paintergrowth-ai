
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ModeToggle from "@/components/proposal-generator/ModeToggle";
import { Badge } from "@/components/ui/badge";

interface ProposalFormHeaderProps {
  templateName: string;
  mode: 'basic' | 'advanced';
  onModeChange: (mode: 'basic' | 'advanced') => void;
  visibleFieldCount: number;
  totalFieldCount: number;
  projectType?: 'interior' | 'exterior';
}

const ProposalFormHeader = ({
  templateName,
  mode,
  onModeChange,
  visibleFieldCount,
  totalFieldCount,
  projectType
}: ProposalFormHeaderProps) => {
  return (
    <CardHeader className="border-b bg-muted/20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
        <div>
          <CardTitle className="text-xl font-semibold">{templateName}</CardTitle>
          <CardDescription>Fill out the form to generate your custom proposal</CardDescription>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          {projectType && (
            <Badge 
              variant="outline" 
              className="capitalize"
            >
              {projectType} Project
            </Badge>
          )}
          <ModeToggle mode={mode} onModeChange={onModeChange} />
        </div>
      </div>
      
      {mode === 'basic' && totalFieldCount > visibleFieldCount && (
        <div className="text-xs text-muted-foreground mt-2">
          Showing {visibleFieldCount} of {totalFieldCount} fields. 
          <span className="font-medium ml-1">
            Switch to Advanced mode to see all fields.
          </span>
        </div>
      )}
    </CardHeader>
  );
};

export default ProposalFormHeader;
