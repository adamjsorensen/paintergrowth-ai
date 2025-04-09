
import { Switch } from "@/components/ui/switch";

interface AdditionalOptionsPreferenceProps {
  addPersonality: boolean;
  addUpsells: boolean;
  onPersonalityChange: (checked: boolean) => void;
  onUpsellsChange: (checked: boolean) => void;
}

const AdditionalOptionsPreference = ({ 
  addPersonality, 
  addUpsells, 
  onPersonalityChange, 
  onUpsellsChange 
}: AdditionalOptionsPreferenceProps) => {
  return (
    <div className="space-y-4">
      {/* Add Personality */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Add Personality</h4>
          <p className="text-xs text-muted-foreground">Make the proposal feel more human and warm</p>
        </div>
        <Switch 
          checked={addPersonality}
          onCheckedChange={onPersonalityChange}
        />
      </div>

      {/* Add Upsells */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Add Upsells</h4>
          <p className="text-xs text-muted-foreground">Include additional service suggestions</p>
        </div>
        <Switch 
          checked={addUpsells}
          onCheckedChange={onUpsellsChange}
        />
      </div>
    </div>
  );
};

export default AdditionalOptionsPreference;
