<template>
  <Win95Window 
    title="Token List" 
    :initial-x="700"
    :initial-y="initialWindowY"
    :initial-width="500"
    :initial-height="600"
    @close="$emit('close')"
  >
    <div class="token-lists">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search tokens..."
          class="win95-input"
        >
      </div>

      <table class="win95-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Type</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="token in filteredTokens" :key="token.id">
            <td>{{ token.token.symbol }}</td>
            <td>{{ token.type }}</td>
            <td class="token-value">{{ formatTokenValue(token.value, token.token.decimals) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Win95Window>
</template>

<script>
import Win95Window from './Win95Window.vue'

export default {
  name: 'TokenListWindow',
  components: {
    Win95Window
  },
  props: {
    tokenData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      searchQuery: ''
    }
  },
  computed: {
    initialWindowY() {
      return typeof window !== 'undefined' ? window.innerHeight - 700 : 300
    },
    allTokens() {
      const tokens = []
      
      // Add all tokens except SEI
      if (this.tokenData.native) {
        this.tokenData.native
          .filter(t => t.token.symbol !== 'SEI')
          .forEach(t => tokens.push({ ...t, type: 'Native' }))
      }
      
      if (this.tokenData.cw20) {
        this.tokenData.cw20.forEach(t => tokens.push({ ...t, type: 'CW20' }))
      }
      
      if (this.tokenData.erc20) {
        this.tokenData.erc20.forEach(t => tokens.push({ ...t, type: 'ERC20' }))
      }
      
      return tokens
    },
    filteredTokens() {
      if (!this.searchQuery) return this.allTokens
      
      const query = this.searchQuery.toLowerCase()
      return this.allTokens.filter(token => 
        token.token.symbol.toLowerCase().includes(query)
      )
    }
  },
  methods: {
    formatTokenValue(value, decimals = 6) {
      if (!value) return '0'
      const actualValue = Number(value) / Math.pow(10, decimals)
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
        useGrouping: true
      }).format(actualValue)
    }
  }
}
</script>

<style scoped>
.token-lists {
  height: 100%;
  overflow-y: auto;
  padding: 8px;
}

.search-bar {
  margin-bottom: 16px;
}

.win95-input {
  width: 100%;
  padding: 4px 8px;
  border: 2px solid;
  border-color: #808080;
}

.win95-table {
  width: 100%;
  border-collapse: collapse;
}

.win95-table th,
.win95-table td {
  padding: 4px 8px;
  text-align: left;
}

.win95-table th {
  background-color: #f0f0f0;
}

.token-value {
  text-align: right;
}
</style> 