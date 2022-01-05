<template>
  <div :class="'inputbox ' + (isShow ? 'inputbox-show' : 'inputbox-hide')">
    <p>{{ !isWrong ? "请输入编号" : "未找到数据，请检查编号" }}</p>
    <input
      v-for="(item, i) in 4"
      v-bind:key="i"
      class="input-single"
      disabled="disabled"
      maxlength="1"
      :id="i"
      :value="input_text.slice()[i]"
    />
    <br />
    <input class="input-union" maxlength="4" v-model="input_text" />
  </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import Axios from "axios";
export default {
  data() {
    return {
      input_text: "",
      input_array: [],
      retry: false,
      isWrong: false,
    };
  },
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    // isWrong: Boolean,
  },
  computed: {
    ...mapState(["_play", "_playlist", "_success"]),
  },
  mounted() {
    const u_input = document.getElementsByClassName("input-union")[0],
      c_input = document.getElementsByClassName("inputbox")[0];
    u_input.focus();

    u_input.addEventListener("blur", () => {
      if (this._success) {
        this.setSuccess(false);
      }
    });

    c_input.addEventListener("click", (e) => {
      console.log(e.target.id);
      // if (e.target.id) {
      //   // document.getElementById(e.target.id).focus();
      // } else u_input.focus();
      u_input.focus();
    });

    u_input.addEventListener("keydown", (e) => {
      // if (this.input_text.length >= 6) {
      //   if (e.key === "Backspace") {
      //   } else return false;
      // } else console.log(e);
      if (e.key >= "0" && e.key <= "9") {
        console.log("输入有效");
        this.retry = true;
      } else {
        if (e.key === "Backspace") {
          console.log("删除");
        } else if (e.key === "Enter") {
          console.log("发送请求");
        } else {
          console.log("输入无效");
          e.preventDefault();
          return false;
        }
      }
    });

    u_input.addEventListener("keyup", () => {
      if (this.input_text.length == 4) {
        console.log("发送请求");
        this.getList(this.input_text);
      }
    });
  },
  methods: {
    ...mapMutations(["setStore", "setSuccess", "pause"]),
    saveList() {
      const _this = this;
      let data = new FormData();
      data.append("method", "save");
      data.append("play", JSON.stringify(_this._play));
      data.append("playlist", JSON.stringify(_this._playlist));
      Axios.post(
        "https://api.weyoung.tech/vue_simple-music-player/get.php",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data; charset=UTF-8", //将表单数据传递转化为form-data类型
          },
        }
      )
        .then(function (response) {
          console.log(response.data);
        })
        .catch(function (error) {
          alert(error);
        });
    },
    getList(pid) {
      const _this = this;
      Axios.get(
        `https://api.weyoung.tech/vue_simple-music-player/get.php?pid=${pid}`
      )
        .then((response) => {
          //console.log(response.data);
          if (response.data._playlist) {
            if (
              !document.getElementById("music").paused &&
              this._play.isPlaying
            )
              this.pause(false);
            else console.log("音乐未加载，无须暂停");

            _this.setStore(response.data);
            _this.isWrong = false;
            _this.setSuccess(false);
            _this.input_text = "";
          } else {
            _this.isWrong = true;
            _this.setSuccess(true);
          }
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
  },
  watch: {
    _success() {
      const u_input = document.getElementsByClassName("input-union")[0];
      u_input.focus();
    },
  },
};
</script>

<style lang="scss" scoped>
.inputbox {
  width: 100%;
  text-align: center;
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translate(-50%);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);

  border-radius: 15px;
  width: 360px;
  margin: 25px 0;
  padding: 15px;
  box-sizing: border-box;
  z-index: 1;

  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);

  &-show {
    top: 80px;
    transform: translate(-50%);
    transition: all 0.5s ease;
  }

  &-hide {
    top: -100%;
    transform: translate(-50%, 100%);
    transition: all 0.5s ease;
  }

  .dark & {
    color: #eee;
    background-color: rgba(0, 0, 0, 0.72);
  }

  .input-single {
    height: 40px;
    width: 40px;
    font-size: 40px;
    font-weight: bold;
    text-align: center;
    padding: 10px;
    line-height: 40px;
    color: #666;
    border: 1px dashed #ccc;
    // box-shadow: 0 0 1px 1px #ccc;
    margin: 5px;

    .dark & {
      color: #eee;
    }
  }

  .input-union {
    opacity: 0;
  }
}
</style>