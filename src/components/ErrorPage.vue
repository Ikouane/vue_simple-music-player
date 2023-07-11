<!--
 * @Author: ikouane
 * @PoweredBy: 未央宫©WeYounG
 * @Date: 2023-07-07 10:19:41
 * @LastEditTime: 2023-07-07 10:20:16
 * @LastEditors: ikouane
 * @Description: 自定义错误页
 * @version: 
-->
<template>
  <div>
    <h1>404</h1>
    <p>Page not found</p>
    {{ message }}
  </div>
</template>
<script setup>
const message = 'Page not found';
</script>
<style lang="scss" scoped></style>