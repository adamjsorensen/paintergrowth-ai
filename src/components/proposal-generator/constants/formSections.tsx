
import { User, Layers, Brush, Palette, ClipboardList, Settings } from "lucide-react";

export const FORM_SECTIONS = [
  {
    id: 'client',
    title: 'Client Information',
    icon: <User className="h-5 w-5" />,
    fields: ['clientName', 'projectAddress']
  },
  {
    id: 'project',
    title: 'Project Details',
    icon: <Layers className="h-5 w-5" />,
    fields: ['jobType', 'squareFootage']
  },
  {
    id: 'surfaces',
    title: 'Surfaces & Preparation',
    icon: <Brush className="h-5 w-5" />,
    fields: ['surfacesToPaint', 'prepNeeds']
  },
  {
    id: 'colors',
    title: 'Colors & Timeline',
    icon: <Palette className="h-5 w-5" />,
    fields: ['colorPalette', 'timeline']
  },
  {
    id: 'additional',
    title: 'Additional Information',
    icon: <ClipboardList className="h-5 w-5" />,
    fields: ['specialNotes']
  },
  {
    id: 'options',
    title: 'Proposal Options',
    icon: <Settings className="h-5 w-5" />,
    fields: ['showDetailedScope', 'breakoutQuote', 'includeTerms', 'uploadFiles']
  }
];
