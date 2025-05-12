import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldConfig } from "@/types/prompt-templates";
import { ScopeOfWorkItem } from "@/types/prompt-templates/item-types";
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
    console.log("ScopeOfWorkField - Initializing with value:", value);
    
    if (value && value.length > 0) {
      // Handle existing data that might not have the selected property
      return value.map(item => ({ 
        ...item, 
        selected: item.selected !== undefined ? item.selected : false 
      }));
    }
    return [{ 
      id: uuidv4(), 
      service: "", 
      description: "",
      price: 0,
      selected: false // Default to unselected
    }];
  });

  const [subtotal, setSubtotal] = useState<number>(0);

  // Sync with parent when items change
  useEffect(() => {
    // Calculate subtotal whenever items change
    const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    setSubtotal(total);
    
    // Notify parent component of changes
    onChange(items);
  }, [items, onChange]);

  // Sync with parent when value prop changes
  useEffect(() => {
    // Only update local state when the external value changes significantly
    if (value && value.length > 0 && JSON.stringify(value) !== JSON.stringify(items)) {
      console.log("ScopeOfWorkField - External value changed:", value);
      setItems(value.map(item => ({ 
        ...item, 
        selected: item.selected !== undefined ? item.selected : false 
      })));
    }
  }, [value]);

  const handleAddRow = () => {
    const newItem: ScopeOfWorkItem = { 
      id: uuidv4(), 
      service: "", 
      description: "",
      price: 0,
      selected: false // New items are unselected by default
    };
    setItems([...items, newItem]);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length <= 1) return; // Always keep at least one row
    setItems(items.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof ScopeOfWorkItem, value: string | number | boolean) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // New handlers for selection functionality
  const handleToggleSelection = (id: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleToggleAll = () => {
    const areAllSelected = items.length > 0 && items.every(item => item.selected);
    setItems(prev => 
      prev.map(item => ({ ...item, selected: !areAllSelected }))
    );
  };

  // Render a mobile-friendly card view for small screens
  const renderMobileView = () => {
    return (
      <div className="space-y-4 md:hidden relative">
        <div className="flex items-center gap-2 mb-2 sticky top-0 z-30 bg-background pt-2 pb-2 shadow-sm">
          <Checkbox 
            id="select-all-mobile"
            checked={items.length > 0 && items.every(item => item.selected)} 
            onCheckedChange={handleToggleAll}
          />
          <Label htmlFor="select-all-mobile" className="text-sm">
            {items.length > 0 && items.every(item => item.selected) 
              ? "Deselect all" 
              : "Select all"}
          </Label>
        </div>

        {items.map((item, index) => (
          <Card 
            key={item.id} 
            className={`overflow-hidden border rounded-md ${item.selected ? "bg-muted/50 border-l-4 border-l-primary" : ""}`}
          >
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={item.selected} 
                    onCheckedChange={() => handleToggleSelection(item.id)}
                    aria-label="Select item"
                  />
                  <span className="font-medium">Scope Item {index + 1}</span>
                </div>
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
    <div className="space-y-4 col-span-2 w-full">
      <div className="flex justify-between items-center">
        <Label className="text-base font-medium">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      </div>
      
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
      
      {/* Desktop global select all control */}
      <div className="hidden md:flex items-center gap-2 mb-2">
        <Checkbox 
          id="select-all-desktop"
          checked={items.length > 0 && items.every(item => item.selected)} 
          onCheckedChange={handleToggleAll}
        />
        <Label htmlFor="select-all-desktop" className="text-sm">
          {items.length > 0 && items.every(item => item.selected) 
            ? "Deselect all" 
            : "Select all"}
        </Label>
      </div>
      
      {/* Desktop Table View - Full Width */}
      <div className="hidden md:block overflow-x-auto border rounded-md max-h-[70vh]">
        <Table className="relative">
          <TableHeader className="sticky top-0 z-30 bg-background shadow-sm">
            <TableRow className="bg-muted/50">
              <TableHead className="w-[5%]">
                <span className="sr-only">Select</span>
              </TableHead>
              <TableHead className="w-[25%]">Service</TableHead>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="w-[20%]">Price</TableHead>
              <TableHead className="w-[10%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow 
                key={item.id}
                className={item.selected ? "bg-muted/50 border-l-2 border-l-primary" : ""}
              >
                <TableCell>
                  <Checkbox 
                    checked={item.selected} 
                    onCheckedChange={() => handleToggleSelection(item.id)}
                    aria-label="Select row"
                  />
                </TableCell>
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
      
      <div className="flex justify-between items-center mt-4">
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
      
      <p className="text-xs text-muted-foreground mt-1">
        Only selected items will be included in the final proposal.
      </p>
    </div>
  );
};

export default ScopeOfWorkField;