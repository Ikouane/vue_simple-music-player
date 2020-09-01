<template>
  <div :class="'flexbox ' + size">
    <Button
      v-if="size === 'small'"
      size="middle"
      title="我喜欢"
      :bindtap="switchLike"
      type="fa-heart"
      :active="_playlist[_play.nowPlaying].isLike"
    />
    <div :class="'music-image ' + size">
      <img
        :class="'middle-image playing ' + size"
        :src="_playlist[_play.nowPlaying].musicImage"
        alt="图片加载失败"
        :style="{webkitAnimationPlayState : (_play.isPlaying ? 'running':'paused')}"
      />
    </div>
    <Button v-if="size === 'small'" size="middle" title="更多" type="fa-ellipsis-h" />
  </div>
</template>
<script>
import Button from "./Button";
import { mapState, mapMutations } from "vuex";
export default {
  name: "MusicImage",
  components: {
    Button,
  },
  props: {
    size: {
      type: String,
      default: "",
    },
  },
  computed: mapState(["_play", "_playlist"]),
  methods: {
    ...mapMutations(["switchLike"]),
  },
};
</script>
<style lang='scss' scoped>
$title_color: var(--title_color);
$text_color: var(--text_color);
$main_color: var(--main_color);
$player_color: var(--player_color);
$border_color: var(--border_color);
$active_color: var(--active_color);
$title_size: 30px;
$text_size: 16px;
$time_size: 12px;

$dark_main_color: var(--dark_main_color);
$dark_player_color: var(--dark_player_color);
$dark_active_color: var(--dark_active_color);
$dark_title_color: var(--dark_title_color);
$dark_text_color: var(--dark_text_color);
$dark_border_color: var(--dark_border_color);
.flexbox {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;

  &.small {
    margin-bottom: 40px;
  }
  // * {
  //   float: left;
  // }

  // &.clearfix::after {
  //   content: "";
  //   display: block; //or table
  //   clear: both;
  // }
}

.music-image {
  margin: auto;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  box-shadow: 20px 20px 24px #b6bcc5, -20px -20px 24px #ffffff;
  margin-bottom: 40px;
  transition: 0.3s all ease-in-out;

  &.small {
    margin: auto;
    width: 150px;
    height: 150px;
    box-shadow: 12px 12px 16px #b6bcc5, -12px -12px 16px #ffffff;
  }

  .dark & {
    border: clear;
    box-shadow: clear;
    box-shadow: 20px 20px 20px #1d2024, -20px -20px 20px #2d3036;
  }

  .middle-image {
    width: 250px;
    height: 250px;
    object-fit: cover;
    border-radius: 50%;
    border: 6px solid $player_color;
    background: linear-gradient(145deg, #f9ffff, #d2d9e3);
    transition: 0.3s all ease-in-out;

    &.small {
      width: 150px;
      height: 150px;
      border: 4px solid $player_color;
    }

    .dark & {
      border: clear;
      box-shadow: clear;
      border: 6px solid var(--dark_player_color);
    }

    &.playing {
      box-shadow: clear;
      /*css3动画无限制的旋转*/
      -webkit-animation: music_disc 40s linear infinite;
      animation: music_disc 40s linear infinite;
    }
    /*css3动画的旋转*/
    @keyframes music_disc {
      0% {
        -webkit-transform: rotate(0deg);
        -ms-transform: rotate(0deg);
        -o-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        -ms-transform: rotate(360deg);
        -o-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
    @-webkit-keyframes music_disc {
      0% {
        -webkit-transform: rotate(0deg);
        -ms-transform: rotate(0deg);
        -o-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        -ms-transform: rotate(360deg);
        -o-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
  }
}
</style>