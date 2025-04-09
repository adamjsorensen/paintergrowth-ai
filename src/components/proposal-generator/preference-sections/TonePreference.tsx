
import { Button } from "@/components/ui/button";

interface TonePreferenceProps {
  value: "friendly" | "professional" | "bold" | "chill" | null;
  onChange: (tone: "friendly" | "professional" | "bold" | "chill") => void;
}

const TonePreference = ({ value, onChange }: TonePreferenceProps) => {
  const getToneButtonClass = (tone: string) => {
    return value === tone 
      ? "bg-paintergrowth-600 text-white hover:bg-paintergrowth-700" 
      : "bg-gray-100 hover:bg-gray-200";
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Tone</label>
      <div className="grid grid-cols-2 gap-3">
        <Button 
          type="button" 
          onClick={() => onChange("friendly")}
          className={`${getToneButtonClass("friendly")} h-full p-4 flex flex-col`}
        >
          <span className="text-lg">😊</span>
          <span>Friendly</span>
        </Button>
        <Button 
          type="button" 
          onClick={() => onChange("professional")}
          className={`${getToneButtonClass("professional")} h-full p-4 flex flex-col`}
        >
          <span className="text-lg">🤝</span>
          <span>Professional</span>
        </Button>
        <Button 
          type="button" 
          onClick={() => onChange("bold")}
          className={`${getToneButtonClass("bold")} h-full p-4 flex flex-col`}
        >
          <span className="text-lg">💪</span>
          <span>Bold</span>
        </Button>
        <Button 
          type="button" 
          onClick={() => onChange("chill")}
          className={`${getToneButtonClass("chill")} h-full p-4 flex flex-col`}
        >
          <span className="text-lg">😎</span>
          <span>Chill</span>
        </Button>
      </div>
    </div>
  );
};

export default TonePreference;
