/*
 * @Author: ikouane
 * @Date: 2020-10-18 22:23:21
 * @LastEditTime: 2023-05-24 15:21:00
 * @LastEditors: ikouane
 * @Description:
 * @version:
 */
import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
process.env.NODE_ENV === "production";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// import router from './router'

createApp(App).use(ElementPlus).use(store).mount("#app");
