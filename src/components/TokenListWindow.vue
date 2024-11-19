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
            <th @click="sort('symbol')" :class="getSortClass('symbol')">Symbol</th>
            <th @click="sort('price')" :class="getSortClass('price')">Price</th>
            <th @click="sort('1h')" :class="getSortClass('1h')">1h %</th>
            <th @click="sort('2h')" :class="getSortClass('2h')">2h %</th>
            <th @click="sort('6h')" :class="getSortClass('6h')">6h %</th>
            <th @click="sort('12h')" :class="getSortClass('12h')">12h %</th>
            <th @click="sort('24h')" :class="getSortClass('24h')">24h %</th>
            <th @click="sort('time')" :class="getSortClass('time')">Last Updated</th>
            <th>Balance</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="token in filteredTokens" :key="token.id">
            <td>{{ token.token.symbol }}</td>
            <td>${{ formatPrice(token.price) }}</td>
            <td :class="getPriceChangeClass(token.changes['1h'])">
              {{ formatPriceChange(token.changes['1h']) }}
            </td>
            <td :class="getPriceChangeClass(token.changes['2h'])">
              {{ formatPriceChange(token.changes['2h']) }}
            </td>
            <td :class="getPriceChangeClass(token.changes['6h'])">
              {{ formatPriceChange(token.changes['6h']) }}
            </td>
            <td :class="getPriceChangeClass(token.changes['12h'])">
              {{ formatPriceChange(token.changes['12h']) }}
            </td>
            <td :class="getPriceChangeClass(token.changes['24h'])">
              {{ formatPriceChange(token.changes['24h']) }}
            </td>
            <td>{{ formatTime(token.lastUpdate) }}</td>
            <td class="token-value">{{ formatTokenValue(token.value, token.token.decimals) }}</td>
            <td>{{ token.type }}</td>
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
    timeseriesData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchQuery: '',
      sortKey: '1h',
      sortOrder: 'desc'
    }
  },
  computed: {
    initialWindowY() {
      return typeof window !== 'undefined' ? window.innerHeight - 500 : 100;
    },
    processedData() {
      const processed = []
      
      // Process Native Tokens
      if (this.timeseriesData.nativeTokens) {
        Object.entries(this.timeseriesData.nativeTokens).forEach(([symbol, data]) => {
          processed.push({
            symbol,
            price: data.price,
            balance: data.balance,
            type: 'Native',
            changes: {},  // Add price changes if available
            lastUpdate: null
          })
        })
      }

      // Process ERC-20 Tokens
      if (this.timeseriesData.erc20Tokens) {
        Object.entries(this.timeseriesData.erc20Tokens).forEach(([symbol, data]) => {
          processed.push({
            symbol,
            price: data.price,
            balance: data.balance,
            type: 'ERC-20',
            changes: {},  // Add price changes if available
            lastUpdate: null
          })
        })
      }

      // Process CW-20 Tokens
      if (this.timeseriesData.cw20Tokens) {
        Object.entries(this.timeseriesData.cw20Tokens).forEach(([symbol, data]) => {
          processed.push({
            symbol,
            price: data.price,
            balance: data.balance,
            type: 'CW-20',
            changes: {},  // Add price changes if available
            lastUpdate: null
          })
        })
      }

      return processed
    },
    filteredTokens() {
      if (!this.searchQuery) return this.processedData
      const query = this.searchQuery.toLowerCase()
      return this.processedData.filter(row => 
        row.symbol.toLowerCase().includes(query)
      )
    },
    sortedTokens() {
      return [...this.filteredTokens].sort((a, b) => {
        let aVal, bVal
        
        switch(this.sortKey) {
          case 'symbol':
            aVal = a.symbol
            bVal = b.symbol
            break
          case 'price':
            aVal = a.price || 0
            bVal = b.price || 0
            break
          case 'time':
            aVal = new Date(a.lastUpdate).getTime()
            bVal = new Date(b.lastUpdate).getTime()
            break
          case 'balance':
            aVal = parseFloat(a.balance) || 0
            bVal = parseFloat(b.balance) || 0
            break
          default:
            // For percentage changes
            aVal = a.changes[this.sortKey] || 0
            bVal = b.changes[this.sortKey] || 0
        }

        if (this.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
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
    },
    sort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortOrder = 'desc'
      }
    },
    getSortClass(key) {
      return {
        'sortable': true,
        'sorted': this.sortKey === key,
        'asc': this.sortKey === key && this.sortOrder === 'asc',
        'desc': this.sortKey === key && this.sortOrder === 'desc'
      }
    },
    formatPrice(price) {
      if (!price) return '-'
      return price.toFixed(4)
    },
    formatPriceChange(change) {
      if (change === null || change === undefined) return '-'
      return `${change > 0 ? '+' : ''}${(change * 100).toFixed(2)}%`
    },
    formatTime(time) {
      if (!time) return '-'
      try {
        return new Date(time).toLocaleString()
      } catch {
        return '-'
      }
    },
    getPriceChangeClass(change) {
      if (change === null || change === undefined) return ''
      return change > 0 ? 'positive' : 'negative'
    },
    groupData() {
      try {
        if (!this.timeseriesData || !Array.isArray(this.timeseriesData)) {
          return {}
        }

        const grouped = {}
        this.timeseriesData.forEach(item => {
          if (item && item.symbol) {
            if (!grouped[item.symbol]) {
              grouped[item.symbol] = []
            }
            grouped[item.symbol].push({
              ...item,
              rounded_time: new Date(item.rounded_time || Date.now())
            })
          }
        })
        
        Object.keys(grouped).forEach(symbol => {
          grouped[symbol].sort((a, b) => 
            new Date(b.rounded_time) - new Date(a.rounded_time)
          )
        })
        
        return grouped
      } catch (error) {
        console.error('Error grouping data:', error)
        return {}
      }
    },
    getCurrentPrice(data) {
      try {
        return data?.[0]?.usd_price ? parseFloat(data[0].usd_price) : data?.[0]?.price || null
      } catch {
        return null
      }
    },
    getPriceChangeForHours(data, hours) {
      try {
        if (!data || data.length <= hours) return null
        
        const current = parseFloat(data[0]?.usd_price || data[0]?.price || 0)
        const old = parseFloat(data[hours]?.usd_price || data[hours]?.price || current)
        
        if (!current || !old) return null
        return (current - old) / old
      } catch {
        return null
      }
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

.positive {
  color: green;
}

.negative {
  color: red;
}

.sortable {
  cursor: pointer;
}

.sorted.asc::after {
  content: ' ↑';
}

.sorted.desc::after {
  content: ' ↓';
}
</style> 