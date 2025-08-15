<template>
    <div class="order-detail">
        <div class="container" v-if="orderDetails">
            <!-- 页面头部 -->
            <div class="page-header">
                <div class="breadcrumb">
                    <router-link to="/home" class="breadcrumb-item">首页</router-link>
                    <span class="breadcrumb-separator">/</span>
                    <router-link to="/cart" class="breadcrumb-item">购物车</router-link>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-current">订单详情</span>
                </div>
                <h1 class="page-title">
                    <span class="icon">📋</span>
                    订单详情
                </h1>
            </div>

            <!-- 订单状态 -->
            <div class="order-status-section">
                <div class="status-header">
                    <h2>订单状态</h2>
                    <div class="status-badge success">已支付</div>
                </div>
                <div class="order-meta">
                    <div class="meta-item">
                        <span class="label">订单编号：</span>
                        <span class="value">{{ orderDetails.orderNumber }}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">下单时间：</span>
                        <span class="value">{{ formatDateTime(orderDetails.createdAt) }}</span>
                    </div>
                    <div class="meta-item">
                        <span class="label">支付时间：</span>
                        <span class="value">{{ formatDateTime(orderDetails.createdAt) }}</span>
                    </div>
                </div>
            </div>

            <!-- 收货地址 -->
            <div class="address-section">
                <h2 class="section-title">收货地址</h2>
                <div class="address-content" v-if="orderDetails.address">
                    <div class="address-info">
                        <div class="receiver">
                            <strong>{{ orderDetails.address.receiverName }}</strong>
                            <span class="phone">{{ orderDetails.address.phone }}</span>
                        </div>
                        <div class="address-detail">{{ orderDetails.address.addressInfo }}</div>
                        <div class="postal-code" v-if="orderDetails.address.postalCode">
                            邮编：{{ orderDetails.address.postalCode }}
                        </div>
                    </div>
                </div>
                <div class="no-address" v-else>
                    <p>暂无收货地址信息</p>
                </div>
            </div>

            <!-- 商品清单 -->
            <div class="products-section">
                <h2 class="section-title">商品清单</h2>
                <div class="products-list">
                    <div 
                        v-for="item in orderDetails.items" 
                        :key="`${item.shoeId}-${item.sizeId}`" 
                        class="product-item"
                    >
                        <div class="product-image">
                            <img 
                                v-if="item.image" 
                                :src="`/api/shoeImg/getImage/${item.image}`" 
                                :alt="item.name"
                                @error="handleImageError"
                            />
                            <div v-else class="no-image">📷</div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">{{ item.name }}</h3>
                            <div class="product-meta">
                                <span class="size">尺码：{{ item.sizeName }}</span>
                                <span class="quantity">数量：{{ item.quantity }} 件</span>
                            </div>
                            <div class="product-price">
                                <span class="unit-price">单价：¥{{ item.unitPrice }}</span>
                                <span class="subtotal">小计：¥{{ item.subtotal.toFixed(2) }}</span>
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
                        <span class="label">商品总数：</span>
                        <span class="value">{{ totalItems }} 件</span>
            </div>
                    <div class="summary-item">
                        <span class="label">商品总价：</span>
                        <span class="value price">¥{{ orderDetails.itemsTotal.toFixed(2) }}</span>
            </div>
                    <div class="summary-item">
                        <span class="label">运费：</span>
                        <span class="value">¥{{ orderDetails.shippingFee.toFixed(2) }}</span>
            </div>
                    <div class="summary-item total">
                        <span class="label">订单总额：</span>
                        <span class="value price">¥{{ orderDetails.orderTotal.toFixed(2) }}</span>
            </div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
                <router-link to="/cart" class="btn btn-secondary">返回购物车</router-link>
                <router-link to="/home" class="btn btn-primary">继续购物</router-link>
            </div>
        </div>

        <!-- 加载状态 -->
        <div v-else-if="loading" class="loading-container">
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
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { OrderAPI, ShoeAPI, ShoesSizeAPI, AddressAPI, ShoeImgAPI } from '@/api'

