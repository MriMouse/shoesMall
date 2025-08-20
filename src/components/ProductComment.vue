<template>
  <div class="comment-container">
    <!-- 评论头部 -->
    <div class="comment-header">
      <h3>商品评论</h3>
      <div class="comment-stats">
        <span class="rating-info">
          <span class="average-rating">{{ averageRating.toFixed(1) }}</span>
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
        </span>
        <span class="comment-count">{{ comments.length }} 条评论</span>
      </div>
      <!-- 调试按钮 -->
      <button @click="debugUserInfo" class="debug-btn">调试用户信息</button>
    </div>

    <!-- 评论表单 -->
    <div v-if="showCommentForm" class="comment-form-section">
      <h4>发表评论</h4>
      <div class="comment-form">
        <div class="form-group">
          <label>评分：</label>
          <div class="rating-input">
            <span 
              v-for="i in 5" 
              :key="i" 
              class="star-input"
              :class="{ 'filled': i <= newComment.rating }"
              @click="newComment.rating = i"
              @mouseenter="hoverRating = i"
              @mouseleave="hoverRating = 0"
            >
              ★
            </span>
          </div>
          <span class="rating-text">{{ getRatingText(newComment.rating) }}</span>
        </div>
        
        <div class="form-group">
          <label>评论内容：</label>
          <textarea 
            v-model="newComment.content" 
            placeholder="请分享您的使用体验..."
            class="comment-textarea"
            rows="4"
            maxlength="200"
          ></textarea>
          <div class="char-count">{{ newComment.content.length }}/200</div>
        </div>
        
        <div class="form-actions">
          <button 
            @click="submitComment" 
            class="btn btn-primary"
            :disabled="!isCommentValid || submitting"
          >
            {{ submitting ? '提交中...' : '提交评论' }}
          </button>
          <button @click="cancelComment" class="btn btn-secondary">取消</button>
        </div>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comments-list">
      <div v-if="comments.length === 0" class="no-comments">
        <div class="no-comments-icon">💬</div>
        <p>暂无评论，快来发表第一条评论吧！</p>
        <button v-if="!showCommentForm" @click="showCommentForm = true" class="btn btn-primary">
          发表评论
        </button>
      </div>
      
      <div v-else class="comments">
        <div v-for="comment in comments" :key="`${comment.userId}-${comment.shoeId}`" class="comment-item">
          <div class="comment-header-info">
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
          
          <div class="comment-actions" v-if="comment.userId === currentUserId">
            <button @click="editComment(comment)" class="btn btn-outline btn-sm">编辑</button>
            <button @click="deleteComment(comment)" class="btn btn-danger btn-sm">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑评论模态框 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>编辑评论</h4>
          <button @click="closeEditModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>评分：</label>
            <div class="rating-input">
              <span 
                v-for="i in 5" 
                :key="i" 
                class="star-input"
                :class="{ 'filled': i <= editingComment.rating }"
                @click="editingComment.rating = i"
              >
                ★
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label>评论内容：</label>
            <textarea 
              v-model="editingComment.content" 
              class="comment-textarea"
              rows="4"
              maxlength="200"
            ></textarea>
            <div class="char-count">{{ editingComment.content.length }}/200</div>
          </div>
          
          <div class="form-actions">
            <button 
              @click="updateComment" 
              class="btn btn-primary"
              :disabled="!isEditValid || updating"
            >
              {{ updating ? '更新中...' : '更新评论' }}
            </button>
            <button @click="closeEditModal" class="btn btn-secondary">取消</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 发表评论按钮 -->
    <div v-if="!showCommentForm && comments.length > 0" class="add-comment-section">
      <button @click="showCommentForm = true" class="btn btn-primary">
        发表评论
      </button>
    </div>
  </div>
</template>

<script>
import { CommentAPI } from '@/api'
import userManager from '@/utils/userManager'
import axios from 'axios' // 导入axios

