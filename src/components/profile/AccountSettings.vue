<template>
  <div class="account-settings">
    <div class="settings-header">
      <h3>账户设置</h3>
    </div>

    <!-- 通知设置 -->
    <div class="settings-section">
      <h4>通知设置</h4>
      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">邮件通知</div>
            <div class="setting-description">接收订单状态、促销活动等邮件通知</div>
          </div>
          <div class="setting-control">
            <label class="switch">
              <input type="checkbox" v-model="settings.emailNotification" @change="saveSettings">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">短信通知</div>
            <div class="setting-description">接收订单状态、物流信息等短信通知</div>
          </div>
          <div class="setting-control">
            <label class="switch">
              <input type="checkbox" v-model="settings.smsNotification" @change="saveSettings">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">推送通知</div>
            <div class="setting-description">接收应用内推送通知</div>
          </div>
          <div class="setting-control">
            <label class="switch">
              <input type="checkbox" v-model="settings.pushNotification" @change="saveSettings">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 隐私设置 -->
    <div class="settings-section">
      <h4>隐私设置</h4>
      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">个人资料可见性</div>
            <div class="setting-description">允许其他用户查看您的个人资料</div>
          </div>
          <div class="setting-control">
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
          <div class="setting-control">
            <label class="switch">
              <input type="checkbox" v-model="settings.searchable" @change="saveSettings">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 账户安全 -->
    <div class="settings-section">
      <h4>账户安全</h4>
      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">两步验证</div>
            <div class="setting-description">启用两步验证以提高账户安全性</div>
          </div>
          <div class="setting-control">
            <button @click="setupTwoFactor" class="btn btn-outline">
              {{ settings.twoFactorEnabled ? '已启用' : '设置' }}
            </button>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">登录设备管理</div>
            <div class="setting-description">查看和管理已登录的设备</div>
          </div>
          <div class="setting-control">
            <button @click="manageDevices" class="btn btn-outline">管理</button>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">登录历史</div>
            <div class="setting-description">查看账户登录历史记录</div>
          </div>
          <div class="setting-control">
            <button @click="viewLoginHistory" class="btn btn-outline">查看</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据管理 -->
    <div class="settings-section">
      <h4>数据管理</h4>
      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">数据导出</div>
            <div class="setting-description">导出您的个人数据</div>
          </div>
          <div class="setting-control">
            <button @click="exportData" class="btn btn-outline">导出</button>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-label">删除账户</div>
            <div class="setting-description">永久删除您的账户和所有数据</div>
          </div>
          <div class="setting-control">
            <button @click="deleteAccount" class="btn btn-danger">删除</button>
          </div>
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
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.settings-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e1e8ed;
}

.settings-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  transition: box-shadow 0.3s;
}

.setting-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.setting-description {
  font-size: 14px;
  color: #7f8c8d;
}

.setting-control {
  margin-left: 16px;
}

/* 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #3498db;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  min-width: 120px;
}

.settings-actions {
  display: flex;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e1e8ed;
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
  max-width: 500px;
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

.two-factor-setup {
  text-align: center;
}

.qr-code {
  margin-bottom: 24px;
}

.qr-placeholder {
  width: 200px;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: #7f8c8d;
}

.qr-placeholder span {
  font-size: 48px;
  margin-bottom: 8px;
}

.setup-steps {
  text-align: left;
  margin-bottom: 24px;
}

.setup-steps h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.setup-steps ol {
  margin: 0;
  padding-left: 20px;
  color: #34495e;
  line-height: 1.6;
}

.verification-form {
  max-width: 300px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #34495e;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
  letter-spacing: 2px;
}

.form-actions {
  display: flex;
  gap: 12px;
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

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

@media (max-width: 768px) {
  .account-settings {
    padding: 16px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .setting-control {
    margin-left: 0;
    width: 100%;
  }
  
  .settings-actions {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
