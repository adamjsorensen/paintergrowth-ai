
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useStylePreferences } from "@/context/StylePreferencesContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface StylePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StylePreferencesDialog = ({ open, onOpenChange }: StylePreferencesDialogProps) => {
  const { preferences, setPreferences, setHasSetPreferences } = useStylePreferences();
  const navigate = useNavigate();
  const [currentLength, setCurrentLength] = useState<number>(preferences.length);
  
  const handleContinue = () => {
    setHasSetPreferences(true);
    onOpenChange(false);
    navigate("/generate/proposal");
  };
  
  const handleSkip = () => {
    onOpenChange(false);
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

  const handleFormalityChange = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      formality: value as "casual" | "formal"
    }));
  };

  const handleRelationshipChange = (value: string) => {
    setPreferences(prev => ({
      ...prev,
      relationship: value as "new" | "repeat" | "referred" | "cold"
    }));
  };

  const handleVisualFlairChange = (value: string[]) => {
    setPreferences(prev => ({
      ...prev,
      visualFlair: {
        mentionColors: value.includes("mentionColors"),
        includePricing: value.includes("includePricing"),
        bulletPoints: value.includes("bulletPoints"),
      }
    }));
  };

  const getVisualFlairValue = () => {
    const result = [];
    if (preferences.visualFlair.mentionColors) result.push("mentionColors");
    if (preferences.visualFlair.includePricing) result.push("includePricing");
    if (preferences.visualFlair.bulletPoints) result.push("bulletPoints");
    return result;
  };

  const getToneButtonClass = (tone: string) => {
    return preferences.tone === tone 
      ? "bg-paintergrowth-600 text-white hover:bg-paintergrowth-700" 
      : "bg-gray-100 hover:bg-gray-200";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg h-[90vh] overflow-y-auto px-4 md:px-6 pt-6 pb-0">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Build your perfect proposal</h1>
          <p className="text-sm text-muted-foreground">
            Pick style preferences—or skip straight to the job info.
          </p>
          <div className="flex justify-center items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-paintergrowth-600"></span>
            <span className="w-2 h-2 rounded-full bg-gray-200"></span>
          </div>
        </div>

        <div className="flex flex-col space-y-8 pb-20">
          {/* Group 1: Style */}
          <div className="space-y-5">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Style</h3>
            
            {/* Tone Preference */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Tone</label>
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
            </div>

            {/* Formality */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Formality</label>
              <RadioGroup 
                value={preferences.formality || ""} 
                onValueChange={handleFormalityChange}
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
          </div>

          {/* Group 2: Format */}
          <div className="space-y-5">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Format</h3>
            
            {/* Length Preference */}
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

            {/* Visual Flair */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Visual Flair</label>
              <ToggleGroup 
                type="multiple"
                value={getVisualFlairValue()}
                onValueChange={handleVisualFlairChange}
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
          </div>

          {/* Group 3: Client Context */}
          <div className="space-y-5">
            <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Client Context</h3>
            
            {/* Relationship */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Customer Relationship</label>
              <RadioGroup 
                value={preferences.relationship || ""} 
                onValueChange={handleRelationshipChange}
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

            {/* Additional Options */}
            <div className="space-y-4">
              {/* Add Personality */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Add Personality</h4>
                  <p className="text-xs text-muted-foreground">Make the proposal feel more human and warm</p>
                </div>
                <Switch 
                  checked={preferences.addPersonality}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, addPersonality: checked }))}
                />
              </div>

              {/* Add Upsells */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Add Upsells</h4>
                  <p className="text-xs text-muted-foreground">Include additional service suggestions</p>
                </div>
                <Switch 
                  checked={preferences.addUpsells}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, addUpsells: checked }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t flex justify-between mt-auto">
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
      </DialogContent>
    </Dialog>
  );
};

export default StylePreferencesDialog;
