<template>
    <div class="order-confirmation-container">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="breadcrumb">
                <router-link to="/home" class="breadcrumb-item">首页</router-link>
                <span class="breadcrumb-separator">/</span>
                <router-link to="/products" class="breadcrumb-item">产品列表</router-link>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-current">订单确认</span>
            </div>
            <h1 class="page-title">
                <span class="icon">🛒</span>
                订单确认
            </h1>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>正在加载订单信息...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-container">
            <div class="error-icon">❌</div>
            <h3>加载失败</h3>
            <p>{{ error }}</p>
            <button @click="loadOrderData" class="retry-btn">重试</button>
        </div>

        <!-- 订单确认内容 -->
        <div v-else class="order-content">
            <!-- 商品列表 -->
            <div class="products-section">
                <h2 class="section-title">商品清单</h2>
                <div class="products-grid">
                    <div 
                        v-for="product in products" 
                        :key="product.shoeId" 
                        class="product-card"
                    >
                        <!-- 商品图片 -->
                        <div class="product-image-container">
                            <div v-if="product.images && product.images.length > 0" class="product-images">
                                <img 
                                    :src="`/api/shoeImg/getImage/${product.images[0].imagePath}`"
                                    :alt="product.name" 
                                    class="product-image"
                                >
                            </div>
                            <div v-else class="no-image">
                                📷
                            </div>
                        </div>

                        <!-- 商品信息 -->
                        <div class="product-info">
                            <h4 class="product-name">{{ product.name }}</h4>
                            <p class="product-serial">{{ product.serialNumber }}</p>
                            
                            <div class="product-details">
                                <span class="brand-tag">{{ product.brand?.brandName || 'N/A' }}</span>
                                <span class="type-tag">{{ product.shoesType?.typeName || 'N/A' }}</span>
                                <span class="color-tag">{{ product.color?.colorName || 'N/A' }}</span>
                            </div>

                            <div class="price-section">
                                <span v-if="product.discountPrice && product.discountPrice < product.price" class="current-price">¥{{ product.discountPrice }}</span>
                                <span v-else class="current-price">¥{{ product.price }}</span>
                                <span v-if="product.discountPrice && product.discountPrice < product.price" class="discount-price">¥{{ product.price }}</span>
                            </div>

                            <div class="product-meta">
                                <span class="sales-info">销量: {{ product.salesVolume || 0 }}</span>
                                <span class="points-info">积分: {{ product.points || 0 }}</span>
                            </div>

                            <!-- 尺码和数量选择 -->
                            <div class="size-quantity-section">
                                <div class="size-selection">
                                    <label class="size-label">选择尺码:</label>
                                    <div class="size-options">
                                        <button 
                                            v-for="size in availableSizes" 
                                            :key="size.sizeId"
                                            @click="selectSize(product.shoeId, size.sizeId)"
                                            class="size-option"
                                            :class="{ 'active': selectedSizes[product.shoeId] === size.sizeId }"
                                        >
                                            {{ size.size }}
                                        </button>
                                    </div>
                                </div>

                                <div class="quantity-selection">
                                    <label class="quantity-label">购买数量:</label>
                                    <div class="quantity-controls">
                                        <button 
                                            @click="decreaseQuantity(product.shoeId)" 
                                            class="quantity-btn"
                                            :disabled="productQuantities[product.shoeId] <= 1"
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="number" 
                                            v-model.number="productQuantities[product.shoeId]" 
                                            min="1" 
                                            class="quantity-input"
                                            @change="updateQuantity(product.shoeId)"
                                        >
                                        <button 
                                            @click="increaseQuantity(product.shoeId)" 
                                            class="quantity-btn"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 订单摘要 -->
            <div class="order-summary-section">
                <h2 class="section-title">订单摘要</h2>
                <div class="summary-content">
                    <div class="summary-item">
                        <span class="label">商品总数:</span>
                        <span class="value">{{ totalItems }} 件</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">商品总价:</span>
                        <span class="value price">¥{{ totalPrice.toFixed(2) }}</span>
                    </div>
                    <div class="summary-item">
                        <span class="label">运费:</span>
                        <span class="value">¥{{ shippingFee.toFixed(2) }}</span>
                    </div>
                    <div class="summary-item total">
                        <span class="label">订单总额:</span>
                        <span class="value price">¥{{ orderTotal.toFixed(2) }}</span>
                    </div>
                </div>
            </div>

            <!-- 收货地址 -->
            <div class="address-section">
                <h2 class="section-title">收货地址</h2>
                <div class="address-content">
                    <div v-if="selectedAddress" class="selected-address">
                        <div class="address-info">
                            <h4>{{ selectedAddress.receiverName }}</h4>
                            <p>{{ selectedAddress.phone }}</p>
                            <p>{{ selectedAddress.addressInfo }}</p>
                            <p v-if="selectedAddress.postalCode">邮编: {{ selectedAddress.postalCode }}</p>
                            <span v-if="selectedAddress.isDefault" class="default-badge">默认地址</span>
                        </div>
                        <button @click="changeAddress" class="change-address-btn">更换地址</button>
                    </div>
                    <div v-else class="no-address">
                        <p>请选择收货地址</p>
                        <button @click="selectAddress" class="select-address-btn">选择地址</button>
                    </div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
                <button @click="goBack" class="back-btn">返回商品列表</button>
                <button @click="submitOrder" class="submit-order-btn" :disabled="!canSubmitOrder">
                    提交订单
                </button>
            </div>
        </div>

        <!-- 地址选择模态框 -->
        <div v-if="showAddressModal" class="modal-overlay" @click="closeAddressModal">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>选择收货地址</h3>
                    <button @click="closeAddressModal" class="close-btn">✕</button>
                </div>
                <div class="modal-body">
                    <div class="address-actions-header">
                        <button @click="showAddAddressForm" class="add-address-btn">+ 添加新地址</button>
                    </div>
                    
                    <div v-if="addresses.length === 0" class="no-addresses">
                        <p>暂无收货地址</p>
                        <button @click="showAddAddressForm" class="add-address-btn">添加新地址</button>
                    </div>
                    <div v-else class="address-list">
                        <div 
                            v-for="address in addresses" 
                            :key="address.addressId"
                            class="address-item"
                            :class="{ 'selected': selectedAddress?.addressId === address.addressId }"
                            @click="selectAddressItem(address)"
                        >
                            <div class="address-details">
                                <div class="address-header">
                                    <h4>{{ address.receiverName }}</h4>
                                    <span v-if="address.isDefault" class="default-badge">默认</span>
                                </div>
                                <p>{{ address.phone }}</p>
                                <p>{{ address.addressInfo }}</p>
                                <p v-if="address.postalCode">邮编: {{ address.postalCode }}</p>
                            </div>
                            <div class="address-actions">
                                <button @click.stop="editAddressItem(address)" class="edit-btn">编辑</button>
                                <button @click.stop="deleteAddress(address.addressId)" class="delete-btn">删除</button>
                                <button 
                                    v-if="!address.isDefault" 
                                    @click.stop="setDefaultAddress(address.addressId)" 
                                    class="set-default-btn"
                                >
                                    设为默认
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 添加/编辑地址模态框 -->
        <div v-if="showAddressForm" class="modal-overlay" @click="closeAddressForm">
            <div class="modal-content address-form-modal" @click.stop>
                <div class="modal-header">
                    <h3>{{ isEditingAddress ? '编辑地址' : '添加新地址' }}</h3>
                    <button @click="closeAddressForm" class="close-btn">✕</button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="saveAddress" class="address-form">
                        <div class="form-group">
                            <label for="receiverName">收货人姓名 *</label>
                            <input 
                                type="text" 
                                id="receiverName" 
                                v-model="addressForm.receiverName" 
                                required
                                class="form-input"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="phone">手机号码 *</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                v-model="addressForm.phone" 
                                required
                                class="form-input"
                                pattern="[0-9]{11}"
                            >
                        </div>
                        
                        <div class="form-group">
                            <label for="addressInfo">详细地址 *</label>
                            <textarea 
                                id="addressInfo" 
                                v-model="addressForm.addressInfo" 
                                required
                                class="form-textarea"
                                rows="3"
                                placeholder="请输入省市区街道门牌号等详细地址信息"
                            ></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="postalCode">邮政编码</label>
                            <input 
                                type="text" 
                                id="postalCode" 
                                v-model="addressForm.postalCode" 
                                class="form-input"
                                placeholder="请输入6位数字邮政编码"
                                maxlength="6"
                                @input="formatPostalCode"
                                @blur="validatePostalCode"
                            >
                            <span v-if="postalCodeError" class="error-message">{{ postalCodeError }}</span>
                            <span v-else-if="addressForm.postalCode && !postalCodeError" class="success-message">✓ 格式正确</span>
                        </div>
                        
                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    v-model="addressForm.isDefault"
                                    class="checkbox-input"
                                >
                                <span class="checkbox-text">设为默认地址</span>
                            </label>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" @click="closeAddressForm" class="cancel-btn">取消</button>
                            <button type="submit" class="save-btn">保存地址</button>
                        </div>
                    </form>
                </div>
            </div>
                 </div>
     </div>

     <!-- 支付弹窗 -->
     <div v-if="showPaymentModal" class="modal-overlay payment-modal-overlay">
         <div class="modal-content payment-modal-content" @click.stop>
             <div class="modal-header payment-header">
                 <h3>💳 确认支付</h3>
                 <div class="countdown-timer">
                     <span class="countdown-label">支付倒计时:</span>
                     <span class="countdown-value" :class="{ 'warning': paymentCountdown <= 3 }">{{ paymentCountdown }}s</span>
                 </div>
             </div>
             
             <div class="modal-body payment-body">
                 <!-- 订单摘要 -->
                 <div class="payment-order-summary">
                     <h4>订单信息</h4>
                     <div class="order-items">
                         <div v-for="product in products" :key="product.shoeId" class="order-item">
                             <div class="item-image">
                                 <img v-if="product.images && product.images.length > 0" 
                                      :src="`/api/shoeImg/getImage/${product.images[0].imagePath}`" 
                                      :alt="product.name">
                                 <div v-else class="no-image">📷</div>
                             </div>
                             <div class="item-details">
                                 <h5>{{ product.name }}</h5>
                                 <p class="item-size">尺码: {{ getSizeName(selectedSizes[product.shoeId]) }}</p>
                                 <p class="item-quantity">数量: {{ productQuantities[product.shoeId] }} 件</p>
                                 <p class="item-price">单价: ¥{{ getProductPrice(product) }}</p>
                             </div>
                             <div class="item-total">
                                 ¥{{ (getProductPrice(product) * productQuantities[product.shoeId]).toFixed(2) }}
                             </div>
                         </div>
                     </div>
                     
                     <div class="payment-total">
                         <div class="total-row">
                             <span>商品总价:</span>
                             <span>¥{{ totalPrice.toFixed(2) }}</span>
                         </div>
                         <div class="total-row">
                             <span>运费:</span>
                             <span>¥{{ shippingFee.toFixed(2) }}</span>
                         </div>
                         <div class="total-row final-total">
                             <span>支付总额:</span>
                             <span>¥{{ orderTotal.toFixed(2) }}</span>
                         </div>
                     </div>
                 </div>
                 
                 <!-- 收货地址 -->
                 <div class="payment-address">
                     <h4>收货地址</h4>
                     <div class="address-display">
                         <p><strong>{{ selectedAddress?.receiverName }}</strong></p>
                         <p>{{ selectedAddress?.phone }}</p>
                         <p>{{ selectedAddress?.addressInfo }}</p>
                         <p v-if="selectedAddress?.postalCode">邮编: {{ selectedAddress.postalCode }}</p>
                     </div>
                 </div>
             </div>
             
             <div class="modal-footer payment-footer">
                 <button @click="cancelPayment" class="cancel-payment-btn">取消支付</button>
                 <button @click="confirmPayment" class="confirm-payment-btn" :disabled="isProcessingPayment">
                     <span v-if="isProcessingPayment">处理中...</span>
                     <span v-else>确认支付 ¥{{ orderTotal.toFixed(2) }}</span>
                 </button>
             </div>
         </div>
     </div>
      
      <!-- 订单详情弹窗 -->
      <div v-if="showOrderDetailsModal" class="modal-overlay" @click="closeOrderDetailsModal">
          <div class="modal-content" @click.stop>
              <div class="modal-header">
                  <h3>订单详情</h3>
                  <button class="close-btn" @click="closeOrderDetailsModal">✕</button>
              </div>
              <div class="modal-body" v-if="orderDetails">
                  <div class="order-meta" style="margin-bottom: 16px;">
                      <p><strong>订单编号:</strong> {{ orderDetails.orderNumber }}</p>
                      <p><strong>创建时间:</strong> {{ formatDateTime(orderDetails.createdAt) }}</p>
                      <p><strong>订单状态:</strong> 已支付</p>
                  </div>
                  <div class="address-display" style="margin-bottom: 16px;">
                      <h4>收货地址</h4>
                      <p><strong>{{ orderDetails.address?.receiverName }}</strong></p>
                      <p>{{ orderDetails.address?.phone }}</p>
                      <p>{{ orderDetails.address?.addressInfo }}</p>
                      <p v-if="orderDetails.address?.postalCode">邮编: {{ orderDetails.address.postalCode }}</p>
                  </div>
                  <div class="payment-order-summary">
                      <h4>商品清单</h4>
                      <div class="order-items">
                          <div class="order-item" v-for="item in orderDetails.items" :key="item.shoeId + '-' + item.sizeId">
                              <div class="item-image">
                                  <img v-if="item.image" :src="`/api/shoeImg/getImage/${item.image}`" alt="product" />
                                  <div v-else class="no-image">📷</div>
                              </div>
                              <div class="item-details">
                                  <h5>{{ item.name }}</h5>
                                  <p>尺码: {{ item.sizeName }}</p>
                                  <p>数量: {{ item.quantity }}</p>
                                  <p>单价: ¥{{ item.unitPrice }}</p>
                              </div>
                              <div class="item-total">¥{{ item.subtotal.toFixed(2) }}</div>
                          </div>
                      </div>
                  </div>
                  <div class="payment-total" style="margin-top: 12px;">
                      <div class="total-row">
                          <span>商品总价:</span>
                          <span>¥{{ orderDetails.itemsTotal.toFixed(2) }}</span>
                      </div>
                      <div class="total-row">
                          <span>运费:</span>
                          <span>¥{{ orderDetails.shippingFee.toFixed(2) }}</span>
                      </div>
                      <div class="total-row final-total">
                          <span>订单总额:</span>
                          <span>¥{{ orderDetails.orderTotal.toFixed(2) }}</span>
                      </div>
                  </div>
              </div>
              <div class="payment-footer">
                  <button class="cancel-payment-btn" @click="closeOrderDetailsModal">关闭</button>
                  <button class="confirm-payment-btn" @click="() => { closeOrderDetailsModal(); router.push('/products') }">继续购物</button>
              </div>
          </div>
      </div>
 </template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const error = ref('')
