<template>
  <div class="player-bottom">
    <Button size="large" title="上一首" type="fa-backward" :bindtap="prev" />
    <Button
      size="large"
      title="暂停"
      v-if="_play.isPlaying"
      active
      type="fa-pause"
      :bindtap="pause"
      id="pauseButton"
    />
    <Button size="large" title="播放" v-else active type="fa-play" :bindtap="play" id="playButton" />
    <Button size="large" title="下一首" type="fa-forward" :bindtap="next" />
  </div>
</template>
<script>
import Button from "./Button";
import { mapState } from "vuex";
import { mapMutations } from "vuex";
export default {
  name: "PlayBar",
  components: {
    Button,
  },
  computed: mapState([
    // 映射 this.isPlaying 为 store.state.isPlaying
    "_play",
    "_playlist",
  ]),
  methods: {
    ...mapMutations(["play", "pause", "prev", "next"]),
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