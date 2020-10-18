const { default: VueRouter} = require("vue-router");
import Main from "../components/Main.vue"

const routes = [
    { name: 'main',path: '/',component: Main },
    { name: 'pid', path: '/pid/:id', component: Main },
    { name: 'rid', path: '/rid/:id', component: Main },
    { path: '*', component: Main }
]

const router = new VueRouter({
    mode: 'history',
    routes
})
export default router