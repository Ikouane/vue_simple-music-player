<template>
  <div :class="'mplayer'+ (_play.mode === 'day'? '' : ' dark')">
    <!-- <transition>
      <InputModal v-if="_success" :isShow="_success" :isWrong="isWrong" />
    </transition>-->
    <InputModal :isShow="_success" :isWrong="isWrong" />
    <!--v-if="showInput" :isShow="showInput"-->
    <Modal
      :title="_play.msg? '通知' : '正在播放'"
      :content="_play.msg || _playlist[_play.nowPlaying].musicName +
        ' - ' +
        _playlist[_play.nowPlaying].musicAuthor"
    />
    <AppBar />
    <MusicImage :size="_play.nowPage === 'PLAYLIST' ? 'small' : ''" />
    <!-- v-if="_play.nowPage === 'PLAYLIST'" -->
    <PlayList :slide="_play.nowPage === 'PLAYLIST' ? 'slide-up' : 'slide-down'" />
    <InfoBlock :show="_play.nowPage === 'PLAYING NOW'" />
    <PlayBar v-show="_play.nowPage === 'PLAYING NOW'" />
  </div>
</template>
<script>
import AppBar from "./AppBar";
import InfoBlock from "./MusicInfo";
import PlayBar from "./PlayBar";
import PlayList from "./PlayList";
import MusicImage from "./MusicImage";
import { mapMutations, mapState } from "vuex";
import Modal from "./Modal";
import InputModal from "./InputForm";
import Axios from "axios";

export default {
  name: "Main",
  // data() {
  //   return {
  //     title: String,
  //     msg: String,
  //   };
  // },
  components: {
    AppBar,
    InfoBlock,
    PlayBar,
    PlayList,
    MusicImage,
    Modal,
    InputModal,
  },
  data() {
    return {
      showInput: false,
      isWrong: false,
    };
  },
  computed: {
    ...mapState(["_play", "_playlist", "_success"]),
  },
  methods: {
    ...mapMutations(["setStore", "setSuccess"]),
    // showInputSwitch() {
    //   this.setSuccess(!this._success);
    // },
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
      Axios.get(
        `https://api.weyoung.tech/vue_simple-music-player/get.php?pid=${pid}`
      )
        .then((response) => {
          //console.log(response.data);
          if (response.data._playlist) {
            this.setStore(response.data);
            this.isWrong = false;
            this.showInputSwitch();
          } else this.isWrong = true;
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
  },
  mounted() {
    document.addEventListener("keydown", (e) => {
      let key = e.keyCode || window.event.keyCode;
      if (key == 115) {
        //== 83 && event.ctrlKey
        window.event.preventDefault(); //关闭浏览器快捷键
        console.log("点击F4");
        this.setSuccess(!this._success);
        // this.showInputSwitch();
      }
    });

    // this.$EventBus.$on("successMsg", (msg) => {
    //   // InputForm发送来的消息
    //   this.showInput = msg;
    // });
  },
  // watch: {
  //   _success(val, oldVal) {
  //     //console.log("状态改变", val, oldVal);
  //     if (val) {
  //       if (!oldVal) this.showInputSwitch();
  //     } else console.log("状态改变", val, oldVal);
  //   },
  // },
};
</script>
<style lang="scss" scoped>
.mplayer {
  width: 360px;
  background-color: var(--player_color);
  padding: 25px;
  border-radius: 36px;
  border: 2px solid white;
  height: 715px;
  overflow: hidden;
  position: relative;

  &.dark {
    background-color: var(--dark_player_color);
    border: 2px solid black;
  }
}
</style>