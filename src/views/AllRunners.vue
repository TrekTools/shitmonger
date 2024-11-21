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
                <div class="token-info">
                  <span class="token-symbol">{{ token.token.symbol }}</span>
                  <span class="token-name">{{ token.token.name || 'Unknown' }}</span>
                  <span class="token-address">{{ token.token.address }}</span>
                </div>
                <div class="token-values">
                  <span class="token-amount">{{ formatTokenValue(token.value, token.token.decimals) }}</span>
                  <span class="token-usd">${{ formatUsdValue(token) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-data">No native tokens found</div>
          </div>
  
          <!-- ERC-20 Tokens Section -->
          <div class="content-section">
            <h3>ERC-20 Tokens</h3>
            <div v-if="tokenData.erc20 && tokenData.erc20.length > 0" class="token-list">
              <div v-for="token in tokenData.erc20" :key="token.token.address" class="token-item">
                <div class="token-info">
                  <span class="token-symbol">{{ token.token.symbol }}</span>
                  <span class="token-name">{{ token.token.name || 'Unknown' }}</span>
                  <span class="token-address">{{ token.token.address }}</span>
                  <span class="token-evm" v-if="token.token.evmAddress">EVM: {{ token.token.evmAddress }}</span>
                </div>
                <div class="token-values">
                  <span class="token-amount">{{ formatTokenValue(token.value, token.token.decimals) }}</span>
                  <span class="token-usd">${{ formatUsdValue(token) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-data">No ERC-20 tokens found</div>
          </div>
  
          <!-- CW-20 Tokens Section -->
          <div class="content-section">
            <h3>CW-20 Tokens</h3>
            <div v-if="tokenData.cw20 && tokenData.cw20.length > 0" class="token-list">
              <div v-for="token in tokenData.cw20" :key="token.token.address" class="token-item">
                <div class="token-info">
                  <span class="token-symbol">{{ token.token.symbol }}</span>
                  <span class="token-name">{{ token.token.name || 'Unknown' }}</span>
                  <span class="token-address">{{ token.token.address }}</span>
                  <span class="token-evm" v-if="token.token.evmAddress">EVM: {{ token.token.evmAddress }}</span>
                </div>
                <div class="token-values">
                  <span class="token-amount">{{ formatTokenValue(token.value, token.token.decimals) }}</span>
                  <span class="token-usd">${{ formatUsdValue(token) }}</span>
                </div>
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
      this.updateWindowDimensions()
      window.addEventListener('resize', this.updateWindowDimensions)
      
      this.fetchTimeseriesData().then(() => {
        if (this.$root.walletAddress) {
          this.fetchAllTokens()
        }
      })
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.updateWindowDimensions)
    },
    watch: {
      '$root.walletAddress': {
        immediate: true,
        handler: async function(newAddress) {
          if (newAddress) {
            await this.fetchTimeseriesData()
            await this.fetchAllTokens()
          } else {
            this.tokenData = {
              native: [],
              erc20: [],
              cw20: []
            }
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
      },
      formatUsdValue(token) {
        const amount = Number(token.value) / Math.pow(10, token.token.decimals)
        const price = this.getTokenPrice(token.token.symbol)
        const total = amount * price
        console.log(`Calculating USD value for ${token.token.symbol}:`, { amount, price, total })
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: true
        }).format(total)
      },
      getTokenPrice(symbol) {
        const tokenData = this.timeseriesData.find(t => t.symbol === symbol)
        console.log(`Getting price for ${symbol}:`, tokenData?.usd_price || 0)
        return tokenData ? parseFloat(tokenData.usd_price) : 0
      },
      async fetchTimeseriesData() {
        try {
          console.log('Fetching timeseries data...')
          const response = await fetch(process.env.VUE_APP_GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-hasura-admin-secret': process.env.VUE_APP_HASURA_ADMIN_SECRET
            },
            body: JSON.stringify({
              query: `
                query GetTokenTimeseries {
                  token_timeseries(
                    where: {
                      symbol: {_in: ["SEI", "POPO", "MILLI", "WARP", "SPECTRE"]}
                    }
                    order_by: [{symbol: asc}, {rounded_time: desc}]
                    distinct_on: [symbol]
                  ) {
                    symbol
                    name
                    usd_price
                    rounded_time
                  }
                }
              `
            })
          })
          
          const data = await response.json()
          if (data.errors) {
            console.error('GraphQL Errors:', data.errors)
            return
          }

          this.timeseriesData = data.data?.token_timeseries || []
          console.log('Received timeseries data:', this.timeseriesData)
        } catch (error) {
          console.error('Error fetching timeseries data:', error)
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
    padding: 8px;
    border-bottom: 1px solid #d4d4d4;
    font-size: 12px;
    align-items: flex-start;
  }
  
  .token-item:last-child {
    border-bottom: none;
  }
  
  .token-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-width: 70%;
  }
  
  .token-symbol {
    font-weight: bold;
    color: #000080;
  }
  
  .token-name {
    color: #444;
    font-style: italic;
  }
  
  .token-address, .token-evm {
    font-family: 'Courier New', monospace;
    font-size: 10px;
    color: #666;
    word-break: break-all;
  }
  
  .token-values {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    min-width: 30%;
  }
  
  .token-amount {
    font-family: 'Courier New', monospace;
    color: #000080;
    text-align: right;
  }
  
  .token-usd {
    font-family: 'Courier New', monospace;
    font-size: 11px;
    color: #666;
    text-align: right;
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