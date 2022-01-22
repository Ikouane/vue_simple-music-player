<template>
  <div @click="handelClick($event)" :class="slide" id="list">
    <ListItem
      v-for="(item, i) in _playlist"
      :key="item.musicId"
      :title="item.musicName"
      :subTitle="item.musicAuthor"
      :active="i === _play.nowPlaying"
      :skip="item.skip || false"
      :listIndex="i"
      :label="item.recommendReason"
    />
  </div>
  <div class="mask"></div>
  <!-- <ListItem title="歌曲标题" subTitle="歌曲歌手" /> -->
</template>
<script>
import ListItem from "./ListItem";
import { mapState, mapMutations } from "vuex";
import $ from "jquery";
import Axios from "axios";
import "@/assets/index.css";
export default {
  name: "PlayList",
  props: {
    show: {
      type: Boolean,
      default: true,
    },
    slide: String,
  },
  computed: {
    ...mapState(["_play", "_playlist"]),
  },
  components: {
    ListItem,
  },
  methods: {
    ...mapMutations(["playSwitch", "goPlay", "setMsg", "replaceMusicUrl"]),
    handelClick(e) {
      let index = parseInt(e.target.getAttribute("data-index"));
      if (this._playlist[index]) {
        if (this._playlist[index].skip) {
          e.preventDefault();
          this.setMsg(`该歌曲无法播放，将再次尝试`);
          // FIXME: 目前重试只能在列表中点击进行，需要修改至全局
          const _this = this;
          Axios.get(
            `https://api.weyoung.tech/vue_simple-music-player/get.php?sid=${this._playlist[index].musicId}`
          )
            .then((response) => {
              _this.replaceMusicUrl({
                musicIndex: index,
                musicId: response.data.musicId,
                musicUrl: response.data.musicUrl,
              });
              _this.setMsg(`歌曲已播放`);
            })
            .catch(function (error) {
              // 请求失败处理
              console.log(error);
            });
        } else {
          if (!Number.isNaN(index)) {
            if (this._play.nowPlaying === index) {
              //当点击的是当前的音乐时切换播放状态
              this.playSwitch();
            } else {
              this.goPlay({ desIndex: index });
            }
          } else console.log(index);
        }
      }
    },

    myBrowser() {
      var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
      var isOpera = userAgent.indexOf("Opera") > -1;
      if (isOpera) {
        return "Opera";
      } //判断是否Opera浏览器
      if (userAgent.indexOf("Firefox") > -1) {
        return "FF";
      } //判断是否Firefox浏览器
      if (userAgent.indexOf("Chrome") > -1) {
        return "Chrome";
      }
      if (userAgent.indexOf("Safari") > -1) {
        return "Safari";
      } //判断是否Safari浏览器
      if (
        userAgent.indexOf("compatible") > -1 &&
        userAgent.indexOf("MSIE") > -1 &&
        !isOpera
      ) {
        return "IE";
      } //判断是否IE浏览器
    },
  },
  mounted() {
    let timer = null;

    document.getElementById("list").addEventListener("scroll", (e) => {
      if (timer) return;
      timer = setTimeout(() => {
        $("#list").css("--scrollbar_color_light", "transparent");
        $("#list").css("--scrollbar_color_dark", "transparent");
        timer = null;
      }, 1500);
      console.log(e);
      $("#list").css("--scrollbar_color_light", "#bfbfbf");
      $("#list").css("--scrollbar_color_dark", " #333");
    });

    document.getElementsByClassName("mask")[0].style.top =
      document.getElementsByClassName("mplayer")[0].offsetTop + 735 - 2 + "px";

    //以下是调用上面的函数
    var mb = this.myBrowser();
    if ("Chrome" === mb) {
      console.log("检测到Chrome, 开放所有功能");
      //document.getElementsByClassName("mask")[0].style.display = "block";
    } else console.log("建议使用Chrome, 开放所有功能");
  },
  watch: {
    _playlist(val) {
      let top = val.length * 78 - 780; //Smooth Scroll
      document.getElementById("list").scrollTo({
        top,
        behavior: "smooth",
      });
    },
  },
};
</script>
<style lang='scss' scoped>
$dark_player_color: var(--dark_player_color);
$player_color: var(--player_color);
div {
  display: none;
}

.mask {
  display: none;
  position: fixed;
  width: 356px;
  height: 45px;
  background: -webkit-gradient(
    linear,
    bottom,
    top,
    from(var(--player_color)),
    to(transparent)
  );
  background: linear-gradient(to top, var(--player_color), transparent);
  left: 50%;
  transform: translate(-50%);
  margin-left: -1px;
  top: 90%;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  pointer-events: none;

  .dark & {
    background: -webkit-linear-gradient(
      top,
      transparent,
      var(--dark_player_color)
    );
    background: linear-gradient(to top, var(--dark_player_color), transparent);
  }
}

.slide-up {
  @media (max-width: 768px) {
    height: calc(1rem - 320px);
  }

  // background: linear-gradient(
  //   rgba(#e9f1fc, 0.9) 0%,
  //   rgba(0, 0, 0, 0) 5%,
  //   rgba(0, 0, 0, 0) 95%,
  //   rgba(#e9f1fc, 0.9) 100%
  // );

  // .dark & {
  //   background: linear-gradient(
  //     rgba(#26282b, 1) 0%,
  //     rgba(0, 0, 0, 0) 5%,
  //     rgba(0, 0, 0, 0) 95%,
  //     rgba(black, 1) 100%
  //   );
  //}

  animation: slide 0.2s ease-in-out forwards;
  display: block;

  overflow: hidden;
  overflow-y: scroll;
  height: 470px;
  //height: 435px;
  padding: 0 2px 0 0;
}

.slide-down {
  animation: slide-reverse 0.2s ease-in-out forwards;
}

@keyframes slide {
  from {
    opacity: 0;
    transform: translatey(100%);
  }
  to {
    opacity: 1;
    transform: translatey(0);
  }
}

@keyframes slide-reverse {
  from {
    transform: translatey(0);
  }
  to {
    transform: translatey(100%);
    display: none;
  }
}

/*修改滚动条样式*/
::-webkit-scrollbar {
  width: 2px;
}

::-webkit-scrollbar-track {
  // background: rgb(239, 239, 239);
  // border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar_color_light, "#bfbfbf");
  border-radius: 10px;

  .dark & {
    background-color: var(--scrollbar_color_dark, "transparent");
  }
}

::-webkit-scrollbar-thumb:hover {
  background: #333;
  .dark & {
    background: #bfbfbf;
  }
}

::-webkit-scrollbar-corner {
}
</style>