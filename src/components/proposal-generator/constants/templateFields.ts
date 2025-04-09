
import { FieldConfig } from "@/types/prompt-templates";

// Enhanced field configuration with updated complexity levels based on requirements
export const ENHANCED_FIELDS: FieldConfig[] = [
  {
    id: 'clientName',
    label: 'Client Name',
    type: 'text',
    required: true,
    order: 10,
    placeholder: 'Enter client name',
    complexity: 'basic' // Essential field
  },
  {
    id: 'projectAddress',
    label: 'Project Address',
    type: 'textarea',
    required: true,
    order: 15,
    placeholder: 'Enter the full project address',
    complexity: 'basic' // Essential field
  },
  {
    id: 'jobType',
    label: 'Job Type',
    type: 'select',
    required: true,
    order: 20,
    options: [
      { value: 'interior', label: 'Interior' },
      { value: 'exterior', label: 'Exterior' },
      { value: 'cabinets', label: 'Cabinets' },
      { value: 'deck', label: 'Deck/Fence' },
      { value: 'commercial', label: 'Commercial' }
    ],
    complexity: 'basic' // Essential field
  },
  {
    id: 'squareFootage',
    label: 'Square Footage',
    type: 'number',
    required: false,
    order: 30,
    placeholder: 'Approx. square footage',
    complexity: 'advanced' // Advanced field
  },
  {
    id: 'surfacesToPaint',
    label: 'Surfaces to Paint',
    type: 'multi-select',
    required: true,
    order: 40,
    options: [
      { value: 'walls', label: 'Walls' },
      { value: 'ceilings', label: 'Ceilings' },
      { value: 'trim', label: 'Trim' },
      { value: 'doors', label: 'Doors' },
      { value: 'cabinets', label: 'Cabinets' }
    ],
    complexity: 'basic' // Essential field
  },
  {
    id: 'prepNeeds',
    label: 'Preparation Needs',
    type: 'checkbox-group',
    required: false,
    order: 50,
    options: [
      { value: 'scraping', label: 'Scraping' },
      { value: 'sanding', label: 'Sanding' },
      { value: 'powerwashing', label: 'Powerwashing' },
      { value: 'caulking', label: 'Caulking' },
      { value: 'patching', label: 'Patching' },
      { value: 'priming', label: 'Priming' }
    ],
    complexity: 'advanced' // Advanced field
  },
  {
    id: 'colorPalette',
    label: 'Preferred Colors / Palette',
    type: 'textarea',
    required: false,
    order: 60,
    placeholder: 'Describe your color preferences',
    complexity: 'advanced' // Advanced field - changed from basic
  },
  {
    id: 'timeline',
    label: 'Timeline or Start Date',
    type: 'date',
    required: false,
    order: 70,
    complexity: 'basic' // Essential field
  },
  {
    id: 'specialNotes',
    label: 'Special Notes',
    type: 'textarea',
    required: false,
    order: 80,
    placeholder: 'Any additional details or requirements',
    complexity: 'advanced' // Advanced field
  },
  {
    id: 'showDetailedScope',
    label: 'Show detailed scope of work',
    type: 'toggle',
    required: false,
    order: 90,
    complexity: 'advanced' // Advanced field
  },
  {
    id: 'breakoutQuote',
    label: 'Break out quote summary',
    type: 'toggle',
    required: false,
    order: 100,
    complexity: 'advanced' // Advanced field
  },
  {
    id: 'includeTerms',
    label: 'Include terms & conditions',
    type: 'toggle',
    required: false,
    order: 110,
    complexity: 'advanced' // Advanced field - changed from basic
  },
  {
    id: 'uploadFiles',
    label: 'Upload Files/Images',
    type: 'file-upload',
    required: false,
    order: 120,
    helpText: 'Upload reference images or documents',
    complexity: 'advanced' // Advanced field
  }
];
