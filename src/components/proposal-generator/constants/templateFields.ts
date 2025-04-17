
import { FieldConfig } from "@/types/prompt-templates";

export const ENHANCED_FIELDS: FieldConfig[] = [
  {
    id: 'enhanced-client-name',
    name: 'clientName',
    label: 'Client Name',
    type: 'text',
    required: true,
    order: 10,
    placeholder: 'Enter client name',
    complexity: 'basic',
    sectionId: 'client',
    modalStep: 'main'
  },
  {
    id: 'enhanced-project-address',
    name: 'projectAddress',
    label: 'Project Address',
    type: 'textarea',
    required: true,
    order: 15,
    placeholder: 'Enter the full project address',
    complexity: 'basic',
    sectionId: 'project',
    modalStep: 'main'
  },
  {
    id: 'enhanced-job-type',
    name: 'jobType',
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
    complexity: 'basic',
    sectionId: 'project',
    modalStep: 'style'
  },
  {
    id: 'enhanced-square-footage',
    name: 'squareFootage',
    label: 'Square Footage',
    type: 'number',
    required: false,
    order: 30,
    placeholder: 'Approx. square footage',
    complexity: 'advanced',
    sectionId: 'project',
    modalStep: 'main'
  },
  {
    id: 'enhanced-surfaces-to-paint',
    name: 'surfacesToPaint',
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
    complexity: 'basic',
    sectionId: 'surfaces',
    modalStep: 'scope'
  },
  {
    id: 'enhanced-prep-needs',
    name: 'prepNeeds',
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
    complexity: 'advanced',
    sectionId: 'scope',
    modalStep: 'scope'
  },
  {
    id: 'enhanced-quote-items',
    name: 'quoteItems',
    label: 'Quote Items',
    type: 'quote-table',
    required: true,
    order: 55,
    helpText: 'Add services and their costs to the quote',
    complexity: 'basic',
    sectionId: 'pricing',
    modalStep: 'main'
  },
  {
    id: 'enhanced-upsell-options',
    name: 'upsellOptions',
    label: 'Optional Upgrades',
    type: 'upsell-table',
    required: false,
    order: 56,
    helpText: 'Add premium options your client might be interested in',
    complexity: 'advanced',
    sectionId: 'pricing',
    modalStep: 'main'
  },
  {
    id: 'enhanced-tax-settings',
    name: 'taxSettings',
    label: 'Tax Calculation',
    type: 'tax-calculator',
    required: false,
    order: 57,
    helpText: 'Configure tax settings for this quote',
    complexity: 'advanced',
    sectionId: 'pricing',
    modalStep: 'main'
  },
  {
    id: 'enhanced-color-palette',
    name: 'colorPalette',
    label: 'Preferred Colors / Palette',
    type: 'textarea',
    required: false,
    order: 60,
    placeholder: 'Describe your color preferences',
    complexity: 'advanced',
    sectionId: 'colors',
    modalStep: 'style'
  },
  {
    id: 'enhanced-timeline',
    name: 'timeline',
    label: 'Timeline or Start Date',
    type: 'date',
    required: false,
    order: 70,
    complexity: 'basic',
    sectionId: 'project',
    modalStep: 'main'
  },
  {
    id: 'enhanced-special-notes',
    name: 'specialNotes',
    label: 'Special Notes',
    type: 'textarea',
    required: false,
    order: 80,
    placeholder: 'Any additional details or requirements',
    complexity: 'advanced',
    sectionId: 'notes',
    modalStep: 'main'
  },
  {
    id: 'enhanced-show-detailed-scope',
    name: 'showDetailedScope',
    label: 'Show detailed scope of work',
    type: 'toggle',
    required: false,
    order: 90,
    complexity: 'advanced',
    sectionId: 'meta',
    modalStep: 'style'
  },
  {
    id: 'enhanced-breakout-quote',
    name: 'breakoutQuote',
    label: 'Break out quote summary',
    type: 'toggle',
    required: false,
    order: 100,
    complexity: 'advanced',
    sectionId: 'meta',
    modalStep: 'style'
  },
  {
    id: 'enhanced-include-terms',
    name: 'includeTerms',
    label: 'Include terms & conditions',
    type: 'toggle',
    required: false,
    order: 110,
    complexity: 'advanced',
    sectionId: 'terms',
    modalStep: 'style'
  },
  {
    id: 'enhanced-upload-files',
    name: 'uploadFiles',
    label: 'Upload Files/Images',
    type: 'file-upload',
    required: false,
    order: 120,
    helpText: 'Upload reference images or documents',
    complexity: 'advanced',
    sectionId: 'meta',
    modalStep: 'main'
  }
];
