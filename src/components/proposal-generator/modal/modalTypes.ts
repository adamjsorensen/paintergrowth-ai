
import { FieldConfig, ModalStepType } from "@/types/prompt-templates";

export interface ModalStep {
  type: ModalStepType;
  title: string;
  fields: FieldConfig[];
}

export interface ProposalBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  styleFields?: FieldConfig[];
  scopeFields?: FieldConfig[];
  fields?: FieldConfig[];
  fieldValues?: Record<string, any>;
  values?: Record<string, any>;
  onFieldChange?: (fieldName: string, value: any) => void;
  onValueChange?: (fieldName: string, value: any) => void;
  onComplete?: () => void;
  onSubmit?: () => Promise<void>;
  initialStep?: number;
  checkRequiredFields?: (modalStep: string) => boolean;
  stepCompleted?: Record<string, boolean>;
}
