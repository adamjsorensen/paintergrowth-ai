
import { FieldConfig } from "@/types/prompt-templates";

export const ENHANCED_FIELDS: FieldConfig[] = [
  {
    id: 'client-name',
    name: 'clientName',
    label: 'Client Name',
    type: 'text',
    required: true,
    order: 10,
    placeholder: 'Enter client name',
    complexity: 'basic'
  },
  {
    id: 'project-address',
    name: 'projectAddress',
    label: 'Project Address',
    type: 'textarea',
    required: true,
    order: 15,
    placeholder: 'Enter the full project address',
    complexity: 'basic'
  },
  {
    id: 'job-type',
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
    complexity: 'basic'
  },
  {
    id: 'square-footage',
    name: 'squareFootage',
    label: 'Square Footage',
    type: 'number',
    required: false,
    order: 30,
    placeholder: 'Approx. square footage',
    complexity: 'advanced'
  },
  {
    id: 'surfaces-to-paint',
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
    complexity: 'basic'
  },
  {
    id: 'prep-needs',
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
    complexity: 'advanced'
  },
  {
    id: 'quote-items',
    name: 'quoteItems',
    label: 'Quote Items',
    type: 'quote-table',
    required: true,
    order: 55,
    helpText: 'Add services and their costs to the quote',
    complexity: 'basic'
  },
  {
    id: 'upsell-options',
    name: 'upsellOptions',
    label: 'Optional Upgrades',
    type: 'upsell-table',
    required: false,
    order: 56,
    helpText: 'Add premium options your client might be interested in',
    complexity: 'advanced'
  },
  {
    id: 'tax-settings',
    name: 'taxSettings',
    label: 'Tax Calculation',
    type: 'tax-calculator',
    required: false,
    order: 57,
    helpText: 'Configure tax settings for this quote',
    complexity: 'advanced'
  },
  {
    id: 'color-palette',
    name: 'colorPalette',
    label: 'Preferred Colors / Palette',
    type: 'textarea',
    required: false,
    order: 60,
    placeholder: 'Describe your color preferences',
    complexity: 'advanced'
  },
  {
    id: 'timeline',
    name: 'timeline',
    label: 'Timeline or Start Date',
    type: 'date',
    required: false,
    order: 70,
    complexity: 'basic'
  },
  {
    id: 'special-notes',
    name: 'specialNotes',
    label: 'Special Notes',
    type: 'textarea',
    required: false,
    order: 80,
    placeholder: 'Any additional details or requirements',
    complexity: 'advanced'
  },
  {
    id: 'show-detailed-scope',
    name: 'showDetailedScope',
    label: 'Show detailed scope of work',
    type: 'toggle',
    required: false,
    order: 90,
    complexity: 'advanced'
  },
  {
    id: 'breakout-quote',
    name: 'breakoutQuote',
    label: 'Break out quote summary',
    type: 'toggle',
    required: false,
    order: 100,
    complexity: 'advanced'
  },
  {
    id: 'include-terms',
    name: 'includeTerms',
    label: 'Include terms & conditions',
    type: 'toggle',
    required: false,
    order: 110,
    complexity: 'advanced'
  },
  {
    id: 'upload-files',
    name: 'uploadFiles',
    label: 'Upload Files/Images',
    type: 'file-upload',
    required: false,
    order: 120,
    helpText: 'Upload reference images or documents',
    complexity: 'advanced'
  }
];
