<template>
  <div class="account-settings">
    <div class="settings-header">
      <h3>账户设置</h3>
    </div>

    <!-- 通知设置 -->
    <div class="settings-card">
      <h4>通知设置</h4>
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">邮件通知</div>
          <div class="setting-description">接收订单状态、促销活动等邮件通知</div>
        </div>
        <div class="setting-value">
          <label class="toggle-switch" :class="{ active: settings.emailNotification }">
            <input type="checkbox" v-model="settings.emailNotification" @change="saveSettings">
            <span></span>
          </label>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">短信通知</div>
          <div class="setting-description">接收订单状态、物流信息等短信通知</div>
        </div>
        <div class="setting-value">
          <label class="toggle-switch" :class="{ active: settings.smsNotification }">
            <input type="checkbox" v-model="settings.smsNotification" @change="saveSettings">
            <span></span>
          </label>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">推送通知</div>
          <div class="setting-description">接收应用内推送通知</div>
        </div>
        <div class="setting-value">
          <label class="toggle-switch" :class="{ active: settings.pushNotification }">
            <input type="checkbox" v-model="settings.pushNotification" @change="saveSettings">
            <span></span>
          </label>
        </div>
      </div>
    </div>

    <!-- 隐私设置 -->
    <div class="settings-card">
      <h4>隐私设置</h4>
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">个人资料可见性</div>
          <div class="setting-description">允许其他用户查看您的个人资料</div>
        </div>
        <div class="setting-value">
          <select v-model="settings.profileVisibility" @change="saveSettings" class="form-select">
            <option value="public">公开</option>
            <option value="friends">仅好友</option>
            <option value="private">私密</option>
          </select>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">搜索可见性</div>
          <div class="setting-description">允许其他用户通过搜索找到您</div>
        </div>
        <div class="setting-value">
          <label class="toggle-switch" :class="{ active: settings.searchable }">
            <input type="checkbox" v-model="settings.searchable" @change="saveSettings">
            <span></span>
          </label>
        </div>
      </div>
    </div>

    <!-- 账户安全 -->
    <div class="settings-card">
      <h4>账户安全</h4>
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">两步验证</div>
          <div class="setting-description">启用两步验证以提高账户安全性</div>
        </div>
        <div class="setting-value">
          <button @click="setupTwoFactor" class="btn">
            {{ settings.twoFactorEnabled ? '已启用' : '设置' }}
          </button>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">登录设备管理</div>
          <div class="setting-description">查看和管理已登录的设备</div>
        </div>
        <div class="setting-value">
          <button @click="manageDevices" class="btn">管理</button>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">登录历史</div>
          <div class="setting-description">查看账户登录历史记录</div>
        </div>
        <div class="setting-value">
          <button @click="viewLoginHistory" class="btn">查看</button>
        </div>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="settings-card">
      <h4>数据管理</h4>
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">数据导出</div>
          <div class="setting-description">导出您的个人数据</div>
        </div>
        <div class="setting-value">
          <button @click="exportData" class="btn">导出</button>
        </div>
      </div>

      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">删除账户</div>
          <div class="setting-description">永久删除您的账户和所有数据</div>
        </div>
        <div class="setting-value">
          <button @click="deleteAccount" class="btn btn-danger">删除</button>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="settings-actions">
      <button @click="saveAllSettings" class="btn btn-primary" :disabled="saving">
        {{ saving ? '保存中...' : '保存设置' }}
      </button>
      <button @click="resetSettings" class="btn btn-secondary">重置</button>
    </div>

    <!-- 两步验证设置模态框 -->
    <div v-if="showTwoFactorModal" class="modal-overlay" @click="closeTwoFactorModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>两步验证设置</h3>
          <button @click="closeTwoFactorModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="two-factor-setup">
            <div class="qr-code">
              <div class="qr-placeholder">
                <span>📱</span>
                <p>二维码将在这里显示</p>
              </div>
            </div>
            <div class="setup-steps">
              <h4>设置步骤：</h4>
              <ol>
                <li>下载并安装 Google Authenticator 或类似应用</li>
                <li>扫描上方二维码</li>
                <li>输入应用生成的验证码</li>
                <li>点击确认完成设置</li>
              </ol>
            </div>
            <div class="verification-form">
              <div class="form-group">
                <label>验证码</label>
                <input v-model="twoFactorCode" type="text" class="form-input" placeholder="请输入6位验证码" maxlength="6" />
              </div>
              <div class="form-actions">
                <button @click="confirmTwoFactor" class="btn btn-primary">确认</button>
                <button @click="closeTwoFactorModal" class="btn btn-secondary">取消</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userManager from '@/utils/userManager'

