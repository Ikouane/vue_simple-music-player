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
    pause(state) {
      state._play.isPlaying = false
      document.getElementById("music").pause();
    },
    play(state) {
      state._play.isPlaying = true
      document.getElementById("music").play();
    },
    prev(state) {
      if ((state._play.nowPlaying -= 1) < 0) state._play.nowPlaying = state._playlist.length - 1
      state._play.isPlaying = true
    },
    next(state) {
      if ((state._play.nowPlaying += 1) > state._playlist.length - 1) state._play.nowPlaying = 0
      state._play.isPlaying = true
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
      state
    }
  },
  actions: {},
  modules: {}
})