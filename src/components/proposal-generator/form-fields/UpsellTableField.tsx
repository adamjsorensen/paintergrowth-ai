
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash, Plus } from "lucide-react";
import { UpsellItem, FieldConfig } from "@/types/prompt-templates";
import { formatCurrency } from "@/utils/formatUtils";

interface UpsellTableFieldProps {
  field: FieldConfig;
  value: UpsellItem[];
  onChange: (value: UpsellItem[]) => void;
  isAdvanced?: boolean;
}

const UpsellTableField = ({ field, value = [], onChange, isAdvanced }: UpsellTableFieldProps) => {
  // Initialize with at least one row if empty
  const [items, setItems] = useState<UpsellItem[]>(() => {
    if (value && value.length > 0) return value;
    return [{ 
      id: uuidv4(), 
      service: "", 
      price: 0, 
      included: false, 
      label: "", 
      description: "" 
    }];
  });

  useEffect(() => {
    // Notify parent component of changes
    onChange(items);
  }, [items, onChange]);

  const handleAddRow = () => {
    const newItem: UpsellItem = { 
      id: uuidv4(), 
      service: "", 
      price: 0, 
      included: false, 
      label: "", 
      description: "" 
    };
    setItems([...items, newItem]);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length <= 1) return; // Always keep at least one row
    setItems(items.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof UpsellItem, value: string | number | boolean) => {
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
                <span className="font-medium">Upsell {index + 1}</span>
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
                <Label htmlFor={`service-${item.id}`}>Name</Label>
                <Input
                  id={`service-${item.id}`}
                  value={item.service}
                  onChange={(e) => handleChange(item.id, 'service', e.target.value)}
                  placeholder="Premium option name"
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
              
              <div className="space-y-2">
                <Label htmlFor={`description-${item.id}`}>Description</Label>
                <Input
                  id={`description-${item.id}`}
                  value={item.description || ""}
                  onChange={(e) => handleChange(item.id, 'description', e.target.value)}
                  placeholder="Description of the premium option"
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
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead className="w-[20%]">Price</TableHead>
              <TableHead className="w-[40%]">Description</TableHead>
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
                    placeholder="Premium option name"
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
                  <Input 
                    value={item.description || ""} 
                    onChange={(e) => handleChange(item.id, 'description', e.target.value)}
                    placeholder="Description of the premium option"
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
      
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={handleAddRow}
        className="flex items-center gap-1"
      >
        <Plus className="h-4 w-4" /> Add Upsell Option
      </Button>
    </div>
  );
};

export default UpsellTableField;