export default {
    name: 'OrderDetailPage',
    setup() {
        const route = useRoute()
        const router = useRouter()
        
        const loading = ref(false)
        const error = ref('')
        const orderDetails = ref(null)

        // 计算属性
        const totalItems = computed(() => {
            if (!orderDetails.value?.items) return 0
            return orderDetails.value.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
        })

        // 加载订单数据
        const loadOrderData = async () => {
            loading.value = true
            error.value = ''
            
            try {
                const { orderIds, fromCart, items, totalAmount, address } = route.query
                
                if (fromCart === 'true' && items && totalAmount && address) {
                    // 从购物车结算跳转过来
                    const cartItems = JSON.parse(items)
                    const addressInfo = JSON.parse(address)
                    
                    // 处理商品数据，确保包含尺码名称
                    const processedItems = cartItems.map(item => ({
                        ...item,
                        sizeName: item.size || `尺码${item.sizeId}`,
                        unitPrice: item.price || 0,
                        subtotal: (item.price || 0) * (item.quantity || 1)
                    }))
                    
                    orderDetails.value = {
                        orderNumber: `ORD${Date.now()}`,
                        createdAt: new Date(),
                        status: '已支付',
                        address: addressInfo,
                        items: processedItems,
                        itemsTotal: parseFloat(totalAmount) - 10, // 减去运费
                        shippingFee: 10,
                        orderTotal: parseFloat(totalAmount)
                    }
                    
                    console.log('订单详情数据:', orderDetails.value)
                } else if (orderIds) {
                    // 通过订单ID加载，调用后端API获取订单详情
                    const orderIdArray = orderIds.split(',').map(id => parseInt(id.trim()))
                    
                    try {
                        // 调用后端API获取订单详情
                        const orderResponse = await OrderAPI.getById(orderIds)
                        if (orderResponse.data?.code === 200 && orderResponse.data.data) {
                            const orderData = orderResponse.data.data
                            
                            // 获取订单商品详情
                            const orderItems = await Promise.all(
                                orderData.map(async (order) => {
                                    try {
                                        // 获取商品信息
                                        const shoeResponse = await ShoeAPI.getById(order.shoeId)
                                        const shoeData = shoeResponse.data?.code === 200 ? shoeResponse.data.data : null
                                        
                                        // 获取尺码信息
                                        const sizeResponse = await ShoesSizeAPI.getById(order.sizeId)
                                        const sizeData = sizeResponse.data?.code === 200 ? sizeResponse.data.data : null
                                        
                                        // 获取商品图片
                                        const imageResponse = await ShoeImgAPI.getByShoeId(order.shoeId)
                                        const imageData = imageResponse.data?.code === 200 ? imageResponse.data.data : []
                                        
                                        return {
                                            shoeId: order.shoeId,
                                            name: shoeData?.name || '未知商品',
                                            sizeName: sizeData?.size || `尺码${order.sizeId}`,
                                            quantity: order.quantity || 1,
                                            unitPrice: shoeData?.price || 0,
                                            subtotal: (shoeData?.price || 0) * (order.quantity || 1),
                                            image: imageData && imageData.length > 0 ? imageData[0].imagePath : null
                                        }
                                    } catch (itemError) {
                                        console.error('获取订单商品详情失败:', itemError)
                                        return {
                                            shoeId: order.shoeId,
                                            name: '未知商品',
                                            sizeName: `尺码${order.sizeId}`,
                                            quantity: order.quantity || 1,
                                            unitPrice: 0,
                                            subtotal: 0,
                                            image: null
                                        }
                                    }
                                })
                            )
                            
                            // 获取地址信息
                            let addressInfo = null
                            if (orderData[0]?.addressId) {
                                try {
                                    const addressResponse = await AddressAPI.getById(orderData[0].addressId)
                                    if (addressResponse.data?.code === 200) {
                                        addressInfo = addressResponse.data.data
                                    }
                                } catch (addressError) {
                                    console.error('获取地址信息失败:', addressError)
                                }
                            }
                            
                            // 计算订单总额
                            const itemsTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0)
                            const shippingFee = 10
                            const orderTotal = itemsTotal + shippingFee
                            
                            orderDetails.value = {
                                orderNumber: orderData[0]?.orderNumber || `ORD${Date.now()}`,
                                createdAt: new Date(orderData[0]?.createdAt || Date.now()),
                                status: '已支付',
                                address: addressInfo || {
                                    receiverName: '未知收货人',
                                    phone: '未知电话',
                                    addressInfo: '未知地址',
                                    postalCode: '未知邮编'
                                },
                                items: orderItems,
                                itemsTotal: itemsTotal,
                                shippingFee: shippingFee,
                                orderTotal: orderTotal
                            }
                        } else {
                            error.value = '获取订单信息失败'
                        }
                    } catch (apiError) {
                        console.error('调用订单API失败:', apiError)
                        error.value = '获取订单信息失败，请重试'
                    }
                } else {
                    error.value = '缺少必要的订单信息'
                }
            } catch (err) {
                console.error('加载订单数据失败:', err)
                error.value = '加载订单数据失败，请重试'
            } finally {
                loading.value = false
            }
        }

        // 图片加载失败处理
        const handleImageError = (event) => {
            event.target.style.display = 'none'
            const noImage = event.target.parentNode.querySelector('.no-image')
            if (noImage) {
                noImage.style.display = 'flex'
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

        onMounted(() => {
            loadOrderData()
        })

        return {
            loading,
            error,
            orderDetails,
            totalItems,
            loadOrderData,
            handleImageError,
            formatDateTime
        }
    }
}
</script>

<style scoped>
.order-detail {
    min-height: 100vh;
    background: #f8f9fa;
    padding: 2rem 0;
}

.container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 1rem;
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

.order-status-section, .address-section, .products-section, .order-summary-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
    margin: 0 0 20px 0;
    font-size: 1.5rem;
    color: #333;
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 12px;
}

