/*
 * @Author: ikouane
 * @Date: 2023-01-17 15:32:01
 * @LastEditTime: 2023-06-29 00:46:02
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
 */
import { request } from "@/utils/http.js";

// 获取播放数据（每日推荐）
export function getData(isDailyRecommend = false) {
  return request.post(`${isDailyRecommend ? '/' : 'daily_recommend'}`);
}

// 请求单音乐数据
export function getSingleMusic(mid) {
  return request.post(`/song/${mid}`);
}

// 请求歌单数据
export function getMusicList(lid) {
  return request.post(`/playlist/${lid}`);
}

// 请求歌手数据
export function getAuthorData(aid) {
  return request.post(`/artist/${aid}`)
}

// 获取歌词数据
export function getLyric(mid) {
  return request.post(`/song/lrc/${mid}`)
}

// 请求云端已保存的歌单数据
export function getSavedList(pid) {
  return request.post(`get_v3.php?pid=${pid}`)
}

// 保存歌单数据到云端
export function setSavedList(data, config) {
  return request.post(`get_v3.php`, data, config);
}

// 请求更多歌曲
export function getMoreMusic() {
  return request.post(`get_v3.php?method=more`);
}

// 获取歌曲链接
export function getMusicUrl(mid) {
  return request.post(`song/old/url/${mid}`);
}

// 获取会员歌曲链接
export function getSvipMusicUrl(sid) {
  return request.post(`/song/url/${sid}`);
}

// 红心/取消红心
export function loveSong(mid, isLike) {
  return request.post(`get_v3.php?method=like&mid=${mid}&like=${isLike}`)
}

// 获取我的红心歌曲
export function getMyLove() {
  return request.post(`/likeList`);
}