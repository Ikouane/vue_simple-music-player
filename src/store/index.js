import {
  createStore
} from 'vuex'

export default createStore({
  state: {
    _success: false,
    _pid: "",
    _rid: "",
    _uuid: "",
    _ws: null,
    _play: {
      isPlaying: false,
      nowPlaying: 0,
      playTime: 0,
      mode: "day", //Or "night"
      nowPage: "PLAYING NOW", //Or "PLAYLIST", "musicLrc"
      msg: "数据请求中" //出于隐私保护，请手动播放
    },
    _playlist: [{
      musicId: "21687063",
      musicName: "Say Goodbye",
      musicAuthor: "S Club 7",
      musicImage: "https://cdn.weyoung.tech/vue_simple-music-player/S Club 7 - Say Goodbye.jpg",
      musicUrl: "https://cdn.weyoung.tech/vue_simple-music-player/S Club 7 - Say Goodbye.mp3",
      isLike: false
    }, {
      musicId: "416531370",
      musicName: "Good To Be Alive",
      musicAuthor: "Meghan Trainor",
      musicImage: "https://cdn.weyoung.tech/vue_simple-music-player/Meghan Trainor - Good To Be Alive.jpg",
      musicUrl: "https://cdn.weyoung.tech/vue_simple-music-player/Meghan Trainor - Good To Be Alive.mp3",
      isLike: false
    }, {
      musicId: "1358168845",
      musicName: "High Hopes",
      musicAuthor: "Gabriela Bee",
      musicImage: "https://cdn.weyoung.tech/vue_simple-music-player/Gabriela Bee - High Hopes.jpg",
      musicUrl: "https://cdn.weyoung.tech/vue_simple-music-player/Gabriela Bee - High Hopes.mp3",
      isLike: false
    }],
    example_array: [{
      mnusicId: "musicId",
      musicName: "MusicName",
      musicAuthor: "musicAuthor",
      musicImage: "url",
      musicUrl: "url",
      isLike: false,
    }]
  },
  mutations: {
    deepClone(obj = {}) {
      const _this = this;
      if (typeof obj !== 'object' || obj == null) //如果不为引用类型直接返回
      {
        return obj
      }
      let result
      if (obj instanceof Array) {
        result = []
      }
      if (obj instanceof Object) {
        result = {}
      }
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) { //如果为本身属性则递归调用，一步一步展开，再判断内容是值类型还是引用类型，直到遍历结束
          result[key] = _this.commit('deepClone', obj[key])
        } //若为从原型继承的属性就跳过
      }
      return result;
    },
    setStore(state, o_Play) {
      if (document.getElementById("music")) this.commit('pause');
      else console.log("音乐未加载，无须暂停")
      // state._play = {}
      // state._playlist = [
      state._play = o_Play._play
      state._playlist = o_Play._playlist
      if (state._play.mode === "night") document.querySelector('body').setAttribute('style', 'background-color:var(--dark_main_color)')
      else document.querySelector('body').setAttribute('style', 'background-color:var(--main_color)')
      // state._play = this.commit('deepClone', o_Play._play)
      // state._playlist = this.commit('deepClone', o_Play._playlist)
      // this.commit('clearMsg');
      // state._play.msg = "数据已更新";

      console.log("数据已更新");
    },
    pause(state) {
      state._play.isPlaying = false
      document.getElementById("music").pause();
      this.commit('clearMsg');
      state._play.msg = "音乐已暂停"
    },
    play(state) {
      if (state._play.playTime > 0) {
        document.getElementById('music').currentTime = state._play.playTime
      }
      state._play.isPlaying = true
      document.getElementById("music").play();
      this.commit('clearMsg');
      this.commit('updateTitle');
      state._play.msg = "音乐已播放"
    },
    musicFadeIn(state, needSync = true) {
      this.commit('play');
      if (needSync && state._ws) state._ws.send(JSON.stringify({
        type: 'cn',
        uuid: state._uuid,
        action: 'musicFadeIn'
      }));
      //document.getElementById("music").volume = 0;
      let v = document.getElementById("music").volume;
      let int = setInterval(() => {
        console.log("渐入");
        v += 0.1;
        if (v >= 1) {
          clearInterval(int);
        } else {
          document.getElementById("music").volume = v;
        }
      }, 100);
    },
    musicFadeOut(state, needSync = true) {
      if (needSync && state._ws) state._ws.send(JSON.stringify({
        type: 'cn',
        uuid: state._uuid,
        action: 'musicFadeOut'
      }));
      //document.getElementById("music").volume = 1;
      let v = document.getElementById("music").volume;
      v = 0.8;
      let int = setInterval(() => {
        console.log("渐出");
        v -= 0.1;
        if (v <= 0) {
          this.commit('pause');
          clearInterval(int);
        } else {
          document.getElementById("music").volume = v;
        }
      }, 100);
    },
    playSwitch(state) {
      if (state._play.isPlaying) {
        this.commit('pause');
      } else {
        this.commit('play');
      }
    },
    playSwitchFade(state) {
      if (state._play.isPlaying) {
        this.commit('musicFadeOut');
      } else {
        this.commit('musicFadeIn');
      }
    },
    updateTitle(state) {
      document.title = state._playlist[state._play.nowPlaying].musicName + " - " + state._playlist[state._play.nowPlaying].musicAuthor;
    },
    prev(state, needSync = true) {
      if (needSync && state._ws) state._ws.send(JSON.stringify({
        type: 'cn',
        uuid: state._uuid,
        action: 'prev'
      }));
      let v = document.getElementById("music").volume;
      let int = setInterval(() => {
        console.log("渐出");
        v -= 0.1;
        if (v <= 0) {
          state._play.isPlaying = false
          if ((state._play.nowPlaying -= 1) < 0) state._play.nowPlaying = state._playlist.length - 1
          state._play.isPlaying = true
          this.commit('updateTitle');
          let v2 = document.getElementById("music").volume;
          let int2 = setInterval(() => {
            console.log("渐入");
            v2 += 0.1;
            if (v2 >= 1) {
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

      // if ((state._play.nowPlaying -= 1) < 0) state._play.nowPlaying = state._playlist.length - 1
      // state._play.isPlaying = true
      this.commit('clearMsg');
    },
    next(state, hasWrong, needSync = true) {
      if (typeof hasWrong == 'object' && hasWrong.length === 2) {
        hasWrong = hasWrong[0]
        needSync = hasWrong[1]
      }

      if (needSync && state._ws) state._ws.send(JSON.stringify({
        type: 'cn',
        uuid: state._uuid,
        action: 'next',
        hasWrong
      }));
      let v = document.getElementById("music").volume;
      v = 0.8;
      let int = setInterval(() => {
        console.log("渐出");
        v -= 0.1;
        if (v <= 0) {
          state._play.isPlaying = false
          if ((state._play.nowPlaying += 1) > state._playlist.length - 1) state._play.nowPlaying = 0
          state._play.isPlaying = true
          this.commit('updateTitle');
          let v2 = document.getElementById("music").volume;
          let int2 = setInterval(() => {
            console.log("渐入");
            v2 += 0.1;
            if (v2 >= 1) {
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

      this.commit("clearMsg");

      if (hasWrong === "wrong") {
        state._play.msg = "播放出错，已为您跳过";
      }

      // if ((state._play.nowPlaying += 1) > state._playlist.length - 1) state._play.nowPlaying = 0
      // state._play.isPlaying = true

    },
    goPlay(state, desIndex, needSync = true) {
      if (typeof desIndex == 'object' && desIndex.length === 2) {
        desIndex = desIndex[0]
        needSync = desIndex[1]
      }

      if (needSync && state._ws) state._ws.send(JSON.stringify({
        type: 'cn',
        uuid: state._uuid,
        action: 'goPlay',
        desIndex
      }));

      let v = document.getElementById("music").volume;
      v = 0.8;
      let int = setInterval(() => {
        console.log("渐出");
        v -= 0.1;
        if (v <= 0) {
          state._play.isPlaying = false
          //this.commit('pause');
          state._play.nowPlaying = desIndex
          //this.commit('play');
          state._play.isPlaying = true
          this.commit('updateTitle');
          let v2 = document.getElementById("music").volume;
          let int2 = setInterval(() => {
            console.log("渐入");
            v2 += 0.1;
            if (v2 >= 1) {
              clearInterval(int2);
            } else {
              document.getElementById("music").volume = v2;
            }
          }, 100);
          clearInterval(int);
        } else {
          document.getElementById("music").volume = v;
        }
      }, 50);
      // state._play.isPlaying = false
      // state._play.nowPlaying = desIndex
      // state._play.isPlaying = true
      this.commit('clearMsg');
    },
    goTime(state, desTime, needSync = true) {
      if (typeof desTime == 'object' && desTime.length === 2) {
        desTime = desTime[0]
        needSync = desTime[1]
      }

      if (needSync && state._ws) state._ws.send(JSON.stringify({
        type: 'cn',
        uuid: state._uuid,
        action: 'goTime',
        desTime
      }));

      if (desTime < 0) {
        desTime = 0;
      } else if (desTime > document.getElementById("music").duration) {
        desTime = document.getElementById("music").duration
      }
      document.getElementById("music").currentTime = desTime;
      state._play.playTime = desTime;
      if (!state._play.isPlaying) document.getElementById("music").pause(); //当音乐没播放时，调整进度会直接播放音乐，已修复
    },
    addTime() {
      this.commit('goTime', document.getElementById("music").currentTime + 10);
    },
    minusTime() {
      this.commit('goTime', document.getElementById("music").currentTime - 10);
    },
    setTime(state, time) {
      state._play.playTime = time;
    },
    goList(state) {
      state._play.nowPage = "PLAYLIST"
    },
    goMain(state) {
      state._play.nowPage = "PLAYING NOW"
    },
    listSwitch(state) {
      if (state._play.nowPage === "PLAYING NOW")
        state._play.nowPage = "PLAYLIST"
      else state._play.nowPage = "PLAYING NOW"
    },
    modeSwitch(state, target, needSync = true) {
      if(typeof target == 'object' && target.length === 2) {
        target = target[0]
        needSync = target[1]
      }
      if (needSync && state._ws) state._ws.send(JSON.stringify({
        type: 'cn',
        uuid: state._uuid,
        action: 'modeSwitch',
        target
      }));

      if (target === "night" || target === "day") {
        state._play.mode = target
        if (state._play.mode === "day") {
          document.querySelector('body').setAttribute('style', 'background-color:var(--main_color)')
          state._play.msg = "已切换至日间模式"
        } else {
          state._play.msg = "已切换至夜间模式"
          document.querySelector('body').setAttribute('style', 'background-color:var(--dark_main_color)')
        }
      } else {
        if (state._play.mode === "day") {
          state._play.mode = "night"
          state._play.msg = "已切换至夜间模式"
          document.querySelector('body').setAttribute('style', 'background-color:var(--dark_main_color)')
        } else {
          document.querySelector('body').setAttribute('style', 'background-color:var(--main_color)')
          state._play.mode = "day"
          state._play.msg = "已切换至日间模式"
        }
      }
    },
    switchLike(state, needSync = true) {
      if (needSync && state._ws) state._ws.send(JSON.stringify({
        type: 'cn',
        uuid: state._uuid,
        action: 'switchLike'
      }));
      if (state._playlist[state._play.nowPlaying].isLike) {
        console.log("取消我喜欢")
        state._play.msg = "已移出我喜欢"
      } else {
        console.log("我喜欢")
        state._play.msg = "已添加至我喜欢"
      }
      state._playlist[state._play.nowPlaying].isLike = !state._playlist[state._play.nowPlaying].isLike
    },
    clearMsg(state) {
      state._play.msg = null
    },
    setMsg(state, message) {
      this.commit('clearMsg');
      state._play.msg = message;
    },
    addMore(state, o_PlayList) {
      state._playlist = state._playlist.concat(o_PlayList);
      this.commit("clearMsg");
      state._play.msg = "已加载更多歌曲";
    },
    setSuccess(state, isSuccess) {
      state._success = isSuccess;
    },
    setPid(state, dPid) {
      if (dPid) {
        state._pid = dPid;
        state._play.msg = `当前歌单编号为：${dPid}`;
      }
    },
    setLocal(state) {
      localStorage.setItem('vue_simple-music-player', JSON.stringify({
        _play: state._play,
        _playlist: state._playlist
      }));
    },
    getLocal() {
      let local = localStorage.getItem('vue_simple-music-player');
      if (local) {
        let _local = JSON.parse(local);
        _local._play.isPlaying = false
        this.commit('setStore', _local);
      }
    },
    setRid(state, dRid) {
      if (dRid) {
        state._rid = dRid;
        state._play.msg = `您已进入${dRid}房间`
      }
    }
  },
  actions: {
    playAsyc({commit, rootState}) {
      console.log("开始进度同步（一起听）")
        console.log("连接服务器...")
        var ws = new WebSocket('wss://api.weyoung.tech:23333/');
        rootState._ws = ws;
        ws.onopen = () => {
          console.log('已连接至服务器.')
          ws.send(JSON.stringify({
            user: 'ikouane',
            rid: rootState._rid
          }));
        }
        ws.onmessage = evt => {
          console.log(`收到服务器消息：${evt.data}`)
          const res = JSON.parse(evt.data);
          switch (res.type) {
            case 's1':
              rootState._uuid = res.uuid;
              ws.send(JSON.stringify({
                type:"c2",
                uuid: rootState._uuid,
                user: "ikouane",
                rid: rootState._rid
              }))
              break;
            case 's2':
              if (res.firstMan === "true") {
                console.log('发送播放数据.')
                ws.send(JSON.stringify({
                  type:"c3",
                  uuid: rootState._uuid,
                  play: rootState._play,
                  playlist: rootState._playlist,
                  method: 'post'
                }))
              } else {
                console.log("获取播放数据.")
                ws.send(JSON.stringify({
                  type:"c3",
                  uuid: rootState._uuid,
                  method: 'get'
                }))
              }
            break;
            case 'sMsg':  // 系统消息
            console.log(`[系统消息]: ${res.msg}`)
            commit('setMsg', res.msg)
              break;
            case 'mMsg':  // 我发出的消息
            console.log(`[用户消息]: ${res.msg}`)
              break;
            case 'uMsg':  // 用户消息
              console.log(`[用户消息]: ${res.msg}`)
              break;
            case 'roomPlaySyncPush':
              if (res.action === "setStore") {
                commit('setStore', res.data);
              }else if (res.action === "next") {
                commit('next', [res.hasWrong, false])
                commit('setMsg', `收到同步命令：下一首`)
              }else if (res.action === "modeSwitch") {
                commit('modeSwitch', [res.target, false])
                commit('setMsg', `收到同步命令：模式切换`)
              }else if (res.action === 'goTime') {
                commit('goTime', [res.desTime, false])
                commit('setMsg', `收到同步命令：进度调整`)
              }else if (res.action === 'goPlay') {
                commit('goPlay', [res.desIndex, false])
                commit('setMsg', `收到同步命令：歌曲切换`)
              }else if (res.action === "prev") {
                commit('setMsg', `收到同步命令：上一首`)
              }
              else commit(res.action, false);
              console.log("收到同步命令.")
              break;
            case 'roomPlaySyncMsg':
              console.log(`收到同步结果：${res.msg}`)
              break;
            default:
              break;
          }
        }
  
        ws.onclose = () => {
          console.log("与服务器断开连接.")
        }
    }
  },
  getters: {
    getContent(state) {
      return (state._playlist[state._play.nowPlaying].musicName +
        " - " +
        state._playlist[state._play.nowPlaying].musicAuthor)
    },
  },
  modules: {}
})