<template>
  <div class="mplayer">
    <AppBar />
    <InfoBlock />
    <PlayBar />
    <Button />
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
import Button from "./Button";
export default {
  name: "Main",
  components: {
    AppBar,
    InfoBlock,
    PlayBar,
    Button,
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
}
</style>