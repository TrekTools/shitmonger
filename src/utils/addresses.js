export const getEvmAddress = async (seiAddress) => {
  try {
    // Add your actual implementation here
    // For now, returning a mock implementation
    console.log('Getting EVM address for:', seiAddress);
    return `0x${seiAddress.slice(3)}`; // Mock conversion
  } catch (error) {
    console.error('Error getting EVM address:', error);
    throw error;
  }
}; 