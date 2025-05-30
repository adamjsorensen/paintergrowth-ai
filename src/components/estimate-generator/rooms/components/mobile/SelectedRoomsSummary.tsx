
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StandardizedRoom } from '@/types/room-types';
import { interiorRoomsMatrixConfig } from '../../InteriorRoomsConfig';

interface SelectedRoomsSummaryProps {
  roomsMatrix: StandardizedRoom[];
  extractedRoomsList: string[];
  hasSelectedSurfaces: (room: StandardizedRoom) => boolean;
  onRoomClick: (roomId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SelectedRoomsSummary: React.FC<SelectedRoomsSummaryProps> = ({
  roomsMatrix,
  extractedRoomsList,
  hasSelectedSurfaces,
  onRoomClick,
  isOpen,
  onToggle
}) => {
  // Get selected rooms with their surfaces
  const selectedRooms = roomsMatrix.filter(hasSelectedSurfaces).map(room => {
    const selectedSurfaces = interiorRoomsMatrixConfig.columns
      .filter(column => {
        if (column.type === "checkbox") {
          return room[column.id as keyof StandardizedRoom] === true;
        } else if (column.type === "number") {
          return (room[column.id as keyof StandardizedRoom] as number) > 0;
        }
        return false;
      })
      .map(column => column.label);

    return {
      ...room,
      surfaces: selectedSurfaces,
      isDetected: extractedRoomsList.includes(room.id)
    };
  });

  const maxVisibleChips = 5;
  const visibleRooms = selectedRooms.slice(0, maxVisibleChips);
  const remainingCount = selectedRooms.length - maxVisibleChips;

  if (selectedRooms.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <p className="text-gray-500 text-sm text-center">No rooms selected yet</p>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="bg-white border border-gray-200 rounded-lg mb-4 shadow-sm">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-4 justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">Selected Rooms</span>
              <Badge variant="outline" className="text-xs">
                {selectedRooms.length}
              </Badge>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {visibleRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => onRoomClick(room.id)}
                  className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-primary/20 transition-colors max-w-[200px]"
                >
                  <span className="truncate">
                    {room.label}: {room.surfaces.join(', ')}
                  </span>
                  <Badge
                    variant={room.isDetected ? "default" : "secondary"}
                    className="text-[10px] px-1.5 py-0.5 h-auto"
                  >
                    {room.isDetected ? "Detected" : "Added"}
                  </Badge>
                </button>
              ))}
              
              {remainingCount > 0 && (
                <div className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1.5 text-xs text-gray-600">
                  +{remainingCount} more
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SelectedRoomsSummary;
