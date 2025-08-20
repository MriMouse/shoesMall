<template>
  <div class="user-info-card">
    <div class="card-header">
      <h3>个人信息</h3>
      <button @click="toggleEdit" class="btn btn-outline">
        {{ isEditing ? '取消' : '编辑' }}
      </button>
    </div>
    
    <div class="card-content">
      <!-- 头像部分 -->
      <div class="avatar-section">
        <div class="avatar-container">
          <div v-if="!userInfo.avatarPath" class="avatar-placeholder">
            <span>{{ userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U' }}</span>
          </div>
          <img v-else :src="avatarUrl" :alt="userInfo.username" class="avatar-image" />
          <div class="avatar-overlay" v-if="isEditing">
            <input 
              type="file" 
              ref="avatarInput" 
              @change="handleAvatarChange" 
              accept="image/*" 
              class="avatar-input"
            />
            <button @click="$refs.avatarInput.click()" class="avatar-upload-btn">
              {{ uploadingAvatar ? '上传中...' : '更换头像' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="info-item">
        <label>用户名</label>
        <div v-if="!isEditing" class="info-value">{{ userInfo.username }}</div>
        <input v-else v-model="editForm.username" type="text" class="form-input" />
      </div>
      
      <div class="info-item">
        <label>邮箱</label>
        <div v-if="!isEditing" class="info-value">{{ userInfo.email || '未设置' }}</div>
        <input v-else v-model="editForm.email" type="email" class="form-input" />
      </div>
      
      <div class="info-item">
        <label>性别</label>
        <div v-if="!isEditing" class="info-value">{{ getGenderText(userInfo.gender) }}</div>
        <select v-else v-model="editForm.gender" class="form-select">
          <option value="">请选择</option>
          <option value="男">男</option>
          <option value="女">女</option>
          <option value="其他">其他</option>
        </select>
      </div>

      <!-- 密码修改部分 -->
      <div v-if="isEditing" class="info-item">
        <label>修改密码</label>
        <div class="password-form">
          <input 
            v-model="passwordForm.oldPassword" 
            type="password" 
            placeholder="请输入当前密码" 
            class="form-input password-input"
          />
          <input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码" 
            class="form-input password-input"
          />
          <button 
            @click="updatePassword" 
            class="btn btn-warning password-btn"
            :disabled="updatingPassword || !passwordForm.oldPassword || !passwordForm.newPassword"
          >
            {{ updatingPassword ? '更新中...' : '更新密码' }}
          </button>
        </div>
      </div>
      

      
      <div class="info-item">
        <label>注册时间</label>
        <div class="info-value">{{ formatDate(userInfo.registerTime) }}</div>
      </div>
      
      <div class="info-item">
        <label>会员等级</label>
        <div class="info-value">{{ userInfo.level || '普通会员' }}</div>
      </div>
      
      <div v-if="isEditing" class="form-actions">
        <button @click="saveUserInfo" class="btn btn-primary" :disabled="saving">
          {{ saving ? '保存中...' : '保存' }}
        </button>
        <button @click="toggleEdit" class="btn btn-secondary">取消</button>
      </div>
    </div>
    

  </div>
</template>

<script>
import { UserAPI } from '@/api'
import userManager from '@/utils/userManager'

export default {
  name: 'UserInfoCard',
  data() {
    return {
      isEditing: false,
      saving: false,
      uploadingAvatar: false,
      userInfo: {
        username: '',
        email: '',
        gender: '',
        registerTime: '',
        level: '普通会员',
        avatarPath: ''
      },
      editForm: {
        username: '',
        email: '',
        gender: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: ''
      },
      updatingPassword: false
    }
  },
  computed: {
    avatarUrl() {
      if (!this.userInfo.avatarPath || this.userInfo.avatarPath === 'default') return ''
      const parts = this.userInfo.avatarPath.split(/[/\\]/)
      const filename = parts[parts.length - 1]
      return `/api/users/getAvatar/${filename}`
    }
  },
  mounted() {
    console.log('UserInfoCard 组件已挂载，开始加载用户信息')
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo() {
      console.log('开始加载用户信息...')
      
      try {
        const username = userManager.getCurrentUsername()
        console.log('当前用户名:', username)
        
        if (!username) {
          console.warn('未找到用户名，使用本地存储数据')
          this.loadFallbackUserInfo()
          return
        }
        
        // 首先加载本地存储的用户信息作为默认值
        this.loadFallbackUserInfo()
        
        // 然后尝试从后端获取最新的用户信息
        try {
          console.log('尝试从后端获取用户信息...')
          
          // 先获取用户ID
          const userIdResponse = await UserAPI.getUserIdByUsername(username)
          console.log('用户ID响应:', userIdResponse)
          
          if (userIdResponse.data?.code === 200 && userIdResponse.data.data) {
            const userId = userIdResponse.data.data
            console.log('获取到用户ID:', userId)
            
            // 直接通过用户ID获取用户信息
            const userResponse = await UserAPI.getUserById(userId)
            console.log('用户信息响应:', userResponse)
            
            if (userResponse.data?.code === 200 && userResponse.data.data) {
              const user = userResponse.data.data
              console.log('从后端获取的用户信息:', user)
              
              // 更新用户信息
              this.userInfo = {
                username: user.username || username,
                email: user.email || '未设置',
                gender: user.gender || '未设置',
                registerTime: user.registrationDate || new Date().toISOString(),
                level: user.integral ? `积分${user.integral}` : '普通会员',
                integral: user.integral || 0,
                avatarPath: user.avatarPath || ''
              }
              
              console.log('后端用户信息加载成功:', this.userInfo)
              
              // 更新本地存储
              userManager.setCurrentUser({
                ...userManager.getCurrentUser(),
                ...user
              })
            } else {
              console.warn('获取用户信息失败:', userResponse.data?.msg)
            }
          } else {
            console.warn('获取用户ID失败:', userIdResponse.data?.msg)
          }
        } catch (apiError) {
          console.warn('API获取用户信息失败，使用本地存储数据:', apiError)
        }
        
        // 尝试获取用户头像路径
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
        // 确保至少显示本地存储的数据
        this.loadFallbackUserInfo()
      }
    },
    
    loadFallbackUserInfo() {
      console.log('使用本地存储的用户信息')
      const currentUser = userManager.getCurrentUser()
      console.log('本地存储的用户信息:', currentUser)
      
      if (currentUser) {
        // 如果currentUser是字符串，转换为对象
        if (typeof currentUser === 'string') {
          this.userInfo = {
            username: currentUser,
            email: '未设置',
            gender: '',
            registerTime: new Date().toISOString(),
            level: '普通会员',
            integral: 0,
            avatarPath: ''
          }
        } else {
          this.userInfo = {
            username: currentUser.username || '用户',
            email: currentUser.email || '未设置',
            gender: currentUser.gender || '',
            registerTime: currentUser.registerTime || currentUser.registrationDate || new Date().toISOString(),
            level: currentUser.integral ? `积分${currentUser.integral}` : '普通会员',
            integral: currentUser.integral || 0,
            avatarPath: currentUser.avatarPath || ''
          }
        }
        
        console.log('本地用户信息加载成功:', this.userInfo)
      } else {
        // 如果本地存储也没有数据，设置默认值
        this.userInfo = {
          username: '用户',
          email: '未设置',
          gender: '',
          registerTime: new Date().toISOString(),
          level: '普通会员',
          integral: 0,
          avatarPath: ''
        }
        console.log('使用默认用户信息:', this.userInfo)
      }
    },
    
    toggleEdit() {
      if (this.isEditing) {
        // 取消编辑，恢复原值
        this.editForm = {
          username: this.userInfo.username,
          email: this.userInfo.email,
          gender: this.userInfo.gender
        }
      } else {
        // 开始编辑，复制当前值到编辑表单
        this.editForm = {
          username: this.userInfo.username,
          email: this.userInfo.email,
          gender: this.userInfo.gender
        }
      }
      this.isEditing = !this.isEditing
    },
    
    async saveUserInfo() {
      if (!this.editForm.username.trim()) {
        alert('用户名不能为空')
        return
      }
      
      try {
        this.saving = true
        
        // 获取当前用户ID
        const username = userManager.getCurrentUsername()
        if (!username) {
          alert('用户信息获取失败，请重新登录')
          return
        }
        
        // 获取用户ID
        const userIdResponse = await UserAPI.getUserIdByUsername(username)
        if (userIdResponse.data?.code !== 200 || !userIdResponse.data.data) {
          alert('获取用户ID失败，请重试')
        }
        
        const userId = userIdResponse.data.data
        
        // 直接使用中文性别值，数据库支持中文字符
        const response = await UserAPI.updateUserInfo(
          userId,
          this.editForm.username,
          this.editForm.email,
          this.editForm.gender
        )
        
        if (response.data?.code === 200) {
          // 更新成功，刷新用户信息
          await this.loadUserInfo()
          this.isEditing = false
          this.$emit('user-updated', this.userInfo)
          alert('个人信息更新成功！')
        } else {
          alert('更新失败：' + (response.data?.msg || '未知错误'))
        }
      } catch (error) {
        console.error('保存用户信息失败:', error)
        alert('保存失败，请重试')
      } finally {
        this.saving = false
      }
    },

    async updatePassword() {
      if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword) {
        alert('请填写完整的密码信息')
        return
      }

      if (this.passwordForm.newPassword.length < 6) {
        alert('新密码长度不能少于6位')
        return
      }

      try {
        this.updatingPassword = true
        
        // 获取当前用户ID
        const username = userManager.getCurrentUsername()
        if (!username) {
          alert('用户信息获取失败，请重新登录')
          return
        }
        
        // 获取用户ID
        const userIdResponse = await UserAPI.getUserIdByUsername(username)
        if (userIdResponse.data?.code !== 200 || !userIdResponse.data.data) {
          alert('获取用户ID失败，请重试')
          return
        }
        
        const userId = userIdResponse.data.data
        
        // 调用密码更新API
        const response = await UserAPI.updatePassword(
          userId,
          this.passwordForm.oldPassword,
          this.passwordForm.newPassword
        )
        
        if (response.data?.code === 200) {
          alert('密码更新成功！')
          // 清空密码表单
          this.passwordForm.oldPassword = ''
          this.passwordForm.newPassword = ''
        } else {
          alert('密码更新失败：' + (response.data?.msg || '未知错误'))
        }
      } catch (error) {
        console.error('密码更新失败:', error)
        alert('密码更新失败，请重试')
      } finally {
        this.updatingPassword = false
      }
    },
    

    

    
    getGenderText(gender) {
      if (!gender) return '未设置'
      return gender || '未设置'
    },


    
    formatDate(dateString) {
      if (!dateString) return '未知'
      return new Date(dateString).toLocaleDateString('zh-CN')
    },
    
    handleAvatarChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.uploadAvatar(file);
      }
    },
    
    async uploadAvatar(file) {
      this.uploadingAvatar = true;
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        // 调用后端头像上传接口
        const response = await UserAPI.uploadAvatar(formData);
        if (response.data?.code === 200 && response.data.data) {
          // 后端可能返回字符串或对象，做兼容
          const data = response.data.data;
          const avatarPath = typeof data === 'string' ? data : (data.avatarPath || data.path || '');
          if (!avatarPath) {
            alert('头像上传失败：返回路径为空');
            return;
          }
          // 优先按用户ID更新数据库
          let updated = false;
          try {
            const userId = await userManager.getUserId();
            if (userId) {
              const updateByIdRes = await UserAPI.updateAvatarById(userId, avatarPath);
              updated = updateByIdRes.data?.code === 200;
            }
          } catch (e) { console.warn('按ID更新头像失败，将回退到按用户名更新', e); }
          if (!updated) {
            const username = userManager.getCurrentUsername();
            if (username) {
              const updateResponse = await UserAPI.updateAvatar(username, avatarPath);
              updated = updateResponse.data?.code === 200;
            }
          }
          if (updated) {
            // 更新本地用户信息
            this.userInfo.avatarPath = avatarPath;
            const currentUser = userManager.getCurrentUser();
            if (currentUser) {
              userManager.setCurrentUser({ ...currentUser, avatarPath });
            }
            alert('头像上传成功');
          } else {
            alert('头像更新到数据库失败');
          }
        } else {
          alert('头像上传失败：' + (response.data?.msg || '未知错误'));
        }
      } catch (error) {
        console.error('上传头像失败:', error);
        alert('上传头像失败，请重试');
      } finally {
        this.uploadingAvatar = false;
      }
    }
  }
}
</script>

