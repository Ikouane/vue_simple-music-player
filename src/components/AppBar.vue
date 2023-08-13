<!--
 * @Author: ikouane
 * @Date: 2020-10-18 22:23:21
 * @LastEditTime: 2023-08-11 13:56:29
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
-->
<template>
  <div class="appbar">
    <div class="top_more" @click="$emit('more-click-action')">...</div>
    <Button size="middle" title="切换主题" :bindtap="modeSwitch" type="fa fa-paint-brush" />
    <div class="title" :class="{
      signal_icon: _rid !== null && _play.nowPage != 'PLAYLIST',
      green: _signalColor === 'green',
      yellow: _signalColor === 'yellow',
      red: _signalColor === 'red',
    }" title="正在播放" @click="if (_rid) $emit('rid-click-action');">
      {{
          _rid === null
          ? _play.nowPage
          : _play.nowPage === "PLAYING NOW"
            ? "PLAYING TOGETHER"
            : "PLAYLIST"
      }}
    </div>
    <Button size="middle" title="播放列表" :bindtap="listSwitch" type="fa fa-bars" />
  </div>
</template>
<script>
import Button from "./Button";
import "@/assets/index.css";
import { mapState, mapMutations } from "vuex";
export default {
  name: "AppBar",
  components: {
    Button,
  },
  computed: {
    ...mapState(["_play", "_rid", "_signalColor"]),
  },
  methods: {
    ...mapMutations(["listSwitch", "modeSwitch"]),
  },
};
</script>
<style lang="scss" scoped>
.appbar {
  display: flex;
  justify-content: space-between;
  text-align: center;
  align-items: center;
  margin-bottom: 40px;
  color: var(--title_color);
  font-size: var(--text_size);

  .top_more {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%);
    letter-spacing: 2px;
    cursor: pointer;
  }

  .title {
    font-size: var(--time_size);
    font-weight: bold;
    color: var(--text_color);
    cursor: pointer;
    user-select: none;
    position: relative;

    &.signal_icon::before {
      position: absolute;
      left: -10px;
      content: "";
      width: 6px;
      height: 6px;
      border-radius: 50%;
      top: 50%;
      transform: translateY(-50%);
      transition: .2s;
    }

    &.green::before {
      background-color: #2ecc71;
    }

    &.yellow::before {
      background-color: #f1c40f;
    }

    &.red::before {
      background-color: #e74c3c;
    }
  }
}
</style>