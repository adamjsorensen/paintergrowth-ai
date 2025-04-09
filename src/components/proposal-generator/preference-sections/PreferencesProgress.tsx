
interface PreferencesProgressProps {
  currentStep: number;
  totalSteps: number;
}

const PreferencesProgress = ({ currentStep, totalSteps }: PreferencesProgressProps) => {
  return (
    <div className="flex justify-center items-center gap-2 mt-2">
      {[...Array(totalSteps)].map((_, index) => (
        <span 
          key={index}
          className={`w-2 h-2 rounded-full ${index < currentStep ? 'bg-paintergrowth-600' : 'bg-gray-200'}`}
        ></span>
      ))}
    </div>
  );
};

export default PreferencesProgress;
