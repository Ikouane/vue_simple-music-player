<template>
  <div :class="'mplayer'+ (_play.mode === 'day'? '' : ' dark')">
    <AppBar />
    <PlayList v-if="_play.nowPage === 'PLAYLIST'" />
    <InfoBlock :show="_play.nowPage === 'PLAYING NOW'" />
    <PlayBar v-show="_play.nowPage === 'PLAYING NOW'" />

    <!-- <Button /> -->
    <!-- <div class="player-button player large active" title="暂停" id="pauseButton" onclick="play()">
      <i class="fa fa-pause" aria-hidden="true"></i>
    </div>
    <div class="player-button player large" title="播放" onclick="play()">
      <i class="fa fa-play" aria-hidden="true"></i>
    </div>
    <div class="player-button large" title="下一首">
      <i class="fa fa-forward" aria-hidden="true"></i>
    </div>-->
  </div>
</template>
<script>
import AppBar from "./AppBar";
import InfoBlock from "./MusicInfo";
import PlayBar from "./PlayBar";
import PlayList from "./PlayList";
// import Button from "./Button";
import { mapState } from "vuex";
export default {
  name: "Main",
  components: {
    AppBar,
    InfoBlock,
    PlayBar,
    PlayList,
    // Button,
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