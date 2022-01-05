<template>
  <div :class="'mplayer' + (_play.mode === 'day' ? '' : ' dark')">
    <transition>
      <InputModal v-if="_success" :isShow="_success" :isWrong="isWrong" />
    </transition>
    <transition name="MsgBox">
      <MessageBox
        v-if="boxShow"
        title="提示"
        content="欢迎使用 一起听"
        :boxShow="boxShow"
        :qrText="urlText"
        @share-room="switchBoxShow()"
      />
    </transition>
    <!-- <InputModal v-if="showInput" :isShow="showInput" :isWrong="isWrong" /> -->
    <!-- <InputModal v-if="false" :isShow="_success" :isWrong="isWrong" /> -->
    <!--v-if="showInput" :isShow="showInput"-->
    <transition name="Modal">
      <Modal
        v-if="_play.message.show"
        :title="
          _play.message.content
            ? '通知'
            : _play.isPlaying
            ? '正在播放'
            : '已同步上次播放'
        "
        :aod="_play.message.duration == 0"
        :time="getNowTime()"
        :content="
          _play.message.content ||
          _playlist[_play.nowPlaying].musicName +
            ' - ' +
            _playlist[_play.nowPlaying].musicAuthor
        "
      />
    </transition>
    <AppBar @share-room="switchBoxShow()" />
    <MusicImage :size="_play.nowPage === 'PLAYLIST' ? 'small' : ''" />
    <!-- v-if="_play.nowPage === 'PLAYLIST'" -->
    <PlayList
      :slide="_play.nowPage === 'PLAYLIST' ? 'slide-up' : 'slide-down'"
    />
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
import { mapActions, mapMutations, mapState } from "vuex";
import Modal from "./Modal";
import InputModal from "./InputForm";
import MessageBox from "./MessageBox";
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
    MessageBox,
  },
  data() {
    return {
      showInput: false,
      isWrong: false,
      urlText: "",
      boxShow: false,
    };
  },
  computed: {
    ...mapState(["_play", "_playlist", "_success", "_pid", "_rid"]),
  },
  methods: {
    ...mapMutations(["setStore", "setSuccess", "setPid", "setRid"]),
    ...mapActions(["playSync"]),
    // showInputSwitch() {
    //   this.setSuccess(!this._success);
    // },
    switchBoxShow() {
      console.log("分享房间");
      this.boxShow = !this.boxShow;
    },
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
    getNowTime() {
      return new Date().valueOf();
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
  },
  watch: {
    // _success(val, oldVal) {
    //   //console.log("状态改变", val, oldVal);
    //   if (val) {
    //     if (!oldVal) this.showInputSwitch();
    //   } else console.log("状态改变", val, oldVal);
    // },
    _pid(val) {
      console.log(`歌单已变更为${val}`);
      this.getList(val);
    },
    _rid(val) {
      console.log(`房间已变更为${val}`);
      this.urlText = "https://music.weyoung.tech/?rid=" + val;
    },
  },
};
</script>
<style lang="scss" scoped>
.mplayer {
  width: 360px;
  background-color: var(--player_color);
  padding: 25px;
  border-radius: 36px;
  border: 2px solid white;
  height: 735px; //715px
  overflow: hidden;
  position: relative;

  &.dark {
    background-color: var(--dark_player_color);
    border: 2px solid black;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 1rem;
    box-sizing: border-box;
  }

  @keyframes fade {
    0% {
      opacity: 1;
      transform-origin: 0% 0%;
      transform: scale(1) translate(-50%, -50%);
    }

    100% {
      opacity: 0;
      transform-origin: 0% 0%;
      transform: scale(1.2) translate(-50%, -50%);
    }
  }
  .MsgBox-enter-active {
    animation: 0.3s fade reverse;
  }

  .MsgBox-leave-active {
    animation: 0.3s fade;
  }

  @keyframes slide {
    0% {
      top: -100%;
    }

    100% {
      top: 0;
    }
  }

  .Modal-enter-active {
    transition: all 0.5s ease;
    animation: 0.3s slide;
  }

  .Modal-leave-active {
    top: -100%;
    transform: translate(-50%, 100%);
    transition: all 0.5s ease;
  }
}
</style>