const products = ref([])
const addresses = ref([])
const selectedAddress = ref(null)
const showAddressModal = ref(false)
const showAddressForm = ref(false)
const isEditingAddress = ref(false)

// 支付弹窗相关
const showPaymentModal = ref(false)
const paymentCountdown = ref(10)
const paymentTimer = ref(null)
const isProcessingPayment = ref(false)

// 订单详情弹窗相关
const showOrderDetailsModal = ref(false)
const orderDetails = ref(null)

// 地址表单数据
const addressForm = ref({
    addressId: null,
    receiverName: '',
    phone: '',
    addressInfo: '',
    postalCode: '',
    isDefault: false
})

// 邮政编码验证状态
const postalCodeError = ref('')

// 商品相关数据
const selectedSizes = ref({})
const productQuantities = ref({})
const availableSizes = ref([])

// 计算属性
const totalItems = computed(() => {
    return Object.values(productQuantities.value).reduce((sum, qty) => sum + (qty || 0), 0)
})

const totalPrice = computed(() => {
    return products.value.reduce((sum, product) => {
        const quantity = productQuantities.value[product.shoeId] || 0
        // 如果有折扣价且折扣价更低，使用折扣价；否则使用原价
        const price = (product.discountPrice && product.discountPrice < product.price) ? product.discountPrice : product.price
        return sum + (price * quantity)
    }, 0)
})

