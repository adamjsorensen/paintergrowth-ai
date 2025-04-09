
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useStylePreferences } from "@/context/StylePreferencesContext";

// Import preference section components
import TonePreference from "./preference-sections/TonePreference";
import FormalityPreference from "./preference-sections/FormalityPreference";
import LengthPreference from "./preference-sections/LengthPreference";
import VisualFlairPreference from "./preference-sections/VisualFlairPreference";
import RelationshipPreference from "./preference-sections/RelationshipPreference";
import AdditionalOptionsPreference from "./preference-sections/AdditionalOptionsPreference";
import PreferencesSectionHeading from "./preference-sections/PreferencesSectionHeading";
import PreferencesDialogHeader from "./preference-sections/PreferencesDialogHeader";
import PreferencesFooter from "./preference-sections/PreferencesFooter";

interface StylePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StylePreferencesDialog = ({ open, onOpenChange }: StylePreferencesDialogProps) => {
  const { preferences, setPreferences, setHasSetPreferences } = useStylePreferences();
  const navigate = useNavigate();
  
  const handleContinue = () => {
    setHasSetPreferences(true);
    onOpenChange(false);
    navigate("/generate/proposal");
  };
  
  const handleSkip = () => {
    onOpenChange(false);
    navigate("/generate/proposal");
  };

  const handleToneChange = (value: "friendly" | "professional" | "bold" | "chill") => {
    setPreferences(prev => ({
      ...prev,
      tone: value
    }));
  };

  const handleLengthChange = (value: number) => {
    setPreferences(prev => ({
      ...prev,
      length: value
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg h-[90vh] overflow-y-auto px-4 md:px-6 pt-6 pb-0">
        <PreferencesDialogHeader 
          title="Build your perfect proposal"
          subtitle="Pick style preferences—or skip straight to the job info."
        />

        <div className="flex flex-col space-y-8 pb-20">
          {/* Group 1: Style */}
          <div className="space-y-5">
            <PreferencesSectionHeading title="Style" />
            
            <TonePreference 
              value={preferences.tone} 
              onChange={handleToneChange} 
            />

            <FormalityPreference 
              value={preferences.formality} 
              onChange={handleFormalityChange} 
            />
          </div>

          {/* Group 2: Format */}
          <div className="space-y-5">
            <PreferencesSectionHeading title="Format" />
            
            <LengthPreference 
              value={preferences.length} 
              onChange={handleLengthChange} 
            />

            <VisualFlairPreference 
              values={preferences.visualFlair} 
              onChange={handleVisualFlairChange} 
            />
          </div>

          {/* Group 3: Client Context */}
          <div className="space-y-5">
            <PreferencesSectionHeading title="Client Context" />
            
            <RelationshipPreference 
              value={preferences.relationship} 
              onChange={handleRelationshipChange} 
            />

            <AdditionalOptionsPreference
              addPersonality={preferences.addPersonality}
              addUpsells={preferences.addUpsells}
              onPersonalityChange={(checked) => setPreferences(prev => ({ ...prev, addPersonality: checked }))}
              onUpsellsChange={(checked) => setPreferences(prev => ({ ...prev, addUpsells: checked }))}
            />
          </div>
        </div>

        <PreferencesFooter
          onSkip={handleSkip}
          onContinue={handleContinue}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StylePreferencesDialog;
