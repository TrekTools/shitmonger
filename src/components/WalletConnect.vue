<template>
  <div class="wallet-info">
    <button 
      class="win95-button" 
      @click="connectWallet" 
      v-if="!walletAddress"
    >
      Connect Wallet
    </button>
    <div v-else class="wallet-details">
      <span class="wallet-address">{{ truncatedAddress }}</span>
      <span class="wallet-balance">$SEI: {{ formattedSeiBalance }}</span>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapState(['walletAddress']),
    ...mapGetters(['formattedSeiBalance']),
    truncatedAddress() {
      if (!this.walletAddress) return ''
      return `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`
    }
  }
}
</script> 