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
                        :key="product.uniqueId || product.shoeId" 
                        class="product-card"
                    >
                        <!-- 删除按钮 -->
                        <button 
                            @click="removeProduct(product)" 
                            class="remove-product-btn"
                            title="删除此商品"
                        >
                            ✕
                        </button>

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
                                            @click="selectSize(product, size.sizeId)"
                                            class="size-option"
                                            :class="{ 'active': product.selectedSize === size.sizeId }"
                                        >
                                            {{ size.size }}
                                        </button>
                                    </div>
                                </div>

                                <div class="quantity-selection">
                                    <label class="quantity-label">购买数量:</label>
                                    <div class="quantity-controls">
                                        <button 
                                            @click="decreaseQuantity(product)" 
                                            class="quantity-btn"
                                            :disabled="product.quantity <= 1"
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="number" 
                                            v-model.number="product.quantity" 
                                            min="1" 
                                            class="quantity-input"
                                            @change="updateQuantity(product)"
                                        >
                                        <button 
                                            @click="increaseQuantity(product)" 
                                            class="quantity-btn"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 添加商品卡片 -->
                    <div class="add-product-card" @click="addMoreProducts">
                        <div class="add-product-content">
                            <div class="add-icon">+</div>
                            <p class="add-text">添加更多商品</p>
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
                    <div class="summary-item">
                        <span class="label">可获得积分:</span>
                        <span class="value points">{{ totalPoints }} 分</span>
                    </div>
                    <div class="summary-item total">
                        <span class="label">订单总额:</span>
                        <span class="value price">¥{{ orderTotal.toFixed(2) }}</span>
                    </div>
                </div>
            </div>

            <!-- 收货地址 -->
            <div class="address-section">
                <div class="section-header-row">
                    <h2 class="section-title">收货地址</h2>
                    <button @click="showAddAddressForm" class="change-address-btn">添加地址</button>
                </div>
                <div class="address-content">
                    <div v-if="selectedAddress" class="selected-address">
                        <div class="address-info">
                            <h4>{{ selectedAddress.receiverName }}</h4>
                            <p>{{ selectedAddress.phone }}</p>
                            <p>{{ selectedAddress.addressInfo }}</p>
                            <p v-if="selectedAddress.postalCode">邮编: {{ selectedAddress.postalCode }}</p>
                            <span v-if="selectedAddress.isDefault" class="default-badge">默认地址</span>
                        </div>
                    </div>
                    <div v-else class="no-address">
                        <p>请选择收货地址</p>
                        <button @click="showAddAddressForm" class="select-address-btn">添加地址</button>
                    </div>

                    <!-- 我的地址（完整卡片列表，点击选择） -->
                    <div v-if="addresses.length > 0" class="address-inline">
                        <div class="address-choices-header">我的地址</div>
                        <div class="address-inline-list">
                            <div
                                v-for="addr in addresses"
                                :key="addr.addressId"
                                class="address-item address-item-inline"
                                :class="{ 'selected': selectedAddress?.addressId === addr.addressId }"
                                @click="selectAddressItem(addr)"
                                title="点击选择此地址"
                            >
                                <button class="inline-edit-btn" @click.stop="editAddressItem(addr)">编辑</button>
                                <div class="address-details">
                                    <div class="address-header">
                                        <h4>{{ addr.receiverName }}</h4>
                                        <span v-if="addr.isDefault" class="default-badge">默认</span>
                                    </div>
                                    <p>{{ addr.phone }}</p>
                                    <p>{{ addr.addressInfo }}</p>
                                    <p v-if="addr.postalCode">邮编: {{ addr.postalCode }}</p>
                                </div>
                            </div>
                        </div>
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
                         <div v-for="product in products" :key="product.uniqueId || product.shoeId" class="order-item">
                             <div class="item-image">
                                 <img v-if="product.images && product.images.length > 0" 
                                      :src="`/api/shoeImg/getImage/${product.images[0].imagePath}`" 
                                      :alt="product.name">
                                 <div v-else class="no-image">📷</div>
                             </div>
                             <div class="item-details">
                                 <h5>{{ product.name }}</h5>
                                 <p class="item-size">尺码: {{ getSizeName(product.selectedSize) }}</p>
                                 <p class="item-quantity">数量: {{ product.quantity || 1 }} 件</p>
                                 <p class="item-price">单价: ¥{{ getProductPrice(product) }}</p>
                                 <p class="item-points" v-if="product.points">积分: {{ product.points }} 分</p>
                             </div>
                             <div class="item-total">
                                 ¥{{ (getProductPrice(product) * (product.quantity || 1)).toFixed(2) }}
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
                         <div class="total-row">
                             <span>可获得积分:</span>
                             <span>{{ totalPoints }} 分</span>
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
       <div v-if="showOrderDetailsModal" class="modal-overlay">
           <div class="modal-content" @click.stop>
              <div class="modal-header">
                  <h3>订单详情</h3>
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
                                  <p class="item-points" v-if="item.points">积分: {{ item.points }} 分</p>
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
                      <div class="total-row">
                          <span>可获得积分:</span>
                          <span>{{ orderDetails.totalPoints || 0 }} 分</span>
                      </div>
                      <div class="total-row final-total">
                          <span>订单总额:</span>
                          <span>¥{{ orderDetails.orderTotal.toFixed(2) }}</span>
                      </div>
                  </div>
              </div>
              <div class="payment-footer">
                  <button class="confirm-payment-btn" @click="() => { closeOrderDetailsModal(); router.push('/products') }">继续购物</button>
              </div>
          </div>
      </div>
 </template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { OrderAPI, InventoryAPI, CartAPI } from '@/api'
import { ShoeAPI, ShoesSizeAPI } from '@/api'
import { AddressAPI, OrderShoeNumAPI } from '@/api'
import userManager from '../utils/userManager'
import cartManager from '../utils/cart'
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
const availableSizes = ref([])

// 数据持久化相关
const STORAGE_KEY = 'orderConfirmationData'
const LAST_ADDRESS_KEY = 'orderLastSelectedAddressId'

// 计算属性
const totalItems = computed(() => {
    return products.value.reduce((sum, product) => {
        const quantity = product.quantity || 1
        return sum + quantity
    }, 0)
})

