<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  overflow-x: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  width: 100%;
  overflow-x: hidden;
}

body {
  line-height: 1.6;
  color: #2c3e50;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
}

/* 响应式字体大小 */
@media (max-width: 768px) {
  body {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  body {
    font-size: 13px;
  }
}

/* 确保所有图片和媒体元素不会溢出容器 */
img, video, iframe {
  max-width: 100%;
  height: auto;
  box-sizing: border-box;
}

/* 防止表格溢出 */
table {
  max-width: 100%;
  overflow-x: auto;
  display: block;
}

/* 确保所有容器都不会产生水平滚动 */
.container, .wrapper, .content {
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}
</style>
