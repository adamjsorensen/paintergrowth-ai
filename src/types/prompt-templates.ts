
// Update the MatrixColumn type to include 'text' as a valid type
export interface MatrixColumn {
  id: string;
  label: string;
  type: 'number' | 'checkbox' | 'text';
}