const totalPrice = computed(() => {
    return products.value.reduce((sum, product) => {
        const quantity = product.quantity || 1
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

const totalPoints = computed(() => {
    return products.value.reduce((sum, product) => {
        const quantity = product.quantity || 1
        const points = product.points || 0
        return sum + (points * quantity)
    }, 0)
})

const canSubmitOrder = computed(() => {
    return selectedAddress.value && 
           products.value.length > 0 && 
           totalItems.value > 0 &&
           products.value.every(product => product.selectedSize)
})

// 获取商品数据
const loadOrderData = async () => {
    loading.value = true
    error.value = ''
    
    try {
        // 检查用户登录状态
        if (!userManager.isLoggedIn()) {
            error.value = '请先登录后再确认订单'
            loading.value = false
            return
        }
        
        // 优先处理来自购物车的跳转
        const { productId, sizeId, quantity, fromOrderConfirmation, fromCart, items, fromPendingOrder, orderId, orderNumber } = route.query
        
        // 如果有来自购物车的跳转，不恢复本地存储的数据
        // 如果没有来自购物车的跳转，才尝试恢复保存的订单数据
        let hasRestoredData = false
        if (!fromCart) {
            hasRestoredData = restoreOrderData()
        }

        if (fromPendingOrder === 'true' && orderId) {
            // 处理来自待支付订单的跳转
            try {
                console.log('处理待支付订单:', orderId, orderNumber)
                
                // 获取待支付订单的商品信息
                const orderResponse = await OrderAPI.getAll()
                if (orderResponse.data?.code === 200 && orderResponse.data.data) {
                    const pendingOrders = orderResponse.data.data.filter(o => 
                        o.orderId === parseInt(orderId) && o.status === '0'
                    )
                    
                    if (pendingOrders.length > 0) {
                        // 获取订单的商品数量信息
                        const orderShoeNumPromises = pendingOrders.map(async (order) => {
                            try {
                                const orderShoeNumResponse = await OrderShoeNumAPI.getByOrderId(order.orderId)
                                if (orderShoeNumResponse.data?.code === 200 && orderShoeNumResponse.data.data) {
                                    return orderShoeNumResponse.data.data
                                }
                            } catch (error) {
                                console.warn('获取订单商品数量失败:', error)
                            }
                            return null
                        })
                        
                        const orderShoeNums = await Promise.all(orderShoeNumPromises)
                        const validOrderShoeNums = orderShoeNums.filter(item => item !== null).flat()
                        
                        // 获取商品详细信息
                        const productPromises = validOrderShoeNums.map(async (item) => {
                            try {
                                const shoeResponse = await ShoeAPI.getById(item.shoeId)
                                if (shoeResponse.data?.code === 200 && shoeResponse.data.data) {
                                    const shoe = shoeResponse.data.data
                                    
                                    // 获取商品图片
                                    let images = []
                                    try {
                                        const imgResponse = await ShoeAPI.getImages(item.shoeId)
                                        if (imgResponse.data?.code === 200 && imgResponse.data.data) {
                                            images = imgResponse.data.data
                                        }
                                    } catch (imgError) {
                                        console.warn('获取商品图片失败:', imgError)
                                    }
                                    
                                    return {
                                        ...shoe,
                                        images,
                                        selectedSize: pendingOrders.find(o => o.orderId === item.orderId)?.sizeId,
                                        quantity: item.shoeNum || 1,
                                        uniqueId: Date.now() + Math.random() + item.shoeId
                                    }
                                }
                            } catch (error) {
                                console.warn('获取商品详情失败:', error)
                            }
                            return null
                        })
                        
                        const productResults = await Promise.all(productPromises)
                        const validProducts = productResults.filter(p => p !== null)
                        
                        if (validProducts.length > 0) {
                            products.value = validProducts
                            console.log('从待支付订单加载的商品:', products.value)
                            
                            // 设置订单号用于后续支付
                            window.pendingOrderNumber = orderNumber
                        } else {
                            throw new Error('无法获取待支付订单的商品信息')
                        }
                    } else {
                        throw new Error('未找到待支付订单')
                    }
                } else {
                    throw new Error('获取订单信息失败')
                }
            } catch (error) {
                console.error('处理待支付订单失败:', error)
                alert('加载待支付订单失败，请重试')
                router.push('/profile')
                return
            }
        } else if (fromCart === 'true' && items) {
            try {
                const cartItems = JSON.parse(items)
                                 // 将购物车条目转为本页商品结构
                 products.value = cartItems.map(it => ({
                     shoeId: it.shoeId,
                     name: it.shoeName,
                     price: it.price || 0,
                     discountPrice: it.discountPrice || it.price || 0,
                     brand: { brandName: it.brandName },
                     shoesType: { typeName: it.typeName },
                     points: it.points || 0, // 添加积分信息
                     images: [],
                     selectedSize: it.sizeId, // 直接设置尺码
                     quantity: it.quantity || 1, // 直接设置数量
                     uniqueId: Date.now() + Math.random() + it.shoeId // 创建唯一标识
                 }))
                 
                 console.log('从购物车加载的商品:', products.value)
                // 可选：异步加载图片（不阻塞）
                products.value.forEach(async p => {
                    try {
                        const imgRes = await ShoeAPI.getImages(p.shoeId)
                        if (imgRes.data?.code === 200 && imgRes.data.data) p.images = imgRes.data.data
                    } catch (err) {
                        console.warn('加载商品图片失败:', err)
                    }
                })
            } catch (e) {
                console.error('解析购物车参数 items 失败:', e)
                throw e
            }
        } else if (productId && sizeId && quantity) {
            // 从产品详情页跳转过来，需要添加新商品到现有商品列表
            const productResponse = await ShoeAPI.getById(productId)

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

                                 // 如果是从订单确认页面跳转过来的，检查是否会导致重复
                 if (fromOrderConfirmation === 'true') {
                     // 检查商品是否已经存在且尺码相同
                     const existingProductIndex = products.value.findIndex(p => 
                         p.shoeId === productId && p.selectedSize === parseInt(sizeId)
                     )
                     
                     if (existingProductIndex >= 0) {
                         // 商品已存在且尺码相同，更新数量
                         const existingProduct = products.value[existingProductIndex]
                         existingProduct.quantity = (existingProduct.quantity || 1) + parseInt(quantity)
                     } else {
                         // 商品不存在或尺码不同，添加到列表
                         const newProduct = {
                             ...productData,
                             selectedSize: parseInt(sizeId),
                             quantity: parseInt(quantity),
                             uniqueId: Date.now() + Math.random() // 创建唯一标识
                         }
                         products.value.push(newProduct)
                     }
                 } else {
                     // 直接添加商品（新用户或从其他页面跳转）
                     const newProduct = {
                         ...productData,
                         selectedSize: parseInt(sizeId),
                         quantity: parseInt(quantity),
                         uniqueId: Date.now() + Math.random() // 创建唯一标识
                     }
                     products.value.push(newProduct)
                 }
                 
                                   
                
                // 保存更新后的数据
                saveOrderData()
                
                // 清除URL参数和sessionStorage标记，避免重复添加
                router.replace({ name: 'OrderConfirmation', query: {} })
                sessionStorage.removeItem('fromOrderConfirmation')
            }
        } else if (!hasRestoredData) {
            // 没有恢复的数据，也没有新商品，加载所有商品
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

                    // 初始化商品数量 - 使用新的数据结构
                    // 这里暂时不设置，等用户选择尺码时再设置
                }

                products.value = productList
            }
        }

        // 获取尺码数据
        try {
            const sizeResponse = await ShoesSizeAPI.getAll()
        if (sizeResponse.data && sizeResponse.data.data) {
            // 先获取所有启用的尺码
            const allSizes = sizeResponse.data.data.filter(size => !size.sizeDisabled)
            
            // 如果是从产品详情页跳转过来，尝试获取该商品实际可用的尺码
            if (productId && sizeId && quantity) {
                try {
                    // 使用正确的接口获取商品的库存信息
                        const inventoryResponse = await InventoryAPI.getInventoryByShoeId(productId)
                    
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
        } catch (err) {
            console.error('加载尺码数据失败:', err)
            error.value = '加载尺码数据失败，请重试。'
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

// （已弃用）从API加载购物车商品数据函数移除，避免未使用警告

// 加载地址数据
const loadAddresses = async () => {
    try {
        // 获取当前登录用户的ID
        const userId = await userManager.getUserId()
        if (!userId) {
            console.error('无法获取用户ID，请先登录')
            error.value = '请先登录后再确认订单'
            return
        }
        
        console.log('正在加载用户ID为', userId, '的地址列表')
        
        // 使用AddressController的list接口，传递当前用户ID
        const response = await AddressAPI.getList(userId)
        
        if (response.data && response.data.code === 200 && response.data.data) {
            addresses.value = response.data.data
            console.log('成功加载地址列表:', addresses.value.length, '个地址')
            
            // 默认采用上次选择的地址 -> 否则默认地址 -> 否则第一个
            if (addresses.value.length > 0) {
                let chosen = null
                try {
                    const lastId = localStorage.getItem(LAST_ADDRESS_KEY)
                    if (lastId) {
                        chosen = addresses.value.find(a => String(a.addressId) === String(lastId)) || null
                    }
                } catch (e) {
                    console.warn('读取最近选择地址失败', e)
                }
                if (!chosen) {
                    chosen = addresses.value.find(addr => addr.isDefault) || addresses.value[0]
                }
                selectedAddress.value = chosen
                console.log('已选择地址:', selectedAddress.value)
            } else {
                console.log('用户没有保存的地址')
                selectedAddress.value = null
            }
        } else {
            console.warn('地址接口返回异常:', response.data)
            addresses.value = []
            selectedAddress.value = null
        }
    } catch (err) {
        console.error('加载地址数据失败:', err)
        
        // 如果接口不存在，尝试使用getAll接口作为备用方案
        try {
            console.log('尝试使用备用地址接口...')
            const response = await AddressAPI.getAll()
            if (response.data && response.data.data) {
                addresses.value = response.data.data
                if (addresses.value.length > 0) {
                    const defaultAddress = addresses.value.find(addr => addr.isDefault)
                    selectedAddress.value = defaultAddress || addresses.value[0]
                }
            }
        } catch (fallbackErr) {
            console.error('备用地址接口也失败:', fallbackErr)
            addresses.value = []
            selectedAddress.value = null
        }
    }
}

// 尺码选择
const selectSize = (product, sizeId) => {
    product.selectedSize = sizeId
    
    // 如果该商品还没有数量设置，设置默认数量为1
    if (!product.quantity) {
        product.quantity = 1
    }
    
    // 保存更新后的数据
    saveOrderData()
    
    console.log('选择尺码:', product.name, '尺码:', sizeId, '数量:', product.quantity)
}

// 数量控制
const increaseQuantity = (product) => {
    if (product.quantity) {
        product.quantity++
        saveOrderData() // 保存更新后的数据
        console.log('增加数量:', product.name, '新数量:', product.quantity)
    }
}

const decreaseQuantity = (product) => {
    if (product.quantity && product.quantity > 1) {
        product.quantity--
        saveOrderData() // 保存更新后的数据
        console.log('减少数量:', product.name, '新数量:', product.quantity)
    }
}

const updateQuantity = (product) => {
    if (product.quantity && product.quantity < 1) {
        product.quantity = 1
    }
    saveOrderData() // 保存更新后的数据
    console.log('更新数量:', product.name, '新数量:', product.quantity)
}

// 删除商品
const removeProduct = (product) => {
    if (confirm('确定要删除这个商品吗？')) {
        // 找到要删除的商品索引
        const indexToRemove = products.value.findIndex(p => p.uniqueId === product.uniqueId)
        
        if (indexToRemove > -1) {
            // 从商品列表中移除
            products.value.splice(indexToRemove, 1)
        }
        
        // 保存更新后的数据
        saveOrderData()
        
        // 如果删除后没有商品了，显示提示
        if (products.value.length === 0) {
            alert('已删除所有商品，即将返回产品列表页面')
            router.push('/products')
        }
    }
}

// 地址相关操作（保留选择/关闭表单与模态）

const closeAddressModal = () => {
    showAddressModal.value = false
}

const selectAddressItem = (address) => {
    selectedAddress.value = address
    // 持久化最后一次选择
    try {
        if (address?.addressId) {
            localStorage.setItem(LAST_ADDRESS_KEY, String(address.addressId))
        }
    } catch (e) {
        console.warn('保存最近选择地址失败', e)
    }
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
        // 获取当前登录用户的ID
        const userId = await userManager.getUserId()
        if (!userId) {
            alert('请先登录后再添加地址')
            return
        }
        
        console.log('正在保存地址，用户ID:', userId)
        
        const addressData = {
            ...addressForm.value,
            user: { id: userId } // 使用user对象结构，与后端Address实体类匹配
        }

        let response
        if (isEditingAddress.value) {
            // 更新地址
            console.log('更新地址:', addressData)
            response = await AddressAPI.update(addressData)
        } else {
            // 添加地址
            console.log('添加地址:', addressData)
            response = await AddressAPI.add(addressData)
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
            const response = await AddressAPI.delete(addressId)
            
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
        // 获取当前登录用户的ID
        const userId = await userManager.getUserId()
        if (!userId) {
            alert('请先登录后再设置默认地址')
            return
        }
        
        console.log('正在设置默认地址，用户ID:', userId, '地址ID:', addressId)
        
        const response = await AddressAPI.setDefault(addressId, userId)
        
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
const submitOrder = async () => {
    if (!canSubmitOrder.value) {
        alert('请完善订单信息')
        return
    }
    
    // 检查是否有待支付的订单
    const pendingOrders = await findPendingOrders()
    if (pendingOrders && pendingOrders.length > 0) {
        const confirmMessage = `检测到您有待支付的订单，是否要更新现有订单状态为已支付？\n\n订单号: ${pendingOrders[0].orderNumber}\n订单数量: ${pendingOrders.length} 个商品`
        if (confirm(confirmMessage)) {
            // 用户选择更新现有订单，设置标志
            window.shouldUpdateExistingOrder = true
            showPaymentModal.value = true
            startPaymentCountdown()
        } else {
            // 用户选择创建新订单，清除标志
            window.shouldUpdateExistingOrder = false
    showPaymentModal.value = true
    startPaymentCountdown()
        }
    } else {
        // 没有待支付订单，清除标志
        window.shouldUpdateExistingOrder = false
        showPaymentModal.value = true
        startPaymentCountdown()
    }
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
    // 清除用户选择标志
    window.shouldUpdateExistingOrder = false
    alert('支付超时，请重新提交订单')
    // 可以在这里添加其他超时处理逻辑
}

// 取消支付
const cancelPayment = async () => {
    clearInterval(paymentTimer.value)
    showPaymentModal.value = false
    // 清除用户选择标志
    window.shouldUpdateExistingOrder = false
    
    // 创建订单但状态为0（取消支付状态）
    const result = await createOrderWithStatus('0')
    if (result) {
        alert('订单已创建，状态为待支付。您可以稍后重新提交订单进行支付。')
    } else {
        alert('创建订单失败，请重试。')
    }
}

// 创建订单的通用方法
const createOrderWithStatus = async (status) => {
    try {
        // 首先检查库存是否充足
        const inventoryCheckPromises = products.value.map(async (product) => {
            const quantity = product.quantity || 1
            const sizeId = product.selectedSize
            
            if (quantity > 0 && sizeId) {
                try {
                    const response = await InventoryAPI.checkSufficient(product.shoeId, sizeId, quantity)
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
            console.warn('部分商品库存不足，但继续创建订单')
        }

        // 创建订单（按商品逐个创建），使用同一订单号
        const masterOrderNumber = generateOrderNumber()
        const createOrderPromises = products.value.map(async (product) => {
            const quantity = product.quantity || 1
            const sizeId = product.selectedSize
            if (quantity > 0 && sizeId) {
                try {
                    const orderPayload = {
                        userId: await userManager.getUserId(),
                        sizeId: sizeId,
                        orderNumber: masterOrderNumber,
                        status: status,
                        addressId: selectedAddress.value.addressId,
                        shippingFee: shippingFee.value / Math.max(products.value.length, 1),
                        createdAt: formatDate(new Date()),
                        updatedAt: formatDate(new Date()),
                        deliveryTime: formatDate(addDays(new Date(), 3))
                    }
                    const res = await axios.post('/api/order/insertOrder', orderPayload, {
                        headers: { 'Content-Type': 'application/json' }
                    })
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
            console.error('创建订单失败')
            return false
            }

            // 拉取刚创建的订单（通过订单号匹配）
            let createdOrders = []
            try {
            const fetchRes = await OrderAPI.getAll()
                if (fetchRes.data && fetchRes.data.code === 200 && Array.isArray(fetchRes.data.data)) {
                    createdOrders = fetchRes.data.data.filter(o => o.orderNumber === masterOrderNumber)
                }
            } catch (e) {
                console.error('查询订单失败:', e)
            }

            // 为每个订单插入鞋数量记录
            if (createdOrders && createdOrders.length > 0) {
            const sizeIdToItemQueue = {}
            for (const p of products.value) {
                const sId = p.selectedSize
                const qty = p.quantity || 1
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
                        }, {
                            headers: { 'Content-Type': 'application/json' }
                        })
                        return res.data && res.data.code === 200
                    } catch (e) {
                        console.error('创建订单商品数量失败:', e)
                        return false
                    }
                })
                await Promise.all(shoeNumPromises)
            }

        return true
    } catch (err) {
        console.error('创建订单失败:', err)
        return false
    }
}

// 查找状态为0的订单
const findPendingOrders = async () => {
    try {
        const response = await OrderAPI.getAll()
        if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
            // 查找当前用户的状态为0的订单
            const userId = await userManager.getUserId()
            return response.data.data.filter(order => 
                order.userId === userId && order.status === '0'
            )
        }
        return []
    } catch (err) {
        console.error('查询待支付订单失败:', err)
        return []
    }
}

// 更新订单状态
const updateOrderStatus = async (orderNumber, newStatus) => {
    try {
        // 首先获取需要更新的订单
        const response = await OrderAPI.getAll()
        if (response.data && response.data.code === 200 && Array.isArray(response.data.data)) {
            const userId = await userManager.getUserId()
            const ordersToUpdate = response.data.data.filter(order => 
                order.orderNumber === orderNumber && order.userId === userId
            )
            
            // 更新每个订单的状态
            const updatePromises = ordersToUpdate.map(order => {
                const updatedOrder = {
                    ...order,
                    status: newStatus,
                    updatedAt: formatDate(new Date())
                }
                return OrderAPI.updateOrder(updatedOrder)
            })
            
            const updateResults = await Promise.all(updatePromises)
            return updateResults.every(result => result.data && result.data.code === 200)
        }
        return false
    } catch (err) {
        console.error('更新订单状态失败:', err)
        return false
    }
}

// 确认支付
const confirmPayment = async () => {
    if (isProcessingPayment.value) return
    
    isProcessingPayment.value = true
    
    try {
        // 首先检查库存是否充足
        const inventoryCheckPromises = products.value.map(async (product) => {
            const quantity = product.quantity || 1
            const sizeId = product.selectedSize
            
                if (quantity > 0 && sizeId) {
                    try {
                    const response = await InventoryAPI.checkSufficient(product.shoeId, sizeId, quantity)
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

        // 查找是否有状态为0的待支付订单
        const pendingOrders = await findPendingOrders()
        let masterOrderNumber = null
        let createdOrders = []

        // 检查是否来自待支付订单的跳转
        const isFromPendingOrder = window.pendingOrderNumber !== undefined

        // 检查用户是否选择更新现有订单
        const shouldUpdateExisting = window.shouldUpdateExistingOrder === true

        if (isFromPendingOrder && window.pendingOrderNumber) {
            // 来自待支付订单的跳转，直接更新该订单
            const orderNumber = window.pendingOrderNumber
            const updateResult = await updateOrderStatus(orderNumber, '1')
            
            if (updateResult) {
                masterOrderNumber = orderNumber
                // 获取更新后的订单
                const fetchRes = await OrderAPI.getAll()
                if (fetchRes.data && fetchRes.data.code === 200 && Array.isArray(fetchRes.data.data)) {
                    createdOrders = fetchRes.data.data.filter(o => o.orderNumber === orderNumber)
                }
            } else {
                alert('更新待支付订单失败，请重试')
                isProcessingPayment.value = false
                return
            }
        } else if (pendingOrders && pendingOrders.length > 0 && shouldUpdateExisting) {
            // 用户选择更新现有订单，更新状态为1
            const orderNumbers = [...new Set(pendingOrders.map(order => order.orderNumber))]
            const updatePromises = orderNumbers.map(orderNumber => 
                updateOrderStatus(orderNumber, '1')
            )
            
            const updateResults = await Promise.all(updatePromises)
            const allUpdated = updateResults.every(result => result === true)
            
            if (allUpdated) {
                // 更新成功，使用第一个订单号
                masterOrderNumber = orderNumbers[0]
                createdOrders = pendingOrders
            } else {
                // 更新失败，创建新订单
                const result = await createOrderWithStatus('1')
                if (result) {
                    // 获取刚创建的订单
                    const fetchRes = await OrderAPI.getAll()
                    if (fetchRes.data && fetchRes.data.code === 200 && Array.isArray(fetchRes.data.data)) {
                        // 获取最新的订单号
                        const userId = await userManager.getUserId()
                        const latestOrders = fetchRes.data.data
                            .filter(o => o.userId === userId && o.status === '1')
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        
                        if (latestOrders.length > 0) {
                            masterOrderNumber = latestOrders[0].orderNumber
                            createdOrders = latestOrders.filter(o => o.orderNumber === masterOrderNumber)
                        }
                    }
                }
            }
        } else {
            // 没有待支付订单或用户选择创建新订单，创建新订单
            const result = await createOrderWithStatus('1')
            if (result) {
                // 获取刚创建的订单
                const fetchRes = await OrderAPI.getAll()
                if (fetchRes.data && fetchRes.data.code === 200 && Array.isArray(fetchRes.data.data)) {
                    // 获取最新的订单号
                    const userId = await userManager.getUserId()
                    const latestOrders = fetchRes.data.data
                        .filter(o => o.userId === userId && o.status === '1')
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    
                    if (latestOrders.length > 0) {
                        masterOrderNumber = latestOrders[0].orderNumber
                        createdOrders = latestOrders.filter(o => o.orderNumber === masterOrderNumber)
                    }
                }
            }
        }

        if (!masterOrderNumber || createdOrders.length === 0) {
            alert('创建订单失败，请重试或联系客服')
            isProcessingPayment.value = false
            return
        }

        // 扣减库存
        const inventoryDecreasePromises = products.value.map(async (product) => {
            const quantity = product.quantity || 1
            const sizeId = product.selectedSize
            if (quantity > 0 && sizeId) {
                try {
                    await InventoryAPI.decrease(product.shoeId, sizeId, quantity)
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
                .filter(p => (p.quantity || 1) > 0 && p.selectedSize)
                .map(p => {
                    const sizeId = p.selectedSize
                    const sizeName = getSizeName(sizeId)
                    const quantity = p.quantity || 1
                    const unitPrice = getProductPrice(p)
                    const subtotal = Number((unitPrice * quantity).toFixed(2))
                    const points = p.points || 0
                    return {
                        shoeId: p.shoeId,
                        name: p.name,
                        image: p.images && p.images.length > 0 ? p.images[0].imagePath : null,
                        sizeId,
                        sizeName,
                        quantity,
                        unitPrice,
                        subtotal,
                        points
                    }
                })

                orderDetails.value = {
                    orderNumber: masterOrderNumber,
                    createdAt: createdOrders && createdOrders.length > 0 ? createdOrders[0].createdAt : new Date(),
                    status: '1',
                    userId: await userManager.getUserId(),
                    address: selectedAddress.value ? { ...selectedAddress.value } : null,
                    items,
                    itemsTotal: Number(totalPrice.value.toFixed(2)),
                    shippingFee: Number(shippingFee.value.toFixed(2)),
                    orderTotal: Number(orderTotal.value.toFixed(2)),
                    totalPoints: totalPoints.value
                }

                clearInterval(paymentTimer.value)
                showPaymentModal.value = false
                // 清除用户选择标志和待支付订单标记
                window.shouldUpdateExistingOrder = false
                window.pendingOrderNumber = undefined
                
                // 从购物车中删除已购买的商品
                await removeItemsFromCart()
                
                // 清除保存的订单数据（但保留商品列表和选择信息）
                clearOrderData()
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
         // 完全清除订单数据，确保不会保留已支付的商品
         clearOrderData()
         // 跳转到产品列表页面，让用户可以继续选择商品
         router.push('/products')
     })

    // 点击背景关闭弹窗
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) {
            document.body.removeChild(successModal)
            // 完全清除订单数据，确保不会保留已支付的商品
            clearOrderData()
            router.push('/products')
        }
    })
}



// 关闭订单详情弹窗
const closeOrderDetailsModal = () => {
    showOrderDetailsModal.value = false
}

// 打开订单详情弹窗
const openOrderDetailsModal = () => {
    showOrderDetailsModal.value = true
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

// 从购物车中删除已购买的商品
const removeItemsFromCart = async () => {
    try {
        const userId = await userManager.getUserId()
        if (!userId) {
            console.error('无法获取用户ID，无法删除购物车商品')
            return
        }

        console.log('开始删除购物车商品，用户ID:', userId)

        // 获取用户的购物车订单
        const cartResponse = await CartAPI.getCartOrdersWithDetails(userId)
        
        if (cartResponse.data?.code === 200 && cartResponse.data.data) {
            const cartOrders = cartResponse.data.data
            console.log('购物车订单数量:', cartOrders.length)
            
            // 遍历购物车中的商品，删除已购买的商品
            for (const cartOrder of cartOrders) {
                const orderId = cartOrder.orderId
                const shoeId = cartOrder.orderShoeNum?.shoeId
                const cartQuantity = cartOrder.orderShoeNum?.shoeNum || 0
                const cartSizeId = cartOrder.sizeId
                
                // 检查当前商品是否在购买列表中
                const productToBuy = products.value.find(p => p.shoeId === shoeId)
                if (productToBuy && shoeId) {
                    const buyQuantity = productToBuy.quantity || 1
                    const sizeId = productToBuy.selectedSize
                    
                    // 如果尺码匹配且购买数量大于等于购物车数量，删除整个购物车项
                    if (cartSizeId === sizeId && buyQuantity >= cartQuantity) {
                        try {
                            const deleteResponse = await CartAPI.removeFromCart(orderId, shoeId)
                            if (deleteResponse.data?.code === 200) {
                                console.log(`成功删除购物车商品: orderId=${orderId}, shoeId=${shoeId}`)
                            } else {
                                console.warn(`删除购物车商品失败: orderId=${orderId}, shoeId=${shoeId}`)
                            }
                        } catch (error) {
                            console.error(`删除购物车商品出错: orderId=${orderId}, shoeId=${shoeId}`, error)
                        }
                    }
                    // 如果购买数量小于购物车数量，更新购物车数量
                    else if (cartSizeId === sizeId && buyQuantity > 0 && buyQuantity < cartQuantity) {
                        const newQuantity = cartQuantity - buyQuantity
                        try {
                            const updateResponse = await CartAPI.updateCartItemQuantity(orderId, shoeId, newQuantity)
                            if (updateResponse.data?.code === 200) {
                                console.log(`成功更新购物车商品数量: orderId=${orderId}, shoeId=${shoeId}`)
                            } else {
                                console.warn(`更新购物车商品数量失败: orderId=${orderId}, shoeId=${shoeId}`)
                            }
                        } catch (error) {
                            console.error(`更新购物车商品数量出错: orderId=${orderId}, shoeId=${shoeId}`, error)
                        }
                    }
                }
            }
            
            // 刷新购物车数量
            await cartManager.refreshCartCount()
            console.log('购物车商品删除完成')
        } else {
            console.log('购物车为空或获取失败')
        }
    } catch (error) {
        console.error('删除购物车商品失败:', error)
    }
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

// 保存订单确认数据到本地存储
const saveOrderData = () => {
    const orderData = {
        products: products.value,
        selectedAddress: selectedAddress.value,
        timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orderData))
}

// 从本地存储恢复订单确认数据
const restoreOrderData = () => {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY)
        if (savedData) {
            const orderData = JSON.parse(savedData)
            // 检查数据是否过期（24小时）
            const now = Date.now()
            const dataAge = now - orderData.timestamp
            const maxAge = 24 * 60 * 60 * 1000 // 24小时
            
            // 检查是否有商品数据
            if (dataAge < maxAge && orderData.products && orderData.products.length > 0) {
                // 检查这些商品是否已经被支付（通过检查是否有订单号或其他标识）
                // 如果没有特殊标识，我们假设这些是有效的待支付商品
                products.value = orderData.products || []
                selectedAddress.value = orderData.selectedAddress || null
                
                console.log('恢复订单数据成功，商品数量:', products.value.length)
                
                return true
            } else {
                // 数据过期或没有商品，清除
                localStorage.removeItem(STORAGE_KEY)
                console.log('订单数据已过期或没有商品，已清除')
            }
        }
    } catch (error) {
        console.error('恢复订单数据失败:', error)
        localStorage.removeItem(STORAGE_KEY)
    }
    return false
}

// 清除本地存储的订单数据
const clearOrderData = () => {
    // 支付成功后，完全清除所有订单数据，包括商品列表
    localStorage.removeItem(STORAGE_KEY)
    
    // 清空当前页面的商品列表
    products.value = []
    
    console.log('订单数据已完全清除')
}

// 添加更多商品
const addMoreProducts = () => {
    // 保存当前订单数据
    saveOrderData()
    // 设置标记，表示从订单确认页面跳转
    sessionStorage.setItem('fromOrderConfirmation', 'true')
    // 跳转到产品展示页面
    router.push('/products')
}

// 返回商品列表
const goBack = () => {
    // 保存当前订单数据
    saveOrderData()
    // 设置标记，表示从订单确认页面跳转
    sessionStorage.setItem('fromOrderConfirmation', 'true')
    router.push('/products')
}



// 生命周期钩子
onMounted(() => {
    loadOrderData()
})

// 组件卸载时清理sessionStorage
onUnmounted(() => {
    sessionStorage.removeItem('fromOrderConfirmation')
})
</script>

<style scoped>
.order-confirmation-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    min-height: 100vh;
    font-family: 'Helvetica Neue', Arial, 'Microsoft YaHei', sans-serif;
    color: #111;
    line-height: 1.6;
    --accent-color: #C6FF00;
    --accent-hover: #B8FF2E;
    --bg-start: #f5f7fa;
    --bg-end: #eef1f6;
    --card-bg: rgba(255, 255, 255, 0.9);
    --border-color: rgba(17, 17, 17, 0.08);
    --ring: rgba(17, 17, 17, 0.12);
    --shadow-color: rgba(16, 24, 40, 0.08);
    --primary: #111;
    --primary-600: #0e0e0e;
    --primary-700: #000;
    --success: #28a745;
    --danger: #e74c3c;
    --muted: #6c757d;
    --summary-offset: clamp(280px, 34vh, 420px);
    background:
        radial-gradient(1200px 600px at 100% -200px, rgba(198,255,0,0.12), transparent 60%),
        radial-gradient(800px 400px at -100px 100%, rgba(0,0,0,0.06), transparent 60%),
        linear-gradient(180deg, var(--bg-start), var(--bg-end));
}

.page-header {
    background: var(--card-bg);
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    border: 1px solid var(--border-color);
    box-shadow: 0 8px 24px var(--shadow-color);
    backdrop-filter: saturate(140%) blur(6px);
}

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 0.9rem;
}

.breadcrumb-item {
    color: #111;
    text-decoration: none;
    font-weight: 500;
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
    border-top: 4px solid #111;
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
    background: #000;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 16px;
}

.retry-btn:hover {
    background: #111;
}

.order-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.products-section, .order-summary-section, .address-section {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid var(--border-color);
    box-shadow: 0 8px 24px var(--shadow-color);
    backdrop-filter: saturate(140%) blur(6px);
}

.section-title {
    margin: 0 0 20px 0;
    font-size: 1.5rem;
    color: #333;
    padding-bottom: 12px;
    position: relative;
}

.section-title:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 72px;
    height: 2px;
    background: linear-gradient(90deg, #111, rgba(17,17,17,0.2));
}

.section-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    align-items: stretch;
}

.product-card {
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    position: relative;
    background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.82));
    box-shadow: 0 8px 24px var(--shadow-color);
    backdrop-filter: blur(4px);
}

.product-card:hover {
    box-shadow: 0 16px 36px rgba(17, 17, 17, 0.12);
    transform: translateY(-2px);
    border-color: rgba(17,17,17,0.16);
}

/* 删除商品按钮样式 */
.remove-product-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border: 1px solid #111;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.9);
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease;
    z-index: 10;
    opacity: 0;
    transform: scale(0.8);
}

.product-card:hover .remove-product-btn {
    opacity: 1;
    transform: scale(1);
}

.remove-product-btn:hover {
    background: #000;
    transform: scale(1.1);
}

.remove-product-btn:active {
    transform: scale(0.95);
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
    font-weight: 600;
    background: linear-gradient(135deg, #111 0%, #333 100%);
    color: #fff;
    letter-spacing: 0.02em;
    text-transform: uppercase;
}

.price-section {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.current-price {
    font-size: 1.2rem;
    font-weight: 700;
    color: #111;
}

.discount-price {
    font-size: 1rem;
    font-weight: 600;
    color: #9aa0a6;
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
    transition: border-color 0.2s ease, color 0.2s ease, transform 0.1s ease, background-color 0.2s ease, box-shadow 0.2s ease;
    font-size: 0.9rem;
}

.size-option:hover {
    border-color: #111;
    color: #111;
}

.size-option.active {
    background: #000;
    color: white;
    border-color: #000;
    box-shadow: 0 0 0 6px rgba(17,17,17,0.06) inset, 0 6px 18px rgba(0,0,0,0.12);
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
    border-color: #111;
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
    border-top: 2px solid #111;
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
    color: #111;
    font-weight: 700;
}

.value.points {
    color: var(--accent-color);
    font-weight: 700;
}

.address-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* 快速地址选择 chips */
.address-choices {
    margin-top: 8px;
}

.address-choices-header {
    font-size: 0.9rem;
    color: #6c757d;
    margin-bottom: 8px;
}

.address-choices-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.address-chip {
    border: 1px solid var(--border-color);
    background: #fff;
    color: #333;
    border-radius: 999px;
    padding: 6px 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
}

.address-chip:hover {
    border-color: #111;
    transform: translateY(-1px);
}

.address-chip.selected {
    background: #000;
    color: #fff;
    border-color: #000;
    box-shadow: 0 6px 18px rgba(0,0,0,0.18);
}

.address-chip .chip-name {
    font-weight: 600;
}

.address-chip .chip-phone {
    opacity: 0.8;
    font-size: 0.85em;
}

/* 横向地址卡片列表样式 */
.address-inline { margin-top: 8px; }
.address-inline-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
}

@media (min-width: 768px) {
    .address-inline-list { grid-template-columns: 1fr; }
}

.address-item-inline {
    cursor: pointer;
}

.address-item-inline.selected {
    border-color: #111;
    box-shadow: 0 10px 24px rgba(0,0,0,0.1);
}

.inline-edit-btn {
    position: absolute;
    right: 12px;
    top: 12px;
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid #000;
    background: #000;
    color: #fff;
    font-size: 12px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.inline-edit-btn:hover {
    background: #111;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.2);
}

.selected-address {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    border: 2px solid #111;
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.88));
    box-shadow: 0 6px 18px var(--shadow-color);
    position: relative;
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
    background: var(--accent-color);
    color: #111;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 500;
}

.change-address-btn {
    background: #000;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
}

.change-address-btn:hover {
    background: #111;
}

.no-address {
    text-align: center;
    padding: 32px;
    color: #6c757d;
}

.select-address-btn {
    background: #000;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 16px;
}

.select-address-btn:hover {
    background: #111;
}

.action-buttons {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 24px;
    background: var(--card-bg);
    border-radius: 16px;
    border: 1px solid var(--border-color);
    box-shadow: 0 8px 24px var(--shadow-color);
    backdrop-filter: saturate(140%) blur(6px);
}

.back-btn, .submit-order-btn {
    padding: 14px 28px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
}

.back-btn {
    background: #fff;
    color: #111;
    border: 1px solid #111;
}

.back-btn:hover {
    background: #f1f3f5;
    transform: translateY(-1px);
}

.submit-order-btn {
    background: linear-gradient(135deg, #111 0%, #2b2b2b 50%, #000 100%);
    color: white;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}

.submit-order-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #000 0%, #111 50%, #000 100%);
    transform: translateY(-2px);
    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.35);
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
    backdrop-filter: blur(4px) saturate(120%);
}

.modal-content {
    background: var(--card-bg);
    border-radius: 16px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    border: 1px solid var(--border-color);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.28);
    animation: scaleIn 0.22s ease;
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
    color: #111;
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
    background: #000;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.add-address-btn:hover {
    background: #111;
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
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
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
    background: rgba(255,255,255,0.9);
    position: relative;
}

.address-item:hover {
    border-color: #111;
    box-shadow: 0 10px 24px rgba(0,0,0,0.1);
    transform: translateY(-2px);
}

.address-item.selected {
    border-color: #111;
    background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.9));
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
    transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
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
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(200, 35, 51, 0.35);
}

.set-default-btn {
    background: #17a2b8;
    color: white;
}

.set-default-btn:hover {
    background: #138496;
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(23, 162, 184, 0.35);
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
    border-color: #111;
    box-shadow: 0 0 0 4px rgba(17,17,17,0.08);
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
     background: linear-gradient(135deg, #000 0%, #1a1a1a 50%, #000 100%);
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
     background: rgba(255, 255, 255, 0.15);
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
     border: 1px solid var(--border-color);
     border-radius: 12px;
     background: linear-gradient(180deg, rgba(248,249,250,0.9), rgba(248,249,250,0.8));
     box-shadow: 0 6px 18px var(--shadow-color);
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

 .item-details .item-points {
     color: var(--accent-color);
     font-size: 0.8rem;
     background: rgba(198, 255, 0, 0.15);
     padding: 2px 6px;
     border-radius: 4px;
     display: inline-block;
     margin-top: 4px;
 }

 .item-total {
     font-weight: 600;
     color: var(--danger);
     font-size: 1.1rem;
     flex-shrink: 0;
 }

 .payment-total {
     background: linear-gradient(180deg, rgba(248,249,250,0.95), rgba(248,249,250,0.85));
     padding: 16px;
     border-radius: 8px;
     border: 1px solid var(--border-color);
     box-shadow: 0 6px 18px var(--shadow-color);
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
     font-weight: 700;
     color: #111;
     border-top: 2px solid #111;
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
     background: linear-gradient(180deg, rgba(248,249,250,0.96), rgba(248,249,250,0.88));
     border-radius: 0 0 12px 12px;
 }

 /* 订单详情弹窗：订单信息更清晰（纯黑色） */
 .order-meta p,
 .order-meta strong,
 .order-meta span {
     color: #000;
 }

 .cancel-payment-btn,
 .confirm-payment-btn {
     padding: 12px 24px;
     border: none;
     border-radius: 6px;
     font-size: 1rem;
     font-weight: 600;
     cursor: pointer;
     transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
 }

 .cancel-payment-btn {
     background: #fff;
     color: #111;
     border: 1px solid #111;
 }
 
 .cancel-payment-btn:hover {
     background: #f1f3f5;
     transform: translateY(-1px);
     box-shadow: 0 8px 18px rgba(0,0,0,0.1);
 }

 .confirm-payment-btn {
     background: linear-gradient(135deg, #111 0%, #2b2b2b 50%, #000 100%);
     color: white;
     flex: 1;
     margin-left: 16px;
     box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
 }

 .confirm-payment-btn:hover:not(:disabled) {
     background: linear-gradient(135deg, #000 0%, #111 50%, #000 100%);
     color: #fff;
     transform: translateY(-2px);
     box-shadow: 0 10px 32px rgba(0, 0, 0, 0.35);
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

 /* 添加商品卡片样式 */
 .add-product-card {
     border: 2px dashed #cfd4da;
     border-radius: 12px;
     background: linear-gradient(180deg, rgba(248,249,250,0.9), rgba(248,249,250,0.8));
     cursor: pointer;
     transition: all 0.3s ease;
     display: flex;
     align-items: center;
     justify-content: center;
     min-height: 200px;
     height: 100%;
 }

 /* 在中等及以上屏幕固定为竖版高卡片，即使换行也保持竖向比例 */
 @media (min-width: 768px) {
     .add-product-card {
         min-height: 420px;
     }
 }

 .add-product-card:hover {
     border-color: #111;
     background: rgba(198, 255, 0, 0.07);
     transform: translateY(-2px);
     box-shadow: 0 10px 24px rgba(0,0,0,0.08);
 }

 .add-product-content {
     text-align: center;
     padding: 20px;
 }

 .add-icon {
     font-size: 3rem;
     color: #111;
     margin-bottom: 12px;
     font-weight: bold;
     display: inline-block;
     transform: rotate(90deg);
 }

 .add-text {
     color: #6c757d;
     font-size: 1rem;
     margin: 0;
     font-weight: 500;
 }

 .add-product-card:hover .add-icon {
     color: var(--accent-color);
 }

 .add-product-card:hover .add-text {
     color: #111;
 }

/* Large screen layout improvements */
@media (min-width: 1024px) {
    .order-content {
        display: grid;
        grid-template-columns: 1.6fr 1fr;
        grid-auto-rows: min-content;
        grid-column-gap: 24px;
        grid-row-gap: 14px;
        grid-template-areas:
            'products summary'
            'products address'
            'actions actions';
    }

    .products-section { grid-area: products; }
    .order-summary-section { 
        grid-area: summary; 
        position: sticky; 
        top: 24px; 
        align-self: start;
    }
    .address-section { 
        grid-area: address; 
        position: sticky; 
        top: calc(24px + var(--summary-offset) + 10px); 
        align-self: start;
    }
    .action-buttons { grid-area: actions; }
}

/* Micro animations */
@keyframes scaleIn {
    0% { opacity: 0; transform: translateY(6px) scale(0.98); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* Ensure the add-product card sits to the right on medium+ screens */
@media (min-width: 768px) {
    .products-grid {
        grid-template-columns: repeat(2, minmax(300px, 1fr));
    }
}
 </style>

