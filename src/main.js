/*
 * @Author: ikouane
 * @Date: 2020-10-18 22:23:21
 * @LastEditTime: 2023-04-11 23:01:06
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
//import route from './router'use(route).

createApp(App).use(ElementPlus).use(store).mount("#app");
