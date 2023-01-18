/*
 * @Author: ikouane
 * @Date: 2023-01-17 15:22:21
 * @LastEditTime: 2023-01-17 15:30:55
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
 */
import axios from "axios";

let baseAPI = process.env.VUE_APP_BASE_API || window.location.origin;
let baseURL = process.env.VUE_APP_BASE_URL;

axios.defaults.headers["Content-Type"] = "application/json;charset=utf-8";

const request = axios.create({
  baseURL: baseAPI,
  timeout: 30000
})

let userCookie = localStorage.getItem("cookie");

// 添加请求拦截器
request.interceptors.request.use(
  function (config) {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false;
    if (userCookie && !isToken) {
      config.headers["Authorization"] = window.encodeURIComponent(userCookie);
    }
    console.log(config);
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

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
    if (response.status === 200) {
      if (response.data) return Promise.resolve(response.data);
      return Promise.reject(response);
    }
  },
  function (error) {
    // 对响应错误做点什么
    const { response } = error;
    if (response) {
      errorHandle(response.status, response.data.message);
      return Promise.reject(response.data);
    } else {
      console.log("[Fail]: Api");
    }
  }
);
export { request, baseURL, baseAPI };