export async function getEvmAddress(seiAddress) {
  const baseUrl = 'https://seitrace.com/pacific-1/gateway/api/v1/addresses';
  
  try {
    const response = await fetch(`${baseUrl}/${seiAddress}`);
    const data = await response.json();
    return data.association?.evm_hash || null;
  } catch (error) {
    console.error('Error fetching EVM address:', error);
    throw error;
  }
} 