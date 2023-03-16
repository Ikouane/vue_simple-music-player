<!--
 * @Author: ikouane
 * @PoweredBy: 未央宫©WeYounG
 * @Date: 2023-03-15 16:39:14
 * @LastEditTime: 2023-03-15 22:50:29
 * @LastEditors: ikouane
 * @Description: 
 * @version: 
-->
<template>
  <div class="mask" @click.self="$emit('click-chat')">
    <div class="chat__container">
      <input type="text" v-model="msg" :ref="getInputRef" @keydown.enter="sendMessage" autofocus>
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
const msg = ref("");
let inputRef = ref(null)
const getInputRef = (el) => {
  inputRef.value = el
}
const store = useStore();
const sendMessage = () => {
  if (msg.value == "") {
    store.commit("setMsg", { message: "输入内容不能为空", title: "通知" })
  } else {
    store.commit("sendMessage", {
      msg: msg.value
    })

    msg.value = "";
    inputRef.value.focus();
  }
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

  input {
    background-color: rgba(0, 0, 0, 0.88);
    color: white;
  }

  button {
    background-color: rgba(0, 0, 0, 0.88);
    color: white;
  }
}

.chat__container {
  position: fixed;
  background-color: var(--player_color);
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

  input {
    padding: 10px 14px;
    border: none;
    outline: none;
    font-size: 15px;
  }

  button {
    border: none;
    outline: none;
    padding: 6px 8px;
    cursor: pointer;
  }
}
</style>