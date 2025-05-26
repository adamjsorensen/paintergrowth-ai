
/**
 * Canonical room object structure used throughout the application
 */
export interface StandardizedRoom {
  id: string;
  label: string;
  walls: boolean;
  ceiling: boolean;
  trim: boolean;
  doors: number;
  windows: number;
  cabinets: boolean;
  confidence?: number;
  selected?: boolean; // For UI state
}

/**
 * Room data as extracted from AI
 */
export interface ExtractedRoom {
  room_id: string;
  label: string;
  surfaces: {
    walls: boolean;
    ceiling: boolean;
    trim: boolean;
    doors: number | null;
    windows: number | null;
    cabinets: boolean;
  };
  confidence: number;
}

/**
 * Room data for matrix display (extends standardized room with UI state)
 */
export interface MatrixRoom extends StandardizedRoom {
  selected: boolean;
}
