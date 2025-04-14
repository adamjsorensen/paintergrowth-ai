
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FormNavigationButtonsProps {
  currentStep: number;
  handlePrevStep: () => void;
  handleNextStep: () => void;
  isNextDisabled: boolean;
  isProcessing: boolean;
  isSubmitting: boolean;
}

const FormNavigationButtons = ({
  currentStep,
  handlePrevStep,
  handleNextStep,
  isNextDisabled,
  isProcessing,
  isSubmitting
}: FormNavigationButtonsProps) => {
  return (
    <div className="flex justify-between border-t p-6">
      <Button
        type="button"
        variant="outline"
        onClick={handlePrevStep}
        disabled={currentStep === 1 || isSubmitting || isProcessing}
      >
        Back
      </Button>
      
      {currentStep < 3 ? (
        <Button
          type="button"
          onClick={handleNextStep}
          disabled={isNextDisabled || isProcessing}
          className="gap-1"
        >
          Next <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
};

export default FormNavigationButtons;
