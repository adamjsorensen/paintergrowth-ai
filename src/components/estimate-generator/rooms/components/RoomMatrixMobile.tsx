
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { interiorRoomsMatrixConfig, floorGroups } from "../InteriorRoomsConfig";
import { StandardizedRoom } from "@/types/room-types";
import { groupRoomsByFloor, countSelectedRoomsByFloor } from "../utils/FloorGroupingUtils";
import SelectedRoomsSummary from "./mobile/SelectedRoomsSummary";
import AddRoomModal from "./mobile/AddRoomModal";

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
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [visibleFloors, setVisibleFloors] = useState<Record<string, boolean>>({});
  const roomRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Group rooms by floor
  const floorGroupedRooms = groupRoomsByFloor(workingMatrix);
  const floorCounts = countSelectedRoomsByFloor(floorGroupedRooms, hasSelectedSurfaces);

  // Toggle floor visibility
  const toggleFloorVisibility = (floorId: string) => {
    setVisibleFloors(prev => ({
      ...prev,
      [floorId]: !prev[floorId]
    }));
  };

  // Handle room chip click - scroll to room and expand floor
  const handleRoomClick = (roomId: string) => {
    // Find which floor this room belongs to
    const targetFloor = floorGroups.find(floor => {
      return Object.values(floorGroupedRooms[floor.id] || {}).some(rooms => 
        rooms.some(room => room.id === roomId)
      );
    });

    if (targetFloor) {
      // Expand the floor
      setVisibleFloors(prev => ({
        ...prev,
        [targetFloor.id]: true
      }));

      // Scroll to room after a short delay to allow accordion to expand
      setTimeout(() => {
        const roomElement = roomRefs.current[roomId];
        if (roomElement) {
          roomElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Add a highlight effect
          roomElement.style.background = '#fef3c7';
          setTimeout(() => {
            roomElement.style.background = '';
          }, 2000);
        }
      }, 300);
    }
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

  // Handle adding new room
  const handleAddRoom = (newRoom: StandardizedRoom) => {
    // This will be handled by the parent component's onChange
    // For now, we'll just close the modal
    setIsAddRoomOpen(false);
  };

  // Sort rooms within each group - selected first
  const sortRoomsInGroup = (rooms: StandardizedRoom[]) => {
    return [...rooms].sort((a, b) => {
      const aSelected = hasSelectedSurfaces(a);
      const bSelected = hasSelectedSurfaces(b);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  };

  return (
    <div className="md:hidden space-y-4">
      {/* Selected Rooms Summary */}
      <SelectedRoomsSummary
        roomsMatrix={workingMatrix}
        extractedRoomsList={extractedRoomsList}
        hasSelectedSurfaces={hasSelectedSurfaces}
        onRoomClick={handleRoomClick}
        isOpen={isSummaryOpen}
        onToggle={() => setIsSummaryOpen(!isSummaryOpen)}
      />

      {/* Room Selection by Floor */}
      <Accordion type="multiple" value={Object.keys(visibleFloors).filter(f => visibleFloors[f])}>
        {floorGroups.map(floor => {
          const floorRooms = floorGroupedRooms[floor.id];
          const floorCount = floorCounts[floor.id];
          
          // Skip floors with no rooms
          if (!floorRooms || Object.values(floorRooms).every(rooms => rooms.length === 0)) {
            return null;
          }

          return (
            <AccordionItem key={floor.id} value={floor.id} className="border rounded-lg">
              <AccordionTrigger 
                className="px-4 py-3 hover:no-underline"
                onClick={() => toggleFloorVisibility(floor.id)}
              >
                <div className="flex items-center justify-between w-full mr-4">
                  <h2 className="font-semibold text-lg">{floor.label}</h2>
                  <Badge variant="outline" className="ml-2">
                    {floorCount.selected}/{floorCount.total} rooms
                  </Badge>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {Object.entries(floorRooms).map(([groupId, groupRooms]) => {
                    if (groupRooms.length === 0) return null;
                    
                    // Sort rooms - selected first
                    const sortedRooms = sortRoomsInGroup(groupRooms);
                    
                    return (
                      <div key={`${floor.id}-${groupId}`} className="space-y-2">
                        {sortedRooms.map(room => {
                          const isSelected = hasSelectedSurfaces(room);
                          const isExtracted = isRoomExtracted(room.id);
                          
                          return (
                            <div
                              key={room.id}
                              ref={el => roomRefs.current[room.id] = el}
                              className="transition-all duration-200"
                            >
                              <Card 
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
                                          <Badge variant="default" className="text-xs">
                                            Detected
                                          </Badge>
                                        )}
                                        {isSelected && !isExtracted && (
                                          <Badge variant="secondary" className="text-xs">
                                            Added
                                          </Badge>
                                        )}
                                        {isSelected && (
                                          <Badge variant="outline" className="text-xs">
                                            Selected
                                          </Badge>
                                        )}
                                      </h4>
                                    </button>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-y-2 items-center">
                                    {interiorRoomsMatrixConfig.columns.map(column => (
                                      <React.Fragment key={column.id}>
                                        <span className="text-sm text-gray-600">{column.label}:</span>
                                        <div className="justify-self-end">
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
                                      </React.Fragment>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      
      {/* Sticky Add Room Button */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={() => setIsAddRoomOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        workingMatrix={workingMatrix}
        onAddRoom={handleAddRoom}
      />
    </div>
  );
};

export default RoomMatrixMobile;