.status-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.status-header h2 {
    margin: 0;
    color: #333;
}

.status-badge {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
}

.status-badge.success {
    background: #d4edda;
    color: #155724;
}

.order-meta {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.meta-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
}

.meta-item .label {
    color: #6c757d;
    font-weight: 500;
}

.meta-item .value {
    color: #333;
    font-weight: 600;
}

.address-content {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.receiver {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
}

.receiver strong {
    font-size: 1.1rem;
    color: #333;
}

.phone {
    color: #6c757d;
    font-size: 0.9rem;
}

.address-detail {
    color: #495057;
    line-height: 1.5;
    margin-bottom: 8px;
}

.postal-code {
    color: #6c757d;
    font-size: 0.9rem;
}

.no-address {
    text-align: center;
    padding: 32px;
    color: #6c757d;
}

.products-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.product-item {
    display: flex;
    gap: 20px;
    padding: 20px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    background: #f8f9fa;
}

.product-image {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.product-image img {
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
    background: #dee2e6;
    color: #6c757d;
    font-size: 2rem;
}

.product-info {
    flex: 1;
    min-width: 0;
}

.product-name {
    margin: 0 0 12px 0;
    font-size: 1.1rem;
    color: #333;
    font-weight: 600;
}

.product-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 12px;
}

.product-meta span {
    color: #6c757d;
    font-size: 0.9rem;
}

.product-price {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.unit-price {
    color: #6c757d;
    font-size: 0.9rem;
}

.subtotal {
    color: #e74c3c;
    font-weight: 600;
    font-size: 1.1rem;
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
    margin-top: 8px;
}

.summary-item .label {
    color: #6c757d;
}

.summary-item .value {
    font-weight: 500;
    color: #333;
}

.summary-item .value.price {
    color: #e74c3c;
    font-weight: 600;
}

.action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    transition: all 0.3s ease;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #5a6268;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
}

@media (max-width: 768px) {
    .container {
        padding: 0 0.5rem;
    }
    
    .product-item {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    
    .product-image {
        width: 120px;
        height: 120px;
    }
    
    .action-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .meta-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
}
</style>



