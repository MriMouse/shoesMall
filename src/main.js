import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import axios from 'axios'

// 设置axios基础URL（根据您的后端服务地址调整）
axios.defaults.baseURL = 'http://localhost:8080' // 请根据您的后端服务地址修改

const app = createApp(App);

app.use(router);

app.mount("#app");
