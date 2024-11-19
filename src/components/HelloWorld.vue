<template>
  <div class="home">
    <Win95Window 
      title="Trek Tools" 
      :initial-x="100"
      :initial-y="100"
      :initial-width="400"
      :initial-height="300"
    >
      <div class="menu-container">
        <button class="win95-button" @click="$router.push('/all-runners')">
          All Runners
        </button>
        <button class="win95-button" @click="$router.push('/your-runners')">
          Your Runners
        </button>
      </div>
    </Win95Window>
  </div>
</template>

<script>
import Win95Window from '@/components/Win95Window.vue'

export default {
  name: 'HomeView',
  components: {
    Win95Window
  }
}
</script>

<style scoped>
.menu-container {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.win95-button {
  padding: 8px 16px;
  font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
  font-size: 14px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  cursor: pointer;
}

.win95-button:active {
  border-color: #808080 #ffffff #ffffff #808080;
}
</style>
