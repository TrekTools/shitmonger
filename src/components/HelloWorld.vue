<template>
  <div class="win95-window">
    <div class="title-bar">
      <div class="title-bar-text">{{ msg }}</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Maximize"></button>
        <button aria-label="Close">×</button>
      </div>
    </div>
    <div class="window-content">
      <div class="content-section">
        <h3>Installed CLI Plugins</h3>
        <ul>
          <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel" target="_blank" rel="noopener">babel</a></li>
          <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint" target="_blank" rel="noopener">eslint</a></li>
        </ul>
      </div>
      
      <div class="content-section">
        <h3>Essential Links</h3>
        <ul>
          <li><a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a></li>
          <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">Forum</a></li>
          <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener">Community Chat</a></li>
          <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a></li>
          <li><a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a></li>
        </ul>
      </div>

      <div class="content-section">
        <h3>Ecosystem</h3>
        <ul>
          <li><a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a></li>
          <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a></li>
          <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener">vue-devtools</a></li>
          <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener">vue-loader</a></li>
          <li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">awesome-vue</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>

<style scoped>
.win95-window {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  width: 80%;
  margin: 20px auto;
  font-family: 'MS Sans Serif', 'Microsoft Sans Serif', sans-serif;
}

.title-bar {
  background: #000080;
  padding: 3px 2px 3px 3px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-bar-text {
  font-weight: bold;
  font-size: 14px;
}

.title-bar-controls {
  display: flex;
  gap: 2px;
}

.title-bar-controls button {
  width: 16px;
  height: 14px;
  border: 1px solid white;
  background: #c0c0c0;
  color: black;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.window-content {
  padding: 10px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
}

.content-section {
  margin-bottom: 20px;
  padding: 10px;
  background: #ffffff;
  border: 1px solid #808080;
}

h3 {
  margin: 10px 0;
  color: #000080;
  font-size: 14px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: block;
  margin: 5px 0;
}

a {
  color: #000080;
  text-decoration: none;
  font-size: 12px;
}

a:hover {
  text-decoration: underline;
}

/* Windows 95 button style */
button {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 0;
  margin: 0;
  cursor: pointer;
}

button:active {
  border-color: #808080 #ffffff #ffffff #808080;
}
</style>
