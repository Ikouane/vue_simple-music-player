<template>
  <div class="player-middle" :class="{ mini: _miniMode }" v-show="show">
    <template v-if="_miniMode">
      <div class="flex">
        <p class="music-name" ref="music-name__wrapper">
          <span :style="musicNameOverflowWidth" :class="{ animation: musicNameOverflowWidth, paused: !_isPlaying }"
            ref="music-name">{{
                _playlist[_play.nowPlaying].musicName
            }} {{
    _playlist[_play.nowPlaying].musicAlia ? "(" + _playlist[_play.nowPlaying].musicAlia + ")" : ""
}}</span>
        </p>
        <p class="music-author">
          {{ _playlist[_play.nowPlaying].musicAuthor }}
          <span v-if="!_miniMode" id="aboutAuthor">{{ aboutAuthor }}</span>
        </p>
      </div>
    </template>
    <template v-else>
      <p class="music-name" ref="music-name__wrapper">
        <span :style="musicNameOverflowWidth" :class="{ animation: musicNameOverflowWidth, paused: !_isPlaying }"
          ref="music-name">{{ _playlist[_play.nowPlaying].musicName }}</span>
        <span class="alia" id="music-alia">{{
            _playlist[_play.nowPlaying].musicAlia
        }}</span>
      </p>
      <p class="music-author">
        {{ _playlist[_play.nowPlaying].musicAuthor }}
        <span v-if="!_miniMode" id="aboutAuthor">{{ aboutAuthor }}</span>
      </p>
    </template>
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
      <div class="timebar_out" @click="changeTime($event)" title="点击调整进度(←,→)">
        <div class="timebar_in" :style="{
          width: drag
            ? nowTimeLength + 'px'
            : Math.floor((_play.playTime / musicDuration) * 100) + '%',
          transition: drag ? 'clear' : 'all 0.2s ease-out',
        }">
          <svg v-if="_play.mode == 'pink'" class="icon bar_point" @mousedown="handelMouseDrag($event)" title="拖动进度"
            viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
            <path
              d="M512 265.4c-76-76-199.2-76-275.2 0s-76 199.2 0 275.2L512 815.6l275.2-275.2c76-76 76-199.2 0-275.2-76-75.8-199.2-75.8-275.2 0.2z"
              class="bg"></path>
            <path
              d="M787.2 265.4c-45.2-45.2-107.2-63.6-166-54.8 40 5.8 78.4 24.2 109 54.8 76 76 76 199.2 0 275.2L483.6 787.2l28.4 28.4 275.2-275.2c76-75.8 76-199 0-275z"
              class="bg"></path>
            <path
              d="M512 758.6L293.8 540.4c-76-76-76-199.2 0-275.2 30.8-30.8 69.2-49 109-54.8-58.8-8.6-120.8 9.6-166 54.8-76 76-76 199.2 0 275.2L512 815.6v-57z"
              class="bg"></path>
            <path
              d="M512 825.4c-2.4 0-5-1-6.8-2.8L230 547.4c-79.6-79.6-79.6-209.2 0-289 38.6-38.6 89.8-59.8 144.4-59.8 51.4 0 99.8 18.8 137.6 53.2 80-73 204.6-70.8 282 6.6 79.6 79.6 79.6 209.2 0 289L518.8 822.6c-1.8 1.8-4.4 2.8-6.8 2.8zM374.4 218c-49.4 0-95.8 19.2-130.8 54.2-72 72-72 189.4 0 261.4L512 802l268.4-268.4c72-72 72-189.4 0-261.4-72-72-189.4-72-261.4 0-3.8 3.8-10 3.8-13.8 0-35-35-81.4-54.2-130.8-54.2z"
              class="bg"></path>
            <path
              d="M414.8 416.8c-5.4 0-9.8-4.4-9.8-9.8V368c0-5.4 4.4-9.8 9.8-9.8s9.8 4.4 9.8 9.8v39c-0.2 5.4-4.6 9.8-9.8 9.8z"
              fill="#FFFFFF"></path>
            <path
              d="M434.2 397.4h-39c-5.4 0-9.8-4.4-9.8-9.8s4.4-9.8 9.8-9.8h39c5.4 0 9.8 4.4 9.8 9.8-0.2 5.4-4.4 9.8-9.8 9.8zM336.8 358.4c-5.4 0-9.8-4.4-9.8-9.8v-39c0-5.4 4.4-9.8 9.8-9.8s9.8 4.4 9.8 9.8v39c0 5.4-4.4 9.8-9.8 9.8z"
              fill="#FFFFFF"></path>
            <path
              d="M356.4 339h-39c-5.4 0-9.8-4.4-9.8-9.8s4.4-9.8 9.8-9.8h39c5.4 0 9.8 4.4 9.8 9.8-0.2 5.4-4.4 9.8-9.8 9.8z"
              fill="#FFFFFF"></path>
            <path
              d="M356.4 475.2c-5.4 0-9.8-4.4-9.8-9.8v-39c0-5.4 4.4-9.8 9.8-9.8s9.8 4.4 9.8 9.8v39c-0.2 5.4-4.4 9.8-9.8 9.8z"
              fill="#FFFFFF"></path>
            <path d="M375.8 455.8h-39c-5.4 0-9.8-4.4-9.8-9.8s4.4-9.8 9.8-9.8h39c5.4 0 9.8 4.4 9.8 9.8s-4.4 9.8-9.8 9.8z"
              fill="#FFFFFF"></path>
            <path
              d="M496.4 725l-65.2-172-23.8 48.6H161.8v-38.8h221.2l52.6-107.6 53.2 139.8 62.2-248.8 54 216.6h257.2v38.8H574.6l-23.6-94.8z"
              fill="#f6c7c7"></path>
            <path d="M823.4 562.8h39v39h-39z" fill="#f6c7c7"></path>
            <path d="M161.8 562.8h39v39H161.8z" fill="#f6c7c7"></path>
            <path
              d="M496.4 734.8c-4 0-7.6-2.4-9-6.2L430 577.4l-13.8 28.4c-1.6 3.4-5 5.4-8.8 5.4H161.8c-5.4 0-9.8-4.4-9.8-9.8v-39c0-5.4 4.4-9.8 9.8-9.8h215.2l50-102c1.8-3.4 5.4-5.6 9.2-5.4 3.8 0.2 7.2 2.6 8.6 6.2l42 110.8L541.4 344c1-4.4 5-7.4 9.4-7.4s8.4 3 9.4 7.4l52.2 209H862c5.4 0 9.8 4.4 9.8 9.8v39c0 5.4-4.4 9.8-9.8 9.8H574.6c-4.4 0-8.4-3-9.4-7.4l-14.2-57.2-45.2 180.4c-1 4.2-4.6 7.2-8.8 7.4-0.2-0.2-0.4 0-0.6 0z m-65.2-191.6h0.4c3.8 0.2 7.2 2.6 8.6 6.2l54.2 143 47-188.2c1-4.4 5-7.4 9.4-7.4s8.4 3 9.4 7.4l21.8 87.6h270.2v-19.4H605c-4.4 0-8.4-3-9.4-7.4l-44.6-178.6-52.8 211c-1 4.2-4.6 7.2-8.8 7.4-4.2 0.2-8.2-2.2-9.6-6.2l-45-118.8-42.8 87.4c-1.6 3.4-5 5.4-8.8 5.4H171.4v19.4h229.8l21.2-43.2c1.6-3.4 5-5.6 8.8-5.6z"
              fill="#f6c7c7"></path>
          </svg>
          <span v-else class="bar_point" id="bar_point" @mousedown="handelMouseDrag($event)" title="拖动进度"></span>
        </div>
      </div>
    </div>
    <div v-if="!_miniMode" class="music-lrc" ref="music-lrc__wrapper">
      <label class="lrc_wrapper" :data-before="lrc_line__prev" :data-after="lrc_line__next"
        :class="{ animate: shouldAnimate }" @animationend="animationEnded">
        <span id="music-lrc" ref="music-lrc">
          {{ lrc_line.now }}
        </span>
      </label>
      <label v-if="
        tlrc_line.prev != '' || tlrc_line.now != '' || tlrc_line.next != ''
      " class="lrc_wrapper" :data-before="tlrc_line__prev" :data-after="tlrc_line__next"
        :class="{ animate: shouldAnimate }" @animationend="animationEnded">
        <span id="music-tlrc" ref="music-tlrc">{{ tlrc_line.now }}</span>
      </label>
    </div>
    <audio ref="music" :src="_playlist[_play.nowPlaying].musicUrl" id="music" :autoplay="_isPlaying"
      crossorigin="anonymous"></audio>
    <!-- :autoplay="_isPlaying ? 'autoplay' : 'false'" 
      -->
  </div>
