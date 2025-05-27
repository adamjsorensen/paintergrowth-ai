
import React from 'react';
import { Mic } from 'lucide-react';

const EmptyReviewState: React.FC = () => {
  return (
    <div className="px-4 py-6 text-center">
      <div className="mb-6">
        <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Information Extracted</h3>
        <p className="text-gray-600">Go back to record audio or provide project details</p>
      </div>
    </div>
  );
};

export default EmptyReviewState;
