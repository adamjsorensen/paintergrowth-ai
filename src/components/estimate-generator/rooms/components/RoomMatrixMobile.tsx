
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { interiorRoomsMatrixConfig, roomGroups } from "../InteriorRoomsConfig";
import { StandardizedRoom } from "@/types/room-types";
import AddRoomForm from "./AddRoomForm";

interface RoomMatrixMobileProps {
  workingMatrix: StandardizedRoom[];
  visibleGroups: Record<string, boolean>;
  extractedRoomsList: string[];
  onCheckboxChange: (roomId: string, columnId: string, checked: boolean) => void;
  onNumberChange: (roomId: string, columnId: string, value: number) => void;
  onToggleGroupVisibility: (groupId: string) => void;
  isRoomExtracted: (roomId: string) => boolean;
  hasSelectedSurfaces: (room: StandardizedRoom) => boolean;
}

const RoomMatrixMobile: React.FC<RoomMatrixMobileProps> = ({
  workingMatrix,
  visibleGroups,
  extractedRoomsList,
  onCheckboxChange,
  onNumberChange,
  onToggleGroupVisibility,
  isRoomExtracted,
  hasSelectedSurfaces
}) => {
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  // Get all available rooms from config, not just selected ones
  const getAllRoomsForGroup = (groupId: string) => {
    const configRooms = interiorRoomsMatrixConfig.rows.filter(r => r.group === groupId);
    
    return configRooms.map(configRoom => {
      // Find existing room in matrix or create default
      const existingRoom = workingMatrix.find(room => room.id === configRoom.id);
      
      if (existingRoom) {
        return existingRoom;
      }
      
      // Create default room structure for display
      return {
        id: configRoom.id,
        label: configRoom.label || configRoom.id,
        walls: false,
        ceiling: false,
        trim: false,
        doors: 0,
        windows: 0,
        cabinets: false,
        confidence: 0
      } as StandardizedRoom;
    });
  };

  // Toggle entire room on/off
  const toggleRoom = (room: StandardizedRoom) => {
    const isCurrentlySelected = hasSelectedSurfaces(room);
    
    // Toggle all surfaces for this room
    interiorRoomsMatrixConfig.columns.forEach(column => {
      if (column.type === "checkbox") {
        onCheckboxChange(room.id, column.id, !isCurrentlySelected);
      } else if (column.type === "number") {
        onNumberChange(room.id, column.id, !isCurrentlySelected ? 1 : 0);
      }
    });
  };

  return (
    <div className="md:hidden space-y-4">
      {roomGroups.map(group => {
        const groupRooms = getAllRoomsForGroup(group.id);
        
        if (groupRooms.length === 0) return null;
        
        const selectedRoomsInGroup = groupRooms.filter(hasSelectedSurfaces);
        
        return (
          <div key={group.id} className="space-y-3">
            <button
              className="w-full text-left"
              onClick={() => onToggleGroupVisibility(group.id)}
            >
              <h3 className="font-medium text-sm flex items-center justify-between">
                <span>{group.label}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedRoomsInGroup.length}/{groupRooms.length}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {visibleGroups[group.id] ? '▼' : '▶'}
                  </span>
                </div>
              </h3>
            </button>
            
            {visibleGroups[group.id] && (
              <div className="grid grid-cols-1 gap-3">
                {groupRooms.map(room => {
                  const isSelected = hasSelectedSurfaces(room);
                  const isExtracted = isRoomExtracted(room.id);
                  
                  return (
                    <Card 
                      key={room.id} 
                      className={`transition-all ${
                        isSelected 
                          ? "bg-primary/5 border-primary/20 shadow-sm" 
                          : "bg-gray-50/50 border-gray-200"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <button
                            onClick={() => toggleRoom(room)}
                            className="flex-1 text-left"
                          >
                            <h4 className={`font-medium text-sm flex items-center gap-2 ${
                              isSelected ? "text-primary" : "text-gray-700"
                            }`}>
                              {room.label}
                              {isExtracted && (
                                <Badge variant="secondary" className="text-xs">
                                  Detected
                                </Badge>
                              )}
                              {isSelected && (
                                <Badge variant="default" className="text-xs">
                                  Selected
                                </Badge>
                              )}
                            </h4>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {interiorRoomsMatrixConfig.columns.map(column => (
                            <div key={column.id} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{column.label}:</span>
                              
                              {column.type === "checkbox" ? (
                                <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                                  <Checkbox
                                    checked={Boolean(room[column.id as keyof StandardizedRoom])}
                                    onCheckedChange={checked => 
                                      onCheckboxChange(room.id, column.id, Boolean(checked))
                                    }
                                    className="h-5 w-5"
                                  />
                                </div>
                              ) : column.type === "number" ? (
                                <div className="w-20">
                                  <Input
                                    type="number"
                                    min={0}
                                    step={1}
                                    value={room[column.id as keyof StandardizedRoom] as number}
                                    onChange={e => 
                                      onNumberChange(room.id, column.id, parseInt(e.target.value) || 0)
                                    }
                                    className="text-center h-11 text-sm"
                                  />
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Floating Add Room Button */}
      <Sheet open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-10"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetHeader>
            <SheetTitle>Add New Room</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <AddRoomForm
              workingMatrix={workingMatrix}
              onChange={(matrix) => {
                // This will trigger through the existing onChange prop
                // The AddRoomForm component handles the matrix update
              }}
            />
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsAddRoomOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default RoomMatrixMobile;
