
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface VisualFlairProps {
  values: {
    mentionColors: boolean;
    includePricing: boolean;
    bulletPoints: boolean;
  };
  onChange: (value: string[]) => void;
}

const VisualFlairPreference = ({ values, onChange }: VisualFlairProps) => {
  const getVisualFlairValue = () => {
    const result = [];
    if (values.mentionColors) result.push("mentionColors");
    if (values.includePricing) result.push("includePricing");
    if (values.bulletPoints) result.push("bulletPoints");
    return result;
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Visual Flair</label>
      <ToggleGroup 
        type="multiple"
        value={getVisualFlairValue()}
        onValueChange={onChange}
        className="flex flex-wrap gap-2 w-full"
      >
        <ToggleGroupItem value="mentionColors" className="flex-1 rounded-full text-sm">
          Colors
        </ToggleGroupItem>
        <ToggleGroupItem value="includePricing" className="flex-1 rounded-full text-sm">
          Pricing
        </ToggleGroupItem>
        <ToggleGroupItem value="bulletPoints" className="flex-1 rounded-full text-sm">
          Bullets
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default VisualFlairPreference;
