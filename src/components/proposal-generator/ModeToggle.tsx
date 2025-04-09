
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Settings, Sliders } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ModeToggleProps {
  mode: 'basic' | 'advanced';
  onModeChange: (mode: 'basic' | 'advanced') => void;
}

const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-end mb-6">
        <div className="bg-gray-100 rounded-lg p-1">
          <ToggleGroup type="single" value={mode} onValueChange={(value) => value && onModeChange(value as 'basic' | 'advanced')}>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem 
                  value="basic" 
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${mode === 'basic' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-label="Basic mode"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Streamlined
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show essential fields only</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem 
                  value="advanced" 
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${mode === 'advanced' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-label="Advanced mode"
                >
                  <Sliders className="h-4 w-4 mr-2" />
                  Advanced
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show all available fields</p>
              </TooltipContent>
            </Tooltip>
          </ToggleGroup>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ModeToggle;
