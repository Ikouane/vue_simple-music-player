<template>
  <div class="modal" :class="{
    modalShow: isShow,
    modalHide: !isShow,
    dark: _play.mode === 'night',
    mini: _miniMode
  }" @click=" handleClose">
    <label v-if="!_miniMode" class="modal-title">{{ title }}</label>
    <div class="modal-content">{{ content }}</div>
    <div class="modal-button" v-if="okmsg && cancelmsg">
      <button class="button-ok">{{ okmsg }}</button>
      <button class="button-cancel" @click="handleClose()">
        {{ cancelmsg }}
      </button>
    </div>
  </div>
</template>
<script>
import { mapActions, mapMutations, mapState } from "vuex";
export default {
  name: "Modal",
  data() {
    return {
      isShow: true,
    };
  },
  props: {
    title: String,
    time: Number,
    content: String,
    okmsg: String,
    cancelmsg: String,
    aod: {
      type: Boolean,
      default: false,
    },
  },
  computed: { ...mapState(["_play", "_timer", "_miniMode"]) },
  methods: {
    handleClose() {
      this.clearMsg();
      this.isShow = false;
    },
    ...mapMutations(["clearMsg", "set_Timer"]),
    ...mapActions(["getContent"]),
  },
  created() {
    setTimeout(() => {
      this.isShow = true;
    }, 0);
  },
  mounted() {
    if (this.aod) {
      // aod开启时不自动消失
      if (!this.isShow) this.isShow = true;
    } else {
      if (!this.isShow) this.isShow = true;
      if (this._timer) clearTimeout(this._timer);
      this.set_Timer(
        setTimeout(() => {
          this.clearMsg();
          this.isShow = false;
          clearTimeout(this._timer);
          this.set_Timer(null);
        }, this._play.message.duration)
      );
    }
  },
  // watch: {
  //   time() {
  //     // 普通的watch监听，小防抖

  //     if (this.aod) {
  //       // aod开启时不自动消失
  //       if (!this.isShow) this.isShow = true;
  //     } else {
  //       if (!this.isShow) this.isShow = true;
  //       if (this._timer) clearTimeout(this._timer);

  //       this._timer = setTimeout(() => {
  //         //console.log("时间到" + this.isShow);
  //         this.isShow = false;
  //         clearTimeout(this._timer);
  //         this._timer = null;
  //       }, 3000);
  //     }
  //   },
  // },
};
</script>
<style lang='scss' scoped>
.modal {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translate(-50%);
  display: flex;
  flex-direction: column;

  justify-content: center;
  //   border: 1px solid silver;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);

  border-radius: 15px;
  width: 360px;
  margin: 25px 0;
  padding: 15px;
  box-sizing: border-box;
  z-index: 1;

  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);

  &.mini {
    width: max-content;
    padding: 6px 10px;
    margin: 10px 0;

    .modal-content {
      margin-top: 0;
      max-width: calc(100vw - 50px);
    }
  }

  &.dark {
    background-color: rgba(0, 0, 0, 0.72);
    color: white;
  }

  &Show {
    top: 0px;
    transform: translate(-50%);
    transition: all 0.5s ease;
  }

  &Hide {
    top: -100%;
    transform: translate(-50%, 100%);
    transition: all 0.5s ease;
  }

  &-title {
    font-size: 12px;
    line-height: 16px;
  }

  &-content {
    font-size: 14px;
    line-height: 20px;
    margin-top: 6px;
    font-weight: bold;
  }

  &-button {
    width: 460px;
    display: flex;
    justify-content: space-around;
  }
}

button {
  margin-top: 20px;
  width: 80px;
  height: 35px;
  border: none;
  background-color: #000;
  color: #fff;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  border-radius: 5px;
}

button:hover {
  background-color: #fff;
  color: #000;
  border: 1px solid #000;
  cursor: pointer;
}
</style>