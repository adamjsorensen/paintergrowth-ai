
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import ModeToggle from "../ModeToggle";
import InteriorExteriorToggle from "../InteriorExteriorToggle";

interface ProposalFormHeaderProps {
  templateName: string;
  mode?: 'basic' | 'advanced';
  onModeChange?: (mode: 'basic' | 'advanced') => void;
  visibleFieldCount?: number;
  totalFieldCount?: number;
  projectType: 'interior' | 'exterior';
  onReopenModal?: () => void;
}

const ProposalFormHeader: React.FC<ProposalFormHeaderProps> = ({
  templateName,
  mode,
  onModeChange,
  visibleFieldCount = 0,
  totalFieldCount = 0,
  projectType,
  onReopenModal
}) => {
  // Dummy onChange handler for project type since it's not yet implemented
  const handleProjectTypeChange = (newType: 'interior' | 'exterior') => {
    // This would be implemented when exterior projects are supported
    console.log("Project type change requested:", newType);
  };

  return (
    <CardHeader className="pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
        <CardTitle className="text-2xl font-semibold">{templateName}</CardTitle>
        
        <div className="flex flex-row items-center space-x-2 mt-2 sm:mt-0">
          {onReopenModal && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1" 
              onClick={onReopenModal}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Settings</span>
            </Button>
          )}
          
          <InteriorExteriorToggle 
            value={projectType} 
            onChange={handleProjectTypeChange} 
          />
          
          {mode && onModeChange && (
            <ModeToggle
              mode={mode}
              onModeChange={onModeChange}
            />
          )}
        </div>
      </div>
      
      <CardDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-muted-foreground">
        <span>Complete the fields below to customize your proposal</span>
        {visibleFieldCount > 0 && totalFieldCount > 0 && (
          <span className="mt-1 sm:mt-0">
            Showing {visibleFieldCount} of {totalFieldCount} fields
          </span>
        )}
      </CardDescription>
    </CardHeader>
  );
};

export default ProposalFormHeader;
