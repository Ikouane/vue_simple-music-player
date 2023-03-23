<template>
  <div class="flexbox" :class="{ small: smallSize, mini: _miniMode }">
    <Modal v-if="uploadSuccess" title="提示" :content="'上传数据成功，编号为' + pid" aod="aod" />
    <div class="flexbox_part">
      <Button v-show="!_miniMode && smallSize" size="middle" title="我喜欢" :bindtap="switchLike"
        @click="this.hasChange = true" type="fa fa-heart" :active="_playlist[_play.nowPlaying].isLike" />
      <Button v-show="!_miniMode && smallSize" size="middle" title="更多" :disabled="
        _dailyMode || Boolean(_rid) || Boolean(_pid) || Boolean(_mid)
      " :bindtap="getMore" type="fa fa-ellipsis-h" />
    </div>
    <div class="music-image" :class="{ small: smallSize, playing: _play.isPlaying }" @click="playSwitchFade()"
      :title="_play.isPlaying ? '暂停' : '播放'">
      <!-- @click="setSuccess(true)" title="进入传送门"-->
      <canvas class="visualizations" :class="{ playing: _play.isPlaying }"
        :style="`--mainColor: ${this._mainColor}`"></canvas>
      <img class="middle-image playing" ref="musicImage" @load="getPictureColor" :class="{ small: smallSize }"
        :src="_playlist[_play.nowPlaying].musicImage" alt="图片加载失败" :style="{
          webkitAnimationPlayState: _play.isPlaying ? 'running' : 'paused',
        }" crossorigin="anonymous" />
    </div>
    <div class="flexbox_part">
      <Button v-show="!_miniMode && smallSize" size="middle" title="备份数据到云端" :disabled="Boolean(_pid)" :bindtap="saveList"
        type="fas fa-cloud-upload-alt" />
      <Button v-show="!_miniMode && smallSize" size="middle" title="从云端还原数据" @click="setSuccess(true)"
        type="fas fa-cloud-download-alt" />
      <!-- FIXME: @click="setSuccess(true)" -->
    </div>
  </div>
</template>
<script>
import Button from "./Button";
import { mapState, mapMutations } from "vuex";
import Modal from "./Modal";
import ColorThief from "colorthief";
import { setSavedList, getMoreMusic } from "@/api/api"

export default {
  name: "MusicImage",
  data() {
    return {
      uploadSuccess: false,
      pid: "",
      hasChange: true,
    };
  },
  components: {
    Button,
    Modal,
  },
  props: {
    smallSize: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState([
      "_play",
      "_playlist",
      "_success",
      "_dailyMode",
      "_rid",
      "_pid",
      "_mid",
      "_miniMode",
      "_mainColor"
    ]),
  },
  methods: {
    ...mapMutations([
      "switchLike",
      "addMore",
      "setSuccess",
      "playSwitchFade",
      "setMsg",
      "setLocal",
      "setMainColor"
    ]),
    getMore() {
      const _this = this;
      getMoreMusic()
        .then((response) => {
          _this.addMore(response._playlist);
          _this.hasChange = true;
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });

      this.setLocal();
    },
    saveList() {
      if (!this.hasChange) {
        console.log("数据未改变");
        this.setMsg({
          message: "距上次备份，数据未发生改变",
        });
      } else {
        const _this = this;
        let data = new FormData();
        data.append("method", "save");
        data.append("play", JSON.stringify(_this._play));
        data.append("playlist", JSON.stringify(_this._playlist));
        setSavedList(data, {
          headers: {
            "Content-Type": "multipart/form-data; charset=UTF-8", //将表单数据传递转化为form-data类型
          },
        })
          .then(function (response) {
            _this.uploadSuccess = true;
            _this.hasChange = false;
            _this.pid = response.pid;
          })
          .catch(function (error) {
            alert(error);
          });
      }
    },
    getPictureColor() {
      let colorThief = new ColorThief();
      this.setMainColor({ mainColor: `rgb(${colorThief.getColor(this.$refs["musicImage"]).join(",")})` });
    }
  },
};
</script>
<style lang='scss' scoped>
$title_color: var(--title_color);
$text_color: var(--text_color);
$main_color: var(--main_color);
$player_color: var(--player_color);
$border_color: var(--border_color);
$active_color: var(--active_color);
$title_size: 30px;
$text_size: 16px;
$time_size: 12px;

$dark_main_color: var(--dark_main_color);
$dark_player_color: var(--dark_player_color);
$dark_active_color: var(--dark_active_color);
$dark_title_color: var(--dark_title_color);
$dark_text_color: var(--dark_text_color);
$dark_border_color: var(--dark_border_color);

$pink_main_color: var(--pink_main_color);
$pink_player_color: var(--pink_player_color);
$pink_active_color: var(--pink_active_color);
$pink_title_color: var(--pink_title_color);
$pink_text_color: var(--pink_text_color);
$pink_border_color: var(--pink_border_color);

