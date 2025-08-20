<template>
  <div class="profile-overview">
    <!-- 顶部横幅已展示用户信息，这里移除重复的白色卡片以减少空白 -->

    <!-- 统计信息卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
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
        <div class="stat-content">
          <div class="stat-value">¥{{ formatMoney(stats.totalSpending) }}</div>
          <div class="stat-label">总消费</div>
        </div>
        <div class="stat-trend">
          <span class="trend-up">+{{ formatMoney(userStats.monthlySpent) }}</span>
          <span class="trend-text">本月消费</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-value">¥{{ formatMoney(stats.totalSavings) }}</div>
          <div class="stat-label">总节省</div>
        </div>
        <div class="stat-trend">
          <span class="trend-up">+{{ formatMoney(userStats.monthlySaved) }}</span>
          <span class="trend-text">本月节省</span>
        </div>
      </div>

      <div class="stat-card">
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



    <!-- 最近订单 -->
    <div class="recent-orders">
      <div class="section-header">
        <h3>最近订单</h3>
        <button @click="$router.push('/profile/orders')" class="btn btn-outline">
          查看全部
        </button>
      </div>
      <div v-if="recentOrders.length === 0" class="empty-orders">
        <div class="empty-icon"></div>
        <p>暂无订单记录</p>
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
          <div class="benefit-content">
            <h4>生日特权</h4>
            <p>生日当月享受专属优惠</p>
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-content">
            <h4>免费配送</h4>
            <p>满99元享受免费配送</p>
          </div>
        </div>
        <div class="benefit-item">
          <div class="benefit-content">
            <h4>账户安全</h4>
            <p>加密存储，保障数据安全</p>
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
    formatMoney(value) {
      const n = Number(value || 0)
      if (!isFinite(n)) return '0.00'
      return n.toFixed(2)
    },
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
          
          // 通过订单明细与鞋子价格和积分计算每个订单的真实金额和积分
          const enrichedOrders = await Promise.all(
            userOrders.map(async (order) => {
              let computedAmount = 0
              let computedPoints = 0
              try {
                const osnRes = await OrderShoeNumAPI.getByOrderId(order.orderId)
                if (osnRes.data?.code === 200 && Array.isArray(osnRes.data.data)) {
                  const items = osnRes.data.data
                  const itemDetails = await Promise.all(items.map(async (it) => {
                    let price = 0
                    let points = 0
                    try {
                      const shoeRes = await ShoeAPI.getById(it.shoeId)
                      if (shoeRes.data?.code === 200 && shoeRes.data.data) {
                        const shoe = shoeRes.data.data
                        price = (shoe.discountPrice && shoe.discountPrice < shoe.price)
                          ? shoe.discountPrice
                          : (shoe.price || 0)
                        // 获取商品积分，如果没有积分字段，使用默认值
                        points = shoe.integral || shoe.points || 10 // 默认每个商品10积分
                      }
                    } catch (e) {
                      console.warn('获取鞋子信息失败:', e)
                    }
                    return {
                      price: price * (it.shoeNum || 1),
                      points: points * (it.shoeNum || 1)
                    }
                  }))
                  computedAmount = itemDetails.reduce((a, b) => a + b.price, 0)
                  computedPoints = itemDetails.reduce((a, b) => a + b.points, 0)
                }
              } catch (e) {
                console.warn('获取订单明细失败:', e)
              }
              return { ...order, computedAmount, computedPoints }
            })
          )

          // 过滤掉购物车状态的订单，只计算真实订单
          const validOrders = enrichedOrders.filter(order => String(order.status) !== '10')
          
          // 计算统计数据（排除购物车）
          this.stats.totalOrders = validOrders.length
          this.stats.totalSpending = validOrders.reduce(
            (sum, o) => sum + (o.computedAmount || o.totalAmount || o.amount || 0),
            0
          )
          this.stats.totalSavings = Math.round(this.stats.totalSpending * 0.1)

          // 月度统计（排除购物车）
          const now = new Date()
          const currentMonth = now.getMonth()
          const currentYear = now.getFullYear()
          const monthlyOrders = validOrders.filter(order => {
            const orderDate = new Date(order.createdAt || order.date)
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
          })
          this.userStats.monthlyOrders = monthlyOrders.length
          this.userStats.monthlySpent = monthlyOrders.reduce(
            (sum, o) => sum + (o.computedAmount || o.totalAmount || o.amount || 0),
            0
          )
          this.userStats.monthlySaved = Math.round(this.userStats.monthlySpent * 0.1)
          // 积分增长计算：基于本月订单中商品的实际积分
          this.userStats.pointsEarned = monthlyOrders.reduce(
            (sum, o) => sum + (o.computedPoints || 0),
            0
          )

          // 最近订单（最多3条）
          this.recentOrders = enrichedOrders
            .filter(order => String(order.status) !== '10') // 过滤掉购物车状态的订单
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
  gap: 1rem;
}

/* 统计信息网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 去掉图标占位，文本左对齐 */
.stat-card .stat-icon { display: none; }
.stat-content { flex: 1; }

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111111;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666666;
  font-weight: 500;
}

.stat-trend { text-align: right; }

.trend-up {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #111111;
  margin-bottom: 0.25rem;
}

.trend-text {
  font-size: 0.8rem;
  color: #666666;
}



/* 最近订单 */
.recent-orders { background: #fff; border: 1px solid #e6e6e6; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e6e6e6; }
.section-header h3 { font-size: 1.2rem; font-weight: 700; color: #111; margin: 0; }
.btn {
  border: 2px solid #111111;
  background: transparent;
  color: #111111;
  border-radius: 8px;
  padding: 0.5rem 1rem;
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

.btn-outline {
  border: 2px solid #111111;
  background: transparent;
  color: #111111;
}

.empty-orders { text-align: center; padding: 2rem; color: #666; }
.empty-icon { display: none; }

.empty-orders h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111111;
  margin: 0 0 0.5rem 0;
}

.empty-orders p {
  font-size: 0.9rem;
  color: #666666;
  margin: 0;
}

/* 订单列表 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  background: #f8f9fa;
  transition: all 0.2s ease;
}

.order-item:hover {
  background: #fff;
  border-color: #111111;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-info {
  flex: 1;
}

.order-number {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111111;
  margin-bottom: 0.25rem;
}

.order-date {
  font-size: 0.8rem;
  color: #666666;
  margin-bottom: 0.25rem;
}

.order-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  background: #f8f9fa;
  color: #111111;
  border: 1px solid #e6e6e6;
}

.order-amount {
  font-size: 1rem;
  font-weight: 700;
  color: #111111;
}

/* 会员权益 */
.membership-benefits { background: #fff; border: 1px solid #e6e6e6; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
.benefit-item { display: flex; align-items: center; gap: 12px; padding: 16px; border-radius: 8px; background: #f8f9fa; }
.benefit-icon { display: none; }
.benefit-content h4 { margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #111; }
.benefit-content p { margin: 0; color: #666; font-size: 12px; }

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  
  .stat-card {
    padding: 1rem;
  }
  
  .recent-orders {
    padding: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .order-amount {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .stat-trend {
    text-align: center;
  }
}
</style>
