
import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface InteriorExteriorToggleProps {
  value: 'interior' | 'exterior';
  onChange: (value: 'interior' | 'exterior') => void;
}

const InteriorExteriorToggle: React.FC<InteriorExteriorToggleProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div
        className={`relative rounded-md px-4 py-2 cursor-pointer transition-colors ${
          value === 'interior' 
            ? 'bg-paintergrowth-600 text-white' 
            : 'bg-muted hover:bg-muted/80 text-foreground'
        }`}
        onClick={() => onChange('interior')}
      >
        <span className="font-medium">Interior</span>
      </div>
      
      <div className="relative">
        <div
          className="rounded-md px-4 py-2 bg-muted/50 text-muted-foreground cursor-not-allowed opacity-70"
        >
          <span className="font-medium">Exterior</span>
        </div>
        <Badge 
          className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] px-1 py-0 rounded-sm"
        >
          Coming Soon
        </Badge>
      </div>
    </div>
  );
};

export default InteriorExteriorToggle;
