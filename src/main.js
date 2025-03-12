import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 确保这里正确导入 router
import { createPinia } from 'pinia';

const app = createApp(App)
app.use(createPinia()); // 注册 Pinia
app.use(router)
app.mount('#app')