</template>
<script>
import { mapState, mapMutations, mapActions, mapGetters } from "vuex";
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
      musicId: null, // 音乐id
      shouldAnimate: false,
      lrc_line__prev: "",
      lrc_line__next: "",
      tlrc_line__prev: "",
      tlrc_line__next: "",
      musicNameOverflowWidth: 0,
      audioCtx: null,
    };
  },
  props: {
    show: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapState(["_play", "_playlist", "_userTouch", "_miniMode", "_mainColor"]),
    ...mapGetters(["getAnonymous", "getPlayMode", "getNextMusicIndex"]),
    _nowPlaying() {
      return this._play.nowPlaying;
    },
    _isPlaying() {
      return this._play.isPlaying;
    },
  },
  methods: {
    ...mapMutations([
      "prev",
      "next",
      "goTime",
      "setTime",
      "musicFadeOut",
      "musicFadeIn",
      "pause",
      "setStore",
      "skipMusic",
      "setImageBackground",
      "setMsg",
    ]),

    ...mapActions(["retryAfterPlayFail", "getMusicUrl"]),

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
      const music = this.$refs["music"],
        otimebar_out = document.getElementsByClassName("timebar_out")[0],
        otimebar_in = document.getElementsByClassName("timebar_in")[0];
      if (this._playlist[this._nowPlaying].playEndTime) {
        this.setMsg({
          message: "您调整了进度，区间播放已取消",
        });
        this._playlist[this._nowPlaying].playEndTime = null;
      }
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
      const music = this.$refs["music"],
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
          this.nowLength = this.nowLengthCal(this.$refs["music"]);
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

      if (this.musicId != _this._playlist[_this._play.nowPlaying].musicId) {
        this.musicId = _this._playlist[_this._play.nowPlaying].musicId;
        Axios.get(
          "https://api.weyoung.tech/vue_simple-music-player/get_v3.php?method=lrc&id=" +
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
            _this.transToArray(_this.lrc, _this.tlrc); //Fix
          })
          .catch(function (error) {
            // 请求失败处理
            console.log(error);
          });
      } else {
        console.log("无需重复获取");
      }
    },

    //获取此时歌词（bytime）
    getLrc_line(time) {
      if (time) {
        for (let index = 0; index < this.timeArray.length; index++) {
          if (time < this.timeArray[index]) {
            return {
              prev: this.lrcFormatArray[this.timeArray[index - 2]] || "",
              now: this.lrcFormatArray[this.timeArray[index - 1]] || "",
              next: this.lrcFormatArray[this.timeArray[index]] || "",
            };
          }
        }
        if (time >= this.timeArray[this.timeArray.length - 1]) {
          return {
            prev:
              this.lrcFormatArray[this.timeArray[this.timeArray.length - 2]] ||
              "",
            now:
              this.lrcFormatArray[this.timeArray[this.timeArray.length - 1]] ||
              "",
            next: "",
          }; //最后一句歌词处理
        } else return "";
      }
    },

    //获取此时歌词（bytime）
    getTLrc_line(time) {
      if (time) {
        for (let index = 0; index < this.timeArray.length; index++) {
          if (time < this.timeArray[index]) {
            return {
              prev: this.tlrcFormatArray[this.timeArray[index - 2]] || "",
              now: this.tlrcFormatArray[this.timeArray[index - 1]] || "",
              next: this.tlrcFormatArray[this.timeArray[index]] || "",
            };
          }
        }
        if (time >= this.timeArray[this.timeArray.length - 1]) {
          return {
            prev:
              this.tlrcFormatArray[this.timeArray[this.timeArray.length - 2]] ||
              "",
            now:
              this.tlrcFormatArray[this.timeArray[this.timeArray.length - 1]] ||
              "",
            next: "",
          }; //最后一句歌词处理
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
        "https://api.weyoung.tech/vue_simple-music-player/get_v3.php?method=author&sid=" +
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

    animationEnded() {
      this.shouldAnimate = false;
    },

    scrollMusicName() {
      let el_music_name = null;

      this.$nextTick(() => {
        el_music_name = this.$refs["music-name"];

        // 判断歌名是否超长
        if (
          parseInt(
            el_music_name.offsetWidth -
            this.$refs["music-name__wrapper"].getBoundingClientRect().width
          ) > 0
        ) {
          // 超长则滚动
          this.musicNameOverflowWidth = `--overflow_width_name: ${parseInt(
            this.$refs["music-name__wrapper"].getBoundingClientRect().width
          ) - parseInt(el_music_name.offsetWidth)
            }px`;
        } else this.musicNameOverflowWidth = 0;
      });
    }
  },

  mounted() {
    //window.vue = this; //开放Vue
    const $music = this.$refs["music"];

    $music.addEventListener("canplay", () => {
      this.musicLength = this.musicLengthCal($music); //音频加载完成后，获取时长
      this.musicDuration = $music.duration;

      // NOTE: 添加metadata信息

      if ("mediaSession" in window.navigator) {
        let {
          musicName: title,
          musicAuthor: artist,
          musicImage: artwork,
        } = this._playlist[this._nowPlaying];

        window.navigator.mediaSession.metadata = new window.MediaMetadata({
          title,
          artist,
          album: "Podcast Name",
          artwork: [{ src: artwork.replace("http:", "") }],
        });

        window.navigator.mediaSession.setActionHandler("play", () => {
          this.musicFadeIn();
        });
        window.navigator.mediaSession.setActionHandler("pause", () => {
          this.musicFadeOut();
        });
        window.navigator.mediaSession.setActionHandler("previoustrack", () => {
          this.prev();
        });
        window.navigator.mediaSession.setActionHandler("nexttrack", () => {
          this.next({ isForce: true });
        });
      }

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

      this.scrollMusicName();

      const _this = this;

      if (
        navigator.userAgent.match(
          /(iPhone|iPod|ios|iOS|iPad)/i
        )
      ) {
        // 
      } else {
        // 获取 ID 为 "oscilloscope" 的画布
        let canvas = document.querySelector(".visualizations");
        let cxt = canvas.getContext("2d");

        if (this._userTouch && !this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          let analyser = this.audioCtx.createAnalyser();

          // 根据 DOM 创建 source
          let source = this.audioCtx.createMediaElementSource(this.$refs["music"]);
          // 将资源连接到分析器
          source.connect(analyser);
          // 分析器连接到音频对象
          analyser.connect(this.audioCtx.destination);
          analyser.fftSize = 2048;

          // 获取到屏幕倒是是几倍屏。
          let getPixelRatio = function (context) {
            let backingStore = context.backingStorePixelRatio ||
              context.webkitBackingStorePixelRatio ||
              context.mozBackingStorePixelRatio ||
              context.msBackingStorePixelRatio ||
              context.oBackingStorePixelRatio ||
              context.backingStorePixelRatio || 1;
            return (window.devicePixelRatio || 1) / backingStore;
          };
          // iphone6下得到是2
          const pixelRatio = getPixelRatio(canvas);
          // 设置canvas的真实宽高
          canvas.width = pixelRatio * canvas.offsetWidth; // 想当于 2 * 375 = 750 
          canvas.height = pixelRatio * canvas.offsetHeight;

          const WIDTH = canvas.width, HEIGHT = canvas.height, r = canvas.width / 2;

          // 绘制一个当前音频源的示波器

          let output = new Uint8Array(360);
          (function drawSpectrum() {
            analyser.getByteFrequencyData(output);//获取频域数据
            cxt.clearRect(0, 0, WIDTH, HEIGHT);
            cxt.strokeStyle = _this._mainColor;
            //画线条
            for (let i = 0; i < 360; i++) {
              let value = output[i] / 8;//<===获取数据
              cxt.beginPath();
              cxt.lineWidth = 3;
              cxt.moveTo(r, r);
              //R * cos (PI/180*一次旋转的角度数) ,-R * sin (PI/180*一次旋转的角度数)
              cxt.lineTo(Math.cos((i * 1) / 180 * Math.PI) * (value - 5 + r / 1.2) + r, - Math.sin((i * 1) / 180 * Math.PI) * (value - 5 + r / 1.2) + r);
              cxt.stroke();
            }
            //画一个小圆，将线条覆盖
            // cxt.beginPath();
            // cxt.lineWidth = 1;
            // cxt.arc(WIDTH / 2, HEIGHT / 2, WIDTH / 2, 0, 2 * Math.PI, false);
            // cxt.fillStyle = "#fff";
            // cxt.stroke();
            // cxt.fill();
            //请求下一帧
            requestAnimationFrame(drawSpectrum);
          })();
        }
      }
    });

    $music.addEventListener("ended", () => {
      this.next(); //播放完成后，自动下一首
    });

    this.intPlaying = setInterval(() => {
      if (this._isPlaying) {
        this.nowLength = this.nowLengthCal($music);
        this.setTime($music.currentTime);
        //console.log(this.$refs["music"].currentTime);
      }
    }, 100);

    $music.addEventListener("error", () => {
      console.log("无法播放，重新获取链接");
      // if (this._playlist.length == 1) {
      //   this.pause(false);
      //   this.setMsg({
      //     message: `播放出错，已为您暂停`,
      //   });
      // } //else this.next({ hasWrong: "wrong" });
      this.setMsg({
        message: `播放出错，尝试重新播放`,
      });
      this.retryAfterPlayFail({ index: this._nowPlaying, needPlay: this._userTouch });
    });

    $music.addEventListener("timeupdate", () => {
      if (
        this._playlist[this._nowPlaying].playEndTime &&
        $music.currentTime >= this._playlist[this._nowPlaying].playEndTime
      ) {
        this.goTime({
          desTime: this._playlist[this._nowPlaying].playStartTime,
        });
        this.setMsg({ message: "已回到区间起始点" });
      }

      if ($music.currentTime >= $music.duration - 30) {
        // 预载歌曲
        if (!this._playlist[this.getNextMusicIndex].musicUrl && this.getPlayMode == "list")
          this.getMusicUrl({ musicIndex: this.getNextMusicIndex }).then((res) => {
            Axios.get(res);
            Axios.get(this._playlist[this.getNextMusicIndex].musicImage.replace("http://", "https://"));
          })
      }

      //TODO:防抖准备

      this.lrc_line = this.getLrc_line(
        `[${this.formatTime(parseInt($music.currentTime / 60)) +
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
        `[${this.formatTime(parseInt($music.currentTime / 60)) +
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
  },
  watch: {
    _nowPlaying(val, oldVal) {
      //监听歌曲改变
      console.log("nowPlaying: " + val, oldVal);

      this.setImageBackground();

      this.getLrc();
      this.getAuthor();

      this.scrollMusicName();
    },

    "lrc_line.now"() {
      let el_music_lrc = null,
        el_music_tlrc = null;
      //监听歌词改变
      this.$nextTick(() => {
        if (this.$refs["music-lrc"]) el_music_lrc = this.$refs["music-lrc"];
        if (this.$refs["music-tlrc"]) el_music_tlrc = this.$refs["music-tlrc"];
        if (el_music_lrc) el_music_lrc.style.opacity = 0;
        if (el_music_tlrc) el_music_tlrc.style.opacity = 0;

        if (this.time1) {
          clearTimeout(this.time1);
          console.log("防抖");
        }

        this.time1 = setTimeout(() => {
          if (el_music_lrc) el_music_lrc.style.opacity = 1;
          if (el_music_tlrc) el_music_tlrc.style.opacity = 1;
          this.time1 = null;
        }, 250);

        console.warn("歌词变更");

        this.lrc_line__prev = this.lrc_line.prev;
        this.lrc_line__next = this.lrc_line.now;
        this.tlrc_line__prev = this.tlrc_line.prev;
        this.tlrc_line__next = this.tlrc_line.now;

        this.shouldAnimate = true;

        // 判断歌词是否超长
        if (
          el_music_lrc &&
          parseInt(
            el_music_lrc.offsetWidth -
            this.$refs["music-lrc__wrapper"].getBoundingClientRect().width
          )
        ) {
          // 超长则滚动
          el_music_lrc.style.setProperty(
            "--overflow_width_lrc",
            `${parseInt(
              this.$refs["music-lrc__wrapper"].getBoundingClientRect().width
            ) - parseInt(el_music_lrc.offsetWidth)
            }px`
          );
          el_music_lrc.classList.add("goScroll");
        } else {
          el_music_lrc?.classList.remove("goScroll");
          el_music_lrc?.style.setProperty("--overflow_width_lrc", `0px`);
        }

        if (
          el_music_tlrc &&
          parseInt(
            el_music_tlrc.offsetWidth -
            this.$refs["music-lrc__wrapper"].getBoundingClientRect().width
          )
        ) {
          // 超长则滚动
          el_music_tlrc.style.setProperty(
            "--overflow_width_lrc",
            `${parseInt(
              this.$refs["music-lrc__wrapper"].getBoundingClientRect().width
            ) - parseInt(el_music_tlrc.offsetWidth)
            }px`
          );
          el_music_tlrc.classList.add("goScroll");
        } else {
          el_music_tlrc?.classList.remove("goScroll");
          el_music_tlrc?.style.setProperty("--overflow_width_lrc", `0px`);
        }
      });
    },

    // TODO: 修复scroll计算不准的问题
    aboutAuthor() {
      //计算介绍滚动距离
      $("#aboutAuthor").css(
        "--overflow_time_aboutAuthor",
        parseInt(document.getElementById("aboutAuthor").offsetWidth) * 0.05 +
        "s"
      );
      $("#aboutAuthor").css(
        "--overflow_width_aboutAuthor",
        -this.$refs["music-lrc__wrapper"].getBoundingClientRect().width +
        36 -
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

$pink_main_color: var(--pink_main_color);
$pink_player_color: var(--pink_player_color);
$pink_active_color: var(--pink_active_color);
$pink_title_color: var(--pink_title_color);
$pink_text_color: var(--pink_text_color);
$pink_border_color: var(--pink_border_color);

.player-middle {
  &.mini {
    margin: initial;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    flex: 1;
    overflow: hidden;

    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;

      .music-name {
        margin-bottom: 0;
        width: initial;
        font-weight: initial;
        max-width: 130px;

        --title_size: 20px;
        --text_size: 14px;

        span {
          line-height: 120%;
        }
      }

      .music-author {
        margin-bottom: 0;
        height: initial;
        flex: 1;
        text-align: right;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  @media (max-width: 768px) {
    margin-bottom: 0.07rem;
  }

  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  align-items: center;
  margin: auto;
  margin-bottom: 40px; //100px
  width: 90%;

  color: $text_color;

  .dark & {
    color: $dark_text_color;
  }

  .pink & {
    color: $pink_text_color;
  }

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
      &.alia {
        display: block;
        font-size: var(--text_size);
        line-height: 20px;
        font-weight: normal;
      }

      line-height: 40px;

      @keyframes gothrough {

        0%,
        10% {
          transform: translateX(0);
        }

        50%,
        60% {
          transform: translateX(calc(var(--overflow_width_name) - 5px));
        }

        70%,
        100% {
          transform: translateX(0);
        }
      }

      display: inline-block;
      white-space: nowrap;

      &.animation {
        animation: gothrough 10s ease-in-out infinite;

        &.paused {
          animation-play-state: paused;
        }
      }
    }

    .dark & {
      color: var(--dark_title_color);
    }

    .pink & {
      color: var(--pink_title_color);
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
      animation: gothrough_author var(--overflow_time_aboutAuthor) linear infinite 3s;
    }

    .dark & {
      color: var(--dark_text_color);
    }

    .pink & {
      color: var(--pink_text_color);
    }
  }

  .progressbar {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .timetext {
      width: 100%;
      margin-left: auto;
      margin-right: auto;
      display: flex;
      justify-content: space-between;
      font-size: var(--time_size);
      margin-bottom: 10px;
    }

    .timebar_out {
      height: 6px;
      width: 100%;
      background-color: #7fa3ff;
      border-radius: 4px;
      box-shadow: inset 3px 3px 0px #d6e1ed, inset -3px -3px 0px #e8f3ff;
      cursor: pointer;

      .dark & {
        background-color: #171b1b;
        box-shadow: inset 1px 1px 1px #141717, inset -1px -1px 1px #4a4b4e;
      }

      .pink & {
        height: 4px;
        background-color: transparent;
        box-shadow: inset 3px 3px 3px #f3d5e8, inset -3px -3px 3px #f7e1ef;
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

      .pink & {
        height: 4px;
        box-shadow: inset 1px 1px 1px #f3d5e8, inset -1px -1px 1px #f7e1ef;
        background: linear-gradient(145deg, var(--pink_active_color), #f6c7c7);
      }
    }

    .bar_point {
      @keyframes shine {}

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

      .pink & {
        box-shadow: initial;
        border: none;
        background-color: initial;
        width: 36px;
        height: 36px;
        line-height: 36px;
        border-radius: initial;
        transform: translate(calc(-50% + 11px), calc(-50% - 0.5px));

        path.bg {
          fill: var(--pink_active_color);
        }
      }
    }
  }

  .music-lrc {
    @media (max-width: 768px) {
      margin-top: 0.02rem;
    }

    .lrc_wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      // align-items: center;
      // NOTE: 单行动画
      // overflow: hidden;
      white-space: nowrap;
      height: 50%;
      width: 100%;

      color: var(--text_color);

      .dark & {
        color: var(--dark_text_color);
      }

      .pink & {
        color: var(--pink_text_color);
      }
    }

    .lrc_wrapper::before,
    .lrc_wrapper::after {
      display: block;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      font-family: inherit;
      box-sizing: border-box;
      white-space: nowrap;
      line-height: 20px;
      margin-top: 4px;
      opacity: 0;
      width: 100%;
    }

    .lrc_wrapper::before {
      content: attr(data-before);
    }

    .lrc_wrapper::after {
      content: attr(data-after);
    }

    @keyframes placeholder-before {
      0% {
        transform: translateX(-50%) translateY(0%);
        opacity: 1;
      }

      100% {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
      }
    }

    @keyframes placeholder-after {
      0% {
        transform: translateX(-50%) translateY(100%);
        opacity: 0;
      }

      100% {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }

    .animate::before {
      animation: 0.25s placeholder-before ease-in-out;
    }

    .animate::after {
      animation: 0.25s placeholder-after ease-in-out;
    }

    .animate::before,
    .animate::after {
      animation-fill-mode: forwards;
    }

    margin-top: 16px;
    font-size: 14px;
    line-height: 14px;
    height: 50px;
    color: var(--title_color);
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    span {
      width: fit-content;
      min-width: 100%;
      line-height: 20px;
      display: inline-block;
      white-space: nowrap;
      color: var(--text_color);

      &.goScroll {
        @keyframes gothrough_lrc {
          0% {
            transform: translateX(5px);
          }

          80% {
            transform: translateX(calc(var(--overflow_width_lrc) - 5px));
          }

          100% {
            transform: translateX(5px);
          }
        }

        animation: gothrough_lrc 2s ease-in-out infinite 0.2s;
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

      .pink & {
        color: var(--pink_title_color);

        &:last-child {
          color: var(--pink_text_color);
        }
      }
    }
  }
}
</style>