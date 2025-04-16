
// Update the column type inference to match the new type definition
const getColumnDefinitions = () => {
  if (matrixConfig) {
    return matrixConfig.columns;
  }
  
  // Infer columns from first item
  const sampleItem = matrixData[0];
  const columns: MatrixColumn[] = [];
  
  Object.entries(sampleItem).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'label') {
      const type: 'number' | 'checkbox' | 'text' = 
        typeof value === 'number' ? 'number' : 
        typeof value === 'boolean' ? 'checkbox' : 
        'text';
      
      columns.push({ 
        id: key, 
        label: key.charAt(0).toUpperCase() + key.slice(1), 
        type 
      });
    }
  });
  
  return columns;
};
