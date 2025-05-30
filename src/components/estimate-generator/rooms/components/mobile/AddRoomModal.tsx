
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { interiorRoomsMatrixConfig, roomGroups } from '../../InteriorRoomsConfig';
import { StandardizedRoom } from '@/types/room-types';

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
  const [roomType, setRoomType] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedSurfaces, setSelectedSurfaces] = useState<Record<string, any>>({
    walls: false,
    ceiling: false,
    trim: false,
    doors: 0,
    windows: 0,
    cabinets: false
  });

  // Get available room types that aren't already in the matrix
  const availableRoomTypes = interiorRoomsMatrixConfig.rows.filter(
    row => !workingMatrix.some(room => room.id === row.id)
  );

  const handleSurfaceChange = (surfaceId: string, value: any) => {
    setSelectedSurfaces(prev => ({
      ...prev,
      [surfaceId]: value
    }));
  };

  const handleAddRoom = () => {
    if (!roomType) return;

    const roomConfig = interiorRoomsMatrixConfig.rows.find(r => r.id === roomType);
    if (!roomConfig) return;

    // Create custom room ID if custom name is provided
    const roomId = customName ? `${roomType}_${Date.now()}` : roomType;
    const roomLabel = customName || roomConfig.label;

    const newRoom: StandardizedRoom = {
      id: roomId,
      label: roomLabel,
      ...selectedSurfaces,
      confidence: 1.0
    };

    onAddRoom(newRoom);
    
    // Reset form
    setRoomType('');
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

  const selectedRoomConfig = roomType ? interiorRoomsMatrixConfig.rows.find(r => r.id === roomType) : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Room</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Room Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="room-type">Room Type</Label>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a room type" />
              </SelectTrigger>
              <SelectContent>
                {roomGroups.map(group => (
                  <React.Fragment key={group.id}>
                    <div className="text-xs text-muted-foreground px-2 py-1 font-medium">
                      {group.label}
                    </div>
                    {availableRoomTypes
                      .filter(room => room.group === group.id)
                      .map(room => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.label}
                        </SelectItem>
                      ))}
                  </React.Fragment>
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
              placeholder={selectedRoomConfig ? `e.g., ${selectedRoomConfig.label} 2` : "Enter custom name"}
            />
          </div>

          {/* Surface Selection */}
          {roomType && (
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
              disabled={!roomType}
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
