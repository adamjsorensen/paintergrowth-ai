
import PreferencesProgress from "./PreferencesProgress";

interface PreferencesDialogHeaderProps {
  title: string;
  subtitle?: string;
  currentStep?: number;
  totalSteps?: number;
}

const PreferencesDialogHeader = ({ 
  title, 
  subtitle, 
  currentStep = 1, 
  totalSteps = 2 
}: PreferencesDialogHeaderProps) => {
  return (
    <div className="text-center space-y-2 mb-4">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
      <PreferencesProgress currentStep={currentStep} totalSteps={totalSteps} />
    </div>
  );
};

export default PreferencesDialogHeader;
