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
      
      <div class="info-item">
        <label>手机号</label>
        <div v-if="!isEditing" class="info-value">{{ userInfo.phone || '未设置' }}</div>
        <input v-else v-model="editForm.phone" type="tel" class="form-input" />
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
    
    <!-- 修改密码部分 -->
    <div class="password-section">
      <div class="section-header">
        <h4>修改密码</h4>
        <button @click="togglePasswordEdit" class="btn btn-outline">
          {{ isPasswordEditing ? '取消' : '修改密码' }}
        </button>
      </div>
      
      <div v-if="isPasswordEditing" class="password-form">
        <div class="form-group">
          <label>当前密码</label>
          <input v-model="passwordForm.currentPassword" type="password" class="form-input" />
        </div>
        <div class="form-group">
          <label>新密码</label>
          <input v-model="passwordForm.newPassword" type="password" class="form-input" />
        </div>
        <div class="form-group">
          <label>确认新密码</label>
          <input v-model="passwordForm.confirmPassword" type="password" class="form-input" />
        </div>
        <div class="form-actions">
          <button @click="changePassword" class="btn btn-primary" :disabled="changingPassword">
            {{ changingPassword ? '修改中...' : '确认修改' }}
          </button>
          <button @click="togglePasswordEdit" class="btn btn-secondary">取消</button>
        </div>
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
      isPasswordEditing: false,
      saving: false,
      changingPassword: false,
      uploadingAvatar: false,
      userInfo: {
        username: '',
        email: '',
        gender: '',
        phone: '',
        registerTime: '',
        level: '普通会员',
        avatarPath: ''
      },
      editForm: {
        username: '',
        email: '',
        gender: '',
        phone: ''
      },
      passwordForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
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
    this.loadUserInfo()
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
                  phone: user.phone || '未设置',
                  registerTime: user.registrationDate || new Date().toISOString(),
                  level: user.integral ? `积分${user.integral}` : '普通会员',
                  integral: user.integral || 0,
                  avatarPath: user.avatarPath || ''
                }
                
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
        
        // 如果没有从API获取到数据，使用本地存储的数据
        if (!this.userInfo.username) {
          console.log('API数据不完整，补充本地存储数据')
          this.loadFallbackUserInfo()
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
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
            gender: '未设置',
            phone: '未设置',
            registerTime: new Date().toISOString(),
            level: '普通会员',
            integral: 0,
            avatarPath: ''
          }
        } else {
          this.userInfo = {
            username: currentUser.username || '用户',
            email: currentUser.email || '未设置',
            gender: currentUser.gender || '未设置',
            phone: currentUser.phone || '未设置',
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
          gender: '未设置',
          phone: '未设置',
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
          gender: this.userInfo.gender,
          phone: this.userInfo.phone
        }
      } else {
        // 开始编辑，复制当前值到编辑表单
        this.editForm = {
          username: this.userInfo.username,
          email: this.userInfo.email,
          gender: this.userInfo.gender,
          phone: this.userInfo.phone
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
        
        // 如果后端使用中文性别，则无需转换；但若之前本地存了英文，做一次映射
        const mappedGender = this.getGenderText(this.editForm.gender) !== '未设置'
          ? this.getGenderText(this.editForm.gender)
          : this.editForm.gender

        const updatedUser = {
          ...this.userInfo,
          ...this.editForm,
          gender: mappedGender
        }
        
        // 更新本地存储
        userManager.setCurrentUser(updatedUser)
        
        // 更新显示的数据
        this.userInfo = { ...updatedUser }
        this.isEditing = false
        
        this.$emit('user-updated', updatedUser)
        alert('个人信息更新成功')
      } catch (error) {
        console.error('保存用户信息失败:', error)
        alert('保存失败，请重试')
      } finally {
        this.saving = false
      }
    },
    
    togglePasswordEdit() {
      if (this.isPasswordEditing) {
        // 清空密码表单
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      }
      this.isPasswordEditing = !this.isPasswordEditing
    },
    
    async changePassword() {
      if (!this.passwordForm.currentPassword) {
        alert('请输入当前密码')
        return
      }
      if (!this.passwordForm.newPassword) {
        alert('请输入新密码')
        return
      }
      if (this.passwordForm.newPassword.length < 6) {
        alert('新密码长度不能少于6位')
        return
      }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert('两次输入的新密码不一致')
        return
      }

      try {
        this.changingPassword = true
        const username = userManager.getCurrentUsername()
        if (!username) {
          alert('请先登录')
          return
        }
        // 使用后端已有流程：获取验证码token -> 用户输入验证码 -> 重置密码
        const codeRes = await UserAPI.getResetCode(username, this.userInfo.email || '')
        if (codeRes.data?.code !== 200 || !codeRes.data?.data?.token) {
          alert(codeRes.data?.message || '获取验证码失败')
          return
        }
        const token = codeRes.data.data.token
        const code = window.prompt('验证码已发送至邮箱，请输入验证码：')
        if (!code) return
        const resetRes = await UserAPI.resetPassword(username, this.passwordForm.newPassword, code, token)
        if (resetRes.data?.code === 200) {
          this.togglePasswordEdit()
          alert('密码修改成功')
        } else {
          alert(resetRes.data?.message || '密码修改失败')
        }
      } catch (error) {
        console.error('修改密码失败:', error)
        alert('修改密码失败，请重试')
      } finally {
        this.changingPassword = false
      }
    },
    
    getGenderText(gender) {
      if (!gender) return '未设置'
      // 若已是中文，直接返回
      if (gender === '男' || gender === '女' || gender === '其他') return gender
      // 兼容旧数据英文
      const genderMap = { male: '男', female: '女', other: '其他' }
      return genderMap[gender] || '未设置'
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

/* 密码部分 */
.password-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e6e6e6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111111;
  margin: 0;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
