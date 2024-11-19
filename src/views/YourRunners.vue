<template>
  <div>
    <Win95Window 
      title="Your Runners" 
      :initial-x="100"
      :initial-y="initialWindowY"
      :initial-width="500"
      :initial-height="600"
      @close="$router.push('/')"
    >
      <!-- Native Tokens Section -->
      <div class="content-section">
        <h3>Native Tokens</h3>
        <div class="token-list" v-if="tokenData?.native?.length">
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
        <div class="token-list" v-if="tokenData?.erc20?.length">
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
        <div class="token-list" v-if="tokenData?.cw20?.length">
          <div v-for="token in tokenData.cw20" :key="token.token.address" class="token-item">
            <span class="token-symbol">{{ token.token.symbol }}</span>
            <span class="token-value">{{ formatTokenValue(token.value, token.token.decimals) }}</span>
          </div>
        </div>
        <div v-else class="no-data">No CW-20 tokens found</div>
      </div>
    </Win95Window>
    <TokenListWindow 
      :token-data="tokenData"
      @close="$router.push('/')"
    />
  </div>
</template>

<script>
import Win95Window from '@/components/Win95Window.vue'
import TokenListWindow from '@/components/TokenListWindow.vue'
import { fetchTokenData } from '../utils/tokenQueries'

export default {
  name: 'YourRunners',
  components: {
    Win95Window,
    TokenListWindow
  },
  data() {
    return {
      tokenData: {
        cw20: [],
        native: [],
        erc20: []
      }
    }
  },
  computed: {
    initialWindowY() {
      return typeof window !== 'undefined' ? window.innerHeight - 700 : 300;
    }
  },
  async mounted() {
    try {
      const seiAddress = this.$root.walletAddress;
      const evmAddress = this.$root.evmAddress;
      
      if (seiAddress) {
        console.log('Fetching token data for:', { seiAddress, evmAddress });
        const data = await fetchTokenData(seiAddress, evmAddress || '');
        this.tokenData = data;
      }
    } catch (error) {
      console.error('Error fetching token data:', error);
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
    }
  }
}
</script>

<style scoped>
@import '../styles/win95.css';

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
  min-width: 100px; /* Ensures alignment of numbers */
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