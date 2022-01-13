<template>
  <div id="app">
    <Main />
  </div>
</template>

<script>
// import HelloWorld from "./components/HelloWorld.vue";
import Main from "./components/Main";
import "@/assets/index.css";
import { mapActions, mapMutations, mapState } from "vuex";
import Axios from "axios";

export default {
  name: "App",
  components: {
    // HelloWorld,
    Main,
  },
  computed: {
    ...mapState(["_play", "_playlist", "_dailyMode"]),
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
    ]),
    ...mapActions(["playSync"]),
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
      startTime = getQueryVariable("st"),
      dailyMode = getQueryVariable("daily");

    if (mid) {
      console.log("单音乐模式");
      const _this = this;
      Axios.get(
        `https://api.weyoung.tech/vue_simple-music-player/get.php?mid=${mid}`
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
          }
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
          let url = "https://api.weyoung.tech/vue_simple-music-player/get.php";
          if (dailyMode) {
            this.setDailyMode();
            url =
              "https://api.weyoung.tech/vue_simple-music-player/get.php?method=daily_recommend_songs";
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
          `https://api.weyoung.tech/vue_simple-music-player/get.php?pid=${pid}`
        )
          .then((response) => {
            // console.log(response.data);
            if (response.data.status == "wrong") this.setMsg("歌单不存在");
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
      } else if (key == 38 && e.altKey) {
        window.event.preventDefault(); //关闭浏览器快捷键
        console.log("点击Alt + 上箭头");
        _this.prev();
      } else if (key == 40 && e.altKey) {
        window.event.preventDefault(); //关闭浏览器快捷键
        console.log("点击Alt + 点击下箭头");
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
  },
};

window.onload = () => {
  if (window.innerWidth < 768) {
    const height = window.innerHeight + "px";
    document.querySelector("html").style.fontSize = height;
    document.getElementById("app").style.width =
      document.documentElement.clientWidth + "px";
    let timer = null;
    window.addEventListener("resize", () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const height = window.innerHeight + "px";
        document.querySelector("html").style.fontSize = height;
        document.getElementById("app").style.width =
          document.documentElement.clientWidth + "px";
        timer = null;
        console.log("窗口大小调整");
      }, 100);
    });
  }
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

@media (max-width: 768px) {
  #app {
    height: 1rem;
  }
}

.helper {
  position: fixed;
  top: 0;
}
</style>