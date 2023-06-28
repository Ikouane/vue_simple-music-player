<template>
  <div id="app">
    <Main v-if="_loaded" />
    <div class="snow__wrapper" :style="`--mainColor: ${_play.isPlaying ? _mainColor : 'white'}`"></div>
  </div>
</template>

<script>
import Main from "./views/Main";
import "@/assets/index.css";
import { mapActions, mapMutations, mapState } from "vuex";
import { getData, getSingleMusic, getMusicList, getSavedList } from "@/api/api"
// import wx from "weixin-js-sdk";

export default {
  name: "App",
  components: {
    Main,
  },
  computed: {
    ...mapState(["_play", "_playList", "_dailyMode", "_userTouch", "_miniMode", "_mainColor", "_inputMode", "_loaded"]),
  },
  methods: {
    ...mapMutations([
      "addTime",
      "minusTime",
      "playSwitch",
      "prev",
      "next",
      "setStore",
      "playSwitchFade",
      "modeSwitch",
      "getLocal",
      "setPid",
      "setRid",
      "setVolume",
      "setSingleMusicMode",
      "setMsg",
      "goTime",
      "setDailyMode",
      "setAlreadyTouch",
      "setMiniMode",
      "setInputMode",
      "switchChatContainerShow"
    ]),
    ...mapActions(["playSync"]),
    initScreen() {
      if (window.innerWidth < 768) {
        document.querySelector("html").style.fontSize = window.innerHeight + "px";
      }
    },
  },
  created() {
    function getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
          return pair[1];
        }
      }
      return false;
    }

    let pid = getQueryVariable("pid"),
      rid = getQueryVariable("rid"),
      mid = getQueryVariable("mid"),
      lid = getQueryVariable("lid"),
      startTime = getQueryVariable("st"),
      endTime = getQueryVariable("et"),
      dailyMode = getQueryVariable("daily"),
      mini = getQueryVariable("mini");

    if (mini) this.setMiniMode();

    if (mid) {
      console.log("单音乐模式");
      const _this = this;

      getSingleMusic(mid).then((response) => {
        _this.setStore(response);
        _this.setSingleMusicMode();
        if (response._play.mode === "night")
          document
            .querySelector("body")
            .setAttribute("style", "background-color:var(--dark_main_color)");

        if (startTime) {
          console.log("精准空降", startTime);
          _this.goTime({ desTime: startTime });
          _this._playList[0].playStartTime = startTime;

          if (endTime) {
            _this._playList[0].playEndTime = endTime;
            _this.setMsg({
              message: "已进入区间播放模式，拖动进度条即可退出",
              duration: 0,
            });
          }
        }
      })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    } else if (lid) {
      console.log("歌单模式");
      const _this = this;
      getMusicList(lid).then((response) => {
        _this.setStore(response);
        if (response._play.mode === "night")
          document
            .querySelector("body")
            .setAttribute("style", "background-color:var(--dark_main_color)");
      })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    } else {
      if (pid.length != 4) {
        if (localStorage.getItem("vue_simple-music-player")) {
          console.log("发现本地数据");
          this.getLocal();
        } else {
          if (dailyMode) this.setDailyMode();
          const _this = this;
          getData(dailyMode)
            .then((response) => {
              _this.setStore(response);
              if (response._play.mode === "night")
                document
                  .querySelector("body")
                  .setAttribute(
                    "style",
                    "background-color:var(--dark_main_color)"
                  );
              console.warn("歌单编号格式错误");

              if (rid.length != 4) {
                console.warn("房间号码格式错误");
              } else {
                this.setRid(rid); //alert(`欢迎进入${rid}房间!`);
                this.playSync();
              }
            })
            .catch(function (error) {
              // 请求失败处理
              console.log(error);
            });
        }
      } else {
        this.setPid(pid);
        console.log("获取目标歌单");
        const _this = this;
        getSavedList(pid)
          .then((response) => {
            if (response.status == "wrong")
              this.setMsg({
                message: "歌单不存在",
              });
            else _this.setStore(response);
          })
          .catch(function (error) {
            // 请求失败处理
            console.log(error);
          });
      }
    }

    let listeners = {
      dark: (mediaQueryList) => {
        if (mediaQueryList.matches) {
          this.modeSwitch({ target: "night" });
        }
      },
      light: (mediaQueryList) => {
        if (mediaQueryList.matches) {
          this.modeSwitch({ target: "day" });
        }
      },
    };

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addListener(listeners.dark);
    window
      .matchMedia("(prefers-color-scheme: light)")
      .addListener(listeners.light);
  },

  mounted() {
    var _this = this;
    document.addEventListener("keydown", (e) => {
      if (!this._inputMode) {
        let key = e.keyCode || window.event.keyCode;
        // console.log(key)
        if (key == 37) {
          //== 83 && event.ctrlKey
          window.event.preventDefault(); //关闭浏览器快捷键
          console.log("点击左箭头");
          _this.minusTime();
        } else if (key == 39) {
          window.event.preventDefault(); //关闭浏览器快捷键
          console.log("点击右箭头");
          _this.addTime();
        } else if (key == 32) {
          window.event.preventDefault(); //关闭浏览器快捷键
          console.log("点击空格");
          _this.playSwitchFade();
        } else if (key == 38 && e.shiftKey) {
          window.event.preventDefault(); //关闭浏览器快捷键
          console.log("点击Shift + 上箭头");
          _this.prev();
        } else if (key == 40 && e.shiftKey) {
          window.event.preventDefault(); //关闭浏览器快捷键
          console.log("点击Shift + 点击下箭头");
          _this.next({ isForce: true });
        } else if (key == 38) {
          window.event.preventDefault(); //关闭浏览器快捷键
          console.log("点击上箭头");
          _this.setVolume("up");
        } else if (key == 40) {
          window.event.preventDefault(); //关闭浏览器快捷键
          console.log("点击下箭头");
          _this.setVolume("down");
        } else if (key == 191) {
          window.event.preventDefault();
          this.switchChatContainerShow();
          console.log("输入命令");
        }
      }
    })

    const setDocumentTouch = () => {
      _this.setAlreadyTouch();
      document.removeEventListener("click", setDocumentTouch);
    };

    document.addEventListener("click", setDocumentTouch);

    // Axios.get(
    //   `https://wechat.weyoung.tech:18518/activityWxShare?url=${encodeURIComponent(
    //     window.location.href.split("#")[0]
    //   )}`
    // )
    //   .then(function (response) {
    //     var data = response.data;
    //     wx.config({
    //       debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
    //       appId: data.appID, // 必填，公众号的唯一标识
    //       timestamp: data.timestamp, // 必填，生成签名的时间戳
    //       nonceStr: data.nonceStr, // 必填，生成签名的随机串
    //       signature: data.signature, // 必填，签名，见附录1
    //       jsApiList: ["updateAppMessageShareData", "updateTimelineShareData"],
    //     });
    //     wx.ready(function () {
    //       //需在用户可能点击分享按钮前就先调用
    //       wx.updateAppMessageShareData({
    //         title: "未央宫", // 分享标题
    //         desc: "未央宫", // 分享描述
    //         link: window.location.href,
    //         imgUrl: "", // 分享图标
    //         success: function () {
    //           // 设置成功
    //           console.log("success");
    //         },
    //       });
    //     });
    //   })
    //   .catch(function (error) {
    //     console.error(error);
    //   });

    this.initScreen();

    let timer = null;
    window.addEventListener("resize", () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        this.initScreen();
        timer = null;
        console.log("窗口大小调整");
      }, 100);
    });
  },
};
</script>
<style lang="scss">
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

