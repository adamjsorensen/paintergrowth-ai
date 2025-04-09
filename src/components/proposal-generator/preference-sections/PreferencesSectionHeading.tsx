
interface PreferencesSectionHeadingProps {
  title: string;
}

const PreferencesSectionHeading = ({ title }: PreferencesSectionHeadingProps) => {
  return (
    <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">{title}</h3>
  );
};

export default PreferencesSectionHeading;
