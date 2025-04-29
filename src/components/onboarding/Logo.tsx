
import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/0905f2a4-c7de-4e81-9e07-0596c6a59f6e.png" 
          alt="Paintergrowth.ai" 
          className="h-10"
        />
        <span className="ml-2 text-2xl font-bold text-paintergrowth-600">Paintergrowth.ai</span>
      </div>
    </div>
  );
};