.flexbox {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;

  &.mini {
    display: inline;
    width: fit-content;
    margin: initial;

    .flexbox_part {
      display: none;
    }

    .music-image {
      position: relative;
      width: calc(100vmin - 30px);
      height: calc(100vmin - 30px);
      margin: initial;
      box-shadow: 5px 5px 12px #b6bcc5,
        -5px -5px 12px #ffffff;

      .dark & {
        box-shadow: 5px 5px 5px #1d2024, -5px -5px 5px #2d3036;
      }

      .pink & {
        box-shadow: 5px 5px 15px #d3c4cd, -5px -5px 15px #ffffff, 0 0 0.5vh 0.5vh #f9e7f0;
      }

      .middle-image {
        width: 100%;
        height: 100%;
        border-width: 4px;
        box-sizing: border-box;
      }
    }
  }

  .flexbox_part {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 158px;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }

  &.small {
    margin-bottom: 40px;

    @keyframes fade-in {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }

    &::v-deep .player-button {
      animation: fade-in 0.5s;
    }
  }

  &::v-deep .player-button {
    animation: fade-out 0.5s;
  }

  // * {
  //   float: left;
  // }

  // &.clearfix::after {
  //   content: "";
  //   display: block; //or table
  //   clear: both;
  // }
}

.music-image {
  @media (max-width: 768px) {
    width: 0.3rem;
    height: 0.3rem;
    margin-bottom: 0.05rem;
  }

  position: relative;
  margin: auto;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  box-shadow: 20px 20px 24px #b6bcc5,
  -20px -20px 24px #ffffff;
  margin-bottom: 40px;
  transition: 0.3s all ease-in-out;
  cursor: pointer;


  @keyframes scaleCircle {
    from {
      transform: scale(1);
      opacity: 0;
    }

    to {
      transform: scale(1.2);
      opacity: 0.5;
    }
  }

  // &::before {
  //   content: "";
  //   position: absolute;
  //   top: 5px;
  //   height: 250px;
  //   width: 250px;
  //   border-radius: 50%;
  //   border: 1px dashed #333;
  //   animation: scaleCircle 3s ease-in-out infinite alternate;
  // }

  &.small {
    margin: auto;
    width: 150px;
    height: 150px;
    box-shadow: none;
    box-shadow: 12px 12px 16px #b6bcc5, -12px -12px 16px #ffffff;
  }

  .dark & {
    box-shadow: none;
    box-shadow: 20px 20px 20px #1d2024, -20px -20px 20px #2d3036;

    &.small {
      box-shadow: none;
      box-shadow: 12px 12px 16px #1d2024, -12px -12px 16px #2d3036;
    }
  }

  .pink & {
    box-shadow: none;
    box-shadow: 20px 20px 60px #d3c4cd, -20px -20px 60px #ffffff, 0 0 2vh 2vh #f9e7f0;

    &.small {
      box-shadow: none;
      box-shadow: 12px 12px 36px #d3c4cd, -12px -12px 36px #ffffff, 0 0 1.2vh 1.2vh #f9e7f0;
    }
  }

  .middle-image {
    @media (max-width: 768px) {
      width: 0.3rem;
      height: 0.3rem;
    }

    position: absolute;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    object-fit: cover;
    border-radius: 50%;
    border: 6px solid $player_color;
    background: linear-gradient(145deg, #f9ffff, #d2d9e3);
    transition: 0.3s all ease-in-out;

    &.small {
      width: 150px;
      height: 150px;
      border: 4px solid $player_color;
    }

    .dark & {
      border: none;
      border: 6px solid var(--dark_player_color);
      background: linear-gradient(145deg, #2a2e33, #23272b);

      &.small {
        border: none;
        border: 4px solid var(--dark_player_color);
      }
    }

    .pink & {
      border: none;
      border: 6px solid var(--pink_player_color);
      background: linear-gradient(145deg, #d3c4cd, #ffffff);

      &.small {
        border: none;
        border: 4px solid var(--pink_player_color);
      }
    }

    &.playing {
      box-shadow: clear;
      /*css3动画无限制的旋转*/
      -webkit-animation: music_disc 40s linear infinite;
      animation: music_disc 40s linear infinite;
    }

    /*css3动画的旋转*/
    @keyframes music_disc {
      0% {
        -webkit-transform: rotate(0deg);
        -ms-transform: rotate(0deg);
        -o-transform: rotate(0deg);
        transform: rotate(0deg);
      }

      100% {
        -webkit-transform: rotate(360deg);
        -ms-transform: rotate(360deg);
        -o-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }

    @-webkit-keyframes music_disc {
      0% {
        -webkit-transform: rotate(0deg);
        -ms-transform: rotate(0deg);
        -o-transform: rotate(0deg);
        transform: rotate(0deg);
      }

      100% {
        -webkit-transform: rotate(360deg);
        -ms-transform: rotate(360deg);
        -o-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
  }

  .visualizations {
    position: absolute;
    width: 100%;
    height: 100%;
    transform: scale(1.2);
    filter: initial;
    transition: all 0.2s ease-in-out;

    &.playing {
      filter: drop-shadow(2px 4px 6px var(--mainColor));
    }
  }
}
</style>