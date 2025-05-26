
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { interiorRoomsMatrixConfig, roomGroups } from "../InteriorRoomsConfig";
import { StandardizedRoom } from "@/types/room-types";

interface RoomMatrixDesktopProps {
  workingMatrix: StandardizedRoom[];
  visibleGroups: Record<string, boolean>;
  extractedRoomsList: string[];
  onCheckboxChange: (roomId: string, columnId: string, checked: boolean) => void;
  onNumberChange: (roomId: string, columnId: string, value: number) => void;
  onToggleGroupVisibility: (groupId: string) => void;
  isRoomExtracted: (roomId: string) => boolean;
}

const RoomMatrixDesktop: React.FC<RoomMatrixDesktopProps> = ({
  workingMatrix,
  visibleGroups,
  extractedRoomsList,
  onCheckboxChange,
  onNumberChange,
  onToggleGroupVisibility,
  isRoomExtracted
}) => {
  return (
    <div className="hidden md:block overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow>
            <TableHead className="w-[180px]">Room</TableHead>
            {interiorRoomsMatrixConfig.columns.map(column => (
              <TableHead key={column.id} className="text-center">
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {roomGroups.map(group => {
            const groupRooms = workingMatrix.filter(room => {
              const roomConfig = interiorRoomsMatrixConfig.rows.find(r => r.id === room.id);
              return roomConfig?.group === group.id;
            });
            
            if (groupRooms.length === 0) return null;
            
            return (
              <React.Fragment key={group.id}>
                <TableRow className="bg-muted/50">
                  <TableCell 
                    colSpan={interiorRoomsMatrixConfig.columns.length + 1}
                    className="font-medium py-2 cursor-pointer"
                    onClick={() => onToggleGroupVisibility(group.id)}
                  >
                    {group.label}
                    <Badge variant="outline" className="ml-2 text-xs">
                      {groupRooms.length}
                    </Badge>
                  </TableCell>
                </TableRow>
                
                {visibleGroups[group.id] && groupRooms.map(room => (
                  <TableRow key={room.id} className={isRoomExtracted(room.id) ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium flex items-center gap-1">
                      {room.label}
                      {isRoomExtracted(room.id) && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          Detected
                        </Badge>
                      )}
                    </TableCell>
                    
                    {interiorRoomsMatrixConfig.columns.map(column => (
                      <TableCell key={column.id} className="text-center">
                        {column.type === "checkbox" ? (
                          <Checkbox
                            checked={Boolean(room[column.id as keyof StandardizedRoom])}
                            onCheckedChange={checked => 
                              onCheckboxChange(room.id, column.id, Boolean(checked))
                            }
                            className="mx-auto"
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
                            className="w-16 mx-auto text-center"
                          />
                        ) : null}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoomMatrixDesktop;