const shippingFee = computed(() => {
    return totalPrice.value > 99 ? 0 : 10
})

const orderTotal = computed(() => {
    return totalPrice.value + shippingFee.value
})

const canSubmitOrder = computed(() => {
    return selectedAddress.value && 
           Object.keys(selectedSizes.value).length > 0 && 
           totalItems.value > 0
})

// 获取商品数据
const loadOrderData = async () => {
    loading.value = true
    error.value = ''
    
    try {
        // 检查是否有从产品详情页传递过来的商品信息
        const { productId, sizeId, quantity } = route.query
        
        if (productId && sizeId && quantity) {
            // 从产品详情页跳转过来，只加载选中的商品
            const productResponse = await axios.post('/api/shoe/getById', 
                `shoeId=${productId}`,
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            )

            if (productResponse.data && productResponse.data.code === 200 && productResponse.data.data) {
                const productData = productResponse.data.data
                
                // 获取商品图片
                try {
                    const imageResponse = await axios.get(`/api/shoeImg/list/${productId}`)
                    if (imageResponse.data && imageResponse.data.data) {
                        productData.images = imageResponse.data.data
                    } else {
                        productData.images = []
                    }
                } catch (imgError) {
                    productData.images = []
                }

                products.value = [productData]
                
                // 设置选中的尺码和数量
                selectedSizes.value[productId] = parseInt(sizeId)
                productQuantities.value[productId] = parseInt(quantity)
            }
        } else {
            // 直接访问订单确认页面，加载所有商品
            const productResponse = await axios.post('/api/shoe/getAll', {}, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })

            if (productResponse.data && productResponse.data.data) {
                const productList = productResponse.data.data

                // 获取每个商品的图片
                for (let product of productList) {
                    try {
                        const imageResponse = await axios.get(`/api/shoeImg/list/${product.shoeId}`)
                        if (imageResponse.data && imageResponse.data.data) {
                            product.images = imageResponse.data.data
                        } else {
                            product.images = []
                        }
                    } catch (imgError) {
                        product.images = []
                    }

                    // 初始化商品数量
                    productQuantities.value[product.shoeId] = 1
                }

                products.value = productList
            }
        }

        // 获取尺码数据
        const sizeResponse = await axios.post('/api/shoesSize/getAll', {}, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        if (sizeResponse.data && sizeResponse.data.data) {
            // 先获取所有启用的尺码
            const allSizes = sizeResponse.data.data.filter(size => !size.sizeDisabled)
            
            // 如果是从产品详情页跳转过来，尝试获取该商品实际可用的尺码
            if (productId && sizeId && quantity) {
                try {
                    // 使用正确的接口获取商品的库存信息
                    const inventoryResponse = await axios.get(`/api/inventory/getInventoryByShoeId/${productId}`)
                    
                    if (inventoryResponse.data && inventoryResponse.data.code === 200 && inventoryResponse.data.data) {
                        const inventoryData = inventoryResponse.data.data
                        
                        // 根据库存数据过滤尺码
                        if (inventoryData.sizeInventories && inventoryData.sizeInventories.length > 0) {
                            // 过滤出有库存的尺码
                            const availableSizeIds = inventoryData.sizeInventories
                                .filter(inv => inv.inventoryNumber > 0)
                                .map(inv => inv.sizeId)
                            
                            availableSizes.value = allSizes.filter(size => availableSizeIds.includes(size.sizeId))
                            
                            // 如果没有找到有库存的尺码，显示所有尺码
                            if (availableSizes.value.length === 0) {
                                availableSizes.value = allSizes
                            }
                        } else {
                            // 如果库存数据结构不完整，显示所有尺码
                            availableSizes.value = allSizes
                        }
                    } else {
                        // 如果无法获取库存信息，显示所有尺码
                        availableSizes.value = allSizes
                    }
                } catch (inventoryError) {
                    console.warn('无法获取商品库存信息，显示所有可用尺码:', inventoryError)
                    availableSizes.value = allSizes
                }
            } else {
                // 直接访问订单确认页面，显示所有可用尺码
                availableSizes.value = allSizes
            }
        }

        // 获取地址数据
        await loadAddresses()

    } catch (err) {
        console.error('加载订单数据失败:', err)
        error.value = '加载订单数据失败，请重试。'
    } finally {
        loading.value = false
    }
}

