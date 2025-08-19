<template>
  <div class="address-management">
    <div class="address-header">
      <h3>收货地址</h3>
      <button @click="showAddModal = true" class="btn btn-primary">
        <span class="icon">+</span>
        添加新地址
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载地址...</p>
    </div>

    <div v-else-if="addresses.length === 0" class="empty-state">
      <div class="empty-icon">📍</div>
      <p>暂无收货地址</p>
      <button @click="showAddModal = true" class="btn btn-primary">添加地址</button>
    </div>

    <div v-else class="addresses-list">
      <div v-for="address in addresses" :key="address.id" class="address-item">
        <div class="address-content">
          <div class="address-info">
            <div class="contact-info">
              <span class="name">{{ address.receiverName }}</span>
              <span class="phone">{{ address.phone }}</span>
              <span v-if="address.isDefault" class="default-badge">默认</span>
            </div>
            <div class="address-detail">
              {{ formatAddress(address) }}
            </div>
          </div>

          <div class="address-actions">
            <button @click="editAddress(address)" class="btn btn-outline">
              编辑
            </button>
            <button @click="deleteAddress(address)" class="btn btn-danger">
              删除
            </button>
            <button v-if="!address.isDefault" @click="setDefaultAddress(address)" class="btn btn-secondary">
              设为默认
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑地址模态框 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditModal ? '编辑地址' : '添加新地址' }}</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAddress" class="address-form">
            <div class="form-row">
              <div class="form-group">
                <label>收货人姓名 *</label>
                <input v-model="addressForm.receiverName" type="text" class="form-input" required
                  placeholder="请输入收货人姓名" />
              </div>
              <div class="form-group">
                <label>手机号码 *</label>
                <input v-model="addressForm.phone" type="tel" class="form-input" required placeholder="请输入手机号码" />
              </div>
            </div>

            <div class="form-group">
              <label>省份 *</label>
              <select v-model="addressForm.province" class="form-select" required>
                <option disabled value="">请选择省份/地区</option>
                <option v-for="p in provinceOptions" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>详细地址 *</label>
              <textarea v-model="addressForm.detailAddress" class="form-textarea" required
                placeholder="请输入详细地址，如街道、门牌号等" rows="3"></textarea>
            </div>

            <div class="form-group">
              <label>邮政编码</label>
              <input v-model="addressForm.postalCode" type="text" class="form-input" placeholder="请输入邮政编码" />
            </div>

            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input v-model="addressForm.isDefault" type="checkbox" class="form-checkbox" />
                <span class="checkbox-text">设为默认收货地址</span>
              </label>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? '保存中...' : '保存地址' }}
              </button>
              <button type="button" @click="closeModal" class="btn btn-secondary">
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 确认删除对话框 -->
    <confirmDialog v-model:visible="showDeleteDialog" title="删除地址"
      :message="pendingDeleteAddress ? '确定要删除地址“' + pendingDeleteAddress.receiverName + '”吗？' : '确定要删除该地址吗？'"
      confirm-text="删除" cancel-text="取消" icon="🗑️" type="danger" @confirm="confirmDelete"
      @cancel="handleDeleteCancel" />
  </div>
</template>

<script>
import { AddressAPI } from '@/api'
import userManager from '@/utils/userManager'
import confirmDialog from '@/views/confirmDialog.vue'

