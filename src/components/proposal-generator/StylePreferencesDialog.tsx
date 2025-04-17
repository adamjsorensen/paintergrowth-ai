
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStylePreferences } from "@/context/StylePreferencesContext";

// Import preference section components
import TonePreference from "./preference-sections/TonePreference";
import LengthPreference from "./preference-sections/LengthPreference";
import PreferencesSectionHeading from "./preference-sections/PreferencesSectionHeading";
import PreferencesDialogHeader from "./preference-sections/PreferencesDialogHeader";
import PreferencesFooter from "./preference-sections/PreferencesFooter";
import InteriorExteriorToggle from "./InteriorExteriorToggle";

// Define modal steps
type ModalStep = "style" | "scope";

interface StylePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StylePreferencesDialog = ({ open, onOpenChange }: StylePreferencesDialogProps) => {
  const { preferences, setPreferences, setHasSetPreferences } = useStylePreferences();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ModalStep>("style");
  
  const handleContinue = () => {
    if (currentStep === "style") {
      // Move to scope step
      setCurrentStep("scope");
    } else {
      // Final step completed, continue to proposal page
      setHasSetPreferences(true);
      onOpenChange(false);
      navigate("/generate/proposal");
    }
  };
  
  const handleSkip = () => {
    // Skip directly to proposal page
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

  const handleJobTypeChange = (value: "interior" | "exterior") => {
    setPreferences(prev => ({
      ...prev,
      jobType: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg h-[90vh] overflow-y-auto px-4 md:px-6 pt-6 pb-0">
        <DialogTitle className="sr-only">
          {currentStep === "style" ? "Style Preferences" : "Scope of Work"}
        </DialogTitle>
        
        {currentStep === "style" ? (
          <>
            <PreferencesDialogHeader 
              title="Build your perfect proposal"
              subtitle="Pick style preferences—or skip straight to the job info."
            />

            <div className="flex flex-col space-y-8 pb-20">
              {/* Group 1: Job Type */}
              <div className="space-y-5">
                <PreferencesSectionHeading title="Job Type" />
                
                <div className="flex justify-center py-2">
                  <InteriorExteriorToggle 
                    value={preferences.jobType}
                    onChange={handleJobTypeChange} 
                  />
                </div>
              </div>
              
              {/* Group 2: Style */}
              <div className="space-y-5">
                <PreferencesSectionHeading title="Style" />
                
                <TonePreference 
                  value={preferences.tone} 
                  onChange={handleToneChange} 
                />
              </div>

              {/* Group 3: Length */}
              <div className="space-y-5">
                <PreferencesSectionHeading title="Format" />
                
                <LengthPreference 
                  value={preferences.length} 
                  onChange={handleLengthChange} 
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <PreferencesDialogHeader 
              title="Scope of Work"
              subtitle="Define what areas you'll be painting in this project."
            />
            
            <div className="flex flex-col space-y-8 pb-20">
              <div className="space-y-5">
                <PreferencesSectionHeading title="Areas to Paint" />
                
                {/* Add scope form fields here */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <p className="text-sm text-muted-foreground">
                    This is the scope step where you would add specific areas to be painted.
                    You'll be able to add more details in the full proposal builder.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <PreferencesFooter
          onSkip={handleSkip}
          onContinue={handleContinue}
          continueText={currentStep === "style" ? "Next" : "Continue to Proposal Builder"}
          showBackButton={currentStep === "scope"}
          onBack={() => setCurrentStep("style")}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StylePreferencesDialog;
