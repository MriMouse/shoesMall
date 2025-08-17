<template>
  <div class="test-user-cart">
    <h2>用户ID获取测试</h2>
    
    <!-- 用户信息 -->
    <div class="user-info">
      <h3>当前用户信息</h3>
      <p><strong>用户名:</strong> {{ currentUsername || '未登录' }}</p>
      <p><strong>用户ID:</strong> {{ currentUserId || '未获取' }}</p>
      <p><strong>登录状态:</strong> {{ isLoggedIn ? '已登录' : '未登录' }}</p>
    </div>
    
    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="getUserId" :disabled="!isLoggedIn" class="btn btn-primary">
        获取用户ID
      </button>
      <button @click="testAPI" :disabled="!isLoggedIn" class="btn btn-secondary">
        测试API调用
      </button>
      <button @click="testRegister" class="btn btn-dark">
        测试注册
      </button>
      <button @click="testLogin" class="btn btn-light">
        测试登录
      </button>
    </div>
    
    <!-- 测试结果 -->
    <div class="test-results">
      <h3>测试结果</h3>
      <div class="results-list">
        <div v-for="(result, index) in testResults" :key="index" class="result-item">
          <span class="timestamp">{{ result.timestamp }}</span>
          <span class="status" :class="result.success ? 'success' : 'error'">
            {{ result.success ? '✓' : '✗' }}
          </span>
          <span class="message">{{ result.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userManager from '../utils/userManager'
import axios from 'axios'

export default {
  name: 'TestUserCart',
  data() {
    return {
      currentUsername: '',
      currentUserId: null,
      isLoggedIn: false,
      testResults: []
    }
  },
  
  async mounted() {
    this.updateUserInfo()
  },
  
  methods: {
    updateUserInfo() {
      const user = userManager.getCurrentUser()
      this.currentUsername = typeof user === 'string' ? user : (user?.username || '')
      this.isLoggedIn = userManager.isLoggedIn()
    },
    
    addTestResult(success, message) {
      const timestamp = new Date().toLocaleTimeString()
      this.testResults.unshift({
        timestamp,
        success,
        message
      })
      
      if (this.testResults.length > 50) {
        this.testResults = this.testResults.slice(0, 50)
      }
    },
    
    async getUserId() {
      try {
        this.addTestResult(true, '开始获取用户ID...')
        this.addTestResult(true, `当前用户名: ${this.currentUsername}`)
        this.addTestResult(true, `登录状态: ${this.isLoggedIn}`)
        
        const userId = await userManager.getUserId()
        if (userId) {
          this.currentUserId = userId
          this.addTestResult(true, `成功获取用户ID: ${userId}`)
          this.updateUserInfo()
        } else {
          this.addTestResult(false, '获取用户ID失败')
        }
      } catch (error) {
        this.addTestResult(false, `获取用户ID异常: ${error.message}`)
      }
    },

    async testAPI() {
      try {
        this.addTestResult(true, '开始测试用户API调用...')
        
        this.addTestResult(true, '测试后端连接...')
        await axios.post('http://localhost:8081/users/getAllUsers', {}, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        this.addTestResult(true, '后端连接正常')
        
        this.addTestResult(true, '测试获取用户ID接口...')
        const params = new URLSearchParams({ username: this.currentUsername })
        
        const response = await axios.post('http://localhost:8081/users/getUserIdByUsername', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        
        this.addTestResult(true, `API调用成功，响应: ${JSON.stringify(response.data)}`)
        
      } catch (error) {
        console.error('API测试错误:', error)
        this.addTestResult(false, `API调用异常: ${error.message}`)
        
        if (error.response) {
          this.addTestResult(false, `错误状态码: ${error.response.status}`)
          this.addTestResult(false, `错误数据: ${JSON.stringify(error.response.data)}`)
        }
      }
    },
    
    async testRegister() {
      try {
        this.addTestResult(true, '开始测试用户注册...')
        
        const params = new URLSearchParams({
          username: 'testuser123',
          email: 'test@example.com',
          gender: '男',
          password: '123456'
        })
        
        const response = await axios.post('http://localhost:8081/usersLogin/userRegister', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        
        console.log('注册响应:', response.data)
        this.addTestResult(true, `注册响应: ${JSON.stringify(response.data)}`)
        
      } catch (error) {
        console.error('注册测试错误:', error)
        this.addTestResult(false, `注册测试异常: ${error.message}`)
        
        if (error.response) {
          this.addTestResult(false, `错误状态码: ${error.response.status}`)
          this.addTestResult(false, `错误数据: ${JSON.stringify(error.response.data)}`)
        }
      }
    },
    
    async testLogin() {
      try {
        this.addTestResult(true, '开始测试用户登录...')
        
        const params = new URLSearchParams({
          username: 'testuser123',
          password: '123456'
        })
        
        const response = await axios.post('http://localhost:8081/usersLogin/userLogin', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
        
        console.log('登录响应:', response.data)
        this.addTestResult(true, `登录响应: ${JSON.stringify(response.data)}`)
        
      } catch (error) {
        console.error('登录测试错误:', error)
        this.addTestResult(false, `登录测试异常: ${error.message}`)
        
        if (error.response) {
          this.addTestResult(false, `错误状态码: ${error.response.status}`)
          this.addTestResult(false, `错误数据: ${JSON.stringify(error.response.data)}`)
        }
      }
    }
  }
}
</script>

<style scoped>
.test-user-cart {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.user-info, .actions, .test-results {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-dark {
  background-color: #343a40;
  color: white;
}

.btn-light {
  background-color: #f8f9fa;
  color: black;
}

.results-list {
  max-height: 300px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
}

.timestamp {
  color: #666;
  font-size: 12px;
  min-width: 80px;
}

.status {
  font-weight: bold;
  min-width: 40px;
}

.status.success {
  color: #28a745;
}

.status.error {
  color: #dc3545;
}

.message {
  flex: 1;
  word-break: break-all;
}
</style>
