
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, Edit } from 'lucide-react';

interface EstimateField {
  name: string;
  value: string | number | boolean | string[];
  confidence: number;
  formField: string;
  editable?: boolean;
}

interface ExtractedInformationTableProps {
  estimateFields: EstimateField[];
  setEstimateFields: React.Dispatch<React.SetStateAction<EstimateField[]>>;
}

const ExtractedInformationTable: React.FC<ExtractedInformationTableProps> = ({
  estimateFields,
  setEstimateFields
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleEditField = (formField: string, currentValue: any) => {
    setEditingField(formField);
    setEditValue(String(currentValue));
  };

  const handleSaveEdit = () => {
    if (!editingField) return;
    
    setEstimateFields(prev => 
      prev.map(field => 
        field.formField === editingField 
          ? { ...field, value: editValue, confidence: 1.0 }
          : field
      )
    );
    
    setEditingField(null);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return "default";
    if (confidence >= 0.5) return "secondary";
    return "outline";
  };

  const formatFieldValue = (value: any): string => {
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Extracted Information</h3>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimateFields
                .filter(field => 
                  !field.formField.includes('Room') && 
                  field.formField !== 'roomsToPaint'
                )
                .map((field) => (
                <TableRow key={field.formField}>
                  <TableCell className="font-medium">{field.name}</TableCell>
                  <TableCell>
                    {editingField === field.formField ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full"
                      />
                    ) : (
                      formatFieldValue(field.value)
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getConfidenceBadge(field.confidence)}>
                      {Math.round(field.confidence * 100)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {editingField === field.formField ? (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={handleSaveEdit}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditField(field.formField, field.value)}
                        disabled={!field.editable}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractedInformationTable;