export default {
  name: 'ProductComment',
  props: {
    shoeId: {
      type: [Number, String],
      required: false, // 改为false，因为可能从路由参数获取
      validator: function(value) {
        // 验证shoeId是否有效
        if (value === null || value === undefined || value === '') {
          return false
        }
        const numValue = parseInt(value)
        return !isNaN(numValue) && numValue > 0
      }
    }
  },
  data() {
    return {
      comments: [],
      newComment: {
        rating: 0,
        content: ''
      },
      editingComment: {
        userId: null,
        shoeId: null,
        rating: 0,
        content: ''
      },
      showCommentForm: false,
      showEditModal: false,
      submitting: false,
      updating: false,
      currentUserId: null,
      hoverRating: 0,
      userInfoMap: {} // 新增：用于存储用户信息
    }
  },
  computed: {
    // 计算属性：优先使用props，如果没有则从路由参数获取
    actualShoeId() {
      if (this.shoeId) {
        return this.shoeId
      }
      // 从路由参数获取
      const routeShoeId = this.$route?.params?.shoeId
      console.log('从路由参数获取的shoeId:', routeShoeId)
      return routeShoeId
    },
    averageRating() {
      if (this.comments.length === 0) return 0
      const total = this.comments.reduce((sum, comment) => sum + comment.rating, 0)
      return total / this.comments.length
    },
    isCommentValid() {
      return this.newComment.rating > 0 && this.newComment.content.trim().length > 0
    },
    isEditValid() {
      return this.editingComment.rating > 0 && this.editingComment.content.trim().length > 0
    }
  },
  async mounted() {
    console.log('=== ProductComment组件初始化 ===')
    console.log('Props中的shoeId:', this.shoeId, '类型:', typeof this.shoeId)
    console.log('路由参数:', this.$route?.params)
    console.log('计算属性actualShoeId:', this.actualShoeId, '类型:', typeof this.actualShoeId)
    
    // 验证shoeId的有效性
    if (!this.actualShoeId) {
      console.error('错误：shoeId属性未传递或为空')
      this.showToast('商品ID无效，无法加载评论')
      return
    }
    
    const shoeIdNum = parseInt(this.actualShoeId)
    if (isNaN(shoeIdNum) || shoeIdNum <= 0) {
      console.error('错误：shoeId不是有效的数字:', this.actualShoeId)
      this.showToast('商品ID格式错误，无法加载评论')
      return
    }
    
    console.log('shoeId验证成功:', shoeIdNum)
    
    try {
      await this.loadCurrentUser()
      if (this.currentUserId) {
        await this.loadComments()
      } else {
        console.warn('用户未登录，跳过加载评论')
      }
    } catch (error) {
      console.error('组件初始化失败:', error)
    }
  },
  methods: {
    async loadCurrentUser() {
      try {
        console.log('=== 加载当前用户信息 ===')
        console.log('开始获取用户ID...')
        
        // 检查localStorage中的用户信息
        const storedUser = localStorage.getItem('user')
        console.log('localStorage中的用户信息:', storedUser)
        
        this.currentUserId = await userManager.getUserId()
        
        console.log('userManager.getUserId()返回结果:', this.currentUserId)
        console.log('用户ID类型:', typeof this.currentUserId)
        
        // 验证用户ID的有效性
        if (!this.currentUserId) {
          console.error('无法获取用户ID，请检查登录状态')
          this.showToast('请先登录后再发表评论')
          return
        }
        
        // 确保用户ID是数字
        const userId = parseInt(this.currentUserId)
        if (isNaN(userId) || userId <= 0) {
          console.error('用户ID无效:', this.currentUserId)
          this.showToast('用户ID无效，请重新登录')
          return
        }
        
        // 更新为有效的数字ID
        this.currentUserId = userId
        console.log('用户ID验证成功，可以发表评论')
        console.log('最终用户ID:', this.currentUserId, '类型:', typeof this.currentUserId)
        
      } catch (error) {
        console.error('获取用户ID失败:', error)
        console.error('错误详情:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        })
        this.showToast('获取用户信息失败，请重新登录')
      }
    },
    
    async loadComments() {
      try {
        const response = await CommentAPI.getByShoeId(this.actualShoeId)
        if (response.data?.code === 200 && response.data.data) {
          this.comments = response.data.data
          console.log('加载到的评论数据:', this.comments)
          
          // 逐个加载用户信息，因为后端只支持单个用户ID查询
          const userIds = [...new Set(this.comments.map(c => c.userId))]
          console.log('需要加载用户信息的用户ID列表:', userIds)
          
          if (userIds.length > 0) {
            try {
              // 逐个查询用户信息
              for (const userId of userIds) {
                try {
                  console.log(`正在查询用户${userId}的信息...`)
                  const userResponse = await axios.post('/api/users/getUsersByIds',
                    `id=${userId}`,
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                  )
                  console.log(`用户${userId}的响应:`, userResponse.data)
                  
                  if (userResponse.data && userResponse.data.code === 200 && userResponse.data.data) {
                    // 将用户信息存储到组件中，以便显示用户名和头像
                    this.userInfoMap[userId] = userResponse.data.data
                    console.log(`用户${userId}信息已存储:`, this.userInfoMap[userId])
                  }
                } catch (userError) {
                  console.warn(`获取用户${userId}信息失败:`, userError)
                }
              }
              
              console.log('所有用户信息加载完成，userInfoMap:', this.userInfoMap)
            } catch (userError) {
              console.warn('获取用户信息失败:', userError)
            }
          }
          
          // 强制组件重新渲染，确保用户信息能正确显示
          this.$forceUpdate()
          console.log('组件已强制重新渲染')
        } else {
          this.comments = []
        }
      } catch (error) {
        console.error('加载评论失败:', error)
        this.comments = []
      }
    },
    
    async submitComment() {
      if (!this.isCommentValid) return

      // 添加调试信息
      console.log('=== 提交评论调试信息 ===')
      console.log('当前用户ID:', this.currentUserId)
      console.log('商品ID:', this.actualShoeId)
      console.log('评论内容:', this.newComment.content)
      console.log('评分:', this.newComment.rating)
      console.log('表单验证状态:', this.isCommentValid)

      try {
        this.submitting = true

        // 使用已经验证过的shoeId，避免重复解析
        const shoeIdNum = parseInt(this.actualShoeId)
        
        // 确保参数类型正确 - 后端期望Integer类型
        const requestParams = {
          userId: parseInt(this.currentUserId),
          shoeId: shoeIdNum,
          content: this.newComment.content.trim(),
          rating: parseInt(this.newComment.rating)
        }

        console.log('发送到后端的参数:', requestParams)
        console.log('参数类型检查:')
        console.log('  userId类型:', typeof requestParams.userId, '值:', requestParams.userId)
        console.log('  shoeId类型:', typeof requestParams.shoeId, '值:', requestParams.shoeId)
        console.log('  rating类型:', typeof requestParams.rating, '值:', requestParams.rating)

        // 验证参数有效性
        if (isNaN(requestParams.userId) || requestParams.userId <= 0) {
          throw new Error('用户ID无效')
        }
        if (isNaN(requestParams.shoeId) || requestParams.shoeId <= 0) {
          throw new Error('商品ID无效')
        }
        if (isNaN(requestParams.rating) || requestParams.rating < 1 || requestParams.rating > 5) {
          throw new Error('评分无效')
        }

        const response = await CommentAPI.addComment(requestParams)

        console.log('后端响应:', response)
        console.log('响应状态码:', response.status)
        console.log('响应数据:', response.data)

        if (response.data?.code === 200) {
          // 重新加载评论列表
          await this.loadComments()
          // 重置表单
          this.newComment = { rating: 0, content: '' }
          this.showCommentForm = false
          this.showToast('评论发表成功！')
          console.log('评论提交成功！')
        } else {
          const errorMsg = '评论发表失败：' + (response.data?.msg || '未知错误')
          console.error('评论提交失败:', errorMsg)
          this.showToast(errorMsg)
        }
      } catch (error) {
        console.error('提交评论异常:', error)
        console.error('错误类型:', error.constructor.name)
        console.error('错误消息:', error.message)
        
        if (error.response) {
          console.error('错误响应状态码:', error.response.status)
          console.error('错误响应数据:', error.response.data)
        } else if (error.request) {
          console.error('网络请求失败:', error.request)
        } else {
          console.error('请求配置错误:', error.message)
        }

        this.showToast('评论发表失败，请重试')
      } finally {
        this.submitting = false
      }
    },
    
    cancelComment() {
      this.newComment = { rating: 0, content: '' }
      this.showCommentForm = false
    },
    
    editComment(comment) {
      this.editingComment = {
        userId: comment.userId,
        shoeId: comment.shoeId,
        rating: comment.rating,
        content: comment.content
      }
      this.showEditModal = true
    },
    
    async updateComment() {
      if (!this.isEditValid) return
      
      try {
        this.updating = true
        const response = await CommentAPI.updateComment({
          userId: this.editingComment.userId,
          shoeId: this.editingComment.shoeId,
          content: this.editingComment.content.trim(),
          rating: this.editingComment.rating
        })
        
        if (response.data?.code === 200) {
          // 重新加载评论列表
          await this.loadComments()
          this.closeEditModal()
          this.showToast('评论更新成功！')
        } else {
          this.showToast('评论更新失败：' + (response.data?.msg || '未知错误'))
        }
      } catch (error) {
        console.error('更新评论失败:', error)
        this.showToast('评论更新失败，请重试')
      } finally {
        this.updating = false
      }
    },
    
    async deleteComment(comment) {
      if (!confirm('确定要删除这条评论吗？')) return
      
      try {
        const response = await CommentAPI.deleteComment({
          userId: comment.userId,
          shoeId: comment.shoeId
        })
        
        if (response.data?.code === 200) {
          // 重新加载评论列表
          await this.loadComments()
          this.showToast('评论删除成功！')
        } else {
          this.showToast('评论删除失败：' + (response.data?.msg || '未知错误'))
        }
      } catch (error) {
        console.error('删除评论失败:', error)
        this.showToast('评论删除失败，请重试')
      }
    },
    
    closeEditModal() {
      this.showEditModal = false
      this.editingComment = { userId: null, shoeId: null, rating: 0, content: '' }
    },
    
    getUserAvatar(userId) {
      console.log(`获取用户${userId}的头像，userInfoMap:`, this.userInfoMap)
      const user = this.userInfoMap[userId]
      console.log(`用户${userId}的信息:`, user)
      if (user?.avatarPath) {
        const avatarUrl = `/api/users/getAvatar/${user.avatarPath}`
        console.log(`用户${userId}的头像URL:`, avatarUrl)
        return avatarUrl
      }
      console.log(`用户${userId}没有头像路径`)
      return null
    },
    
    getUserName(userId) {
      console.log(`获取用户${userId}的用户名，userInfoMap:`, this.userInfoMap)
      const user = this.userInfoMap[userId]
      console.log(`用户${userId}的信息:`, user)
      const username = user?.username || `用户${userId}`
      console.log(`用户${userId}的用户名:`, username)
      return username
    },
    
    getRatingText(rating) {
      const texts = ['', '很差', '较差', '一般', '较好', '很好']
      return texts[rating] || ''
    },
    
    formatCommentTime(timeString) {
      if (!timeString) return '未知时间'
      try {
        const date = new Date(timeString)
        return date.toLocaleDateString('zh-CN')
      } catch (error) {
        return timeString
      }
    },
    
    showToast(message) {
      // 使用简单的提示
      alert(message)
    },

    debugUserInfo() {
      console.log('当前userInfoMap内容:')
      console.log(JSON.stringify(this.userInfoMap, null, 2))
      this.showToast('用户信息已打印到控制台')
    }
  }
}
</script>

<style scoped>
.comment-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e6e6e6;
}

