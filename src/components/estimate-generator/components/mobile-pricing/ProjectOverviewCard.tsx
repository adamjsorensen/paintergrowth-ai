
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface ProjectOverviewCardProps {
  summary: string;
}

const ProjectOverviewCard: React.FC<ProjectOverviewCardProps> = ({
  summary
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="h-5 w-5" />
          Project Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 leading-relaxed">
          {summary || 'No project summary available.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProjectOverviewCard;
