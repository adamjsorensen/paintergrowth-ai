
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectFieldItem from './ProjectFieldItem';

interface ProjectInformationCardProps {
  extractedData: Record<string, any>;
  onFieldEdit: (field: any) => void;
}

const ProjectInformationCard: React.FC<ProjectInformationCardProps> = ({
  extractedData,
  onFieldEdit
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Project Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {extractedData.fields && Array.isArray(extractedData.fields) ? (
          extractedData.fields.map((field: any, index: number) => (
            <ProjectFieldItem
              key={index}
              field={field}
              onFieldEdit={onFieldEdit}
            />
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No specific fields extracted
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectInformationCard;
