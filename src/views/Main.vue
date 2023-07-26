<template>
  <div class="mplayer" :class="{
    dark: _play.mode == 'night',
    pink: _play.mode == 'pink',
    mini: _miniMode,
  }">
    <transition>
      <InputModal v-if="_success" :isShow="_success" :isWrong="isWrong" />
    </transition>
    <transition name="MsgBox">
      <MessageBox v-if="boxShow" title="提示" content="欢迎使用 一起听" :boxShow="boxShow" :qrText="urlText"
        @click-action="switchBoxShow()" />
    </transition>
    <MessageBox v-if="moreActionShow" title="更多功能" type="more" :boxShow="moreActionShow"
      @click-action="switchMoreActionShow()" @click-chat="switchChatContainerShow()" />
    <!-- <InputModal v-if="showInput" :isShow="showInput" :isWrong="isWrong" /> -->
    <!-- <InputModal v-if="false" :isShow="_success" :isWrong="isWrong" /> -->
    <!--v-if="showInput" :isShow="showInput"-->
    <transition name="fade">
      <Chat v-if="_chatContainerShow" @click-chat="switchChatContainerShow()"></Chat>
    </transition>
    <transition name="Modal">
      <Modal v-if="_play.message.show" :title="_play.message.title ||
        (_play.message.content
          ? '通知'
          : _play.isPlaying
            ? '正在播放'
            : '已同步上次播放')
        " :aod="_play.message.duration == 0" :time="getNowTime()" :content="_play.message.content ||
    _playList[_play.nowPlaying].name +
    ' - ' +
    formatArtists(_playList[_play.nowPlaying].artist)
    " :buttons="_play.message.buttons" />
    </transition>
    <transition name="fade">
      <Popup v-if="_showPopup && !_play.isPlaying" @close-handler="updateShowPopup({ showPopup: false })"
        title="欢迎使用「一起听」" content="本房间正在播放音乐，是否同步播放？" />
    </transition>
    <template v-if="_miniMode">
      <div class="flex flex-column">
        <div class="flex">
          <MusicImage :smallSize="_play.nowPage === 'PLAYLIST'" />
          <InfoBlock v-show="_play.nowPage === 'PLAYING NOW'" />
        </div>
      </div>
    </template>
    <template v-else>
      <AppBar @rid-click-action="switchBoxShow()" @more-click-action="switchMoreActionShow()" />
      <MusicImage :smallSize="_play.nowPage === 'PLAYLIST'" />
      <!-- v-if="_play.nowPage === 'PLAYLIST'" -->
      <PlayList :slide="_play.nowPage === 'PLAYLIST' ? 'slide-up' : 'slide-down'" />
      <InfoBlock v-show="_play.nowPage === 'PLAYING NOW'" />
      <PlayBar v-show="_play.nowPage === 'PLAYING NOW'" />
    </template>
  </div>
</template>
<script>
import AppBar from "@/components/AppBar";
import InfoBlock from "@/components/MusicInfo";
import PlayBar from "@/components/PlayBar";
import PlayList from "@/components/PlayList";
import MusicImage from "@/components/MusicImage";
import Modal from "@/components/Modal";
import InputModal from "@/components/InputForm";
import MessageBox from "@/components/MessageBox";
import Chat from "@/components/Chat.vue";
import Popup from "@/components/Popup.vue";
import { mapActions, mapMutations, mapState } from "vuex";
import { getSavedListApi } from "@/api/api";

export default {
  name: "Main",
  components: {
    AppBar,
    InfoBlock,
    PlayBar,
    PlayList,
    MusicImage,
    Modal,
    InputModal,
    MessageBox,
    Chat,
    Popup,
  },
  data() {
    return {
      showInput: false,
      isWrong: false,
      urlText: "",
      boxShow: false,
      moreActionShow: false
    };
  },
  computed: {
    ...mapState([
      "_play",
      "_playList",
      "_success",
      "_pid",
      "_rid",
      "_miniMode",
      "_chatContainerShow",
      "_inputMode",
      "formatArtists",
      "_showPopup"
    ]),
  },
  methods: {
    ...mapMutations([
      "setStore",
      "setSuccess",
      "setPid",
      "switchChatContainerShow",
      "updateShowPopup"
    ]),
    ...mapActions(["playSync"]),
    // showInputSwitch() {
    //   this.setSuccess(!this._success);
    // },
    switchBoxShow() {
      console.log("分享房间");
      this.boxShow = !this.boxShow;
    },
    switchMoreActionShow() {
      console.log("显示更多功能");
      this.moreActionShow = !this.moreActionShow;
    },
    getList(pid) {
      getSavedListApi(pid)
        .then((response) => {
          if (response._playList) {
            this.setStore(response);
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

    if (this._rid) {
      this.urlText = `${window.location.origin}${window.location.pathname}?rid=${this._rid}`;
    }

    // 判断是否是第一次打开新版本
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
      this.urlText = `${window.location.origin}${window.location.pathname}?rid=${val}`;
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
  height: 813px;

  overflow: hidden;
  position: relative;
  box-sizing: border-box;

  &.mini {
    display: flex;
    flex-direction: column;
    padding: 15px;

    .flex {
      display: flex;
      gap: 20px;

      &.flex-column {
        flex-direction: column;
        justify-content: center;
        height: 100%;
      }
    }
  }

  &.dark {
    background-color: var(--dark_player_color);
    border: 2px solid black;
  }

  &.pink {
    background-color: var(--pink_player_color);
    border: 2px solid var(--pink_border_color);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: .2s;
  }

  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  @keyframes fade {
    from {
      position: fixed;
      z-index: 2;
      top: 50%;
      left: 50%;
      opacity: 1;
      transform-origin: 0% 0%;
      transform: scale(1) translate(-50%, -50%);
    }

    to {
      position: fixed;
      z-index: 2;
      top: 50%;
      left: 50%;
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
