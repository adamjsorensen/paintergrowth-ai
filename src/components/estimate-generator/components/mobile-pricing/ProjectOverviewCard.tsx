
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface ProjectOverviewCardProps {
  summary: string;
}

const ProjectOverviewCard: React.FC<ProjectOverviewCardProps> = ({ summary }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-600" />
          Project Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
      </CardContent>
    </Card>
  );
};

export default ProjectOverviewCard;
