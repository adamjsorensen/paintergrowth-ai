
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import RoomMatrixMobile from '../../rooms/components/RoomMatrixMobile';
import { StandardizedRoom } from '@/types/room-types';
import { roomGroups } from '../../rooms/config/RoomDefinitions';
import { extractRoomsFromFields } from '../../rooms/RoomExtractionUtils';

interface RoomsTabContentProps {
  projectType: 'interior' | 'exterior';
  roomsMatrix: StandardizedRoom[];
  extractedData: Record<string, any>;
  hasSelectedSurfaces: (room: StandardizedRoom) => boolean;
  onCheckboxChange: (roomId: string, columnId: string, checked: boolean) => void;
  onNumberChange: (roomId: string, columnId: string, value: number) => void;
  onSetActiveTab: (tab: string) => void;
  onStartOver?: () => void;
  onRoomMatrixChange?: (matrix: StandardizedRoom[]) => void;
}

const RoomsTabContent: React.FC<RoomsTabContentProps> = ({
  projectType,
  roomsMatrix,
  extractedData,
  hasSelectedSurfaces,
  onCheckboxChange,
  onNumberChange,
  onSetActiveTab,
  onRoomMatrixChange
}) => {
  const toggleGroupVisibility = (groupId: string) => {
    console.log('RoomsTabContent - Toggle group visibility:', groupId);
    // This will be implemented when RoomMatrixMobile is properly integrated
  };

  const isRoomExtracted = (roomId: string) => {
    // Check if room was extracted from AI
    const { extractedRoomsList } = extractRoomsFromFields(extractedData);
    return extractedRoomsList.includes(roomId);
  };

  // Use proper group visibility mapping that matches config
  const visibleGroups = roomGroups.reduce((acc, group) => {
    acc[group.id] = true; // All groups visible by default
    return acc;
  }, {} as Record<string, boolean>);

  const extractedRoomsList = extractRoomsFromFields(extractedData).extractedRoomsList;

  if (projectType === 'exterior') {
    return (
      <div className="text-center py-12">
        <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">Exterior Project</h3>
        <p className="text-gray-500">Rooms are only used for interior estimates.</p>
        <Button
          variant="outline"
          onClick={() => onSetActiveTab('pricing')}
          className="mt-4"
        >
          Continue to Pricing
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Select Rooms & Surfaces</h2>
        <p className="text-gray-600 text-sm">Choose which rooms and surfaces to include</p>
      </div>
      
      <RoomMatrixMobile
        workingMatrix={roomsMatrix}
        visibleGroups={visibleGroups}
        extractedRoomsList={extractedRoomsList}
        onCheckboxChange={onCheckboxChange}
        onNumberChange={onNumberChange}
        onToggleGroupVisibility={toggleGroupVisibility}
        isRoomExtracted={isRoomExtracted}
        hasSelectedSurfaces={hasSelectedSurfaces}
      />
      
      <div className="mt-6">
        <Button
          onClick={() => onSetActiveTab('pricing')}
          className="w-full"
          disabled={!roomsMatrix.some(room => hasSelectedSurfaces(room))}
        >
          Continue to Pricing
        </Button>
      </div>
    </>
  );
};

export default RoomsTabContent;
