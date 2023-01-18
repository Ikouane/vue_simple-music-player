/*
 * @Author: ikouane
 * @Date: 2023-01-17 15:32:01
 * @LastEditTime: 2023-01-18 15:40:15
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
 */
import { request } from "@/utils/http.js";

// 获取播放数据（每日推荐）
export function getData(isDailyRecommend = false) {
  return request.post(`get_v3.php${isDailyRecommend ? '?method=daily_recommend_songs' : ''}`);
}

// 请求单音乐数据
export function getSingleMusic(mid) {
  return request.post(`get_v3.php?mid=${mid}`);
}

// 请求歌单数据
export function getMusicList(lid) {
  return request.post(`get_v3.php?lid=${lid}`);
}

// 请求歌手数据
export function getAuthorData(sid) {
  return request.post(`get_v3.php?method=author&sid=${sid}`)
}

// 获取歌词数据
export function getLyric(mid) {
  return request.post(`get_v3.php?method=lrc&id=${mid}`)
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
  return request.post(`get_v3.php?method=music&mid=${mid}`);
}

// 获取会员歌曲链接
export function getSvipMusicUrl(sid) {
  return request.post(`get_v3.php?sid=${sid}`);
}

// 红心/取消红心
export function loveSong(mid, isLike) {
  return request.post(`get_v3.php?method=like&mid=${mid}&like=${isLike}`)
}