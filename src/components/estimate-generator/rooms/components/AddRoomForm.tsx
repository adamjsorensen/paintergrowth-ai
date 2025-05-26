
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { interiorRoomsMatrixConfig, roomGroups } from "../InteriorRoomsConfig";
import { StandardizedRoom } from "@/types/room-types";

interface AddRoomFormProps {
  workingMatrix: StandardizedRoom[];
  onChange: (matrix: StandardizedRoom[]) => void;
}

const AddRoomForm: React.FC<AddRoomFormProps> = ({
  workingMatrix,
  onChange
}) => {
  const [newRoomType, setNewRoomType] = useState("");
  const [showAddRoom, setShowAddRoom] = useState(false);
  
  const handleAddRoom = () => {
    console.log(`=== ADD ROOM ===`);
    console.log(`RoomsMatrixField - Adding room: ${newRoomType}`);
    
    if (!newRoomType) {
      console.warn('RoomsMatrixField - No room type selected for adding');
      return;
    }
    
    const roomConfig = interiorRoomsMatrixConfig.rows.find(r => r.id === newRoomType);
    
    if (roomConfig) {
      console.log('RoomsMatrixField - Found room config:', roomConfig);
      
      const existingRoom = workingMatrix.find(r => r.id === newRoomType);
      
      if (!existingRoom) {
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
        
        console.log('RoomsMatrixField - Creating new room:', newRoom);
        
        const isValid = newRoom.id && 
                       newRoom.label && 
                       typeof newRoom.walls === 'boolean' &&
                       typeof newRoom.ceiling === 'boolean' &&
                       typeof newRoom.trim === 'boolean' &&
                       typeof newRoom.doors === 'number' &&
                       typeof newRoom.windows === 'number' &&
                       typeof newRoom.cabinets === 'boolean';
        
        if (isValid) {
          const updatedMatrix = [...workingMatrix, newRoom];
          console.log('RoomsMatrixField - Updated matrix with new room:', updatedMatrix);
          onChange(updatedMatrix);
        } else {
          console.error('RoomsMatrixField - New room is invalid:', newRoom);
        }
      } else {
        console.warn(`RoomsMatrixField - Room ${newRoomType} already exists in matrix`);
      }
      
      setNewRoomType("");
      setShowAddRoom(false);
    } else {
      console.error(`RoomsMatrixField - Room configuration not found for: ${newRoomType}`);
    }
  };
  
  const availableRoomOptions = interiorRoomsMatrixConfig.rows.filter(
    row => !workingMatrix.some(room => room.id === row.id)
  );

  return (
    <>
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
    </>
  );
};

export default AddRoomForm;
