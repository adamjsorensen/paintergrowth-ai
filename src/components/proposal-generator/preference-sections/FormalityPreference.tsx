
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface FormalityPreferenceProps {
  value: "casual" | "formal" | null;
  onChange: (value: string) => void;
}

const FormalityPreference = ({ value, onChange }: FormalityPreferenceProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Formality</label>
      <RadioGroup 
        value={value || ""} 
        onValueChange={onChange}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="casual" id="casual" />
          <Label htmlFor="casual">Casual</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="formal" id="formal" />
          <Label htmlFor="formal">Formal</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default FormalityPreference;
