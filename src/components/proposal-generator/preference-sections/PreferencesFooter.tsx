
import React from 'react';
import { Button } from "@/components/ui/button";

interface PreferencesFooterProps {
  onSkip: () => void;
  onContinue: () => void;
  continueText?: string;
  showBackButton?: boolean;
}

const PreferencesFooter = ({
  onSkip,
  onContinue,
  continueText = "Continue",
  showBackButton = false
}: PreferencesFooterProps) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm pt-6 px-4 pb-6 border-t flex justify-between items-center z-10">
      <Button variant="ghost" onClick={onSkip}>
        Skip
      </Button>
      <Button 
        className="bg-blue-600 hover:bg-blue-700"
        onClick={onContinue}
      >
        {continueText}
      </Button>
    </div>
  );
};

export default PreferencesFooter;
