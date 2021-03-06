<template>
  <div class="player-middle" v-show="show">
    <p class="music-name">
      <span id="music-name">{{ _playlist[_play.nowPlaying].musicName }}</span>
    </p>
    <p class="music-author">
      {{ _playlist[_play.nowPlaying].musicAuthor }}
      <span id="aboutAuthor">{{ aboutAuthor }}</span>
    </p>
    <div class="progressbar">
      <div class="timetext">
        <span id="now">
          {{
            drag
              ? nowTime
              : formatTime(parseInt(_play.playTime / 60)) +
                ":" +
                formatTime(parseInt(_play.playTime % 60))
          }}
        </span>
        <span id="length">{{ musicLength }}</span>
      </div>
      <div
        class="timebar_out"
        @click="changeTime($event)"
        title="点击调整进度(←,→)"
      >
        <div
          class="timebar_in"
          :style="{
            width: drag
              ? nowTimeLength + 'px'
              : Math.floor((_play.playTime / musicDuration) * 100) + '%',
            transition: drag ? 'clear' : 'all 0.2s ease-out',
          }"
        >
          <span
            class="bar_point"
            id="bar_point"
            @mousedown="handelMouseDrag($event)"
            title="拖动进度"
          ></span>
        </div>
      </div>
    </div>
    <div class="music-lrc">
      <span id="music-lrc">{{ lrc_line }}</span>
    </div>
    <audio
      :src="_playlist[_play.nowPlaying].musicUrl"
      id="music"
      :autoplay="_isPlaying"
    ></audio>
    <!-- :autoplay="_isPlaying ? 'autoplay' : 'false'" -->
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
      seconds: 0, //已播放时间, 默认为0
      intPlaying: null, //播放计时器
      left: 0, //播放条距左距离
      musicLength: "...", //歌曲长度（格式化）
      nowLength: "00:00", //当前播放长度
      musicDuration: 0, //歌曲长度
      drag: false, //是否拖动进度条
      nowTime: "00:00", //当前播放长度(拖动进度条时)
      nowTimeLength: 0, //当前播放长度(拖动进度条时)
      lrc: "", //歌词
      lrc_line: "", //当前歌词
      lrcArray: [], //歌词数组
      lrcFormatArray: [], //歌词数组（格式化）
      timeArray: [], //歌词时间数组
      aboutAuthor: "", //作者介绍
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
      //补0，格式化数字
      if (timeNum < 10) return "0" + timeNum;
      else return timeNum;
    },

    musicLengthCal(_music) {
      //返回歌曲总时间
      return (
        this.formatTime(parseInt(_music.duration / 60)) +
        ":" +
        this.formatTime(parseInt(_music.duration % 60))
      );
    },

    nowLengthCal(_music) {
      //返回当前播放时间
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
      this.goTime(
        parseInt(
          ((event.clientX - otimebar_in.getBoundingClientRect().left) /
            otimebar_out.offsetWidth) *
            music.duration
        )
      ); //不能使用 offsetLeft 代替 jq.offset().left
      this.nowLength = this.nowLengthCal(music);
    },

    handelMouseDrag(event) {
      const music = document.getElementById("music"),
        otimebar_out = document.getElementsByClassName("timebar_out")[0],
        otimebar_in = document.getElementsByClassName("timebar_in")[0];
      let e = event || window.event; //兼容性处理
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
        // FIXME: 防止选择内容--当拖动鼠标过快时候，弹起鼠标，bar也会移动
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

    //将歌词JSON转化为数组
    transToArray(lrc) {
      //歌词数组
      this.lrcArray = [];
      //格式化歌词数组
      this.lrcFormatArray = [];
      //时间数组
      this.timeArray = [];

      if (lrc) {
        this.lrcArray = lrc.split("\n").sort(); //先进行排序
        var pattern = /^[\\[]\d.{5,10}?]/; //提取时间
        for (let index = 0; index < this.lrcArray.length; index++) {
          let timeMatch = pattern.exec(this.lrcArray[index]);
          if (timeMatch) {
            let length = timeMatch.toString().length;
            if (timeMatch.toString().length < 11) {
              timeMatch = timeMatch.toString().replace("]", "0]");
            }

            this.lrcFormatArray[timeMatch] = this.lrcArray[index].substring(
              length
            );
          } else console.warn(this.timeArray);
        }

        for (const key in this.lrcFormatArray) {
          this.timeArray.push(key);
        }

        return this.lrcFormatArray;
      } else {
        this.getLrc();
      }
    },

    //获取歌词（byid）
    getLrc() {
      const _this = this;
      console.log(_this._playlist[_this._play.nowPlaying].musicId);
      Axios.get(
        "https://api.weyoung.tech/vue_simple-music-player/get.php?method=lrc&id=" +
          _this._playlist[_this._play.nowPlaying].musicId
      )
        .then((response) => {
          //console.log(response.data);
          if (response.data.nolyric) {
            _this.lrc = "[00:00.000]暂无歌词\n[99:99.999]暂无歌词";
          } else _this.lrc = response.data.lyric;
          this.transToArray(_this.lrc); //Fix
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },

    //获取此时歌词（bytime）
    getLrc_line(time) {
      if (time) {
        for (let index = 0; index < this.timeArray.length; index++) {
          if (time < this.timeArray[index]) {
            return this.lrcFormatArray[this.timeArray[index - 1]];
          }
        }
        if (time >= this.timeArray[this.timeArray.length - 1]) {
          return this.lrcFormatArray[this.timeArray[this.timeArray.length - 1]]; //最后一句歌词处理
        } else return "";
      }
    },

    formatNumber(num) {
      if (num < 10) num = "00" + num;
      else if (num < 100) num = "0" + num;
      return num;
    },

    getAuthor() {
      const _this = this;
      Axios.get(
        "https://api.weyoung.tech/vue_simple-music-player/get.php?method=author&sid=" +
          _this._playlist[_this._play.nowPlaying].musicId
      )
        .then((response) => {
          if (response.data.status === "200") {
            if (response.data.des == "") {
              this.aboutAuthor = "";
            } else this.aboutAuthor = "[作者介绍]" + response.data.des;
          }
        })
        .catch((error) => console.log(error));
    },
  },

  mounted() {
    //window.vue = this; //开放Vue
    const $music = document.getElementById("music");

    $music.addEventListener("canplay", () => {
      this.musicLength = this.musicLengthCal($music); //音频加载完成后，获取时长
      this.musicDuration = $music.duration;

      this.getLrc();
    });

    $music.addEventListener("pause", () => {
      //监听音乐暂停
      if (this._play.isPlaying) {
        console.log("音乐已暂停（外部）");
        // FIXME: 无法渐出
        this.pause();
      } else console.log("音乐已暂停（内部）");
    });

    $music.addEventListener("playing", () => {
      //监听音乐播放
      if (!this._play.isPlaying) {
        console.log("音乐已播放（外部）");
        this.musicFadeIn();
      } else console.log("音乐已播放（内部）");
    });

    $music.addEventListener("ended", () => {
      this.next(); //播放完成后，自动下一首
    });

    this.intPlaying = setInterval(() => {
      if (this._isPlaying) {
        this.nowLength = this.nowLengthCal($music);
        this.setTime(parseInt($music.currentTime));
        //console.log(document.getElementById("music").currentTime);
      }
    }, 1000);

    $music.addEventListener("error", () => {
      console.log("无法播放，已为您跳过。");
      this.next("wrong");
    });

    $music.addEventListener("timeupdate", () => {
      //TODO:防抖准备

      this.lrc_line = this.getLrc_line(
        `[${
          this.formatTime(parseInt($music.currentTime / 60)) +
          ":" +
          this.formatTime(parseInt($music.currentTime % 60)) +
          "." +
          this.formatNumber(
            parseFloat(
              $music.currentTime - parseInt($music.currentTime)
            ).toFixed(3) * 1000
          )
        }]`
      );
    });

    // 切换歌曲动画：
    $.fn.shake = function (
      intShakes /*Amount of shakes*/,
      intDistance /*Shake distance*/,
      intDuration /*Time duration*/,
      intDirection /* Shake direction, new Addtion*/
    ) {
      this.each(function () {
        var jqNode = $(this);
        jqNode.css({ position: "relative" });
        for (var x = 1; x <= intShakes; x++) {
          switch (intDirection) {
            case "top":
              jqNode
                .animate({ top: intDistance * -1 }, intDuration / intShakes / 4)
                .animate({ top: intDistance }, intDuration / intShakes / 2)
                .animate({ top: 0 }, intDuration / intShakes / 4);
              break;
            case "left":
              jqNode
                .animate(
                  { left: intDistance * -1 },
                  intDuration / intShakes / 4
                )
                .animate({ left: intDistance }, intDuration / intShakes / 2)
                .animate({ left: 0 }, intDuration / intShakes / 4);
              break;
          }
        }
      });
      return this;
    };
  },
  watch: {
    _nowPlaying(val, oldVal) {
      //监听歌曲改变
      console.log("nowPlaying: " + val, oldVal);
      $("#music-name").shake(1, 40, 100, "top");
      $(".music-author").shake(1, 30, 100, "top");

      $("#music-name").css(
        "--overflow_width",
        parseInt(document.getElementById("music-name").offsetWidth) - 360 < 0
          ? "0px"
          : 360 -
              parseInt(document.getElementById("music-name").offsetWidth) +
              "px"
      );

      this.getLrc();
      this.getAuthor();
    },

    lrc_line() {
      //监听歌词改变
      console.warn("歌词变更");
      $("#music-lrc").shake(1, 20, 100, "top"); //$(this).shake(2,10,400); src:https://www.oschina.net/code/snippet_5189_6334

      // 判断歌词是否超长
      if (parseInt(document.getElementById("music-lrc").offsetWidth) >= 324) {
        // 超长则滚动
        $("#music-lrc").css(
          "--overflow_width_lrc",
          324 -
            parseInt(document.getElementById("music-lrc").offsetWidth) +
            "px"
        );
        $("#music-lrc").addClass("goScroll");
      } else {
        $("#music-lrc").removeClass("goScroll");
        $("#music-lrc").css("--overflow_width_lrc", "0px");
      }
    },

    aboutAuthor() {
      //计算介绍滚动距离
      $("#aboutAuthor").css(
        "--overflow_time_aboutAuthor",
        parseInt(document.getElementById("aboutAuthor").offsetWidth) * 0.05 +
          "s"
      );
      $("#aboutAuthor").css(
        "--overflow_width_aboutAuthor",
        -324 -
          20 -
          parseInt(document.getElementById("aboutAuthor").offsetWidth) +
          "px"
      );
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
  @media (max-width: 768px) {
    margin-bottom: 0.07rem;
  }

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

    overflow: hidden;
    width: 100%;

    span {
      line-height: 40px;

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
    @media (max-width: 768px) {
      margin-bottom: 0.02rem;
    }

    color: var(--text_color);
    margin-bottom: 40px;
    font-size: var(--text_size);
    line-height: var(--title_size);
    overflow: hidden;
    height: 60px;
    width: 324px;

    span {
      font-size: 12px;
      line-height: 20px;
      margin-left: 100%;

      @keyframes gothrough_author {
        0% {
          //margin-left: 324px;
          opacity: 0;
          visibility: hidden;
        }
        3% {
          visibility: visible;
          opacity: 1;
        }
        70% {
          transform: translateX(var(--overflow_width_aboutAuthor));
          opacity: 1;
        }
        71% {
          opacity: 0;
          visibility: hidden;
        }
        100% {
          opacity: 0;
          visibility: hidden;
        }
      }

      display: inline-block;
      white-space: nowrap;
      animation: gothrough_author var(--overflow_time_aboutAuthor) linear
        infinite 3s;
    }

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

      position: absolute;
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
    @media (max-width: 768px) {
      margin-top: 0.02rem;
    }

    margin-top: 16px;
    font-size: 14px;
    line-height: 14px;
    height: 20px;
    color: var(--text_color);
    width: 324px;
    overflow: hidden;

    span {
      line-height: 20px;

      display: inline-block;
      white-space: nowrap;
      //animation: gothrough_lrc 2s ease-in-out infinite;

      &.goScroll {
        @keyframes gothrough_lrc {
          0% {
            transform: translateX(0%);
          }
          80% {
            transform: translateX(var(--overflow_width_lrc));
          }
          100% {
            transform: translateX(0%);
          }
        }
        animation: gothrough_lrc 2s ease-in-out infinite;
      }
    }

    .dark & {
      color: var(--dark_text_color);
    }
  }
}
</style>