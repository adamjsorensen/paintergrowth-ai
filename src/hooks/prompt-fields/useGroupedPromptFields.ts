
import { useMemo } from 'react';
import { FieldConfig } from "@/types/prompt-templates";

export type ModalStepType = 'main' | 'style' | 'scope';

export interface GroupedFields {
  main: FieldConfig[];
  style: FieldConfig[];
  scope: FieldConfig[];
  all: FieldConfig[];
}

export function useGroupedPromptFields(fields: FieldConfig[]): GroupedFields {
  return useMemo(() => {
    const result = {
      main: fields.filter(f => !f.modalStep || f.modalStep === 'main'),
      style: fields.filter(f => f.modalStep === 'style'),
      scope: fields.filter(f => f.modalStep === 'scope'),
      all: fields
    };
    
    return result;
  }, [fields]);
}

export function getModalSteps(groupedFields: GroupedFields): ModalStepType[] {
  const steps: ModalStepType[] = [];
  
  // Always add 'main' to the array of steps
  if (groupedFields.main.length > 0) {
    steps.push('main');
  }
  
  // Add style step if there are style fields
  if (groupedFields.style.length > 0) {
    steps.push('style');
  }
  
  // Add scope step if there are scope fields
  if (groupedFields.scope.length > 0) {
    steps.push('scope');
  }
  
  // Remove 'main' from the array since we don't want it in the modal steps
  return steps.filter(step => step !== 'main');
}

export function hasModalFields(groupedFields: GroupedFields): boolean {
  return groupedFields.style.length > 0 || groupedFields.scope.length > 0;
}
