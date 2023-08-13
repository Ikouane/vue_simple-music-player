<!--
 * @Author: ikouane
 * @PoweredBy: 未央宫©WeYounG
 * @Date: 2023-07-13 17:12:48
 * @LastEditTime: 2023-08-11 14:17:52
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
-->
<template>
  <!-- 遮罩层 -->
  <div class="popup-mask">
    <div class="popup">
      <i v-if="icon" class="icon" :class="icon"></i>
      <p class="title" v-if="title" v-html="formatString(title, '「一起听」')"></p>
      <p class="content">{{ content }}</p>
      <div class="button-wrapper" v-if="buttons.length">
        <button class="shine" @click="musicFadeIn" v-if="buttons?.includes('welcome-musicPlay')">
          <i class="fa fa-play"></i>
          立即播放
        </button>
        <button @click="emits('close-handler');" v-if="buttons?.includes('welcome-skip')">跳过</button>
        <button v-if="buttons.includes('tips-upgrade')">升级</button>
        <button v-if="buttons.includes('tips-fix')">修复</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { defineProps } from "vue";
import { useStore } from "vuex";
import { defineEmits } from "vue";
// 获取传入的参数
const props = defineProps({
  icon: String,
  title: String,
  time: Number,
  content: String,
  okMsg: String,
  cancelMsg: String,
  aod: {
    type: Boolean,
    default: false,
  },
  buttons: {
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(["close-handler"]);

const store = useStore();
const musicFadeIn = () => {
  store.commit("musicFadeIn");
  // setup 向父组件发送事件
  emits("close-handler");
};
console.log(props);

// 高亮显示关键字
const formatString = (str, keyword) => {
  if (!str) return "";
  const reg = new RegExp(keyword, "g");
  return str.replace(reg, `<span class="highlight heartbeat">${keyword}</span>`);
};
</script>
<style lang='scss' scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 6;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.22);
  backdrop-filter: saturate(120%) blur(4px);

  .dark & {
    background-color: rgba(0, 0, 0, 0.22);
  }

  .popup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 7;
    width: 80%;
    max-width: 300px;
    background-color: rgba(255, 255, 255, 0.72);
    backdrop-filter: saturate(180%) blur(10px);
    padding: 20px;
    border-radius: 20px;
    border: 1px solid var(--border_color);
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    color: var(--title_color);
    text-align: center;

    .icon {
      font-size: 26px;
      margin-bottom: 6px;

      &.upAnimation {
        animation: upAnimation 2s infinite both;

        @keyframes upAnimation {
          0% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-2px);
          }

          100% {
            transform: translateY(0);
          }
        }
      }

      &.rotate {
        animation: rotate 5s infinite both;

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }

          20% {
            transform: rotate(90deg);
          }

          40% {
            transform: rotate(180deg);
          }

          60% {
            transform: rotate(270deg);
          }

          80%,
          100% {
            transform: rotate(360deg);
          }
        }
      }
    }

    .dark & {
      background-color: rgba(0, 0, 0, 0.72);
    }

    &:deep .highlight {
      color: var(--active_color);

      &.heartbeat {
        animation: heartbeat 1.4s infinite both;
      }

      @keyframes heartbeat {

        0%,
        80%,
        100% {
          transform: scale(1);
        }

        20% {
          transform: scale(1.05);
          filter: brightness(1.1);
          opacity: 0.8;
        }

        40% {
          transform: scale(0.9);
        }

        55% {
          transform: scale(1.03);
        }
      }
    }

    .title {
      font-size: 15px;
      font-weight: bold;
      text-align: center;
      line-height: 200%;
      display: flex;
      justify-content: center;
      margin-bottom: 4px;
    }

    .content {
      font-size: 14px;
    }

    .button-wrapper {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 10px;

      button {
        padding: 8px 10px;
        border-radius: 8px;
        border: none;
        background-color: var(--active_color);
        color: white;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
        transition: .2s;
        overflow: hidden;

        &.shine {
          position: relative;
        }

        &.shine::after {
          position: absolute;
          content: '';
          display: block;
          width: 100px;
          height: 40px;
          background: linear-gradient(0deg, rgba(0, 0, 0, 0), rgba(255, 255, 255, .3), rgba(0, 0, 0, 0));
          left: 0;
          top: 0;
          transform: rotate(-45deg) translate(0, -100px);
          animation: 3s slide infinite;
        }

        @keyframes slide {
          0% {
            transform: rotate(-45deg) translate(0, -100px);
          }

          100% {
            transform: rotate(-45deg) translate(0, 100px);
          }
        }

        &:hover {
          opacity: .8;
        }

        svg {
          margin-right: 1px;
          transform: scale(0.8);
        }

        &:nth-child(2) {
          background-color: var(--player_color);
          color: var(--title_color);
        }
      }
    }
  }
}
</style>