/*
 * @Author: ikouane
 * @PoweredBy: 未央宫©WeYounG
 * @Date: 2023-02-12 16:17:17
 * @LastEditTime: 2023-07-07 10:29:25
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
 */
const { default: VueRouter } = require("vue-router");
import Main from "../views/Main.vue"
import Beta from "../views/Beta.vue"

const routes = [
    { name: 'main', path: '/', component: Main },
    { name: 'pid', path: '/pid/:id', component: Main },
    { name: 'rid', path: '/rid/:id', component: Main },
    { name: "beta", path: "/beta", component: Beta },
    { path: '*', component: Main }
]

const router = new VueRouter({
    mode: 'history',
    routes
})
export default router