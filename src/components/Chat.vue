<!--
 * @Author: ikouane
 * @PoweredBy: 未央宫©WeYounG
 * @Date: 2023-03-15 16:39:14
 * @LastEditTime: 2023-08-13 15:14:05
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
          <span class="title">{{ store.state._rid }} <el-popover placement="top-start" title="房间成员" :width="200"
              trigger="hover">
              <template #reference>
                <span class="room-count">({{ store.state._roomInfo.count }})</span>
              </template>
              <template #default>
                <div class="chat-member">
                  <div class="chat-member-item" v-for="(member) in store.state._roomInfo.onlineUserList" :key="member"
                    :class="{ active: member.uuid == store.state._store.account.uuid }">
                    <el-avatar v-if="store.state._roomInfo.avatarList[member.uuid]" :size="32"
                      :class="{ useSquare: store.state._roomInfo.avatarList[member.uuid]?.useSquare }"
                      :src="`./avatar/${store.state._roomInfo.avatarList[member.uuid]?.type}`" />
                    <el-avatar v-else :size="32"> {{ member.username[0] }} </el-avatar>
                    {{ member.username }}
                  </div>
                </div>
              </template>
            </el-popover>
          </span>
          <span class="icon" @click="settingContainerShow = true;">
            <i class="fa fa-cog" aria-hidden="true"></i>
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
            v-show="item.type != 'room:recalled'" :class="{
              'room-change-message': item.type === 'room:join' || item.type === 'room:leave' || item.type === 'room:create' || item.type === 'room:rejoin' || item.type === 'room:recall' || item.type === 'room:recalled', leave: item.type === 'room:leave', right: item.uuid == store.state._store.account.uuid,
              'hide-room-change-message': getHideRoomChangeMessage(item)
            }">
            <!-- 发送时间 -->
            <span class="message__item-time"
              v-if="index == 0 || (index >= 1 && generateRelativeTime(item.time) != generateRelativeTime(getPrevMessage(index)))">
              {{ generateRelativeTime(item.time) }}
            </span>

            <!-- FIXME: 同一时间多条消息间距统一 -->

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
              <div class="message__item-wrapper">
                <!-- 头像昵称 -->
                <template
                  v-if="store.state._store.config.room.alwaysShowUsername || (store.state._store.config.room.autoShowUserUsernameInMoreThanTwoPeople && store.state._roomInfo.userList.length >= 3)">
                  <el-avatar v-if="store.state._roomInfo.avatarList[item.uuid].avatar" :size="32"
                    class="message__item-avatar"
                    :class="{ useSquare: store.state._roomInfo.avatarList[item.uuid].avatar?.useSquare }"
                    :src="`./avatar/${store.state._roomInfo.avatarList[item.uuid].avatar?.type}`" />
                  <el-avatar v-else :size="32"> {{ item.username[0] }}</el-avatar>
                </template>
                <div class="message__item-right-box">
                  <span
                    v-if="store.state._store.config.room.alwaysShowUsername || (store.state._store.config.room.autoShowUserUsernameInMoreThanTwoPeople && store.state._roomInfo.userList.length >= 3)"
                    class="message__item-username">{{
                      item.username }}</span>
                  <div class="message__item-content add-song"
                    :class="{ isPlaying: store.state._playList[store.state._play.nowPlaying].id == item.addition.musicId && store.state._play.isPlaying }">

                    <div class="cover__wrapper" @click="playMusicById(item.addition.musicId)">
                      <img class="cover" :src="formatMusicInfo(item.addition.musicId)?.cover" alt="" srcset="">
                      <i class="fa fa-play cover_mask" aria-hidden="true"></i>
                    </div>
                    <span class="music_info">
                      <span class="scroll-item">{{ formatMusicInfo(item.addition.musicId)?.name + " - " +
                        store.state.formatArtists(formatMusicInfo(item.addition.musicId)?.artist) }}</span>
                    </span>
                  </div>
                </div>
              </div>
            </template>
            <template v-if="checkType(item.type, 'room:effect')">
              <span class="room-effect" v-mouse-menu="{
                params: item,
                ...options.value,
                ...menuList.value['effect']
              }">
                <span class="inline">{{ (item.uuid === store.state._store.account.uuid ? '你' : item.username) }}使用了房间特效
                  <span class="highlight" @click="playRoomEffect(item)" title="点击重播">&quot;{{
                    formatEffectName(item.addition.effect)
                  }}&quot;</span></span>
              </span>
            </template>

            <!-- 图片 -->
            <template v-if="checkType(item.type, 'room:message') && item.msg.type === 'image'">
              <div class="message__item-wrapper">
                <!-- 头像昵称 -->
                <template
                  v-if="store.state._store.config.room.alwaysShowUsername || (store.state._store.config.room.autoShowUserUsernameInMoreThanTwoPeople && store.state._roomInfo.userList.length >= 3)">
                  <el-avatar v-if="store.state._roomInfo.avatarList[item.uuid]" :size="32" class="message__item-avatar"
                    :class="{ useSquare: store.state._roomInfo.avatarList[item.uuid]?.useSquare }"
                    :src="`./avatar/${store.state._roomInfo.avatarList[item.uuid]?.type}`" />
                  <el-avatar v-else :size="32"> {{ item?.username[0] }}</el-avatar>
                </template>
                <div class="message__item-right-box">
                  <span
                    v-if="store.state._store.config.room.alwaysShowUsername || (store.state._store.config.room.autoShowUserUsernameInMoreThanTwoPeople && store.state._roomInfo.userList.length >= 3)"
                    class="message__item-username">{{
                      item.username }}</span>
                  <div v-for="(img) in item.msg.content" :key="img" v-viewer class="message__item-content no-border"
                    v-mouse-menu="{
                      params: index,
                      ...options.value,
                      ...menuList.value['message']
                    }">
                    <img :src="img" alt="图片">
                  </div>
                </div>
              </div>
            </template>

            <!-- 文字 -->
            <transition name="backOutRight" v-if="checkType(item.type, 'room:message') && typeof item.msg === 'string'">
              <div class="message__item-wrapper">
                <!-- 头像昵称 -->
                <template
                  v-if="store.state._store.config.room.alwaysShowUsername || (store.state._store.config.room.autoShowUserUsernameInMoreThanTwoPeople && store.state._roomInfo.userList.length >= 3)">
                  <el-avatar v-if="store.state._roomInfo.avatarList[item.uuid]" :size="32" class="message__item-avatar"
                    :class="{ useSquare: store.state._roomInfo.avatarList[item.uuid]?.useSquare }"
                    :src="`./avatar/${store.state._roomInfo.avatarList[item.uuid]?.type}`" />
                  <el-avatar v-else :size="32"> {{ item?.username[0] }}</el-avatar>
                </template>
                <div class="message__item-right-box">
                  <span
                    v-if="store.state._store.config.room.alwaysShowUsername || (store.state._store.config.room.autoShowUserUsernameInMoreThanTwoPeople && store.state._roomInfo.userList.length >= 3)"
                    class="message__item-username">{{
                      item.username }}</span>
                  <span v-html="formatMessage(item)" class="message__item-content" v-mouse-menu="{
                    params: index,
                    ...options.value,
                    ...menuList.value['message']
                  }"></span>
                </div>
              </div>
            </transition>

            <!-- <transition name="fade">
              <span v-if="checkType(item.type, 'room:recalled')" class="message__item-content">
                已撤回的消息
              </span>
            </transition> -->
            <!-- 
            {{ item }}
            {{ index }} -->

            <span v-if="checkType(item.type, 'room:recall')" class="message__item-content">
              {{ (item.uuid === store.state._store.account.uuid ? '你' : item.username) }}撤回了{{
                formatRecallMessage(item)
              }}
            </span>
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

      <transition name="fade">
        <div class="room-setting select__wrapper" v-if="settingContainerShow">
          <div class="room-setting-header">
            <span class="title">设置</span>

            <!-- 关闭图标 -->
            <span class="close" @click="settingContainerShow = false;">
              <i class="fa fa-times"></i>
            </span>
          </div>

          <el-scrollbar :height="550">

            <div class="setting-item" :class="{ inline: !item.children && !item.options }"
              v-for="(item) in roomSettingsList" :key="item">
              <p class="item__title flex">
                {{ item.label }}
                <!-- ElTooltip -->
                <el-tooltip v-if="item.tips" class="item__tooltip" effect="light" :content="item.tips" placement="bottom">
                  <div><i class="fa fa-question-circle"></i></div>
                </el-tooltip>
              </p>

              <!-- {{ item }} -->

              <template v-if="item.type == 'select'">
                <div class="group">
                  <p class="group__title">{{ item.options.name }}</p>
                  <div class="item__wrapper">
                    <div class="item" v-for="(child) in item.options.children" :key="child"
                      :class="{ active: getValueByStoreKey(item.value) == child.value }"
                      @click="handleSettingChange(item, child.value)">
                      <i v-if="item.value == '_store.config.room.newMessageSound' && child.value != 'none'"
                        class="fa fa-play"></i>
                      <i v-if="item.value == '_store.config.room.newMessageSound' && child.value == 'none'"
                        class="fa fa-ban"></i>
                      {{ child.name }}
                    </div>
                  </div>
                </div>
              </template>
              <template v-if="item.type == 'group'">
                <div class="group">
                  <div class="group__item__wrapper">
                    <div class="group__item" :class="{ 'second-group': child.options }" v-for="(child) in item.children"
                      :key="child">
                      <span class="group__item__title" v-if="!child?.hideTitle">{{ child.label }}
                        <el-tooltip v-if="child.tips" class="item__tooltip" :content="child.tips" effect="light"
                          placement="bottom">
                          <div><i class="fa fa-question-circle"></i></div>
                        </el-tooltip>
                        <el-tooltip v-if="child?.isBeta" class="item__tooltip" effect="light" content="该功能测试中，仅供尝鲜使用"
                          placement="bottom">
                          <el-badge v-if="child?.isBeta" value="BETA" class="item__badge"></el-badge>
                        </el-tooltip>
                      </span>
                      <template v-if="child.type == 'switch'">
                        <el-switch size="small" :model-value="getValueByStoreKey(child.value)"
                          @change="handleSettingChange(child, $event)"
                          :disabled="child.follow && !getValueByStoreKey(child.follow)"
                          :active-color="store.state._play.mode == 'night' ? 'var(--dark_active_color)' : 'var(--active_color)'"
                          :inactive-color="store.state._play.mode == 'night' ? 'var(--dark_title_color)' : 'var(--title_color)'"></el-switch>
                      </template>
                      <template v-else-if="child.type == 'input'">
                        <input type="text" :value="getValueByStoreKey(child.value)"
                          @input="handleSettingChange(child, $event.target.value)" placeholder="请输入" />
                      </template>
                      <template v-else-if="child.type == 'color'">
                        <el-color-picker :model-value="getValueByStoreKey(child.value)" size="small"
                          @change="handleSettingChange(child, $event)" :show-alpha="false">
                          <!-- :predefine="store.state._play.mode == 'night' ? ['#000000', '#ffffff'] : ['#ffffff', '#000000']" -->
                        </el-color-picker>
                      </template>
                      <template v-else-if="child.type == 'select'">
                        <div class="group" v-for="(group) in child.options" :key="group">
                          <p class="group__title">{{ group.name }}</p>
                          <div class="item__wrapper">
                            <div class="item" v-for="(option) in  group.children" :key="option" :class="{
                              active: getValueByStoreKey(child.value) == option.value, 'avatar-selector': child.className == 'avatar', square: store.state._store.account.avatar.useSquare,
                              notAllow: generateLevelAndScoreLimit(option)
                            }"
                              @click="!generateLevelAndScoreLimit(option) && handleSettingChange(child, option.value)">
                              <!-- 头像选框 -->
                              <el-tooltip :disabled="!generateLevelAndScoreLimit(option)" effect="light"
                                :content="generateLevelAndScoreLimit(option)" placement="bottom" :show-after="200">
                                <img :class="child.className" :src="`./avatar/${option.value}`" alt="" srcset="">
                              </el-tooltip>
                            </div>
                          </div>
                        </div>
                      </template>
                      <template v-else-if="child.type == 'level-progress'">
                        <el-tooltip effect="light" :content="`升级还需${1000 - store.state.userInfo.exp}经验`"
                          placement="bottom" :show-after="200">
                          <el-progress type="dashboard" :percentage="store.state.userInfo.exp / 1000 * 100" :width="32"
                            :stroke-width="4" :color="getValueByStoreKey('_store.config.player.activeColor')">
                            <template #default>
                              <span class="percentage-label">{{ store.state.userInfo.level }}</span>
                            </template>
                          </el-progress>
                        </el-tooltip>
                      </template>
                      <template v-else-if="child.type == 'string'">
                        <span class="group__item__content">{{ getValueByStoreKey(child.value) }}
                          <template class="suffix" v-if="child?.suffix">
                            {{ child.suffix }}
                          </template>
                        </span>
                      </template>
                      <template v-else-if="child.type == 'task-progress'">
                        <el-collapse v-if="store.state.userInfo.beginnerTask">
                          <el-collapse-item :title="`任务进度：${store.state.userInfo.beginnerTask?.length} / 5`" name="1">
                            <div class="beginner-task">
                              <div class="task-lists" v-if="store.state.userInfo.beginnerTask">
                                <div class="task-item" v-for="(task, index) in beginnerTaskList" :key="task"
                                  :class="{ active: store.state.userInfo.beginnerTask.includes(index) }">
                                  <i class="fa fa-check-circle"></i>
                                  <i class="far fa-circle"></i>
                                  <span>{{ task.label }}</span>
                                </div>
                              </div>
                            </div>
                          </el-collapse-item>
                        </el-collapse>
                      </template>
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="item.type == 'switch'" :class="{ active: getValueByStoreKey(item.value) }"
                @click="handleSettingChange(getValueByStoreKey(item.value), !getValueByStoreKey(item.value))">
                <el-switch size="small" :model-value="getValueByStoreKey(item.value)"
                  @change="handleSettingChange(item, $event)" :disabled="item.follow && !getValueByStoreKey(item.follow)"
                  :active-color="store.state._play.mode == 'night' ? 'var(--dark_active_color)' : 'var(--active_color)'"
                  :inactive-color="store.state._play.mode == 'night' ? 'var(--dark_title_color)' : 'var(--title_color)'"
                  :active-text="item.options && item.options[0].name"
                  :inactive-text="item.options && item.options[1].name">
                  >
                </el-switch>
              </template>
              <template v-else-if="item.type == 'input'">
                <div class="item__wrapper">
                  <input type="text" :model-value="getValueByStoreKey(item.value)"
                    @input="handleSettingChange(item, $event.target.value)" placeholder="请输入" />
                </div>
              </template>
            </div>
          </el-scrollbar>
        </div>
      </transition>
    </div>
  </div>
