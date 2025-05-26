
/**
 * Pricing calculation utilities for different room types and surfaces
 */

// Helper functions to calculate prices based on room label
export const calculateWallsPrice = (roomLabel: string): number => {
  console.log(`calculateWallsPrice - Calculating for room: "${roomLabel}"`);
  
  if (!roomLabel || typeof roomLabel !== 'string') {
    console.warn('calculateWallsPrice - Invalid roomLabel:', roomLabel);
    return 300; // Default price
  }
  
  const roomLower = roomLabel.toLowerCase();
  let price = 300; // Default
  
  if (roomLower.includes('kitchen') || roomLower.includes('bathroom')) {
    price = 400; // More expensive for wet areas
    console.log(`calculateWallsPrice - Wet area pricing applied: $${price}`);
  } else if (roomLower.includes('master') || roomLower.includes('living')) {
    price = 350; // Standard large rooms
    console.log(`calculateWallsPrice - Large room pricing applied: $${price}`);
  } else {
    console.log(`calculateWallsPrice - Standard room pricing applied: $${price}`);
  }
  
  return price;
};

export const calculateCeilingPrice = (roomLabel: string): number => {
  console.log(`calculateCeilingPrice - Calculating for room: "${roomLabel}"`);
  
  if (!roomLabel || typeof roomLabel !== 'string') {
    console.warn('calculateCeilingPrice - Invalid roomLabel:', roomLabel);
    return 180; // Default price
  }
  
  const roomLower = roomLabel.toLowerCase();
  let price = 180; // Default
  
  if (roomLower.includes('kitchen') || roomLower.includes('bathroom')) {
    price = 250; // More expensive for wet areas
    console.log(`calculateCeilingPrice - Wet area pricing applied: $${price}`);
  } else if (roomLower.includes('master') || roomLower.includes('living')) {
    price = 200; // Standard large rooms
    console.log(`calculateCeilingPrice - Large room pricing applied: $${price}`);
  } else {
    console.log(`calculateCeilingPrice - Standard room pricing applied: $${price}`);
  }
  
  return price;
};

export const calculateCabinetPrice = (roomLabel: string): number => {
  console.log(`calculateCabinetPrice - Calculating for room: "${roomLabel}"`);
  
  if (!roomLabel || typeof roomLabel !== 'string') {
    console.warn('calculateCabinetPrice - Invalid roomLabel:', roomLabel);
    return 500; // Default price
  }
  
  const roomLower = roomLabel.toLowerCase();
  let price = 500; // Default
  
  if (roomLower.includes('kitchen')) {
    price = 1800; // Kitchen cabinets are most expensive
    console.log(`calculateCabinetPrice - Kitchen cabinet pricing applied: $${price}`);
  } else if (roomLower.includes('bathroom')) {
    price = 700; // Bathroom vanities
    console.log(`calculateCabinetPrice - Bathroom cabinet pricing applied: $${price}`);
  } else {
    console.log(`calculateCabinetPrice - Standard cabinet pricing applied: $${price}`);
  }
  
  return price;
};
