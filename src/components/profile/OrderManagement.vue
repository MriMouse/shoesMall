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
          <option value="10">购物车</option>
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

    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <p>{{ statusFilter ? '没有符合条件的订单' : '暂无订单记录' }}</p>
      <router-link to="/products" class="btn btn-primary">去购物</router-link>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in filteredOrders" :key="order.orderId" class="order-item">
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
            <button @click="viewOrderDetail(order)" class="btn btn-outline">
              查看详情
            </button>
            
            <!-- 根据订单状态显示不同的操作按钮 -->
            <div v-if="order.status === '0'" class="action-buttons">
              <button @click="payOrder(order)" class="btn btn-primary">
                立即支付
              </button>
              <button @click="cancelOrder(order)" class="btn btn-secondary">
                取消订单
              </button>
            </div>
            
            <div v-if="order.status === '1'" class="action-buttons">
              <button @click="requestRefund(order)" class="btn btn-warning">
                申请退款
              </button>
            </div>
            
            <div v-if="order.status === '2'" class="action-buttons">
              <button @click="confirmReceived(order)" class="btn btn-primary">
                确认收货
              </button>
              <button @click="requestRefund(order)" class="btn btn-warning">
                申请退款
              </button>
            </div>
            
            <div v-if="order.status === '3'" class="action-buttons">
              <button @click="requestRefund(order)" class="btn btn-warning">
                申请退款
              </button>
              <button @click="buyAgain(order)" class="btn btn-outline">
                再次购买
              </button>
            </div>
            
            <div v-if="order.status === '5'" class="action-buttons">
              <button @click="viewReturnStatus(order)" class="btn btn-outline">
                查看退货状态
              </button>
            </div>
            
            <div v-if="order.status === '6'" class="action-buttons">
              <button @click="buyAgain(order)" class="btn btn-outline">
                再次购买
              </button>
            </div>
            
            <!-- 退款中状态 -->
            <div v-if="['11', '12', '13'].includes(order.status)" class="action-buttons">
              <button @click="viewRefundStatus(order)" class="btn btn-outline">
                查看退款状态
              </button>
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

        <!-- 商品列表 -->
        <div v-if="order.products && order.products.length > 0" class="order-products">
          <div v-for="product in order.products" :key="product.id" class="product-item">
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
              <h5>{{ product.name || '' }}</h5>
              <p>尺码：{{ product.size || '' }}</p>
              <p>颜色：{{ product.color || '' }}</p>
              <p>数量：{{ product.quantity || '' }}</p>
              <p class="price">¥{{ product.price || 0 }}</p>
            </div>
          </div>
        </div>
        
        <!-- 如果没有商品信息，显示默认信息 -->
        <div v-else class="order-products">
          <div class="product-item">
            <div class="product-image">
              <div class="no-image">📦</div>
            </div>
            <div class="product-info">
              <h4>商品信息</h4>
              <p class="product-specs">商品信息加载中...</p>
              <p class="product-price">¥{{ (order.amount || 0).toFixed(2) }}</p>
            </div>
          </div>
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
      selectedCount: 0 // 新增：选中的订单数量
    }
  },
  computed: {
    // 新增：判断是否全选
    isAllSelected() {
      return this.filteredOrders.length > 0 && this.filteredOrders.every(order => order.selected)
    }
  },
  mounted() {
    this.loadOrders()
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
      if (confirm(`确定要申请退款吗？订单状态将从"${this.getOrderStatus(order.status)}"变为"${this.getOrderStatus(String(Number(order.status) + 10))}"`)) {
        this.submitRefundRequest(order)
      }
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
          alert(`退款申请已提交，订单状态已更新为"${this.getOrderStatus(newStatus)}"`)
        } else {
          alert('提交退款申请失败，请重试')
        }
      } catch (error) {
        console.error('提交退款申请失败:', error)
        alert('提交退款申请失败，请重试')
      }
    },
    
    // 新增：查看退款状态
    viewRefundStatus(order) {
      const originalStatus = String(Number(order.status) - 10)
      const originalStatusText = this.getOrderStatus(originalStatus)
      alert(`退款状态：订单从"${originalStatusText}"申请退款，正在处理中，预计3-5个工作日完成`)
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
      this.selectedCount = this.filteredOrders.filter(order => order.selected).length
    },

    // 新增：切换全选/取消全选
    toggleSelectAll() {
      this.filteredOrders.forEach(order => {
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
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e1e8ed;
}

.order-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
  color: #7f8c8d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.3s;
  display: flex; /* Added for flexbox */
  align-items: center; /* Added for flexbox */
}

.order-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f3f4;
  flex-grow: 1; /* Allow header to grow and take available space */
}

