<template>
  <div class="test-user-update">
    <h2>用户信息更新测试</h2>
    
    <div class="test-section">
      <h3>当前用户信息</h3>
      <div v-if="userInfo">
        <p><strong>ID:</strong> {{ userInfo.id }}</p>
        <p><strong>用户名:</strong> {{ userInfo.username }}</p>
        <p><strong>邮箱:</strong> {{ userInfo.email }}</p>
        <p><strong>性别:</strong> {{ userInfo.gender }}</p>
        <p><strong>积分:</strong> {{ userInfo.integral }}</p>
        <p><strong>头像路径:</strong> {{ userInfo.avatarPath }}</p>
      </div>
      <div v-else>
        <p>正在加载用户信息...</p>
      </div>
    </div>

    <div class="test-section">
      <h3>更新用户信息</h3>
      <div class="form-group">
        <label>用户名:</label>
        <input v-model="updateForm.username" type="text" />
      </div>
      <div class="form-group">
        <label>邮箱:</label>
        <input v-model="updateForm.email" type="email" />
      </div>
      <div class="form-group">
        <label>性别:</label>
        <select v-model="updateForm.gender">
          <option value="">请选择</option>
          <option value="男">男</option>
          <option value="女">女</option>
          <option value="其他">其他</option>
        </select>
      </div>
      <button @click="updateUserInfo" :disabled="updating">
        {{ updating ? '更新中...' : '更新用户信息' }}
      </button>
    </div>

    <div class="test-section">
      <h3>更新密码</h3>
      <div class="form-group">
        <label>原密码:</label>
        <input v-model="passwordForm.oldPassword" type="password" />
      </div>
      <div class="form-group">
        <label>新密码:</label>
        <input v-model="passwordForm.newPassword" type="password" />
      </div>
      <button @click="updatePassword" :disabled="updatingPassword">
        {{ updatingPassword ? '更新中...' : '更新密码' }}
      </button>
    </div>

    <div class="test-section">
      <h3>更新积分</h3>
      <div class="form-group">
        <label>新积分:</label>
        <input v-model="integralForm.integral" type="number" />
      </div>
      <button @click="updateIntegral" :disabled="updatingIntegral">
        {{ updatingIntegral ? '更新中...' : '更新积分' }}
      </button>
    </div>

    <div class="test-section">
      <h3>刷新用户信息</h3>
      <button @click="loadUserInfo" :disabled="loading">
        {{ loading ? '加载中...' : '刷新' }}
      </button>
    </div>
  </div>
</template>

<script>
import { UserAPI } from '@/api'
import userManager from '@/utils/userManager'

export default {
  name: 'TestUserUpdate',
  data() {
    return {
      userInfo: null,
      loading: false,
      updating: false,
      updatingPassword: false,
      updatingIntegral: false,
      updateForm: {
        username: '',
        email: '',
        gender: ''
      },
      passwordForm: {
        oldPassword: '',
        newPassword: ''
      },
      integralForm: {
        integral: 0
      }
    }
  },
  mounted() {
    this.loadUserInfo()
  },
  methods: {
    async loadUserInfo() {
      try {
        this.loading = true
        const username = userManager.getCurrentUsername()
        
        if (!username) {
          alert('请先登录')
          return
        }

        // 获取用户ID
        const userIdResponse = await UserAPI.getUserIdByUsername(username)
        if (userIdResponse.data?.code === 200 && userIdResponse.data.data) {
          const userId = userIdResponse.data.data
          
          // 获取用户详细信息
          const userResponse = await UserAPI.getUserById(userId)
          if (userResponse.data?.code === 200 && userResponse.data.data) {
            this.userInfo = userResponse.data.data
            
            // 填充更新表单
            this.updateForm = {
              username: this.userInfo.username || '',
              email: this.userInfo.email || '',
              gender: this.userInfo.gender || ''
            }
            
            this.integralForm.integral = this.userInfo.integral || 0
          }
        }
      } catch (error) {
        console.error('加载用户信息失败:', error)
        alert('加载用户信息失败')
      } finally {
        this.loading = false
      }
    },

    async updateUserInfo() {
      try {
        this.updating = true
        
        if (!this.userInfo?.id) {
          alert('用户信息不完整，请先刷新')
          return
        }

        const response = await UserAPI.updateUserInfo(
          this.userInfo.id,
          this.updateForm.username,
          this.updateForm.email,
          this.updateForm.gender
        )

        if (response.data?.code === 200) {
          alert('用户信息更新成功！')
          await this.loadUserInfo() // 刷新用户信息
        } else {
          alert('更新失败：' + (response.data?.msg || '未知错误'))
        }
      } catch (error) {
        console.error('更新用户信息失败:', error)
        alert('更新失败，请重试')
      } finally {
        this.updating = false
      }
    },

    async updatePassword() {
      try {
        this.updatingPassword = true
        
        if (!this.userInfo?.id) {
          alert('用户信息不完整，请先刷新')
          return
        }

        if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword) {
          alert('请填写完整的密码信息')
          return
        }

        const response = await UserAPI.updatePassword(
          this.userInfo.id,
          this.passwordForm.oldPassword,
          this.passwordForm.newPassword
        )

        if (response.data?.code === 200) {
          alert('密码更新成功！')
          this.passwordForm = { oldPassword: '', newPassword: '' }
        } else {
          alert('更新失败：' + (response.data?.msg || '未知错误'))
        }
      } catch (error) {
        console.error('更新密码失败:', error)
        alert('更新失败，请重试')
      } finally {
        this.updatingPassword = false
      }
    },

    async updateIntegral() {
      try {
        this.updatingIntegral = true
        
        if (!this.userInfo?.id) {
          alert('用户信息不完整，请先刷新')
          return
        }

        const response = await UserAPI.updateIntegral(
          this.userInfo.id,
          this.integralForm.integral
        )

        if (response.data?.code === 200) {
          alert('积分更新成功！')
          await this.loadUserInfo() // 刷新用户信息
        } else {
          alert('更新失败：' + (response.data?.msg || '未知错误'))
        }
      } catch (error) {
        console.error('更新积分失败:', error)
        alert('更新失败，请重试')
      } finally {
        this.updatingIntegral = false
      }
    }
  }
}
</script>

<style scoped>
.test-user-update {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: #0056b3;
}
</style>
