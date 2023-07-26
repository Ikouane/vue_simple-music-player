<!--
 * @Author: ikouane
 * @PoweredBy: 未央宫©WeYounG
 * @Date: 2023-03-15 16:39:14
 * @LastEditTime: 2023-07-26 15:02:31
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
-->
<template>
  <div class="chat-mask" @click.self="closePopup" @mousedown="handleMouseDown">
    <!-- 信息缺失时填写信息 -->
    <div class="input__container" v-if="inputContainerShow">
      <p class="title">{{ store.state._store.account.username ? "怎么称呼～" : "初次见面，起个名字吧" }}</p>
      <div class="flex">
        <input type="text" :class="{ small: store.state._store.account.username }"
          v-model="store.state._store.account.username" :ref="getInputRef" placeholder="怎么称呼～" autofocus
          @keydown.enter="hideInputContainer">
        <transition name="fade">
          <span class="icon" v-if="store.state._store.account.username"
            :class="{ active: store.state._store.account.username }" @click="hideInputContainer">
            <i class="fa fa-check" aria-hidden="true"></i>
          </span>
        </transition>
      </div>
    </div>
    <div class="chat__container" v-else>
      <div class="chat__container-header">
        <div class="flex">
          <span class="title">{{ store.state._rid }} ({{ store.state._roomInfo.count }})</span>
          <span class="icon" @click="inputContainerShow = true;">
            <i class="fa fa-pen" aria-hidden="true"></i>
          </span>
        </div>
        <transition name="fade">
          <span class="now-typing" v-if="store.state._roomInfo.typingUser?.length">{{
            formatTypingUsers(store.state._roomInfo.typingUser)
          }}</span>
        </transition>
      </div>
      <div class="content__wrapper">
        <transition name="slide-from-left-to-right">
          <div class="currentLrc"
            v-if="store.state._play.isPlaying && (store.state._currentLrc.lrc || store.state._currentLrc.tlrc)">
            <span>
              <p>{{ store.state._currentLrc.lrc }}</p>
              <p>{{ store.state._currentLrc.tlrc }}</p>
            </span>
          </div>
        </transition>
        <el-scrollbar class="message__wrapper" :height="scrollBarHeight + 'px'">
          <!-- 消息列表 -->
          <div v-for="(item, index) in store.state._message" :key="item" class="message__item"
            :class="{ 'room-change-message': item.type === 'room:join' || item.type === 'room:leave' || item.type === 'room:create' || item.type === 'room:rejoin', leave: item.type === 'room:leave', right: item.uuid == store.state._store.account.uuid }">
            <!-- 发送时间 -->
            <span class="message__item-time"
              v-if="index == 0 || (index >= 1 && generateRelativeTime(item.time) != generateRelativeTime(store.state._message[index - 1].time))">{{
                generateRelativeTime(item.time) }}</span>

            <!-- 创建房间 -->
            <template v-if="item.type === 'room:create'">
              <span class="message__item-content">{{ item.msg.replace("#username#", item.username) }}</span>
            </template>

            <!-- TODO: 重新加入房间 -->
            <template v-if="item.type === 'room:rejoin'">
              <span class="message__item-content">{{ (item.uuid === store.state._store.account.uuid ? '你' :
                item.username)
                +
                "重新加入了房间"
              }}</span>
            </template>

            <!-- 消息内容 -->
            <template v-if="item.type === 'room:join'">
              <span class="message__item-content">{{ (item.uuid === store.state._store.account.uuid ? '你' :
                item.username)
                +
                "加入了房间"
              }}</span>
            </template>
            <template v-if="item.type === 'room:leave'">
              <span class="message__item-content">{{ (item.uuid === store.state._store.account.uuid ? '你' :
                item.username)
                +
                "离开了房间"
              }}</span>
            </template>
            <template v-if="checkType(item.type, 'room:addSong')">
              <span class="message__item-content add-song"
                :class="{ isPlaying: store.state._playList[store.state._play.nowPlaying].id == item.addition.id && store.state._play.isPlaying }">
                <div class="cover__wrapper" @click="playMusicById(item.addition.id)">
                  <img class="cover" :src="formatMusicInfo(item.addition.id)?.cover" alt="" srcset="">
                  <i class="fa fa-play cover_mask" aria-hidden="true"></i>
                </div>
                <span class="music_info">
                  <span class="scroll-item">{{ formatMusicInfo(item.addition.id)?.name + " - " +
                    store.state.formatArtists(formatMusicInfo(item.addition.id)?.artist) }}</span>
                </span>
              </span>
            </template>
            <template v-if="checkType(item.type, 'room:effect')">
              <span class="room-effect">
                <span class="inline">{{ (item.uuid === store.state._store.account.uuid ? '你' : item.username) }}使用了房间特效
                  <span class="highlight" @click="playRoomEffect(item)" title="点击重播">&quot;{{
                    formatEffectName(item.addition.effect)
                  }}&quot;</span></span>
              </span>
            </template>
            <!-- 图片 -->
            <template v-if="checkType(item.type, 'room:message') && item.msg.type === 'image'">
              <span v-for="(img) in item.msg.content" :key="img" v-viewer class="message__item-content no-border">
                <img :src="img" alt="图片">
              </span>
            </template>
            <span v-if="checkType(item.type, 'room:message') && typeof item.msg === 'string'" v-html="formatMessage(item)"
              class="message__item-content"></span>
          </div>
        </el-scrollbar>
      </div>
      <div class="input-send-wrapper">
        <transition name="fade">
          <div class="preCheck-musicInfo" v-if="needCheckMusic || musicInfo">
            <span class="error" v-if="needCheckMusic && !musicInfo">正在获取歌曲信息</span>
            <div class="scroll-box" v-if="musicInfo != 'error' && musicInfo">
              <span class="scroll-item">
                {{ `即将分享：${musicInfo.name} - ${musicInfo.artist}` }}
              </span>
            </div>
            <span class="error" v-if="musicInfo == 'error'">歌曲链接有误，无法添加至房间</span>
          </div>
        </transition>
        <template v-if="(typeof msg === 'string')">
          <input type="text" v-model="msg" :ref="getInputRef" @input="handleInput" @keydown.enter="sendMessage"
            placeholder="把想说的话都说出来吧～" autofocus @paste="handlePaste">
        </template>
        <template v-else>
          <!-- 富文本输入框 -->
          <div class="input-wrapper" contenteditable="true" :ref="getInputRef" v-html="msg.content" @input="handleInput"
            @keydown.enter="sendMessage" @blur="setMessageContent"></div>
        </template>
        <button v-if="(typeof msg === 'string')" @click="sendMessage"
          :class="{ disabled: needCheckMusic && (!musicInfo || musicInfo == 'error') }"
          :disabled="needCheckMusic && (!musicInfo || musicInfo == 'error')">发送</button>
      </div>
      <transition name="fade">
        <div class="room-effect__wrapper select__wrapper" v-if="roomEffectSelectorShow">
          <p class="title">房间特效选择</p>
          <div class="group" v-for="(group) in roomEffectList" :key="group">
            <p class="group__title">
              {{ group.name }} 系列
            </p>
            <div class="item__wrapper">
              <div class="room-effect__item item" v-for="(child) in group.children" :key="child"
                :class="{ active: activeEffect == child.effect }" @click="handleSelect(child)">
                <i class="fa fa-play"></i>
                {{ child.name }}
              </div>
            </div>
          </div>
          <div class="button__wrapper">
            <button class="primary" :class="{ active: activeEffect }" @click="sendRoomEffect">发送</button>
            <button @click="roomEffectSelectorShow = false;">关闭</button>
          </div>
        </div>
      </transition>
      <transition name="fade">
        <div class="room-game__wrapper select__wrapper" v-if="roomGameSelectorShow">
          <p class="title">房间游戏选择</p>
          <div class="group" v-for="(group) in roomGameList" :key="group">
            <p class="group__title">
              {{ group.name }} 系列
            </p>
            <div class="item__wrapper">
              <div class="room-game__item item" v-for="(child) in group.children" :key="child"
                :class="{ active: activeGame == child.game }" @click="handleSelectGame(child)">
                {{ child.name }}
              </div>
            </div>
          </div>
          <div class="button__wrapper">
            <button class="primary" :class="{ active: activeGame }" @click="sendRoomGame">发送</button>
            <button @click="roomGameSelectorShow = false;">关闭</button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>
