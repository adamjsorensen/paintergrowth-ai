
export const useTotalsCalculation = () => {
  // Calculate totals from line items
  const calculateTotals = (lineItems: any[]) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  };

  return {
    calculateTotals
  };
};
