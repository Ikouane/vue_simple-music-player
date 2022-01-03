<template>
  <div class="container" v-if="isShow">
    <p class="title">{{ title }}</p>
    <p class="content" v-if="content">{{ content }}</p>
    <div id="qrcode"></div>
    <!-- 创建一个div，并设置id为qrcode -->
    <button class="button" @click="$emit('share-room')">确认</button>
  </div>
</template>
<script>
import { onMounted, ref } from "vue";
import QRCode from "qrcodejs2";
export default {
  name: "MessageBox",
  props: {
    title: {
      type: String,
      default: "提示",
    },
    content: {
      type: String,
      default: "",
    },
    qrText: {
      type: String,
      default: "",
    },
    boxShow: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    let isShow = ref(props.boxShow);

    const hideBox = () => {
      console.log("关闭弹窗");
      if (isShow.value) isShow.value = !isShow.value;
    };

    const showBox = () => {
      if (!isShow.value) isShow.value = !isShow.value;
    };

    onMounted(() => {
      document.getElementById("qrcode").innerHTML = "";
      if (isShow.value)
        new QRCode("qrcode", {
          width: 175,
          height: 175,
          text: props.qrText,
        });
    });

    return {
      hideBox,
      showBox,
      isShow,
    };
  },
};
</script>
<style lang='scss' scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.container {
  position: fixed;
  box-sizing: border-box;
  width: 200px;
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  z-index: 999;
  border-radius: 10px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 10px;
  overflow: hidden;
  color: var(--title_color);

  .dark & {
    background-color: rgba(0, 0, 0, 0.72);
    color: white;

    .button {
      background-color: rgba(0, 0, 0, 0.72);
      color: white;

      &:hover {
        background-color: var(--dark_active_color);
      }
    }
  }

  .title {
    font-size: 1.4em; // em 相对于父元素
    font-weight: bold;
    margin: 15px 0 5px 0;
    padding: 0 5px;
  }

  .content {
    font-size: 1.2em;
    margin: 5px 0 10px 0;
    padding: 0 5px;
  }

  .button {
    font-size: 1.2em;
    margin: 0;
    border: none;
    width: 100%;
    line-height: 3em;
    outline: none;
    background-color: rgba(255, 255, 255, 0.72);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      font-weight: bold;
      background-color: var(--active_color);
      color: white;
    }
  }

  #qrcode {
    padding: 10px 0;
    width: 100%;
    display: flex;
    justify-content: center;
    background: #fff;
  }
}
</style>