/*
 * @Author: ikouane
 * @PoweredBy: 未央宫©WeYounG
 * @Date: 2023-06-28 17:25:57
 * @LastEditTime: 2023-06-28 17:38:10
 * @LastEditors: ikouane
 * @Description: 公共库文件
 * @version: 
 */
export function formatArtists(artists) {
  return (artists || []).map((item) => item.name).join(" / ");
}
