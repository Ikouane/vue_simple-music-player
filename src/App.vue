<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <Main />
  </div>
</template>

<script>
// import HelloWorld from "./components/HelloWorld.vue";
import Main from "./components/Main";
import "@/assets/index.css";
export default {
  name: "App",
  components: {
    // HelloWorld,
    Main,
  },
};
</script>
<style lang="scss">
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

// #app {
//   // font-family: Avenir, Helvetica, Arial, sans-serif;
//   // -webkit-font-smoothing: antialiased;
//   // -moz-osx-font-smoothing: grayscale;
//   // text-align: center;
//   // color: #2c3e50;
//   // margin-top: 60px;
// }
</style>