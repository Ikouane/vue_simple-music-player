import {
  createStore
} from 'vuex'

export default createStore({
  state: {
    _play: {
      isPlaying: true,
      nowPlaying: 0,
      playTime: 0,
      mode: "day", //Or "night"
      nowPage: "PLAYING NOW", //Or "PLAYLIST", "musicLrc"
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
    // setStore(state, o_Play) {
    //   state._play = {}
    //   state._playlist = []
    //   state._play = this.commit('deepClone', o_Play._play)
    //   state._playlist = this.commit('deepClone', o_Play._playlist)
    // },
    pause(state) {
      state._play.isPlaying = false
      document.getElementById("music").pause();
    },
    play(state) {
      state._play.isPlaying = true
      document.getElementById("music").play();
    },
    playSwitch(state) {
      if (state._play.isPlaying) {
        state._play.isPlaying = false
        document.getElementById("music").pause();
      } else {
        state._play.isPlaying = true
        document.getElementById("music").play();
      }
    },
    prev(state) {
      if ((state._play.nowPlaying -= 1) < 0) state._play.nowPlaying = state._playlist.length - 1
      state._play.isPlaying = true
    },
    next(state) {
      if ((state._play.nowPlaying += 1) > state._playlist.length - 1) state._play.nowPlaying = 0
      state._play.isPlaying = true
    },
    goPlay(state, desIndex) {
      // state._play.isPlaying = false
      state._play.nowPlaying = desIndex
    },
    goTime(state, desTime) {
      document.getElementById("music").currentTime = desTime;
      state._play.playTime = desTime;
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
        document.querySelector('body').setAttribute('style', 'background-color:var(--dark_main_color)')
      } else {
        document.querySelector('body').setAttribute('style', 'background-color:var(--main_color)')
        state._play.mode = "day"
      }
    }
  },
  actions: {},
  modules: {}
})