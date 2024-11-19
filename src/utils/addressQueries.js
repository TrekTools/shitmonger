export async function getEvmAddress(seiAddress) {
  const baseUrl = 'https://seitrace.com/pacific-1/gateway/api/v1/addresses';
  
  try {
    const response = await fetch(`${baseUrl}/${seiAddress}`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch EVM address for ${seiAddress}:`, response.status);
      return null;
    }

    const data = await response.json();
    const evmAddress = data.association?.evm_hash;
    
    if (!evmAddress) {
      console.warn('No EVM address found in response for:', seiAddress);
    }

    return evmAddress || null;
  } catch (error) {
    console.error('Error fetching EVM address:', error);
    return null;
  }
} 