<!--
 * @Author: ikouane
 * @PoweredBy: 未央宫©WeYounG
 * @Date: 2023-03-15 16:39:14
 * @LastEditTime: 2023-07-11 16:07:36
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
-->
<template>
  <div class="mask" @click.self="$emit('click-chat')">
    <div class="chat__container">
      <el-scrollbar height="400px" class="message__wrapper">
        <!-- 消息列表 -->
        <div v-for="(item, index) in store.state._message" :key="item" class="message__item"
          :class="{ 'welcome-message': item.type === 'room:join', right: item.uuid == store.state._account.uuid }">
          <!-- 发送时间 -->
          <span class="message__item-time"
            v-if="index == 0 || (index >= 1 && generateRelativeTime(item.time) != generateRelativeTime(store.state._message[index - 1].time))">{{
              generateRelativeTime(item.time) }}</span>
          <!-- 消息内容 -->
          <template v-if="item.type === 'room:join'">
            <span class="message__item-content">{{ (item.uuid === store.state._account.uuid ? '你' : item.username) +
              "加入了房间"
            }}</span>
          </template>
          <template v-if="item.type === 'room:addSong' || item.type === 'room:addSong-reply'">
            <span class="message__item-content add-song"
              :class="{ isPlaying: store.state._playList[store.state._play.nowPlaying].id == item.addition.id && store.state._play.isPlaying }">
              <div class="cover__wrapper" @click="playMusicById(item.addition.id)">
                <img class="cover" :src="formatMusicInfo(item.addition.id).cover" alt="" srcset="">
                <i class="fa fa-play cover_mask" aria-hidden="true"></i>
              </div>
              <span class="music_info">
                <span class="scroll-item">{{ formatMusicInfo(item.addition.id).name + " - " +
                  store.state.formatArtists(formatMusicInfo(item.addition.id).artist) }}</span>
              </span>
            </span>
          </template>
          <span v-if="item.type === 'room:message' || item.type === 'room:message-reply'" v-html="item.msg"
            class="message__item-content"></span>
        </div>
      </el-scrollbar>
      <div class="input-send-wrapper">
        <input type="text" v-model="msg" :ref="getInputRef" @keydown.enter="sendMessage" autofocus>
        <button @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, nextTick } from "vue";
import { useStore } from "vuex";
import moment from "moment";

const store = useStore();

moment.locale('zh-cn');

const msg = ref("");
let inputRef = ref(null)
const getInputRef = (el) => {
  inputRef.value = el
}

const nowDate = ref(moment().format("YYYY-MM-DD HH:mm:ss"));

setInterval(() => {
  nowDate.value = moment().format("YYYY-MM-DD HH:mm:ss");
}, 1000)

const generateRelativeTime = (time) => {
  // 判断是否是今天
  if (moment(time).format("YYYY-MM-DD") == moment(nowDate.value).format("YYYY-MM-DD")) {
    // 判断是否是同一小时
    if (moment(time).format("HH") == moment(nowDate.value).format("HH")) {
      // 判断是否是同一分钟
      if (moment(time).format("mm") == moment(nowDate.value).format("mm")) {
        return "刚刚"
      } else if (Math.abs(moment(time).format("mm") - moment(nowDate.value).format("mm")) <= 5) {
        return moment(time).from(nowDate.value);
      }
    }
    return moment(time).format("HH:mm");
  }
  return moment(time).calendar();
}

nextTick(() => {
  inputRef.value.focus();
  document.querySelector(".message__wrapper .el-scrollbar__wrap").scrollTo({
    top: document.querySelector(".message__wrapper .el-scrollbar__view").offsetHeight,
    left: 0,
  })
})

// setInterval(generateRelativeTime, 1000)

const formatMusicInfo = (musicId) => {
  return store.getters.getMusicInfoById(musicId)
}

const sendMessage = () => {
  if (msg.value == "") {
    store.commit("setMsg", { message: "输入内容不能为空", title: "通知" })
  }
  else if (msg.value.startsWith("/add ")) {
    let [musicId, needPlay, saveInRoom] = msg.value.split("/add ")[1].split(" ");
    needPlay = needPlay == 1;
    saveInRoom = saveInRoom == 1;
    if (isNaN(musicId)) {
      store.commit("setMsg", { message: "参数格式有误", title: "通知" })
      return
    }
    store.commit("addToList", { musicId, needPlay, saveInRoom });
    msg.value = "";
    inputRef.value.focus();
  }
  else {
    store.commit("sendMessage", {
      msg: msg.value
    })

    msg.value = "";
    inputRef.value.focus();
  }
}

const playMusicById = (musicId) => {
  if (store.state._playList[store.state._play.nowPlaying].id == musicId && store.state._play.isPlaying) {
    store.commit("musicFadeOut");
    return
  } else if (store.state._playList[store.state._play.nowPlaying].id == musicId && !store.state._play.isPlaying) {
    store.commit("musicFadeIn");
    return
  }
  store.commit("goPlay", { desIndex: store.getters.getMusicIndexById(musicId) });
}
</script>
<style lang='scss' scoped>
.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.dark .chat__container {
  background-color: rgba(0, 0, 0, 0.72);
  color: white;
}

