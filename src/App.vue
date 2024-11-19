<template>
  <div id="app">
    <div class="top-controls">
      <div class="wallet-info">
        <button class="win95-button wallet-button" @click="connectWallet">
          {{ walletAddress ? truncateAddress(walletAddress) : '💳 Connect Wallet' }}
        </button>
        <div v-if="walletAddress" class="balance-display">
          $SEI: {{ formattedSeiBalance }}
        </div>
      </div>
      <button class="win95-button audio-button" @click="toggleAudio">
        {{ isPlaying ? '🔊 Mute' : '🔈 Unmute' }}
      </button>
    </div>
    
    <audio ref="audioPlayer" loop>
      <source src="@/assets/mohocofo.mp3" type="audio/mpeg">
    </audio>
    
    <div class="content-wrapper">
      <HelloWorld msg="Welcome to the Shitmonger! What can I ape for you today?"/>
    </div>
    
    <!-- Windows 95 Taskbar -->
    <div class="win95-taskbar">
      <div class="start-button" @click="toggleStartMenu">
        <img src="@/assets/win95-logo.png" alt="Windows 95" class="win-logo">
        Start
      </div>
      
      <div class="taskbar-items">
        <!-- Active windows would go here -->
      </div>
      
      <div class="system-tray">
        <div class="time">{{ currentTime }}</div>
      </div>
    </div>
  </div>
  <router-view></router-view>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data() {
    return {
      isPlaying: false,
      walletAddress: null,
      client: null,
      chainId: 'pacific-1', // or 'atlantic-2' for testnet
      rpcEndpoint: 'https://sei-rpc.polkachu.com', // example RPC endpoint
      currentTime: '',
      showStartMenu: false,
      seiBalance: 0 // Added for SEI balance
    }
  },
  computed: {
    formattedSeiBalance() {
      return (this.seiBalance / 1000000).toFixed(6)
    }
  },
  mounted() {
    this.updateTime();
    setInterval(this.updateTime, 1000);
  },
  methods: {
    async connectWallet() {
      try {
        if (!window.compass?.getOfflineSigner || !window.compass?.getOfflineSignerAuto) {
          alert('Please install Compass Wallet');
          return;
        }

        await window.compass.enable(this.chainId);
        
        const offlineSigner = await window.compass.getOfflineSignerAuto(this.chainId);
        const accounts = await offlineSigner.getAccounts();
        this.walletAddress = accounts[0].address;

        // Create signing client
        this.client = await SigningCosmWasmClient.connectWithSigner(
          this.rpcEndpoint,
          offlineSigner
        );

        // Fetch SEI balance
        try {
          const response = await fetch(
            `https://rest.wallet.pacific-1.sei.io/cosmos/bank/v1beta1/spendable_balances/${this.walletAddress}?pagination.limit=1000`
          );
          const data = await response.json();
          
          const seiBalance = data.balances.find(b => b.denom === 'usei');
          this.seiBalance = seiBalance ? parseInt(seiBalance.amount) : 0;
        } catch (error) {
          console.error('Error fetching SEI balance:', error);
          this.seiBalance = 0;
        }

      } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet');
      }
    },
    truncateAddress(address) {
      if (!address) return '';
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },
    toggleAudio() {
      const audio = this.$refs.audioPlayer;
      if (this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      this.isPlaying = !this.isPlaying;
    },
    async getBalance() {
      if (!this.client || !this.walletAddress) return;
      
      try {
        const balance = await this.client.getBalance(this.walletAddress, 'usei');
        return balance;
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    },
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    },
    toggleStartMenu() {
      this.showStartMenu = !this.showStartMenu;
    }
  }
}
</script>

<style>
.top-controls {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  gap: 10px;
}

.win95-button {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 6px 12px;
  font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
  font-size: 12px;
  cursor: pointer;
  color: #000;
  box-shadow: 1px 1px 0px rgba(0, 0, 0, 0.3);
}

.win95-button:active {
  border-color: #808080 #ffffff #ffffff #808080;
  box-shadow: -1px -1px 0px rgba(0, 0, 0, 0.3) inset;
}

.win95-button:focus {
  outline: 1px dotted #000;
  outline-offset: -4px;
}

.wallet-button {
  min-width: 150px;
  text-align: center;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  padding-bottom: 28px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

body {
  background-image: url('@/assets/monger.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.audio-control {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.audio-control button {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 6px 12px;
  font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
  font-size: 12px;
  cursor: pointer;
}

.audio-control button:active {
  border-color: #808080 #ffffff #ffffff #808080;
}

.win95-taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  background: #c0c0c0;
  border-top: 1px solid #ffffff;
  display: flex;
  align-items: center;
  padding: 2px;
  z-index: 9999;
}

.start-button {
  display: flex;
  align-items: center;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 2px 6px;
  margin-right: 2px;
  font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  height: 22px;
}

.start-button:active {
  border-color: #808080 #ffffff #ffffff #808080;
}

.win-logo {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.taskbar-items {
  flex: 1;
  display: flex;
  align-items: center;
  margin: 0 4px;
}

.system-tray {
  display: flex;
  align-items: center;
  border-left: 1px solid #808080;
  padding-left: 4px;
}

.time {
  background: #c0c0c0;
  border: 1px solid #808080;
  padding: 2px 6px;
  font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
  font-size: 11px;
  min-width: 60px;
  text-align: center;
}

.content-wrapper {
  min-height: calc(100vh - 200px); /* Adjust this value as needed */
  display: flex;
  align-items: flex-end;
  padding-bottom: 40px; /* Space between HelloWorld and taskbar */
}

/* Ensure HelloWorld component takes proper width */
.content-wrapper .win95-window {
  margin-bottom: 0;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.balance-display {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  padding: 6px 12px;
  font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
  font-size: 12px;
  color: #008000;
  font-weight: bold;
  min-width: 120px;
  text-align: right;
}
</style>