.order-number .label {
  color: #7f8c8d;
  font-size: 14px;
}

.order-number .value {
  color: #2c3e50;
  font-weight: 600;
  font-size: 16px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-paid {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-shipped {
  background-color: #d4edda;
  color: #155724;
}

.status-completed {
  background-color: #c3e6cb;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.status-returning {
  background-color: #ffeaa7;
  color: #d63031;
}

.status-returned {
  background-color: #fab1a0;
  color: #e17055;
}

.status-refunding {
  background-color: #ff7675;
  color: #d63031;
}

.order-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.order-info {
  flex: 1;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
}

.info-row .label {
  color: #7f8c8d;
  width: 80px;
  flex-shrink: 0;
}

.info-row .value {
  color: #2c3e50;
}

.info-row .amount {
  font-weight: 600;
  color: #e74c3c;
}

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.order-products {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f3f4;
}

.product-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
}

.product-item:last-child {
  border-bottom: none;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.product-image img.no-image {
  display: none;
}

.product-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #2c3e50;
}

.product-specs {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #7f8c8d;
}

.product-price {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #e74c3c;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
}

.detail-row {
  display: flex;
  margin-bottom: 8px;
}

.detail-row .label {
  color: #7f8c8d;
  width: 100px;
  flex-shrink: 0;
}

.detail-row .value {
  color: #2c3e50;
}

.product-detail {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f8f9fa;
}

.product-detail:last-child {
  border-bottom: none;
}

.product-detail .product-image {
  width: 80px;
  height: 80px;
}

.product-detail .product-info h5 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.product-detail .product-info p {
  margin: 0 0 4px 0;
  color: #7f8c8d;
  font-size: 14px;
}

.product-detail .product-info .price {
  color: #e74c3c;
  font-weight: 600;
  margin-top: 8px;
}

/* 批量操作样式 */
.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 20px;
  background-color: #f8f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #34495e;
  cursor: pointer;
}

.select-all input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #3498db;
}

.selected-count {
  font-size: 14px;
  color: #7f8c8d;
}

.batch-buttons {
  display: flex;
  gap: 10px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-primary.btn-sm {
  background-color: #3498db;
  color: white;
}

.btn-primary.btn-sm:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-primary.btn-sm:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary.btn-sm {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary.btn-sm:hover {
  background-color: #7f8c8d;
}

.btn-outline.btn-sm {
  background-color: transparent;
  color: #3498db;
  border: 2px solid #3498db;
}

.btn-outline.btn-sm:hover {
  background-color: #3498db;
  color: white;
}

.btn-warning.btn-sm {
  background-color: #f39c12;
  color: white;
}

.btn-warning.btn-sm:hover {
  background-color: #e67e22;
}

.btn-success.btn-sm {
  background-color: #27ae60;
  color: white;
}

.btn-success.btn-sm:hover {
  background-color: #229954;
}

/* 退货表单样式 */
.return-form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #34495e;
}

.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-textarea {
  height: 100px;
  resize: vertical;
}

.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-primary:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn-outline {
  background-color: transparent;
  color: #3498db;
  border: 2px solid #3498db;
}

.btn-outline:hover {
  background-color: #3498db;
  color: white;
}

.btn-warning {
  background-color: #f39c12;
  color: white;
}

.btn-warning:hover {
  background-color: #e67e22;
}

/* 订单选择框样式 */
.order-select {
  margin-right: 15px;
  flex-shrink: 0;
}

.order-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #3498db;
  cursor: pointer;
}

.order-checkbox:hover {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* 商品图片样式 */
.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  color: #6c757d;
  font-size: 24px;
  border-radius: 6px;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.product-image img.no-image {
  display: none;
}

/* 状态标签样式优化 */
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-cart {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-unknown {
  background-color: #f5f5f5;
  color: #757575;
}

/* 订单信息行样式优化 */
.info-row {
  display: flex;
  margin-bottom: 8px;
  align-items: center;
}

.info-row .label {
  color: #7f8c8d;
  width: 80px;
  flex-shrink: 0;
  font-size: 13px;
}

.info-row .value {
  color: #2c3e50;
  font-size: 13px;
}

.info-row .amount {
  font-weight: 600;
  color: #e74c3c;
  font-size: 14px;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .order-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .order-select {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .order-header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .order-details {
    flex-direction: column;
    gap: 16px;
  }
  
  .order-actions {
    min-width: auto;
    width: 100%;
  }
  
  .action-buttons {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .batch-actions {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .batch-buttons {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
