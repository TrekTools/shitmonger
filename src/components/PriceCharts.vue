<template>
  <Win95Window 
    title="Price Charts" 
    :initial-x="300"
    :initial-y="initialWindowY"
    :initial-width="800"
    :initial-height="600"
    @close="$emit('close')"
  >
    <div class="charts-panel">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search tokens..."
          class="win95-input"
        >
      </div>

      <div class="charts-container">
        <div 
          v-for="(data, symbol) in filteredChartData" 
          :key="symbol" 
          class="chart-item"
        >
          <h4>{{ symbol }}</h4>
          <div class="chart-wrapper">
            <canvas :id="`chart_${symbol}`"></canvas>
          </div>
        </div>
        
        <div v-if="Object.keys(filteredChartData).length === 0" class="no-results">
          No matching tokens found
        </div>
      </div>
    </div>
  </Win95Window>
</template>

<script>
import Win95Window from './Win95Window.vue'
import Chart from 'chart.js/auto'

export default {
  name: 'PriceCharts',
  components: {
    Win95Window
  },
  data() {
    return {
      timeseriesData: [],
      charts: {},
      searchQuery: ''
    }
  },
  computed: {
    initialWindowY() {
      return typeof window !== 'undefined' ? window.innerHeight - 700 : 100;
    },
    chartData() {
      const grouped = {}
      const sortedData = [...this.timeseriesData].sort((a, b) => 
        new Date(a.rounded_time) - new Date(b.rounded_time)
      )
      
      sortedData.forEach(item => {
        if (!grouped[item.symbol]) {
          grouped[item.symbol] = {
            times: [],
            prices: []
          }
        }
        const formattedTime = new Date(item.rounded_time).toLocaleString()
        grouped[item.symbol].times.push(formattedTime)
        grouped[item.symbol].prices.push(parseFloat(item.usd_price))
      })
      
      Object.keys(grouped).forEach(symbol => {
        if (grouped[symbol].times.length > 48) {
          grouped[symbol].times = grouped[symbol].times.slice(-48)
          grouped[symbol].prices = grouped[symbol].prices.slice(-48)
        }
      })
      
      return grouped
    },
    filteredChartData() {
      if (!this.searchQuery) return this.chartData
      
      const query = this.searchQuery.toLowerCase()
      const filtered = {}
      
      Object.entries(this.chartData).forEach(([symbol, data]) => {
        if (symbol.toLowerCase().includes(query)) {
          filtered[symbol] = data
        }
      })
      
      return filtered
    }
  },
  watch: {
    filteredChartData: {
      handler() {
        this.$nextTick(() => {
          setTimeout(() => {
            this.createCharts()
          }, 100)
        })
      },
      deep: true
    }
  },
  async mounted() {
    await this.fetchTimeseriesData()
    this.$nextTick(() => {
      setTimeout(() => {
        this.createCharts()
      }, 100)
    })
  },
  beforeUnmount() {
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy()
    })
  },
  methods: {
    async fetchTimeseriesData() {
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
                  limit: 1000
                ) {
                  symbol
                  usd_price
                  record
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

        if (!data.data?.token_timeseries) {
          console.error('No timeseries data in response')
          return
        }

        this.timeseriesData = data.data.token_timeseries
      } catch (error) {
        console.error('Error fetching timeseries data:', error)
      }
    },
    createCharts() {
      if (!this.timeseriesData.length) return

      // Clean up existing charts
      Object.values(this.charts).forEach(chart => {
        if (chart) chart.destroy()
      })
      this.charts = {}

      // Create new charts
      Object.entries(this.filteredChartData).forEach(([symbol, data]) => {
        const canvas = document.getElementById(`chart_${symbol}`)
        if (!canvas) return

        // Set canvas dimensions explicitly
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        this.charts[symbol] = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.times,
            datasets: [{
              label: `${symbol} Price`,
              data: data.prices,
              borderColor: '#000080',
              backgroundColor: 'rgba(0, 0, 128, 0.1)',
              borderWidth: 2,
              tension: 0.1,
              fill: false,
              pointRadius: 0 // Hide points for better performance
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // Disable animations for better performance
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: function(context) {
                    return `$${context.parsed.y.toFixed(4)}`
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  maxRotation: 0,
                  autoSkip: true,
                  maxTicksLimit: 10
                }
              },
              y: {
                beginAtZero: false,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                  callback: value => `$${value.toFixed(2)}`
                }
              }
            }
          }
        })
      })
    }
  }
}
</script>

<style scoped>
.charts-panel {
  height: calc(100% - 32px);
  overflow-y: auto;
  padding: 16px;
}

.search-bar {
  margin-bottom: 16px;
  padding: 8px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
}

.win95-input {
  width: 100%;
  padding: 4px 8px;
  font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
  font-size: 12px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  background: white;
  outline: none;
}

.charts-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-item {
  background: white;
  border: 1px solid #808080;
  padding: 8px;
  min-height: 250px;
}

.chart-wrapper {
  height: 200px;
  width: 100%;
  position: relative;
}

.chart-item h4 {
  margin: 0 0 8px 0;
  color: #000080;
  font-size: 14px;
}

.no-results {
  text-align: center;
  padding: 20px;
  background: #f0f0f0;
  border: 1px solid #808080;
  color: #666;
  font-size: 12px;
  margin-top: 16px;
}
</style> 