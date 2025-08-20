<template>
  <div class="order-management">
    <div class="order-header">
      <h3>我的订单</h3>
      <div class="order-filters">
        <select v-model="statusFilter" @change="filterOrders" class="filter-select">
          <option value="">全部订单</option>
          <option value="0">待支付</option>
          <option value="1">已支付</option>
          <option value="2">已发货</option>
          <option value="3">已完成</option>
          <option value="4">已取消</option>
          <option value="5">退货中</option>
          <option value="6">已退货</option>
          <option value="11">已支付-退款中</option>
          <option value="12">已发货-退款中</option>
          <option value="13">已完成-退款中</option>
        </select>
      </div>
    </div>

    <!-- 批量操作工具栏 -->
    <div v-if="filteredOrders.length > 0" class="batch-actions">
      <div class="batch-info">
        <label class="select-all">
          <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected">
          全选
        </label>
        <span class="selected-count" v-if="selectedCount > 0">
          已选择 {{ selectedCount }} 个订单
        </span>
      </div>
      <div class="batch-buttons" v-if="selectedCount > 0">
        <button @click="batchUpdateStatus('1')" class="btn btn-primary btn-sm">批量支付</button>
        <button @click="batchUpdateStatus('4')" class="btn btn-secondary btn-sm">批量取消</button>
        <button @click="batchUpdateStatus('3')" class="btn btn-success btn-sm">批量完成</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载订单...</p>
    </div>

    <div v-else-if="visibleOrders.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <p>{{ statusFilter ? '没有符合条件的订单' : '暂无订单记录' }}</p>
      <router-link to="/products" class="btn btn-primary">去购物</router-link>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in visibleOrders" :key="order.orderId" class="order-item">
        <!-- 订单选择框 -->
        <div class="order-select">
          <input 
            type="checkbox" 
            :value="order.orderId"
            v-model="order.selected"
            @change="updateSelection"
            class="order-checkbox"
          >
        </div>
        
        <div class="order-header-info">
          <div class="order-number">
            <span class="label">订单号：</span>
            <span class="value">{{ order.orderNumber }}</span>
          </div>
          <div class="order-status">
            <span class="status-badge" :class="getStatusClass(order.status)">
              {{ getOrderStatus(order.status) }}
            </span>
          </div>
        </div>

        <div class="order-info-box">
          <!-- 左侧：商品缩略列表 -->
          <div class="products-list summary">
            <div v-if="order.products && order.products.length > 0">
              <div v-for="product in order.products" :key="product.id" class="product-item compact">
                <div class="product-image small">
                  <img v-if="product.image" :src="product.image" :alt="product.name" @error="handleImageError" />
                  <div v-else class="no-image">📷</div>
                </div>
                <div class="product-info mini">
                  <div class="product-name one-line">{{ product.name || '' }}</div>
                  <div class="product-meta">尺码：{{ product.size || '' }} · 颜色：{{ product.color || '' }} · 数量：{{ product.quantity || '' }}</div>
                </div>
              </div>
            </div>
            <div v-else class="product-item compact">
              <div class="product-image small"><div class="no-image">📦</div></div>
              <div class="product-info mini">
                <div class="product-name one-line">商品信息加载中...</div>
                <div class="product-price">¥{{ (order.amount || 0).toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <!-- 右侧：订单信息与操作 -->
          <div class="order-right">
            <div class="order-details">
              <div class="order-info">
                <div class="info-row">
                  <span class="label">下单时间：</span>
                  <span class="value">{{ formatDate(order.createdAt) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">订单金额：</span>
                  <span class="value amount">¥{{ (order.amount || 0).toFixed(2) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">商品数量：</span>
                  <span class="value">{{ (order.products && order.products.length) || 0 }}件</span>
                </div>
                <div class="info-row">
                  <span class="label">收货人：</span>
                  <span class="value">{{ order.receiver || '' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">联系电话：</span>
                  <span class="value">{{ order.phone || '' }}</span>
                </div>
              </div>
 
              <div class="order-actions">
                <button @click="viewOrderDetail(order)" class="btn btn-outline btn-compact">
                  查看详情
                </button>
                
                <!-- 根据订单状态显示不同的操作按钮 -->
                <div v-if="['0','1','2'].includes(order.status)" class="action-buttons">
                  <button @click="requestRefund(order)" class="btn btn-warning btn-compact">
                    申请退款
                  </button>
                </div>
                
                <div v-else-if="order.status === '3'" class="action-buttons">
                  <button @click="requestRefund(order)" class="btn btn-warning btn-compact">
                    申请退款
                  </button>
                  <button @click="buyAgain(order)" class="btn btn-outline btn-compact">
                    再次购买
                  </button>
                </div>
                
                <div v-else-if="['11','12','13'].includes(order.status)" class="action-buttons">
                  <div class="refund-status-display">
                    <span class="refund-status-text">{{ getRefundStatusText(order.status) }}</span>
                  </div>
                </div>
                
                <div v-if="order.status === '10'" class="action-buttons">
                  <button @click="payOrder(order)" class="btn btn-primary">
                    结算购物车
                  </button>
                  <button @click="cancelOrder(order)" class="btn btn-secondary">
                    清空购物车
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义退款确认浮层 -->
    <div v-if="showRefundConfirm" class="confirm-overlay" @click.self="cancelRefund">
      <div class="confirm-dialog">
        <div class="confirm-title">确认操作</div>
        <div class="confirm-message">
          确定要申请退款吗？订单状态将从“{{ getOrderStatus(refundTarget?.status) }}”变为“{{ getOrderStatus(String(Number(refundTarget?.status) + 10)) }}”。
        </div>
        <div class="confirm-actions">
          <button class="btn btn-secondary btn-compact" @click="cancelRefund">取消</button>
          <button class="btn btn-primary btn-compact" @click="confirmRefund">确定</button>
        </div>
      </div>
    </div>

    <!-- 订单详情模态框 -->
    <div v-if="showOrderDetailModal" class="modal-overlay" @click="closeOrderDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>订单详情</h3>
          <button @click="closeOrderDetailModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedOrder" class="order-detail-content">
            <div class="detail-section">
              <h4>订单信息</h4>
              <div class="detail-row">
                <span class="label">订单号：</span>
                <span class="value">{{ selectedOrder.orderNumber }}</span>
              </div>
              <div class="detail-row">
                <span class="label">下单时间：</span>
                <span class="value">{{ formatDate(selectedOrder.createdAt) }}</span>
              </div>
              <div class="detail-row">
                <span class="label">订单状态：</span>
                <span class="value">
                  <span class="status-badge" :class="getStatusClass(selectedOrder.status)">
                    {{ getOrderStatus(selectedOrder.status) }}
                  </span>
                </span>
              </div>
              <div class="detail-row">
                <span class="label">订单金额：</span>
                <span class="value amount">¥{{ selectedOrder.amount }}</span>
              </div>
            </div>

            <div v-if="selectedOrder.products" class="detail-section">
              <h4>商品信息</h4>
              <div v-for="product in selectedOrder.products" :key="product.id" class="product-detail">
                <div class="product-image">
                  <img 
                    v-if="product.image" 
                    :src="product.image" 
                    :alt="product.name" 
                    @error="handleImageError" 
                  />
                  <div v-else class="no-image">📷</div>
                </div>
                <div class="product-info">
                  <h5>{{ product.name }}</h5>
                  <p>尺码：{{ product.size }}</p>
                  <p>颜色：{{ product.color }}</p>
                  <p>数量：{{ product.quantity }}</p>
                  <p class="price">¥{{ product.price }}</p>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>收货信息</h4>
              <div class="detail-row">
                <span class="label">收货人：</span>
                <span class="value">{{ selectedOrder.receiver || '' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">联系电话：</span>
                <span class="value">{{ selectedOrder.phone || '' }}</span>
              </div>
              <div class="detail-row">
                <span class="label">收货地址：</span>
                <span class="value">{{ selectedOrder.address || '' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 退货申请模态框 -->
    <div v-if="showReturnModal" class="modal-overlay" @click="closeReturnModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>申请退货</h3>
          <button @click="closeReturnModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="return-form">
            <div class="form-group">
              <label>退货原因</label>
              <select v-model="returnReason" class="form-select">
                <option value="">请选择退货原因</option>
                <option value="size_wrong">尺码不合适</option>
                <option value="quality_issue">质量问题</option>
                <option value="not_as_described">商品与描述不符</option>
                <option value="damaged">商品损坏</option>
                <option value="other">其他原因</option>
              </select>
            </div>
            <div class="form-group">
              <label>详细说明</label>
              <textarea v-model="returnDescription" class="form-textarea" 
                        placeholder="请详细描述退货原因..."></textarea>
            </div>
            <div class="form-actions">
              <button @click="submitReturnRequest" class="btn btn-primary" :disabled="!returnReason || !returnDescription">
                {{ submittingReturn ? '提交中...' : '提交申请' }}
              </button>
              <button @click="closeReturnModal" class="btn btn-secondary">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { OrderAPI, ShoeAPI, OrderShoeNumAPI, AddressAPI, PointsAPI } from '@/api'
import userManager from '@/utils/userManager'
import { orderCache } from '@/utils/orderPreloader'

// 简易中文Toast
function showToast(message) {
  const el = document.createElement('div')
  el.className = 'simple-toast'
  el.textContent = message
  document.body.appendChild(el)
  setTimeout(() => {
    el.classList.add('show')
  }, 10)
  setTimeout(() => {
    el.classList.remove('show')
    setTimeout(() => document.body.removeChild(el), 300)
  }, 2000)
}

export default {
  name: 'OrderManagement',
  data() {
    return {
      orders: [],
      filteredOrders: [],
      statusFilter: '',
      loading: false,
      showOrderDetailModal: false,
      showReturnModal: false,
      selectedOrder: null,
      returnReason: '',
      returnDescription: '',
      submittingReturn: false,
      selectedCount: 0, // 新增：选中的订单数量
      showRefundConfirm: false,
      refundTarget: null
    }
  },
  computed: {
    // 新增：判断是否全选
    isAllSelected() {
      return this.visibleOrders.length > 0 && this.visibleOrders.every(order => order.selected)
    },
    // 仅展示非购物车状态的订单
    visibleOrders() {
      return this.filteredOrders.filter(o => String(o.status) !== '10')
    }
  },
  mounted() {
    // 尝试先用缓存秒开
    const cached = orderCache.get()
    if (cached && Array.isArray(cached.list) && cached.list.length) {
      this.orders = cached.list
      this.filteredOrders = [...this.orders]
      // 后台刷新最新数据（不阻塞首屏）
      this.$nextTick(() => this.loadOrders())
    } else {
      this.loadOrders()
    }
  },
  methods: {
    async loadOrders() {
      try {
        this.loading = true
        const userId = await userManager.getUserId()
        console.log('当前用户ID:', userId)
        
        if (!userId) {
          console.error('用户ID为空，无法加载订单')
          this.orders = []
          this.filteredOrders = []
          return
        }
        
        // 尝试获取包含完整信息的订单数据
        console.log('正在获取订单数据...')
        let response;
        try {
          // 优先尝试获取完整信息的订单
          response = await OrderAPI.getAllWithFullDetails();
          console.log('完整信息订单API响应:', response);
        } catch (error) {
          console.log('完整信息订单API失败，回退到基础订单API:', error);
          // 如果失败，回退到基础API
          response = await OrderAPI.getAll();
          console.log('基础订单API响应:', response);
        }
        
        if (response.data?.code === 200 && response.data.data) {
          const allOrders = response.data.data
          console.log('所有订单:', allOrders)
          
          // 过滤当前用户的订单
          this.orders = await Promise.all(allOrders
            .filter(order => order.userId === userId)
            .map(async (order) => {
              console.log('处理订单:', order.orderId, '原始数据:', order)
              console.log('订单字段详情:', {
                addressId: order.addressId,
                address: order.address,
                receiverAddress: order.receiverAddress,
                receiver: order.receiver,
                receiverName: order.receiverName,
                phone: order.phone,
                receiverPhone: order.receiverPhone
              })
              
              // 获取订单的商品信息
              const products = await this.getOrderProducts(order.orderId)
              console.log('订单商品信息:', order.orderId, products)
              
              // 获取订单的地址信息
              const addressInfo = await this.getOrderAddress(order.addressId)
              console.log('订单地址信息:', order.orderId, addressInfo)
              
              // 计算订单总金额
              const totalAmount = products.reduce((sum, product) => {
                return sum + (product.price * product.quantity)
              }, 0)
              
              // 尝试从订单数据本身获取地址信息作为备选
              const fallbackAddressInfo = this.extractOrderInfo(order)
              console.log('订单备选地址信息:', order.orderId, fallbackAddressInfo)
              
              const processedOrder = {
                ...order, 
                selected: false,
                // 根据后端真实数据结构处理字段
                orderNumber: order.orderNumber || `ORD${order.orderId}`,
                // 使用计算出的真实金额
                amount: totalAmount,
                // 处理日期格式
                createdAt: order.createdAt ? this.formatBackendDate(order.createdAt) : new Date().toISOString(),
                updatedAt: order.updatedAt ? this.formatBackendDate(order.updatedAt) : new Date().toISOString(),
                // 使用获取的真实商品信息
                products: products,
                // 优先使用API获取的地址信息，如果没有则使用备选信息
                address: addressInfo.address || fallbackAddressInfo.address || '',
                receiver: addressInfo.receiver || fallbackAddressInfo.receiver || '',
                phone: addressInfo.phone || fallbackAddressInfo.phone || ''
              }
              
              console.log('处理后的订单:', processedOrder.orderId, '金额:', processedOrder.amount, '商品数量:', processedOrder.products.length)
              return processedOrder
            }))
          
          console.log('处理后的用户订单:', this.orders)
          
          if (this.orders.length === 0) {
            console.log('用户没有订单')
            this.filteredOrders = []
          } else {
            this.filteredOrders = [...this.orders]
            // 同步更新缓存（轻量字段）
            const light = this.orders.map(o => ({
              orderId: o.orderId,
              orderNumber: o.orderNumber,
              status: o.status,
              amount: o.amount,
              createdAt: o.createdAt,
              updatedAt: o.updatedAt,
              selected: false,
              products: null,
              address: o.address,
              receiver: o.receiver,
              phone: o.phone,
            }))
            orderCache.set(light)
          }
        } else {
          console.error('API调用失败:', response.data?.msg || '未知错误')
          this.orders = []
          this.filteredOrders = []
        }
      } catch (error) {
        console.error('加载订单失败:', error)
        this.orders = []
        this.filteredOrders = []
      } finally {
        this.loading = false
      }
    },
    
    filterOrders() {
      if (!this.statusFilter) {
        this.filteredOrders = [...this.orders]
      } else {
        this.filteredOrders = this.orders.filter(order => order.status === this.statusFilter)
      }
    },
    
    getOrderStatus(status) {
      const statusMap = {
        '0': '待支付',
        '1': '已支付',
        '2': '已发货',
        '3': '已完成',
        '4': '已取消',
        '5': '退货中',
        '6': '已退货',
        '10': '购物车', // 购物车状态
        '11': '已支付-退款中',
        '12': '已发货-退款中',
        '13': '已完成-退款中'
      }
      return statusMap[status] || '未知状态'
    },
    
    getStatusClass(status) {
      const classMap = {
        '0': 'status-pending',
        '1': 'status-paid',
        '2': 'status-shipped',
        '3': 'status-completed',
        '4': 'status-cancelled',
        '5': 'status-returning',
        '6': 'status-returned',
        '10': 'status-cart',
        '11': 'status-refunding',
        '12': 'status-refunding',
        '13': 'status-refunding'
      }
      return classMap[status] || 'status-unknown'
    },
    
    formatDate(dateString) {
      if (!dateString) return '未知'
      return new Date(dateString).toLocaleDateString('zh-CN')
    },
    
    viewOrderDetail(order) {
      this.selectedOrder = order
      this.showOrderDetailModal = true
    },
    
    closeOrderDetailModal() {
      this.showOrderDetailModal = false
      this.selectedOrder = null
    },

    closeReturnModal() {
      this.showReturnModal = false
      this.selectedOrder = null
      this.returnReason = ''
      this.returnDescription = ''
    },
    
    async payOrder(order) {
      try {
        // 跳转到订单确认页面进行支付
        this.$router.push({
          name: 'OrderConfirmation',
          query: {
            fromOrderConfirmation: 'true',
            orderId: order.orderId,
            orderNumber: order.orderNumber,
            fromPendingOrder: 'true'
          }
        })
      } catch (error) {
        console.error('跳转失败:', error)
        alert('跳转失败，请重试')
      }
    },
    
    async cancelOrder(order) {
      if (confirm('确定要取消这个订单吗？')) {
        try {
          // 根据当前状态决定取消后的状态
          let newStatus;
          if (order.status === '0') {
            // 待支付订单取消后变为已取消
            newStatus = '6';
          } else {
            // 其他状态取消后变为已取消
            newStatus = '4';
          }
          
          const updatedOrder = { ...order, status: newStatus }
          const response = await OrderAPI.updateOrder(updatedOrder)
          if (response.data?.code === 200) {
            order.status = newStatus
            order.updatedAt = new Date().toISOString()
            this.filterOrders()
            alert(`订单已${newStatus === '6' ? '取消' : '取消'}`)
          } else {
            alert('取消订单失败，请重试')
          }
        } catch (error) {
          console.error('取消订单失败:', error)
          alert('取消订单失败，请重试')
        }
      }
    },
    
    async confirmReceived(order) {
      if (confirm('确认已收到商品？')) {
        try {
          // 使用现有接口：更新订单状态为已完成
          const updatedOrder = { ...order, status: '3' }
          const response = await OrderAPI.updateOrder(updatedOrder)
          if (response.data?.code === 200) {
            order.status = '3'
            order.updatedAt = new Date().toISOString()
            this.filterOrders()
            alert('确认收货成功！订单已完成')
          } else {
            alert('确认收货失败，请重试')
          }
        } catch (error) {
          console.error('确认收货失败:', error)
          alert('确认收货失败，请重试')
        }
      }
    },
    
    requestReturn(order) {
      this.selectedOrder = order
      this.showReturnModal = true
    },
    
    // 新增：申请退款
    requestRefund(order) {
      this.refundTarget = order
      this.showRefundConfirm = true
    },
    cancelRefund() {
      this.showRefundConfirm = false
      this.refundTarget = null
    },
    async confirmRefund() {
      const target = this.refundTarget
      this.showRefundConfirm = false
      if (target) await this.submitRefundRequest(target)
      this.refundTarget = null
    },
    
    // 新增：提交退款申请
    async submitRefundRequest(order) {
      try {
        // 计算退款后的状态：原状态+10
        const newStatus = String(Number(order.status) + 10)
        const updatedOrder = { ...order, status: newStatus }
        const response = await OrderAPI.updateOrder(updatedOrder)
        
        if (response.data?.code === 200) {
          order.status = newStatus
          order.updatedAt = new Date().toISOString()
          this.filterOrders()
          showToast(`退款申请已提交，订单状态已更新为“${this.getOrderStatus(newStatus)}”`)
        } else {
          showToast('提交退款申请失败，请重试')
        }
      } catch (error) {
        console.error('提交退款申请失败:', error)
        showToast('提交退款申请失败，请重试')
      }
    },
    
    // 获取退款状态显示文本
    getRefundStatusText(status) {
      switch (status) {
        case '11':
          return '退款审核中'
        case '12':
          return '退款处理中'
        case '13':
          return '退款到账中'
        default:
          return '退款处理中'
      }
    },
    
    async submitReturnRequest() {
      if (!this.returnReason.trim()) {
        alert('请选择退货原因')
        return
      }
      
      try {
        // 使用现有接口：更新订单状态为退货中
        const updatedOrder = { ...this.selectedOrder, status: '5' }
        const response = await OrderAPI.updateOrder(updatedOrder)
        if (response.data?.code === 200) {
          this.selectedOrder.status = '5'
          this.selectedOrder.updatedAt = new Date().toISOString()
          this.filterOrders()
          this.showReturnModal = false
          this.returnReason = ''
          this.returnDescription = ''
          alert('退货申请已提交，请等待审核')

          // 退货进入处理后，直接扣减积分（与后端最终状态流转可再对齐）
          try {
            const userId = await userManager.getUserId()
            if (this.selectedOrder?.orderNumber) {
              await PointsAPI.deductByOrder({ userId, orderNumber: this.selectedOrder.orderNumber })
            } else {
              await PointsAPI.deductByOrder({ userId, orderId: this.selectedOrder.orderId })
            }
          } catch (e) {
            console.warn('退货申请后扣减积分失败:', e)
          }
        } else {
          alert('提交退货申请失败，请重试')
        }
      } catch (error) {
        console.error('提交退货申请失败:', error)
        alert('提交退货申请失败，请重试')
      }
    },
    
    viewReturnStatus() {
      alert('退货状态：正在处理中，预计3-5个工作日完成')
    },
    
    buyAgain() {
      // 跳转到商品页面
      this.$router.push('/home')
    },
    
    // 新增：批量操作订单状态
    async batchUpdateStatus(newStatus) {
      const selectedOrders = this.filteredOrders.filter(order => order.selected)
      if (selectedOrders.length === 0) {
        alert('请先选择要操作的订单')
        return
      }
      
      if (confirm(`确定要将选中的${selectedOrders.length}个订单状态更新为"${this.getOrderStatus(newStatus)}"吗？`)) {
        try {
          const orderIds = selectedOrders.map(order => order.orderId)
          // 使用现有接口：批量更新订单状态
          const response = await OrderAPI.batchUpdateOrderStatus(orderIds, newStatus)
          if (response.data?.code === 200) {
            // 更新本地订单状态
            selectedOrders.forEach(order => {
              order.status = newStatus
              order.updatedAt = new Date().toISOString()
            })
            this.filterOrders()
            alert('批量更新订单状态成功')

            // 如果批量支付成功，则为这些订单累计积分
            if (newStatus === '1') {
              try {
                const userId = await userManager.getUserId()
                // 批量支付时若订单号一致可合并一次；否则逐个订单ID调用
                const firstOrderNumber = selectedOrders[0]?.orderNumber
                const allSameNumber = firstOrderNumber && selectedOrders.every(o => o.orderNumber === firstOrderNumber)
                if (allSameNumber) {
                  await PointsAPI.accrueByOrder({ userId, orderNumber: firstOrderNumber })
                } else {
                  for (const order of selectedOrders) {
                    if (order && order.orderId) {
                      await PointsAPI.accrueByOrder({ userId, orderId: order.orderId })
                    }
                  }
                }
              } catch (e) {
                console.warn('批量支付后累计积分失败:', e)
              }
            }
          } else {
            alert('批量更新订单状态失败，请重试')
          }
        } catch (error) {
          console.error('批量更新订单状态失败:', error)
          alert('批量更新订单状态失败，请重试')
        }
      }
    },

    // 新增：更新选择框状态
    updateSelection() {
      this.selectedCount = this.visibleOrders.filter(order => order.selected).length
    },

    // 新增：切换全选/取消全选
    toggleSelectAll() {
      this.visibleOrders.forEach(order => {
        order.selected = !this.isAllSelected
      })
      this.updateSelection()
    },

    // 新增：处理图片加载失败
    handleImageError(event) {
      console.log('图片加载失败，隐藏图片元素');
      // 隐藏图片元素，不显示任何默认图片
      event.target.style.display = 'none';
      event.target.onerror = null; // 防止无限循环
    },

    // 新增：计算订单总金额
    async calculateOrderAmount(order) {
      console.log('计算订单金额:', order.orderId, 'orderShoeNum:', order.orderShoeNum)
      
      try {
        // 如果orderShoeNum是数组，计算总金额
        if (Array.isArray(order.orderShoeNum)) {
          const total = await Promise.all(order.orderShoeNum.map(async (item) => {
            const shoeId = item.shoeId || item.id;
            if (!shoeId) {
              console.warn('商品ID缺失:', item);
              return 0;
            }
            
            try {
              // 调用ShoeAPI获取真实商品价格
              const shoeResponse = await ShoeAPI.getById(shoeId);
              if (shoeResponse.data?.code === 200 && shoeResponse.data.data) {
                const shoe = shoeResponse.data.data;
                const price = shoe.price || 0;
                const quantity = item.shoeNum || 0;
                const itemTotal = price * quantity;
                console.log('商品项:', item, '真实价格:', price, '数量:', quantity, '小计:', itemTotal);
                return itemTotal;
              } else {
                console.warn('获取商品价格失败:', shoeResponse);
                return 0;
              }
            } catch (error) {
              console.error('获取商品价格异常:', error);
              return 0;
            }
          }));
          
          const totalAmount = total.reduce((sum, itemTotal) => sum + itemTotal, 0);
          console.log('数组计算总金额:', totalAmount);
          return totalAmount;
        }
        
        // 如果orderShoeNum是单个对象
        if (order.orderShoeNum && typeof order.orderShoeNum === 'object') {
          const item = order.orderShoeNum;
          const shoeId = item.shoeId || item.id;
          
          if (!shoeId) {
            console.warn('商品ID缺失:', item);
            return 0;
          }
          
          try {
            // 调用ShoeAPI获取真实商品价格
            const shoeResponse = await ShoeAPI.getById(shoeId);
            if (shoeResponse.data?.code === 200 && shoeResponse.data.data) {
              const shoe = shoeResponse.data.data;
              const price = shoe.price || 0;
              const quantity = item.shoeNum || 0;
              const total = price * quantity;
              console.log('对象计算总金额:', total, '真实价格:', price, '数量:', quantity);
              return total;
            } else {
              console.warn('获取商品价格失败:', shoeResponse);
              return 0;
            }
          } catch (error) {
            console.error('获取商品价格异常:', error);
            return 0;
          }
        }
        
        // 如果orderShoeNum为null，返回0
        if (order.orderShoeNum === null || order.orderShoeNum === undefined) {
          console.log('orderShoeNum为null，无法计算金额');
          return 0;
        }
        
        // 如果没有商品信息，返回0
        console.log('没有商品信息，返回0');
        return 0;
      } catch (error) {
        console.error('计算订单金额时发生异常:', error);
        return 0;
      }
    },

    // 新增：格式化后端日期
    formatBackendDate(dateString) {
      if (!dateString) return new Date().toISOString();
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return new Date().toISOString();
        }
        return date.toISOString();
      } catch (error) {
        console.warn('日期格式化失败:', dateString, error);
        return new Date().toISOString();
      }
    },

    // 新增：从订单中提取商品信息
    async extractProductsFromOrder(order) {
      console.log('提取商品信息:', order.orderId, 'orderShoeNum:', order.orderShoeNum)
      
      try {
        // 如果orderShoeNum是数组
        if (Array.isArray(order.orderShoeNum)) {
          const products = await Promise.all(order.orderShoeNum.map(async (item) => {
            const shoeId = item.shoeId || item.id;
            if (!shoeId) {
              console.warn('商品ID缺失:', item);
              return null;
            }
            
            try {
              // 调用ShoeAPI获取真实商品信息
              const shoeResponse = await ShoeAPI.getById(shoeId);
              if (shoeResponse.data?.code === 200 && shoeResponse.data.data) {
                const shoe = shoeResponse.data.data;
                return {
                  id: shoeId,
                  name: shoe.name || '',
                  size: '', // 不设置默认尺码，等待后续获取真实尺码信息
                  color: '', // 不设置默认颜色，等待后续获取真实颜色信息
                  quantity: item.shoeNum || '',
                  price: shoe.price || 0,
                  image: null // 不使用默认图片
                };
              } else {
                console.warn('获取商品信息失败:', shoeResponse);
                return null;
              }
            } catch (error) {
              console.error('获取商品信息异常:', error);
              return null;
            }
          }));
          
          // 过滤掉null值
          const validProducts = products.filter(p => p !== null);
          console.log('数组商品信息:', validProducts);
          return validProducts;
        }
        
        // 如果orderShoeNum是单个对象
        if (order.orderShoeNum && typeof order.orderShoeNum === 'object') {
          const item = order.orderShoeNum;
          const shoeId = item.shoeId || item.id;
          
          if (!shoeId) {
            console.warn('商品ID缺失:', item);
            return [];
          }
          
          try {
            // 调用ShoeAPI获取真实商品信息
            const shoeResponse = await ShoeAPI.getById(shoeId);
            if (shoeResponse.data?.code === 200 && shoeResponse.data.data) {
              const shoe = shoeResponse.data.data;
              const product = {
                id: shoeId,
                name: shoe.name || '',
                size: '', // 不设置默认尺码，等待后续获取真实尺码信息
                color: '', // 不设置默认颜色，等待后续获取真实颜色信息
                quantity: item.shoeNum || '',
                price: shoe.price || 0,
                image: null // 不使用默认图片
              };
              console.log('对象商品信息:', product);
              return [product];
            } else {
              console.warn('获取商品信息失败:', shoeResponse);
              return [];
            }
          } catch (error) {
            console.error('获取商品信息异常:', error);
            return [];
          }
        }
        
        // 如果orderShoeNum为null，返回空数组
        if (order.orderShoeNum === null || order.orderShoeNum === undefined) {
          console.log('orderShoeNum为null，无法获取商品信息');
          return [];
        }
        
        // 如果没有商品信息，返回空数组
        console.log('没有商品信息，返回空数组');
        return [];
      } catch (error) {
        console.error('提取商品信息时发生异常:', error);
        return [];
      }
    },

    // 新增：尝试从订单数据中提取更多信息
    extractOrderInfo(order) {
      let address = '';
      let receiver = '';
      let phone = '';

      // 尝试从订单本身获取地址信息
      if (order.address) {
        address = order.address;
        console.log('使用订单地址:', address)
      } else if (order.addressInfo) {
        address = order.addressInfo;
        console.log('使用订单地址信息:', address)
      } else if (order.addressId) {
        console.log('订单有地址ID:', order.addressId, '但地址信息未加载');
      }

      // 尝试从订单本身获取收货人信息
      if (order.receiver) {
        receiver = order.receiver;
        console.log('使用订单收货人:', receiver)
      } else if (order.receiverName) {
        receiver = order.receiverName;
        console.log('使用订单收货人姓名:', receiver)
      } else if (order.receiverId) {
        console.log('订单有收货人ID:', order.receiverId, '但收货人信息未加载');
      }

      // 尝试从订单本身获取联系电话
      if (order.phone) {
        phone = order.phone;
        console.log('使用订单联系电话:', phone)
      } else if (order.receiverPhone) {
        phone = order.receiverPhone;
        console.log('使用订单收货人电话:', phone)
      } else if (order.phoneId) {
        console.log('订单有电话ID:', order.phoneId, '但电话信息未加载');
      }

      // 如果所有字段都为空，返回默认值
      if (!address && !receiver && !phone) {
        console.log('订单中没有找到任何地址相关信息');
        return { 
          address: '地址信息待完善', 
          receiver: '收货人信息待完善', 
          phone: '联系电话待完善' 
        };
      }

      return { address, receiver, phone };
    },

    // 新增：获取订单的商品信息
    async getOrderProducts(orderId) {
      try {
        // 首先获取订单的商品数量信息
        const orderShoeNumResponse = await OrderShoeNumAPI.getByOrderId(orderId);
        console.log('订单商品数量响应:', orderId, orderShoeNumResponse);
        
        if (orderShoeNumResponse.data?.code === 200 && orderShoeNumResponse.data.data) {
          const orderShoeNums = Array.isArray(orderShoeNumResponse.data.data) 
            ? orderShoeNumResponse.data.data 
            : [orderShoeNumResponse.data.data];
          
          // 获取每个商品的详细信息
          const products = await Promise.all(orderShoeNums.map(async (item) => {
            try {
              const shoeId = item.shoeId;
              if (!shoeId) {
                console.warn('商品ID缺失:', item);
                return null;
              }
              
              // 获取商品详情
              const shoeResponse = await ShoeAPI.getById(shoeId);
              if (shoeResponse.data?.code === 200 && shoeResponse.data.data) {
                const shoe = shoeResponse.data.data;
                
                // 获取商品图片信息
                let imageUrl = null; // 不使用默认图片
                try {
                  // 调用ShoeAPI.getImages获取商品图片
                  const shoeImgResponse = await ShoeAPI.getImages(shoeId);
                  if (shoeImgResponse.data?.code === 200 && shoeImgResponse.data.data) {
                    const shoeImgs = Array.isArray(shoeImgResponse.data.data) 
                      ? shoeImgResponse.data.data 
                      : [shoeImgResponse.data.data];
                    
                    if (shoeImgs.length > 0) {
                      // 使用第一张图片
                      const firstImg = shoeImgs[0];
                      if (firstImg.imagePath) {
                        // 使用正确的API路径获取图片，参考其他组件的实现
                        imageUrl = `/api/shoeImg/getImage/${firstImg.imagePath}`;
                        console.log('获取到商品图片:', shoeId, firstImg.imagePath, imageUrl);
                      }
                    }
                  }
                } catch (imgError) {
                  console.warn('获取商品图片失败:', shoeId, imgError);
                  // 图片获取失败时不设置图片URL
                }
                
                // 统一价格规则：优先使用折扣价
                const unitPrice = (shoe.discountPrice && shoe.discountPrice < shoe.price)
                  ? shoe.discountPrice
                  : (shoe.price || 0)

                return {
                  id: shoeId,
                  name: shoe.name || '',
                  size: '', // 不设置默认尺码，等待后续获取真实尺码信息
                  color: '', // 不设置默认颜色，等待后续获取真实颜色信息
                  quantity: item.shoeNum || '',
                  price: unitPrice,
                  image: imageUrl
                };
              } else {
                console.warn('获取商品详情失败:', shoeResponse);
                return null;
              }
            } catch (error) {
              console.error('获取商品详情异常:', error);
              return null;
            }
          }));
          
          // 过滤掉null值
          const validProducts = products.filter(p => p !== null);
          console.log('订单商品信息:', orderId, validProducts);
          return validProducts;
        } else {
          console.warn('获取订单商品数量失败:', orderShoeNumResponse);
          return [];
        }
      } catch (error) {
        console.error('获取订单商品信息异常:', error);
        return [];
      }
    },

    // 新增：获取订单的地址信息
    async getOrderAddress(addressId) {
      try {
        // 如果没有地址ID，尝试从订单本身获取地址信息
        if (!addressId) {
          console.warn('地址ID为空，尝试从订单数据获取地址信息');
          return { address: '', receiver: '', phone: '' };
        }
        
        // 使用现有的地址API获取地址信息
        const userId = await userManager.getUserId();
        if (!userId) {
          console.warn('用户ID为空，无法获取地址信息');
          return { address: '', receiver: '', phone: '' };
        }
        
        const addressResponse = await AddressAPI.getList(userId);
        console.log('地址列表响应:', addressResponse);
        
        if (addressResponse.data?.code === 200 && addressResponse.data.data) {
          const addresses = addressResponse.data.data;
          console.log('用户地址列表:', addresses);
          
          // 查找匹配的地址
          const targetAddress = addresses.find(addr => addr.addressId === addressId);
          
          if (targetAddress) {
            console.log('找到匹配的地址:', targetAddress);
            return {
              address: targetAddress.addressInfo || '',
              receiver: targetAddress.receiverName || '',
              phone: targetAddress.phone || ''
            };
          } else {
            console.warn('未找到匹配的地址ID:', addressId, '可用地址:', addresses.map(a => a.addressId));
            // 如果没有找到匹配的地址，尝试使用默认地址或第一个地址
            if (addresses.length > 0) {
              const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
              console.log('使用默认/第一个地址:', defaultAddress);
              return {
                address: defaultAddress.addressInfo || '',
                receiver: defaultAddress.receiverName || '',
                phone: defaultAddress.phone || ''
              };
            }
            return { address: '', receiver: '', phone: '' };
          }
        } else {
          console.warn('获取地址列表失败:', addressResponse);
          return { address: '', receiver: '', phone: '' };
        }
      } catch (error) {
        console.error('获取订单地址信息异常:', error);
        return { address: '', receiver: '', phone: '' };
      }
    }
  }
}
</script>

<style scoped>
.order-management {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 1rem;
}

.order-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111111;
  margin: 0;
}

.order-filters {
  display: flex;
  gap: 0.75rem;
}

.filter-select {
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #111111;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #111111;
  box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.1);
}

/* 批量操作工具栏 */
.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111111;
  cursor: pointer;
}

.select-all input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #111111;
}

.selected-count {
  font-size: 0.9rem;
  color: #666666;
  font-weight: 500;
}

.batch-buttons {
  display: flex;
  gap: 0.5rem;
}

/* 按钮样式 */
.btn {
  border: 2px solid #111111;
  background: transparent;
  color: #111111;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn:hover {
  background: #111111;
  color: #fff;
  transform: translateY(-1px);
}

.btn-primary {
  background: #111111;
  color: #fff;
}

.btn-primary:hover {
  background: #000;
}

.btn-secondary {
  background: transparent;
  color: #111111;
}

.btn-success {
  background: #111111;
  color: #fff;
  border-color: #111111;
}

.btn-success:hover {
  background: #000;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #666666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e6e6e6;
  border-top: 3px solid #111111;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #666666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  color: #666666;
}

/* 订单列表 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.order-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

/* 订单选择 */
.order-select {
  margin-bottom: 1rem;
}

.order-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #111111;
}

/* 订单头部信息 */
.order-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}

.order-number {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.order-number .label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111111;
}

.order-number .value {
  font-size: 0.9rem;
  color: #666666;
  font-weight: 500;
}

/* 状态标签 */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #f8f9fa;
  color: #111111;
  border: 1px solid #e6e6e6;
}

/* 订单详情 */
.order-details {
  display: flex;
  gap: 2rem;
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-row .label {
  min-width: 80px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111111;
}

.info-row .value {
  font-size: 0.9rem;
  color: #666666;
  font-weight: 500;
}

.info-row .amount {
  font-weight: 700;
  color: #111111;
}

/* 商品列表 */
.products-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: none; /* 去掉商品外层细线 */
  border-radius: 8px;
  background: #f8f9fa;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #e6e6e6;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111111;
  margin-bottom: 0.25rem;
}

.product-meta {
  font-size: 0.8rem;
  color: #666666;
  margin-bottom: 0.25rem;
}

.product-price {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111111;
}

/* 订单操作 */
.order-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  align-items: center;
  flex-direction: row;      /* 强制横向 */
  flex-wrap: nowrap;        /* 不换行 */
}
.action-buttons { display: flex; flex-direction: row; gap: 12px; }

/* 响应式设计 */
@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .batch-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .batch-buttons {
    width: 100%;
    justify-content: flex-start;
  }
  
  .order-header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .order-details {
    flex-direction: column;
    gap: 1rem;
  }
  
  .order-item {
    padding: 1rem;
  }
  
  .product-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: center;
  }
  
  .order-actions {
    flex-wrap: wrap; /* 小屏才允许换行 */
  }
}

