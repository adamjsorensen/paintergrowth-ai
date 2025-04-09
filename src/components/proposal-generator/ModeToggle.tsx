
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ModeToggleProps {
  mode: 'basic' | 'advanced';
  onModeChange: (mode: 'basic' | 'advanced') => void;
}

const ModeToggle = ({ mode, onModeChange }: ModeToggleProps) => {
  return (
    <ToggleGroup 
      type="single" 
      value={mode} 
      onValueChange={(value) => {
        if (value) onModeChange(value as 'basic' | 'advanced');
      }}
      className="border rounded-md p-1 min-w-[240px]"
    >
      <ToggleGroupItem 
        value="basic" 
        className="flex-1 text-sm rounded-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        Basic
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="advanced" 
        className="flex-1 text-sm rounded-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        Advanced
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ModeToggle;
