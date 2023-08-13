/*
 * @Author: ikouane
 * @Date: 2020-10-18 22:23:21
 * @LastEditTime: 2023-08-07 23:43:43
 * @LastEditors: ikouane
 * @Description:
 * @version:
 */
import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
process.env.NODE_ENV === "production";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css'
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
// import router from './router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

createApp(App).use(ElementPlus, {
  locale: zhCn,
}).use(store).use(Viewer, {
  defaultOptions: {
    navbar: false,
  }
}).mount("#app");
