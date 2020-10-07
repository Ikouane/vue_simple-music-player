<template>
  <div @click="handelClick($event)" :class="slide" id="list">
    <ListItem
      v-for="(item, i) in _playlist"
      v-bind:key="i"
      :title="item.musicName"
      :subTitle="item.musicAuthor"
      :active="i === _play.nowPlaying"
      :listIndex="i"
    />
  </div>
  <div class="mask"></div>
  <!-- <ListItem title="歌曲标题" subTitle="歌曲歌手" /> -->
</template>
<script>
import ListItem from "./ListItem";
import { mapState, mapMutations } from "vuex";
import $ from "jquery";
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
    ...mapMutations(["playSwitch", "goPlay"]),
    handelClick(e) {
      let index = parseInt(e.target.getAttribute("data-index"));
      if (!Number.isNaN(index)) {
        if (this._play.nowPlaying === index) {
          //当点击的是当前的音乐时切换播放状态
          this.playSwitch();
        } else {
          this.goPlay(index);
        }
      } else console.log(index);
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
        $("#list").css("--scrollbar_width", "0px");
        timer = null;
      }, 1500);
      console.log(e);
      $("#list").css("--scrollbar_width", "2px");
    });

    document.getElementsByClassName("mask")[0].style.top =
      document.getElementsByClassName("mplayer")[0].offsetTop + 735 - 2 + "px";

    //以下是调用上面的函数
    var mb = this.myBrowser();
    if ("Chrome" === mb) {
      console.log("检测到Chrome, 开放所有功能");
      document.getElementsByClassName("mask")[0].style.display = "block";
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
  width: var(--scrollbar_width); //2px;
}

::-webkit-scrollbar-track {
  // background: rgb(239, 239, 239);
  // border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: #bfbfbf;
  border-radius: 10px;

  .dark & {
    background: #333;
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