
interface PreferencesSectionHeadingProps {
  title: string;
}

const PreferencesSectionHeading = ({ title }: PreferencesSectionHeadingProps) => {
  return (
    <h3 className="text-base font-semibold tracking-wide text-gray-800 pb-2 mb-4 border-b border-gray-200 relative after:absolute after:bottom-0 after:left-0 after:w-24 after:h-0.5 after:bg-blue-500">
      {title}
    </h3>
  );
};

export default PreferencesSectionHeading;