<style scoped>
.user-info-card {
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e6e6e6;
}

.card-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111111;
  margin: 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 头像部分 */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e6e6e6;
  background: #f8f9fa;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #111111;
  font-size: 2rem;
  font-weight: 700;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-input {
  display: none;
}

.avatar-upload-btn {
  background: #fff;
  color: #111111;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.avatar-upload-btn:hover {
  background: #111111;
  color: #fff;
}

/* 信息项 */
.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  min-width: 80px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111111;
}

.info-value {
  flex: 1;
  font-size: 0.9rem;
  color: #666666;
  font-weight: 500;
}

/* 表单输入 */
.form-input,
.form-select {
  flex: 1;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #111111;
  background: #fff;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #111111;
  box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.1);
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

.btn-outline {
  border: 2px solid #111111;
  background: transparent;
  color: #111111;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 表单操作 */
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e6e6e6;
}

/* 密码修改样式 */
.password-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.password-input {
  width: 100%;
  margin-bottom: 0.5rem;
}

.password-btn {
  background: #ff6b35;
  color: #fff;
  border-color: #ff6b35;
  align-self: flex-start;
}

.password-btn:hover {
  background: #e55a2b;
  border-color: #e55a2b;
}

.password-btn:disabled {
  background: #ccc;
  border-color: #ccc;
  color: #666;
}



.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111111;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-info-card {
    padding: 1rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .info-item label {
    min-width: auto;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .avatar-container {
    width: 80px;
    height: 80px;
  }
  
  .avatar-placeholder {
    font-size: 1.5rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
