<template>
  <div class="test-address">
    <h1>地址管理功能测试</h1>
    
    <div class="test-section">
      <h2>用户信息测试</h2>
      <button @click="testUserInfo">测试用户信息</button>
      <div v-if="userInfo">
        <p>用户ID: {{ userInfo.userId }}</p>
        <p>用户名: {{ userInfo.username }}</p>
      </div>
    </div>
    
    <div class="test-section">
      <h2>地址API测试</h2>
      <button @click="testAddressAPI">测试地址API</button>
      <div v-if="addressTestResult">
        <pre>{{ JSON.stringify(addressTestResult, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="test-section">
      <h2>地址管理组件</h2>
      <AddressManagement />
    </div>
  </div>
</template>

<script>
import AddressManagement from '@/components/profile/AddressManagement.vue'
import userManager from '@/utils/userManager'
import { AddressAPI } from '@/api'

export default {
  name: 'TestAddress',
  components: {
    AddressManagement
  },
  data() {
    return {
      userInfo: null,
      addressTestResult: null
    }
  },
  methods: {
    async testUserInfo() {
      try {
        const userId = await userManager.getUserId()
        const username = userManager.getCurrentUsername()
        this.userInfo = { userId, username }
        console.log('用户信息:', this.userInfo)
      } catch (error) {
        console.error('获取用户信息失败:', error)
        alert('获取用户信息失败: ' + error.message)
      }
    },
    
    async testAddressAPI() {
      try {
        const userId = await userManager.getUserId()
        if (!userId) {
          alert('用户未登录')
          return
        }
        
        console.log('测试地址API，用户ID:', userId)
        
        // 测试获取地址列表
        const listResponse = await AddressAPI.getList(userId)
        console.log('获取地址列表响应:', listResponse)
        
        this.addressTestResult = {
          userId,
          listResponse: listResponse.data,
          timestamp: new Date().toISOString()
        }
      } catch (error) {
        console.error('测试地址API失败:', error)
        this.addressTestResult = {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }
    }
  }
}
</script>

<style scoped>
.test-address {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.test-section h2 {
  margin-top: 0;
  color: #333;
}

button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

button:hover {
  background-color: #2980b9;
}

pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
