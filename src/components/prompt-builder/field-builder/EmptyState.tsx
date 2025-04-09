
import React from "react";

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-8 text-gray-500">
      <p>No fields added yet.</p>
      <p className="text-sm">Click "Add Field" to create your first input field.</p>
    </div>
  );
};

export default EmptyState;
