<template>
  <div class="view-comments-page">
    <!-- Toast 组件 -->
    <BasicToast ref="toast" :message="toastMessage" :type="toastType" />
    
    <!-- ConfirmDialog 组件 -->
    <confirmDialog 
      v-model:visible="showConfirmDialog" 
      :title="confirmDialog.title" 
      :message="confirmDialog.message"
      :type="confirmDialog.type" 
      @confirm="confirmDialog.onConfirm" 
      @cancel="confirmDialog.onCancel" 
    />

    <div class="page-header">
      <div class="breadcrumb">
        <router-link to="/home" class="breadcrumb-item">首页</router-link>
        <span class="breadcrumb-separator">/</span>
        <router-link to="/products" class="breadcrumb-item">产品列表</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ productName || '商品评论' }}</span>
      </div>
      
      <div class="page-title">
        <h1>商品评论</h1>
        <div class="product-info" v-if="productName">
          <span class="product-name">{{ productName }}</span>
          <span class="product-id">商品ID: {{ shoeId }}</span>
        </div>
      </div>
    </div>

    <!-- 评论统计 -->
    <div class="comments-summary">
      <div class="rating-overview">
        <div class="average-rating">
          <span class="rating-number">{{ averageRating.toFixed(1) }}</span>
          <div class="stars">
            <span 
              v-for="i in 5" 
              :key="i" 
              class="star"
              :class="{ 'filled': i <= Math.round(averageRating) }"
            >
              ★
            </span>
          </div>
        </div>
        <div class="rating-details">
          <div class="total-comments">{{ comments.length }} 条评价</div>
          <div class="rating-distribution" v-if="ratingDistribution.length > 0">
            <div v-for="dist in ratingDistribution" :key="dist.rating" class="rating-bar">
              <span class="rating-label">{{ dist.rating }}星</span>
              <div class="bar-container">
                <div class="bar-fill" :style="{ width: dist.percentage + '%' }"></div>
              </div>
              <span class="rating-count">{{ dist.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comments-container">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>正在加载评论...</p>
      </div>

      <div v-else-if="comments.length === 0" class="empty-state">
        <div class="empty-icon">💬</div>
        <h3>暂无评论</h3>
        <p>这款商品还没有用户评价</p>
      </div>

      <div v-else class="comments-list">
        <div v-for="comment in comments" :key="`${comment.userId}-${comment.shoeId}`" class="comment-item">
          <div class="comment-header">
            <div class="user-info">
              <div class="user-avatar">
                <img v-if="getUserAvatar(comment.userId)" 
                     :src="getUserAvatar(comment.userId)" 
                     :alt="getUserName(comment.userId)"
                     class="avatar-image">
                <span v-else>👤</span>
              </div>
              <div class="user-details">
                <div class="username">{{ getUserName(comment.userId) }}</div>
                <div class="comment-time">{{ formatCommentTime(comment.commentTime) }}</div>
              </div>
            </div>
            <div class="comment-rating">
              <div class="stars">
                <span 
                  v-for="i in 5" 
                  :key="i" 
                  class="star"
                  :class="{ 'filled': i <= comment.rating }"
                >
                  ★
                </span>
              </div>
              <span class="rating-text">{{ getRatingText(comment.rating) }}</span>
            </div>
          </div>
          
          <div class="comment-content">
            {{ comment.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="bottom-actions">
      <button @click="goBack" class="btn btn-secondary">返回</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import BasicToast from '@/views/BasicToast.vue'
import confirmDialog from '@/views/confirmDialog.vue'

export default {
  name: 'ViewComments',
  components: {
    BasicToast,
    confirmDialog
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    // 响应式数据
    const comments = ref([])
    const loading = ref(true)
    const userInfoMap = ref({})
    const productName = ref('')
    
    // Toast 和 ConfirmDialog 相关
    const toast = ref(null)
    const toastMessage = ref('')
    const toastType = ref('info')
    const showConfirmDialog = ref(false)
    const confirmDialog = ref({
      title: '',
      message: '',
      type: 'info',
      onConfirm: () => {},
      onCancel: () => {}
    })

    // 从路由参数获取商品ID
    const shoeId = computed(() => route.params.shoeId)
    
    // 计算属性
    const averageRating = computed(() => {
      if (comments.value.length === 0) return 0
      const total = comments.value.reduce((sum, comment) => sum + comment.rating, 0)
      return total / comments.value.length
    })
    
    const ratingDistribution = computed(() => {
      const distribution = {}
      for (let i = 1; i <= 5; i++) {
        distribution[i] = 0
      }
      
      comments.value.forEach(comment => {
        distribution[comment.rating]++
      })
      
      return Object.entries(distribution).map(([rating, count]) => ({
        rating: parseInt(rating),
        count,
        percentage: comments.value.length > 0 ? (count / comments.value.length) * 100 : 0
      }))
    })
    
    // 方法
    const loadComments = async () => {
      try {
        loading.value = true
        const response = await axios.post('/api/comment/getByShoeId', 
          `shoeId=${shoeId.value}`,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        
        if (response.data && response.data.code === 200 && response.data.data) {
          comments.value = response.data.data
          
          // 逐个加载用户信息，因为后端只支持单个用户ID查询
          const userIds = [...new Set(comments.value.map(c => c.userId))]
          if (userIds.length > 0) {
            try {
              // 逐个查询用户信息
              for (const userId of userIds) {
                try {
                  const userResponse = await axios.post('/api/users/getUsersByIds',
                    `id=${userId}`,
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                  )
                  if (userResponse.data && userResponse.data.code === 200 && userResponse.data.data) {
                    userInfoMap.value[userId] = userResponse.data.data
                  }
                } catch (userError) {
                  console.warn(`获取用户${userId}信息失败:`, userError)
                }
              }
            } catch (userError) {
              console.warn('获取用户信息失败:', userError)
            }
          }
        } else {
          comments.value = []
        }
      } catch (err) {
        console.error('获取评论失败:', err)
        comments.value = []
      } finally {
        loading.value = false
      }
    }
    
    const loadProductInfo = async () => {
      try {
        const response = await axios.post('/api/shoe/getById',
          `shoeId=${shoeId.value}`,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        
        if (response.data && response.data.code === 200 && response.data.data) {
          productName.value = response.data.data.name
        }
      } catch (err) {
        console.error('获取商品信息失败:', err)
      }
    }
    
    const getUserAvatar = (userId) => {
      const user = userInfoMap.value[userId]
      if (user?.avatarPath) {
        return `/api/shoeImg/getImage/${user.avatarPath}`
      }
      return null
    }
    
    const getUserName = (userId) => {
      const user = userInfoMap.value[userId]
      return user?.username || `用户${userId}`
    }
    
    const formatCommentTime = (timeString) => {
      if (!timeString) return '未知时间'
      try {
        const date = new Date(timeString)
        return date.toLocaleDateString('zh-CN')
      } catch (error) {
        return timeString
      }
    }
    
    const getRatingText = (rating) => {
      const texts = ['', '很差', '较差', '一般', '较好', '很好']
      return texts[rating] || ''
    }
    
    const goBack = () => {
      router.go(-1)
    }
    
    // Toast 和 ConfirmDialog 相关方法
    const showMessage = (message, type = 'info') => {
      if (toast.value) {
        toastMessage.value = message
        toastType.value = type === 'success' ? 'success' : type === 'error' ? 'error' : 'warning'
        toast.value.show()
      }
    }
    
    const showSuccess = (message) => {
      showMessage(message, 'success')
    }
    
    const showError = (message) => {
      showMessage(message, 'error')
    }
    
    const showWarning = (message) => {
      showMessage(message, 'warning')
    }
    
    const showConfirm = (title, message, type = 'default') => {
      return new Promise((resolve) => {
        confirmDialog.value = {
          title,
          message,
          type,
          onConfirm: () => {
            showConfirmDialog.value = false
            resolve(true)
          },
          onCancel: () => {
            showConfirmDialog.value = false
            resolve(false)
          }
        }
        showConfirmDialog.value = true
      })
    }
    
    // 生命周期
    onMounted(async () => {
      if (shoeId.value) {
        await Promise.all([
          loadComments(),
          loadProductInfo()
        ])
      }
    })
    
    return {
      comments,
      loading,
      shoeId,
      productName,
      averageRating,
      ratingDistribution,
      getUserAvatar,
      getUserName,
      formatCommentTime,
      getRatingText,
      goBack,
      toast,
      toastMessage,
      toastType,
      showConfirmDialog,
      confirmDialog,
      showMessage,
      showSuccess,
      showError,
      showWarning,
      showConfirm
    }
  }
}
</script>

<style scoped>
.view-comments-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.breadcrumb {
  margin-bottom: 20px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.breadcrumb-item {
  color: #000;
  text-decoration: none;
  font-weight: 600;
}

.breadcrumb-item:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 10px;
  color: #999;
}

.breadcrumb-current {
  color: #666;
  font-weight: 600;
}

.page-title h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #111;
  margin: 0 0 10px 0;
}

.product-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.product-name {
  font-size: 1.1rem;
  color: #333;
  font-weight: 600;
}

.product-id {
  font-size: 0.9rem;
  color: #666;
}

/* 评论统计 */
.comments-summary {
  background: #f8f9fa;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
}

.rating-overview {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.average-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.rating-number {
  font-size: 3rem;
  font-weight: 700;
  color: #e74c3c;
}

.stars {
  display: flex;
  gap: 3px;
}

.star {
  font-size: 1.5rem;
  color: #ccc;
}

.star.filled {
  color: #e74c3c;
}

.rating-details {
  flex: 1;
}

.total-comments {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-label {
  min-width: 40px;
  font-size: 0.9rem;
  color: #666;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #e6e6e6;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #e74c3c;
  transition: width 0.3s ease;
}

.rating-count {
  min-width: 30px;
  font-size: 0.8rem;
  color: #999;
  text-align: right;
}

/* 评论列表 */
.comments-container {
  margin-bottom: 30px;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #e74c3c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.empty-state p {
  margin: 0 0 20px 0;
  color: #666;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
}

.comment-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  font-size: 1.5rem;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 600;
  color: #111;
  font-size: 1rem;
}

.comment-time {
  font-size: 0.8rem;
  color: #999;
}

.comment-rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.1rem;
  color: #ddd;
}

.star.filled {
  color: #e74c3c;
}

.rating-text {
  font-size: 0.8rem;
  color: #666;
}

.comment-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
}

/* 底部操作 */
.bottom-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 30px 0;
  border-top: 1px solid #eee;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #e74c3c;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: #666;
  border: 2px solid #ddd;
}

.btn-secondary:hover {
  background: #f8f9fa;
  border-color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rating-overview {
    flex-direction: column;
    gap: 20px;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .comment-rating {
    align-items: flex-start;
  }
  
  .bottom-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
