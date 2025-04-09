
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ModeToggle from "../ModeToggle";

interface ProposalFormHeaderProps {
  templateName: string;
  mode: 'basic' | 'advanced';
  onModeChange: (mode: 'basic' | 'advanced') => void;
  visibleFieldCount: number;
  totalFieldCount: number;
}

const ProposalFormHeader = ({ 
  templateName, 
  mode, 
  onModeChange, 
  visibleFieldCount, 
  totalFieldCount 
}: ProposalFormHeaderProps) => {
  return (
    <CardHeader className="bg-gray-50 border-b border-gray-100 rounded-t-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="text-xl font-semibold">{templateName}</CardTitle>
          <CardDescription>Fill out the form below to generate your professional proposal</CardDescription>
        </div>
        <div className="w-full sm:w-auto">
          <ModeToggle mode={mode} onModeChange={onModeChange} />
        </div>
      </div>
      {mode === 'basic' && totalFieldCount > visibleFieldCount && (
        <div className="mt-2 text-xs text-muted-foreground animate-fade-in">
          Showing {visibleFieldCount} of {totalFieldCount} fields. Switch to Advanced mode to see all options.
        </div>
      )}
    </CardHeader>
  );
};

export default ProposalFormHeader;
