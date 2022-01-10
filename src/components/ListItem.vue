<!--
 * @Author: ikouane
 * @Date: 2020-10-18 22:23:21
 * @LastEditTime: 2022-01-10 15:19:20
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
-->
<template>
  <div
    class="list-card"
    :class="{ active, skip }"
    :data-index="listIndex"
    v-mouse-menu="{
      params: listIndex,
      ...options,
    }"
  >
    <div class="music-info">
      <span>{{ title }}</span>
      <span>{{ subTitle }}</span>
    </div>
    <Button
      size="small"
      title="移出播放列表"
      v-if="skip"
      active
      type="fas fa-times"
      :data-index="listIndex"
    />
    <!-- FIXME: 事件代理重写 -->
    <!-- :bindtap="removeMusic(listIndex)" -->
    <div v-else>
      <Button
        size="small"
        title="暂停"
        v-if="_play.isPlaying && _play.nowPlaying == listIndex"
        active
        type="fa fa-pause"
        :data-index="listIndex"
      />
      <!--  :bindtap="pause" :bindtap="play" 事件已代理-->
      <Button
        size="small"
        title="播放"
        v-else
        active
        type="fa fa-play"
        :data-index="listIndex"
      />
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations } from "vuex";
import Button from "./Button";
import { MouseMenuDirective } from "@howdyjs/mouse-menu";
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
    skip: {
      type: Boolean,
      default: false,
    },
    listIndex: Number,
  },
  computed: {
    ...mapState(["_play", "_playlist"]),
  },
  methods: {
    ...mapMutations(["play", "pause", "removeMusic", "shareSingleMusic"]), //B,使用时间代理（冒泡）由父元素处理
  },
  directives: {
    MouseMenu: MouseMenuDirective,
  },
  setup() {
    return {
      isMobile: "ontouchstart" in window,
      options: {
        useLongPressInMobile: true,
        menuList: [
          {
            label: "分享",
            tips: "Share This Song",
            fn: (params, currentEl, bindingEl, e) =>
              console.log("share", params, currentEl, bindingEl, e),
          },
          {
            label: "精准空降",
            tips: "Share This Moment",
            fn: (params, currentEl, bindingEl, e) =>
              console.log("share this moment", params, currentEl, bindingEl, e),
          },
          // {
          //   label: "删除",
          //   tips: "Delete",
          //   fn: (params, currentEl, bindingEl, e) =>
          //     console.log("delete", params, currentEl, bindingEl, e),
          // },
          // {
          //   label: "重命名",
          //   tips: "Rename",
          //   fn: (params, currentEl, bindingEl, e) =>
          //     console.log("rename", params, currentEl, bindingEl, e),
          // },
        ],
      },
    };
  },
};
</script>
<style lang='scss' scoped>
.list-card {
  @media (max-width: 768px) {
    width: 100%;
  }

  display: flex;
  width: 356px; //100%
  padding: 10px;
  box-sizing: border-box;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 5px;
  border-radius: 5px;

  cursor: pointer;

  //Feature text-shadow: 0 0 1px #ccc;

  &.active {
    background-color: rgba(#84a4ff, 0.1);
    box-shadow: 0 0 1px 2px rgba(0, 0, 0, 0.01) inset;
    border-radius: 10px;

    .dark & {
      background-color: rgba(0, 0, 0, 0.2);
    }
  }

  &.skip {
    cursor: not-allowed;
    filter: grayscale(1);

    .dark & {
    }
  }

  .music-info {
    display: flex;
    flex-direction: column;
    padding: 5px;
    font-size: 14px;
    pointer-events: none;
    line-height: 20px;

    & span:nth-child(1) {
      color: var(--title_color);
      font-weight: bold;
      margin-bottom: 3px;
    }

    & span:nth-child(2) {
      color: var(--text_color);
    }
  }
}
</style>