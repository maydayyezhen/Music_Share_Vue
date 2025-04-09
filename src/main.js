import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia';
import 'vuetify/styles' // 引入 Vuetify 样式
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
})

const app = createApp(App)
app.use(createPinia()) // 注册 Pinia
app.use(vuetify)
app.use(router)
app.mount('#app')
