
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { interiorRoomsMatrixConfig } from '../../InteriorRoomsConfig';
import { StandardizedRoom } from '@/types/room-types';
import { roomTemplates, transitionalRooms, createRoomInstance } from '../../config/RoomTemplates';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  workingMatrix: StandardizedRoom[];
  onAddRoom: (room: StandardizedRoom) => void;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({
  isOpen,
  onClose,
  workingMatrix,
  onAddRoom
}) => {
  const [selectedFloor, setSelectedFloor] = useState<'main' | 'upper' | 'basement' | 'transitional'>('main');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedSurfaces, setSelectedSurfaces] = useState<Record<string, any>>({
    walls: false,
    ceiling: false,
    trim: false,
    doors: 0,
    windows: 0,
    cabinets: false
  });

  // Get available templates for selected floor
  const getAvailableTemplates = () => {
    if (selectedFloor === 'transitional') {
      return transitionalRooms;
    }
    return roomTemplates.filter(template => template.floor === selectedFloor);
  };

  // Generate next index for the selected category
  const getNextIndex = (category: string, floor: string) => {
    const categoryId = category.toLowerCase().replace(/\s+/g, '-');
    const floorPrefix = floor === 'transitional' ? 'main' : floor;
    
    const existingRooms = workingMatrix.filter(room => 
      room.category === category && room.floor === floor
    );
    
    return existingRooms.length + 1;
  };

  const handleSurfaceChange = (surfaceId: string, value: any) => {
    setSelectedSurfaces(prev => ({
      ...prev,
      [surfaceId]: value
    }));
  };

  const handleAddRoom = () => {
    if (!selectedCategory) return;

    const template = getAvailableTemplates().find(t => t.category === selectedCategory);
    if (!template) return;

    const nextIndex = getNextIndex(selectedCategory, selectedFloor);
    const roomInstance = createRoomInstance(template, nextIndex, customName);

    const newRoom: StandardizedRoom = {
      id: roomInstance.id,
      label: roomInstance.label,
      floor: roomInstance.floor as 'main' | 'upper' | 'basement',
      category: roomInstance.category,
      index: roomInstance.index,
      walls: Boolean(selectedSurfaces.walls),
      ceiling: Boolean(selectedSurfaces.ceiling),
      trim: Boolean(selectedSurfaces.trim),
      doors: Number(selectedSurfaces.doors) || 0,
      windows: Number(selectedSurfaces.windows) || 0,
      cabinets: Boolean(selectedSurfaces.cabinets),
      confidence: 1.0
    };

    onAddRoom(newRoom);
    
    // Reset form
    setSelectedFloor('main');
    setSelectedCategory('');
    setCustomName('');
    setSelectedSurfaces({
      walls: false,
      ceiling: false,
      trim: false,
      doors: 0,
      windows: 0,
      cabinets: false
    });
    
    onClose();
  };

  const floorOptions = [
    { value: 'main', label: 'Main Floor' },
    { value: 'upper', label: 'Upper Floor' },
    { value: 'basement', label: 'Basement' },
    { value: 'transitional', label: 'Transitional Spaces' }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Room</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Floor Selection */}
          <div className="space-y-2">
            <Label htmlFor="floor-select">Floor</Label>
            <Select value={selectedFloor} onValueChange={(value: any) => {
              setSelectedFloor(value);
              setSelectedCategory(''); // Reset category when floor changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a floor" />
              </SelectTrigger>
              <SelectContent>
                {floorOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category-select">Room Type</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a room type" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableTemplates().map(template => (
                  <SelectItem key={template.category} value={template.category}>
                    {template.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Name (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="custom-name">Custom Name (Optional)</Label>
            <Input
              id="custom-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={selectedCategory ? `e.g., ${selectedCategory} 2` : "Enter custom name"}
            />
          </div>

          {/* Surface Selection */}
          {selectedCategory && (
            <div className="space-y-4">
              <Label>Surfaces to Include</Label>
              <div className="grid grid-cols-1 gap-4">
                {interiorRoomsMatrixConfig.columns.map(column => (
                  <div key={column.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor={column.id} className="font-normal">
                      {column.label}
                    </Label>
                    {column.type === "checkbox" ? (
                      <Checkbox
                        id={column.id}
                        checked={selectedSurfaces[column.id] || false}
                        onCheckedChange={(checked) => 
                          handleSurfaceChange(column.id, Boolean(checked))
                        }
                      />
                    ) : column.type === "number" ? (
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        value={selectedSurfaces[column.id] || 0}
                        onChange={(e) => 
                          handleSurfaceChange(column.id, parseInt(e.target.value) || 0)
                        }
                        className="w-20 text-center"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRoom}
              disabled={!selectedCategory}
              className="flex-1"
            >
              Add Room
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddRoomModal;
