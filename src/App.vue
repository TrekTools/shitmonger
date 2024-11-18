<template>
  <div id="app">
    <div class="audio-control win95-button">
      <button @click="toggleAudio">
        {{ isPlaying ? '🔊 Mute' : '🔈 Unmute' }}
      </button>
    </div>
    <audio ref="audioPlayer" loop>
      <source src="@/assets/mohocofo.mp3" type="audio/mpeg">
    </audio>
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  data() {
    return {
      isPlaying: false
    }
  },
  methods: {
    toggleAudio() {
      const audio = this.$refs.audioPlayer;
      if (this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      this.isPlaying = !this.isPlaying;
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

body {
  background-image: url('@/assets/monger.jpeg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  min-height: 100vh;
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
</style>
