
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
import { cn } from "@/lib/utils";

interface ScopeOfWorkFieldProps {
  field: FieldConfig;
  value: ScopeOfWorkItem[];
  onChange: (value: ScopeOfWorkItem[]) => void;
  isAdvanced?: boolean;
}

const ScopeOfWorkField = ({ field, value = [], onChange, isAdvanced }: ScopeOfWorkFieldProps) => {
  const [items, setItems] = useState<ScopeOfWorkItem[]>(() => {
    if (value && value.length > 0) {
      return value.map(item => ({
        ...item,
        selected: item.selected ?? false
      }));
    }
    return [{
      id: uuidv4(),
      service: "",
      description: "",
      price: 0,
      selected: false
    }];
  });

  const [subtotal, setSubtotal] = useState<number>(0);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    setSubtotal(total);
    onChange(items);
  }, [items, onChange]);

  const handleAddRow = () => {
    const newItem: ScopeOfWorkItem = {
      id: uuidv4(),
      service: "",
      description: "",
      price: 0,
      selected: false
    };
    setItems([...items, newItem]);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof ScopeOfWorkItem, value: string | number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleToggleSelection = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleToggleAll = () => {
    const areAllSelected = items.every(item => item.selected);
    setItems(prev =>
      prev.map(item => ({ ...item, selected: !areAllSelected }))
    );
  };

  const renderMobileView = () => {
    return (
      <div className="space-y-4 md:hidden">
        <div className="flex items-center gap-2 mb-4">
          <Checkbox 
            checked={items.every(item => item.selected)}
            onCheckedChange={handleToggleAll}
            id="select-all-mobile"
          />
          <Label htmlFor="select-all-mobile">
            {items.every(item => item.selected) ? "Deselect all" : "Select all"}
          </Label>
        </div>

        {items.map((item, index) => (
          <Card
            key={item.id}
            className={cn(
              "overflow-hidden border rounded-md",
              item.selected && "bg-muted/50 border-primary"
            )}
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

      <div className="hidden md:block overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[5%]">
                <Checkbox
                  checked={items.length > 0 && items.every(item => item.selected)}
                  onCheckedChange={handleToggleAll}
                  aria-label="Select all rows"
                />
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
                className={cn(
                  item.selected && "bg-muted/50"
                )}
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
    </div>
  );
};

export default ScopeOfWorkField;
