
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AlignLeft, AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils";

interface LengthPreferenceProps {
  value: number;
  onChange: (value: number) => void;
}

const LengthPreference = ({ value, onChange }: LengthPreferenceProps) => {
  // Round initial value to nearest 25% increment
  const roundToIncrement = (val: number) => {
    return Math.round(val / 25) * 25;
  };
  
  const [currentLength, setCurrentLength] = useState<number>(roundToIncrement(value));
  
  useEffect(() => {
    setCurrentLength(roundToIncrement(value));
  }, [value]);

  const handleLengthChange = (value: number[]) => {
    setCurrentLength(value[0]);
    onChange(value[0]);
  };

  // Function to get description based on length value
  const getLengthDescription = (length: number) => {
    if (length === 0) return "Very concise, focusing only on essential points";
    if (length === 25) return "Brief with key details";
    if (length === 50) return "Standard length with balanced detail";
    if (length === 75) return "Detailed with thorough explanations";
    return "Comprehensive with extensive detail and context";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Length</label>
        <div className="flex items-center gap-2">
          <span 
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              currentLength < 50 ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
            )}
          >
            {currentLength}%
          </span>
        </div>
      </div>
      
      <Card className="p-4 border bg-gray-50">
        <div className="flex justify-between mb-3 text-sm">
          <div className="flex items-center gap-2">
            <AlignLeft className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Short</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Long</span>
            <AlignJustify className="h-4 w-4 text-gray-500" />
          </div>
        </div>
        
        <Slider 
          min={0} 
          max={100} 
          step={25} 
          value={[currentLength]}
          onValueChange={handleLengthChange}
          className="mb-3"
        />
        
        <p className="text-xs text-gray-500 mt-2">{getLengthDescription(currentLength)}</p>
        
        {/* Visual indicator of length */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-3 overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-300",
              currentLength === 0 ? "bg-blue-300" :
              currentLength === 25 ? "bg-blue-400" :
              currentLength === 50 ? "bg-blue-500" :
              currentLength === 75 ? "bg-blue-600" : "bg-blue-700" 
            )}
            style={{ width: `${currentLength}%` }}
          />
        </div>
      </Card>
    </div>
  );
};

export default LengthPreference;
