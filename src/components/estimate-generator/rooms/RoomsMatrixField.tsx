
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, CheckCircle, Info } from "lucide-react";
import { interiorRoomsMatrixConfig, roomGroups } from "./InteriorRoomsConfig";
import { StandardizedRoom } from "@/types/room-types";

interface RoomsMatrixFieldProps {
  matrixValue: StandardizedRoom[];
  onChange: (updatedMatrix: StandardizedRoom[]) => void;
  extractedRoomsList?: string[];
}

const RoomsMatrixField: React.FC<RoomsMatrixFieldProps> = ({
  matrixValue,
  onChange,
  extractedRoomsList = []
}) => {
  const [newRoomType, setNewRoomType] = useState("");
  const [showAddRoom, setShowAddRoom] = useState(false);
  
  // Track visible groups for collapsible UI
  const [visibleGroups, setVisibleGroups] = useState<Record<string, boolean>>(
    roomGroups.reduce((acc, group) => ({ ...acc, [group.id]: true }), {})
  );
  
  console.log('RoomsMatrixField - Current matrix value:', matrixValue);
  console.log('RoomsMatrixField - Extracted rooms list:', extractedRoomsList);
  
  // Calculate if any room in this group is visible in the matrix
  const isRoomInGroupVisible = (groupId: string) => {
    return matrixValue.some(room => {
      const roomRow = interiorRoomsMatrixConfig.rows.find(r => r.id === room.id);
      return roomRow?.group === groupId;
    });
  };
  
  // Toggle group visibility
  const toggleGroupVisibility = (groupId: string) => {
    setVisibleGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  
  // Handle checkbox change for a specific room and column
  const handleCheckboxChange = (roomId: string, columnId: string, checked: boolean) => {
    console.log(`RoomsMatrixField - Checkbox change: ${roomId}.${columnId} = ${checked}`);
    
    const updatedMatrix = matrixValue.map(room => {
      if (room.id === roomId) {
        const updatedRoom = { ...room, [columnId]: checked };
        console.log(`RoomsMatrixField - Updated room ${roomId}:`, updatedRoom);
        return updatedRoom;
      }
      return room;
    });
    
    console.log('RoomsMatrixField - Sending updated matrix to parent:', updatedMatrix);
    onChange(updatedMatrix);
  };
  
  // Handle number input change for a specific room and column
  const handleNumberChange = (roomId: string, columnId: string, value: number) => {
    console.log(`RoomsMatrixField - Number change: ${roomId}.${columnId} = ${value}`);
    
    const updatedMatrix = matrixValue.map(room => {
      if (room.id === roomId) {
        const updatedRoom = { ...room, [columnId]: value };
        console.log(`RoomsMatrixField - Updated room ${roomId}:`, updatedRoom);
        return updatedRoom;
      }
      return room;
    });
    
    console.log('RoomsMatrixField - Sending updated matrix to parent:', updatedMatrix);
    onChange(updatedMatrix);
  };
  
  // Check if room is mentioned in extracted text
  const isRoomExtracted = (roomId: string) => {
    return extractedRoomsList.includes(roomId);
  };
  
  // Add a custom room to the matrix
  const handleAddRoom = () => {
    if (!newRoomType) return;
    
    // Find the room configuration
    const roomConfig = interiorRoomsMatrixConfig.rows.find(r => r.id === newRoomType);
    
    if (roomConfig) {
      // Check if this room already exists in the matrix
      const existingRoom = matrixValue.find(r => r.id === newRoomType);
      
      if (!existingRoom) {
        // Create a new standardized room entry
        const newRoom: StandardizedRoom = {
          id: roomConfig.id,
          label: roomConfig.label || roomConfig.id,
          walls: false,
          ceiling: false,
          trim: false,
          doors: 0,
          windows: 0,
          cabinets: false,
          confidence: 1.0
        };
        
        console.log('RoomsMatrixField - Adding new room:', newRoom);
        onChange([...matrixValue, newRoom]);
      }
      
      // Reset the form
      setNewRoomType("");
      setShowAddRoom(false);
    }
  };
  
  // Filter available room options (not already in matrix)
  const availableRoomOptions = interiorRoomsMatrixConfig.rows.filter(
    row => !matrixValue.some(room => room.id === row.id)
  );
  
  // Check if a room has any surfaces selected
  const hasSelectedSurfaces = (room: StandardizedRoom) => {
    return interiorRoomsMatrixConfig.columns.some(column => {
      if (column.type === "checkbox") {
        return room[column.id as keyof StandardizedRoom] === true;
      } else if (column.type === "number") {
        return (room[column.id as keyof StandardizedRoom] as number) > 0;
      }
      return false;
    });
  };
  
  // Filter visible rooms (only show rooms with selected surfaces)
  const visibleMatrix = matrixValue.filter(hasSelectedSurfaces);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Rooms to Paint
          <Badge className="ml-2" variant="outline">
            {visibleMatrix.length} Room{visibleMatrix.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Desktop view: Table Matrix */}
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
                  // Get rooms in this group
                  const groupRooms = matrixValue.filter(room => {
                    const roomConfig = interiorRoomsMatrixConfig.rows.find(r => r.id === room.id);
                    return roomConfig?.group === group.id;
                  });
                  
                  // Skip empty groups
                  if (groupRooms.length === 0) return null;
                  
                  return (
                    <React.Fragment key={group.id}>
                      {/* Group Header */}
                      <TableRow className="bg-muted/50">
                        <TableCell 
                          colSpan={interiorRoomsMatrixConfig.columns.length + 1}
                          className="font-medium py-2 cursor-pointer"
                          onClick={() => toggleGroupVisibility(group.id)}
                        >
                          {group.label}
                          <Badge variant="outline" className="ml-2 text-xs">
                            {groupRooms.length}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      
                      {/* Group Rows */}
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
                                    handleCheckboxChange(room.id, column.id, Boolean(checked))
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
                                    handleNumberChange(room.id, column.id, parseInt(e.target.value) || 0)
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
          
          {/* Mobile view: Card-based UI */}
          <div className="md:hidden space-y-4">
            {roomGroups.map(group => {
              // Get rooms in this group
              const groupRooms = matrixValue.filter(room => {
                const roomConfig = interiorRoomsMatrixConfig.rows.find(r => r.id === room.id);
                return roomConfig?.group === group.id;
              }).filter(hasSelectedSurfaces);
              
              // Skip empty groups
              if (groupRooms.length === 0) return null;
              
              return (
                <div key={group.id} className="space-y-2">
                  <h3 
                    className="font-medium text-sm flex items-center cursor-pointer"
                    onClick={() => toggleGroupVisibility(group.id)}
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
                                        handleCheckboxChange(room.id, column.id, Boolean(checked))
                                      }
                                    />
                                  ) : column.type === "number" ? (
                                    <Input
                                      type="number"
                                      min={0}
                                      step={1}
                                      value={room[column.id as keyof StandardizedRoom] as number}
                                      onChange={e => 
                                        handleNumberChange(room.id, column.id, parseInt(e.target.value) || 0)
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
          
          {/* Add Room Form */}
          {showAddRoom ? (
            <div className="flex items-center gap-2 mt-4">
              <Select value={newRoomType} onValueChange={setNewRoomType}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a room to add" />
                </SelectTrigger>
                <SelectContent>
                  {roomGroups.map(group => (
                    <React.Fragment key={group.id}>
                      <div className="text-xs text-muted-foreground px-2 py-1">
                        {group.label}
                      </div>
                      {availableRoomOptions
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
              
              <Button 
                onClick={handleAddRoom} 
                disabled={!newRoomType}
              >
                Add
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setShowAddRoom(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setShowAddRoom(true)} 
              className="mt-2"
              disabled={availableRoomOptions.length === 0}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          )}
          
          {extractedRoomsList.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-2 bg-muted/50 rounded-md text-sm">
              <Info className="h-4 w-4 text-blue-500" />
              <p className="text-muted-foreground">
                {extractedRoomsList.length} room{extractedRoomsList.length !== 1 ? 's' : ''} detected from your recording
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomsMatrixField;
