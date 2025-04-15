
import { SectionType } from '@/types/prompt-field';

export const SECTION_LABELS: Record<SectionType, string> = {
  client: 'Client Info',
  estimator: 'Estimator Info',
  scope: 'Project Scope',
  pricing: 'Pricing & Upsells',
  tone: 'Tone & Style',
  colors: 'Color Info',
  notes: 'Special Instructions',
  terms: 'Terms & Conditions',
  warranty: 'Warranty',
  meta: 'Prompt Metadata',
  additional: 'Additional Information'
};
