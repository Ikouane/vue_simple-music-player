import { createStore } from "vuex";
import useClipboard from "vue-clipboard3";
import { nextTick } from "vue";
import {
  getDateApi,
  getMusicUrlApi,
  getSvipMusicUrlApi,
  loveSongApi,
  getSingleMusicApi,
  setTaskProgressApi,
  getUserInfoApi
} from "@/api/api";
import { loadScript } from "@/utils/loadJs.js";
import { formatArtists } from "@/utils/public.js";
// import { ElNotification } from 'element-plus'
import { io } from "socket.io-client";
import { baseAPI, setRequestHeader } from "../utils/http";
import { useLocalStorage } from "@vueuse/core";
import confetti from "canvas-confetti";
import { ElMessage } from "element-plus";
import { compareVersions, validate } from "compare-versions";

let confettiInstance = confetti.create(
  document.getElementById("confetti-canvas"),
  {
    resize: true,
    useWorker: true,
  }
);

const setMode = (mode) => {
  if (mode === "night") {
    document.body.className = "dark";
    document.documentElement.classList.add("dark");
  } else if (mode === "day") {
    document.body.className = "";
    document.documentElement.classList.remove("dark");
  } else if (mode === "pink") {
    document.body.className = "pink";
    document.documentElement.classList.remove("dark");
  }
};

const VERSION = "0.0.78-beta+20230813";
let storeObj = {
  account: {
    uuid: null,
    username: null,
    avatar: { useSquare: false, type: "default" },
  },
  config: {
    room: {
      newMessageSound: "message-1.mp3",
      showRoomChangeMessage: true,
      showPreviousRoomChangeMessage: true,
      alwaysShowUsername: false,
      autoShowUserUsernameInMoreThanTwoPeople: true,
    },
    player: {
      activeColor: null,
    },
  },
  version: VERSION,
};

// 遍历校验 obj1 中的 key 是否都存在于 obj2 中
const validateTwoObject = (obj1, obj2) => {
  let result = true;
  for (let key in obj1) {
    if (Object.prototype.hasOwnProperty.call(obj2, key) === false) {
      result = false;
      break;
    }
    if (typeof obj1[key] === "object") {
      if (!validateTwoObject(obj1[key], obj2[key])) {
        result = false;
        break;
      }
    }
  }

  return result;
};

// 合并两个对象中同名的值
const mergeTwoObject = (obj1, obj2) => {
  let result = {};
  result.version = obj1.version;
  for (let key in obj1) {
    if (key === "version") continue;
    if (Object.prototype.hasOwnProperty.call(obj2, key) === false) {
      result[key] = obj1[key];
    } else {
      if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
        result[key] = mergeTwoObject(obj1[key], obj2[key]);
      } else {
        result[key] = obj2[key];
      }
    }
  }

  return result;
};

// 校验数据是否升级完成
const validateObj = (newObj) => {
  return validateTwoObject(storeObj, newObj);
}

