<template>
  <div
    :class="
      'modal ' +
      (isShow ? 'modal-show' : 'modal-hide') +
      (_play.mode === 'night' ? ' dark' : '')
    "
    @click="handleClose"
  >
    <label class="modal-title">{{ title }}</label>
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
      timer: Object,
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
  computed: { ...mapState(["_play"]) },
  methods: {
    handleClose() {
      this.isShow = false;
    },
    ...mapMutations(["clearMsg"]),
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
      if (this.timer) clearTimeout(this.timer);

      this.timer = setTimeout(() => {
        //console.log("时间到" + this.isShow);
        this.clearMsg();
        this.isShow = false;
        clearTimeout(this.timer);
        this.timer = null;
      }, 3000);
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
  //       if (this.timer) clearTimeout(this.timer);

  //       this.timer = setTimeout(() => {
  //         //console.log("时间到" + this.isShow);
  //         this.isShow = false;
  //         clearTimeout(this.timer);
  //         this.timer = null;
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

  &.dark {
    background-color: rgba(0, 0, 0, 0.72);
    color: white;
  }

  &-show {
    top: 0px;
    transform: translate(-50%);
    transition: all 0.5s ease;
  }

  &-hide {
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