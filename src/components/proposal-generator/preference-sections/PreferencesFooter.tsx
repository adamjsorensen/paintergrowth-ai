
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface PreferencesFooterProps {
  onSkip: () => void;
  onContinue: () => void;
  continueLabel?: string;
  skipLabel?: string;
}

const PreferencesFooter = ({ 
  onSkip, 
  onContinue, 
  continueLabel = "Next", 
  skipLabel = "Skip & Continue" 
}: PreferencesFooterProps) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t flex justify-between mt-auto">
      <Button 
        variant="outline" 
        onClick={onSkip}
      >
        {skipLabel}
      </Button>
      <Button 
        onClick={onContinue} 
        className="bg-paintergrowth-600 hover:bg-paintergrowth-700 text-white flex items-center gap-2"
      >
        {continueLabel} <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PreferencesFooter;
