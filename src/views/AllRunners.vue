<template>
    <div>
      <Win95Window 
        v-if="!windowStates.allRunners.minimized"
        title="All Runners" 
        :initial-x="100"
        :initial-y="initialWindowY"
        :initial-width="500"
        :initial-height="600"
        @close="minimizeWindow('allRunners')"
      >
        <div class="token-lists">
          <!-- Loading and Error states -->
          <div v-if="loading" class="loading">Loading tokens...</div>
          <div v-if="error" class="error">{{ error }}</div>
  
          <!-- Native Tokens Section -->
          <div class="content-section">
            <h3>Native Tokens</h3>
            <div v-if="tokenData.native && tokenData.native.length > 0" class="token-list">
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
            <div v-if="tokenData.erc20 && tokenData.erc20.length > 0" class="token-list">
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
            <div v-if="tokenData.cw20 && tokenData.cw20.length > 0" class="token-list">
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
        v-if="!windowStates.priceCharts.minimized"
        ref="priceCharts"
        :initial-x="600"
        :initial-y="initialWindowY"
        :initial-width="800"
        :initial-height="400"
        @close="minimizeWindow('priceCharts')"
      />
      <TokenTable 
        v-if="!windowStates.tokenTable.minimized"
        :timeseries-data="processedTimeseriesData"
        :initial-x="600"
        :initial-y="initialWindowY + 450"
        :initial-width="800"
        :initial-height="300"
        @close="minimizeWindow('tokenTable')"
        @token-action="handleTokenAction"
      />

      <PriceTable 
        v-if="!windowStates.priceTable.minimized"
        :initial-x="rightPanelX"
        :initial-y="40"
        :initial-width="800"
        :initial-height="rightPanelHeight - 40"
        :token-data="tokenData"
        @close="minimizeWindow('priceTable')"
        @token-action="handleTokenAction"
      />

      <!-- Taskbar -->
      <Win95Taskbar 
        :minimized-windows="minimizedWindowsList"
        @restore="restoreWindow"
      />
    </div>
  </template>
  
  <script>
  import Win95Window from '@/components/Win95Window.vue'
  import PriceCharts from '@/components/PriceCharts.vue'
  import TokenTable from '@/components/TokenTable.vue'
  import PriceTable from '@/components/PriceTable.vue'
  import Win95Taskbar from '@/components/Win95Taskbar.vue'
  import { getEvmAddress } from '../utils/addressQueries'
  import { fetchTokenData } from '../utils/tokenQueries'
  
  export default {
    name: 'AllRunners',
    components: {
      Win95Window,
      PriceCharts,
      TokenTable,
      PriceTable,
      Win95Taskbar
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
        error: null,
        windowStates: {
          allRunners: { minimized: false, title: 'All Runners' },
          priceCharts: { minimized: true, title: 'Price Charts' },
          tokenTable: { minimized: true, title: 'Token Table' },
          priceTable: { minimized: false, title: 'Price Table' }
        },
        windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
        windowHeight: typeof window !== 'undefined' ? window.innerHeight : 768
      }
    },
    computed: {
      initialWindowY() {
        return this.windowHeight - 700
      },
      rightPanelX() {
        return this.windowWidth - 820
      },
      rightPanelHeight() {
        return this.windowHeight - 100
      },
      minimizedWindowsList() {
        return Object.entries(this.windowStates)
          .filter(([, state]) => state.minimized)
          .map(([id, state]) => ({
            id,
            title: state.title
          }))
      },
      processedTimeseriesData() {
        const processed = [];
        
        this.tokenData.native.forEach(token => {
          processed.push({
            symbol: token.token.symbol,
            usd_price: token.value,
            rounded_time: new Date().toISOString(),
            type: 'NATIVE'
          });
        });

        this.tokenData.erc20.forEach(token => {
          processed.push({
            symbol: token.token.symbol,
            usd_price: token.value,
            rounded_time: new Date().toISOString(),
            type: 'ERC20'
          });
        });

        this.tokenData.cw20.forEach(token => {
          processed.push({
            symbol: token.token.symbol,
            usd_price: token.value,
            rounded_time: new Date().toISOString(),
            type: 'CW20'
          });
        });

        console.log('Processed timeseries data:', processed);
        return processed;
      }
    },
    async created() {
      await this.fetchAllTokens()
    },
    mounted() {
      // Update window dimensions on mount
      this.updateWindowDimensions()
      window.addEventListener('resize', this.updateWindowDimensions)
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.updateWindowDimensions)
    },
    watch: {
      '$root.walletAddress': {
        immediate: true,
        handler: async function(newAddress) {
          if (newAddress) {
            console.log('Wallet connected, fetching tokens...');
            await this.fetchAllTokens();
          } else {
            console.log('No wallet connected');
            this.tokenData = {
              native: [],
              erc20: [],
              cw20: []
            };
          }
        }
      }
    },
    methods: {
      async fetchAllTokens() {
        try {
          this.loading = true;
          this.error = null;

          const seiAddress = this.$root.walletAddress;
          console.log('Wallet Address:', seiAddress);
          
          if (!seiAddress) {
            this.error = 'No wallet address found. Please connect your wallet.';
            return;
          }

          const evmAddress = await getEvmAddress(seiAddress);
          console.log('EVM Address:', evmAddress);

          const data = await fetchTokenData(seiAddress, evmAddress);
          console.log('Token Data:', data);

          this.tokenData = {
            native: data.native || [],
            erc20: evmAddress ? (data.erc20 || []) : [],
            cw20: data.cw20 || []
          };

        } catch (error) {
          console.error('Error in fetchAllTokens:', error);
          this.error = error.message;
        } finally {
          this.loading = false;
        }
      },
      formatTokenValue(value, decimals = 6) {
        if (!value) return '0'
        const actualValue = Number(value) / Math.pow(10, decimals)
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 6,
          useGrouping: true
        }).format(actualValue)
      },
      minimizeWindow(windowId) {
        if (this.windowStates[windowId]) {
          this.windowStates[windowId].minimized = true
        }
      },
      restoreWindow(windowId) {
        if (this.windowStates[windowId]) {
          this.windowStates[windowId].minimized = false
        }
      },
      handleTokenAction(action) {
        console.log('Token action:', action)
        // Handle the trade action here
      },
      updateWindowDimensions() {
        this.windowWidth = window.innerWidth
        this.windowHeight = window.innerHeight
        
        // Update PriceTable position if it exists and is not minimized
        if (!this.windowStates.priceTable.minimized) {
          const priceTable = this.$refs.priceTable
          if (priceTable) {
            priceTable.updatePosition({
              x: this.rightPanelX,
              y: 40,
              width: 800,
              height: this.rightPanelHeight - 40
            })
          }
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .token-lists {
    height: 100%;
    overflow-y: auto;
    padding-bottom: 40px;
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