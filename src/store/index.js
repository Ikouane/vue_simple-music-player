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
      nowPage: "play", //Or "playlist", "musicLrc"
    },
    _playlist: [{
      musicName: "Say Goodbye",
      musicAuthor: "S Club 7",
      musicImage: "url",
      musicUrl: "url",
      isLike: false,
    }, {
      musicName: "Good To Be Alive",
      musicAuthor: "Meghan Trainor",
      musicImage: "url",
      musicUrl: "url",
      isLike: false,
    }, {
      musicName: "High Hopes",
      musicAuthor: "Gabriela Bee",
      musicImage: "url",
      musicUrl: "url",
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
    },
    play(state) {
      state._play.isPlaying = true
    },
    prev(state) {
      if ((state._play.nowPlaying -= 1) < 0) state._play.nowPlaying = state._playlist.length - 1
      state._play.isPlaying = true
    },
    next(state) {
      if ((state._play.nowPlaying += 1) > state._playlist.length - 1) state._play.nowPlaying = 0
      state._play.isPlaying = true
    },
  },
  actions: {},
  modules: {}
})