import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import axios from 'axios'

// 设置axios基础URL（使用代理配置）
axios.defaults.baseURL = '/api' // 使用代理，这样请求会被转发到后端

const app = createApp(App);

app.use(router);

app.mount("#app");