// 加载地址数据
const loadAddresses = async () => {
    try {
        // 使用AddressController的list接口，需要传递userId
        const userId = 1 // 这里应该从用户登录状态获取
        const response = await axios.get(`/api/address/list?userId=${userId}`)
        
        if (response.data && response.data.code === 200 && response.data.data) {
            addresses.value = response.data.data
            // 默认选择第一个地址或默认地址
            if (addresses.value.length > 0) {
                const defaultAddress = addresses.value.find(addr => addr.isDefault)
                selectedAddress.value = defaultAddress || addresses.value[0]
            }
        }
    } catch (err) {
        console.error('加载地址数据失败:', err)
        // 如果接口不存在，尝试使用getAll接口
        try {
            const response = await axios.post('/api/address/getAll', {}, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            if (response.data && response.data.data) {
                addresses.value = response.data.data
                if (addresses.value.length > 0) {
                    const defaultAddress = addresses.value.find(addr => addr.isDefault)
                    selectedAddress.value = defaultAddress || addresses.value[0]
                }
            }
        } catch (fallbackErr) {
            console.error('备用地址接口也失败:', fallbackErr)
        }
    }
}

// 尺码选择
const selectSize = (productId, sizeId) => {
    selectedSizes.value[productId] = sizeId
}

// 数量控制
const increaseQuantity = (productId) => {
    productQuantities.value[productId] = (productQuantities.value[productId] || 1) + 1
}

const decreaseQuantity = (productId) => {
    if (productQuantities.value[productId] > 1) {
        productQuantities.value[productId]--
    }
}

const updateQuantity = (productId) => {
    if (productQuantities.value[productId] < 1) {
        productQuantities.value[productId] = 1
    }
}

// 地址相关操作
const changeAddress = () => {
    showAddressModal.value = true
}

const selectAddress = () => {
    showAddressModal.value = true
}

const closeAddressModal = () => {
    showAddressModal.value = false
}

const selectAddressItem = (address) => {
    selectedAddress.value = address
    showAddressModal.value = false
}

// 显示添加地址表单
const showAddAddressForm = () => {
    isEditingAddress.value = false
    resetAddressForm()
    showAddressForm.value = true
}

// 编辑地址
const editAddressItem = (address) => {
    isEditingAddress.value = true
    addressForm.value = {
        addressId: address.addressId,
        receiverName: address.receiverName,
        phone: address.phone,
        addressInfo: address.addressInfo,
        postalCode: address.postalCode || '',
        isDefault: address.isDefault || false
    }
    showAddressForm.value = true
}

// 重置地址表单
const resetAddressForm = () => {
    addressForm.value = {
        addressId: null,
        receiverName: '',
        phone: '',
        addressInfo: '',
        postalCode: '',
        isDefault: false
    }
    postalCodeError.value = '' // 重置邮政编码错误
}

// 格式化邮政编码输入
const formatPostalCode = (event) => {
    let value = event.target.value
    // 只允许输入数字
    value = value.replace(/[^0-9]/g, '')
    // 限制长度为6位
    if (value.length > 6) {
        value = value.slice(0, 6)
    }
    addressForm.value.postalCode = value
    // 清除错误信息
    if (postalCodeError.value) {
        postalCodeError.value = ''
    }
}

// 验证邮政编码格式
const validatePostalCode = () => {
    const postalCode = addressForm.value.postalCode
    if (!postalCode) {
        postalCodeError.value = '' // 空值不显示错误
        return true
    }
    
    if (postalCode.length !== 6) {
        postalCodeError.value = '邮政编码必须是6位数字'
        return false
    }
    
    if (!/^[0-9]{6}$/.test(postalCode)) {
        postalCodeError.value = '邮政编码只能包含数字'
        return false
    }
    
    postalCodeError.value = ''
    return true
}

// 关闭地址表单
const closeAddressForm = () => {
    showAddressForm.value = false
    resetAddressForm()
}

// 保存地址
const saveAddress = async () => {
    // 验证邮政编码格式
    if (addressForm.value.postalCode && !validatePostalCode()) {
        return // 如果验证失败，不继续执行
    }
    
    try {
        const userId = 1 // 这里应该从用户登录状态获取
        const addressData = {
            ...addressForm.value,
            user: { id: userId }
        }

        let response
        if (isEditingAddress.value) {
            // 更新地址
            response = await axios.post('/api/address/update', addressData)
        } else {
            // 添加地址
            response = await axios.post('/api/address/add', addressData)
        }

        if (response.data && response.data.code === 200) {
            alert(isEditingAddress.value ? '地址更新成功' : '地址添加成功')
            closeAddressForm()
            await loadAddresses() // 重新加载地址列表
        } else {
            alert(response.data?.message || '操作失败')
        }
    } catch (err) {
        console.error('保存地址失败:', err)
        alert('保存地址失败，请重试')
    }
}

// 删除地址
const deleteAddress = async (addressId) => {
    if (confirm('确定要删除这个地址吗？')) {
        try {
            const response = await axios.post('/api/address/delete', null, {
                params: { addressId }
            })
            
            if (response.data && response.data.code === 200) {
                alert('地址删除成功')
                await loadAddresses()
                // 如果删除的是当前选中的地址，清空选择
                if (selectedAddress.value?.addressId === addressId) {
                    selectedAddress.value = addresses.value.length > 0 ? addresses.value[0] : null
                }
            } else {
                alert(response.data?.message || '删除失败')
            }
        } catch (err) {
            console.error('删除地址失败:', err)
            alert('删除地址失败，请重试')
        }
    }
}

// 设置默认地址
const setDefaultAddress = async (addressId) => {
    try {
        const userId = 1 // 这里应该从用户登录状态获取
        const response = await axios.post('/api/address/setDefault', null, {
            params: { addressId, userId }
        })
        
        if (response.data && response.data.code === 200) {
            alert('默认地址设置成功')
            await loadAddresses()
        } else {
            alert(response.data?.message || '设置失败')
        }
    } catch (err) {
        console.error('设置默认地址失败:', err)
        alert('设置默认地址失败，请重试')
    }
}

// 提交订单 - 显示支付弹窗
const submitOrder = () => {
    if (!canSubmitOrder.value) {
        alert('请完善订单信息')
        return
    }
    
    // 显示支付弹窗
    showPaymentModal.value = true
    startPaymentCountdown()
}

// 开始支付倒计时
const startPaymentCountdown = () => {
    paymentCountdown.value = 10
    paymentTimer.value = setInterval(() => {
        paymentCountdown.value--
        if (paymentCountdown.value <= 0) {
            clearInterval(paymentTimer.value)
            paymentTimeout()
        }
    }, 1000)
}

// 支付超时处理
const paymentTimeout = () => {
    showPaymentModal.value = false
    alert('支付超时，请重新提交订单')
    // 可以在这里添加其他超时处理逻辑
}

// 取消支付
const cancelPayment = () => {
    clearInterval(paymentTimer.value)
    showPaymentModal.value = false
}

// 确认支付
const confirmPayment = async () => {
    if (isProcessingPayment.value) return
    
    isProcessingPayment.value = true
    
    try {
        // 首先检查库存是否充足
        const inventoryCheckPromises = products.value.map(async (product) => {
            const quantity = productQuantities.value[product.shoeId] || 0
            const sizeId = selectedSizes.value[product.shoeId]
            
            if (quantity > 0 && sizeId) {
                try {
                    const response = await axios.get('/api/inventory/checkInventorySufficient', {
                        params: {
                            shoeId: product.shoeId,
                            sizeId: sizeId,
                            quantity: quantity
                        }
                    })
                    return response.data && response.data.code === 200 && response.data.data
                } catch (err) {
                    console.error('检查库存失败:', err)
                    return false
                }
            }
            return true
        })

        const inventoryResults = await Promise.all(inventoryCheckPromises)
        const allInventorySufficient = inventoryResults.every(result => result === true)

        if (!allInventorySufficient) {
            alert('部分商品库存不足，请调整购买数量')
            isProcessingPayment.value = false
            return
        }

        // 先创建订单（按商品逐个创建），使用同一订单号
        const masterOrderNumber = generateOrderNumber()
        const createOrderPromises = products.value.map(async (product) => {
            const quantity = productQuantities.value[product.shoeId] || 0
            const sizeId = selectedSizes.value[product.shoeId]
            if (quantity > 0 && sizeId) {
                try {
                    const orderPayload = {
                        userId: 1,
                        sizeId: sizeId,
                        orderNumber: masterOrderNumber,
                        status: '1',
                        addressId: selectedAddress.value.addressId,
                        shippingFee: shippingFee.value / Math.max(products.value.length, 1),
                        createdAt: formatDate(new Date()),
                        updatedAt: formatDate(new Date()),
                        deliveryTime: formatDate(addDays(new Date(), 3))
                    }
                    const res = await axios.post('/api/order/insertOrder', orderPayload)
                    return res.data && res.data.code === 200 && res.data.data === true
                } catch (e) {
                    console.error('创建订单失败:', e)
                    return false
                }
            }
            return true
        })

        const createOrderResults = await Promise.all(createOrderPromises)
        const allOrdersCreated = createOrderResults.every(v => v === true)
        if (!allOrdersCreated) {
            alert('创建订单失败，请重试或联系客服')
            isProcessingPayment.value = false
            return
        }

        // 拉取刚创建的订单（通过订单号匹配）
        let createdOrders = []
        try {
            const fetchRes = await axios.post('/api/order/getAll')
            if (fetchRes.data && fetchRes.data.code === 200 && Array.isArray(fetchRes.data.data)) {
                createdOrders = fetchRes.data.data.filter(o => o.orderNumber === masterOrderNumber)
            }
        } catch (e) {
            console.error('查询订单失败:', e)
        }

        // 为每个订单插入鞋数量记录（需要携带 shoeId 与 shoeNum）
        if (createdOrders && createdOrders.length > 0) {
            const sizeIdToItemQueue = {}
            for (const p of products.value) {
                const sId = selectedSizes.value[p.shoeId]
                const qty = productQuantities.value[p.shoeId] || 0
                if (!sId || qty <= 0) continue
                if (!sizeIdToItemQueue[sId]) sizeIdToItemQueue[sId] = []
                sizeIdToItemQueue[sId].push({ shoeId: p.shoeId, qty })
            }

            const shoeNumPromises = createdOrders.map(async (ord) => {
                const list = sizeIdToItemQueue[ord.sizeId] || []
                const item = list.length > 0 ? list.shift() : null
                if (!item) return false
                try {
                    const res = await axios.post('/api/orderShoeNum/insertOrderShoeNum', {
                        orderId: ord.orderId,
                        shoeId: item.shoeId,
                        shoeNum: item.qty
                    })
                    return res.data && res.data.code === 200
                } catch (e) {
                    console.error('创建订单商品数量失败:', e)
                    return false
                }
            })
            await Promise.all(shoeNumPromises)
        }

        // 扣减库存
        const inventoryDecreasePromises = products.value.map(async (product) => {
            const quantity = productQuantities.value[product.shoeId] || 0
            const sizeId = selectedSizes.value[product.shoeId]
            if (quantity > 0 && sizeId) {
                try {
                    await axios.post('/api/inventory/decreaseInventory', null, {
                        params: {
                            shoeId: product.shoeId,
                            sizeId: sizeId,
                            quantity: quantity
                        }
                    })
                    return true
                } catch (err) {
                    console.error('减少库存失败:', err)
                    return false
                }
            }
            return true
        })

        const inventoryDecreaseResults = await Promise.all(inventoryDecreasePromises)
        const allInventoryDecreased = inventoryDecreaseResults.every(result => result === true)

        if (allInventoryDecreased) {
            // 展示订单详情（使用同一订单号汇总）
            const items = products.value
                .filter(p => (productQuantities.value[p.shoeId] || 0) > 0 && selectedSizes.value[p.shoeId])
                .map(p => {
                    const sizeId = selectedSizes.value[p.shoeId]
                    const sizeName = getSizeName(sizeId)
                    const quantity = productQuantities.value[p.shoeId]
                    const unitPrice = getProductPrice(p)
                    const subtotal = Number((unitPrice * quantity).toFixed(2))
                    return {
                        shoeId: p.shoeId,
                        name: p.name,
                        image: p.images && p.images.length > 0 ? p.images[0].imagePath : null,
                        sizeId,
                        sizeName,
                        quantity,
                        unitPrice,
                        subtotal
                    }
                })

            orderDetails.value = {
                orderNumber: masterOrderNumber,
                createdAt: createdOrders && createdOrders.length > 0 ? createdOrders[0].createdAt : new Date(),
                status: '1',
                userId: 1,
                address: selectedAddress.value ? { ...selectedAddress.value } : null,
                items,
                itemsTotal: Number(totalPrice.value.toFixed(2)),
                shippingFee: Number(shippingFee.value.toFixed(2)),
                orderTotal: Number(orderTotal.value.toFixed(2))
            }

            clearInterval(paymentTimer.value)
            showPaymentModal.value = false
            showPaymentSuccessModal()
        } else {
            alert('库存更新失败，请联系客服处理')
        }

    } catch (err) {
        console.error('支付失败:', err)
        alert('支付失败，请重试')
    } finally {
        isProcessingPayment.value = false
    }
}

// 支付成功弹窗
const showPaymentSuccessModal = () => {
    // 创建支付成功弹窗
    const successModal = document.createElement('div')
    successModal.className = 'modal-overlay payment-success-modal'
    successModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1200;
    `

    successModal.innerHTML = `
        <div class="modal-content payment-success-content" style="
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            text-align: center;
            padding: 40px 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        ">
            <div class="success-icon" style="
                font-size: 4rem;
                color: #28a745;
                margin-bottom: 20px;
            ">✅</div>
            <h3 style="
                color: #333;
                margin: 0 0 15px 0;
                font-size: 1.5rem;
            ">支付成功！</h3>
            <p style="
                color: #666;
                margin: 0 0 25px 0;
                font-size: 1rem;
            ">支付成功，库存已相应减少。</p>
            <div class="success-actions" style="
                display: flex;
                gap: 15px;
                justify-content: center;
            ">
                <button class="view-orders-btn" style="
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 500;
                ">查看订单</button>
                <button class="continue-shopping-btn" style="
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 500;
                ">继续购物</button>
            </div>
        </div>
    `

    document.body.appendChild(successModal)

    // 添加按钮事件
    const viewOrdersBtn = successModal.querySelector('.view-orders-btn')
    const continueShoppingBtn = successModal.querySelector('.continue-shopping-btn')

    viewOrdersBtn.addEventListener('click', () => {
        document.body.removeChild(successModal)
        openOrderDetailsModal()
    })

    continueShoppingBtn.addEventListener('click', () => {
        document.body.removeChild(successModal)
        router.push('/products')
    })

    // 点击背景关闭弹窗
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            document.body.removeChild(successModal)
            router.push('/products')
        }
    })
}

// 打开/关闭订单详情弹窗
const openOrderDetailsModal = () => {
    showOrderDetailsModal.value = true
}
const closeOrderDetailsModal = () => {
    showOrderDetailsModal.value = false
}

// 获取尺码名称
const getSizeName = (sizeId) => {
    const size = availableSizes.value.find(s => s.sizeId === sizeId)
    return size ? size.size : '未知尺码'
}

// 获取商品价格（考虑折扣）
const getProductPrice = (product) => {
    return (product.discountPrice && product.discountPrice < product.price) ? product.discountPrice : product.price
}

// 生成订单号（前端生成）
const generateOrderNumber = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 100000)
    return `ORD${timestamp}${random}`
}

// 格式化日期时间
const formatDateTime = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${y}-${m}-${day} ${hh}:${mm}:${ss}`
}

// 格式化为后端可能映射的 LocalDate 字符串（YYYY-MM-DD）
const formatDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

// 简单增加天数
const addDays = (date, days) => {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

// 返回商品列表
const goBack = () => {
    router.push('/products')
}

// 生命周期钩子
onMounted(() => {
    loadOrderData()
})
</script>

<style scoped>
.order-confirmation-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    background: #f8f9fa;
    min-height: 100vh;
}

.page-header {
    background: white;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 0.9rem;
}

.breadcrumb-item {
    color: #007bff;
    text-decoration: none;
}

.breadcrumb-item:hover {
    text-decoration: underline;
}

.breadcrumb-separator {
    color: #6c757d;
}

.breadcrumb-current {
    color: #495057;
    font-weight: 500;
}

.page-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    font-size: 2rem;
    color: #333;
}

