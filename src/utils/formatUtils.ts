
export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString();
};

export const truncateText = (text: string, maxLength: number = 200): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const formatSimilarity = (value: number): string => {
  if (value === null || value === undefined) return "N/A";
  return value.toFixed(3);
};