<script setup>
import { ref, nextTick, defineEmits, onUnmounted, watch, watchEffect, onMounted } from "vue";
import { useStore } from "vuex";
import moment from "moment";
import { getSingleMusicApi, uploadImgApi } from "@/api/api"
import html2canvas from 'html2canvas';

const checkType = (type, rule) => {
  return type == rule || type == `${rule}-reply`;
}

var opts = { useCORS: true };

document.addEventListener('keydown', (e) => {
  if (e.key == 'F10') {
    e.preventDefault();
    scrollBarHeight.value = document.querySelector(".el-scrollbar__wrap").scrollHeight;
    nextTick(() => {
      document.querySelector(".el-scrollbar__wrap").scrollTop = scrollBarHeight.value;
      html2canvas(document.querySelector(".el-scrollbar__wrap"), opts).then(function (canvas) {
        // 另存为图片下载
        let link = document.createElement('a');
        link.download = `聊天记录导出.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        scrollBarHeight.value = 440;
        store.commit("setMsg", { message: "聊天记录导出成功", title: "通知", duration: 0 })
      });
    })
  }
})

const store = useStore();

const emit = defineEmits(["click-chat"]);

moment.locale('zh-cn');

const msg = ref("");
let inputRef = ref(null)
const getInputRef = (el) => {
  inputRef.value = el
}

const inputContainerShow = ref(!store.state._store.account.username);

const hideInputContainer = () => {
  if (!store.state._store.account.username) {
    store.commit("setMsg", { message: "输入内容不能为空", title: "通知", duration: 0 })
    return;
  }
  inputContainerShow.value = false;
  store.commit("setMsg", { message: `欢迎你，${store.state._store.account.username}`, title: `欢迎使用「一起听」`, duration: 0 })
  // 更新服务器 username 信息
  store.commit("updateUsername");
}

const nowDate = ref(moment().format("YYYY-MM-DD HH:mm:ss"));

let interval = setInterval(() => {
  nowDate.value = moment().format("YYYY-MM-DD HH:mm:ss");
  // 获取滚动条已经滚动的距离
  // console.log(document.querySelector(".el-scrollbar__wrap")?.scrollTop, document.querySelector(".el-scrollbar__view")?.getBoundingClientRect().height);
}, 1000)

// 页面卸载时清除定时器
onUnmounted(() => {
  clearInterval(interval);
})

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
  document.querySelector(".message__wrapper .el-scrollbar__wrap")?.scrollTo({
    top: document.querySelector(".message__wrapper .el-scrollbar__view").offsetHeight,
    left: 0,
  })
})

const formatMusicInfo = (musicId) => {
  return store.getters.getMusicInfoById(musicId)
}

const sendTextMessage = () => {
  // 判断是否为空或者只有空格
  if (msg.value == "" || msg.value.trim() == "") {
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
      msg: msg.value.replace(/\s/g, '&nbsp;')
    })
  }
}

const dataURLtoBlob = (dataUrl) => {
  let arr = dataUrl.split(',');
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = Buffer.from(arr[1], 'base64').toString('binary');
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

const sendRichTextMessage = () => {
  let domElements = document.querySelector(".input-wrapper").childNodes;
  // 提取所有图片元素
  let imgArr = Array.from(document.querySelectorAll(".input-wrapper img"));
  // 去除图片节点后的文本
  let text = document.querySelector(".input-wrapper").innerHTML.replace(/<img.*?>/g, "");

  // 将 base64 转为 blob
  let blobArr = imgArr.map(item => {
    return dataURLtoBlob(item.src);
  })

  // 若存在文字，则按照顺序发送图片和文字
  // 若文字为空，则直接发送图片
  if (text) {
    // 上传图片
    Promise.all(blobArr.map(item => uploadImgApi(item))).then(res => {
      // 根据节点顺序，将图片链接插入到文字中

      let imgIndex = 0;
      for (let index = 0; index < domElements.length; index++) {
        const element = domElements[index];
        if (element.nodeName == "IMG") {
          // 发送图片信息
          store.commit("sendMessage", {
            msg: {
              type: "image",
              content: [`${res[imgIndex].url}`]
            }
          })
          imgIndex++;
        }
        if (element.nodeName == "#text") {
          // 发送文字信息
          store.commit("sendMessage", {
            msg: element.textContent.replace(/\s/g, '&nbsp;')
          })
        }
      }
    });
  } else
    // 上传图片
    Promise.all(blobArr.map(item => uploadImgApi(item))).then(res => {
      // 发送图片信息
      store.commit("sendMessage", {
        msg: {
          type: "image",
          content: imgArr.map((item, index) => {
            return `${res[index].url}`
          })
        }
      })
    });
}

const sendMessage = (e) => {
  // TODO: 换行时出现问题 
  // 判断是否是 Ctrl + Enter, Command + Enter
  let event = e || window.event;
  if (event.ctrlKey && event.keyCode == 13 || event.metaKey && event.keyCode == 13) {
    // 将普通文本转为富文本
    if (typeof msg.value == "string") {
      msg.value = {
        type: "rich-text",
        content: msg.value.replace(/\s/g, '&nbsp;')
      }
    }
    setMessageContent();
    msg.value.content += "<br/>";
    // 将光标移至最后
    nextTick(() => {
      let range = document.createRange();
      range.selectNodeContents(inputRef.value);
      range.collapse(false);
      let sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    })
    return;
  }

  // 判断信息是否是普通文本
  if (typeof msg.value == "string") {
    sendTextMessage();
  } else {
    sendRichTextMessage();
  }

  msg.value = "";
  if (inputRef.value) inputRef.value.focus();
  store.commit("setTyping", { isTyping: false });
  musicInfo.value = null;
  needCheckMusic.value = false;

  // 页面滚动至底部
  nextTick(() => {
    document.querySelector(".message__wrapper .el-scrollbar__wrap")?.scrollTo({
      top: document.querySelector(".message__wrapper .el-scrollbar__view").offsetHeight,
      left: 0,
    })
  })
}

const setMessageContent = () => {
  // 将富文本存储至 msg.value.content
  if (typeof msg.value === 'object')
    msg.value = {
      type: "rich-text",
      content: inputRef.value.innerHTML
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

const isMouseDowned = ref(false);

// 修复拖拽时鼠标移到遮罩层，导致弹窗关闭的问题
const handleMouseDown = (e) => {
  isMouseDowned.value = e.target.classList.contains("chat-mask");
}

const closePopup = () => {
  if (!isMouseDowned.value) {
    return;
  }
  if (inputContainerShow.value && store.state._store.account.username) {
    inputContainerShow.value = false;
    return;
  }
  emit('click-chat')
}

const formatMessage = ({ msg }) => {
  if (typeof msg == "string") {
    // 判断消息是否包含网址
    if (msg.match(/(http|https):\/\/([\w.]+\/?)\S*/)) {
      return msg.replace(/(http|https):\/\/([\w.]+\/?)\S*/, `<a href="$&" target="_blank">$&</a>`)
    }
    return msg;
  }
  return msg.content;
}

let timeoutTimer = null, searchTimer = null;

let needCheckMusic = ref(false);

let musicInfo = ref(null);

const roomEffectSelectorShow = ref(false),
  roomGameSelectorShow = ref(false);

const roomEffectList = [
  {
    name: "五彩纸屑",
    value: "confetti",
    children: [
      {
        name: "基础",
        effect: "confetti:basic",
        config: {
        }
      },
      {
        name: "星星",
        effect: "confetti:stars",
        config: {
        }
      },
      {
        name: "烟花",
        effect: "confetti:fireworks",
        config: {
        }
      },
      {
        name: "礼花",
        effect: "confetti:school-pride",
        config: {}
      }
    ]
  }
];

const formatEffectName = (effect) => {
  for (let index = 0; index < roomEffectList.length; index++) {
    const item = roomEffectList[index];
    if (item.effect == effect) {
      return item.name;
    }
    if (item.children) {
      for (let j = 0; j < item.children.length; j++) {
        const child = item.children[j];
        if (child.effect == effect) {
          return `${item.name}-${child.name}`;
        }
      }
    }
  }
}

const activeEffect = ref(null),
  activeGame = ref(null);

const handleSelect = (item) => {
  if (item.effect == activeEffect.value) {
    return;
  }
  store.commit('roomEffectHandler', item);
  activeEffect.value = item.effect;
}

const sendRoomEffect = () => {
  store.commit('sendRoomEffect', { effect: activeEffect.value });
  activeEffect.value = null;
  roomEffectSelectorShow.value = false;
}

const roomGameList = [
  {
    name: "运气",
    value: "luck",
    children: [
      {
        name: "石头剪刀布",
        game: "rock-paper-scissors",
        config: {
        }
      }
    ]
  }
];

const handleSelectGame = (item) => {
  if (item.game == activeGame.value) {
    return;
  }
  activeGame.value = item.game;
}

const sendRoomGame = () => {
  store.commit('sendRoomGame', { effect: activeGame.value });
  activeGame.value = null;
  roomGameSelectorShow.value = false;
}

// 判断是否粘贴图片
const handlePaste = (e) => {
  if (e.clipboardData && e.clipboardData.items[0].type.indexOf('image') > -1) {
    let file = e.clipboardData.items[0].getAsFile();
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      let base64 = e.target.result;
      msg.value = {
        type: "rich-text",
        content: `${msg.value ? msg.value + "<br/>" : ""}<img src="${base64}" alt="粘贴图片">`
      }
    }
  }
}

// 监听正在输入并同步到其他用户
const handleInput = (e) => {

  timeoutTimer && clearTimeout(timeoutTimer);
  searchTimer && clearTimeout(searchTimer);

  if (e.target.value) {
    store.commit("setTyping", { isTyping: true })
    timeoutTimer = setTimeout(() => {
      store.commit("setTyping", { isTyping: false })
    }, 5 * 1000);
  } else {
    store.commit("setTyping", { isTyping: false })
  }

  if (typeof msg.value == "string") {
    // 房间特效检测
    if (msg.value == "room:effect") {
      roomEffectSelectorShow.value = true;
      msg.value = "";
    }

    // 房间游戏检测
    if (msg.value == "room:game") {
      roomGameSelectorShow.value = true;
      msg.value = "";
    }

    // 检测链接是否包含网址
    let reg = /https:\/\/music.163.com\/song\?id=(\d+)/;
    let match = msg.value.match(reg);
    if (match) {
      needCheckMusic.value = true;
    } else {
      needCheckMusic.value = false;
      musicInfo.value = null;
      return;
    }

    // 防抖搜索
    searchTimer = setTimeout(() => {
      let musicId = match[1];
      getSingleMusicApi(musicId).then(res => {
        if (res._playList.length == 0 || res._playList[0] == undefined || !res._playList[0].name) {
          musicInfo.value = "error";
          return
        }
        let { name, artist } = res._playList[0];
        musicInfo.value = { name, artist: store.state.formatArtists(artist) };
      })
    }, 1000);
  } else {
    // 若富文本内容为空，则转为普通文本
    if (e.target.innerHTML == "") {
      msg.value = "";
    }
  }
}

const formatTypingUsers = (userArr) => {
  if (store.state._roomInfo.count == 1) {
    return "留下你的足迹吧～";
  } else if (store.state._roomInfo.count == 2) {
    if (userArr.length == 1) {
      if (userArr[0].uuid == store.state._store.account.uuid) {
        return "正在输入";
      } else {
        return "对方正在输入";
      }
    } else if (userArr.length == 2) {
      return "双向奔赴～";
    }
  } else if (store.state._roomInfo.count == userArr.length) {
    return "全员奔赴～";
  }

  // 判断是否是自己
  let arr = Array.from(userArr);
  for (let index = 0; index < arr.length; index++) {
    const item = arr[index];
    if (item.uuid == store.state._store.account.uuid) {
      item.username = "你";
      break;
    }
  }
  return arr.map(item => item.username).join("、") + " 正在输入";
}

const playRoomEffect = ({ addition: { effect } }) => {
  store.commit("roomEffectHandler", { effect });
}

let scrollBarHeight = ref(440);

// let scrollTop = ref(0);

onMounted(() => {
  // document.querySelector(".el-scrollbar__wrap")?.addEventListener("scroll", e => {
  //   console.log(e.target.scrollTop);
  //   scrollTop.value = e.target.scrollTop;
  // })
})

watchEffect(() => {
  console.log(store.state._currentLrc.lrc, store.state._currentLrc.tlrc, store.state._play.isPlaying);
  // 没有歌词或者暂停时
  if (!store.state._play.isPlaying || !store.state._currentLrc.lrc) {
    scrollBarHeight.value = 440;
    document.querySelector(".message__wrapper")?.style.setProperty("--top", 0);
    return;
  }
  nextTick(() => {
    scrollBarHeight.value = 440 - (document.querySelector(".currentLrc")?.getBoundingClientRect().height || 0);
    document.querySelector(".message__wrapper")?.style.setProperty("--top", (document.querySelector(".currentLrc")?.getBoundingClientRect().height || 0) + "px");
  })
})

// 监听 msg.value 类型改变
watch(msg, (newVal, oldVal) => {
  if (typeof newVal == "string" && typeof oldVal == "object" || typeof newVal == "object" && typeof oldVal == "string") {
    // 获取焦点并将光标移至最后
    nextTick(() => {
      // 重新获取 inputRef
      inputRef.value = document.querySelector(".input-wrapper") || document.querySelector(".input-send-wrapper input");
      inputRef.value.focus();

      if (typeof newVal == "string") {
        //  
      } else {
        let range = document.createRange();
        range.selectNodeContents(inputRef.value);
        range.collapse(false);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    })
  }
})

</script>
<style lang='scss' scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Yuanti SC', 'Microsoft Yahei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
}

.fade-enter-active,
.fade-leave-active {
  transition: .5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.chat-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
}

.dark .chat__container {
  background-color: rgba(0, 0, 0, 0.72);
  color: white;
}

.input__container {
  position: fixed;
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(30px) contrast(120%);
  box-shadow: 0 0 20px rgba($color: #000000, $alpha: .2);
  top: 50%;
  left: 50%;
  width: 240px;
  padding: 16px;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  .title {
    text-align: center;
    margin: 0;
    padding: 0;
    font-size: 13px;
    color: var(--title_color);

    .dark & {
      color: var(--dark_title_color);
    }
  }

  .flex {
    position: relative;
    box-sizing: border-box;
    transition: .2s;
    width: 100%;
    font-size: 12px;

    .icon {
      position: absolute;
      top: 0;
      right: 0;
      cursor: pointer;
      background-color: var(--player_color);
      color: var(--active_color);
      width: 32px;
      height: 32px;
      border-radius: 10px;
      padding: 10px;
      box-sizing: border-box;
      transition: .4s;
      font-size: inherit;

      display: flex;
      justify-content: center;
      align-items: center;

      &.active,
      &:hover {
        background-color: var(--active_color);
        color: white;
      }

      &:hover {
        width: 100%;
        height: 100%;
      }

      .dark & {
        background-color: var(--dark_player_color);
        color: var(--dark_active_color);

        &.active,
        &:hover {
          background-color: var(--dark_active_color);
          color: white;
        }
      }
    }

    input {
      width: 100%;
      padding: 0 12px;
      outline: none;
      line-height: 30px;
      transition: .2s;
      background-color: var(--player_color);
      color: var(--title_color);
      border: 1px solid transparent;
      border-radius: 10px;
      text-align: center;
      font-size: 12px;

      &.small {
        padding: 0 30px 0 12px;
      }

      &:focus {
        border-color: var(--active_color);
      }

      .dark & {
        background-color: var(--dark_player_color);
        color: var(--dark_title_color);

        &:focus {
          border-color: var(--dark_active_color);
        }
      }
    }
  }

  .dark & {
    background-color: rgba(0, 0, 0, 0.72);
    color: var(--dark_title_color);
  }
}

.chat__container {
  position: fixed;
  background-color: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(30px) contrast(120%);
  box-shadow: 0 0 20px rgba($color: #000000, $alpha: .2);
  top: 50%;
  left: 50%;
  width: 340px;
  padding: 20px;
  transform: translate(-50%, -50%);
  border-radius: 20px;
  z-index: 4;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 10px;

  .chat__container-header {
    color: var(--title_color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 20px;

    .dark & {
      color: var(--dark_title_color);
    }

    .flex {
      display: flex;
      align-items: center;
      gap: 4px;

      .title {
        font-size: 16px;
        font-weight: bold;
      }

      .icon {
        font-size: 13px;
        cursor: pointer;
        transition: .2s;
        display: flex;
        justify-content: center;
        align-items: center;

        &:hover {
          color: var(--active_color);

          .dark & {
            color: var(--dark_active_color);
          }
        }
      }
    }

    .now-typing {
      font-size: 12px;
      display: flex;
      align-items: center;
    }
  }

  .select__wrapper {
    position: absolute;
    top: 50px;
    left: 50%;
    width: calc(100% - 40px);
    transform: translate(-50%);
    padding: 10px;
    box-sizing: border-box;
    background-color: var(--player_color);
    color: var(--title_color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    margin-bottom: 10px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.1);
    z-index: 1;

    .dark & {
      background-color: var(--dark_player_color);
      color: var(--dark_title_color);
    }

    * {
      font-size: 13px;
    }

    .title {
      text-align: center;
    }

    .group {
      background-color: rgba(255, 255, 255, 0.72);
      padding: 10px;
      border-radius: 10px;
      overflow: hidden;

      .dark & {
        background-color: rgba(0, 0, 0, 0.72);
      }

      .group__title {
        font-size: 13px;
        margin-bottom: 6px;
      }

      .item__wrapper {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
        gap: 6px;

        .item {
          text-align: center;
          border: 1px dotted var(--active_color);
          color: var(--active_color);
          cursor: pointer;
          padding: 2px;
          border-radius: 10px;
          font-size: 12px;
          transition: .2s;
          display: flex;
          justify-content: center;
          gap: 2px;
          align-items: center;

          .dark & {
            border-color: var(--dark_active_color);
            color: var(--dark_active_color);
          }

          svg {
            transform: scale(.65);
            transform-origin: center;
          }

          &.active,
          &:hover {
            background-color: var(--active_color);
            color: white;

            .dark & {
              background-color: var(--dark_active_color);
            }
          }
        }
      }
    }


    .button__wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;

      button {
        appearance: none;
        border: none;
        outline: none;
        background-color: rgba(255, 255, 255, 0.72);
        border-radius: 10px;
        overflow: hidden;
        padding: 5px 12px;
        transition: .2s;
        cursor: pointer;
        font-size: 12px;
        color: var(--title_color);

        .dark & {
          background-color: rgba(0, 0, 0, 0.72);
          color: var(--dark_title_color);
        }

        &:hover {
          opacity: .8;
        }

        &.primary {
          filter: brightness(.8);
          pointer-events: none;

          &.active {
            background-color: var(--active_color);
            color: white;
            font-weight: bold;
            filter: initial;
            pointer-events: initial;

            .dark & {
              background-color: var(--dark_active_color);
            }
          }
        }
      }
    }
  }

  .room-game__wrapper {
    .group {
      .item__wrapper {
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
      }
    }
  }


  .content__wrapper {
    position: relative;
    height: 440px;
    overflow: hidden;

    .currentLrc {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(233, 241, 252, 0.28) 30% 70%, rgba(255, 255, 255, 0) 100%);
      color: var(--active_color);
      border-radius: 10px;
      overflow: hidden;
      width: 100%;
      max-width: 100%;
      min-height: 30px;
      transition: .2s;
      text-align: center;

      // vue3 transition slide-from-left-to-right
      &.slide-from-left-to-right-enter-active,
      &.slide-from-left-to-right-leave-active {
        transition: .2s ease;
      }

      &.slide-from-left-to-right-enter-from {
        transform: translateX(-100%);
      }

      &.slide-from-left-to-right-enter-to,
      &.slide-from-left-to-right-leave-from {
        transform: translateX(0);
      }

      &.slide-from-left-to-right-leave-to {
        transform: translateX(100%);
      }

      .dark & {
        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(37, 40, 45, .28) 30% 70%, rgba(255, 255, 255, 0) 100%);
        color: var(--dark_active_color);
      }

      span {
        font-size: 12px;
        padding: 6px 10px;
        display: block;

        p {
          font-size: inherit;
          line-height: 150%;

          &:nth-child(2) {
            color: #9bade4;

            .dark & {
              color: #e69877;
            }
          }
        }
      }
    }

    .message__wrapper {
      position: absolute;
      top: var(--top, 0);
      width: 100%;
      transition: .2s;

      &::v-deep .el-scrollbar__wrap {
        transition: .2s;
      }

      &::v-deep .el-scrollbar__view {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding-bottom: 10px;

        .message__item {
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          width: 100%;

          &::after {
            content: var(--message__item__after_content);
          }

          &:not(.room-change-message).right {
            align-items: flex-end;
          }

          >span {
            margin: 0;
            padding: 0;
            display: block;
            word-break: break-all;
            font-size: 14px;

            &.message__item-time {
              color: var(--title_color);
              font-size: 12px;
              text-align: center;
              width: 100%;
              margin-top: 6px;

              .dark & {
                color: var(--dark_title_color);
              }
            }
          }

          span.inline {
            >* {
              display: inline;
            }
          }

          span:not(.inline) {
            >* {
              width: 100%;
              object-fit: contain;
            }
          }

          &.room-change-message {
            text-align: center;

            span {
              color: var(--title_color);
              font-size: 12px;

              .dark & {
                color: var(--dark_title_color);
              }
            }

            &.right {
              &.leave {
                .message__item-content {
                  color: #9bade4;

                  .dark & {
                    color: #e69877;
                  }
                }
              }

              .message__item-content {
                color: var(--active_color);

                .dark & {
                  color: var(--dark_active_color);
                }
              }
            }
          }

          &:not(.room-change-message) {
            .message__item-content {
              padding: 6px 12px;
              width: fit-content;
              background-color: var(--player_color);
              color: var(--title_color);
              border-radius: 10px;
              margin-top: 4px;
              max-width: 80%;
              min-height: 32px;

              a {
                color: inherit;
                text-decoration: underline;
                font-family: inherit;
                transition: .2s;

                &:hover {
                  color: var(--active_color);

                  .dark & {
                    color: var(--dark_active_color);
                  }
                }
              }

              &.no-border {
                padding: 0;
                border-radius: 10px;
                overflow: hidden;
                background-color: transparent !important;
                border: 1px solid transparent;
                transition: .2s;

                &:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.05);

                  .dark & {
                    box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.3);
                  }
                }
              }

              img {
                cursor: pointer;
                display: block;
                max-width: 150px;

                .dark & {
                  filter: brightness(.9);
                }
              }

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
                    object-fit: cover;
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

                  span {
                    text-align: center;
                    color: inherit;
                    font-size: 12px;
                  }

                  .scroll-item {
                    width: auto;
                    display: block;
                    animation: scroll linear 4s alternate infinite;
                    float: left;
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

            .room-effect {
              text-align: center;
              width: 100%;
              max-width: 100%;
              color: var(--title_color);
              font-size: 12px;

              span {
                font-size: inherit;

                .highlight {
                  color: var(--active_color);
                  cursor: pointer;
                  border-bottom: 1px solid var(--active_color);
                  transition: .2s;

                  &:hover {
                    filter: brightness(1.1);
                  }

                  .dark & {
                    color: var(--dark_active_color);
                    border-color: var(--dark_active_color);
                  }
                }
              }

              .dark & {
                color: var(--dark_title_color);
              }
            }

            &.right {
              .message__item-content {
                background-color: var(--active_color);
                color: white;

                a {
                  display: inline-block;
                  transition: .2s;

                  &:hover {
                    color: white;
                    transform: translate(0, -1px);
                  }
                }

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
    position: relative;

    .preCheck-musicInfo {
      position: absolute;
      bottom: calc(100% + 10px);
      left: 0;
      background-color: var(--player_color);
      color: var(--active_color);
      border-radius: 10px;
      overflow: hidden;
      max-width: 100%;
      z-index: 2;

      .dark & {
        background-color: var(--dark_player_color);
        color: var(--dark_active_color);
      }

      span {
        font-size: 12px;
        padding: 6px 10px;
        display: block;
        transition: .2s;

        &:not(.error) {
          // text-shadow: 0 0 10px var(--active_color);

          // .dark & {
          //   text-shadow: 0 0 10px var(--dark_active_color);
          // }
        }
      }

      .error {
        background-color: var(--el-color-warning-light-9);
        color: var(--el-color-warning);

        .dark & {
          background-color: #51493d;
        }
      }

      .scroll-box {
        width: 100%;
        display: inline-block;
        vertical-align: top;
        overflow: hidden;
        white-space: nowrap;

        .scroll-item {
          width: auto;
          animation: scroll linear 4s alternate infinite;
          float: left;
          color: inherit;
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
    }

    input {
      flex: 1;
      padding: 0 12px;
      outline: none;
      border: none;
      min-height: 32px;
      border-radius: 10px;
      background-color: var(--player_color);
      color: var(--title_color);
      border: 1px solid transparent;
      box-sizing: border-box;
      transition: .2s;

      &:focus {
        border-color: var(--active_color);
      }

      &::placeholder {
        color: var(--title_color);
        opacity: .3;

        .dark & {
          color: var(--dark_title_color);
        }
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
      transition: .2s;

      &.disabled {
        cursor: not-allowed;
        filter: brightness(.8);

        .dark & {
          filter: brightness(.5);
        }
      }

      &:not(.disabled):hover {
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

    .input-wrapper {
      flex: 1;
      @extend input;
      padding: 6px 12px;
      height: 100%;
      min-height: 30px;
      max-height: 200px;
      overflow-y: auto;

      // 滚动条样式
      &::-webkit-scrollbar {
        width: 3px;

        &-track {
          background-color: rgba(255, 255, 255, 0.22);
          border-radius: 10px;
        }

        .dark &-track {
          background-color: rgba(0, 0, 0, 0.22);
        }
      }

      &::v-deep img {
        max-width: 90%;
        max-height: 100%;
        object-fit: contain;
        cursor: pointer;
        transition: .2s;
        display: block;

        &:hover {
          filter: brightness(1.05);
        }
      }
    }
  }
}
</style>