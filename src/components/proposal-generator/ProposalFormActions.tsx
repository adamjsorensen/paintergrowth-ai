import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronRight, ChevronLeft, Settings2 } from "lucide-react";
import TranscriptButton from "./TranscriptButton";

interface ProposalFormActionsProps {
  hasModalFields: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  submitForm: () => void;
  isGenerating: boolean;
  currentTab: string;
  onNext: () => void;
  onPrevious: () => void;
  isLastTab: boolean;
  isFirstTab: boolean;
  onInformationExtracted: (extractedData: Record<string, any>) => void;
}

const ProposalFormActions: React.FC<ProposalFormActionsProps> = ({
  hasModalFields,
  isModalOpen,
  openModal,
  submitForm,
  isGenerating,
  currentTab,
  onNext,
  onPrevious,
  isLastTab,
  isFirstTab,
  onInformationExtracted
}) => {
  const handleMainButtonClick = () => {
    if (isLastTab) {
      submitForm();
    } else {
      onNext();
    }
  };

  return (
    <div className="mt-8 border-t pt-6 flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-4">
      {isFirstTab ? (
        <div className="flex gap-2 sm:mr-auto w-full sm:w-auto">
          {hasModalFields && (
            <Button 
              variant="outline" 
              onClick={openModal}
              className="sm:mr-auto flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Settings2 className="h-4 w-4" />
              <span>Style & Scope Options</span>
            </Button>
          )}
          
          <TranscriptButton onInformationExtracted={onInformationExtracted} />
        </div>
      ) : !isFirstTab ? (
        <Button
          onClick={onPrevious}
          variant="outline"
          size="lg"
          className="sm:mr-auto flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      ) : <div className="sm:mr-auto" />}

      <Button
        onClick={handleMainButtonClick}
        disabled={isGenerating}
        size="lg"
        className={cn(
          "w-full sm:w-auto px-8 transition-all duration-300",
          "bg-blue-600 hover:bg-blue-700 text-white", 
          "shadow-md hover:shadow-lg",
          "flex items-center justify-center gap-2",
          "min-w-[200px]"
        )}
      >
        {isGenerating ? (
          <>
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Generating...</span>
          </>
        ) : isLastTab ? (
          <>
            <Sparkles className="h-4 w-4" />
            <span>Generate Proposal</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </>
        ) : (
          <>
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default ProposalFormActions;