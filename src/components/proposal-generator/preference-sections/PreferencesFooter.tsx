
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
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-between items-center shadow-lg">
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