.icon {
    font-size: 2.2rem;
}

.loading-container, .error-container {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-icon {
    font-size: 3rem;
    margin-bottom: 16px;
}

.retry-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 16px;
}

.retry-btn:hover {
    background: #0056b3;
}

.order-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.products-section, .order-summary-section, .address-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
    margin: 0 0 20px 0;
    font-size: 1.5rem;
    color: #333;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 12px;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
}

.product-card {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
}

.product-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
}

.product-image-container {
    height: 200px;
    overflow: hidden;
}

.product-images {
    width: 100%;
    height: 100%;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border: 2px solid #dee2e6;
    font-size: 2rem;
    color: #adb5bd;
}

.product-info {
    padding: 16px;
}

.product-name {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
}

.product-serial {
    color: #6c757d;
    font-size: 0.8rem;
    margin: 0 0 12px 0;
}

.product-details {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
}

.brand-tag, .type-tag, .color-tag {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 500;
    background: rgba(0, 123, 255, 0.1);
    color: #007bff;
}

.price-section {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.current-price {
    font-size: 1.2rem;
    font-weight: 600;
    color: #e74c3c;
}

.discount-price {
    font-size: 1rem;
    font-weight: 600;
    color: #6c757d;
    text-decoration: line-through;
}

.product-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 0.8rem;
    color: #6c757d;
}

