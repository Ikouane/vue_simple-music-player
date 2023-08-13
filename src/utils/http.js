/*
 * @Author: ikouane
 * @Date: 2023-01-17 15:22:21
 * @LastEditTime: 2023-08-10 15:37:23
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
 */
import axios from "axios";
import { ElMessage } from "element-plus";

let baseAPI = process.env.VUE_APP_BASE_API || window.location.origin;
let baseURL = process.env.VUE_APP_BASE_URL;

axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";

const request = axios.create({
  baseURL: baseAPI,
  timeout: 30000
})

let userCookie = localStorage.getItem("cookie") || JSON.parse(localStorage.getItem("weyoung-music"))?.account.uuid;

// 添加请求拦截器
request.interceptors.request.use(
  function (config) {
    // 是否需要设置 token
    const isToken = config.isToken === false;
    // const isToken = (config.headers || {}).isToken === false;
    if (userCookie && !isToken) {

      config.headers["Weyoung-Music-Token"] = window.encodeURIComponent(userCookie);
    }
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

const setRequestHeader = (uuid) => {
  console.log("setRequestHeader", uuid);
  // 重新设置请求拦截器
  request.interceptors.request.use(
    function (config) {
      // 是否需要设置 token
      const isToken = config.isToken === false;
      // const isToken = (config.headers || {}).isToken === false;
      if (!isToken) {
        config.headers["Weyoung-Music-Token"] = window.encodeURIComponent(uuid);
      }
      return config;
    },
    function (error) {
      // 对请求错误做些什么
      return Promise.reject(error);
    }
  );
};

// 错误信息处理
const errorHandle = (status, other) => {
  switch (status) {
    case 400:
      console.log("信息验证失败");
      break;
    case 401:
      console.log("认证失败");
      break;
    case 403:
      localStorage.removeItem("token");
      console.log("token校验失败");
      break;
    case 404:
      console.log("请求资源不存在");
      break;
    default:
      console.log(other);
      break;
  }
};

// 添加响应拦截器
request.interceptors.response.use(
  function (response) {
    if (response.status === 200 && response.data.code === 200) {
      if (response.data.data) return Promise.resolve(response.data.data);
      return Promise.reject(response);
    }
  },
  function (error) {
    // 对响应错误做点什么
    const { response } = error;
    if (response) {
      errorHandle(response.data.code, response.data.message);
      return Promise.reject(response.data);
    } else {
      console.log("[Fail]: Api");
      ElMessage({
        message: "网络连接异常",
        type: "error",
        duration: 0
      });
    }
  }
);
export { request, baseURL, baseAPI, setRequestHeader };