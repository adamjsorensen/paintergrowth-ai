
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface RelationshipPreferenceProps {
  value: "new" | "repeat" | "referred" | "cold" | null;
  onChange: (value: string) => void;
}

const RelationshipPreference = ({ value, onChange }: RelationshipPreferenceProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Customer Relationship</label>
      <RadioGroup 
        value={value || ""} 
        onValueChange={onChange}
        className="grid grid-cols-2 gap-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="new" id="new" />
          <Label htmlFor="new">New Lead</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="repeat" id="repeat" />
          <Label htmlFor="repeat">Repeat Client</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="referred" id="referred" />
          <Label htmlFor="referred">Referred</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cold" id="cold" />
          <Label htmlFor="cold">Cold</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default RelationshipPreference;
