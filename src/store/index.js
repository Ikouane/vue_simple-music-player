import {
  createStore
} from 'vuex'

export default createStore({
  state: {
    _success: false,
    _play: {
      isPlaying: false,
      nowPlaying: 0,
      playTime: 0,
      mode: "day", //Or "night"
      nowPage: "PLAYING NOW", //Or "PLAYLIST", "musicLrc"
      msg: "数据请求中" //出于隐私保护，请手动播放
    },
    _playlist: [{
      musicName: "Say Goodbye",
      musicAuthor: "S Club 7",
      musicImage: "https://cdn.weyoung.tech/vue_simple-music-player/S Club 7 - Say Goodbye.jpg",
      musicUrl: "https://cdn.weyoung.tech/vue_simple-music-player/S Club 7 - Say Goodbye.mp3",
      isLike: false,
    }, {
      musicName: "Good To Be Alive",
      musicAuthor: "Meghan Trainor",
      musicImage: "https://cdn.weyoung.tech/vue_simple-music-player/Meghan Trainor - Good To Be Alive.jpg",
      musicUrl: "https://cdn.weyoung.tech/vue_simple-music-player/Meghan Trainor - Good To Be Alive.mp3",
      isLike: false,
    }, {
      musicName: "High Hopes",
      musicAuthor: "Gabriela Bee",
      musicImage: "https://cdn.weyoung.tech/vue_simple-music-player/Gabriela Bee - High Hopes.jpg",
      musicUrl: "https://cdn.weyoung.tech/vue_simple-music-player/Gabriela Bee - High Hopes.mp3",
      isLike: false,
    }],
    example_array: [{
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
      this.commit('pause');
      // state._play = {}
      // state._playlist = []
      state._play = o_Play._play
      state._playlist = o_Play._playlist
      if (state._play.mode === "night") document.querySelector('body').setAttribute('style', 'background-color:var(--dark_main_color)')

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
      state._play.isPlaying = true
      document.getElementById("music").play();
      this.commit('clearMsg');
      state._play.msg = "音乐已播放"
    },
    musicFadeIn() {
      this.commit('play');
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
    musicFadeOut() {
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
    prev(state) {
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
    next(state) {
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

      // if ((state._play.nowPlaying += 1) > state._playlist.length - 1) state._play.nowPlaying = 0
      // state._play.isPlaying = true
      this.commit('clearMsg');
    },
    goPlay(state, desIndex) {

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
    goTime(state, desTime) {

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
    modeSwitch(state) {
      if (state._play.mode === "day") {
        state._play.mode = "night"
        state._play.msg = "已切换至夜间模式"
        document.querySelector('body').setAttribute('style', 'background-color:var(--dark_main_color)')
      } else {
        document.querySelector('body').setAttribute('style', 'background-color:var(--main_color)')
        state._play.mode = "day"
        state._play.msg = "已切换至日间模式"
      }
    },
    switchLike(state) {
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
    addMore(state, o_PlayList) {
      state._playlist = state._playlist.concat(o_PlayList);
    },
    setSuccess(state, isSuccess) {
      state._success = isSuccess;
    }
  },
  actions: {},
  getters: {
    getContent(state) {
      return (state._playlist[state._play.nowPlaying].musicName +
        " - " +
        state._playlist[state._play.nowPlaying].musicAuthor)
    }
  },
  modules: {}
})