</template>
<script setup>
import { ref, nextTick, defineEmits, onUnmounted, watch, watchEffect, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import moment from "moment";
import { getSingleMusicApi, uploadImgApi, getUserInfoApi } from "@/api/api"
import html2canvas from 'html2canvas';
import { MouseMenuDirective as vMouseMenu } from "@howdyjs/mouse-menu";
import { ElTooltip, ElSwitch, ElScrollbar, ElColorPicker, ElBadge } from "element-plus";

const checkType = (type, rule) => {
  return type == rule || type == `${rule}-reply`;
}

var opts = { useCORS: true };

const store = useStore();

getUserInfoApi().then(res => {
  store.commit("updateUserInfo", {
    userInfo: res
  });
})

const emit = defineEmits(["click-chat"]);

moment.locale('zh-cn');

const msg = ref("");
let inputRef = ref(null)
const getInputRef = (el) => {
  inputRef.value = el
}

const inputContainerShow = ref(!store.state._store.account.username), settingContainerShow = ref(false);

const hideInputContainer = () => {
  if (!store.state._store.account.username) {
    store.commit("setMsg", { message: "输入内容不能为空", title: "通知", duration: 0 })
    return;
  }
  inputContainerShow.value = false;
  store.commit("setMsg", { message: `欢迎你，${store.state._store.account.username}`, title: `欢迎使用「一起听」`, duration: 0 })
  // 更新服务器 username 信息
  store.commit("updateUsername");
  // 再次获取用户信息
  getUserInfoApi().then(res => {
    store.commit("updateUserInfo", {
      userInfo: res
    });
  })
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
  document.removeEventListener("keydown", keyDownListener.value);
})

