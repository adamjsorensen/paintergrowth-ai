
import { FieldConfig, ModalStepType } from "@/types/prompt-templates";

export interface ModalStep {
  type: ModalStepType;
  title: string;
  fields: FieldConfig[];
}

export interface ProposalBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FieldConfig[];
  fieldValues: Record<string, any>;
  onFieldChange: (fieldName: string, value: any) => void;
  onComplete: () => void;
  initialStep?: number;
}
