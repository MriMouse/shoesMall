<template>
  <div class="test-order-management">
    <div class="container">
      <h1>订单管理功能测试</h1>

      <!-- 测试用户ID输入 -->
      <div class="test-section">
        <h3>测试用户ID</h3>
        <div class="input-group">
          <label>用户ID:</label>
          <input v-model="testUserId" type="number" placeholder="输入用户ID进行测试">
          <button @click="testLoadOrders" class="btn btn-primary">加载订单</button>
          <button @click="quickTest" class="btn btn-info">快速测试</button>
        </div>
        <p v-if="testUserId">当前测试用户ID: {{ testUserId }}</p>

        <!-- 新增测试按钮 -->
        <div class="test-buttons" v-if="orderCount > 0">
          <button @click="testOrderStatusUpdate" class="btn btn-success">测试状态修改</button>
          <button @click="testBatchOperation" class="btn btn-warning">测试批量操作</button>
        </div>
      </div>

      <!-- 订单管理组件 -->
      <div class="order-management-wrapper">
        <OrderManagement ref="orderManagement" />
      </div>

      <!-- 测试结果 -->
      <div class="test-results">
        <h3>测试结果</h3>
        <div class="result-item">
          <strong>订单总数:</strong> {{ orderCount }}
        </div>
        <div class="result-item">
          <strong>选中的订单:</strong> {{ selectedOrderCount }}
        </div>
        <div class="result-item">
          <strong>订单状态分布:</strong>
          <ul>
            <li v-for="(count, status) in statusDistribution" :key="status">
              {{ getStatusText(status) }}: {{ count }}个
            </li>
          </ul>
        </div>

        <!-- 新增：调试信息 -->
        <div class="result-item" v-if="orderCount > 0">
          <strong>调试信息:</strong>
          <div class="debug-info">
            <p><strong>第一个订单详情:</strong></p>
            <pre>{{ JSON.stringify(firstOrder, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OrderManagement from '@/components/profile/OrderManagement.vue'
import userManager from '@/utils/userManager'

export default {
  name: 'TestOrderManagement',
  components: {
    OrderManagement
  },
  data() {
    return {
      testUserId: null,
      orderCount: 0,
      selectedOrderCount: 0,
      statusDistribution: {},
      firstOrder: null // 新增：用于存储第一个订单的详细信息
    }
  },
  mounted() {
    // 获取当前登录用户的ID
    this.testUserId = userManager.getUserId()
  },
  methods: {
    async testLoadOrders() {
      if (!this.testUserId) {
        alert('请输入用户ID')
        return
      }

      try {
        // 模拟设置用户ID到userManager
        userManager.setUserId(this.testUserId)

        // 重新加载订单
        await this.$refs.orderManagement.loadOrders()

        // 更新测试结果
        this.updateTestResults()

        alert('订单加载完成！')
      } catch (error) {
        console.error('测试加载订单失败:', error)
        alert('测试失败: ' + error.message)
      }
    },

    updateTestResults() {
      const orders = this.$refs.orderManagement.orders || []
      this.orderCount = orders.length

      const selectedOrders = orders.filter(order => order.selected)
      this.selectedOrderCount = selectedOrders.length

      // 统计状态分布
      this.statusDistribution = {}
      orders.forEach(order => {
        const status = order.status || 'unknown'
        this.statusDistribution[status] = (this.statusDistribution[status] || 0) + 1
      })

      // 获取第一个订单的详细信息
      if (orders.length > 0) {
        this.firstOrder = orders[0]
      } else {
        this.firstOrder = null
      }

      console.log('测试结果更新:', {
        orderCount: this.orderCount,
        selectedOrderCount: this.selectedOrderCount,
        statusDistribution: this.statusDistribution
      })
    },

    // 新增：测试订单状态修改
    async testOrderStatusUpdate() {
      const orders = this.$refs.orderManagement.orders || []
      if (orders.length === 0) {
        alert('没有订单可以测试')
        return
      }

      const testOrder = orders[0]
      const originalStatus = testOrder.status

      try {
        // 测试状态更新
        await this.$refs.orderManagement.payOrder(testOrder)
        alert(`订单状态从 ${this.getStatusText(originalStatus)} 更新为 ${this.getStatusText(testOrder.status)}`)
        this.updateTestResults()
      } catch (error) {
        console.error('测试状态更新失败:', error)
        alert('测试状态更新失败')
      }
    },

    // 新增：测试批量操作
    async testBatchOperation() {
      const orders = this.$refs.orderManagement.orders || []
      if (orders.length === 0) {
        alert('没有订单可以测试')
        return
      }

      try {
        // 选择前两个订单
        orders[0].selected = true
        orders[1].selected = true

        // 更新选择计数
        this.$refs.orderManagement.updateSelection()

        // 测试批量操作
        await this.$refs.orderManagement.batchUpdateStatus('1')
        alert('批量操作测试完成')
        this.updateTestResults()
      } catch (error) {
        console.error('测试批量操作失败:', error)
        alert('测试批量操作失败')
      }
    },

    // 新增：快速测试方法
    async quickTest() {
      try {
        console.log('=== 快速测试开始 ===')

        // 直接调用API查看数据结构
        const { OrderAPI } = await import('@/api')
        const response = await OrderAPI.getAll()
        console.log('API原始响应:', response)

        if (response.data?.code === 200 && response.data.data) {
          const allOrders = response.data.data
          console.log('所有订单数量:', allOrders.length)

          // 查看前3个订单的详细结构
          allOrders.slice(0, 3).forEach((order, index) => {
            console.log(`订单${index + 1}:`, {
              orderId: order.orderId,
              userId: order.userId,
              status: order.status,
              orderNumber: order.orderNumber,
              orderShoeNum: order.orderShoeNum,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt
            })
          })

          // 查找用户ID为33的订单
          const userOrders = allOrders.filter(order => order.userId === 33)
          console.log('用户33的订单数量:', userOrders.length)

          if (userOrders.length > 0) {
            console.log('用户33的第一个订单:', userOrders[0])
          }
        }

        console.log('=== 快速测试结束 ===')
      } catch (error) {
        console.error('快速测试失败:', error)
      }
    },

    getStatusText(status) {
      const statusMap = {
        '0': '待支付',
        '1': '已支付',
        '2': '已发货',
        '3': '已完成',
        '4': '已取消',
        '5': '已退货',
        '6': '已取消',
        '10': '购物车',
        'unknown': '未知状态'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style scoped>
.test-order-management {
  padding: 2rem;
  background-color: #f5f6fa;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.test-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-section h3 {
  margin-top: 0;
  color: #34495e;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.input-group label {
  font-weight: 500;
  color: #2c3e50;
}

.input-group input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-info {
  background-color: #17a2b8;
  color: white;
}

.btn-info:hover {
  background-color: #138496;
}

.test-buttons {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-success {
  background-color: #27ae60;
  color: white;
}

.btn-success:hover {
  background-color: #229954;
}

.btn-warning {
  background-color: #f39c12;
  color: white;
}

.btn-warning:hover {
  background-color: #e67e22;
}

.order-management-wrapper {
  background: white;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-results {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-results h3 {
  margin-top: 0;
  color: #34495e;
}

.result-item {
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f3f4;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item strong {
  color: #2c3e50;
}

.result-item ul {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
}

.result-item li {
  margin-bottom: 0.25rem;
  color: #7f8c8d;
}

.debug-info {
  background-color: #ecf0f1;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.9em;
  color: #34495e;
  overflow-x: auto;
}
</style>
