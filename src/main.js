import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { Buffer } from 'buffer'
import store from './store'

window.Buffer = Buffer

const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
