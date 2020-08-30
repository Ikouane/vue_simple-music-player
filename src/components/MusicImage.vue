<template>
  <div class="music-image">
    <img
      class="middle-image"
      src="https://cdn.weyoung.tech/%E5%9B%BE%E7%89%87/Media%20%28lable%20side%20of%20CD%29.jpg"
      alt="图片加载失败"
    />
  </div>
</template>
<script>
export default {
  name: "MusicImage",
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

.music-image {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  box-shadow: 20px 20px 24px #b6bcc5, -20px -20px 24px #ffffff;
  margin-bottom: 40px;

  .middle-image {
    width: 250px;
    height: 250px;
    object-fit: cover;
    border-radius: 50%;
    border: 6px solid $player_color;
    background: linear-gradient(145deg, #f9ffff, #d2d9e3);
  }
}
</style>