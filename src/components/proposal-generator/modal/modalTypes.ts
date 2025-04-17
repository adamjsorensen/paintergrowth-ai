
import { FieldConfig } from "@/types/prompt-templates";

export interface ModalStep {
  type: string;
  title: string;
  fields: FieldConfig[];
}

export interface ProposalBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: FieldConfig[];
  values: Record<string, any>;
  onValueChange: (fieldName: string, value: any) => void;
  onComplete?: () => void;
  onSubmit?: () => Promise<void>;
  checkRequiredFields?: (modalStep: string) => boolean;
  stepCompleted?: Record<string, boolean>;
  initialStep?: number;
}
