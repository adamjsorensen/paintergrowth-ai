
interface PreferencesSectionHeadingProps {
  title: string;
}

const PreferencesSectionHeading = ({ title }: PreferencesSectionHeadingProps) => {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 border-b pb-2 mb-2">{title}</h3>
  );
};

export default PreferencesSectionHeading;
