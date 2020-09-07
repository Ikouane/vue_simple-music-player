<template>
  <div class="player-middle" v-show="show">
    <p class="music-name">
      <span id="music-name">{{_playlist[_play.nowPlaying].musicName}}</span>
    </p>
    <p class="music-author">{{_playlist[_play.nowPlaying].musicAuthor}}</p>
    <div class="progressbar">
      <div class="timetext">
        <span id="now">
          {{drag? nowTime : (formatTime(parseInt(_play.playTime / 60)) +
          ":" +
          formatTime(parseInt(_play.playTime % 60)))}}
        </span>
        <span id="length">{{musicLength}}</span>
      </div>
      <div class="timebar_out" @click="changeTime($event)" title="点击调整进度(←,→)">
        <div
          class="timebar_in"
          :style="{width: drag? nowTimeLength + 'px' :(Math.floor((_play.playTime / musicDuration) * 100) + '%'),
            transition: (drag)? 'clear' : 'all 0.2s ease-out'}"
        >
          <span class="bar_point" id="bar_point" @mousedown="handelMouseDrag($event)" title="拖动进度"></span>
        </div>
      </div>
    </div>
    <div class="music-lrc">{{lrc_line}}</div>
    <audio
      :src="_playlist[_play.nowPlaying].musicUrl"
      :autoplay="_isPlaying?'autoplay':'false'"
      id="music"
    ></audio>
  </div>
