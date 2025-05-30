
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus } from 'lucide-react';
import { StandardizedRoom } from '@/types/room-types';
import { interiorRoomsMatrixConfig, roomGroups } from '../InteriorRoomsConfig';
import SelectedRoomsSummary from './mobile/SelectedRoomsSummary';
import AddRoomModal from './mobile/AddRoomModal';

interface RoomMatrixMobileProps {
  workingMatrix: StandardizedRoom[];
  visibleGroups: Record<string, boolean>;
  extractedRoomsList: string[];
  onCheckboxChange: (roomId: string, columnId: string, checked: boolean) => void;
  onNumberChange: (roomId: string, columnId: string, value: number) => void;
  onToggleGroupVisibility: (groupId: string) => void;
  isRoomExtracted: (roomId: string) => boolean;
  hasSelectedSurfaces: (room: StandardizedRoom) => boolean;
  onRoomMatrixChange?: (matrix: StandardizedRoom[]) => void;
}

const RoomMatrixMobile: React.FC<RoomMatrixMobileProps> = ({
  workingMatrix,
  visibleGroups,
  extractedRoomsList,
  onCheckboxChange,
  onNumberChange,
  onToggleGroupVisibility,
  isRoomExtracted,
  hasSelectedSurfaces,
  onRoomMatrixChange
}) => {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [addRoomModalOpen, setAddRoomModalOpen] = useState(false);

  // Handle adding a new room to the matrix
  const handleAddRoom = (newRoom: StandardizedRoom) => {
    console.log('RoomMatrixMobile - Adding new room:', newRoom);
    if (onRoomMatrixChange) {
      const updatedMatrix = [...workingMatrix, newRoom];
      onRoomMatrixChange(updatedMatrix);
    }
  };

  // Toggle all surfaces for a room
  const toggleRoomSurfaces = (roomId: string) => {
    const room = workingMatrix.find(r => r.id === roomId);
    if (!room) return;

    const hasAnySurfaceSelected = hasSelectedSurfaces(room);
    
    // If any surface is selected, deselect all; otherwise select all
    interiorRoomsMatrixConfig.columns.forEach(column => {
      if (column.type === "checkbox") {
        onCheckboxChange(roomId, column.id, !hasAnySurfaceSelected);
      } else if (column.type === "number") {
        onNumberChange(roomId, column.id, hasAnySurfaceSelected ? 0 : 1);
      }
    });
  };

  // Scroll to room and expand its group
  const scrollToRoom = (roomId: string) => {
    const room = workingMatrix.find(r => r.id === roomId);
    if (!room) return;

    const roomConfig = interiorRoomsMatrixConfig.rows.find(r => r.id === room.id.split('_')[0]);
    if (roomConfig) {
      const element = document.getElementById(`room-${roomId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="md:hidden space-y-4">
      {/* Selected Rooms Summary */}
      <SelectedRoomsSummary
        roomsMatrix={workingMatrix}
        extractedRoomsList={extractedRoomsList}
        hasSelectedSurfaces={hasSelectedSurfaces}
        onRoomClick={scrollToRoom}
        isOpen={summaryOpen}
        onToggle={() => setSummaryOpen(!summaryOpen)}
      />

      {/* Room Groups Accordion */}
      <Accordion type="multiple" className="space-y-2">
        {roomGroups.map(group => {
          // Get rooms for this group and sort selected rooms first
          const groupRooms = workingMatrix.filter(room => {
            const roomConfig = interiorRoomsMatrixConfig.rows.find(
              r => r.id === room.id.split('_')[0] // Handle duplicate rooms
            );
            return roomConfig?.group === group.id;
          }).sort((a, b) => {
            const aSelected = hasSelectedSurfaces(a);
            const bSelected = hasSelectedSurfaces(b);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
          });

          if (groupRooms.length === 0) return null;

          return (
            <AccordionItem key={group.id} value={group.id} className="border rounded-lg">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full mr-4">
                  <span className="font-medium">{group.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {groupRooms.filter(hasSelectedSurfaces).length} / {groupRooms.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-3">
                  {groupRooms.map(room => {
                    const isSelected = hasSelectedSurfaces(room);
                    const isExtracted = isRoomExtracted(room.id);
                    
                    return (
                      <div
                        key={room.id}
                        id={`room-${room.id}`}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleRoomSurfaces(room.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{room.label}</span>
                            <Badge
                              variant={isExtracted ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {isExtracted ? "Detected" : "Added"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSelected && (
                              <Badge variant="outline" className="text-xs">
                                Selected
                              </Badge>
                            )}
                            <Checkbox
                              checked={isSelected}
                              onChange={() => toggleRoomSurfaces(room.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        
                        {/* Surface Details when selected */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-3">
                              {interiorRoomsMatrixConfig.columns.map(column => (
                                <div key={column.id} className="flex items-center justify-between">
                                  <label className="text-sm text-gray-600">{column.label}</label>
                                  {column.type === "checkbox" ? (
                                    <Checkbox
                                      checked={room[column.id as keyof StandardizedRoom] as boolean}
                                      onCheckedChange={(checked) => 
                                        onCheckboxChange(room.id, column.id, Boolean(checked))
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : column.type === "number" ? (
                                    <Input
                                      type="number"
                                      min={0}
                                      max={20}
                                      value={room[column.id as keyof StandardizedRoom] as number}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        onNumberChange(room.id, column.id, parseInt(e.target.value) || 0);
                                      }}
                                      className="w-16 h-8 text-center text-sm"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Floating Add Room Button */}
      <div className="fixed bottom-6 right-6 z-10">
        <Button
          onClick={() => setAddRoomModalOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={addRoomModalOpen}
        onClose={() => setAddRoomModalOpen(false)}
        workingMatrix={workingMatrix}
        onAddRoom={handleAddRoom}
      />
    </div>
  );
};

export default RoomMatrixMobile;