.chat__container {
  position: fixed;
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(30px) contrast(120%);
  box-shadow: 0 0 20px rgba($color: #000000, $alpha: .2);
  top: 50%;
  left: 50%;
  width: 300px;
  padding: 20px;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 10px;

  .message__wrapper {

    &::v-deep .el-scrollbar__view {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 10px 0;

      .message__item {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        line-height: 120%;
        width: 100%;

        &::after {
          content: var(--message__item__after_content);
        }

        &:not(.welcome-message).right {
          align-items: flex-end;
        }

        span {
          margin: 0;
          padding: 0;
          display: block;
          word-break: break-all;
          font-family: 'Yuanti SC', 'Microsoft Yahei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 14px;

          &.message__item-time {
            color: var(--title_color);
            font-size: 12px;
            text-align: center;
            width: 100%;
            margin-top: 10px;

            .dark & {
              color: var(--dark_title_color);
            }
          }

          * {
            width: 100%;
            object-fit: 100%;
            object-fit: contain;
          }
        }

        &.welcome-message {
          text-align: center;

          span {
            color: var(--title_color);
            font-size: 12px;

            .dark & {
              color: var(--dark_title_color);
            }
          }

          &.right .message__item-content {
            color: var(--active_color);

            .dark & {
              color: var(--dark_active_color);
            }
          }
        }

        &:not(.welcome-message) {
          .message__item-content {
            padding: 6px 12px;
            width: fit-content;
            background-color: var(--player_color);
            color: var(--title_color);
            border-radius: 10px;
            margin-top: 4px;
            max-width: 80%;

            &.add-song {
              display: flex;
              flex-direction: column;
              align-items: center;
              font-size: 12px;
              gap: 4px;
              background-color: var(--active_color);
              border: 2px solid var(--active_color);
              box-shadow: inset 6px 6px 12px #708bd9, inset -6px -6px 12px #98bdff;
              overflow: hidden;

              &.isPlaying {
                .cover__wrapper {
                  .cover {
                    filter: initial;
                    animation-play-state: running;
                  }

                  .cover_mask {
                    display: none;
                  }
                }
              }

              .cover__wrapper {
                position: relative;
                width: 110px;
                height: 110px;
                cursor: pointer;

                .cover {
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  box-sizing: border-box;
                  border-radius: 50%;
                  overflow: hidden;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  filter: brightness(0.8);
                  animation: music_disc 40s linear infinite;
                  animation-play-state: paused;
                  border: 3px solid var(--border_color);

                  /*css3动画的旋转*/
                  @keyframes music_disc {
                    0% {
                      -webkit-transform: translate(-50%, -50%) rotate(0deg);
                      -ms-transform: translate(-50%, -50%) rotate(0deg);
                      -o-transform: translate(-50%, -50%) rotate(0deg);
                      transform: translate(-50%, -50%) rotate(0deg);
                    }

                    100% {
                      -webkit-transform: translate(-50%, -50%) rotate(360deg);
                      -ms-transform: translate(-50%, -50%) rotate(360deg);
                      -o-transform: translate(-50%, -50%) rotate(360deg);
                      transform: translate(-50%, -50%) rotate(360deg);
                    }
                  }

                  .dark & {
                    border-color: var(--dark_border_color);
                  }
                }

                .cover_mask {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  z-index: 1;
                  width: 20px;
                  height: 20px;
                }
              }

              .music_info {
                text-align: center;
                color: white;

                width: fit-content;
                max-width: 110px;
                display: inline-block;
                vertical-align: top;
                overflow: hidden;
                white-space: nowrap;

                .scroll-item {
                  width: auto;
                  display: block;
                  animation: scroll linear 4s alternate infinite;
                  float: left;
                  color: inherit;
                  font-size: 12px;
                }

                @keyframes scroll {
                  0% {
                    margin-left: 0;
                    transform: translateX(0);
                  }

                  10% {
                    margin-left: 0;
                    transform: translateX(0);
                  }

                  90% {
                    margin-left: 100%;
                    transform: translateX(-100%);
                  }

                  100% {
                    margin-left: 100%;
                    transform: translateX(-100%);
                  }
                }
              }

              .dark & {
                background-color: var(--dark_active_color);
                border: 2px solid var(--dark_active_color);
                box-shadow: inset 6px 6px 12px #c9460e, inset -6px -6px 12px #ff5e12;
              }
            }

            .dark & {
              background-color: var(--dark_player_color);
              color: var(--dark_title_color);
            }
          }

          &.right {
            .message__item-content {
              background-color: var(--active_color);
              color: white;

              .dark & {
                background-color: var(--dark_active_color);
                color: white;
              }
            }
          }
        }
      }
    }
  }
}

.input-send-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 32px;

  input {
    flex: 1;
    padding: 0 12px;
    outline: none;
    border: none;
    height: 100%;
    border-radius: 10px;
    background-color: var(--player_color);
    color: var(--title_color);
    border: 1px solid transparent;
    transition: .2s;

    &:focus {
      border-color: var(--active_color);
    }
  }

  button {
    border: none;
    outline: none;
    padding: 6px 12px;
    cursor: pointer;
    background-color: var(--active_color);
    color: white;
    height: 100%;
    border-radius: 10px;
    font-weight: bold;

    &:hover {
      filter: brightness(1.1);
    }
  }

  .dark & {
    input {
      background-color: var(--dark_player_color);
      color: var(--dark_title_color);

      &:focus {
        border-color: var(--dark_active_color);
      }
    }

    button {
      background-color: var(--dark_active_color);
    }
  }
}
</style>