.size-quantity-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.size-selection, .quantity-selection {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.size-label, .quantity-label {
    font-weight: 500;
    color: #333;
    font-size: 0.9rem;
}

.size-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.size-option {
    padding: 6px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    background: white;
    color: #495057;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.size-option:hover {
    border-color: #007bff;
    color: #007bff;
}

.size-option.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.quantity-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.quantity-btn {
    width: 32px;
    height: 32px;
    border: 1px solid #dee2e6;
    background: white;
    color: #495057;
    cursor: pointer;
    border-radius: 4px;
    font-size: 1.1rem;
    font-weight: 600;
}

.quantity-btn:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #007bff;
}

.quantity-btn:disabled {
    background: #f8f9fa;
    color: #adb5bd;
    cursor: not-allowed;
}

.quantity-input {
    width: 60px;
    height: 32px;
    text-align: center;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 0.9rem;
}

.quantity-input:focus {
    outline: none;
    border-color: #007bff;
}

.summary-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #e9ecef;
}

.summary-item:last-child {
    border-bottom: none;
}

.summary-item.total {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    border-top: 2px solid #007bff;
    padding-top: 16px;
}

.label {
    color: #6c757d;
}

.value {
    font-weight: 500;
    color: #333;
}

.value.price {
    color: #e74c3c;
    font-weight: 600;
}