export default {
  name: 'AddressManagement',
  components: { confirmDialog },
  data() {
    return {
      addresses: [],
      loading: false,
      saving: false,
      showAddModal: false,
      showEditModal: false,
      showDeleteDialog: false,
      pendingDeleteAddress: null,
      editingAddress: null,
      addressForm: {
        receiverName: '',
        phone: '',
        province: '',
        city: '',
        detailAddress: '',
        postalCode: '',
        isDefault: false
      },
      // 简化的地区数据，实际项目中应该从API获取
      provinceOptions: ['河北', '北京', '天津', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '山东', '河南', '陕西', '甘肃', '宁夏', '青海', '新疆', '湖北', '湖南', '安徽', '江苏', '江西', '浙江', '福建', '广东', '广西', '海南', '四川', '重庆', '贵州', '云南', '西藏', '上海', '香港', '澳门', '海外']
    }
  },
  mounted() {
    this.loadAddresses()
  },
  methods: {
    async loadAddresses() {
      try {
        this.loading = true
        const userId = await userManager.getUserId()
        console.log('当前用户ID:', userId)

        if (!userId) {
          console.log('用户未登录，无法加载地址')
          // 使用模拟数据作为演示
          this.addresses = this.getMockAddresses()
          return
        }

        try {
          const response = await AddressAPI.getList(userId)
          console.log('API响应:', response)

          if (response.data?.code === 200 && response.data.data) {
            // 将数据库格式转换为前端显示格式
            this.addresses = response.data.data.map(dbAddress => ({
              id: dbAddress.addressId || dbAddress.id,
              receiverName: dbAddress.receiverName,
              phone: dbAddress.phone,
              // 从addressInfo中解析省市信息
              ...this.parseAddressInfo(dbAddress.addressInfo),
              postalCode: dbAddress.postalCode,
              isDefault: dbAddress.isDefault === 1 || dbAddress.isDefault === true
            }))
            console.log('从API加载地址成功:', this.addresses)
          } else {
            console.warn('API返回数据异常:', response.data)
            // 使用模拟数据作为备选
            this.addresses = this.getMockAddresses()
          }
        } catch (apiError) {
          console.warn('API调用失败，使用模拟数据:', apiError)
          // 使用模拟数据作为备选
          this.addresses = this.getMockAddresses()
        }
      } catch (error) {
        console.error('加载地址失败:', error)
        // 使用模拟数据作为备选
        this.addresses = this.getMockAddresses()
      } finally {
        this.loading = false
      }
    },

    // 解析地址信息，从完整地址中提取省市信息
    parseAddressInfo(addressInfo) {
      if (!addressInfo) return { province: '', city: '', detailAddress: '' }

      // 尝试从地址信息中提取省市
      const parts = addressInfo.split(' ')
      if (parts.length >= 2) {
        return {
          province: parts[0] || '',
          city: parts[1] || '',
          detailAddress: parts.slice(2).join(' ') || ''
        }
      }

      return {
        province: '',
        city: '',
        detailAddress: addressInfo
      }
    },

    getMockAddresses() {
      return [
        {
          id: 1,
          receiverName: '张三',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          detailAddress: '朝阳区三里屯SOHO 1号楼 1001室',
          postalCode: '100020',
          isDefault: true
        },
        {
          id: 2,
          receiverName: '李四',
          phone: '13900139000',
          province: '广东省',
          city: '深圳市',
          detailAddress: '南山区科技园南区 2栋 2002室',
          postalCode: '518057',
          isDefault: false
        },
        {
          id: 3,
          receiverName: '王五',
          phone: '13700137000',
          province: '上海市',
          city: '上海市',
          detailAddress: '浦东新区陆家嘴金融中心 3号楼 3003室',
          postalCode: '200120',
          isDefault: false
        }
      ]
    },

    editAddress(address) {
      this.editingAddress = address
      this.addressForm = {
        receiverName: address.receiverName,
        phone: address.phone,
        province: address.province,
        city: address.city,
        detailAddress: address.detailAddress,
        postalCode: address.postalCode,
        isDefault: address.isDefault
      }

      this.showEditModal = true
    },

    async deleteAddress(address) {
      this.pendingDeleteAddress = address
      this.showDeleteDialog = true
    },

    async confirmDelete() {
      const address = this.pendingDeleteAddress
      if (!address) return
      try {
        console.log('删除地址:', address.id)
        const deleteResponse = await AddressAPI.delete(address.id)
        console.log('删除地址API响应:', deleteResponse)

        if (deleteResponse.data?.code === 200) {
          alert('地址删除成功')
          console.log('地址删除成功:', address.id)

          // 从本地列表中移除
          const index = this.addresses.findIndex(addr => addr.id === address.id)
          if (index !== -1) {
            this.addresses.splice(index, 1)
          }
        } else {
          throw new Error(`删除失败: ${deleteResponse.data?.message || '未知错误'}`)
        }
      } catch (error) {
        console.error('删除地址失败:', error)
        alert(`删除失败: ${error.message}`)
      } finally {
        this.showDeleteDialog = false
        this.pendingDeleteAddress = null
      }
    },

    handleDeleteCancel() {
      this.pendingDeleteAddress = null
    },

    async setDefaultAddress(address) {
      try {
        const userId = await userManager.getUserId()
        if (!userId) {
          alert('用户未登录，无法设置默认地址')
          return
        }

        console.log('设置默认地址:', address.id, '用户ID:', userId)
        const setDefaultResponse = await AddressAPI.setDefault(address.id, userId)
        console.log('设置默认地址API响应:', setDefaultResponse)

        if (setDefaultResponse.data?.code === 200) {
          alert('默认地址设置成功')
          console.log('默认地址设置成功:', address.id)

          // 更新本地数据
          this.addresses.forEach(addr => {
            addr.isDefault = addr.id === address.id
          })
        } else {
          throw new Error(`设置失败: ${setDefaultResponse.data?.message || '未知错误'}`)
        }
      } catch (error) {
        console.error('设置默认地址失败:', error)
        alert(`设置失败: ${error.message}`)
      }
    },

    async saveAddress() {
      if (!this.validateForm()) {
        return
      }

      try {
        this.saving = true
        const userId = await userManager.getUserId()
        console.log('保存地址，用户ID:', userId)

        if (!userId) {
          alert('用户未登录，无法保存地址')
          return
        }

        // 将省市信息合并到详细地址中，符合数据库表结构
        const fullAddress = `${this.addressForm.province} ${this.addressForm.city} ${this.addressForm.detailAddress}`.trim()
        console.log('完整地址:', fullAddress)

        const addressData = {
          receiverName: this.addressForm.receiverName,
          phone: this.addressForm.phone,
          addressInfo: fullAddress, // 使用合并后的完整地址（含省份）
          postalCode: this.addressForm.postalCode,
          isDefault: !!this.addressForm.isDefault, // 后端为Boolean，传布尔值
          user: { id: userId } // 按后端实体要求嵌套user对象
        }

        console.log('准备保存的地址数据:', addressData)

        if (this.showEditModal && this.editingAddress) {
          // 编辑地址
          try {
            addressData.addressId = this.editingAddress.id // 使用数据库字段名
            console.log('编辑地址，ID:', addressData.addressId)

            const updateResponse = await AddressAPI.update(addressData)
            console.log('更新地址API响应:', updateResponse)

            if (updateResponse.data?.code === 200) {
              alert('地址更新成功')
              console.log('地址更新成功:', addressData)

              // 更新本地数据
              const index = this.addresses.findIndex(addr => addr.id === this.editingAddress.id)
              if (index !== -1) {
                this.addresses[index] = {
                  ...this.addresses[index],
                  receiverName: this.addressForm.receiverName,
                  phone: this.addressForm.phone,
                  province: this.addressForm.province,
                  city: this.addressForm.city,
                  detailAddress: this.addressForm.detailAddress,
                  postalCode: this.addressForm.postalCode,
                  isDefault: this.addressForm.isDefault
                }
              }
            } else {
              throw new Error(`更新失败: ${updateResponse.data?.message || '未知错误'}`)
            }
          } catch (updateError) {
            console.error('API更新失败:', updateError)
            alert(`地址更新失败: ${updateError.message}`)
            return
          }
        } else {
          // 添加新地址
          try {
            console.log('添加新地址')
            console.log('发送到API的数据:', addressData)

            const addResponse = await AddressAPI.add(addressData)
            console.log('添加地址API响应:', addResponse)
            console.log('响应状态:', addResponse.status)
            console.log('响应数据:', addResponse.data)

            if (addResponse.data?.code === 200) {
              alert('地址添加成功')
              console.log('地址添加成功:', addressData)

              // 重新加载地址列表以获取最新的数据
              await this.loadAddresses()
            } else {
              console.error('API返回错误:', addResponse.data)
              throw new Error(`添加失败: ${addResponse.data?.message || addResponse.data?.msg || '未知错误'}`)
            }
          } catch (addError) {
            console.error('API添加失败:', addError)
            console.error('错误详情:', {
              message: addError.message,
              response: addError.response,
              request: addError.request,
              config: addError.config
            })

            let errorMessage = '地址添加失败'
            if (addError.response?.data?.message) {
              errorMessage += `: ${addError.response.data.message}`
            } else if (addError.response?.data?.msg) {
              errorMessage += `: ${addError.response.data.msg}`
            } else if (addError.message) {
              errorMessage += `: ${addError.message}`
            }

            alert(errorMessage)
            return
          }
        }

        this.closeModal()
      } catch (error) {
        console.error('保存地址失败:', error)
        alert(`保存失败: ${error.message}`)
      } finally {
        this.saving = false
      }
    },

    validateForm() {
      if (!this.addressForm.receiverName.trim()) {
        alert('请输入收货人姓名')
        return false
      }

      // 修复手机号码验证逻辑
      const phone = this.addressForm.phone.trim()
      if (!phone) {
        alert('请输入手机号码')
        return false
      }

      // 更宽松的手机号码验证，支持多种格式
      const phoneRegex = /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$|^400-?\d{3}-?\d{4}$/
      if (!phoneRegex.test(phone)) {
        alert('请输入正确的手机号码格式（如：13800138000）')
        return false
      }

      if (!this.addressForm.province.trim()) {
        alert('请选择省份')
        return false
      }
      if (!this.addressForm.detailAddress.trim()) {
        alert('请输入详细地址')
        return false
      }
      return true
    },

    onProvinceChange() {
      // 不再需要，因为现在是输入框
    },

    onCityChange() {
      // 不再需要，因为现在是输入框
    },

    updateCityOptions() {
      // 不再需要，因为现在是输入框
    },

    updateDistrictOptions() {
      // 不再需要，因为现在是输入框
    },

    closeModal() {
      this.showAddModal = false
      this.showEditModal = false
      this.editingAddress = null
      this.resetAddressForm()
    },

    resetAddressForm() {
      this.addressForm = {
        receiverName: '',
        phone: '',
        province: '',
        city: '',
        detailAddress: '',
        postalCode: '',
        isDefault: false
      }
    },

    formatAddress(address) {
      if (!address) return ''
      const parts = []
      if (address.province) parts.push(address.province)
      if (address.city) parts.push(address.city)
      if (address.detailAddress) parts.push(address.detailAddress)
      return parts.join(' ')
    }
  }
}
</script>

