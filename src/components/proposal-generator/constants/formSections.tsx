
import { User, Layers, Brush, Palette, ClipboardList, Settings } from "lucide-react";

export const sections = [
  {
    id: 'client',
    label: 'Client Information',
    description: 'Enter your client details',
    icon: <User className="h-5 w-5" />
  },
  {
    id: 'project',
    label: 'Project Details',
    description: 'Specify project information',
    icon: <Layers className="h-5 w-5" />
  },
  {
    id: 'surfaces',
    label: 'Surfaces & Preparation',
    description: 'Describe the surfaces to be painted',
    icon: <Brush className="h-5 w-5" />
  },
  {
    id: 'colors',
    label: 'Colors & Timeline',
    description: 'Specify colors and project timeline',
    icon: <Palette className="h-5 w-5" />
  },
  {
    id: 'additional',
    label: 'Additional Information',
    description: 'Any other relevant details',
    icon: <ClipboardList className="h-5 w-5" />
  },
  {
    id: 'options',
    label: 'Proposal Options',
    description: 'Configure proposal settings',
    icon: <Settings className="h-5 w-5" />
  }
];

// For backward compatibility
export const FORM_SECTIONS = sections;