.address-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.selected-address {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    border: 2px solid #28a745;
    border-radius: 8px;
    background: rgba(40, 167, 69, 0.05);
}

.address-info h4 {
    margin: 0 0 8px 0;
    color: #333;
}

.address-info p {
    margin: 0 0 4px 0;
    color: #6c757d;
}

.default-badge {
    background: #28a745;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 500;
}

.change-address-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
}

.change-address-btn:hover {
    background: #218838;
}

.no-address {
    text-align: center;
    padding: 32px;
    color: #6c757d;
}

.select-address-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 16px;
}

.select-address-btn:hover {
    background: #0056b3;
}

.action-buttons {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-btn, .submit-order-btn {
    padding: 14px 28px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.back-btn {
    background: #6c757d;
    color: white;
}

.back-btn:hover {
    background: #5a6268;
}

.submit-order-btn {
    background: #28a745;
    color: white;
}

.submit-order-btn:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-2px);
}

.submit-order-btn:disabled {
    background: #adb5bd;
    cursor: not-allowed;
    transform: none;
}

/* 模态框样式 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
}

.address-form-modal {
    max-width: 500px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6c757d;
}

.close-btn:hover {
    color: #333;
}

.modal-body {
    padding: 24px;
}

.address-actions-header {
    margin-bottom: 20px;
    text-align: right;
}

.add-address-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
}

.add-address-btn:hover {
    background: #0056b3;
}

.no-addresses {
    text-align: center;
    padding: 32px;
    color: #6c757d;
}

.address-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.address-item {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.address-item:hover {
    border-color: #007bff;
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.address-item.selected {
    border-color: #28a745;
    background: rgba(40, 167, 69, 0.05);
}

.address-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.address-details h4 {
    margin: 0;
    color: #333;
}

.address-details p {
    margin: 0 0 4px 0;
    color: #6c757d;
}

.address-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.edit-btn, .delete-btn, .set-default-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
}

.edit-btn {
    background: #ffc107;
    color: #212529;
}

.edit-btn:hover {
    background: #e0a800;
}

.delete-btn {
    background: #dc3545;
    color: white;
}

.delete-btn:hover {
    background: #c82333;
}

.set-default-btn {
    background: #17a2b8;
    color: white;
}

.set-default-btn:hover {
    background: #138496;
}

/* 地址表单样式 */
.address-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 500;
    color: #333;
    font-size: 0.9rem;
}

.form-input, .form-textarea {
    padding: 10px 12px;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 0.9rem;
    transition: border-color 0.3s ease;
}

