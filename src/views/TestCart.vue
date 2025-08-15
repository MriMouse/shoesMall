<template>
  <div class="test-cart">
    <h2>购物车功能测试</h2>
    
    <div class="test-section">
      <h3>用户信息</h3>
      <div>用户ID: {{ userId || '未设置' }}</div>
      <button @click="setTestUser">设置测试用户</button>
    </div>
    
    <div class="test-section">
      <h3>加入购物车测试</h3>
      <div class="form-group">
        <label>商品ID:</label>
        <input v-model="testShoeId" type="number" placeholder="输入商品ID" />
      </div>
      <div class="form-group">
        <label>尺码ID:</label>
        <input v-model="testSizeId" type="number" placeholder="输入尺码ID" />
      </div>
      <div class="form-group">
        <label>数量:</label>
        <input v-model="testQuantity" type="number" placeholder="输入数量" />
      </div>
      <button @click="testAddToCart">测试加入购物车</button>
    </div>
    
    <div class="test-section">
      <h3>测试结果</h3>
      <pre>{{ testResult }}</pre>
    </div>
    
    <div class="test-section">
      <h3>购物车状态</h3>
      <div>购物车商品数量: {{ cartItemCount }}</div>
      <button @click="loadCartDetails">加载购物车详情</button>
      <pre>{{ cartDetails }}</pre>
    </div>
  </div>
</template>

<script>
import { CartAPI } from '@/api'
import cartManager from '@/utils/cart'

export default {
  name: 'TestCart',
  data() {
    return {
      userId: null,
      testShoeId: 1,
      testSizeId: 1,
      testQuantity: 1,
      testResult: '',
      cartItemCount: 0,
      cartDetails: ''
    }
  },
  
  mounted() {
    this.loadUserInfo()
  },
  
  methods: {
    loadUserInfo() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          this.userId = user.id
          cartManager.setUserId(user.id)
        } catch (e) {
          console.error('解析用户信息失败:', e)
        }
      }
    },
    
    setTestUser() {
      // 设置一个测试用户ID
      this.userId = 1
      cartManager.setUserId(1)
      localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test' }))
      this.testResult = '已设置测试用户ID: 1'
    },
    
    async testAddToCart() {
      if (!this.userId) {
        this.testResult = '错误: 请先设置用户ID'
        return
      }
      
      if (!this.testShoeId || !this.testSizeId || !this.testQuantity) {
        this.testResult = '错误: 请填写完整的测试参数'
        return
      }
      
      this.testResult = '正在测试加入购物车...'
      
      try {
        console.log('=== 测试加入购物车 ===')
        console.log('用户ID:', this.userId)
        console.log('商品ID:', this.testShoeId)
        console.log('尺码ID:', this.testSizeId)
        console.log('数量:', this.testQuantity)
        
        // 直接调用API
        const response = await CartAPI.addToCart(this.userId, this.testSizeId, this.testShoeId, this.testQuantity)
        
        console.log('API响应:', response)
        
        this.testResult = JSON.stringify({
          status: response.status,
          data: response.data,
          success: response.data?.code === 200
        }, null, 2)
        
        if (response.data?.code === 200) {
          // 刷新购物车数量
          await this.loadCartItemCount()
        }
        
      } catch (error) {
        console.error('测试失败:', error)
        this.testResult = JSON.stringify({
          error: error.message,
          response: error.response?.data,
          status: error.response?.status
        }, null, 2)
      }
    },
    
    async loadCartItemCount() {
      try {
        const response = await CartAPI.getCartItemCount(this.userId)
        if (response.data?.code === 200) {
          this.cartItemCount = response.data.data || 0
        }
      } catch (error) {
        console.error('加载购物车数量失败:', error)
      }
    },
    
    async loadCartDetails() {
      try {
        const response = await CartAPI.getCartOrdersWithDetails(this.userId)
        if (response.data?.code === 200) {
          this.cartDetails = JSON.stringify(response.data.data, null, 2)
        } else {
          this.cartDetails = JSON.stringify(response.data, null, 2)
        }
      } catch (error) {
        console.error('加载购物车详情失败:', error)
        this.cartDetails = JSON.stringify({ error: error.message }, null, 2)
      }
    }
  }
}
</script>

<style scoped>
.test-cart {
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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}

button:hover {
  background-color: #40a9ff;
}

pre {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
