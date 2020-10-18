import {
    createApp
} from 'vue'
import App from './App.vue'
import store from './store'
//import route from './router'use(route).

createApp(App).use(store).mount('#app')