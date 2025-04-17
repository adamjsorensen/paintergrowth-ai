
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
  
  if (groupedFields.style.length > 0) {
    steps.push('style');
  }
  
  if (groupedFields.scope.length > 0) {
    steps.push('scope');
  }
  
  return steps;
}

export function hasModalFields(groupedFields: GroupedFields): boolean {
  return groupedFields.style.length > 0 || groupedFields.scope.length > 0;
}
