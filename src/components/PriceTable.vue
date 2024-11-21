<template>
  <Win95Window 
    ref="window"
    title="Price Table"
    :initial-x="initialX"
    :initial-y="initialY"
    :initial-width="initialWidth"
    :initial-height="initialHeight"
    @close="$emit('close')"
    class="price-table-window"
  >
    <div class="table-panel">
      <div v-if="loading" class="loading-state">Loading price data...</div>
      <div v-if="error" class="error-state">{{ error }}</div>

      <div v-if="!loading && !error">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search tokens..."
            class="win95-input"
          >
        </div>

        <div class="table-container">
          <table class="win95-table">
            <thead>
              <tr>
                <th @click="sort('symbol')" :class="getSortClass('symbol')">Symbol</th>
                <th @click="sort('price')" :class="getSortClass('price')">Current Price</th>
                <th @click="sort('time')" :class="getSortClass('time')">Last Updated</th>
                <th>Trade $SEI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sortedData" :key="row.symbol">
                <td>{{ row.symbol }}</td>
                <td>${{ formatPrice(row.currentPrice) }}</td>
                <td>{{ formatTime(row.lastUpdate) }}</td>
                <td class="actions-cell">
                  <div class="action-controls">
                    <input 
                      type="text" 
                      class="amount-input" 
                      v-model="row.amount" 
                      placeholder="Amount"
                    >
                    <div class="action-buttons">
                      <button class="action-btn buy-btn" @click="handleAction('buy', row)">B</button>
                      <button class="action-btn sell-btn" @click="handleAction('sell', row)">S</button>
                      <button class="action-btn cancel-btn" @click="handleAction('cancel', row)">X</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Win95Window>
</template>

<script>
import Win95Window from './Win95Window.vue'

export default {
  name: 'PriceTable',
  components: {
    Win95Window
  },
  props: {
    initialX: {
      type: Number,
      default: 600
    },
    initialY: {
      type: Number,
      default: 100
    },
    initialWidth: {
      type: Number,
      default: 800
    },
    initialHeight: {
      type: Number,
      default: 300
    }
  },
  data() {
    return {
      timeseriesData: [],
      searchQuery: '',
      sortKey: 'symbol',
      sortOrder: 'asc',
      loading: false,
      error: null
    }
  },
  computed: {
    processedData() {
      return Object.entries(this.chartData).map(([symbol, data]) => ({
        symbol,
        currentPrice: data.prices[data.prices.length - 1],
        lastUpdate: data.times[data.times.length - 1],
        amount: ''
      }))
    },
    chartData() {
      const grouped = {}
      
      this.timeseriesData.forEach(item => {
        if (!grouped[item.symbol]) {
          grouped[item.symbol] = {
            times: [],
            prices: []
          }
        }
        grouped[item.symbol].times.push(new Date(item.rounded_time))
        grouped[item.symbol].prices.push(parseFloat(item.usd_price))
      })

      return grouped
    },
    filteredData() {
      if (!this.searchQuery) return this.processedData
      const query = this.searchQuery.toLowerCase()
      return this.processedData.filter(row => 
        row.symbol.toLowerCase().includes(query)
      )
    },
    sortedData() {
      return [...this.filteredData].sort((a, b) => {
        let aVal, bVal
        
        switch(this.sortKey) {
          case 'symbol':
            return this.sortOrder === 'asc' 
              ? a.symbol.localeCompare(b.symbol)
              : b.symbol.localeCompare(a.symbol)
          case 'price':
            aVal = a.currentPrice || 0
            bVal = b.currentPrice || 0
            break
          case 'time':
            aVal = new Date(a.lastUpdate).getTime()
            bVal = new Date(b.lastUpdate).getTime()
            break
          default:
            return 0
        }
        
        return this.sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      })
    }
  },
  async mounted() {
    await this.fetchTimeseriesData()
  },
  methods: {
    formatPrice(price) {
      return price ? price.toFixed(4) : '0.0000'
    },
    formatTime(time) {
      return time ? time.toLocaleString() : 'N/A'
    },
    sort(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortOrder = 'asc'
      }
    },
    getSortClass(key) {
      return {
        'sortable': true,
        'asc': this.sortKey === key && this.sortOrder === 'asc',
        'desc': this.sortKey === key && this.sortOrder === 'desc'
      }
    },
    handleAction(type, row) {
      if (!row.amount) {
        alert('Please enter an amount')
        return
      }
      
      const amount = parseFloat(row.amount)
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount')
        return
      }
      
      this.$emit('token-action', {
        type,
        symbol: row.symbol,
        amount,
        price: row.currentPrice
      })
      
      row.amount = ''
    },
    async fetchTimeseriesData() {
      this.loading = true
      try {
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
                  order_by: {rounded_time: desc}
                  where: {
                    rounded_time: {
                      _gte: "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}"
                    }
                  }
                ) {
                  symbol
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
      } catch (error) {
        console.error('Error fetching timeseries data:', error)
        this.error = 'Failed to fetch price data'
      } finally {
        this.loading = false
      }
    },
    updatePosition({ x, y, width, height }) {
      const windowRef = this.$refs.window
      if (windowRef) {
        windowRef.updatePosition(x, y)
        windowRef.updateSize(width, height)
      }
    }
  },
  watch: {
    processedData: {
      handler(newData) {
        console.log('Processed data updated:', newData)
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.price-table-window {
  position: absolute;
  z-index: 1;
}

.table-panel {
  height: 100%;
  overflow-y: auto;
  padding: 16px;
}

.loading-state,
.error-state {
  padding: 16px;
  text-align: center;
  font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
  font-size: 12px;
}

.error-state {
  color: red;
}
</style> 