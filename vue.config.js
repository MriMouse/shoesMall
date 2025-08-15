const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8082, // 前端端口
    proxy: {
      "/api": {
        target: "http://localhost:8081", // 后端端口
        changeOrigin: true,
        pathRewrite: { "^/api": "" },
      },
    },
  },
});
