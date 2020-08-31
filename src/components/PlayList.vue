<template>
  <ListItem
    v-for="(item, i) in _playlist"
    v-bind:key="i"
    :title="item.musicName"
    :subTitle="item.musicAuthor"
    :active="i === _play.nowPlaying"
  />
  <!-- <ListItem title="歌曲标题" subTitle="歌曲歌手" /> -->
</template>
<script>
import ListItem from "./ListItem";
import { mapState } from "vuex";
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
};
</script>
<style lang='scss' scoped>
</style>