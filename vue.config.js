const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8082, // 修改为8082，和你的前端一致
    proxy: {
      "/api": {
        target: "http://localhost:8081", // 后端端口为8081
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
        logLevel: "debug", // 添加日志以便调试
      },
    },
  },
});