.comment-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111111;
}

.comment-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.debug-btn {
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.8rem;
  cursor: pointer;
  margin-left: 10px;
}

.debug-btn:hover {
  background: #ff5252;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.average-rating {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111111;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1.2rem;
  color: #ddd;
  cursor: default;
}

.star.filled {
  color: #ffd700;
}

.comment-count {
  font-size: 0.9rem;
  color: #666666;
}

/* 评论表单 */
.comment-form-section {
  background: #f8f9fa;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.comment-form-section h4 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111111;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #111111;
  font-size: 0.9rem;
}

.rating-input {
  display: flex;
  gap: 4px;
}

.star-input {
  font-size: 1.5rem;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s ease;
}

.star-input:hover,
.star-input.filled {
  color: #ffd700;
}

.rating-text {
  margin-left: 8px;
  font-size: 0.9rem;
  color: #666666;
}

.comment-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
}

.comment-textarea:focus {
  outline: none;
  border-color: #111111;
  box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.1);
}

.char-count {
  text-align: right;
  font-size: 0.8rem;
  color: #999999;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 按钮样式 */
.btn {
  border: 2px solid #111111;
  background: transparent;
  color: #111111;
  border-radius: 8px;
  padding: 10px 20px;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary {
  background: #111111;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #000;
}

.btn-secondary {
  background: transparent;
  color: #111111;
}

.btn-outline {
  background: transparent;
  color: #111111;
}

.btn-danger {
  background: transparent;
  color: #dc3545;
  border-color: #dc3545;
}

.btn-danger:hover {
  background: #dc3545;
  color: #fff;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

/* 评论列表 */
.comments-list {
  margin-bottom: 24px;
}

.no-comments {
  text-align: center;
  padding: 40px 20px;
  color: #666666;
}

.no-comments-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-comments p {
  margin: 0 0 20px 0;
  font-size: 1rem;
}

.comments {
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

.comment-header-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.user-avatar .avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 600;
  color: #111111;
  font-size: 0.9rem;
}

.comment-time {
  font-size: 0.8rem;
  color: #999999;
}

.comment-rating {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.comment-content {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333333;
  margin-bottom: 16px;
}

.comment-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 添加评论按钮 */
.add-comment-section {
  text-align: center;
  padding: 20px 0;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid #e6e6e6;
}

.modal-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111111;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #111111;
}

.modal-body {
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comment-container {
    padding: 16px;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .comment-stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .comment-header-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .comment-rating {
    align-items: flex-start;
  }
}
</style>
