<template>
  <div @click="handelClick($event)">
    <ListItem
      v-for="(item, i) in _playlist"
      v-bind:key="i"
      :title="item.musicName"
      :subTitle="item.musicAuthor"
      :active="i === _play.nowPlaying"
      :listIndex="i"
    />
  </div>
  <!-- <ListItem title="歌曲标题" subTitle="歌曲歌手" /> -->
</template>
<script>
import ListItem from "./ListItem";
import { mapState, mapMutations } from "vuex";
export default {
  name: "PlayList",
  props: {
    show: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapState(["_play", "_playlist"]),
  },
  components: {
    ListItem,
  },
  methods: {
    ...mapMutations(["playSwitch", "goPlay"]),
    handelClick(e) {
      let index = parseInt(e.target.getAttribute("data-index"));
      console.log(index);
      if (this._play.nowPlaying === index) {
        //当点击的是当前的音乐时切换播放状态
        this.playSwitch();
      } else {
        this.goPlay(index);
      }
    },
  },
};
</script>
<style lang='scss' scoped>
</style>