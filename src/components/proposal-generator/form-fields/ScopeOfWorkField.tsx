
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash, Plus } from "lucide-react";
import { ScopeOfWorkItem, FieldConfig } from "@/types/prompt-templates";
import { formatCurrency } from "@/utils/formatUtils";

interface ScopeOfWorkFieldProps {
  field: FieldConfig;
  value: ScopeOfWorkItem[];
  onChange: (value: ScopeOfWorkItem[]) => void;
  isAdvanced?: boolean;
}

const ScopeOfWorkField = ({ field, value = [], onChange, isAdvanced }: ScopeOfWorkFieldProps) => {
  // Initialize with at least one row if empty
  const [items, setItems] = useState<ScopeOfWorkItem[]>(() => {
    if (value && value.length > 0) return value;
    return [{ 
      id: uuidv4(), 
      service: "", 
      description: "",
      price: 0 
    }];
  });

  const [subtotal, setSubtotal] = useState<number>(0);

  useEffect(() => {
    // Calculate subtotal whenever items change
    const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    setSubtotal(total);
    
    // Notify parent component of changes
    onChange(items);
  }, [items, onChange]);

  const handleAddRow = () => {
    const newItem: ScopeOfWorkItem = { 
      id: uuidv4(), 
      service: "", 
      description: "",
      price: 0 
    };
    setItems([...items, newItem]);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length <= 1) return; // Always keep at least one row
    setItems(items.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof ScopeOfWorkItem, value: string | number) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Render a mobile-friendly card view for small screens
  const renderMobileView = () => {
    return (
      <div className="space-y-4 md:hidden">
        {items.map((item, index) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Scope Item {index + 1}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveRow(item.id)}
                  disabled={items.length <= 1}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`service-${item.id}`}>Service</Label>
                <Input
                  id={`service-${item.id}`}
                  value={item.service}
                  onChange={(e) => handleChange(item.id, 'service', e.target.value)}
                  placeholder="Enter service name"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`description-${item.id}`}>Description</Label>
                <Input
                  id={`description-${item.id}`}
                  value={item.description || ""}
                  onChange={(e) => handleChange(item.id, 'description', e.target.value)}
                  placeholder="Optional details"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`price-${item.id}`}>Price ($)</Label>
                <Input
                  id={`price-${item.id}`}
                  type="number"
                  value={item.price === 0 ? "" : item.price}
                  onChange={(e) => handleChange(item.id, 'price', Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
      
      {/* Desktop Table View - Full Width */}
      <div className="hidden md:block overflow-x-auto border rounded-md col-span-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Service</TableHead>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="w-[20%]">Price</TableHead>
              <TableHead className="w-[10%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Input 
                    value={item.service} 
                    onChange={(e) => handleChange(item.id, 'service', e.target.value)}
                    placeholder="Enter service name"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    value={item.description || ""} 
                    onChange={(e) => handleChange(item.id, 'description', e.target.value)}
                    placeholder="Optional details"
                  />
                </TableCell>
                <TableCell>
                  <Input 
                    type="number"
                    value={item.price === 0 ? "" : item.price} 
                    onChange={(e) => handleChange(item.id, 'price', Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="text-right"
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveRow(item.id)}
                    disabled={items.length <= 1}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile Card View */}
      {renderMobileView()}
      
      <div className="flex justify-between items-center">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAddRow}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" /> Add Scope Item
        </Button>
        
        <div className="font-medium text-right">
          Subtotal: {formatCurrency(subtotal)}
        </div>
      </div>
    </div>
  );
};

export default ScopeOfWorkField;

