<!--
 * @Author: ikouane
 * @PoweredBy: 未央宫©WeYounG
 * @Date: 2023-07-13 17:12:48
 * @LastEditTime: 2023-07-17 16:16:31
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
-->
<template>
  <!-- 遮罩层 -->
  <div class="popup-mask">
    <div class="popup">
      <p class="title" v-html="formatString(title, '「一起听」')"></p>
      <p class="content">{{ content }}</p>
      <div class="button-wrapper">
        <button @click="musicFadeIn">
          <i class="fa fa-play"></i>
          立即播放
        </button>
        <button @click="emits('close-handler');">跳过</button>
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
  return str.replace(reg, `<span class="highlight">${keyword}</span>`);
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

    .dark & {
      background-color: rgba(0, 0, 0, 0.72);
      color: var(--dark_title_color);
      border-color: var(--dark_border_color);
    }

    &::v-deep .highlight {
      color: var(--active_color);

      .dark & {
        color: var(--dark_active_color);
      }
    }

    .title {
      font-size: 15px;
      font-weight: bold;
      text-align: center;
      line-height: 200%;
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

        .dark & {
          background-color: var(--dark_active_color);
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

          .dark & {
            background-color: var(--dark_player_color);
            color: var(--dark_title_color);
          }
        }
      }
    }
  }
}
</style>