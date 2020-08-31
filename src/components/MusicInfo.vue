<template>
  <div class="player-middle" v-show="show">
    <MusicImage />
    <p class="music-name">{{_playlist[_play.nowPlaying].musicName}}</p>
    <p class="music-author">{{_playlist[_play.nowPlaying].musicAuthor}}</p>
    <div class="progressbar">
      <div class="timetext">
        <span id="now">{{drag? nowTime : nowLength}}</span>
        <span id="length">{{musicLength}}</span>
      </div>
      <div class="timebar_out" @click="changeTime($event)">
        <div
          class="timebar_in"
          :style="{width: drag? nowTimeLength + 'px' :(Math.floor((_play.playTime / musicDuration) * 100) + '%'),
            transition: (drag)? 'clear' : 'all 0.2s ease-out'}"
        >
          <span class="bar_point" id="bar_point" @mousedown="handelMouseDrag($event)"></span>
        </div>
      </div>
    </div>
  </div>
  <audio :src="_playlist[_play.nowPlaying].musicUrl" autoplay="autoplay" id="music"></audio>
</template>
<script>
import MusicImage from "./MusicImage";
import { mapState } from "vuex";
import { mapMutations } from "vuex";
export default {
  name: "MusicInfo",
  data() {
    return {
      seconds: 0,
      intPlaying: null,
      left: 0,
      musicLength: "...",
      nowLength: "0:00",
      musicDuration: 0,
      drag: false,
      nowTime: 0,
      nowTimeLength: 0,
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
  components: {
    MusicImage,
  },
  methods: {
    ...mapMutations(["next", "goTime", "setTime"]),
    musicLengthCal(_music) {
      return (
        parseInt(_music.duration / 60) + ":" + parseInt(_music.duration % 60)
      );
    },
    nowLengthCal(_music) {
      return (
        parseInt(_music.currentTime / 60) +
        ":" +
        parseInt(_music.currentTime % 60)
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
        if (parseInt(e.clientX - otimebar_in.offsetLeft) < 0) {
          this.left = 0;
        } else if (
          e.clientX - otimebar_in.offsetLeft >
          otimebar_out.offsetWidth
        ) {
          this.left = otimebar_out.offsetWidth;
        } else this.left = e.clientX - otimebar_in.offsetLeft;
        console.log("调整进度条" + this.left + "px");
        this.nowTimeLength = this.left + 5;
        this.nowTime =
          parseInt(
            ((this.left / otimebar_out.offsetWidth) * music.duration) / 60
          ) +
          ":" +
          parseInt(
            ((this.left / otimebar_out.offsetWidth) * music.duration) % 60
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
          this.left = null;
          this.drag = false;
        }
      };
    },
  },
  mounted() {
    document.getElementById("music").addEventListener("canplay", () => {
      this.musicLength = this.musicLengthCal(document.getElementById("music")); //音频加载完成后，获取时长
      this.musicDuration = document.getElementById("music").duration;
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
    // document.getElementById("music").addEventListener("timeupdate", () => {});
  },
  watch: {
    _nowPlaying(val, oldVal) {
      //普通的watch监听
      console.log("nowPlaying: " + val, oldVal);
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
  margin-bottom: 100px;
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

    .dark & {
      color: var(--dark_title_color);
    }
  }

  .music-author {
    color: var(--text_color);
    margin-bottom: 40px;
    font-size: var(--text_size);

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
}
</style>