.form-input:focus, .form-textarea:focus {
    outline: none;
    border-color: #007bff;
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.checkbox-group {
    flex-direction: row;
    align-items: center;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.checkbox-input {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.checkbox-text {
    font-size: 0.9rem;
    color: #333;
}

/* 表单验证消息样式 */
.error-message {
    color: #dc3545;
    font-size: 0.8rem;
    margin-top: 4px;
    display: block;
}

.success-message {
    color: #28a745;
    font-size: 0.8rem;
    margin-top: 4px;
    display: block;
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
}

.cancel-btn, .save-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
}

.cancel-btn {
    background: #6c757d;
    color: white;
}

.cancel-btn:hover {
    background: #5a6268;
}

.save-btn {
    background: #28a745;
    color: white;
}

.save-btn:hover {
    background: #218838;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .order-confirmation-container {
        padding: 16px;
    }

    .products-grid {
        grid-template-columns: 1fr;
    }

    .action-buttons {
        flex-direction: column;
    }

    .modal-content {
        width: 95%;
        margin: 20px;
    }

    .form-actions {
        flex-direction: column;
    }

    .address-actions {
        flex-direction: column;
        gap: 6px;
         }
 }

 /* 支付弹窗样式 */
 .payment-modal-overlay {
     z-index: 1100;
 }

 .payment-modal-content {
     max-width: 700px;
     max-height: 90vh;
 }

 .payment-header {
     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
     color: white;
     border-radius: 12px 12px 0 0;
 }

 .payment-header h3 {
     color: white;
     margin: 0;
 }

 .countdown-timer {
     display: flex;
     align-items: center;
     gap: 8px;
     font-size: 0.9rem;
 }

 .countdown-label {
     color: rgba(255, 255, 255, 0.8);
 }

 .countdown-value {
     background: rgba(255, 255, 255, 0.2);
     padding: 4px 8px;
     border-radius: 12px;
     font-weight: 600;
     min-width: 30px;
     text-align: center;
 }

 .countdown-value.warning {
     background: #ff6b6b;
     animation: pulse 1s infinite;
 }

 @keyframes pulse {
     0%, 100% { opacity: 1; }
     50% { opacity: 0.7; }
 }

 .payment-body {
     padding: 24px;
 }

 .payment-order-summary h4,
 .payment-address h4 {
     margin: 0 0 16px 0;
     color: #333;
     font-size: 1.1rem;
     border-bottom: 2px solid #e9ecef;
     padding-bottom: 8px;
 }

 .order-items {
     display: flex;
     flex-direction: column;
     gap: 16px;
     margin-bottom: 20px;
 }

 .order-item {
     display: flex;
     align-items: center;
     gap: 16px;
     padding: 16px;
     border: 1px solid #e9ecef;
     border-radius: 8px;
     background: #f8f9fa;
 }

 .item-image {
     width: 60px;
     height: 60px;
     border-radius: 6px;
     overflow: hidden;
     flex-shrink: 0;
 }

 .item-image img {
     width: 100%;
     height: 100%;
     object-fit: cover;
 }

 .item-image .no-image {
     width: 100%;
     height: 100%;
     display: flex;
     align-items: center;
     justify-content: center;
     background: #dee2e6;
     color: #6c757d;
     font-size: 1.2rem;
 }

 .item-details {
     flex: 1;
     min-width: 0;
 }

 .item-details h5 {
     margin: 0 0 4px 0;
     color: #333;
     font-size: 1rem;
 }

 .item-details p {
     margin: 0 0 2px 0;
     color: #6c757d;
     font-size: 0.85rem;
 }

 .item-total {
     font-weight: 600;
     color: #e74c3c;
     font-size: 1.1rem;
     flex-shrink: 0;
 }

 .payment-total {
     background: #f8f9fa;
     padding: 16px;
     border-radius: 8px;
     border: 1px solid #e9ecef;
 }

 .total-row {
     display: flex;
     justify-content: space-between;
     align-items: center;
     padding: 8px 0;
     border-bottom: 1px solid #e9ecef;
 }

 .total-row:last-child {
     border-bottom: none;
 }

 .total-row.final-total {
     font-size: 1.2rem;
     font-weight: 600;
     color: #e74c3c;
     border-top: 2px solid #e74c3c;
     padding-top: 12px;
     margin-top: 8px;
 }

 .payment-address {
     margin-top: 20px;
 }

 .address-display {
     background: #f8f9fa;
     padding: 16px;
     border-radius: 8px;
     border: 1px solid #e9ecef;
 }

 .address-display p {
     margin: 0 0 4px 0;
     color: #495057;
 }

 .address-display p:last-child {
     margin-bottom: 0;
 }

 .payment-footer {
     display: flex;
     justify-content: space-between;
     gap: 16px;
     padding: 20px 24px;
     border-top: 1px solid #e9ecef;
     background: #f8f9fa;
     border-radius: 0 0 12px 12px;
 }

 .cancel-payment-btn,
 .confirm-payment-btn {
     padding: 12px 24px;
     border: none;
     border-radius: 6px;
     font-size: 1rem;
     font-weight: 600;
     cursor: pointer;
     transition: all 0.3s ease;
 }

 .cancel-payment-btn {
     background: #6c757d;
     color: white;
 }

 .cancel-payment-btn:hover {
     background: #5a6268;
 }

 .confirm-payment-btn {
     background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
     color: white;
     flex: 1;
     margin-left: 16px;
 }

 .confirm-payment-btn:hover:not(:disabled) {
     background: linear-gradient(135deg, #218838 0%, #1ea085 100%);
     transform: translateY(-2px);
 }

 .confirm-payment-btn:disabled {
     background: #adb5bd;
     cursor: not-allowed;
     transform: none;
 }

 /* 响应式设计 */
 @media (max-width: 768px) {
     .payment-modal-content {
         width: 95%;
         margin: 20px;
     }
     
     .payment-header {
         flex-direction: column;
         gap: 12px;
         align-items: flex-start;
     }
     
     .order-item {
         flex-direction: column;
         align-items: flex-start;
         text-align: center;
     }
     
     .item-image {
         width: 80px;
         height: 80px;
     }
     
     .payment-footer {
         flex-direction: column;
     }
     
     .confirm-payment-btn {
         margin-left: 0;
         margin-top: 8px;
     }
 }
 </style>

