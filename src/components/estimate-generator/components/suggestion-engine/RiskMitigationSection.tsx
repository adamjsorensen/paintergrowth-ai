
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { RiskMitigationItem } from './types';

interface RiskMitigationSectionProps {
  riskMitigation: RiskMitigationItem[];
}

export const RiskMitigationSection: React.FC<RiskMitigationSectionProps> = ({
  riskMitigation
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
        <Shield className="h-5 w-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">Risk Mitigation</h3>
        <Badge variant="secondary">{riskMitigation.length}</Badge>
      </div>
      
      {riskMitigation.length > 0 ? (
        <div className="space-y-3">
          {riskMitigation.map((risk) => (
            <div key={risk.id} className="border rounded-lg p-4 border-red-200 bg-red-50">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{risk.risk}</h4>
                <Badge className={getImpactColor(risk.impact)}>
                  {risk.impact} impact
                </Badge>
              </div>
              <p className="text-gray-600 text-sm mb-2">{risk.description}</p>
              <div className="bg-white rounded p-2 border border-red-100">
                <p className="text-sm"><strong>Solution:</strong> {risk.solution}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">No specific risks identified for this project.</p>
      )}
    </div>
  );
};