const getHideRoomChangeMessage = ({ type, time }) => {
  return (type === 'room:join' || type === 'room:leave' || type === 'room:rejoin') && (
    !store.state._store.config.room.showRoomChangeMessage
    || (!store.state._store.config.room.showPreviousRoomChangeMessage && moment(time).isBefore(store.state._roomInfo.joinTime))
  )
}

// 在数组中向前查找符合条件的元素
const findPrevItem = (index, fn) => {
  for (let i = index - 1; i >= 0; i--) {
    if (fn(store.state._message[i])) {
      return store.state._message[i];
    }
  }
}

const getPrevMessage = (index) => {
  return findPrevItem(index, (item) => {
    if (store.state._store.config.room.showPreviousRoomChangeMessage)
      return store.state._message[index - 1]
    return !(item.type === 'room:join' || item.type === 'room:leave' || item.type === 'room:create' || item.type === 'room:rejoin' || item.type === 'room:recall' || item.type === 'room:recalled')
  })?.time
}

const generateRelativeTime = (time) => {
  // 判断是否是今天
  if (moment(time).format("YYYY-MM-DD") == moment(nowDate.value).format("YYYY-MM-DD")) {
    // 判断是否是同一小时
    if (moment(time).format("HH") == moment(nowDate.value).format("HH")) {
      // 判断是否是同一分钟
      if (moment(time).format("mm") == moment(nowDate.value).format("mm")) {
        return "刚刚"
      }
      // FIXME: 几分钟内会导致页面滚动 
      // else if (Math.abs(moment(time).format("mm") - moment(nowDate.value).format("mm")) <= 5) {
      //   return moment(time).from(nowDate.value);
      // }
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

  // 判断上一次发送的时间是否超过 1 秒

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
  if (settingContainerShow.value) {
    settingContainerShow.value = false;
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

const roomSettingsList = reactive([
  {
    label: "账号",
    tips: null,
    value: null,
    type: "group",
    children: [
      {
        label: "账号等级",
        tips: "账号等级越高，可用的功能越多",
        value: "userInfo.exp",
        type: "level-progress"
      },
      {
        label: "账号积分",
        tips: "发言（房间消息、点歌、房间效果）可得 1 积分，积分可以兑换头像等装饰，退出房间后自动结算",
        value: "userInfo.score",
        type: "string",
        suffix: "pts"
      },
      {
        label: "最后活跃时间",
        tips: null,
        value: "userInfo.lastLogin",
        type: "string"
      },
      {
        label: "用户标识",
        tips: null,
        value: "userInfo.uuid",
        type: "string"
      },
      {
        label: "任务进度",
        tips: "完成任务可获得大量经验",
        value: "userInfo.beginnerTask",
        type: "task-progress",
        hideTitle: true
      }
    ]
  },

  {
    label: "昵称与头像",
    tips: null,
    value: null,
    type: "group",
    children: [
      {
        label: "修改昵称",
        tips: "修改昵称后，实时生效",
        value: "_store.account.username",
        type: "input"
      },
      {
        label: "方形头像",
        tips: "默认使用圆形头像",
        value: "_store.account.avatar.useSquare",
        type: "switch",
      },
      {
        label: "修改头像",
        tips: "修改头像后，实时生效",
        value: "_store.account.avatar.type",
        type: "select",
        className: "avatar",
        options: [
          {
            name: "简约",
            value: "simple",
            children: [
              {
                name: "",
                value: "s_1-0.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-1.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-2.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-3.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-4.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-5.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-6.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-7.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-8.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-9.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-10.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-11.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-12.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-13.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-14.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-15.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-16.jpg",
                needLevel: 0,
                scoreCost: 0
              },
              {
                name: "",
                value: "s_1-17.jpg",
                needLevel: 0,
                scoreCost: 0
              },
            ]
          },
          {
            name: "粉色（三丽鸥）",
            value: "pink",
            children: [
              {
                name: "",
                value: "p_1-0.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "p_1-1.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "p_1-2.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "p_1-3.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "p_1-4.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "p_1-5.jpg",
                needLevel: 1,
                scoreCost: 0
              },
            ]
          },
          {
            name: "帕恰狗（三丽鸥）",
            value: "dog",
            children: [
              {
                name: "",
                value: "d_1-0.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "d_1-1.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "d_1-2.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "d_1-3.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "d_1-4.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "d_1-5.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "d_1-6.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "d_1-7.jpg",
                needLevel: 1,
                scoreCost: 0
              },
              {
                name: "",
                value: "d_1-8.jpg",
                needLevel: 1,
                scoreCost: 0
              },
            ]
          },
          {
            name: "动态（等待开放兑换）",
            value: "dynamic",
            children: [
              {
                name: "托莉",
                value: "dynamic/托莉.gif",
                needLevel: 2,
                scoreCost: 100
              },
              {
                name: "Cassia",
                value: "dynamic/Cassia.gif",
                needLevel: 2,
                scoreCost: 100
              },
              {
                name: "Cat Face",
                value: "dynamic/Cat Face.gif",
                needLevel: 2,
                scoreCost: 100
              },
              {
                name: "Line Face",
                value: "dynamic/Line Face.gif",
                needLevel: 2,
                scoreCost: 100
              },
              {
                name: "Hellebore",
                value: "dynamic/Hellebore.gif",
                needLevel: 2,
                scoreCost: 100
              },
              {
                name: "Mabinogi Avatar",
                value: "dynamic/Mabinogi Avatar.gif",
                needLevel: 2,
                scoreCost: 100
              },
              {
                name: "Happy Friend",
                value: "dynamic/Happy Friend.gif",
                needLevel: 2,
                scoreCost: 100
              }
            ]
          }
        ]
      }
    ]
  },
  {
    label: "显示与效果",
    tips: "设置房间内的显示与效果",
    value: null,
    type: "group",
    children: [
      {
        label: "主题色",
        tips: "修改主题色后，实时生效，但不再支持暗色主题",
        value: "_store.config.player.activeColor",
        type: "color",
        isBeta: true
      }
    ]
  },
  {
    label: "新消息提示",
    tips: "当有新消息时，是否播放提示音",
    value: "_store.config.room.newMessageSound",
    type: "select",
    options: {
      name: "默认系列",
      value: "default",
      children: [
        {
          name: "静音",
          value: "none"
        },
        {
          name: "气泡",
          value: "message-1.mp3"
        },
        {
          name: "灵动",
          value: "message-2.mp3"
        }
      ]
    }
  },
  {
    label: "用户昵称与头像",
    tips: null,
    value: null,
    type: "group",
    children: [
      {
        label: "总是显示",
        tips: "如果打开，将总是显示用户昵称与头像",
        value: "_store.config.room.alwaysShowUsername",
        type: "switch"
      },
      {
        label: "自动显示",
        tips: "当房间内人数超过两人时，自动显示用户昵称与头像",
        value: "_store.config.room.autoShowUserUsernameInMoreThanTwoPeople",
        type: "switch"
      }
    ]
  },
  {
    label: "进出房间提示",
    tips: null,
    value: null,
    type: "group",
    children: [
      {
        label: "显示提示",
        tips: "如果关闭，将隐藏所有进出房间提示",
        value: "_store.config.room.showRoomChangeMessage",
        type: "switch"
      },
      {
        label: "显示历史提示",
        tips: "如果关闭，将隐藏进入房间前的进出提示",
        value: "_store.config.room.showPreviousRoomChangeMessage",
        type: "switch",
        follow: "_store.config.room.showRoomChangeMessage"
      }
    ]
  }
]);

const getValueByStoreKey = (keyStr) => {
  if (!keyStr) {
    return null;
  }

  // 将 keyStr 拆解
  let keys = keyStr.split('.');
  let value = store.state;
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    value = value[key];
  }

  if (keyStr == "_store.config.player.activeColor") {
    if (!value) {
      if (store.state._play.mode == 'night') value = "#ed5210";
      else if (store.state._play.mode == 'day') value = "#84a4ff";
      else if (store.state._play.mode == 'pink') value = "#eda6c8";
    }
  }

  return value;
}

const setValueByStoreKey = (keyStr, value) => {
  // 将 keyStr 拆解
  let keys = keyStr.split('.');
  let _store = store.state;
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (index == keys.length - 1) {
      _store[key] = value;
    } else {
      _store = _store[key];
    }
  }
}

const handleSettingChange = (item, value) => {
  switch (item.value) {
    case '_store.config.room.newMessageSound':
      if (value != 'none' && value != getValueByStoreKey(item.value)) {
        // 播放声音
        let audio = new Audio();
        audio.src = require(`@/assets/sound/${value}`);
        audio.play();
      }
      break;
    case '_store.account.username':
      store.commit('updateUsername', {
        username: value
      });
      break;
    case '_store.account.avatar.useSquare':
    case '_store.account.avatar.type':
      break;
    case '_store.config.room.showRoomChangeMessage':
      if (!value) {
        store.state._store.config.room.showPreviousRoomChangeMessage = false;
      }
      break;
    default:
      break;
  }
  setValueByStoreKey(item.value, value);

  if (item.value == '_store.account.avatar.useSquare' || item.value == '_store.account.avatar.type') {
    // 重置头像
    store.commit('updateAvatar', {
      avatar: store.state._store.account.avatar
    });
  }
}

// 生成等级及积分限制
const generateLevelAndScoreLimit = ({ needLevel, scoreCost }) => {
  let str = [];

  if (store.state.userInfo.level >= needLevel) {
    needLevel = -1;
  }

  if (needLevel >= 0) str.push(`${needLevel}级可用`);

  if (scoreCost > 0) str.push(`消耗${scoreCost}积分`);
  return str.join("，");
}

// 任务列表
const beginnerTaskList = [
  {
    label: "设置昵称",
    status: "pending",
  },
  {
    label: "设置头像",
    status: "pending",
  },
  {
    label: "发送消息",
    status: "pending",
  },
  {
    label: "添加歌曲",
    status: "pending",
  },
  {
    label: "发送房间效果",
    status: "pending",
  }
];

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

let scrollBarHeight = ref(500);

watchEffect(() => {
  console.log(store.state._currentLrc.lrc, store.state._currentLrc.tlrc, store.state._play.isPlaying);
  nextTick(() => {
    // FIXME: 当页面超长时切换播放状态导致top值不刷新 
    if (document.querySelector(".el-scrollbar__view")?.getBoundingClientRect().height <= scrollBarHeight.value || document.querySelector(".el-scrollbar__wrap")?.scrollTop <= document.querySelector(".currentLrc")?.getBoundingClientRect().height) {
      document.querySelector(".currentLrc")?.classList.add("fixed");
      document.querySelector(".message__wrapper")?.style.setProperty("--top", (document.querySelector(".currentLrc")?.getBoundingClientRect().height || 0) + "px");
    }
  })
})


let keyDownListener = reactive({});

onMounted(() => {
  // 输入任意内容，聚焦到输入框

  keyDownListener.value = document.addEventListener("keydown", (e) => {
    if (store.state._chatContainerShow) {

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

            scrollBarHeight.value = 500;
            store.commit("setMsg", { message: "聊天记录导出成功", title: "通知", duration: 0 })
          });
        })

        return
      }

      if (!inputContainerShow.value && !settingContainerShow.value) {
        // 重新获取 inputRef
        inputRef.value = document.querySelector(".input-wrapper") || document.querySelector(".input-send-wrapper input");
        inputRef.value?.focus();
      }
    }
  })

  document.querySelector(".el-scrollbar__wrap")?.addEventListener("scroll", e => {
    if (e.target.scrollTop <= document.querySelector(".currentLrc")?.getBoundingClientRect().height) {
      document.querySelector(".currentLrc")?.classList.add("fixed");
      document.querySelector(".message__wrapper")?.style.setProperty("--top", (document.querySelector(".currentLrc")?.getBoundingClientRect().height || 0) + "px");
    } else {
      document.querySelector(".currentLrc")?.classList.remove("fixed");
      document.querySelector(".message__wrapper")?.style.setProperty("--top", 0);
    }
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

// 注册自定义指令 MouseMenuDirective


const options = reactive({});
options.value = {
  // useLongPressInMobile: true,
  menuWidth: 140,
  menuWrapperCss: {
    padding: "6px"
  },
  menuItemCss: {
    height: "22px",
    labelFontSize: "12px",
    padding: "3px 6px",
    hoverLabelColor: "#fff",
    hoverTipsColor: "#fff",
  }
}

const menuList = reactive({});
menuList.value = {
  "message": {
    menuList: [
      {
        label: "复制",
        tips: "Copy",
        fn: (params) => {
          // 复制文字到剪贴板
          store.commit(
            "copyToClipBoard",
            {
              text: store.state._message[params].msg
            }
          );
        },
        hidden: (params) => {
          return store.state._message[params].type != "room:message" && store.state._message[params].type != "room:message-reply";
        },
      },
      {
        label: "撤回",
        tips: "Recall",
        fn: (params) => {
          console.log(store.state._message[params])
          store.commit("recallMessage", { index: params });
        },
        hidden: (params) => {
          let time = new Date().getTime();
          return !store.state._roomInfo.isAdmin && (store.state._message[params].uuid != store.state._store.account.uuid || time - new Date(store.state._message[params].time).getTime() > 1000 * 60 * 2)
        },
        disabled: (params) => {
          return !store.state._roomInfo.isAdmin && store.state._message[params].uuid != store.state._store.account.uuid;
        },
      },
      {
        label: "编辑",
        tips: "Edit",
        fn: (params) => {
          console.log(params);
          // 暂未开放提示
          store.commit("setMsg", { message: "该功能暂未开放", title: "提示", duration: 0 })
        },
        hidden: (params) => {
          return store.state._message[params].uuid != store.state._store.account.uuid;
        },
        disabled: (params) => {
          return store.state._message[params].uuid != store.state._store.account.uuid;
        }
      },
      // 回复
      {
        label: "回复",
        tips: "Reply",
        fn: (params) => {
          console.log(params);
          // 暂未开放提示
          store.commit("setMsg", { message: "该功能暂未开放", title: "提示", duration: 0 })
        },
        hidden: (params) => {
          return store.state._message[params].uuid == store.state._store.account.uuid;
        },
        disabled: (params) => {
          return store.state._message[params].uuid == store.state._store.account.uuid;
        }
      }
    ]
  },
  "effect": {
    menuList: [
      {
        label: "我也要发",
        tips: "Send",
        fn: () => {
          roomEffectSelectorShow.value = true;
        }
      },
      {
        label: "重播",
        tips: "Replay",
        fn: (params) => {
          playRoomEffect(params);
        }
      }]
  }
}

const formatRecallMessage = (msgItem) => {
  return `${msgItem.uuid === store.state._message[msgItem.addition.index].uuid ? '一条消息' : (store.state._message[msgItem.addition.index].uuid == store.state._store.account.uuid ? '你' : store.state._message[msgItem.addition.index].username) + "的消息"}`
}

</script>
<style lang='scss' scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Yuanti SC', 'Microsoft Yahei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
}

// vue3 transition fade
.fade-enter-active,
.fade-leave-active {
  transition: .2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

// vue3 transition backOutRight
.backOutRight-enter-active,
.backOutRight-leave-active {
  transition: .2s;
}

.backOutRight-enter-from,
.backOutRight-leave-to {
  opacity: 0;
  transform: scale(0);
}

.backOutRight-enter-to,
.backOutRight-leave-from {
  opacity: 1;
  transform: scale(1);
  background: transparent !important;
}

// vue3 transition slide-from-left-to-right
.slide-from-left-to-right-enter-active,
.slide-from-left-to-right-leave-active {
  transition: transform .2s;
}

.slide-from-left-to-right-enter-from {
  transform: translateX(-100%);
}

.slide-from-left-to-right-enter-to,
.slide-from-left-to-right-leave-from {
  transform: translateX(0);
}

.slide-from-left-to-right-leave-to {
  transform: translateX(100%);
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

        &.active,
        &:hover {
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
    }
  }

  .dark & {
    background-color: rgba(0, 0, 0, 0.72);
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
  transform: translate(-50%, -50%);
  border-radius: 20px;
  // overflow: hidden;
  z-index: 4;
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  .chat__container-header {
    color: var(--title_color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 14px 10px 14px;
    line-height: 20px;

    .flex {
      display: flex;
      align-items: center;
      gap: 4px;

      .title {
        font-size: 16px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 2px;

        .room-count {
          font-size: inherit;
          cursor: pointer;
        }
      }

      .icon {
        cursor: pointer;
        transition: .2s;
        display: flex;
        justify-content: center;
        align-items: center;

        svg {
          font-size: 15px;
        }

        &:hover {
          color: var(--active_color);
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
    top: 44px;
    left: 50%;
    width: calc(100% - 28px);
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
    z-index: 3;

    * {
      font-size: 13px;
    }

    .title {
      text-align: center;
    }

    &.room-setting {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      border-radius: 20px;
      box-shadow: 0 0 20px rgba($color: #000000, $alpha: .1);
      justify-content: initial;
      height: 600px;
      display: block;

      .room-setting-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px;

        .title {
          text-align: initial;
          font-size: 14px;
          font-weight: bold;
        }

        svg {
          font-size: 15px;
          cursor: pointer;
          transition: .2s;

          &:hover {
            color: var(--active_color);
          }
        }
      }

      :deep .el-scrollbar__wrap {
        border-radius: 10px;
        overflow: hidden;
        overflow-y: auto;

        .el-scrollbar__view {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 4px 0;
        }
      }

      .group {
        padding: 6px 10px;

        .group__title {
          font-size: 12px;
        }
      }

      .setting-item {
        &.inline {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 28px;

          .item__title {
            margin-bottom: 0;
          }
        }

        .item__title {
          font-size: 13px;
          margin-bottom: 6px;

          &.flex {
            display: flex;
            align-items: center;
            gap: 4px;

            justify-content: center;
            position: sticky;
            top: 0;
            background: var(--player_color);
            padding: 5px 0;
            z-index: 1;

            svg {
              display: flex;
              align-items: center;
              cursor: pointer;
            }
          }
        }
      }
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

        &.flex {
          display: flex;
          align-items: center;
          gap: 4px;

          svg {
            display: flex;
            align-items: center;
            cursor: pointer;
          }
        }
      }

      .group__item__wrapper {
        display: flex;
        flex-direction: column;
        gap: 3px;

        .group__item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 28px;
          line-height: 100%;

          &.second-group {
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            .group {
              width: 100%;
              font-size: 12px;

              .group__title {
                font-size: inherit;
              }

              .item__wrapper {
                grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
              }
            }
          }

          .group__item__title {
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 3px;
            min-height: 28px;

            svg {
              display: flex;
              align-items: center;
              cursor: pointer;
            }

            .item__badge {
              transform: scale(.7);
              transform-origin: center left;

              :deep .el-badge__content {
                background-color: var(--active_color);
              }
            }
          }

          .group__item__content {}

          :deep .el-progress {
            transform: translateX(5px);

            .el-progress__text {
              min-width: 100%;

              .percentage-label {
                color: var(--active_color);
                font-weight: bold;
                font-size: 12px;
              }
            }
          }

          :deep .el-collapse {
            width: 100%;
            border: none;

            * {
              font-family: "Yuanti SC", "Microsoft Yahei", "Helvetica Neue", Helvetica, Arial, sans-serif !important;
            }

            .el-collapse-item__arrow {
              margin-right: 0;
            }

            .el-collapse-item {
              border: none;

              &:last-child {
                margin-bottom: 0;
              }

              &.is-active {
                border: none;
              }
            }

            .el-collapse-item__header {
              height: 28px;
              font-size: 12px;
              color: var(--title_color);
              border: none;
              background: none;
              line-height: 100%;

              &.is-active {
                border: none;
              }
            }

            .el-collapse-item__wrap {
              border: none;
              background: none;
            }

            .el-collapse-item__content {
              padding-bottom: 0;
            }

            .task-lists {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              row-gap: 3px;
              column-gap: 10px;

              .task-item {
                color: var(--title_color);
                display: flex;
                align-items: center;
                gap: 4px;

                span {
                  font-size: 12px;
                }

                .fa-circle {
                  display: block;
                }

                .fa-check-circle {
                  display: none;
                }

                &.active {
                  color: var(--active_color);

                  .fa-circle {
                    display: none;
                  }

                  .fa-check-circle {
                    display: block;
                  }
                }
              }
            }
          }
        }
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

          svg {
            transform: scale(.65);
            transform-origin: center;
          }

          &.active,
          &:hover {
            background-color: var(--active_color);
            color: white;
          }

          &.avatar-selector {
            border-radius: 50%;
            overflow: hidden;
            padding: 0;
            border-width: 2px;
            border-color: transparent;

            &.square {
              border-radius: 10px;
            }

            &.notAllow {
              opacity: .5;
              cursor: not-allowed;
            }

            &:hover {
              transform: scale(1.2);
              border-width: 1px;

              .avatar {
                transform: scale(1.1);
              }
            }

            .avatar {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          }
        }
      }

      input {
        appearance: none;
        border: none;
        outline: none;
        background-color: transparent;
        overflow: hidden;
        height: 100%;
        line-height: 100%;
        transition: .2s;
        cursor: pointer;
        font-size: 12px;
        color: var(--active_color);
        text-align: right;
        border: 1px solid transparent;

        &:hover {
          opacity: .8;
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
    height: 500px;
    overflow: hidden;

    .currentLrc {
      position: absolute;
      left: 0;
      z-index: 2;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(233, 241, 252, 0.28) 30% 70%, rgba(255, 255, 255, 0) 100%);
      background-color: rgba(255, 255, 255, .72);
      backdrop-filter: blur(20px) saturate(120%);
      color: var(--active_color);
      overflow: hidden;
      width: 100%;
      max-width: 100%;
      min-height: 30px;
      transition: .2s;
      text-align: center;

      &.fixed {
        background-color: initial;
        backdrop-filter: initial;
        padding: 0;
      }

      .dark & {
        background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(37, 40, 45, .28) 30% 70%, rgba(255, 255, 255, 0) 100%);
        background-color: rgba(0, 0, 0, 0.72);
      }

      span {
        font-size: 12px;
        padding: 6px 10px;
        display: block;

        p {
          font-size: inherit;
          line-height: 150%;

          &:nth-child(2) {
            color: var(--secondary_color);
          }
        }
      }
    }

    .message__wrapper {
      top: var(--top, 0);
      width: 100%;
      transition: .2s;
      padding: 0 14px;

      &:deep .el-scrollbar__wrap {
        transition: .2s;
      }

      &:deep .el-scrollbar__view {
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

            .message__item-wrapper {
              flex-direction: row-reverse;

              .message__item-username {
                display: none;
              }
            }
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

            &.hide-room-change-message {
              display: none;
            }

            span {
              color: var(--title_color);
              font-size: 12px;
            }

            &.right {
              &.leave {
                .message__item-content {
                  color: var(--secondary_color);
                }
              }

              .message__item-content {
                color: var(--active_color);
              }
            }
          }

          &:not(.room-change-message) {
            .message__item-wrapper {
              display: flex;
              align-items: flex-start;
              gap: 6px;
              max-width: 80%;

              &:nth-child(1) {
                margin-top: 6px;
              }

              &:nth-child(2) {
                margin-top: 4px;
              }

              &:not(:last-child) {
                margin-bottom: 10px;
              }
            }

            .message__item-avatar {
              width: 32px;
              min-width: 32px;
              object-fit: contain;
              overflow: hidden;
              border-radius: 50%;

              &.useSquare {
                border-radius: 10px;
              }
            }

            .message__item-right-box {
              display: flex;
              flex-direction: column;
              width: fit-content;
              max-width: 100%;
              gap: 4px;

              .message__item-username {
                color: var(--title_color);
                font-size: 12px;
              }

              .message__item-content {
                margin-top: 0;
              }
            }

            .message__item-content {
              padding: 6px 12px;
              width: fit-content;
              background-color: var(--player_color);
              color: var(--title_color);
              border-radius: 10px;
              margin-top: 4px;
              max-width: 100%;
              min-height: 32px;
              word-break: break-all;
              font-size: 14px;

              a {
                color: inherit;
                text-decoration: underline;
                font-family: inherit;
                transition: .2s;

                &:hover {
                  color: var(--active_color);
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
                max-width: initial;

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
                  box-shadow: inset 6px 6px 12px #c9460e, inset -6px -6px 12px #ff5e12;
                }
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
                }
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
    padding: 10px 14px 14px 14px;

    .preCheck-musicInfo {
      position: absolute;
      bottom: calc(100%);
      left: 15px;
      background-color: var(--player_color);
      color: var(--active_color);
      border-radius: 10px;
      overflow: hidden;
      max-width: 100%;
      z-index: 2;

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

      &:hover {
        background-color: transparent;
        border-color: var(--border_color);
      }

      &:focus {
        border-color: var(--active_color);
      }

      &::placeholder {
        color: var(--title_color);
        opacity: .3;
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

      &:deep img {
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

.chat-member {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));

  .chat-member-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;

    &.active {
      color: var(--active_color);

      .el-avatar {
        border: 2px solid var(--active_color);
      }
    }

    .useSquare {
      border-radius: 10px;
    }
  }
}
</style>