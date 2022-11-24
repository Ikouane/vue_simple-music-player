<template>
  <div id="app">
    <Main />
  </div>
</template>

<script>
import Main from "./components/Main";
import "@/assets/index.css";
import { mapActions, mapMutations, mapState } from "vuex";
import Axios from "axios";
// import wx from "weixin-js-sdk";

export default {
  name: "App",
  components: {
    // HelloWorld,
    Main,
  },
  computed: {
    ...mapState(["_play", "_playlist", "_dailyMode", "_userTouch", "_miniMode"]),
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
      "setMiniMode"
    ]),
    ...mapActions(["playSync"]),
    initScreen() {
      if (window.innerWidth < 768) {
        document.querySelector("html").style.fontSize = window.innerHeight + "px";
      }
    }
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
      Axios.get(
        `https://api.weyoung.tech/vue_simple-music-player/get_v3.php?mid=${mid}`
      )
        .then((response) => {
          // console.log(response.data);
          _this.setStore(response.data);
          _this.setSingleMusicMode();
          if (response.data._play.mode === "night")
            document
              .querySelector("body")
              .setAttribute("style", "background-color:var(--dark_main_color)");

          if (startTime) {
            console.log("精准空降", startTime);
            _this.goTime({ desTime: startTime });
            _this._playlist[0].playStartTime = startTime;

            if (endTime) {
              _this._playlist[0].playEndTime = endTime;
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
      Axios.get(
        `https://api.weyoung.tech/vue_simple-music-player/get_v3.php?lid=${lid}`
      )
        .then((response) => {
          // console.log(response.data);
          _this.setStore(response.data);
          if (response.data._play.mode === "night")
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
          let url = "https://api.weyoung.tech/vue_simple-music-player/get_v3.php";
          if (dailyMode) {
            this.setDailyMode();
            url =
              "https://api.weyoung.tech/vue_simple-music-player/get_v3.php?method=daily_recommend_songs";
          }
          const _this = this;
          Axios.get(url)
            .then((response) => {
              // console.log(response.data);
              _this.setStore(response.data);
              if (response.data._play.mode === "night")
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
        Axios.get(
          `https://api.weyoung.tech/vue_simple-music-player/get_v3.php?pid=${pid}`
        )
          .then((response) => {
            // console.log(response.data);
            if (response.data.status == "wrong")
              this.setMsg({
                message: "歌单不存在",
              });
            else _this.setStore(response.data);
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
    document.onkeydown = function (e) {
      let key = e.keyCode || window.event.keyCode;
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
        _this.next();
      } else if (key == 38) {
        window.event.preventDefault(); //关闭浏览器快捷键
        console.log("点击上箭头");
        _this.setVolume("up");
        // _this.prev();
      } else if (key == 40) {
        window.event.preventDefault(); //关闭浏览器快捷键
        console.log("点击下箭头");
        _this.setVolume("down");
        // _this.next();
      }
    };

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

  &.imgBg {
    background-image: var(--backgroundImage);
    background-repeat: no-repeat;
    background-size: cover;
    backdrop-filter: saturate(180%) blur(20px) brightness(50%);
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