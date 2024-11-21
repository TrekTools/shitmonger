<template>
    <Win95Window 
      title="Token Table"
      :initial-x="initialX"
      :initial-y="initialY"
      :initial-width="800"
      :initial-height="300"
      @close="$emit('close')"
    >
      <div class="table-panel">
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
                <th @click="sort('symbol')" :class="getSortClass('symbol')">
                  Symbol
                </th>
                <th @click="sort('price')" :class="getSortClass('price')">
                  Price
                </th>
                <th @click="sort('1h')" :class="getSortClass('1h')">
                  1h %
                </th>
                <th @click="sort('2h')" :class="getSortClass('2h')">
                  2h %
                </th>
                <th @click="sort('6h')" :class="getSortClass('6h')">
                  6h %
                </th>
                <th @click="sort('12h')" :class="getSortClass('12h')">
                  12h %
                </th>
                <th @click="sort('24h')" :class="getSortClass('24h')">
                  24h %
                </th>
                <th @click="sort('time')" :class="getSortClass('time')">
                  Last Updated
                </th>
                <th>Trade $SEI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sortedData" :key="row.symbol">
                <td>{{ row.symbol }}</td>
                <td>${{ formatPrice(row.price) }}</td>
                <td :class="getPriceChangeClass(row.changes['1h'])">
                  {{ formatPriceChange(row.changes['1h']) }}
                </td>
                <td :class="getPriceChangeClass(row.changes['2h'])">
                  {{ formatPriceChange(row.changes['2h']) }}
                </td>
                <td :class="getPriceChangeClass(row.changes['6h'])">
                  {{ formatPriceChange(row.changes['6h']) }}
                </td>
                <td :class="getPriceChangeClass(row.changes['12h'])">
                  {{ formatPriceChange(row.changes['12h']) }}
                </td>
                <td :class="getPriceChangeClass(row.changes['24h'])">
                  {{ formatPriceChange(row.changes['24h']) }}
                </td>
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
                      <button 
                        class="action-btn buy-btn" 
                        @click="handleAction('buy', row)"
                      >
                        B
                      </button>
                      <button 
                        class="action-btn sell-btn" 
                        @click="handleAction('sell', row)"
                      >
                        S
                      </button>
                      <button 
                        class="action-btn cancel-btn" 
                        @click="handleAction('cancel', row)"
                      >
                        X
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Win95Window>
  </template>
  
  <script>
  import Win95Window from './Win95Window.vue'
  
  export default {
    name: 'TokenTable',
    components: {
      Win95Window
    },
    props: {
      timeseriesData: {
        type: Array,
        default: () => []
      },
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
        searchQuery: '',
        sortKey: '1h', // Default sort by 1h change
        sortOrder: 'desc' // Default to descending order
      }
    },
    computed: {
      initialWindowY() {
        return typeof window !== 'undefined' ? window.innerHeight - 500 : 100;
      },
      processedData() {
        console.log('TimeseriesData received:', this.timeseriesData); // Debug log
        const processed = []
        const grouped = this.groupData()
        console.log('Grouped data:', grouped); // Debug log
  
        Object.entries(grouped).forEach(([symbol, data]) => {
          if (data.length > 0) {
            const row = {
              symbol,
              price: this.getCurrentPrice(data),
              changes: {
                '1h': this.getPriceChangeForHours(data, 1),
                '2h': this.getPriceChangeForHours(data, 2),
                '6h': this.getPriceChangeForHours(data, 6),
                '12h': this.getPriceChangeForHours(data, 12),
                '24h': this.getPriceChangeForHours(data, 24)
              },
              lastUpdate: data[0].rounded_time
            }
            processed.push(row)
          }
        })
        
        console.log('Processed data:', processed); // Debug log
        return processed
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
      groupData() {
        const grouped = {}
        this.timeseriesData.forEach(item => {
          if (!grouped[item.symbol]) {
            grouped[item.symbol] = []
          }
          grouped[item.symbol].push({
            ...item,
            rounded_time: new Date(item.rounded_time)
          })
        })
        
        Object.keys(grouped).forEach(symbol => {
          grouped[symbol].sort((a, b) => b.rounded_time - a.rounded_time)
        })
        
        return grouped
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
        return price ? price.toFixed(4) : '0.0000'
      },
      formatPriceChange(change) {
        if (!change) return '0.00%'
        return `${change > 0 ? '+' : ''}${(change * 100).toFixed(2)}%`
      },
      formatTime(time) {
        return time ? new Date(time).toLocaleString() : 'N/A'
      },
      getCurrentPrice(data) {
        return data && data[0] ? parseFloat(data[0].usd_price) : null
      },
      getPriceChangeForHours(data, hours) {
        if (!data || data.length < hours) return null
        const current = parseFloat(data[0].usd_price)
        const old = parseFloat(data[data.length - hours].usd_price)
        return (current - old) / old
      },
      getPriceChangeClass(change) {
        if (!change) return ''
        return change > 0 ? 'positive' : 'negative'
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
        
        // Emit the action event to parent component
        this.$emit('token-action', {
          type,
          symbol: row.symbol,
          amount,
          price: row.price
        })
        
        // Clear the input after action
        row.amount = ''
      }
    }
  }
  </script>
  
  <style scoped>
  .table-panel {
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
  
  .table-container {
    background: white;
    border: 1px solid #808080;
    overflow-x: auto;
    min-width: 900px;
  }
  
  .win95-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  
  .win95-table th {
    background: #c0c0c0;
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #808080;
    position: sticky;
    top: 0;
  }
  
  .win95-table td {
    padding: 6px 8px;
    border-bottom: 1px solid #d4d4d4;
  }
  
  .win95-table tr:last-child td {
    border-bottom: none;
  }
  
  .actions-cell {
    min-width: 200px;
    padding: 4px 8px !important;
  }
  
  .action-controls {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .amount-input {
    flex: 1;
    padding: 2px 4px;
    font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
    font-size: 12px;
    border: 2px solid;
    border-color: #808080 #ffffff #ffffff #808080;
    background: white;
    outline: none;
    width: 80px;
  }
  
  .action-buttons {
    display: flex;
    gap: 4px;
  }
  
  .action-btn {
    font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
    font-size: 12px;
    font-weight: bold;
    width: 24px;
    height: 24px;
    border: 2px solid;
    border-color: #ffffff #808080 #808080 #ffffff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  
  .action-btn:active {
    border-color: #808080 #ffffff #ffffff #808080;
  }
  
  .buy-btn {
    background: #ff0000;
    color: white;
  }
  
  .sell-btn {
    background: #008000;
    color: white;
  }
  
  .cancel-btn {
    background: #ffd700;
    color: black;
  }
  
  /* Adjust table layout for the new column */
  .win95-table th:last-child,
  .win95-table td:last-child {
    width: 200px;
  }
  </style> 