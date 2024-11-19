<template>
  <div class="win95-window">
    <div class="title-bar">
      <div class="title-bar-text">Trek Ecosystem</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Maximize"></button>
        <button aria-label="Close" @click="$router.push('/')">×</button>
      </div>
    </div>
    <div class="window-content">
      <div class="content-section">
        <h3>Trek Ecosystem Overview</h3>
        <ul>
          <li>Feature #1</li>
          <li>Feature #2</li>
          <li>Feature #3</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrekEco'
}
</script>

<style scoped>
@import '../styles/win95.css';
</style> 