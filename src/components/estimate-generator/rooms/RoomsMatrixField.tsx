
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { interiorRoomsMatrixConfig, roomGroups } from "./InteriorRoomsConfig";
import { StandardizedRoom } from "@/types/room-types";
import { validateMatrixValue } from "./components/RoomValidation";
import { createCheckboxHandler, createNumberHandler } from "./components/RoomMatrixHandlers";
import RoomMatrixHeader from "./components/RoomMatrixHeader";
import RoomMatrixDesktop from "./components/RoomMatrixDesktop";
import RoomMatrixMobile from "./components/RoomMatrixMobile";
import AddRoomForm from "./components/AddRoomForm";
import RoomMatrixInfo from "./components/RoomMatrixInfo";

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
  // Track visible groups for collapsible UI
  const [visibleGroups, setVisibleGroups] = useState<Record<string, boolean>>(
    roomGroups.reduce((acc, group) => ({ ...acc, [group.id]: true }), {})
  );
  
  console.log('=== ROOMS MATRIX FIELD RENDER ===');
  console.log('RoomsMatrixField - Current matrix value:', matrixValue);
  console.log('RoomsMatrixField - Matrix length:', matrixValue?.length || 0);
  console.log('RoomsMatrixField - Extracted rooms list:', extractedRoomsList);
  console.log('RoomsMatrixField - Extracted rooms count:', extractedRoomsList.length);
  
  // Validate matrix value
  if (!Array.isArray(matrixValue)) {
    console.error('RoomsMatrixField - Invalid matrix value (not an array):', matrixValue);
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>Error: Invalid room matrix data</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Use validated matrix for all operations
  const workingMatrix = validateMatrixValue(matrixValue);
  
  // Toggle group visibility
  const toggleGroupVisibility = (groupId: string) => {
    setVisibleGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  
  // Create event handlers
  const handleCheckboxChange = createCheckboxHandler(workingMatrix, onChange);
  const handleNumberChange = createNumberHandler(workingMatrix, onChange);
  
  // Handle adding new room
  const handleAddRoom = (newRoom: StandardizedRoom) => {
    console.log('RoomsMatrixField - Adding new room:', newRoom);
    const updatedMatrix = [...workingMatrix, newRoom];
    onChange(updatedMatrix);
  };
  
  // Check if room is mentioned in extracted text
  const isRoomExtracted = (roomId: string) => {
    const isExtracted = extractedRoomsList.includes(roomId);
    console.log(`RoomsMatrixField - Room ${roomId} extracted: ${isExtracted}`);
    return isExtracted;
  };
  
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
  const visibleMatrix = workingMatrix.filter(hasSelectedSurfaces);
  console.log(`RoomsMatrixField - Visible rooms: ${visibleMatrix.length}/${workingMatrix.length}`);

  return (
    <Card className="mt-6">
      <RoomMatrixHeader visibleMatrix={visibleMatrix} />
      
      <CardContent>
        <div className="space-y-6">
          <RoomMatrixDesktop
            workingMatrix={workingMatrix}
            visibleGroups={visibleGroups}
            extractedRoomsList={extractedRoomsList}
            onCheckboxChange={handleCheckboxChange}
            onNumberChange={handleNumberChange}
            onToggleGroupVisibility={toggleGroupVisibility}
            isRoomExtracted={isRoomExtracted}
          />
          
          <RoomMatrixMobile
            workingMatrix={workingMatrix}
            visibleGroups={visibleGroups}
            extractedRoomsList={extractedRoomsList}
            onCheckboxChange={handleCheckboxChange}
            onNumberChange={handleNumberChange}
            onToggleGroupVisibility={toggleGroupVisibility}
            isRoomExtracted={isRoomExtracted}
            hasSelectedSurfaces={hasSelectedSurfaces}
          />
          
          {/* Desktop Add Room Form - only show on desktop */}
          <div className="hidden md:block">
            <AddRoomForm
              workingMatrix={workingMatrix}
              onChange={onChange}
            />
          </div>
          
          <RoomMatrixInfo extractedRoomsList={extractedRoomsList} />
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomsMatrixField;
