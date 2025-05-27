
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface ProjectSummaryCardProps {
  summary: string;
}

const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({ summary }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Check className="h-4 w-4 text-green-500" />
          Project Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
      </CardContent>
    </Card>
  );
};

export default ProjectSummaryCard;
