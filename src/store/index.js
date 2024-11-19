import { createStore } from 'vuex'

export default createStore({
  state: {
    walletAddress: null,
    seiBalance: 0
  },
  mutations: {
    setWalletAddress(state, address) {
      state.walletAddress = address
    },
    setSeiBalance(state, balance) {
      state.seiBalance = balance
    }
  },
  getters: {
    formattedSeiBalance: state => {
      return (state.seiBalance / 1000000).toFixed(6)
    }
  }
}) 