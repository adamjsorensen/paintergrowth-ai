
export interface ProjectMetadata {
  trimColor: string;
  wallColors: number;
  coats: 'one' | 'two';
  paintType: string;
  projectNotes: string; // Consolidated from specialConsiderations and other general notes
  internalNotes: string; // Consolidated from salesNotes and customer needs
  productionDate: Date | undefined;
  discountPercent: number;
}
