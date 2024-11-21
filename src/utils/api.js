export const fetchTokenData = async (seiAddress, evmAddress) => {
  try {
    // Add your actual implementation here
    // For now, returning mock data
    console.log('Fetching token data for:', { seiAddress, evmAddress });
    
    return {
      native: [
        { token: { symbol: 'SEI', address: seiAddress } },
        // Add other native tokens as needed
      ],
      erc20: evmAddress ? [
        { token: { symbol: 'WSEI', address: evmAddress } },
        // Add other ERC20 tokens as needed
      ] : [],
      cw20: [
        { token: { symbol: 'ATOM', address: 'sei...' } },
        // Add other CW20 tokens as needed
      ]
    };
  } catch (error) {
    console.error('Error fetching token data:', error);
    throw error;
  }
}; 