// #app {
//   font-family: Avenir, Helvetica, Arial, sans-serif;
//   -webkit-font-smoothing: antialiased;
//   -moz-osx-font-smoothing: grayscale;
// }

* {
  -webkit-tap-highlight-color: transparent;
}

img {
  user-select: none;
}

body {
  min-height: 100vh;
  overflow: hidden;

  &.imgBg {
    background-image: var(--backgroundImage);
    background-repeat: no-repeat;
    background-size: cover;
    backdrop-filter: saturate(180%) blur(20px) brightness(50%);
  }

  @function random_range($min, $max) {
    $rand: random();
    $random_range: $min +floor($rand * (($max - $min) + 1));
    @return $random_range;
  }

  .snow__wrapper {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;
    pointer-events: none;

    .snow {
      $total: 200;
      position: absolute;
      width: 10px;
      height: 10px;
      background: var(--mainColor, white);
      transition: background 3s ease-in-out;
      border-radius: 50%;

      @for $i from 1 through $total {
        $random-x: random(1000000) * 0.0001vw;
        $random-offset: random_range(-100000, 100000) * 0.0001vw;
        $random-x-end: $random-x +$random-offset;
        $random-x-end-yoyo: $random-x +($random-offset / 2);
        $random-yoyo-time: random_range(30000, 80000) / 100000;
        $random-yoyo-y: $random-yoyo-time * 100vh;
        $random-scale: random(10000) * 0.0001;
        $fall-duration: random_range(10, 30) * 1s;
        $fall-delay: random(30) * -1s;

        &:nth-child(#{$i}) {
          opacity: random(10000) * 0.0001;
          transform: translate($random-x, -10px) scale($random-scale);
          animation: fall-#{$i} $fall-duration $fall-delay linear infinite;
        }

        @keyframes fall-#{$i} {
          #{percentage($random-yoyo-time)} {
            transform: translate($random-x-end, $random-yoyo-y) scale($random-scale);
          }

          to {
            transform: translate($random-x-end-yoyo, 100vh) scale($random-scale);
          }
        }
      }
    }
  }
}

#app {
  width: 100%;
  max-width: min(1400px, 80vw);

  .mplayer {
    width: 100%;
  }
}

@media (max-width: 768px) {
  #app {
    max-width: initial;
    height: 100%;

    .mplayer {}
  }
}

.helper {
  position: fixed;
  top: 0;
}
</style>