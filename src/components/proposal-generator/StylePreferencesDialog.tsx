
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
      <DialogContent className="w-full max-w-4xl h-[90vh] overflow-y-auto">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Let's build your perfect proposal</h1>
          <p className="text-muted-foreground text-lg">
            Pick a few style preferences—or skip straight to the job info.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  onValueChange={handleLengthChange}
                  className="mb-4"
                />
              </div>
            </CardContent>
          </Card>

          {/* Formality */}
          <Card className="overflow-hidden border-2 hover:border-paintergrowth-300 transition-all">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">Formality</h3>
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
            </CardContent>
          </Card>

          {/* Visual Flair */}
          <Card className="overflow-hidden border-2 hover:border-paintergrowth-300 transition-all">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">Visual Flair</h3>
              <ToggleGroup 
                type="multiple"
                value={getVisualFlairValue()}
                onValueChange={handleVisualFlairChange}
                className="flex flex-wrap gap-2"
              >
                <ToggleGroupItem value="mentionColors" className="rounded-full">
                  Mention Colors
                </ToggleGroupItem>
                <ToggleGroupItem value="includePricing" className="rounded-full">
                  Include Pricing
                </ToggleGroupItem>
                <ToggleGroupItem value="bulletPoints" className="rounded-full">
                  Bullet Points
                </ToggleGroupItem>
              </ToggleGroup>
            </CardContent>
          </Card>

          {/* Relationship */}
          <Card className="overflow-hidden border-2 hover:border-paintergrowth-300 transition-all">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-3">Customer Relationship</h3>
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

          {/* Add Personality */}
          <Card className="overflow-hidden border-2 hover:border-paintergrowth-300 transition-all">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Add Personality</h3>
                <p className="text-muted-foreground text-sm">Make the proposal more human</p>
              </div>
              <Switch 
                checked={preferences.addPersonality}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, addPersonality: checked }))}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between pt-4 mt-4">
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
