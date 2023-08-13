<template>
  <div class="player-button" :class="{
    active,
    disabled,
    small: size == 'small',
    middle: size == 'middle',
    large: size == 'large',
  }" :title="title" @click="handelClick">
    <i :class="type" aria-hidden="true"></i>
  </div>
</template>
<script>
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all";
export default {
  name: "Button",
  props: {
    size: String,
    title: String,
    bindtap: {
      type: Function,
      default: function () { },
    },
    type: String,
    active: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handelClick() {
      if (!this.disabled) this.bindtap();
    },
  },
};
</script>
<style lang="scss" scoped>
.player-button {
  border-radius: 50px;
  background: linear-gradient(145deg, #f9ffff, #d2d9e3);
  border: 2px solid var(--border_color);
  box-shadow: 6px 6px 12px #c6cdd6, -6px -6px 12px #ffffff;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  outline: none;
  font-size: 16px;

  &.disabled {
    cursor: not-allowed;
    filter: grayscale(1);
  }

  .dark & {
    background: linear-gradient(145deg, #2a2e33, #23272b);
    box-shadow: 5px 5px 10px #212529, -5px -5px 10px #2d3137;

    &.middle {
      box-shadow: 3px 3px 6px #212529, -3px -3px 6px #2d3137;
    }

    &.small {
      box-shadow: 2px 2px 4px #212529, -2px -2px 4px #2d3137;
    }

    &:not(.disabled) {

      &:hover,
      &.active {
        box-shadow: none;
        box-shadow: inset 6px 6px 12px #c9460e, inset -6px -6px 12px #ff5e12;
      }
    }
  }

  .pink & {
    background: linear-gradient(145deg, #ffebf3, #f7f0f4);
    box-shadow: 5px 5px 20px #f9e7f0, -5px -5px 15px #ffffff;

    &.small {
      box-shadow: 2px 2px 8px #f9e7f0, -2px -2px 6px #ffffff;
    }

    &:not(.disabled) {

      &:hover,
      &.active {
        box-shadow: none;
        border: 2px solid var(--pink_active_color);
        box-shadow: inset 6px 6px 12px #eda6c8, inset -6px -6px 12px #f4c0da;
      }
    }
  }

  &.small {
    height: 30px;
    width: 30px;
    box-shadow: 2px 2px 4px #c6cdd6, -2px -2px 4px #ffffff;

    svg {
      transform: scale(0.66);
    }
  }

  &.middle {
    height: 45px;
    width: 45px;

    svg {
      transform: scale(0.88);
    }
  }

  &.large {
    height: 60px;
    width: 60px;
  }

  &:not(.disabled) {

    &:hover,
    &.active {
      background: var(--active_color) !important;
      box-shadow: none;
      border: 2px solid var(--active_color);
      box-shadow: inset 6px 6px 12px #708bd9, inset -6px -6px 12px #98bdff;

      svg {
        color: white;
      }
    }
  }

  svg {
    color: var(--text_color);
    pointer-events: none; //点击穿透
  }
}
</style>