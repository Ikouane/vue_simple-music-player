/*
 * @Author: ikouane
 * @Date: 2020-10-18 22:23:21
 * @LastEditTime: 2023-07-23 23:15:09
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
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
// import router from './router'

createApp(App).use(ElementPlus).use(store).use(Viewer, {
  defaultOptions: {
    navbar: false,
  }
}).mount("#app");
