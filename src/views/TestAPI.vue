<template>
  <div class="test-api">
    <h1>API 连接测试</h1>
    
    <div class="test-section">
      <h2>用户信息测试</h2>
      <button @click="testGetAllUsers" :disabled="loading">获取所有用户</button>
      <button @click="testGetUserInfo" :disabled="loading">获取当前用户信息</button>
      
      <div v-if="loading" class="loading">加载中...</div>
      
      <div v-if="result" class="result">
        <h3>测试结果：</h3>
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="test-section">
      <h2>当前用户信息</h2>
      <div v-if="currentUser">
        <p><strong>用户名：</strong>{{ currentUser.username }}</p>
        <p><strong>用户ID：</strong>{{ currentUserId }}</p>
      </div>
      <div v-else>
        <p>未登录</p>
      </div>
    </div>
  </div>
</template>

<script>
import { UserAPI } from '@/api'
import userManager from '@/utils/userManager'

export default {
  name: 'TestAPI',
  data() {
    return {
      loading: false,
      result: null,
      currentUser: null,
      currentUserId: null
    }
  },
  mounted() {
    this.loadCurrentUser()
  },
  methods: {
    async loadCurrentUser() {
      this.currentUser = userManager.getCurrentUser()
      if (this.currentUser) {
        this.currentUserId = await userManager.getUserId()
      }
    },
    
    async testGetAllUsers() {
      this.loading = true
      this.result = null
      try {
        const response = await UserAPI.getAllUsers()
        this.result = response
      } catch (error) {
        this.result = { error: error.message }
      } finally {
        this.loading = false
      }
    },
    
    async testGetUserInfo() {
      this.loading = true
      this.result = null
      try {
        const username = userManager.getCurrentUsername()
        if (!username) {
          this.result = { error: '用户未登录' }
          return
        }
        
        const response = await UserAPI.getUserInfo(username)
        this.result = response
      } catch (error) {
        this.result = { error: error.message }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.test-api {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

button {
  margin-right: 10px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  color: #007bff;
  margin: 10px 0;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.result pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