export default {
  name: 'AccountSettings',
  data() {
    return {
      saving: false,
      showTwoFactorModal: false,
      twoFactorCode: '',
      settings: {
        emailNotification: true,
        smsNotification: false,
        pushNotification: true,
        profileVisibility: 'public',
        searchable: true,
        twoFactorEnabled: false
      }
    }
  },
  mounted() {
    this.loadSettings()
  },
  methods: {
    async loadSettings() {
      try {
        // 从本地存储加载设置
        const savedSettings = localStorage.getItem('userSettings')
        if (savedSettings) {
          this.settings = { ...this.settings, ...JSON.parse(savedSettings) }
        }
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    },

    async saveSettings() {
      try {
        this.saving = true
        // 保存到本地存储
        localStorage.setItem('userSettings', JSON.stringify(this.settings))
        
        // 这里应该调用后端API保存设置
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log('设置已保存')
      } catch (error) {
        console.error('保存设置失败:', error)
        alert('保存失败，请重试')
      } finally {
        this.saving = false
      }
    },

    async saveAllSettings() {
      await this.saveSettings()
      alert('设置保存成功')
    },

    resetSettings() {
      if (confirm('确定要重置所有设置吗？')) {
        this.settings = {
          emailNotification: true,
          smsNotification: false,
          pushNotification: true,
          profileVisibility: 'public',
          searchable: true,
          twoFactorEnabled: false
        }
        localStorage.removeItem('userSettings')
        alert('设置已重置')
      }
    },

    setupTwoFactor() {
      if (this.settings.twoFactorEnabled) {
        if (confirm('确定要禁用两步验证吗？')) {
          this.settings.twoFactorEnabled = false
          this.saveSettings()
          alert('两步验证已禁用')
        }
      } else {
        this.showTwoFactorModal = true
      }
    },

    async confirmTwoFactor() {
      if (!this.twoFactorCode || this.twoFactorCode.length !== 6) {
        alert('请输入6位验证码')
        return
      }

      try {
        // 这里应该调用后端API验证两步验证码
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.settings.twoFactorEnabled = true
        this.saveSettings()
        this.closeTwoFactorModal()
        alert('两步验证设置成功')
      } catch (error) {
        console.error('设置两步验证失败:', error)
        alert('设置失败，请重试')
      }
    },

    closeTwoFactorModal() {
      this.showTwoFactorModal = false
      this.twoFactorCode = ''
    },

    manageDevices() {
      alert('设备管理功能开发中...')
    },

    viewLoginHistory() {
      alert('登录历史功能开发中...')
    },

    exportData() {
      // 模拟数据导出
      const userData = {
        username: userManager.getCurrentUsername(),
        settings: this.settings,
        exportTime: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(userData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `user-data-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      URL.revokeObjectURL(url)
      alert('数据导出成功')
    },

    deleteAccount() {
      if (confirm('确定要删除账户吗？此操作不可撤销！')) {
        if (confirm('再次确认：删除账户将永久删除所有数据，无法恢复！')) {
          // 这里应该调用后端API删除账户
          alert('账户删除功能开发中...')
        }
      }
    }
  }
}
</script>

<style scoped>
.account-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 头部 */
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 1rem;
}

.settings-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111111;
  margin: 0;
}

/* 设置卡片 */
.settings-card {
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-card h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111111;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #111111;
  margin-bottom: 0.25rem;
}

.setting-description {
  font-size: 0.8rem;
  color: #666666;
  line-height: 1.4;
}

.setting-value {
  font-size: 0.9rem;
  color: #666666;
  font-weight: 500;
}

/* 黑白极简 Toggle 开关（带边框） */
.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
  background: #fff;
  border: 2px solid #111111;
  border-radius: 999px;
  transition: all 0.2s ease;
  cursor: pointer;
  display: inline-block;
}

.toggle-switch input { display: none; }

/* 滑块 */
.toggle-switch span {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  background: #111111;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

/* 选中态：边框保持黑色，滑块右移 */
.toggle-switch.active { background: #fff; border-color: #111111; }
.toggle-switch.active span { transform: translateX(24px); }

/* 小尺寸版本 */
.toggle-switch.small { width: 44px; height: 24px; }
.toggle-switch.small span { width: 18px; height: 18px; top: 2px; left: 2px; }
.toggle-switch.small.active span { transform: translateX(20px); }

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

.btn-danger {
  border-color: #dc3545;
  color: #dc3545;
}

.btn-danger:hover {
  background: #dc3545;
  color: #fff;
}

/* 表单样式 */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111111;
  margin-bottom: 0.5rem;
}

.form-input,
.form-select {
  width: 100%;
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

/* 模态框 */
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
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e6e6e6;
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111111;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f0f0f0;
  color: #111111;
}

.modal-body {
  padding: 1.5rem;
}

/* 表单操作 */
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e6e6e6;
}

/* 警告框 */
.warning-box {
  background: #f8f9fa;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.warning-box h5 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111111;
  margin: 0 0 0.5rem 0;
}

.warning-box p {
  font-size: 0.8rem;
  color: #666666;
  margin: 0;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .setting-value {
    align-self: flex-end;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-header,
  .modal-body {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
  
  .setting-label {
    font-size: 0.8rem;
  }
  
  .setting-description {
    font-size: 0.75rem;
  }
  
  .settings-card {
    padding: 1rem;
  }
}
</style>
