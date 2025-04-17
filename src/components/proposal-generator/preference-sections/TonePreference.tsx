
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Smile, Briefcase, Zap, ThumbsUp } from "lucide-react";

interface TonePreferenceProps {
  value: "friendly" | "professional" | "bold" | "chill" | null;
  onChange: (tone: "friendly" | "professional" | "bold" | "chill") => void;
}

const TonePreference = ({ value, onChange }: TonePreferenceProps) => {
  // Tone options with their descriptions and icons
  const toneOptions = [
    { 
      value: "friendly", 
      label: "Friendly", 
      description: "Approachable and warm communication style.",
      icon: <Smile className="h-5 w-5" />
    },
    { 
      value: "professional", 
      label: "Professional", 
      description: "Formal and business-oriented tone.",
      icon: <Briefcase className="h-5 w-5" />
    },
    { 
      value: "bold", 
      label: "Bold", 
      description: "Confident and assertive communication.",
      icon: <Zap className="h-5 w-5" />
    },
    { 
      value: "chill", 
      label: "Chill", 
      description: "Relaxed and casual approach.",
      icon: <ThumbsUp className="h-5 w-5" />
    },
  ];

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Tone</label>
      <div className="grid grid-cols-2 gap-4">
        {toneOptions.map((tone) => (
          <TooltipProvider key={tone.value} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Card 
                  className={cn(
                    "p-4 cursor-pointer border-2 transition-all duration-200 hover:shadow-md",
                    value === tone.value 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-gray-200 hover:border-blue-200"
                  )}
                  onClick={() => onChange(tone.value as any)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-full transition-colors",
                      value === tone.value 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-100 text-gray-500"
                    )}>
                      {tone.icon}
                    </div>
                    <div>
                      <div className="font-medium text-base">{tone.label}</div>
                      <p className="text-xs text-gray-500 mt-1">{tone.description}</p>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{tone.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
};

export default TonePreference;
