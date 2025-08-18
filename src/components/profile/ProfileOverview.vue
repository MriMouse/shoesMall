<template>
  <div class="profile-overview">
    <!-- 顶部横幅已展示用户信息，这里移除重复的白色卡片以减少空白 -->

    <!-- 统计信息卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon points">
          <span>🎯</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.points }}</div>
          <div class="stat-label">我的积分</div>
        </div>
        <div class="stat-trend">
          <span class="trend-up">+{{ userStats.pointsEarned }}</span>
          <span class="trend-text">本月获得</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon spending">
          <span>💰</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">¥{{ stats.totalSpending }}</div>
          <div class="stat-label">总消费</div>
        </div>
        <div class="stat-trend">
          <span class="trend-up">+{{ userStats.monthlySpent }}</span>
          <span class="trend-text">本月消费</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon savings">
          <span>💎</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">¥{{ stats.totalSavings }}</div>
          <div class="stat-label">总节省</div>
        </div>
        <div class="stat-trend">
          <span class="trend-up">+{{ userStats.monthlySaved }}</span>
          <span class="trend-text">本月节省</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orders">
          <span>📦</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalOrders }}</div>
          <div class="stat-label">订单总数</div>
        </div>
        <div class="stat-trend">
          <span class="trend-up">+{{ userStats.monthlyOrders }}</span>
          <span class="trend-text">本月订单</span>
        </div>
      </div>
    </div>

    <!-- 快捷功能卡片 -->
    <div class="quick-actions">
      <h3>快捷功能</h3>
      <div class="actions-grid">
        <div class="action-item" @click="$emit('navigate', 'orders')">
          <div class="action-icon">📋</div>
          <div class="action-text">我的订单</div>
        </div>
        <div class="action-item" @click="$emit('navigate', 'address')">
          <div class="action-icon">📍</div>
          <div class="action-text">收货地址</div>
        </div>
        <div class="action-item" @click="$emit('navigate', 'coupons')">
          <div class="action-icon">🎫</div>
          <div class="action-text">优惠券</div>
        </div>
        <div class="action-item" @click="$emit('navigate', 'points')">
          <div class="action-icon">🎯</div>
          <div class="action-text">积分商城</div>
        </div>
        <div class="action-item" @click="$emit('navigate', 'customer-service')">
          <div class="action-icon">💬</div>
          <div class="action-text">客服中心</div>
        </div>
      </div>
    </div>

    <!-- 最近订单 -->
    <div class="recent-orders">
      <div class="section-header">
        <h3>最近订单</h3>
        <button @click="$emit('navigate', 'orders')" class="btn btn-outline">
          查看全部
        </button>
      </div>
      <div v-if="recentOrders.length === 0" class="empty-orders">
        <div class="empty-icon">📦</div>
        <p>暂无订单记录</p>
        <router-link to="/products" class="btn btn-primary">去购物</router-link>
      </div>
      <div v-else class="orders-list">
        <div v-for="order in recentOrders.slice(0, 3)" :key="order.id" class="order-item">
          <div class="order-info">
            <div class="order-number">{{ order.id }}</div>
            <div class="order-status">
              <span class="status-badge" :class="getStatusClass(order.status)">
                {{ getOrderStatus(order.status) }}
              </span>
            </div>
          </div>
          <div class="order-details">
            <div class="order-amount">¥{{ order.amount }}</div>
            <div class="order-date">{{ formatDate(order.date) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 会员权益 -->
    <div class="membership-benefits">
      <h3>会员权益</h3>
      <div class="benefits-grid">
        <div class="benefit-item">
          <div class="benefit-icon">🎁</div>
          <div class="benefit-content">
            <h4>生日特权</h4>
            <p>生日当月享受专属优惠</p>
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">🚚</div>
          <div class="benefit-content">
            <h4>免费配送</h4>
            <p>满99元享受免费配送</p>
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">🔄</div>
          <div class="benefit-content">
            <h4>7天退换</h4>
            <p>7天内无理由退换货</p>
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-icon">🎯</div>
          <div class="benefit-content">
            <h4>积分奖励</h4>
            <p>购物即可获得积分奖励</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { OrderAPI, UserAPI, ShoeAPI, OrderShoeNumAPI } from '@/api'
import userManager from '@/utils/userManager'

export default {
  name: 'ProfileOverview',
  data() {
    return {
      userInfo: {
        username: '',
        email: '',
        gender: '',
        integral: 0,
        registrationDate: '',
        avatarPath: ''
      },
      stats: {
        points: 0,
        totalSpending: 0,
        totalSavings: 0,
        totalOrders: 0
      },
      userStats: {
        pointsEarned: 0,
        monthlySpent: 0,
        monthlySaved: 0,
        monthlyOrders: 0
      },
      recentOrders: [],
      loading: false
    }
  },
  mounted() {
    this.loadUserInfo()
    this.loadRecentOrders()
  },
  methods: {
    async loadUserInfo() {
      try {
        const username = userManager.getCurrentUsername()
        console.log('当前用户名:', username)
        
        if (!username) {
          console.warn('未找到用户名，使用本地存储数据')
          this.loadFallbackUserInfo()
          return
        }
        
        // 使用现有的API获取用户信息：先获取用户ID，然后从所有用户中筛选
        try {
          console.log('开始获取用户信息...')
          
          // 先获取用户ID
          const userIdResponse = await UserAPI.getUserIdByUsername(username)
          console.log('用户ID响应:', userIdResponse)
          
          if (userIdResponse.data?.code === 200 && userIdResponse.data.data) {
            const userId = userIdResponse.data.data
            console.log('获取到用户ID:', userId)
            
            // 获取所有用户信息
            const allUsersResponse = await UserAPI.getAllUsers()
            console.log('所有用户响应:', allUsersResponse)
            
            if (allUsersResponse.data?.code === 200 && allUsersResponse.data.data) {
              // 根据用户ID筛选出当前用户信息
              const user = allUsersResponse.data.data.find(u => u.id === userId)
              console.log('找到的用户信息:', user)
              
              if (user) {
                this.userInfo = {
                  username: user.username || username,
                  email: user.email || '未设置',
                  gender: user.gender || '未设置',
                  integral: user.integral || 0,
                  registrationDate: user.registrationDate || new Date().toISOString(),
                  avatarPath: user.avatarPath || ''
                }
                
                // 更新统计数据
                this.stats.points = user.integral || 0
                
                console.log('用户信息加载成功:', this.userInfo)
              } else {
                console.warn('未找到匹配的用户信息，使用本地存储')
                this.loadFallbackUserInfo()
              }
            } else {
              console.warn('获取所有用户失败:', allUsersResponse.data?.msg)
              this.loadFallbackUserInfo()
            }
          } else {
            console.warn('获取用户ID失败:', userIdResponse.data?.msg)
            this.loadFallbackUserInfo()
          }
        } catch (apiError) {
          console.warn('API获取用户信息失败，使用本地存储:', apiError)
          this.loadFallbackUserInfo()
        }
        
        // 获取用户头像路径
        try {
          const avatarResponse = await UserAPI.getAvatarPath(username)
          if (avatarResponse.data?.code === 200 && avatarResponse.data.data) {
            this.userInfo.avatarPath = avatarResponse.data.data
            console.log('头像路径加载成功:', this.userInfo.avatarPath)
          }
        } catch (avatarError) {
          console.warn('获取头像路径失败:', avatarError)
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
        this.loadFallbackUserInfo()
      }
    },
    
    loadFallbackUserInfo() {
      console.log('使用本地存储的用户信息')
      const currentUser = userManager.getCurrentUser()
      const currentUsername = userManager.getCurrentUsername()
      console.log('本地存储的用户信息:', currentUser, '用户名:', currentUsername)
      
      if (currentUser || currentUsername) {
        // 如果currentUser是字符串，转换为对象
        if (typeof currentUser === 'string') {
          this.userInfo = {
            username: currentUser,
            email: '未设置',
            gender: '未设置',
            integral: 0,
            registrationDate: new Date().toISOString(),
            avatarPath: ''
          }
        } else if (currentUser && typeof currentUser === 'object') {
          this.userInfo = {
            username: currentUser.username || currentUsername || '用户',
            email: currentUser.email || '未设置',
            gender: currentUser.gender || '未设置',
            integral: currentUser.integral || 0,
            registrationDate: currentUser.registerTime || currentUser.registrationDate || new Date().toISOString(),
            avatarPath: currentUser.avatarPath || ''
          }
        } else {
          // 使用当前用户名
          this.userInfo = {
            username: currentUsername || '用户',
            email: '未设置',
            gender: '未设置',
            integral: 0,
            registrationDate: new Date().toISOString(),
            avatarPath: ''
          }
        }
        
        // 更新统计数据
        this.stats.points = this.userInfo.integral || 0
        
        console.log('本地用户信息加载成功:', this.userInfo)
      } else {
        // 如果本地存储也没有数据，设置默认值
        this.userInfo = {
          username: '用户',
          email: '未设置',
          gender: '未设置',
          integral: 0,
          registrationDate: new Date().toISOString(),
          avatarPath: ''
        }
        console.log('使用默认用户信息:', this.userInfo)
      }
    },

    async loadRecentOrders() {
      try {
        this.loading = true
        const userId = await userManager.getUserId()
        if (!userId) {
          console.warn('无法获取用户ID')
          return
        }
        
        const response = await OrderAPI.getAll()
        if (response.data?.code === 200 && response.data.data) {
          // 过滤当前用户的订单
          const userOrders = response.data.data.filter(order => order.userId === userId)
          console.log('用户订单数据:', userOrders)
          
          // 通过订单明细与鞋子价格计算每个订单的真实金额
          const enrichedOrders = await Promise.all(
            userOrders.map(async (order) => {
              let computedAmount = 0
              try {
                const osnRes = await OrderShoeNumAPI.getByOrderId(order.orderId)
                if (osnRes.data?.code === 200 && Array.isArray(osnRes.data.data)) {
                  const items = osnRes.data.data
                  const itemTotals = await Promise.all(items.map(async (it) => {
                    let price = 0
                    try {
                      const shoeRes = await ShoeAPI.getById(it.shoeId)
                      if (shoeRes.data?.code === 200 && shoeRes.data.data) {
                        const shoe = shoeRes.data.data
                        price = (shoe.discountPrice && shoe.discountPrice < shoe.price)
                          ? shoe.discountPrice
                          : (shoe.price || 0)
                      }
                    } catch (e) {
                      console.warn('获取鞋子信息失败:', e)
                    }
                    return price * (it.shoeNum || 1)
                  }))
                  computedAmount = itemTotals.reduce((a, b) => a + b, 0)
                }
              } catch (e) {
                console.warn('获取订单明细失败:', e)
              }
              return { ...order, computedAmount }
            })
          )

          // 计算统计数据
          this.stats.totalOrders = enrichedOrders.length
          this.stats.totalSpending = enrichedOrders.reduce(
            (sum, o) => sum + (o.computedAmount || o.totalAmount || o.amount || 0),
            0
          )
          this.stats.totalSavings = Math.round(this.stats.totalSpending * 0.1)

          // 月度统计
          const now = new Date()
          const currentMonth = now.getMonth()
          const currentYear = now.getFullYear()
          const monthlyOrders = enrichedOrders.filter(order => {
            const orderDate = new Date(order.createdAt || order.date)
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
          })
          this.userStats.monthlyOrders = monthlyOrders.length
          this.userStats.monthlySpent = monthlyOrders.reduce(
            (sum, o) => sum + (o.computedAmount || o.totalAmount || o.amount || 0),
            0
          )
          this.userStats.monthlySaved = Math.round(this.userStats.monthlySpent * 0.1)
          this.userStats.pointsEarned = Math.round(this.userStats.monthlySpent * 0.01)

          // 最近订单（最多3条）
          this.recentOrders = enrichedOrders
            .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
            .slice(0, 3)
            .map(order => ({
              id: order.orderNumber || `ORD${order.orderId}` || order.id,
              status: order.status,
              amount: Number((order.computedAmount || order.totalAmount || order.amount || 0).toFixed(2)),
              date: order.createdAt || order.date
            }))
        } else {
          console.warn('获取订单信息失败:', response.data?.msg)
          this.recentOrders = []
        }
      } catch (error) {
        console.error('加载最近订单失败:', error)
        this.recentOrders = []
      } finally {
        this.loading = false
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
        '10': '购物车',
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
    }
  }
}
</script>

<style scoped>
.profile-overview {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.user-level {
  margin: 0 0 4px 0;
  font-size: 14px;
  opacity: 0.9;
}

.user-join-date {
  margin: 0;
  font-size: 12px;
  opacity: 0.7;
}

.user-actions {
  margin-left: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.points {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
}

.stat-icon.spending {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-icon.savings {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.stat-icon.orders {
  background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

.stat-trend {
  text-align: right;
}

.trend-up {
  display: block;
  color: #27ae60;
  font-weight: 600;
  font-size: 16px;
}

.trend-text {
  display: block;
  color: #7f8c8d;
  font-size: 12px;
  margin-top: 2px;
}

.quick-actions {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.quick-actions h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-item:hover {
  background-color: #f8f9fa;
}

.action-icon {
  font-size: 32px;
}

.action-text {
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
}

.recent-orders {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.empty-orders {
  text-align: center;
  padding: 40px 0;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.order-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-number {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.order-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
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

.status-cart {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-refunding {
  background-color: #ff7675;
  color: #d63031;
}

.status-unknown {
  background-color: #f5f5f5;
  color: #757575;
}

.order-details {
  text-align: right;
}

.order-amount {
  font-weight: 600;
  color: #e74c3c;
  font-size: 16px;
}

.order-date {
  color: #7f8c8d;
  font-size: 12px;
  margin-top: 2px;
}

.membership-benefits {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.membership-benefits h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: background-color 0.3s;
}

.benefit-item:hover {
  background-color: #e9ecef;
}

.benefit-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 8px;
}

.benefit-content h4 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.benefit-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 12px;
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

.btn-primary:hover {
  background-color: #2980b9;
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

@media (max-width: 768px) {
  .profile-overview {
    gap: 16px;
  }
  
  .user-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .user-actions {
    margin-left: 0;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .order-details {
    text-align: left;
  }
}
</style>
