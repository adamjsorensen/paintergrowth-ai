
import { User, Layers, Brush, Palette, ClipboardList, Settings } from "lucide-react";

export const FORM_SECTIONS = [
  {
    id: 'client',
    title: 'Client Information',
    icon: <User className="h-5 w-5" />
  },
  {
    id: 'project',
    title: 'Project Details',
    icon: <Layers className="h-5 w-5" />
  },
  {
    id: 'surfaces',
    title: 'Surfaces & Preparation',
    icon: <Brush className="h-5 w-5" />
  },
  {
    id: 'colors',
    title: 'Colors & Timeline',
    icon: <Palette className="h-5 w-5" />
  },
  {
    id: 'additional',
    title: 'Additional Information',
    icon: <ClipboardList className="h-5 w-5" />
  },
  {
    id: 'options',
    title: 'Proposal Options',
    icon: <Settings className="h-5 w-5" />
  }
];
