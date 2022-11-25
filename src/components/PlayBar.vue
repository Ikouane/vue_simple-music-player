<!--
 * @Author: ikouane
 * @Date: 2020-10-18 22:23:21
 * @LastEditTime: 2022-11-25 14:56:20
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
-->
<template>
  <div class="player-bottom" :class="{ mini: _miniMode }">
    <Button :disabled="_playlist.length <= 1" :size="_miniMode ? 'small' : 'large'" title="上一首(↑)" type="fa fa-backward"
      :bindtap="prev" />
    <Button :size="_miniMode ? 'small' : 'large'" title="暂停(空格)" v-if="_play.isPlaying" active type="fa fa-pause"
      :bindtap="musicFadeOut" id="pauseButton" />
    <Button :size="_miniMode ? 'small' : 'large'" title="播放(空格)" v-else active type="fa fa-play" :bindtap="musicFadeIn"
      id="playButton" />
    <Button :disabled="_playlist.length <= 1" :size="_miniMode ? 'small' : 'large'" title="下一首(↓)" type="fa fa-forward"
      :bindtap="forceNext" />
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
    "_miniMode"
  ]),
  methods: {
    ...mapMutations([
      "play",
      "pause",
      "prev",
      "next",
      "musicFadeIn",
      "musicFadeOut",
    ]),
    forceNext() {
      this.next({ isForce: true });
    }
  },
};
</script>
<style lang="scss" scoped>
.player-bottom {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40px;

  &.mini {
    margin-bottom: 0;
  }
}
</style>