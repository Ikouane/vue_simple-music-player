/*
 * @Author: ikouane
 * @Date: 2020-10-18 22:23:21
 * @LastEditTime: 2022-01-01 22:34:15
 * @LastEditors: ikouane
 * @Description:
 * @version:
 */
import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
process.env.NODE_ENV === "production";
//import route from './router'use(route).

createApp(App)
  .use(store)
  .mount("#app");
