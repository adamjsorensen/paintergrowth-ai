
// Single source-of-truth for room-related types

/**
 * Matrix row interface with floor property for room definitions
 */
export interface MatrixRow {
  id: string;
  label: string;
  group?: string;
  floor?: 'main' | 'upstairs' | 'basement';
}

/**
 * Matrix column interface (re-exported from base types)
 */
export interface MatrixColumn {
  id: string;
  label: string;
  type: 'number' | 'checkbox' | 'text';
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
}

/**
 * Matrix group interface (re-exported from base types)
 */
export interface MatrixGroup {
  id: string;
  label: string;
  rowIds: string[];
}

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
  selected?: boolean;
  floor?: 'main' | 'upstairs' | 'basement';
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
