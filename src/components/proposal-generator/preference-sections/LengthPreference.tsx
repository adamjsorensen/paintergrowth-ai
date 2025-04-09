
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";

interface LengthPreferenceProps {
  value: number;
  onChange: (value: number) => void;
}

const LengthPreference = ({ value, onChange }: LengthPreferenceProps) => {
  const [currentLength, setCurrentLength] = useState<number>(value);
  
  useEffect(() => {
    setCurrentLength(value);
  }, [value]);

  const handleLengthChange = (value: number[]) => {
    setCurrentLength(value[0]);
    onChange(value[0]);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <label className="text-sm font-medium">Length</label>
        <span className="text-sm text-muted-foreground">{currentLength}%</span>
      </div>
      <div>
        <div className="flex justify-between mb-2 text-xs text-muted-foreground">
          <span>Short</span>
          <span>Long</span>
        </div>
        <Slider 
          min={0} 
          max={100} 
          step={5} 
          value={[currentLength]}
          onValueChange={handleLengthChange}
          className="mb-4"
        />
      </div>
    </div>
  );
};

export default LengthPreference;
