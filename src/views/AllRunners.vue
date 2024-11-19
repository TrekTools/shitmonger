<template>
    <div>
      <Win95Window 
        title="All Runners" 
        :initial-x="100"
        :initial-y="initialWindowY"
        :initial-width="500"
        :initial-height="600"
        @close="handleClose"
      >
        <div class="token-lists">
          <!-- Native Tokens Section -->
          <div class="content-section">
            <h3>Native Tokens</h3>
            <div v-if="tokenData?.native?.length" class="token-list">
              <div v-for="token in tokenData.native" :key="token.token.address" class="token-item">
                <span class="token-symbol">{{ token.token.symbol }}</span>
                <span class="token-value">{{ formatTokenValue(token.value, token.token.decimals) }}</span>
              </div>
            </div>
            <div v-else class="no-data">No native tokens found</div>
          </div>
  
          <!-- ERC-20 Tokens Section -->
          <div class="content-section">
            <h3>ERC-20 Tokens</h3>
            <div v-if="tokenData?.erc20?.length" class="token-list">
              <div v-for="token in tokenData.erc20" :key="token.token.address" class="token-item">
                <span class="token-symbol">{{ token.token.symbol }}</span>
                <span class="token-value">{{ formatTokenValue(token.value, token.token.decimals) }}</span>
              </div>
            </div>
            <div v-else class="no-data">No ERC-20 tokens found</div>
          </div>
  
          <!-- CW-20 Tokens Section -->
          <div class="content-section">
            <h3>CW-20 Tokens</h3>
            <div v-if="tokenData?.cw20?.length" class="token-list">
              <div v-for="token in tokenData.cw20" :key="token.token.address" class="token-item">
                <span class="token-symbol">{{ token.token.symbol }}</span>
                <span class="token-value">{{ formatTokenValue(token.value, token.token.decimals) }}</span>
              </div>
            </div>
            <div v-else class="no-data">No CW-20 tokens found</div>
          </div>
        </div>
      </Win95Window>
  
      <PriceCharts 
        ref="priceCharts"
        :initial-x="600"
        :initial-y="initialWindowY"
        :initial-width="800"
        :initial-height="400"
        @close="handleClose"
      />
      <TokenTable 
        :timeseries-data="timeseriesData"
        :initial-x="600"
        :initial-y="initialWindowY + 450"
      />
    </div>
  </template>
  
  <script>
  import Win95Window from '@/components/Win95Window.vue'
  import PriceCharts from '@/components/PriceCharts.vue'
  import TokenTable from '@/components/TokenTable.vue'
  import { getEvmAddress } from '../utils/addressQueries'
  import { fetchTokenData } from '../utils/tokenQueries'
  
  export default {
    name: 'AllRunners',
    components: {
      Win95Window,
      PriceCharts,
      TokenTable
    },
    data() {
      return {
        timeseriesData: [],
        tokenData: {
          cw20: [],
          native: [],
          erc20: []
        },
        loading: false,
        error: null
      }
    },
    computed: {
      initialWindowY() {
        return typeof window !== 'undefined' ? window.innerHeight - 700 : 300;
      }
    },
    async mounted() {
      try {
        this.loading = true;
        
        // Watch for timeseries data updates from PriceCharts
        this.$watch(
          () => this.$refs.priceCharts?.timeseriesData,
          (newData) => {
            if (newData) {
              this.timeseriesData = newData
            }
          },
          { immediate: true }
        )

        // Fetch token data
        const seiAddress = this.$root.walletAddress;
        if (seiAddress) {
          // Get EVM address first
          const evmAddress = await getEvmAddress(seiAddress);
          console.log('Addresses:', { seiAddress, evmAddress });
          
          // Fetch token data with both addresses
          const data = await fetchTokenData(seiAddress, evmAddress || '');
          this.tokenData = data;
        }
      } catch (error) {
        console.error('Error in AllRunners:', error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    methods: {
      formatTokenValue(value, decimals = 6) {
        if (!value) return '0';
        
        const actualValue = Number(value) / Math.pow(10, decimals);
        
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 6,
          useGrouping: true
        }).format(actualValue);
      },
      handleClose() {
        console.log('Window closed');
      }
    }
  }
  </script>
  
  <style scoped>
  .token-lists {
    height: 100%;
    overflow-y: auto;
  }
  
  .content-section {
    margin-bottom: 16px;
  }
  
  .content-section h3 {
    margin: 0;
    color: #000080;
    font-size: 14px;
  }
  
  .token-list {
    background: white;
    border: 1px solid #808080;
    margin-top: 8px;
  }
  
  .token-item {
    display: flex;
    justify-content: space-between;
    padding: 6px 8px;
    border-bottom: 1px solid #d4d4d4;
    font-size: 12px;
  }
  
  .token-item:last-child {
    border-bottom: none;
  }
  
  .token-symbol {
    font-weight: bold;
    color: #000080;
  }
  
  .token-value {
    font-family: 'Courier New', monospace;
    text-align: right;
    min-width: 100px;
  }
  
  .no-data {
    color: #666;
    font-size: 12px;
    padding: 8px;
    text-align: center;
    background: #f0f0f0;
    border: 1px solid #808080;
    margin-top: 8px;
  }
  </style> 