@media (max-width: 480px) {
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
  
  .product-image {
    width: 50px;
    height: 50px;
  }
}

/* 信息灰框：除订单编号外的内容 */
.order-info-box {
  background: transparent; /* 去掉灰色背景 */
  border: none;            /* 取消边框 */
  border-radius: 12px;
  padding: 12px;
  max-width: 980px;  /* 整体变窄 */
  margin: 8px auto 0 auto;
  display: grid;
  grid-template-columns: 320px 1fr;  /* 左图右信息 */
  gap: 16px;
}

/* 统一按钮尺寸（小号、等高等宽风格） */
.btn-compact {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px; /* 统一宽度，便于对齐 */
  height: 40px;     /* 统一高度 */
  padding: 0 !important;
  line-height: 40px;
  border-radius: 8px;
  font-size: 0.9rem;
}

/* 黑白风格的“警告”按钮，避免彩色 */
.btn-warning {
  background: transparent;
  color: #111111;
  border: 2px solid #111111;
}
.btn-warning:hover {
  background: #111111;
  color: #fff;
}

/* 左侧缩略商品列表（更紧凑） */
.products-list.summary { padding: 0; }
.product-item.compact { 
  display: flex; 
  gap: 10px; 
  padding: 8px 6px; 
  border: none; /* 去掉商品外层细线 */
  border-radius: 8px; 
  background: #fff; 
  margin-bottom: 8px; 
}
.product-image.small { width: 72px; height: 72px; border-radius: 8px; overflow: hidden; border: 1px solid #eee; }
.product-image.small img { width: 100%; height: 100%; object-fit: cover; }
.product-info.mini { display: flex; flex-direction: column; gap: 4px; }
.one-line { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.product-meta { font-size: 12px; color: #666; }

/* 右侧信息更紧凑 */
.order-right { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.order-info { gap: 4px; }
.info-row { margin-bottom: 6px; }

/* 自定义复选框（有边框黑白风格） */
.order-checkbox,
.select-all input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #111111;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  position: relative;
  outline: none;
}

.order-checkbox:checked,
.select-all input[type="checkbox"]:checked {
  background: #111111;
  border-color: #111111;
}

.order-checkbox:checked::after,
.select-all input[type="checkbox"]:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 5px;
  height: 10px;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(45deg);
}

/* 让复选框在高分屏上也清晰 */
.order-checkbox:focus-visible,
.select-all input[type="checkbox"]:focus-visible {
  box-shadow: 0 0 0 3px rgba(17,17,17,0.12);
}

.simple-toast { position: fixed; left: 50%; bottom: 80px; transform: translateX(-50%); background: rgba(33,33,33,.92); color: #fff; padding: 10px 14px; border-radius: 8px; font-size: 14px; opacity: 0; transition: opacity .3s ease, transform .3s ease; z-index: 9999; }
.simple-toast.show { opacity: 1; transform: translateX(-50%) translateY(-4px); }

/* 自定义确认浮层 */
.confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; z-index: 9998; }
.confirm-dialog { width: 420px; max-width: 90vw; background: #fff; border-radius: 12px; box-shadow: 0 12px 28px rgba(0,0,0,.18); padding: 18px 20px; }
.confirm-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; color: #111; }
.confirm-message { font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 14px; }
.confirm-actions { display: flex; justify-content: flex-end; gap: 10px; }

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

/* 订单详情样式 */
.order-detail-content {
  max-width: 600px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}

.detail-row .label {
  min-width: 80px;
  font-weight: 500;
  color: #666;
  margin-right: 12px;
}

.detail-row .value {
  color: #111;
  flex: 1;
}

.detail-row .amount {
  font-weight: 600;
  color: #e74c3c;
  font-size: 18px;
}

/* 商品详情样式 */
.product-detail {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 16px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #eee;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  font-size: 24px;
  color: #999;
}

.product-info {
  flex: 1;
}

.product-info h5 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111;
}

.product-info p {
  margin: 0 0 4px 0;
  color: #666;
  font-size: 14px;
}

.product-info .price {
  color: #e74c3c;
  font-weight: 600;
  font-size: 16px;
  margin-top: 8px;
}

/* 退款状态显示样式 */
.refund-status-display {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  min-width: 120px;
}

.refund-status-text {
  font-size: 14px;
  font-weight: 600;
  color: #856404;
  text-align: center;
}
</style>
