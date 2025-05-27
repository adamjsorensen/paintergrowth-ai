
import { useState } from 'react';
import { ProjectMetadata } from './types';

export const useProjectMetadata = () => {
  const initializeProjectMetadata = (): ProjectMetadata => {
    return {
      trimColor: '',
      wallColors: 1,
      coats: 'two',
      paintType: 'Premium Interior Paint',
      specialConsiderations: '',
      salesNotes: '',
      productionDate: undefined,
      discountPercent: 0
    };
  };

  const [projectMetadata] = useState<ProjectMetadata>(initializeProjectMetadata);

  return {
    projectMetadata,
    initializeProjectMetadata
  };
};
