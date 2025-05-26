
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { interiorRoomsMatrixConfig, roomGroups } from "../InteriorRoomsConfig";
import { StandardizedRoom } from "@/types/room-types";

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
  return (
    <div className="md:hidden space-y-4">
      {roomGroups.map(group => {
        const groupRooms = workingMatrix.filter(room => {
          const roomConfig = interiorRoomsMatrixConfig.rows.find(r => r.id === room.id);
          return roomConfig?.group === group.id;
        }).filter(hasSelectedSurfaces);
        
        if (groupRooms.length === 0) return null;
        
        return (
          <div key={group.id} className="space-y-2">
            <h3 
              className="font-medium text-sm flex items-center cursor-pointer"
              onClick={() => onToggleGroupVisibility(group.id)}
            >
              {group.label}
              <Badge variant="outline" className="ml-2 text-xs">
                {groupRooms.length}
              </Badge>
            </h3>
            
            {visibleGroups[group.id] && (
              <div className="grid grid-cols-1 gap-2">
                {groupRooms.map(room => (
                  <Card key={room.id} className={isRoomExtracted(room.id) ? "bg-primary/5 border-primary/20" : ""}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm flex items-center">
                          {room.label}
                          {isRoomExtracted(room.id) && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              Detected
                            </Badge>
                          )}
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {interiorRoomsMatrixConfig.columns.map(column => (
                          <div key={column.id} className="flex items-center justify-between text-sm">
                            <span>{column.label}:</span>
                            
                            {column.type === "checkbox" ? (
                              <Checkbox
                                checked={Boolean(room[column.id as keyof StandardizedRoom])}
                                onCheckedChange={checked => 
                                  onCheckboxChange(room.id, column.id, Boolean(checked))
                                }
                              />
                            ) : column.type === "number" ? (
                              <Input
                                type="number"
                                min={0}
                                step={1}
                                value={room[column.id as keyof StandardizedRoom] as number}
                                onChange={e => 
                                  onNumberChange(room.id, column.id, parseInt(e.target.value) || 0)
                                }
                                className="w-16 text-center"
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RoomMatrixMobile;
