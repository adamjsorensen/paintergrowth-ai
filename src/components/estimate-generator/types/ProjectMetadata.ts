
export interface ProjectMetadata {
  trimColor: string;
  wallColors: number;
  coats: 'one' | 'two';
  paintType: string;
  specialConsiderations: string;
  salesNotes: string;
  productionDate: Date | undefined;
  discountPercent: number;
}