export default createStore({
  state: {
    VERSION,
    _loaded: false,
    _success: false,
    _pid: null,
    _rid: null,
    _uid: null,
    _store: useLocalStorage("weyoung-music", storeObj),
    _dailyMode: false,
    _signalColor: null,
    _ws: null,
    _singleMusicMode: false,
    _timer: null,
    _userTouch: false,
    _miniMode: false,
    _mainColor: "rgb(0,0,0)", // 主题色,
    _playModeCount: 0,
    _play: {
      isPlaying: false,
      nowPlaying: 0,
      playTime: 0, //ms
      mode: "day", //Or "night"
      nowPage: "PLAYING NOW", //Or "PLAYLIST", "musicLrc"
      message: {
        show: true,
        title: "通知",
        content: "数据请求中",
        duration: 0,
      },
      volume: 100, //音量
    },
    _playList: [],
    _message: [],
    _roomInfo: {},
    _showPopup: false,
    _tips: {},
    example_array: [
      {
        musicId: "musicId",
        musicName: "MusicName",
        musicAuthor: "musicAuthor",
        musicImage: "url",
        musicUrl: "url",
        isLike: false,
      },
    ],
    _chatContainerShow: false,
    _inputMode: false,
    formatArtists,
    // 当前歌词
    _currentLrc: {
      lrc: null,
      tlrc: null,
    },
    _confettiInstance: confettiInstance,
    // 个人信息
    userInfo: {}
  },
  mutations: {
    deepClone(obj = {}) {
      const _this = this;
      if (typeof obj !== "object" || obj == null) {
        //如果不为引用类型直接返回
        return obj;
      }
      let result;
      if (obj instanceof Array) {
        result = [];
      }
      if (obj instanceof Object) {
        result = {};
      }
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          //如果为本身属性则递归调用，一步一步展开，再判断内容是值类型还是引用类型，直到遍历结束
          result[key] = _this.commit("deepClone", obj[key]);
        } //若为从原型继承的属性就跳过
      }
      return result;
    },
    setStore(state, o_Play) {
      state._loaded = true;
      state._play = o_Play._play;
      state._playList = o_Play._playList;
      state._message = o_Play._message;
      setMode(state._play.mode);

      let snowWrapper = document.querySelector(".snow__wrapper");
      if (state._play.snowMode) {
        let fragMent = document.createDocumentFragment();
        let count = 200;
        if (
          navigator.userAgent.match(
            /(iPhone|iPod|Android|ios|iOS|iPad|Backerry|WebOS|Symbian|Windows Phone|Phone)/i
          )
        )
          count = 50;
        for (let index = 0; index < count; index++) {
          let div = document.createElement("div");
          div.className = "snow";
          fragMent.appendChild(div);
        }
        snowWrapper.appendChild(fragMent);
      } else snowWrapper?.parentElement.removeChild(snowWrapper);

      if (state._play.sakuraMode) {
        loadScript("sakura-small.js", () => {
          setTimeout(() => {
            this.commit("setMsg", {
              title: "主题效果",
              message: "已应用「樱花」效果",
            });
          }, 3000);
        });
      }

      // TODO: 雪花数量根据音乐增减
      // state._play = this.commit('deepClone', o_Play._play)
      // state._playList = this.commit('deepClone', o_Play._playList)
      // this.commit('clearMsg');
      // this.commit("setMsg", "数据已更新");

      this.dispatch("getMusicUrl", {
        musicIndex: 0,
      }).then(() => {
        document.querySelector("#music").src =
          state._playList[state._play.nowPlaying].url;
      });

      console.log("数据已更新");

      // if (state._play.isPlaying) {
      //   this.timer = setInterval(() => {
      //     // 检测音乐是否正常播放
      //     if (document.querySelector("#music").paused) {
      //       console.error("音乐播放异常");

      //       document.querySelector("#music").play();

      //       clearInterval(this.timer);
      //     }
      //   }, 1000);
      // }
    },
    pause(state) {
      state._play.isPlaying = false;
      document.getElementById("music").pause();
      // , showMsg = true
      // if (showMsg)
      //   this.commit("setMsg", {
      //     message: "音乐已暂停",
      //   });
    },
    play(state) {
      if (state._play.playTime > 0) {
        if (state._ws) {
          // 获取最新进度
          state._ws.emit("sync", {
            action: "getLatest",
          });

          console.log("获取最新进度");
        }

        nextTick(() => {
          document.getElementById("music").currentTime = state._play.playTime;
        });
      }
      state._play.isPlaying = true;
      document.getElementById("music").play();
      this.commit("updateTitle");
      // this.commit("setMsg", {
      //   message: "音乐已播放",
      // });
    },
    musicFadeIn(
      state,
      { needSync = true } = {
        needSync: true,
      }
    ) {
      this.commit("play");
      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "musicFadeIn",
        });
      document.getElementById("music").volume = 0;
      let v = document.getElementById("music").volume;
      let int = setInterval(() => {
        console.log("渐入");
        v += 0.1;
        if (v >= (state._play.volume / 100).toFixed(2)) {
          clearInterval(int);
          v = (state._play.volume / 100).toFixed(2);
        }
        document.getElementById("music").volume = v;
      }, 100);
    },
    musicFadeOut(
      state,
      { needSync = true } = {
        needSync: true,
      }
    ) {
      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "musicFadeOut",
        });
      //document.getElementById("music").volume = 1;
      let v = document.getElementById("music").volume;
      let int = setInterval(() => {
        console.log("渐出");
        v -= 0.1;
        if (v <= 0) {
          this.commit("pause");
          clearInterval(int);
        } else {
          document.getElementById("music").volume = v;
        }
      }, 100);
    },
    playSwitch(state) {
      if (state._play.isPlaying) {
        this.commit("pause");
      } else {
        this.commit("play");
      }
    },
    playSwitchFade(state) {
      if (state._play.isPlaying) {
        this.commit("musicFadeOut");
      } else {
        this.commit("musicFadeIn");
      }
    },
    updateTitle(state) {
      document.title =
        state._playList[state._play.nowPlaying].name +
        " - " +
        formatArtists(state._playList[state._play.nowPlaying].artist);
    },
    prev(state, { needSync = true, desIndex = null } = {}) {
      if (!desIndex) {
        desIndex = state._playList.length - 1;
        // 若强制上一首则上一首
        // 即使处于单曲循环也进行上一首
        // 若处于随机状态则随机上一首

        switch (this.getters.getPlayMode) {
          // 单曲循环
          case "cycle":
            if (state._play.nowPlaying - 1 >= 0)
              desIndex = state._play.nowPlaying - 1;
            state._singleMusicMode = true;
            break;
          // 随机播放
          case "random":
            desIndex = Math.floor(Math.random() * state._playList.length);
            state._singleMusicMode = false;
            break;
          // 列表循环
          case "list":
            if (state._play.nowPlaying - 1 >= 0)
              desIndex = state._play.nowPlaying - 1;
            state._singleMusicMode = false;
            break;
        }
      }

      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "prev",
          desIndex,
        });

      this.dispatch("getMusicUrl", {
        musicIndex: desIndex,
      }).then(() => {
        let v = document.getElementById("music").volume;
        let int = setInterval(() => {
          console.log("渐出");
          v -= 0.1;
          if (v <= 0) {
            state._play.isPlaying = false;
            state._play.nowPlaying = desIndex;
            state._play.isPlaying = true;
            this.commit("updateTitle");
            let v2 = document.getElementById("music").volume;
            let int2 = setInterval(() => {
              console.log("渐入");
              v2 += 0.1;
              if (v2 >= (state._play.volume / 100).toFixed(2)) {
                clearInterval(int2);
              } else {
                document.getElementById("music").volume = v2;
              }
            }, 100);
            clearInterval(int);
          } else {
            document.getElementById("music").volume = v;
          }
        }, 75);
      });

      // if ((state._play.nowPlaying -= 1) < 0) state._play.nowPlaying = state._playList.length - 1
      // state._play.isPlaying = true
    },
    next(
      state,
      {
        hasWrong = false,
        needSync = true,
        isForce = false,
        desIndex = null,
      } = {}
    ) {
      if (!desIndex) {
        desIndex = 0;

        // 若强制下一首则下一首
        // 即使处于单曲循环也进行下一首
        // 若处于随机状态则随机下一首

        if (state._play.nextPlay) {
          desIndex = state._play.nextPlay;
          this.commit("clearNextPlay", {});
        } else
          switch (this.getters.getPlayMode) {
            // 单曲循环
            case "cycle":
              if (state._play.nowPlaying + 1 <= state._playList.length - 1)
                desIndex = state._play.nowPlaying + 1;
              state._singleMusicMode = true;
              break;
            // 随机播放
            case "random":
              desIndex = Math.floor(Math.random() * state._playList.length);
              state._singleMusicMode = false;
              break;
            // 列表循环
            case "list":
              if (state._play.nowPlaying + 1 <= state._playList.length - 1)
                desIndex = state._play.nowPlaying + 1;
              state._singleMusicMode = false;
              break;
          }
      }

      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "next",
          desIndex,
        });

      this.dispatch("getMusicUrl", {
        musicIndex: desIndex,
      }).then(() => {
        let v = document.getElementById("music").volume;
        let int = setInterval(() => {
          console.log("渐出");
          v -= 0.1;
          if (v <= 0) {
            state._play.isPlaying = false;
            if (state._singleMusicMode && !isForce) {
              console.log("重新播放");
              document.getElementById("music").currentTime = 0;
              document.getElementById("music").play();
              state._play.isPlaying = true;
              this.commit("updateTitle");
            } else {
              state._play.nowPlaying = desIndex;
              state._play.isPlaying = true;
              this.commit("updateTitle");
            }
            let v2 = document.getElementById("music").volume;
            let int2 = setInterval(() => {
              console.log("渐入");
              v2 += 0.1;
              if (v2 >= (state._play.volume / 100).toFixed(2)) {
                clearInterval(int2);
              } else {
                document.getElementById("music").volume = v2;
              }
            }, 100);
            clearInterval(int);
          } else {
            document.getElementById("music").volume = v;
          }
        }, 75);

        if (hasWrong === "wrong") {
          this.commit("setMsg", {
            message: "播放出错，已为您跳过",
          });
        }
      });

      // if ((state._play.nowPlaying += 1) > state._playList.length - 1) state._play.nowPlaying = 0
      // state._play.isPlaying = true
    },
    goPlay(state, { desIndex, needSync = true, needPlay = true }) {
      state._play.isPlaying = false;
      this.commit("setTime", { stopFlag: true });
      // 如果播放的歌曲和当前歌曲相同，则将播放时间同步
      if (needPlay && state._play.nowPlaying == desIndex) {
        this.commit("goTime", {
          desTime: state._play.playTime,
          needSync: false,
        });
      }
      if (state._playList[desIndex].skip) {
        // 跳过歌曲时处理
        console.log("该歌曲无法播放，已为您播放下一首");
        this.commit("next");
      } else {
        if (needSync && state._ws)
          state._ws.emit("sync", {
            action: "goPlay",
            desIndex,
          });

        this.dispatch("getMusicUrl", {
          musicIndex: desIndex,
        }).then(() => {
          const musicEl = document.getElementById("music");
          nextTick(() => {
            if (!needPlay) {
              state._play.nowPlaying = desIndex;
              state._play.isPlaying = false;
              this.commit("updateTitle");
            } else {
              let v = musicEl.volume;
              let int = setInterval(() => {
                console.log("渐出");
                v -= 0.1;
                if (v <= 0) {
                  // state._play.isPlaying = false;
                  // this.commit("pause");
                  state._play.nowPlaying = desIndex;
                  if (needPlay) {
                    this.commit("play");
                    state._play.isPlaying = true;
                  }
                  this.commit("updateTitle");
                  let v2 = musicEl.volume;
                  let int2 = setInterval(() => {
                    console.log("渐入");
                    v2 += 0.1;
                    if (v2 >= (state._play.volume / 100).toFixed(2)) {
                      clearInterval(int2);
                    } else {
                      musicEl.volume = v2;
                    }
                  }, 100);
                  clearInterval(int);
                } else {
                  musicEl.volume = v;
                }
              }, 50);
            }
          });
        });
      }
    },
    goTime(state, { desTime, needSync = true }) {
      this.commit("setTime", { stopFlag: true });
      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "goTime",
          desTime,
        });

      nextTick(() => {
        if (desTime < 0) {
          desTime = 0;
        } else if (desTime > document.getElementById("music").duration) {
          desTime = document.getElementById("music").duration;
        }
        if (desTime) {
          document.getElementById("music").currentTime = desTime;
          state._play.playTime = desTime;
        }
        //当音乐没播放时，调整进度会直接播放音乐，已修复
        if (state._play.isPlaying) {
          //
        } else document.getElementById("music").pause();
      });
    },
    addTime() {
      this.commit("goTime", {
        desTime: document.getElementById("music").currentTime + 10,
      });
    },
    minusTime() {
      this.commit("goTime", {
        desTime: document.getElementById("music").currentTime - 10,
      });
    },
    setTime(state, { time, stopFlag = false }) {
      if (stopFlag) {
        if (this.throttle) {
          clearTimeout(this.throttle);
          this.throttle = null;
        }
        state._play.playTime = 0;
        return;
      }
      state._play.playTime = time;
      if (state._ws && state._play.isPlaying) {
        // 节流每秒执行一次
        if (this.throttle) {
          return;
        }
        this.throttle = setTimeout(() => {
          state._ws.emit("sync", {
            action: "updatePlayTime",
            playTime: time,
            nowPlaying: state._play.nowPlaying,
          });
          this.throttle = null;
        }, 200);
      }
    },
    goList(state) {
      state._play.nowPage = "PLAYLIST";
    },
    goMain(state) {
      state._play.nowPage = "PLAYING NOW";
    },
    listSwitch(state) {
      if (state._play.nowPage === "PLAYING NOW")
        state._play.nowPage = "PLAYLIST";
      else state._play.nowPage = "PLAYING NOW";
    },
    modeSwitch(
      state,
      { target = null, needSync = true } = {
        target: null,
      }
    ) {
      document.querySelector("body").classList.remove("imgBg");

      if (target === "night" || target === "day") {
        state._play.mode = target;
        if (state._play.mode === "day") {
          this.commit("setMsg", {
            message: "已切换至日间模式",
          });
        } else {
          this.commit("setMsg", {
            message: "已切换至夜间模式",
          });
        }
      } else {
        if (state._play.mode === "day") {
          state._play.mode = "night";
          this.commit("setMsg", {
            message: "已切换至夜间模式",
          });
        } else {
          state._play.mode = "day";
          this.commit("setMsg", {
            message: "已切换至日间模式",
          });
        }
      }

      setMode(state._play.mode);

      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "modeSwitch",
          target: state._play.mode,
        });
    },
    switchLike(
      state,
      { needSync = true } = {
        needSync: true,
      }
    ) {
      let _this = this;
      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "switchLike",
        });
      if (state._playList[state._play.nowPlaying].isLike) {
        console.log("取消我喜欢");
      } else {
        console.log("我喜欢");
      }

      loveSongApi(
        state._playList[state._play.nowPlaying].id,
        !state._playList[state._play.nowPlaying].isLike
      )
        .then((response) => {
          if (response.code == 200) {
            if (state._playList[state._play.nowPlaying].isLike)
              _this.commit("setMsg", {
                message: "已添加至我喜欢，并同步至网易云",
              });
            else
              _this.commit("setMsg", {
                message: "已移出我喜欢，并同步至网易云",
              });
          } else {
            if (state._playList[state._play.nowPlaying].isLike)
              _this.commit("setMsg", {
                message: "已添加至我喜欢，同步网易云失败",
              });
            else
              _this.commit("setMsg", {
                message: "已移出我喜欢，同步网易云失败",
              });
          }
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
      state._playList[state._play.nowPlaying].isLike =
        !state._playList[state._play.nowPlaying].isLike;
    },
    clearMsg(state) {
      state._play.message.show = false;
      state._play.message.content = null;
    },
    setMsg(
      state,
      { message, duration = 3000, title = "通知", impact = false, buttons = [] }
    ) {
      if (!state._play.message.impact || impact) this.commit("clearMsg");
      setTimeout(() => {
        state._play.message.show = true;
        state._play.message.duration = duration;
        state._play.message.title = title;
        state._play.message.content = message;
        state._play.message.impact = impact;
        state._play.message.buttons = buttons;
      }, 0);
    },
    addMore(state, o_playList) {
      state._playList = state._playList.concat(o_playList);
      this.commit("setMsg", {
        message: "已加载更多歌曲",
      });
    },
    // 将歌曲移出播放列表（播放出错时）
    removeMusic(state, musicIndex) {
      state._playList.splice(musicIndex, 1);
    },
    // 将歌曲标记为跳过，播放时将自动跳过，列表中显示灰色
    skipMusic(state, musicIndex) {
      state._playList[musicIndex].skip = true;
    },
    setSuccess(state, isSuccess = true) {
      state._success = isSuccess;
    },
    setPid(state, dPid) {
      if (dPid) {
        state._pid = dPid;
        this.commit("setMsg", {
          message: `当前歌单编号为：${dPid}`,
        });
      }
    },
    setLocal(state) {
      localStorage.setItem(
        "vue_simple-music-player",
        JSON.stringify({
          _play: state._play,
          _playList: state._playList,
        })
      );
    },
    getLocal() {
      let local = localStorage.getItem("vue_simple-music-player");
      if (local) {
        let _local = JSON.parse(local);
        _local._play.isPlaying = false;
        this.commit("setStore", _local);
      }
    },
    setRid(state, { rid, status = "waiting" }) {
      // FIXME: 修复概率出现两次提示的问题，第二次无法正常接收参数
      state._rid = rid;
      switch (status) {
        case "waiting":
          console.log(`%c[WS]`, "color: #e78111", "正在连接至服务器");
          break;
        case "connected":
          console.log(`%c[WS]`, "color: #00a1f1", "已连接至服务器");
          this.commit("setMsg", {
            title: `欢迎使用「一起听」`,
            message: `加入 ${rid} 房间`,
            duration: 0,
            buttons: ["jumpToRoom"],
          });
          break;
        case "failed":
          console.log(`%c[WS]`, "color: #f00", "连接服务器失败");
          this.commit("setMsg", {
            title: `系统消息`,
            message: `获取房间数据失败，已进入离线模式`,
            duration: 0,
            impact: true,
          });
          break;
      }
    },
    setImageBackground(state) {
      if (state._playList[state._play.nowPlaying].cover) {
        document
          .querySelector("body")
          .setAttribute(
            "style",
            `--backgroundImage:url("${state._playList[state._play.nowPlaying].cover
            }")`
          );
        document.querySelector("body").classList.add("imgBg");
      } else document.querySelector("body").classList.remove("imgBg");
    },
    setVolume(state, action) {
      switch (action) {
        case "up":
          if (state._play.volume <= 90) state._play.volume += 10;
          break;
        case "down":
          if (state._play.volume >= 10) state._play.volume -= 10;
          break;
        default:
          break;
      }
      if (state._play.volume == 0) {
        this.commit("setMsg", {
          message: `已静音`,
        });
        document.querySelector("audio").muted = true;
      } else {
        this.commit("setMsg", {
          message: `音量已调整至${state._play.volume}%`,
        });
        document.querySelector("audio").muted = false;
      }

      document.querySelector("audio").volume = (
        state._play.volume / 100
      ).toFixed(2);
    },

    // 设置单音乐模式
    setSingleMusicMode(state) {
      state._singleMusicMode = true;
      this.commit("addPlayMode");
    },

    // 设置定时器
    set_Timer(state, value) {
      state._timer = value;
    },

    // 复制文本到剪贴板
    async copyToClipBoard(state, { text, message = "已复制到剪贴板" }) {
      const { toClipboard } = useClipboard();
      try {
        //复制
        await toClipboard(text);
        this.commit("setMsg", {
          message,
        });
        //下面可以设置复制成功的提示框等操作
        //...
      } catch (e) {
        //复制失败
        console.error(e);
      }
    },

    // 设置每日推荐模式
    setDailyMode(state) {
      state._dailyMode = true;
    },

    // 设置通知灯颜色
    setSignalColor(state, desColor) {
      if (desColor == "received") {
        state._signalColor = "yellow";

        if (this.interval) clearInterval(this.interval);
        if (this.timerOut) clearTimeout(this.timerOut);

        this.interval = setInterval(() => {
          if (state._signalColor == "yellow") state._signalColor = "white";
          else state._signalColor = "yellow";
        }, 400);

        this.timerOut = setTimeout(() => {
          clearInterval(this.interval);
          state._signalColor = "green";
        }, 3000);
      } else state._signalColor = desColor;
    },

    // 替换音乐源（游客无法播放时）
    replaceMusicUrl(state, { musicIndex, musicUrl, needPlay }) {
      state._playList[musicIndex].url = musicUrl;
      state._playList[musicIndex].skip = false;
      this.commit("goPlay", {
        desIndex: musicIndex,
        needPlay,
        needSync: false,
      });
    },

    // 设置已触碰
    setAlreadyTouch(state) {
      state._userTouch = true;
    },

    // 设置 MINI 模式
    setMiniMode(state) {
      state._miniMode = true;
    },

    // 发送房间广播消息
    sendMessage(state, { msg, needSync = true }) {
      let data = {
        type: "room",
      };

      if (typeof msg === "string") {
        // 解析网易云音乐链接
        // 使用正则表达式匹配网易云音乐链接
        let reg = /https:\/\/music.163.com\/song\?id=(\d+)/;
        let match = msg.match(reg);
        if (match) {
          // 匹配成功
          let id = match[1];
          // 获取歌曲信息
          data.addition = {
            platform: "netease",
            kind: "song",
            musicId: id,
          };
          data.type = "room:addSong";
        } else {
          // 匹配失败
          data.msg = msg;
        }
      } else if (typeof msg === "object") {
        data.msg = msg;
      }

      if (needSync && state._ws) state._ws.emit("message", data);
    },

    // 设置正在输入信息
    setTyping(state, { isTyping, needSync = true, typingUser }) {
      if (needSync && state._ws)
        state._ws.emit("message", {
          type: "room:setTyping",
          isTyping,
        });

      // 设置正在输入的用户
      if (typingUser != undefined) state._roomInfo.typingUser = typingUser;
    },

    // 发送房间效果
    sendRoomEffect(state, { effect }) {
      if (state._ws)
        state._ws.emit("message", {
          type: "room:effect",
          addition: {
            effect,
          },
        });
    },

    // 发送房间游戏
    sendRoomGame(state, { game }) {
      if (state._ws)
        state._ws.emit("message", {
          type: "room:game",
          addition: {
            game,
          },
        });
    },

    // 撤回消息
    recallMessage(state, { id, index }) {
      if (state._ws)
        state._ws.emit("message", {
          type: "room:recall",
          addition: {
            id,
            index,
          },
        });
    },

    // 设置主题色
    setMainColor(state, { mainColor }) {
      state._mainColor = mainColor;
    },

    // 循环切换播放模式
    addPlayMode(state) {
      state._playModeCount += 1;
      console.log(state._playModeCount, this.getters.getPlayMode);
    },

    switchChatContainerShow(state, value) {
      if (state._rid) {
        if (value != undefined) state._chatContainerShow = value;
        else state._chatContainerShow = !state._chatContainerShow;
        this.commit("setInputMode", state._chatContainerShow);
      } else {
        this.commit("setMsg", {
          title: `系统消息`,
          message: `请先加入房间`,
          duration: 0,
        });
      }
    },

    // 设置输入模式（不检测空格及其他快捷键）
    setInputMode(state, value) {
      state._inputMode = value;
    },

    // 追加歌曲至一起听列表
    addToList(
      state,
      { needSync = true, musicId, needPlay = false, saveInRoom = false }
    ) {
      if (
        state._playList.every(({ id: listMusicId }) => listMusicId != musicId)
      ) {
        if (needSync && state._ws)
          state._ws.emit("sync", {
            action: "addToList",
            musicId,
            needPlay,
          });

        getSingleMusicApi(musicId)
          .then((response) => {
            this.commit("addMore", response._playList);
            if (needPlay)
              this.commit("goPlay", {
                desIndex: state._playList.length - 1,
                needSync: false,
              });
            if (saveInRoom) {
              state._ws.emit("sync", {
                action: "updatePlayList",
                play: Object.assign(state._play, {
                  nowPlaying: needPlay
                    ? state._playList.length - 1
                    : state._play.nowPlaying,
                }),
                playList: state._playList,
              });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else
        this.commit("setMsg", {
          message: `歌曲已存在`,
        });
    },

    // 设置播放次数
    setPlayCount(state, { musicIndex }) {
      if (!state._playList[musicIndex]?.blockPlayCount)
        state._playList[musicIndex].blockPlayCount = 0;
      state._playList[musicIndex].blockPlayCount++;
      if (state._playList[musicIndex].blockPlayCount == 3) {
        this.commit("setMsg", {
          title: `您已经听了好几遍了哦`,
          message: `是否喜欢该歌曲？`,
          type: "ask-for-like",
          duration: 0,
        });
      }
    },

    // 更新用户昵称
    updateUsername(
      state,
      { needSync = true, uuid, oldUsername, username } = {}
    ) {
      if (needSync && state._ws && state._rid && state._store.account?.username)
        state._ws.emit("sync", {
          action: "updateUsername",
          username: username || state._store.account.username,
        });

      this.commit('updateTaskProgress', { taskProgress: 0 });

      if (uuid && oldUsername && username) {
        state._message.forEach((message) => {
          if (message.uuid == uuid && message.username == oldUsername) {
            message.username = username;
          }
        });
      }
    },

    // 更新用户头像
    updateAvatar(state, { needSync = true, avatar, uuid } = {}) {

      // 若是他人更新头像，则更新头像列表中的头像
      if (uuid && avatar) {
        state._roomInfo.avatarList[uuid] = avatar;
      }

      if (needSync && state._ws && state._rid && state._store.account?.avatar) {
        // 更新自己的头像
        state._roomInfo.avatarList[state._store.account.uuid] = avatar;
        this.commit('updateTaskProgress', { taskProgress: 1 });
        state._ws.emit("sync", {
          action: "updateAvatar",
          avatar: avatar || state._store.account.avatar,
        });
      }
    },

    // 更新歌词
    updateLyric(state, { lrc, tlrc }) {
      state._currentLrc = {
        lrc,
        tlrc,
      };
    },

    updateShowPopup(state, { showPopup }) {
      state._showPopup = showPopup;
    },

    // 房间特殊效果处理
    roomEffectHandler(state, { effect }) {
      // , config = null
      let defaults = {};

      // 重置已存在的特效
      state._confettiInstance.reset();
      // 清除所有未完成的 confetti 动画
      // TODO: 修复连续点击特效按钮时的 bug

      function shoot() {
        state._confettiInstance({
          ...defaults,
          particleCount: 40,
          scalar: 1.2,
          shapes: ["star"],
        });

        state._confettiInstance({
          ...defaults,
          particleCount: 10,
          scalar: 0.75,
          shapes: ["circle"],
        });
      }

      switch (effect) {
        case "confetti:basic":
          state._confettiInstance({
            particleCount: 200,
            spread: 200,
            origin: {
              y: 0.6,
            },
          });
          break;
        case "confetti:stars":
          defaults = {
            spread: 360,
            ticks: 50,
            gravity: 0,
            decay: 0.94,
            startVelocity: 30,
            shapes: ["star"],
            colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
          };
          setTimeout(shoot, 0);
          setTimeout(shoot, 100);
          setTimeout(shoot, 200);
          break;
        case "confetti:fireworks":
          var duration = 15 * 1000;
          var animationEnd = Date.now() + duration;
          defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

          var randomInRange = (min, max) => {
            return Math.random() * (max - min) + min;
          };

          var interval = setInterval(function () {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti(
              Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
              })
            );
            confetti(
              Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
              })
            );
          }, 250);
          break;
        case "confetti:school-pride":
          var end = Date.now() + 15 * 1000;
          var colors = ["#bb0000", "#ffffff"];
          (function frame() {
            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: colors,
            });
            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: colors,
            });

            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          })();
          break;
        default:
          break;
      }
    },

    // 房间游戏处理
    roomGameHandler(state, { game }) {
      switch (game) {
        case "luck:rock-paper-scissors":
          console.log("即将开始猜拳游戏");
          break;

        default:
          break;
      }
    },

    // 设置下一首歌曲
    setNextPlay(state, { musicIndex, needSync = true }) {
      if (state._playList[musicIndex]) {
        state._play.nextPlay = musicIndex;
        this.commit("setMsg", {
          title: "已设置下一首歌曲",
          duration: 3000,
          message: `${state._playList[musicIndex].name}(${state.formatArtists(
            state._playList[musicIndex].artist
          )})`,
        });

        if (state._ws && needSync) {
          state._ws.emit("sync", {
            action: "setNextPlay",
            musicIndex,
          });
        }
      }
    },

    // 清除下一首歌曲
    clearNextPlay(state, { needSync = true }) {
      state._play.nextPlay = null;
      if (state._ws && needSync) {
        state._ws.emit("sync", {
          action: "clearNextPlay",
        });
      }
    },

    // 判断是否需要升级数据结构
    upgradeLocalStorage(state) {
      if (validate(state._store.version) && validateObj(state._store)) {
        if (compareVersions(state.VERSION, state._store.version)) {
          state._tips = {
            icon: "fa fa-upload upAnimation",
            show: true,
            content: "数据文件正在升级",
          };

          // 将旧的数据进行备份
          if (localStorage.getItem("weyoung-music"))
            localStorage.setItem(
              "weyoung-music-backup",
              localStorage.getItem("weyoung-music")
            );
          // 清除旧的数据
          localStorage.removeItem("weyoung-music");
          if (localStorage.getItem("weyoung-music-backup")) {
            // 将旧的数据进行升级，遍历新数据，将旧数据中的值赋值给新数据
            state._store = mergeTwoObject(storeObj, JSON.parse(
              localStorage.getItem("weyoung-music-backup")
            ));
          }
        }
      } else {
        state._tips = {
          icon: "fa fa-tools rotate",
          show: true,
          content: "数据文件出错，正在修复",
        };

        // 将旧的数据进行备份
        if (localStorage.getItem("weyoung-music"))
          localStorage.setItem(
            "weyoung-music-backup",
            localStorage.getItem("weyoung-music")
          );
        // 清除旧的数据
        localStorage.removeItem("weyoung-music");
        if (localStorage.getItem("weyoung-music-backup")) {
          // 将旧的数据进行升级，遍历新数据，将旧数据中的值赋值给新数据
          state._store = mergeTwoObject(storeObj, JSON.parse(
            localStorage.getItem("weyoung-music-backup")
          ));
        }
      }

      // 校验数据
      if (validateObj(state._store)) {
        setTimeout(() => {
          state._tips.content = "处理完成";
          setTimeout(() => {
            state._tips.show = false;
          }, 2000);
        }, 3000);
        // 删除备份数据
        localStorage.removeItem("weyoung-music-backup");
      } else {
        state._tips.content = "数据文件修复失败，请联系管理员";
      }
    },

    // 更新用户信息
    updateUserInfo(state, { userInfo }) {
      state.userInfo = userInfo;
    },

    // 更新任务进度
    updateTaskProgress(state, { taskProgress }) {
      if (state.userInfo.beginnerTask?.includes(taskProgress)) {
        return;
      }
      setTaskProgressApi(taskProgress).then((res) => {
        state.userInfo.beginnerTask = res.beginnerTask;

        if (res.beginnerTask.length == 5) {
          this.commit("setMsg", {
            title: "恭喜你完成所有任务",
            duration: 0,
            message: "获得了 1000 经验",
          });

          // 更新用户信息
          getUserInfoApi().then(res => {
            this.commit("updateUserInfo", {
              userInfo: res
            });
          })

          this.commit("roomEffectHandler", {
            effect: "confetti:fireworks",
          });
        }
      });
    }
  },
  actions: {
    playSync({ commit, rootState }) {
      console.log("开始进度同步（一起听）");
      console.log("连接服务器...");

      const socket = io(
        `${window.location.protocol == "https:" ? "wss" : "ws"}:${baseAPI}`,
        {
          reconnectionDelayMax: 10000,
          auth: {
            token: "123",
          },
          query: {
            "my-key": "my-value",
          },
          withCredentials: true,
          extraHeaders: {
            "vue_simple-music-player-token": "abcd",
          },
        }
      );

      rootState._ws = socket;

      //  加入房间
      socket.on("connect", () => {
        // 如果有绑定事件，先解绑
        socket.off("message");
        socket.off("message-reply");
        socket.off("room:addSong-reply");
        socket.off("room:effect-reply");
        socket.off("room:recall-reply");
        socket.off("welcome");
        socket.off("sync");
        socket.off("ownerChange");
        socket.off("disconnect");

        console.log("已连接至服务器...");
        commit("setSignalColor", "green");

        try {
          if (rootState._store.account || rootState._store.account.uuid) {
            // 无异常
          }
        } catch (error) {
          if (localStorage.getItem("weyoung-music"))
            localStorage.setItem(
              "weyoung-music-backup",
              localStorage.getItem("weyoung-music")
            );
          localStorage.removeItem("weyoung-music");
          if (localStorage.getItem("weyoung-music-backup")) {
            let uuid =
              JSON.parse(localStorage.getItem("weyoung-music-backup"))?.uuid ||
              null;
            if (uuid) rootState._store.account.uuid = uuid;
          }
        }

        socket.emit("join", {
          room: rootState._rid,
          uuid: rootState._store.account.uuid,
          username: rootState._store.account.username,
        });

        socket.on("message", (data) => {
          let { id, msg, time, type, uuid, username } = data;

          let message = {
            id,
            uuid,
            username,
            msg,
            time,
            type,
          };

          let typeMap = {
            "room:join": "房间消息",
            "room:leave": "房间消息",
            "room:rejoin": "房间消息",
            "room:message": "房间消息",
            "room:addSong": "房间添加歌曲",
            "room:effect": "房间特效",
            "room:game": "房间游戏",
            "room:join-fail": "房间加入失败",
            "room:recall": "房间消息",
          };

          if (type == "room:join-fail") {
            ElMessage({
              message: msg,
              type: "info",
              duration: 0,
            });
            return;
          }

          if (type == "room:addSong") {
            let { addition } = data;
            message.addition = addition;
          }

          if (type == "room:effect") {
            let {
              addition: { effect },
            } = data;
            commit("roomEffectHandler", { effect });
            message.addition = {
              effect,
            };
          }

          if (type == "room:game") {
            let {
              addition: { game },
            } = data;
            commit("roomGameHandler", { game });
            message.addition = {
              game,
            };
          }

          const htmlDecode = (str) => {
            let s = "";
            if (str.length == 0) return "";
            s = str.replace(/&amp;/g, "&");
            s = s.replace(/&lt;/g, "<");
            s = s.replace(/&gt;/g, ">");
            s = s.replace(/&nbsp;/g, " ");
            s = s.replace(/&#39;/g, "'");
            s = s.replace(/&quot;/g, '"');
            return s;
          };

          const generateMessage = (type) => {
            switch (type) {
              case "room:join":
                return `${username} 加入了房间`;
              case "room:leave":
                return `${username} 离开了房间`;
              case "room:rejoin":
                return `${username} 重新加入了房间`;
              case "room:message":
                return `${htmlDecode(msg).length > 25
                  ? htmlDecode(msg).slice(0, 25) + "..."
                  : htmlDecode(msg)
                  }`;
              case "room:effect":
                return `${username} 发送了一个特效`;
              case "room:game":
                return `${username} 发起了一个游戏`;
              case "room:recall":
                return `${username} 撤回了一条消息`;
              default:
                return msg;
            }
          };

          // console.log(data);

          if (!rootState._chatContainerShow)
            commit("setMsg", {
              title:
                (type == "room:message" ? `${username} · ` : "") +
                typeMap[type],
              message: generateMessage(type),
              duration: 3000,
              buttons: type.indexOf("room:") != -1 ? ["jumpToRoom"] : null,
            });

          // 播放消息提示音
          if (rootState._store.config.room.newMessageSound == "none") {
            // do nothing
          } else {
            let audio = new Audio(
              require(`@/assets/sound/${rootState._store.config.room.newMessageSound}`)
            );
            audio.play();
          }

          // 请求浏览器通知权限
          if (Notification.permission != "granted") {
            Notification.requestPermission();
          }

          if (type == "room:message") {
            // 发送通知
            if (Notification.permission == "granted") {
              let notification = new Notification(`${username}：`, {
                body: msg,
                icon: "/favicon.ico",
              });
              notification.onclick = () => {
                window.focus();
              };
            }
          }

          if (type == "room:recall") {
            // 清除消息
            let {
              addition: { id, index },
            } = data;
            rootState._message[index].type = "room:recalled";
            message.addition = {
              index,
            };
          }

          if (
            type == "room:join" ||
            type == "room:leave" ||
            type == "room:rejoin"
          ) {
            console.log(data);
            let { count, onlineUserList } = data;
            rootState._roomInfo.count = count;
            rootState._roomInfo.onlineUserList = onlineUserList;
            onlineUserList.forEach(({ uuid, avatar }) => {
              rootState._roomInfo.avatarList[uuid] = avatar;
            })
          }

          if (type == "room:rejoin") {
            let {
              addition: { index },
            } = data;
            message.addition = {
              index,
            };
            rootState._message.splice(index, 1);
          }

          rootState._message.push(message);

          // 判断是否需要滚动到底部
          if (type == "room:recall") {
            return;
          }

          nextTick(() => {
            document
              .querySelector(".message__wrapper .el-scrollbar__wrap")
              ?.scrollTo({
                top: document.querySelector(
                  ".message__wrapper .el-scrollbar__view"
                ).offsetHeight,
                left: 0,
                behavior: "smooth",
              });
          });
        });

        socket.on("message-reply", (data) => {
          let { id, msg, time, type } = data;
          this.state._message.push({
            id,
            msg,
            time,
            type,
            uuid: rootState._store.account.uuid,
          });
          this.commit('updateTaskProgress', { taskProgress: 2 });
          nextTick(() => {
            document
              .querySelector(".message__wrapper .el-scrollbar__wrap")
              .scrollTo({
                top: document.querySelector(
                  ".message__wrapper .el-scrollbar__view"
                ).offsetHeight,
                left: 0,
                behavior: "smooth",
              });
          });
        });

        let fn = (data, needScrollToBottom = true) => {
          let { id, time, type, username, uuid, addition } = data;
          rootState._message.push({ id, time, type, username, uuid, addition });
          if (needScrollToBottom)
            nextTick(() => {
              document
                .querySelector(".message__wrapper .el-scrollbar__wrap")
                ?.scrollTo({
                  top: document.querySelector(
                    ".message__wrapper .el-scrollbar__view"
                  )?.offsetHeight,
                  left: 0,
                  behavior: "smooth",
                });
            });
        };

        socket.on("room:addSong-reply", (data) => {
          this.commit('updateTaskProgress', { taskProgress: 3 });
          console.log(data);
          fn(data);
        });

        socket.on("room:effect-reply", (data) => {
          this.commit('updateTaskProgress', { taskProgress: 4 });
          commit("roomEffectHandler", { effect: data.addition.effect });
          fn(data);
        });

        socket.on("room:recall-reply", (data) => {
          // 撤回消息效果
          let {
            addition: { id, index },
          } = data;
          rootState._message[index].type = "room:recalled";
          fn(data, false);
        });

        socket.on("welcome", (data) => {
          let { id, msg, time, uuid, count, isAdmin, roomData, room } = data;

          rootState._roomInfo.onlineUserList = roomData.onlineUserList;
          rootState._roomInfo.userList = roomData.userList;
          rootState._roomInfo.avatarList = roomData.avatarList;

          commit("setRid", { rid: room, status: "connected" });
          console.log("欢迎", data);

          if (roomData) {
            commit("setStore", roomData);

            // 获取上次离开的时间
            let lastLeaveTime = null;
            let tempMessage = Array.from(rootState._message);
            tempMessage.reverse().find((message, index) => {
              if (message.type == "room:leave" && message.uuid == uuid) {
                lastLeaveTime = new Date(message.time);
                if (
                  lastLeaveTime != null &&
                  new Date() - lastLeaveTime < 10000
                ) {
                  // 删除最近一次离开房间的消息
                  rootState._message.splice(
                    rootState._message.length - index - 1,
                    1
                  );
                  rootState._message.push({
                    id,
                    msg,
                    time,
                    type: "room:rejoin",
                    uuid,
                  });
                } else lastLeaveTime = null;
                return true;
              }
            });

            if (lastLeaveTime == null)
              rootState._message.push({
                id,
                msg,
                time,
                type: "room:join",
                uuid,
              });

            if (!rootState._store.account.uuid) setRequestHeader(data.uuid);

            rootState._store.account.uuid = data.uuid;
            rootState._roomInfo.count = count;
            rootState._roomInfo.isAdmin = isAdmin;
            rootState._roomInfo.joinTime = new Date();

            if (roomData._play.isPlaying) {
              // 静音播放
              nextTick(() => {
                rootState._showPopup = true;
                commit("goPlay", {
                  desIndex: roomData._play.nowPlaying,
                  needSync: false,
                  needPlay: false,
                });

                // 判断音乐是否加载完成
                let music = document.getElementById("music");
                let timer = setInterval(() => {
                  if (music.readyState == 4) {
                    clearInterval(timer);
                    console.log("音乐加载完成");

                    socket.emit("sync", {
                      action: "getLatest",
                    });

                    socket.once("sync", (data) => {
                      commit("goTime", {
                        desTime: data.playTime,
                        needSync: false,
                      });
                    });
                  }
                });
              });
            }
          } else {
            // 连接失败
            commit("setSignalColor", "red");

            getDateApi(true)
              .then((response) => {
                commit("setStore", response);
                setMode(response._play.mode);
                commit("setRid", { rid: null, status: "failed" });
              })
              .catch(function (error) {
                // 请求失败处理
                console.log(error);
              });
          }
        });

        socket.on("sync", (data) => {
          if (rootState._showPopup) return;
          if (data.action == "getLatest") {
            // 获取最新进度
            console.log("获取最新进度", data);
            if (rootState._play.nowPlaying != data.nowPlaying)
              commit("goPlay", {
                desIndex: data.nowPlaying,
                needSync: false,
                needPlay: true,
              });
            commit("goTime", { desTime: data.playTime, needSync: false });
            return;
          }
          commit("setSignalColor", "received");
          commit(data.action, {
            needSync: false,
            ...data,
          });
        });

        socket.on("ownerChange", (data) => {
          console.log("房主变更", data);
          if (data.owner == socket.id) {
            commit("setMsg", {
              title: `「一起听」`,
              message: `您已成为房主`,
              duration: 0,
            });
          }
        });

        socket.on("disconnect", () => {
          console.log("已断开连接");
          commit("setSignalColor", "red");
        });
      });
    },

    retryAfterPlayFail({ commit, rootState }, { index = 0, needPlay = true }) {
      getSvipMusicUrlApi(rootState._playList[index].id)
        .then((response) => {
          commit("replaceMusicUrl", {
            musicIndex: index,
            musicId: response.id,
            musicUrl: response.url,
            needPlay,
          });
          if (needPlay) {
            commit("setMsg", {
              message: `歌曲已播放`,
            });
            commit("goTime", {
              desTime: rootState._play.playTime,
              needSync: false,
            });
            commit("musicFadeIn");
          } else {
            commit("setMsg", {
              message:
                rootState._play.message.content || `处于隐私安全，请手动播放`,
            });
          }
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
          commit("skipMusic", index);
          commit("next", { hasWrong: "wrong" });
        });
    },

    // 获取音乐链接
    getMusicUrl({ rootState }, { musicIndex, forceFlag = false }) {
      return new Promise((resolve, reject) => {
        if (rootState._playList[musicIndex].url && !forceFlag) {
          resolve();
          return;
        }
        getMusicUrlApi(rootState._playList[musicIndex].id)
          .then((response) => {
            rootState._playList[musicIndex].url = response;
            rootState._playList[musicIndex].skip = false;
            resolve(response);
          })
          .catch((error) => {
            console.log(error);
            rootState._playList[musicIndex].skip = true;
            reject(error);
          });
      });
    },
  },
  getters: {
    // 获取音乐 - 艺术家 名称
    getContent(state) {
      return (
        state._playList[state._play.nowPlaying].name +
        " - " +
        formatArtists(state._playList[state._play.nowPlaying].artist)
      );
    },

    // 精准空降
    getThisMoment(state) {
      return `${window.location.origin}${window.location.pathname}?mid=${state._playList[state._play.nowPlaying].id
        }&st=${state._play.playTime}`;
    },

    // 根据 Index 获取 Id
    getMusicIdByIndex: (state) => (id) => {
      return `${window.location.origin}${window.location.pathname}?mid=${state._playList[id].id}`;
    },

    // 获取显示模式
    getMode(state) {
      return state._play.mode;
    },

    // 返回跨域标识
    getAnonymous(state, url) {
      return url.indexOf("cdn.weyoung.tech") == -1;
    },

    // 返回当前播放模式
    getPlayMode(state) {
      if (state._playModeCount % 3 == 0) return "list";
      if (state._playModeCount % 3 == 1) return "cycle";
      if (state._playModeCount % 3 == 2) return "random";
    },

    // 获取下一首歌曲序号（用于倒数 30s 预载）
    getNextMusicIndex(state) {
      // TODO: 显示随机播放的歌曲序号
      let desIndex = 0;

      // 若强制下一首则下一首
      // 即使处于单曲循环也进行下一首
      // 若处于随机状态则随机下一首

      // 如果存在下一首歌曲，则直接返回下一首歌曲序号并清空
      if (state._play.nextPlay) {
        console.log(state._play.nextPlay);
        return state._play.nextPlay;
      }

      switch (state._playModeCount % 3) {
        // 单曲循环
        case 0:
          if (state._play.nowPlaying + 1 <= state._playList.length - 1)
            desIndex = state._play.nowPlaying + 1;
          break;
        // 随机播放
        case 1:
          desIndex = Math.floor(Math.random() * state._playList.length);
          break;
        // 列表循环
        case 2:
          if (state._play.nowPlaying + 1 <= state._playList.length - 1)
            desIndex = state._play.nowPlaying + 1;
          break;
      }

      console.log(desIndex);
      return desIndex;
    },

    // 获取是否命中「樱花」效果，花 / Flower
    getSakuraModeByMusicName(state) {
      return (
        state._playList[state._play.nowPlaying]?.name.indexOf("花") != -1 ||
        state._playList[state._play.nowPlaying]?.name
          .toLowerCase()
          .indexOf("flower") != -1
      );
    },

    // 获取是否命中「雪花」效果

    // 获取是否命中「大雨」效果，雨 / Rain
    getRainModeByMusicName(state) {
      let isRain =
        state._playList[state._play.nowPlaying]?.name.indexOf("雨") != -1 ||
        state._playList[state._play.nowPlaying]?.name
          .toLowerCase()
          .indexOf("rain") != -1;
      if (isRain) {
        // 判断小雨
        if (
          state._playList[state._play.nowPlaying]?.name.indexOf("小雨") != -1 ||
          state._playList[state._play.nowPlaying]?.name
            .toLowerCase()
            .indexOf("light rain") != -1
        )
          window.rainCount = "light";
        // 判断大雨
        if (
          state._playList[state._play.nowPlaying]?.name.indexOf("大雨") != -1 ||
          state._playList[state._play.nowPlaying]?.name
            .toLowerCase()
            .indexOf("heavy rain") != -1
        )
          window.rainCount = "heavy";
        window.rainCount = "medium";
      }
      return isRain;
    },

    // 根据 musicId 获取 music 信息
    getMusicInfoById: (state) => (id) => {
      return state._playList.find((item) => item.id == id);
    },

    // 根据 musicId 获取 music 序号
    getMusicIndexById: (state) => (id) => {
      return state._playList.findIndex((item) => item.id == id);
    },
  },
  modules: {},
});
