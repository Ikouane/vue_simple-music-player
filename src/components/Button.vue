<template>
  <div :class="'player-button ' + size" :title="title" @click="bindtap">
    <i :class="'fa '+ type" aria-hidden="true"></i>
  </div>
</template>
<script>
export default {
  name: "Button",
  props: {
    size: String,
    title: String,
    bindtap: {
      type: Function,
      default: function () {},
    },
    type: String,
    active: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style lang="scss" scoped>
@import url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css);

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

.player-button {
  border-radius: 50px;
  background: linear-gradient(145deg, #f9ffff, #d2d9e3);
  border: 2px solid $border_color;
  box-shadow: 6px 6px 12px #c6cdd6, -6px -6px 12px #ffffff;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;

  &.dark {
    border: 2px solid $dark_border_color;
    background: linear-gradient(145deg, #2a2e33, #23272b);
    box-shadow: 5px 5px 10px #212529, -5px -5px 10px #2d3137;
  }
  &.small {
    height: 30px;
    width: 30px;
    box-shadow: 2px 2px 4px #c6cdd6, -2px -2px 4px #ffffff;

    i {
      transform: scale(0.66);
    }
  }

  &.middle {
    height: 45px;
    width: 45px;

    i {
      transform: scale(0.88);
    }
  }

  &.large {
    height: 60px;
    width: 60px;
  }

  &:hover {
    background: var(--active_color) !important;
    box-shadow: clear;
    border: 2px solid var(--active_color);
    box-shadow: inset 6px 6px 12px #708bd9, inset -6px -6px 12px #98bdff;

    i {
      color: white;
    }
  }

  i {
    color: $text_color;
    pointer-events: none; //点击穿透
  }
}
</style>