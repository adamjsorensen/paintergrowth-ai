
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash, Plus, AlertCircle, DollarSign, FileText, Package2 } from "lucide-react";
import { QuoteItem, FieldConfig } from "@/types/prompt-templates";
import { formatCurrency } from "@/utils/formatUtils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface QuoteTableFieldProps {
  field: FieldConfig;
  value: QuoteItem[];
  onChange: (value: QuoteItem[]) => void;
  isAdvanced?: boolean;
}

const QuoteTableField = ({ field, value = [], onChange, isAdvanced }: QuoteTableFieldProps) => {
  // Initialize with at least one row if empty
  const [items, setItems] = useState<QuoteItem[]>(() => {
    if (value && value.length > 0) return value;
    return [{ 
      id: uuidv4(), 
      service: "", 
      price: 0, 
      notes: "" 
    }];
  });

  const [subtotal, setSubtotal] = useState<number>(0);

  useEffect(() => {
    // Calculate subtotal whenever items change
    const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    setSubtotal(total);
    
    // Notify parent component of changes
    onChange(items);
  }, [items]); // Removed onChange from dependencies to prevent infinite loop

  const handleAddRow = () => {
    const newItem: QuoteItem = { 
      id: uuidv4(), 
      service: "", 
      price: 0, 
      notes: "" 
    };
    setItems([...items, newItem]);
  };

  const handleRemoveRow = (id: string) => {
    if (items.length <= 1) return; // Always keep at least one row
    setItems(items.filter(item => item.id !== id));
  };

  const handleChange = (id: string, field: keyof QuoteItem, value: string | number) => {
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
          <Card key={item.id} className="overflow-hidden border-blue-100 hover:border-blue-200 transition-colors shadow-sm hover:shadow">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 px-3 py-1 font-medium">
                  Item {index + 1}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleRemoveRow(item.id)}
                  disabled={items.length <= 1}
                  className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-full aspect-square p-0 h-8 w-8"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`service-${item.id}`} className="flex items-center gap-1.5 text-gray-700">
                  <Package2 className="h-3.5 w-3.5 text-blue-500" />
                  <span>Service</span>
                </Label>
                <Input
                  id={`service-${item.id}`}
                  value={item.service}
                  onChange={(e) => handleChange(item.id, 'service', e.target.value)}
                  placeholder="Enter service name"
                  className="w-full focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`price-${item.id}`} className="flex items-center gap-1.5 text-gray-700">
                  <DollarSign className="h-3.5 w-3.5 text-green-500" />
                  <span>Price</span>
                </Label>
                <div className="relative">
                  <DollarSign className="h-4 w-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                  <Input
                    id={`price-${item.id}`}
                    type="number"
                    value={item.price === 0 ? "" : item.price}
                    onChange={(e) => handleChange(item.id, 'price', Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8 w-full text-right font-medium focus:border-green-400 focus:ring-1 focus:ring-green-200 transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`notes-${item.id}`} className="flex items-center gap-1.5 text-gray-700">
                  <FileText className="h-3.5 w-3.5 text-gray-500" />
                  <span>Notes</span>
                </Label>
                <Input
                  id={`notes-${item.id}`}
                  value={item.notes || ""}
                  onChange={(e) => handleChange(item.id, 'notes', e.target.value)}
                  placeholder="Optional details"
                  className="w-full text-gray-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all"
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
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium flex items-center gap-2">
            {field.label}
            {field.required && (
              <span className="relative text-xs inline-flex items-center justify-center rounded-full bg-red-100 text-red-700 w-4 h-4 font-medium">
                *
              </span>
            )}
          </Label>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
        
        <div className="font-medium text-right flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            <span>{formatCurrency(subtotal)}</span>
          </Badge>
        </div>
      </div>
      
      {field.helpText && (
        <div className="flex items-start gap-1 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <p>{field.helpText}</p>
        </div>
      )}
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border rounded-lg shadow-sm bg-white">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200">
              <TableHead className="w-[40%] font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <Package2 className="h-4 w-4 text-blue-500" />
                  <span>Service</span>
                </div>
              </TableHead>
              <TableHead className="w-[20%] font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span>Price</span>
                </div>
              </TableHead>
              <TableHead className="w-[30%] font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Notes</span>
                </div>
              </TableHead>
              <TableHead className="w-[10%] font-semibold text-gray-700"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow 
                key={item.id} 
                className={cn(
                  "border-b border-gray-100 transition-colors", 
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/50",
                  "hover:bg-blue-50/30"
                )}>
                <TableCell>
                  <Input 
                    value={item.service} 
                    onChange={(e) => handleChange(item.id, 'service', e.target.value)}
                    placeholder="Enter service name"
                    className="focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all"
                  />
                </TableCell>
                <TableCell>
                  <div className="relative">
                    <DollarSign className="h-4 w-4 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                    <Input 
                      type="number"
                      value={item.price === 0 ? "" : item.price} 
                      onChange={(e) => handleChange(item.id, 'price', Number(e.target.value) || 0)}
                      placeholder="0.00"
                      className="pl-8 text-right font-medium focus:border-green-400 focus:ring-1 focus:ring-green-200 transition-all"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input 
                    value={item.notes || ""} 
                    onChange={(e) => handleChange(item.id, 'notes', e.target.value)}
                    placeholder="Optional details"
                    className="text-gray-600 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-all"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveRow(item.id)}
                    disabled={items.length <= 1}
                    className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-full aspect-square p-0 h-8 w-8"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile Card View */}
      {renderMobileView()}
      
      <div className="flex justify-between items-center pt-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAddRow}
          className="flex items-center gap-1 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 hover:shadow-sm"
        >
          <Plus className="h-4 w-4 text-blue-500" /> Add Item
        </Button>
        
        <div className="font-medium text-right bg-green-50 text-green-800 px-3 py-1 rounded-md shadow-sm flex items-center gap-1.5">
          <span className="text-xs text-green-700">SUBTOTAL</span>
          <span className="text-green-800">{formatCurrency(subtotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default QuoteTableField;
