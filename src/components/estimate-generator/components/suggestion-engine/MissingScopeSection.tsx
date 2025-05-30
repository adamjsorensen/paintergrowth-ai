
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Edit2 } from 'lucide-react';
import { MissingScopeItem } from './types';

interface MissingScopeSectionProps {
  missingScope: MissingScopeItem[];
  onGoBackToRooms?: () => void;
}

export const MissingScopeSection: React.FC<MissingScopeSectionProps> = ({
  missingScope,
  onGoBackToRooms
}) => {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">Missing Scope Items</h3>
        <Badge variant="secondary">{missingScope.length}</Badge>
      </div>
      
      {missingScope.length > 0 ? (
        <div className="space-y-3">
          {missingScope.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 border-orange-200 bg-orange-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.item}</h4>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge className={getImpactColor(item.impact)}>
                    {item.impact} impact
                  </Badge>
                  {onGoBackToRooms && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onGoBackToRooms}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      Go Back and Edit
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">No missing scope items identified.</p>
      )}
    </div>
  );
};
