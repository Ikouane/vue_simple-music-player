<template>
  <div class="player-bottom">
    <Button size="large" title="上一首" type="fa-backward" />
    <Button size="large" title="暂停" active type="fa-pause" bindtap="play()" id="pauseButton" />
    <Button size="large" title="播放" active type="fa-play" bindtap="play()" id="playButton" />
    <Button size="large" title="下一首" type="fa-forward" />
  </div>
</template>
<script>
import Button from "./Button";
export default {
  name: "PalyBar",
  components: {
    Button,
  },
};
</script>
<style lang="scss" scoped>
.player-bottom {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40px;
}
</style>