<template>
  <div :class="'mplayer'+ (_play.mode === 'day'? '' : ' dark')">
    <Modal
      :title="_play.msg? '通知' : '正在播放'"
      :content="_play.msg || _playlist[_play.nowPlaying].musicName +
        ' - ' +
        _playlist[_play.nowPlaying].musicAuthor"
    />
    <AppBar />
    <MusicImage :size="_play.nowPage === 'PLAYLIST' ? 'small' : ''" />
    <!-- v-if="_play.nowPage === 'PLAYLIST'" -->
    <PlayList :slide="_play.nowPage === 'PLAYLIST' ? 'slide-up' : 'slide-down'" />
    <InfoBlock :show="_play.nowPage === 'PLAYING NOW'" />
    <PlayBar v-show="_play.nowPage === 'PLAYING NOW'" />
  </div>
</template>
<script>
import AppBar from "./AppBar";
import InfoBlock from "./MusicInfo";
import PlayBar from "./PlayBar";
import PlayList from "./PlayList";
import MusicImage from "./MusicImage";
import { mapState } from "vuex";
import Modal from "./Modal";
export default {
  name: "Main",
  // data() {
  //   return {
  //     title: String,
  //     msg: String,
  //   };
  // },
  components: {
    AppBar,
    InfoBlock,
    PlayBar,
    PlayList,
    MusicImage,
    Modal,
  },
  computed: {
    ...mapState(["_play", "_playlist"]),
  },
};
</script>
<style lang="scss" scoped>
.mplayer {
  width: 360px;
  background-color: var(--player_color);
  padding: 25px;
  border-radius: 36px;
  border: 2px solid white;
  height: 715px;
  overflow: hidden;
  position: relative;

  &.dark {
    background-color: var(--dark_player_color);
    border: 2px solid black;
  }
}
</style>