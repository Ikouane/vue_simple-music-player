/*
 * @Author: ikouane
 * @PoweredBy: 未央宫©WeYounG
 * @Date: 2023-03-23 16:32:34
 * @LastEditTime: 2023-03-23 16:38:10
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
 */
function loadScript(url, callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  // 处理IE
  if (script.readyState) {
    script.onreadystatechange = function () {
      if (script.readyState === 'loaded' || script.readyState === 'complete') {
        script.onreadystatechange = null;
        callback();
      }
    }
  } else {
    // 处理其他浏览器的情况
    script.onload = function () {
      callback();
    }
  }
  script.src = url;
  document.body.append(script);
}

export {
  loadScript
}