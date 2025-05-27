
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Edit2 } from 'lucide-react';

interface ProjectFieldItemProps {
  field: any;
  onFieldEdit: (field: any) => void;
}

const ProjectFieldItem: React.FC<ProjectFieldItemProps> = ({ field, onFieldEdit }) => {
  const getFieldStatus = (field: any) => {
    if (!field || !field.value || field.value === '') {
      return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', text: 'Missing' };
    }
    return { icon: Check, color: 'text-green-500', bg: 'bg-green-50', text: 'Complete' };
  };

  const status = getFieldStatus(field);
  const StatusIcon = status.icon;

  return (
    <button
      onClick={() => onFieldEdit(field)}
      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[48px] text-left"
    >
      <div className="flex-1">
        <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
          {field.name}
          <Edit2 className="h-3 w-3 text-gray-400" />
        </div>
        {field.value && (
          <div className="text-sm text-gray-600 mt-1">
            {Array.isArray(field.value) ? field.value.join(', ') : field.value}
          </div>
        )}
      </div>
      <Badge variant="outline" className={`ml-3 ${status.bg} ${status.color} border-0 min-h-[32px] px-3`}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {status.text}
      </Badge>
    </button>
  );
};

export default ProjectFieldItem;
