import { createStore } from "vuex";
import useClipboard from "vue-clipboard3";
import { nextTick } from "vue";
import { getDateApi, getMusicUrlApi, getSvipMusicUrlApi, loveSongApi, getSingleMusicApi } from "@/api/api"
import { loadScript } from "@/utils/loadJs.js"
import { formatArtists } from "@/utils/public.js"
// import { ElNotification } from 'element-plus'
import { io } from "socket.io-client";
import { baseAPI } from "../utils/http";
import { useLocalStorage } from "@vueuse/core";

export default createStore({
  state: {
    _loaded: false,
    _success: false,
    _pid: null,
    _rid: null,
    _uid: null,
    _account: useLocalStorage("weyoung-music", { uuid: null, username: "无名氏" }),
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
    formatArtists
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
      if (state._play.mode === "night")
        document
          .querySelector("body")
          .setAttribute("style", "background-color:var(--dark_main_color)");
      else if (state._play.mode === "day")
        document
          .querySelector("body")
          .setAttribute("style", "background-color:var(--main_color)");
      if (state._play.mode === "pink")
        document
          .querySelector("body")
          .setAttribute("style", "background-color:var(--pink_main_color)");

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
              message: "已应用「樱花」效果"
            });
          }, 3000)
        });
      }

      // TODO: 雪花数量根据音乐增减 
      // state._play = this.commit('deepClone', o_Play._play)
      // state._playList = this.commit('deepClone', o_Play._playList)
      // this.commit('clearMsg');
      // this.commit("setMsg", "数据已更新");

      this.dispatch("getMusicUrl", {
        musicIndex: 0
      })

      console.log("数据已更新");
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
        document.getElementById("music").currentTime = state._play.playTime;
      }
      state._play.isPlaying = true;
      document.getElementById("music").play();
      this.commit("updateTitle");
      // this.commit("setMsg", {
      //   message: "音乐已播放",
      // });
    },
    musicFadeIn(state, { needSync = true } = {
      needSync: true
    }) {
      this.commit("play");
      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "musicFadeIn"
        })
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
    musicFadeOut(state, { needSync = true } = {
      needSync: true
    }) {
      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "musicFadeOut"
        })
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
            if ((state._play.nowPlaying - 1) >= 0) desIndex = state._play.nowPlaying - 1;
            state._singleMusicMode = true;
            break;
          // 随机播放
          case "random":
            desIndex = Math.floor(Math.random() * state._playList.length);
            state._singleMusicMode = false;
            break;
          // 列表循环
          case "list":
            if ((state._play.nowPlaying - 1) >= 0) desIndex = state._play.nowPlaying - 1;
            state._singleMusicMode = false;
            break;
        }
      }

      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "prev",
          desIndex
        })

      this.dispatch("getMusicUrl", {
        musicIndex: desIndex
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
      })

      // if ((state._play.nowPlaying -= 1) < 0) state._play.nowPlaying = state._playList.length - 1
      // state._play.isPlaying = true
    },
    next(state, { hasWrong = false, needSync = true, isForce = false, desIndex = null } = {}) {
      if (!desIndex) {
        desIndex = 0;

        // 若强制下一首则下一首
        // 即使处于单曲循环也进行下一首
        // 若处于随机状态则随机下一首

        switch (this.getters.getPlayMode) {
          // 单曲循环
          case "cycle":
            if ((state._play.nowPlaying + 1) <= state._playList.length - 1) desIndex = state._play.nowPlaying + 1;
            state._singleMusicMode = true;
            break;
          // 随机播放
          case "random":
            desIndex = Math.floor(Math.random() * state._playList.length);
            state._singleMusicMode = false;
            break;
          // 列表循环
          case "list":
            if ((state._play.nowPlaying + 1) <= state._playList.length - 1) desIndex = state._play.nowPlaying + 1;
            state._singleMusicMode = false;
            break;
        }
      }

      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "next",
          desIndex
        })

      this.dispatch("getMusicUrl", {
        musicIndex: desIndex
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
      })

      // if ((state._play.nowPlaying += 1) > state._playList.length - 1) state._play.nowPlaying = 0
      // state._play.isPlaying = true
    },
    goPlay(state, { desIndex, needSync = true, needPlay = true }) {
      if (state._playList[desIndex].skip) {
        // 跳过歌曲时处理
        console.log("该歌曲无法播放，已为您播放下一首");
        this.commit("next");
      } else {
        if (needSync && state._ws)
          state._ws.emit("sync", {
            action: "goPlay",
            desIndex
          })

        this.dispatch("getMusicUrl", {
          musicIndex: desIndex
        }).then(() => {
          const musicEl = document.getElementById("music");
          nextTick(() => {
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
          });
        })
      }
    },
    goTime(state, { desTime, needSync = true }) {
      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "goTime",
          desTime
        })

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
    setTime(state, time) {
      state._play.playTime = time;

      if (state._ws)
        // 节流每秒执行一次
        if (this.throttle) {
          return;
        }
      this.throttle = setTimeout(() => {
        state._ws.emit("sync", {
          action: "updatePlayTime",
          playTime: time
        });
        this.throttle = null;
      }, 200);
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
    modeSwitch(state, { target = null, needSync = true } = {
      target: null,
    }) {
      document.querySelector("body").classList.remove("imgBg");

      if (target === "night" || target === "day") {
        state._play.mode = target;
        if (state._play.mode === "day") {
          document
            .querySelector("body")
            .setAttribute("style", "background-color:var(--main_color)");
          this.commit("setMsg", {
            message: "已切换至日间模式",
          });
        } else {
          this.commit("setMsg", {
            message: "已切换至夜间模式",
          });
          document
            .querySelector("body")
            .setAttribute("style", "background-color:var(--dark_main_color)");
        }
      } else {
        if (state._play.mode === "day") {
          state._play.mode = "night";
          this.commit("setMsg", {
            message: "已切换至夜间模式",
          });
          document
            .querySelector("body")
            .setAttribute("style", "background-color:var(--dark_main_color)");
        } else {
          document
            .querySelector("body")
            .setAttribute("style", "background-color:var(--main_color)");
          state._play.mode = "day";
          this.commit("setMsg", {
            message: "已切换至日间模式",
          });
        }
      }

      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "modeSwitch",
          target: state._play.mode,
        })
    },
    switchLike(state, { needSync = true } = {
      needSync: true
    }) {
      let _this = this;
      if (needSync && state._ws)
        state._ws.emit("sync", {
          action: "switchLike"
        })
      if (state._playList[state._play.nowPlaying].isLike) {
        console.log("取消我喜欢");
      } else {
        console.log("我喜欢");
      }

      loveSongApi(state._playList[state._play.nowPlaying].id, !state._playList[state._play.nowPlaying].isLike)
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
    setMsg(state, { message, duration = 3000, title = "通知", impact = false }) {
      if (!state._play.message.impact || impact) this.commit("clearMsg");
      setTimeout(() => {
        state._play.message.show = true;
        state._play.message.duration = duration;
        state._play.message.title = title;
        state._play.message.content = message;
        state._play.message.impact = impact;
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
    setRid(state, {
      rid,
      status = "waiting"
    }) {
      state._rid = rid;
      switch (status) {
        case "waiting":
          break;
        case "connected":
          this.commit("setMsg", {
            title: `欢迎使用「一起听」`,
            message: `加入 ${rid} 房间`,
            duration: 0
          });
          break;
        case "failed":
          this.commit("setMsg", {
            title: `系统消息`,
            message: `获取房间数据失败，已进入离线模式`,
            duration: 0,
            impact: true
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
    async copyToClipBoard(state, text) {
      const { toClipboard } = useClipboard();
      try {
        //复制
        await toClipboard(text);
        this.commit("setMsg", {
          message: `分享链接已复制到剪贴板`,
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

        let interval = setInterval(() => {
          if (state._signalColor == "yellow") state._signalColor = "white";
          else state._signalColor = "yellow";
        }, 400);

        setTimeout(() => {
          clearInterval(interval);
          state._signalColor = "green";
        }, 5000);

      } else
        state._signalColor = desColor;
    },

    // 替换音乐源（游客无法播放时）
    replaceMusicUrl(state, { musicIndex, musicUrl, needPlay }) {
      state._playList[musicIndex].url = musicUrl;
      state._playList[musicIndex].skip = false;
      this.commit("goPlay", { desIndex: musicIndex, needPlay });
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
      }

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
          id
        };
        data.type = "room:addSong";
      } else {
        // 匹配失败
        data.msg = msg;
      }

      if (needSync && state._ws)
        state._ws.emit("message", data)
    },

    // 设置主题色
    setMainColor(state, { mainColor }) {
      state._mainColor = mainColor
    },

    // 循环切换播放模式
    addPlayMode(state) {
      state._playModeCount += 1;
      console.log(state._playModeCount, this.getters.getPlayMode);
    },

    switchChatContainerShow(state) {
      state._chatContainerShow = !state._chatContainerShow;
      this.commit("setInputMode", state._chatContainerShow);
    },

    // 设置输入模式（不检测空格及其他快捷键）
    setInputMode(state, value) {
      state._inputMode = value;
    },

    // 追加歌曲至一起听列表
    addToList(state, { needSync = true, musicId, needPlay = false, saveInRoom = false }) {
      if (state._playList.every(({ id: listMusicId }) => listMusicId != musicId)) {
        if (needSync && state._ws)
          state._ws.emit("sync", {
            action: "addToList",
            musicId,
            needPlay
          })

        getSingleMusicApi(musicId)
          .then((response) => {
            this.commit("addMore", response._playList);
            if (needPlay) this.commit("goPlay", { desIndex: state._playList.length - 1, needSync: false })
            if (saveInRoom) {
              state._ws.emit("sync", {
                action: "updatePlayList",
                play: Object.assign(state._play, {
                  nowPlaying: needPlay ? state._playList.length - 1 : state._play.nowPlaying,
                }),
                playList: state._playList
              })
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
      else this.commit("setMsg", {
        message: `歌曲已存在`,
      });
    },

    // 设置播放次数
    setPlayCount(state, { musicIndex }) {
      if (!state._playList[musicIndex]?.blockPlayCount) state._playList[musicIndex].blockPlayCount = 0;
      state._playList[musicIndex].blockPlayCount++;
      if (state._playList[musicIndex].blockPlayCount == 3) {
        this.commit("setMsg", {
          title: `您已经听了好几遍了哦`,
          message: `是否喜欢该歌曲？`,
          type: "ask-for-like",
          duration: 0
        });
      }
    },
  },
  actions: {
    playSync({ commit, rootState }) {
      console.log("开始进度同步（一起听）");
      console.log("连接服务器...");

      const socket = io(`${window.location.protocol == 'https:' ? 'wss' : 'ws'}:${baseAPI}`, {
        reconnectionDelayMax: 10000,
        auth: {
          token: "123"
        },
        query: {
          "my-key": "my-value"
        },
        withCredentials: true,
        extraHeaders: {
          "vue_simple-music-player-token": "abcd"
        }
      });

      rootState._ws = socket;

      //  加入房间
      socket.on("connect", () => {
        console.log("已连接至服务器...");
        commit("setSignalColor", "green");
        socket.emit("join", {
          room: rootState._rid,
          uuid: rootState._account.uuid,
          username: rootState._account.username,
        });

        socket.on("message", (data) => {
          let { id, msg, time, type, from } = data;

          if (!rootState._chatContainerShow)
            commit("setMsg", {
              title: type,
              message: msg,
              duration: 3000
            });

          rootState._message.push({
            id,
            msg,
            time,
            type,
            from
          });

          nextTick(() => {
            document.querySelector(".message__wrapper .el-scrollbar__wrap").scrollTo({
              top: document.querySelector(".message__wrapper .el-scrollbar__view").offsetHeight,
              left: 0,
              behavior: "smooth"
            })
          });
        });

        socket.on("message-reply", (data) => {
          let { id, msg, time, type } = data;
          this.state._message.push({
            id,
            msg,
            time,
            type,
            uuid: rootState._account.uuid,
          });
          nextTick(() => {
            document.querySelector(".message__wrapper .el-scrollbar__wrap").scrollTo({
              top: document.querySelector(".message__wrapper .el-scrollbar__view").offsetHeight,
              left: 0,
              behavior: "smooth"
            })
          });
        });

        socket.on("room:addSong-reply", (data) => {
          let { id, time, type, username, uuid, addition } = data;
          rootState._message.push({ id, time, type, username, uuid, addition });
          nextTick(() => {
            document.querySelector(".message__wrapper .el-scrollbar__wrap").scrollTo({
              top: document.querySelector(".message__wrapper .el-scrollbar__view").offsetHeight,
              left: 0,
              behavior: "smooth"
            })
          });
        })

        socket.on("join", (data) => {
          console.log("已加入房间", data);
          let { id, msg, time, uuid, type, username } = data;
          rootState._message.push({
            id,
            msg,
            time,
            type,
            uuid,
            username
          });
        });

        socket.on("leave", (data) => {
          console.log("已离开房间", data);
        });

        socket.on("welcome", (data) => {
          let { id, msg, time, uuid } = data;

          commit("setRid", { rid: data.room, status: "connected" });
          console.log("欢迎", data);
          if (data.roomData) {
            commit("setStore", data.roomData);

            rootState._message.push({
              id,
              msg,
              time,
              type: "room:join",
              uuid,
            });

            rootState._account.uuid = data.uuid;

            if (data.roomData._play.isPlaying) {
              // 静音播放
              nextTick(() => {
                commit("goPlay", { desIndex: data.roomData._play.nowPlaying, needSync: false });
                document.getElementById("music").volume = 0;

                // 判断音乐是否加载完成
                let music = document.getElementById("music");
                let timer = setInterval(() => {
                  if (music.readyState == 4) {
                    clearInterval(timer);
                    console.log("音乐加载完成");

                    socket.emit("sync", {
                      action: "getLatest"
                    })

                    socket.on("sync", (data) => {
                      commit("goTime", { desTime: data.playTime, needSync: false })
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
                if (response._play.mode === "night")
                  document
                    .querySelector("body")
                    .setAttribute(
                      "style",
                      "background-color:var(--dark_main_color)"
                    );
                commit("setRid", { rid: null, status: "failed" });
              })
              .catch(function (error) {
                // 请求失败处理
                console.log(error);
              });
          }
        });

        socket.on("sync", (data) => {
          if (data.action == "getLatest") return
          console.log("同步", data);
          commit("setSignalColor", "received");
          commit(data.action, {
            needSync: false,
            ...data
          });
        });

        socket.on("ownerChange", (data) => {
          console.log("房主变更", data);
          if (data.owner == socket.id) {
            commit("setMsg", {
              title: `「一起听」`,
              message: `您已成为房主`,
              duration: 0
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
          } else {
            commit("setMsg", {
              message: rootState._play.message.content || `处于隐私安全，请手动播放`,
            });
          }
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
          commit("skipMusic", index);
          commit("next", { hasWrong: "wrong" })
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
      })
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
      return url.indexOf("cdn.weyoung.tech") == -1
    },

    // 返回当前播放模式
    getPlayMode(state) {
      if (state._playModeCount % 3 == 0) return "list";
      if (state._playModeCount % 3 == 1) return "cycle";
      if (state._playModeCount % 3 == 2) return "random";
    },

    // 获取下一首歌曲序号（用于倒数 30s 预载）
    getNextMusicIndex(state) {
      let desIndex = 0;

      // 若强制下一首则下一首
      // 即使处于单曲循环也进行下一首
      // 若处于随机状态则随机下一首

      switch (state._playModeCount % 3) {
        // 单曲循环
        case 0:
          if ((state._play.nowPlaying + 1) <= state._playList.length - 1) desIndex = state._play.nowPlaying + 1;
          break;
        // 随机播放
        case 1:
          desIndex = Math.floor(Math.random() * state._playList.length);
          break;
        // 列表循环
        case 2:
          if ((state._play.nowPlaying + 1) <= state._playList.length - 1) desIndex = state._play.nowPlaying + 1;
          break;
      }
      return desIndex;
    },

    // 获取是否命中「樱花」效果
    getSakuraModeByMusicName(state) {
      return state._playList[state._play.nowPlaying].name.indexOf("花") != -1
    },

    // 根据 musicId 获取 music 信息
    getMusicInfoById: (state) => (id) => {
      return state._playList.find((item) => item.id == id);
    },

    // 根据 musicId 获取 music 序号
    getMusicIndexById: (state) => (id) => {
      return state._playList.findIndex((item) => item.id == id);
    }
  },
  modules: {},
});