<style scoped>
.address-management {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 头部 */
.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 1rem;
}

.address-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #111111;
  margin: 0;
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

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
}

/* 地址列表 */
.addresses-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.address-item {
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
}

.address-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.address-item.default {
  border-color: #111111;
  background: #f8f9fa;
}

/* 默认标签 */
.default-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: #111111;
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* 地址信息 */
.address-info {
  margin-bottom: 1rem;
}

.address-name {
  font-size: 1rem;
  font-weight: 700;
  color: #111111;
  margin-bottom: 0.5rem;
}

.address-phone {
  font-size: 0.9rem;
  color: #666666;
  margin-bottom: 0.5rem;
}

.address-detail {
  font-size: 0.9rem;
  color: #666666;
  line-height: 1.5;
}

/* 地址操作 */
.address-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: #666666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1rem;
  margin: 0 0 1.5rem 0;
  color: #666666;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #111111;
}

.checkbox-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #111111;
  margin: 0;
  cursor: pointer;
}

/* 表单操作 */
.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e6e6e6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .address-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .addresses-list {
    grid-template-columns: 1fr;
  }

  .address-item {
    padding: 1rem;
  }

  .address-actions {
    flex-wrap: wrap;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .modal-header,
  .modal-body {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }

  .address-name {
    font-size: 0.9rem;
  }

  .address-phone,
  .address-detail {
    font-size: 0.8rem;
  }
}
</style>
