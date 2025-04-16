
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useStylePreferences } from "@/context/StylePreferencesContext";
import InteriorExteriorToggle from "./InteriorExteriorToggle";

const StylePreferences = () => {
  const { preferences, setPreferences, setHasSetPreferences } = useStylePreferences();
  const navigate = useNavigate();
  const [currentLength, setCurrentLength] = useState<number>(preferences.length);
  
  const handleContinue = () => {
    setHasSetPreferences(true);
    navigate("/generate/proposal");
  };
  
  const handleSkip = () => {
    navigate("/generate/proposal");
  };

  const handleToneChange = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      tone: value as "friendly" | "professional" | "bold" | "chill"
    }));
  };

  const handleLengthChange = (value: number[]) => {
    setCurrentLength(value[0]);
    setPreferences(prev => ({
      ...prev,
      length: value[0]
    }));
  };

  const handleJobTypeChange = (value: "interior" | "exterior") => {
    setPreferences(prev => ({
      ...prev,
      jobType: value
    }));
  };

  const getToneButtonClass = (tone: string) => {
    return preferences.tone === tone 
      ? "bg-paintergrowth-600 text-white hover:bg-paintergrowth-700" 
      : "bg-gray-100 hover:bg-gray-200";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Let's build your perfect proposal</h1>
        <p className="text-muted-foreground text-lg">
          Pick a few style preferences—or skip straight to the job info.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Type */}
        <Card className="overflow-hidden border-2 hover:border-paintergrowth-300 transition-all">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3">Job Type</h3>
            <div className="flex justify-center py-2">
              <InteriorExteriorToggle 
                value={preferences.jobType}
                onChange={handleJobTypeChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tone Preference */}
        <Card className="overflow-hidden border-2 hover:border-paintergrowth-300 transition-all">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-3">Tone</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button" 
                onClick={() => handleToneChange("friendly")}
                className={`${getToneButtonClass("friendly")} h-full p-4 flex flex-col`}
              >
                <span className="text-lg">😊</span>
                <span>Friendly</span>
              </Button>
              <Button 
                type="button" 
                onClick={() => handleToneChange("professional")}
                className={`${getToneButtonClass("professional")} h-full p-4 flex flex-col`}
              >
                <span className="text-lg">🤝</span>
                <span>Professional</span>
              </Button>
              <Button 
                type="button" 
                onClick={() => handleToneChange("bold")}
                className={`${getToneButtonClass("bold")} h-full p-4 flex flex-col`}
              >
                <span className="text-lg">💪</span>
                <span>Bold</span>
              </Button>
              <Button 
                type="button" 
                onClick={() => handleToneChange("chill")}
                className={`${getToneButtonClass("chill")} h-full p-4 flex flex-col`}
              >
                <span className="text-lg">😎</span>
                <span>Chill</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Length Preference */}
        <Card className="overflow-hidden border-2 hover:border-paintergrowth-300 transition-all">
          <CardContent className="p-6">
            <div className="mb-3 flex justify-between">
              <h3 className="font-semibold text-lg">Length</h3>
              <span className="text-muted-foreground">{currentLength}%</span>
            </div>
            <div className="py-4">
              <div className="flex justify-between mb-2 text-muted-foreground">
                <span>Short</span>
                <span>Long</span>
              </div>
              <Slider 
                min={0} 
                max={100} 
                step={5} 
                value={[currentLength]}
                onValueChange={(value) => handleLengthChange(value)}
                className="mb-4"
              />
            </div>
          </CardContent>
        </Card>

        {/* Add Upsells */}
        <Card className="overflow-hidden border-2 hover:border-paintergrowth-300 transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Add Upsells</h3>
              <p className="text-muted-foreground text-sm">Include additional service suggestions</p>
            </div>
            <Switch 
              checked={preferences.addUpsells}
              onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, addUpsells: checked }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={handleSkip}
        >
          Skip & Continue
        </Button>
        <Button 
          onClick={handleContinue} 
          className="bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white flex items-center gap-2"
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default StylePreferences;
