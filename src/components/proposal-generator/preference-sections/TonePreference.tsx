
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface TonePreferenceProps {
  value: "friendly" | "professional" | "bold" | "chill" | null;
  onChange: (tone: "friendly" | "professional" | "bold" | "chill") => void;
}

const TonePreference = ({ value, onChange }: TonePreferenceProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Tone</label>
      <RadioGroup 
        value={value || ""} 
        onValueChange={onChange}
        className="grid grid-cols-2 gap-2"
      >
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="friendly" id="friendly" />
            <Label htmlFor="friendly">Friendly</Label>
          </div>
          {value === "friendly" && (
            <p className="text-xs text-gray-500 ml-6">Approachable and warm communication style.</p>
          )}
        </div>
        
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="professional" id="professional" />
            <Label htmlFor="professional">Professional</Label>
          </div>
          {value === "professional" && (
            <p className="text-xs text-gray-500 ml-6">Formal and business-oriented tone.</p>
          )}
        </div>
        
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bold" id="bold" />
            <Label htmlFor="bold">Bold</Label>
          </div>
          {value === "bold" && (
            <p className="text-xs text-gray-500 ml-6">Confident and assertive communication.</p>
          )}
        </div>
        
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="chill" id="chill" />
            <Label htmlFor="chill">Chill</Label>
          </div>
          {value === "chill" && (
            <p className="text-xs text-gray-500 ml-6">Relaxed and casual approach.</p>
          )}
        </div>
      </RadioGroup>
    </div>
  );
};

export default TonePreference;
