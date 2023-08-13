/*
 * @Author: ikouane
 * @Date: 2023-01-17 15:32:01
 * @LastEditTime: 2023-08-10 01:04:26
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
 */
import { request } from "@/utils/http.js";

// 获取播放数据（每日推荐）
export function getDateApi(isDailyRecommend = false) {
  return request.post(`${isDailyRecommend ? '/api/daily_recommend' : '/api'}`);
}

// 请求单音乐数据
export function getSingleMusicApi(mid) {
  return request.post(`/api/song/${mid}`);
}

// 请求歌单数据
export function getMusicListApi(lid) {
  return request.post(`/api/playlist/${lid}`);
}

// 请求歌手数据
export function getAuthorDataApi(aid) {
  return request.post(`/api/artist/${aid}`)
}

// 获取歌词数据
export function getLyricApi(mid) {
  return request.post(`/api/song/lrc/${mid}`)
}

// 请求云端已保存的歌单数据
export function getSavedListApi(pid) {
  return request.post(`get_v3.php?pid=${pid}`)
}

// 保存歌单数据到云端
export function setSavedListApi(data, config) {
  return request.post(`get_v3.php`, data, config);
}

// 请求更多歌曲
export function getMoreMusicApi() {
  return request.post(`get_v3.php?method=more`);
}

// 获取歌曲链接
export function getMusicUrlApi(mid) {
  return request.post(`/api/song/old/url/${mid}`);
}

// 获取会员歌曲链接
export function getSvipMusicUrlApi(sid) {
  return request.post(`/api/song/url/${sid}`);
}

// 红心/取消红心
export function loveSongApi(mid, isLike) {
  return request.post(`/api/song/${isLike ? 'like' : "dislike"}/${mid}`);
}

// 获取我的红心歌曲
export function getMyLoveApi() {
  return request.post(`/api/likeList`);
}

// 测试或预加载url
export function testOrPreloadUrlApi(url) {
  return request.get(`${url}`, {
    baseURL: "",
    isToken: false,
  });
}

// 上传图片
export function uploadImgApi(data) {
  // 将 axios 设置为 form-data
  const formData = new FormData();
  formData.append("file", data);
  return request.post(`/api/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

// 用户信息接口
export function getUserInfoApi() {
  return request.post(`/api/user/info`);
}

// 设置任务进度
export function setTaskProgressApi(taskIndex) {
  return request.post(`/api/user/task/${taskIndex}`);
}