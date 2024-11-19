export async function fetchTokenData(seiAddress, evmAddress) {
  const baseUrl = 'https://seitrace.com/pacific-1/gateway/api/v1/addresses';
  
  try {
    // Fetch all token types in parallel
    const [cw20Data, nativeData, erc20Data] = await Promise.all([
      fetch(`${baseUrl}/${seiAddress}/tokens?type=CW-20`).then(res => res.json()),
      fetch(`${baseUrl}/${seiAddress}/tokens?type=NATIVE`).then(res => res.json()),
      fetch(`${baseUrl}/${evmAddress}/tokens?type=ERC-20`).then(res => res.json())
    ]);

    return {
      cw20: cw20Data.items || [],
      native: nativeData.items || [],
      erc20: erc20Data.items || []
    };
  } catch (error) {
    console.error('Error fetching token data:', error);
    throw error;
  }
} 