
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingCardProps {
  isExtracting: boolean;
  extractionProgress: number;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ isExtracting, extractionProgress }) => {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-lg font-medium mb-2">Generating Estimate</h3>
        {isExtracting && (
          <div className="w-full max-w-md">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Extracting Information</span>
                <span>{Math.round(extractionProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${extractionProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoadingCard;
