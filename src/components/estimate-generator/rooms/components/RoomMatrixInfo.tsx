
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface RoomMatrixInfoProps {
  extractedRoomsList: string[];
}

const RoomMatrixInfo: React.FC<RoomMatrixInfoProps> = ({ extractedRoomsList }) => {
  if (extractedRoomsList.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-4 p-2 bg-muted/50 rounded-md text-sm">
      <Info className="h-4 w-4 text-blue-500" />
      <p className="text-muted-foreground">
        {extractedRoomsList.length} room{extractedRoomsList.length !== 1 ? 's' : ''} detected from your recording
      </p>
    </div>
  );
};

export default RoomMatrixInfo;
