/*
 * @Author: ikouane
 * @PoweredBy: 未央宫©WeYounG
 * @Date: 2023-06-28 17:25:57
 * @LastEditTime: 2023-07-03 16:03:11
 * @LastEditors: ikouane
 * @Description: 公共库文件
 * @version: 
 */
export function formatArtists(artists) {
  return (artists || []).map((item) => item.name).join(" / ");
}

// 防抖
export function debounce(fn, delay) {
  let timer = null;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, delay);
  };
}

// 节流
export function throttle(fn, delay) {
  let timer = null;
  return function () {
    if (!timer) {
      timer = setTimeout(() => {
        fn();
        timer = null;
      }, delay);
    }
  };
}