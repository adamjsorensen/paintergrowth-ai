
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StandardizedRoom } from "@/types/room-types";

interface RoomMatrixHeaderProps {
  visibleMatrix: StandardizedRoom[];
}

const RoomMatrixHeader: React.FC<RoomMatrixHeaderProps> = ({ visibleMatrix }) => {
  return (
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        Rooms to Paint
        <Badge className="ml-2" variant="outline">
          {visibleMatrix.length} Room{visibleMatrix.length !== 1 ? 's' : ''}
        </Badge>
      </CardTitle>
    </CardHeader>
  );
};

export default RoomMatrixHeader;
