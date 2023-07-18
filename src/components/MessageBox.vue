<template>
  <div v-if="isShow" class="mask" @click.self="$emit('click-action')">
    <div class="container">
      <p class="title">{{ title }}</p>
      <template v-if="type != 'more'">
        <p class="content" v-if="content">{{ content }}</p>
        <div id="qrcode"></div>
        <button class="button" @click="$emit('click-action')">确认</button>
      </template>
      <div class="flex__wrapper" v-else>
        <Button size="middle" title="发送消息" :bindtap="showSendMessageBox" type="fa fa-paper-plane" />
        <Button size="middle" title="登录" :bindtap="showLoginBox" type="fa fa-user" />
        <Button v-if="iconType == 'fa fa-list'" type="fa fa-list" size="middle" :title="playMode"
          :bindtap="switchPlayMode" />
        <Button v-if="iconType == 'fa fa-repeat'" type="fas fa-redo" size="middle" :title="playMode"
          :bindtap="switchPlayMode" />
        <Button v-if="iconType == 'fa fa-random'" type="fa fa-random" size="middle" :title="playMode"
          :bindtap="switchPlayMode" />
      </div>
    </div>
  </div>
</template>
<script>
import { onMounted, ref } from "vue";
import QRCode from "qrcodejs2";
import Button from "./Button.vue";
import { useStore } from "vuex";
import { computed } from "@vue/reactivity";

export default {
  name: "MessageBox",
  components: {
    Button,
  },
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
    type: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    let isShow = ref(props.boxShow);

    const store = useStore();

    const playMode = computed(() => {
      return store.getters.getPlayMode
    });

    const iconType = ref("fa fa-list");

    const judgeIconType = () => {
      switch (playMode.value) {
        case "list":
          iconType.value = "fa fa-list";
          break;
        case "cycle":
          iconType.value = "fa fa-repeat";
          break;
        case "random":
          iconType.value = "fa fa-random";
          break;
      }
    }

    const hideBox = () => {
      console.log("关闭弹窗");
      if (isShow.value) isShow.value = !isShow.value;
    };

    const showBox = () => {
      if (!isShow.value) isShow.value = !isShow.value;
    };

    const showSendMessageBox = () => {
      console.log("显示发送消息弹窗");
      emit("click-chat");
    };

    const showLoginBox = () => {
      console.log("跳转登录二维码页面");
      window.open("qrlogin.html");
    };

    const switchPlayMode = () => {
      store.commit("addPlayMode");
      console.log("切换到播放模式", playMode.value);

      judgeIconType();
    }

    onMounted(() => {
      if (props.qrText) {
        document.getElementById("qrcode").innerHTML = "";
        if (isShow.value)
          new QRCode("qrcode", {
            width: 175,
            height: 175,
            text: props.qrText,
          });
      }

      judgeIconType();
    });

    return {
      hideBox,
      showBox,
      isShow,
      showSendMessageBox,
      showLoginBox,
      switchPlayMode,
      playMode,
      iconType
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

.mask {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.container {
  position: fixed;
  box-sizing: border-box;
  width: 200px;
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  z-index: 3;
  border-radius: 10px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 10px;
  overflow: hidden;
  color: var(--title_color);
  padding: 0 10px 10px 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);

  .dark & {
    background-color: rgba(0, 0, 0, 0.72);
    color: white;

    .button {
      background-color: rgba(0, 0, 0, 0.72);
      color: var(--dark_active_color);

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

  .flex__wrapper {
    display: flex;
    justify-content: space-around;
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
    border-radius: 0 0 6px 6px;
    overflow: hidden;
    color: var(--active_color);
    font-weight: bold;

    &:hover {
      background-color: var(--active_color);
      color: white;
    }
  }

  #qrcode {
    padding: 10px;
    width: 100%;
    display: flex;
    justify-content: center;
    background: #fff;
    aspect-ratio: 1;
  }
}
</style>