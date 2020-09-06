<template>
  <div :class="'list-card' + (active ? ' active' : '')" :data-index="listIndex">
    <div class="music-info">
      <span>{{title}}</span>
      <span>{{subTitle}}</span>
    </div>
    <Button
      size="small"
      title="暂停"
      v-if="_play.isPlaying && _play.nowPlaying == listIndex"
      active
      type="fa-pause"
      :data-index="listIndex"
    />
    <!--  :bindtap="pause" :bindtap="play" 事件已代理-->
    <Button size="small" title="播放" v-else active type="fa-play" :data-index="listIndex" />
  </div>
</template>
<script>
import { mapState, mapMutations } from "vuex";
import Button from "./Button";
export default {
  name: "ListItem",
  components: {
    Button,
  },
  props: {
    title: String,
    subTitle: String,
    active: {
      type: Boolean,
      default: false,
    },
    listIndex: Number,
  },
  computed: {
    ...mapState(["_play", "_playlist"]),
  },
  methods: {
    ...mapMutations(["play", "pause"]), //B,使用时间代理（冒泡）由父元素处理
  },
};
</script>
<style lang='scss' scoped>
.list-card {
  display: flex;
  width: 356px; //100%
  padding: 10px;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 5px;
  border-radius: 5px;

  cursor: pointer;

  &.active {
    background-color: rgba(#84a4ff, 0.1);
    box-shadow: 0 0 1px 2px rgba(0, 0, 0, 0.01) inset;
    border-radius: 10px;

    .dark & {
      background-color: rgba(0, 0, 0, 0.2);
    }
  }

  .music-info {
    display: flex;
    flex-direction: column;
    padding: 5px;
    font-size: 14px;
    pointer-events: none;

    & span:nth-child(1) {
      color: var(--title_color);
    }

    & span:nth-child(2) {
      color: var(--text_color);
    }
  }
}
</style>