</template>
<script>
import { mapState, mapMutations } from "vuex";
import Axios from "axios";
import $ from "jquery";
export default {
  name: "MusicInfo",
  data() {
    return {
      seconds: 0,
      intPlaying: null,
      left: 0,
      musicLength: "...",
      nowLength: "00:00",
      musicDuration: 0,
      drag: false,
      nowTime: "00:00",
      nowTimeLength: 0,
      lrc: "",
      lrc_line: "",
    };
  },
  props: {
    show: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapState(["_play", "_playlist"]),
    _nowPlaying() {
      return this._play.nowPlaying;
    },
    _isPlaying() {
      return this._play.isPlaying;
    },
  },
  components: {},
  methods: {
    ...mapMutations([
      "next",
      "goTime",
      "setTime",
      "musicFadeOut",
      "musicFadeIn",
      "pause",
      "setStore",
    ]),
    formatTime(timeNum) {
      if (timeNum < 10) return "0" + timeNum;
      else return timeNum;
    },
    musicLengthCal(_music) {
      return (
        this.formatTime(parseInt(_music.duration / 60)) +
        ":" +
        this.formatTime(parseInt(_music.duration % 60))
      );
    },
    nowLengthCal(_music) {
      return (
        this.formatTime(parseInt(_music.currentTime / 60)) +
        ":" +
        this.formatTime(parseInt(_music.currentTime % 60))
      );
    },
    changeTime(event) {
      //点击播放条更新进度
      const music = document.getElementById("music"),
        otimebar_out = document.getElementsByClassName("timebar_out")[0],
        otimebar_in = document.getElementsByClassName("timebar_in")[0];
      console.log(
        "调整进度条" +
          (event.clientX - otimebar_in.getBoundingClientRect().left) +
          "px"
      );
      // otimebar_in.style("width", event.clientX - otimebar_in.offsetLeft + "px");
      // this.left = event.clientX - otimebar_in.offsetLeft;
      this.goTime(
        parseInt(
          ((event.clientX - otimebar_in.getBoundingClientRect().left) /
            otimebar_out.offsetWidth) *
            music.duration
        )
      ); //不能使用 offsetLeft 代替 jq.offset().left
      this.nowLength = this.nowLengthCal(document.getElementById("music"));
    },
    handelMouseDrag(event) {
      const music = document.getElementById("music"),
        otimebar_out = document.getElementsByClassName("timebar_out")[0],
        otimebar_in = document.getElementsByClassName("timebar_in")[0];
      let e = event || window.event;
      console.log("开始拖拽");
      this.drag = true;
      console.log(e);
      document.onmousemove = (event) => {
        let e = event || window.event;
        if (
          parseInt(e.clientX - otimebar_in.getBoundingClientRect().left) < 0
        ) {
          this.left = 0;
        } else if (
          e.clientX - otimebar_in.getBoundingClientRect().left >
          otimebar_out.offsetWidth
        ) {
          this.left = otimebar_out.offsetWidth;
        } else this.left = e.clientX - otimebar_in.getBoundingClientRect().left;
        console.log("调整进度条" + this.left + "px");
        this.nowTimeLength = this.left + 5;
        this.nowTime =
          this.formatTime(
            parseInt(
              ((this.left / otimebar_out.offsetWidth) * music.duration) / 60
            )
          ) +
          ":" +
          this.formatTime(
            parseInt(
              ((this.left / otimebar_out.offsetWidth) * music.duration) % 60
            )
          );
        // $("#now").text(
        //   parseInt(((this.left / otimebar_out.offsetWidth) * music.duration) / 60) +
        //     ":" +
        //     parseInt(((this.left / otimebar_out.offsetWidth) * music.duration) % 60)
        // );
        // $(".timebar_in").css("width", this.left + "px");
        //防止选择内容--当拖动鼠标过快时候，弹起鼠标，bar也会移动，修复bug
        window.getSelection
          ? window.getSelection().removeAllRanges()
          : document.selection.empty();
      };
      document.onmouseup = () => {
        document.onmousemove = null; //弹起鼠标不做任何操作
        if (this.left == null) {
          console.log("未发生拖拽");
        } else {
          console.log("拖拽结束");
          this.goTime(
            parseInt((this.left / otimebar_out.offsetWidth) * music.duration)
          );
          this.nowLength = this.nowLengthCal(document.getElementById("music"));
          this.left = null;
          this.drag = false;
        }
      };
    },
    transToArray(lrc, time) {
      if (lrc) {
        let lrcArray = lrc.split("\n").sort(); //先进行排序
        let lrcFormatArray = [];
        var pattern = /^[\\[]\d.{5,10}?]/;
        /*  
      /^[\\[].{5,10}?]/;
      */
        let timeArray = [];
        for (let index = 0; index < lrcArray.length; index++) {
          let timeMatch = pattern.exec(lrcArray[index]);
          if (timeMatch) {
            let length = timeMatch.toString().length;
            if (timeMatch.toString().length < 11) {
              timeMatch = timeMatch.toString().replace("]", "0]");
            }

            lrcFormatArray[timeMatch] = lrcArray[index].substring(
              length //timeMatch.toString().length - 1
            );
          } else console.warn(timeArray);
        }
        if (time) {
          for (const key in lrcFormatArray) {
            timeArray.push(key);
          }
          //console.error(timeArray);
          for (let index = 0; index < timeArray.length; index++) {
            if (time < timeArray[index]) {
              //console.error(timeArray[index]);
              return lrcFormatArray[timeArray[index - 1]];
            }
          }
          if (time >= timeArray[timeArray.length - 1]) {
            return lrcFormatArray[timeArray[timeArray.length - 1]]; //最后一句歌词处理
          } else return "";
        }

        return lrcFormatArray;
      } else {
        this.getLrc();
      }
    },
    getLrc() {
      const _this = this;
      Axios.get(
        "https://api.weyoung.tech/vue_simple-music-player/get.php?method=lrc&id=" +
          _this._playlist[_this._play.nowPlaying].musicId
      )
        .then((response) => {
          //console.log(response.data);
          if (response.data.nolyric) {
            _this.lrc = "[00:00.000]暂无歌词\n[99:99.999]暂无歌词";
          } else _this.lrc = response.data.lyric;
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    formatNumber(num) {
      if (num < 10) num = "00" + num;
      else if (num < 100) num = "0" + num;
      return num;
    },
  },
  mounted() {
    //window.vue = this; //开放Vue

    document.getElementById("music").addEventListener("canplay", () => {
      this.musicLength = this.musicLengthCal(document.getElementById("music")); //音频加载完成后，获取时长
      this.musicDuration = document.getElementById("music").duration;

      this.getLrc();
    });

    document.getElementById("music").addEventListener("pause", () => {
      if (this._play.isPlaying) {
        console.log("音乐已暂停（外部）"); //无法渐出
        this.pause();
      } else console.log("音乐已暂停（内部）");
    });

    document.getElementById("music").addEventListener("playing", () => {
      if (!this._play.isPlaying) {
        console.log("音乐已播放（外部）");
        this.musicFadeIn();
      } else console.log("音乐已播放（内部）");
    });

    document.getElementById("music").addEventListener("ended", () => {
      this.next(); //播放完成后，自动下一首
    });

    this.intPlaying = setInterval(() => {
      if (this._isPlaying) {
        this.nowLength = this.nowLengthCal(document.getElementById("music"));
        this.setTime(parseInt(document.getElementById("music").currentTime));
        //console.log(document.getElementById("music").currentTime);
      }
    }, 1000);

    document.getElementById("music").addEventListener("timeupdate", () => {
      //防抖准备
      //console.log(e);
      this.lrc_line = this.transToArray(
        this.lrc,
        `[${
          this.formatTime(
            parseInt(document.getElementById("music").currentTime / 60)
          ) +
          ":" +
          this.formatTime(
            parseInt(document.getElementById("music").currentTime % 60)
          ) +
          "." +
          this.formatNumber(
            parseFloat(
              document.getElementById("music").currentTime -
                parseInt(document.getElementById("music").currentTime)
            ).toFixed(3) * 1000
          )
        }]`
      );
      console.log(
        `[${
          this.formatTime(
            parseInt(document.getElementById("music").currentTime / 60)
          ) +
          ":" +
          this.formatTime(
            parseInt(document.getElementById("music").currentTime % 60)
          ) +
          "." +
          this.formatNumber(
            parseFloat(
              document.getElementById("music").currentTime -
                parseInt(document.getElementById("music").currentTime)
            ).toFixed(3) * 1000
          )
        }]` + this.lrc_line
      );
    });
  },
  watch: {
    _nowPlaying(val, oldVal) {
      //普通的watch监听
      console.log("nowPlaying: " + val, oldVal);

      $("#music-name").css(
        "--overflow_width",
        parseInt(document.getElementById("music-name").offsetWidth) - 360 < 0
          ? "0px"
          : 360 -
              parseInt(document.getElementById("music-name").offsetWidth) +
              "px"
      );

      this.getLrc();
    },
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

.player-middle {
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  align-items: center;
  margin-bottom: 70px; //100px
  color: $text_color;

  p {
    margin: 0;
    padding: 0;
  }

  .music-name {
    color: var(--title_color);
    font-weight: bold;
    font-size: var(--title_size);
    margin-bottom: 10px;
    line-height: var(--title_size);

    overflow: hidden;
    width: 100%;

    span {
      @keyframes gothrough {
        0% {
          transform: translateX(0%);
        }
        50% {
          transform: translateX(var(--overflow_width));
        }
        100% {
          transform: translateX(0%);
        }
      }

      display: inline-block;
      white-space: nowrap;
      animation: gothrough 10s ease-in-out infinite;
    }

    .dark & {
      color: var(--dark_title_color);
    }
  }

  .music-author {
    color: var(--text_color);
    margin-bottom: 40px;
    font-size: var(--text_size);
    line-height: var(--title_size);

    .dark & {
      color: var(--dark_text_color);
    }
  }

  .progressbar {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .timetext {
      width: 90%;
      margin-left: auto;
      margin-right: auto;
      display: flex;
      justify-content: space-between;
      font-size: var(--time_size);
      margin-bottom: 10px;
    }

    .timebar_out {
      height: 6px;
      width: 90%;
      background-color: #7fa3ff;
      border-radius: 4px;
      box-shadow: inset 3px 3px 0px #d6e1ed, inset -3px -3px 0px #e8f3ff;
      cursor: pointer;

      .dark & {
        background-color: #171b1b;
        border-radius: 4px;
        box-shadow: inset 1px 1px 1px #141717, inset -1px -1px 1px #4a4b4e;
      }
    }

    .timebar_in {
      height: 6px;
      width: 0%;
      background-color: var(--active_color);
      border-radius: 4px;
      text-align: right;
      transition: all 0.2s ease-out;
      box-shadow: inset 1px 1px 0px #d6e1ed, inset -1px -1px 0px #e8f3ff;

      .dark & {
        box-shadow: inset 1px 1px 1px #141717, inset -1px -1px 1px #4a4b4e;
        background: linear-gradient(145deg, var(--dark_active_color), #e5bc28);
      }
    }

    .bar_point {
      @keyframes shine {
      }

      width: 10px;
      height: 10px;
      line-height: 10px;
      display: inline-block;
      border-radius: 10px;
      background-color: var(--active_color);
      border: 5px solid var(--player_color);
      transform: translate(-50%, -7px);
      margin-right: -20px;
      box-shadow: 2px 2px 6px #c6cdd6;
      cursor: pointer;

      .dark & {
        background-color: #e5bc28;
        border: 5px solid var(--dark_player_color);
        box-shadow: 2px 2px 6px #000000;
      }
    }
  }

  .music-lrc {
    margin-top: 16px;
    font-size: 14px;
    line-height: 14px;
    height: 14px;
    color: var(--text_color);

    .dark & {
      color: var(--dark_text_color);
    }
  }
}
</style>