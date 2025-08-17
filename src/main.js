import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import axios from 'axios'
import cartManager from './utils/cart'
import { UserAPI } from './api'

// 移除axios基础URL设置，让vue.config.js中的代理配置正常工作
// axios.defaults.baseURL = 'http://localhost:8081' // 请根据您的后端服务地址修改

// 添加axios请求拦截器，确保所有POST请求都包含正确的Content-Type
axios.interceptors.request.use(
  (config) => {
    // 如果是POST请求且没有设置Content-Type，则设置默认值
    if (config.method === 'post' && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const app = createApp(App);

app.use(router);

app.mount("#app");

// 初始化购物车用户ID（全局）
(async () => {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return
    let parsed
    try { parsed = JSON.parse(userStr) } catch (e) { parsed = { username: userStr } }
    const resolvedUserId = Number(parsed?.id || parsed?.userId)
    if (resolvedUserId) {
      cartManager.setUserId(resolvedUserId)
      return
    }
    // 回退：只有用户名，无ID，按用户名查询ID
    if (parsed?.username) {
      try {
        const listRes = await UserAPI.getAllUsers()
        if (listRes.data && listRes.data.code === 200 && Array.isArray(listRes.data.data)) {
          const matched = listRes.data.data.find(u => u.username === parsed.username)
          if (matched?.id) {
            const id = Number(matched.id)
            cartManager.setUserId(id)
            // 持久化补全ID
            localStorage.setItem('user', JSON.stringify({ ...parsed, id }))
          }
        }
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // ignore
  }
})()
