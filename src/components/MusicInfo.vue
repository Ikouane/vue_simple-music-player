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
      <span id="music-tlrc">{{ tlrc_line }}</span>
    </div>
    <audio
      :src="_playlist[_play.nowPlaying].musicUrl"
      id="music"
      :autoplay="_isPlaying"
    ></audio>
    <!-- :autoplay="_isPlaying ? 'autoplay' : 'false'" 
      crossOrigin="anonymous"-->
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
      tlrc: "", //歌词（翻译）
      tlrc_line: "", //当前歌词（翻译）
      tlrcArray: [], //歌词数组（翻译）
      tlrcFormatArray: [], //歌词数组（格式化、翻译）
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
      "skipMusic",
      "setImageBackground",
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
      this.goTime({
        desTime: parseInt(
          ((event.clientX - otimebar_in.getBoundingClientRect().left) /
            otimebar_out.offsetWidth) *
            music.duration
        ),
      }); //不能使用 offsetLeft 代替 jq.offset().left
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
          this.goTime({
            desTime: parseInt(
              (this.left / otimebar_out.offsetWidth) * music.duration
            ),
          });
          this.nowLength = this.nowLengthCal(document.getElementById("music"));
          this.left = null;
          this.drag = false;
        }
      };
    },

    //将歌词JSON转化为数组
    transToArray(lrc, tlrc = null) {
      //歌词数组
      this.lrcArray = [];
      //格式化歌词数组
      this.lrcFormatArray = [];
      //时间数组
      this.timeArray = [];

      // 歌词数组（翻译）
      this.tlrcArray = [];
      //格式化歌词数组
      this.tlrcFormatArray = [];

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

            this.lrcFormatArray[timeMatch] =
              this.lrcArray[index].substring(length);
          } else console.warn(this.timeArray);
        }

        if (tlrc) this.tlrcArray = tlrc.split("\n").sort();
        for (let index = 0; index < this.tlrcArray.length; index++) {
          let timeMatch = pattern.exec(this.tlrcArray[index]);
          if (timeMatch) {
            let length = timeMatch.toString().length;
            if (timeMatch.toString().length < 11) {
              timeMatch = timeMatch.toString().replace("]", "0]");
            }

            this.tlrcFormatArray[timeMatch] =
              this.tlrcArray[index].substring(length);
          } else console.warn(this.timeArray);
        }

        for (const key in this.lrcFormatArray) {
          this.timeArray.push(key);
        }

        // return this.lrcFormatArray;
      } else {
        this.getLrc();
      }
    },

    //获取歌词（byid）
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
          } else {
            _this.lrc = response.data.lrc.lyric;
            _this.tlrc = response.data.tlyric.lyric;
          }
          this.transToArray(_this.lrc, _this.tlrc); //Fix
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

    //获取此时歌词（bytime）
    getTLrc_line(time) {
      if (time) {
        for (let index = 0; index < this.timeArray.length; index++) {
          if (time < this.timeArray[index]) {
            return this.tlrcFormatArray[this.timeArray[index - 1]];
          }
        }
        if (time >= this.timeArray[this.timeArray.length - 1]) {
          return this.tlrcFormatArray[
            this.timeArray[this.timeArray.length - 1]
          ]; //最后一句歌词处理
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
        this.setTime($music.currentTime);
        //console.log(document.getElementById("music").currentTime);
      }
    }, 100);

    $music.addEventListener("error", () => {
      console.log("无法播放，已为您跳过。");
      this.next({ hasWrong: "wrong" });
      this.skipMusic(this._play.nowPlaying);
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

      this.tlrc_line = this.getTLrc_line(
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

      const el_music_name = document.getElementById("music-name");

      setTimeout(() => {
        // 判断歌名是否超长
        if (parseInt(el_music_name.offsetWidth) >= 324) {
          // 超长则滚动
          el_music_name.classList.add("animation");
          el_music_name.style.setProperty(
            "--overflow_width_name",
            `${
              parseInt(el_music_name.offsetWidth) - 360 < 0
                ? "0"
                : 360 - parseInt(el_music_name.offsetWidth)
            }px`
          );
        } else el_music_name.classList.remove("animation");
      }, 0);

      this.setImageBackground();

      this.getLrc();
      this.getAuthor();

      // var url = this._playlist[val].musicUrl;
      // if (!window.AudioContext) {
      //   alert("您的浏览器不支持AudioContext");
      // } else {
      //   //创建上下文
      //   var ctx = new AudioContext();
      //   var source = null;
      //   //使用Ajax获取音频文件

      //   var request = new XMLHttpRequest();
      //   request.open("GET", url, true);
      //   request.responseType = "arraybuffer"; //配置数据的返回类型
      //   //加载完成
      //   request.onload = function () {
      //     var arraybuffer = request.response;
      //     ctx.decodeAudioData(
      //       arraybuffer,
      //       function (buffer) {
      //         //创建分析器
      //         var analyser = ctx.createAnalyser();
      //         source = ctx.createBufferSource();
      //         //将source与分析器链接
      //         source.connect(analyser);
      //         //将分析器与destination链接，这样才能形成到达扬声器的通路
      //         //analyser.connect(ctx.destination);
      //         //将解码后的buffer数据复制给source
      //         source.buffer = buffer;
      //         //播放
      //         //source.start(0);

      //         //开始绘制频谱图
      //         function drawSpectrum() {
      //           var canvas = document.getElementById("wrap"),
      //             cwidth = canvas.width,
      //             cheight = canvas.height - 2,
      //             meterWidth = 10, //能量条的宽度
      //             //gap = 2, //能量条的间距
      //             meterNum = 800 / (10 + 2), //计算当前画布上能画多少条
      //             ctx = canvas.getContext("2d");
      //           var capHeight = 2; //
      //           var array = new Uint8Array(analyser.frequencyBinCount);
      //           analyser.getByteFrequencyData(array);
      //           console.info(array.length);
      //           var step = Math.round(array.length / meterNum); //计算从analyser中的采样步长

      //           //清理画布
      //           ctx.clearRect(0, 0, cwidth, cheight);
      //           //定义一个渐变样式用于画图
      //           var gradient = ctx.createLinearGradient(0, 0, 0, 300);
      //           gradient.addColorStop(1, "#0f0");
      //           gradient.addColorStop(0.5, "#ff0");
      //           gradient.addColorStop(0, "#f00");
      //           ctx.fillStyle = gradient;
      //           //对信源数组进行抽样遍历，画出每个频谱条
      //           for (var i = 0; i < meterNum; i++) {
      //             var value = array[i * step];
      //             ctx.fillRect(
      //               i * 12 /*频谱条的宽度+条间距*/,
      //               cheight - value + capHeight,
      //               meterWidth,
      //               cheight
      //             );
      //           }
      //           requestAnimationFrame(drawSpectrum);
      //         }
      //         requestAnimationFrame(drawSpectrum);
      //       },
      //       function (e) {
      //         console.info("处理出错", e);
      //       }
      //     );
      //   };
      //   request.send();
      // }

      // var wrap = document.getElementById("wrap");
      // var cxt = wrap.getContext("2d");
      // //获取API
      // var context = new (window.AudioContext || window.webkitAudioContext)();
      // //加载媒体
      // var audio = document.getElementById("music");
      // //创建节点
      // var source = context.createMediaElementSource(audio);
      // //source.crossOrigin = "anonymous";
      // var analyser = context.createAnalyser();
      // //连接：source → analyser → destination
      // source.connect(analyser);
      // analyser.connect(context.destination);
      // //创建数据
      // var output = new Uint8Array(360);
      // (function drawSpectrum() {
      //   const width =
      //     document.getElementsByClassName("middle-image")[0].offsetWidth;

      //   analyser.getByteFrequencyData(output); //获取频域数据
      //   cxt.clearRect(0, 0, wrap.width, wrap.height);
      //   //画线条
      //   for (var i = 0; i < 360; i++) {
      //     var value = output[i] / 8; //<===获取数据
      //     cxt.beginPath();
      //     cxt.lineWidth = 2;
      //     cxt.moveTo(width / 2, width / 2);
      //     //R * cos (PI/180*一次旋转的角度数) ,-R * sin (PI/180*一次旋转的角度数)
      //     cxt.lineTo(
      //       Math.cos(((i * 1) / 180) * Math.PI) * (200 + value) + 300,
      //       -Math.sin(((i * 1) / 180) * Math.PI) * (200 + value) + 300
      //     );
      //     cxt.stroke();
      //   }
      //   //画一个小圆，将线条覆盖
      //   cxt.beginPath();
      //   cxt.lineWidth = 1;
      //   wrap.width = width;
      //   wrap.height = width;
      //   cxt.arc(width, width, width / 2, 0, 2 * Math.PI, false);
      //   cxt.fillStyle = "#fff";
      //   cxt.stroke();
      //   cxt.fill();
      //   //请求下一帧
      //   requestAnimationFrame(drawSpectrum);
      // })();
    },

    lrc_line() {
      //监听歌词改变
      const el_music_lrc = document.querySelector("#music-lrc");

      $(".music-lrc").shake(1, 20, 100, "top"); //$(this).shake(2,10,400); src:https://www.oschina.net/code/snippet_5189_6334

      setTimeout(() => {
        console.warn("歌词变更");

        // 判断歌词是否超长
        if (parseInt(el_music_lrc.offsetWidth) >= 324) {
          // 超长则滚动
          el_music_lrc.style.setProperty(
            "--overflow_width_lrc",
            `${324 - parseInt(el_music_lrc.offsetWidth)}px`
          );
          $("#music-lrc").css(
            "--overflow_width_lrc",
            324 - parseInt(el_music_lrc.offsetWidth) + "px"
          );
          el_music_lrc.classList.add("goScroll");
        } else {
          el_music_lrc.classList.remove("goScroll");
          el_music_lrc.style.setProperty("--overflow_width_lrc", `0px`);
        }
      }, 0);
    },

    tlrc_line() {
      setTimeout(() => {
        // 判断歌词是否超长
        if (
          parseInt(document.getElementById("music-tlrc").offsetWidth) >= 324
        ) {
          // 超长则滚动
          $("#music-tlrc").css(
            "--overflow_width_lrc",
            324 -
              parseInt(document.getElementById("music-tlrc").offsetWidth) +
              "px"
          );
          $("#music-tlrc").addClass("goScroll");
        } else {
          $("#music-tlrc").removeClass("goScroll");
          $("#music-tlrc").css("--overflow_width_lrc", "0px");
        }
      });
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
  margin-bottom: 40px; //100px
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
          transform: translateX(var(--overflow_width_name));
        }
        100% {
          transform: translateX(0%);
        }
      }

      display: inline-block;
      white-space: nowrap;

      &.animation {
        animation: gothrough 10s ease-in-out 3;
      }
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
    height: 50px;
    color: var(--title_color);
    width: 324px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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

      &:last-child {
        margin-top: 4px;
        color: var(--text_color);
      }

      .dark & {
        color: var(--dark_title_color);

        &:last-child {
          color: var(--dark_text_color);
        }
      }
    }
  }
}
</style>