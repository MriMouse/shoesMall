<template>
    <div class="cart-page">
        <!-- 页面头部 -->
        <div class="cart-hero">
            <div class="container">
                <div class="hero-content">
                    <div class="hero-text">
                        <h1 class="hero-title">购物车</h1>
                        <p class="hero-subtitle">精选商品，品质生活</p>
                    </div>
                    <div class="hero-stats">
                        <div class="stat-item">
                            <span class="stat-number">{{ cartItems.length }}</span>
                            <span class="stat-label">件商品</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">{{ totals.checkedCount }}</span>
                            <span class="stat-label">已选择</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
                <div class="loading-spinner">
                    <svg class="spinner" viewBox="0 0 50 50">
                        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                    </svg>
                </div>
                <p class="loading-text">正在加载购物车...</p>
            </div>

            <!-- 错误状态 -->
            <div v-else-if="error" class="error-state">
                <div class="error-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <h3 class="error-title">加载失败</h3>
                <p class="error-message">{{ error }}</p>
                <button @click="loadCartData" class="retry-btn">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    重试
                </button>
            </div>

            <!-- 购物车主体内容 -->
            <div v-else-if="cartItems.length > 0" class="cart-main">
                <!-- 操作栏 -->
                <div class="cart-toolbar">
                    <div class="toolbar-left">
                        <label class="select-all-wrapper">
                            <input 
                                type="checkbox" 
                                :checked="hasAllChecked" 
                                @change="toggleSelectAll"
                                class="select-all-checkbox"
                            />
                            <span class="select-all-text">全选</span>
                        </label>
                        <button 
                            @click="clearAll" 
                            class="clear-all-btn"
                            :disabled="cartItems.length === 0"
                        >
                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            清空购物车
                        </button>
                    </div>
                    <div class="toolbar-right">
                        <div class="cart-summary">
                            <span class="summary-text">已选择 {{ checkedItemsCount }} 件商品</span>
                            <span class="summary-total">¥{{ totals.discounted.toFixed(2) }}</span>
                        </div>
                        <button 
                            @click="goCheckout" 
                            :disabled="!hasCheckedItems"
                            class="checkout-btn"
                        >
                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
                            </svg>
                            立即结算
                        </button>
                    </div>
                </div>

                <!-- 商品列表 -->
                <div class="cart-items">
                    <TransitionGroup name="cart-item" tag="div" class="items-container">
                        <div 
                            v-for="item in cartItems" 
                            :key="item.orderId" 
                            class="cart-item-card"
                            :class="{ 'disabled': item.shoeDisabled }"
                        >
                            <!-- 选择框 -->
                            <div class="item-select">
                                <input 
                                    type="checkbox" 
                                    v-model="item.checked"
                                    :disabled="item.shoeDisabled"
                                    @change="updateSelection"
                                    class="item-checkbox"
                                />
                            </div>
                            
                            <!-- 商品图片 -->
                            <div class="item-image">
                                <div class="image-wrapper">
                                    <img 
                                        v-if="item.image" 
                                        :src="getShoeImage(item)" 
                                        :alt="item.shoeName"
                                        @error="handleImageError"
                                        class="product-image"
                                    />
                                    <div v-else class="no-image">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                    </div>
                                    <div v-if="item.shoeDisabled" class="disabled-overlay">
                                        <span>已下架</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 商品信息 -->
                            <div class="item-info">
                                <div class="info-header">
                                    <h3 class="item-name">{{ item.shoeName }}</h3>
                                    <div class="item-badges">
                                        <span v-if="item.points" class="badge points-badge">
                                            +{{ item.points }}积分
                                        </span>
                                        <span v-if="item.discountPrice && item.discountPrice < item.price" class="badge discount-badge">
                                            优惠
                                        </span>
                                    </div>
                                </div>
                                <div class="info-meta">
                                    <span class="meta-item brand">{{ item.brandName }}</span>
                                    <span class="meta-item type">{{ item.typeName }}</span>
                                    <span class="meta-item size">尺码 {{ item.size }}</span>
                                </div>
                                <div class="info-price">
                                    <span class="current-price">¥{{ getCurrentPrice(item) }}</span>
                                    <span v-if="item.discountPrice && item.discountPrice < item.price" class="original-price">¥{{ item.price }}</span>
                                </div>
                            </div>
                            
                            <!-- 数量控制 -->
                            <div class="item-quantity">
                                <div class="quantity-control">
                                    <button 
                                        @click="decreaseQuantity(item)" 
                                        :disabled="item.quantity <= 1 || item.shoeDisabled"
                                        class="quantity-btn"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                                        </svg>
                                    </button>
                                    <input 
                                        v-model.number="item.quantity" 
                                        type="number" 
                                        min="1" 
                                        max="99"
                                        :disabled="item.shoeDisabled"
                                        @blur="validateQuantity(item)"
                                        @keyup.enter="validateQuantity(item)"
                                        class="quantity-input"
                                    />
                                    <button 
                                        @click="increaseQuantity(item)" 
                                        :disabled="item.quantity >= 99 || item.shoeDisabled"
                                        class="quantity-btn"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- 小计 -->
                            <div class="item-subtotal">
                                <span class="subtotal-label">小计</span>
                                <span class="subtotal-amount">¥{{ calculateSubtotal(item) }}</span>
                            </div>
                            
                            <!-- 操作按钮 -->
                            <div class="item-actions">
                                <button 
                                    @click="removeOrder(item)" 
                                    class="action-btn remove-btn"
                                    title="删除商品"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                                <button 
                                    @click="paySingleItem(item)" 
                                    :disabled="item.shoeDisabled"
                                    class="action-btn buy-btn"
                                    title="立即购买"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </TransitionGroup>
                </div>

                <!-- 底部结算栏 -->
                <div class="cart-footer">
                    <div class="footer-left">
                        <router-link to="/home" class="continue-shopping">
                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                            </svg>
                            继续购物
                        </router-link>
                    </div>
                    <div class="footer-center">
                        <div class="price-breakdown">
                            <div class="breakdown-item">
                                <span class="breakdown-label">商品总额</span>
                                <span class="breakdown-value">¥{{ totals.original.toFixed(2) }}</span>
                            </div>
                            <div v-if="totals.original > totals.discounted" class="breakdown-item savings">
                                <span class="breakdown-label">优惠金额</span>
                                <span class="breakdown-value">-¥{{ (totals.original - totals.discounted).toFixed(2) }}</span>
                            </div>
                            <div class="breakdown-item points">
                                <span class="breakdown-label">可获得积分</span>
                                <span class="breakdown-value">{{ totals.points }} 分</span>
                            </div>
                        </div>
                    </div>
                    <div class="footer-right">
                        <div class="final-total">
                            <span class="total-label">应付总额</span>
                            <span class="total-amount">¥{{ totals.discounted.toFixed(2) }}</span>
                        </div>
                        <button 
                            @click="goCheckout"
                            :disabled="!hasCheckedItems"
                            class="final-checkout-btn"
                        >
                            立即结算
                            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- 空购物车状态 -->
            <div v-else class="empty-cart">
                <div class="empty-content">
                    <div class="empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"/>
                        </svg>
                    </div>
                    <h2 class="empty-title">购物车是空的</h2>
                    <p class="empty-description">快去添加一些心仪的商品吧！</p>
                    <router-link to="/home" class="empty-action-btn">
                        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                        开始购物
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ShoeAPI, ShoesSizeAPI } from '@/api'
import cartManager from '@/utils/cart'
import userManager from '@/utils/userManager'

export default {
    name: 'CartPage',
    data() {
        return {
            loading: false,
            error: '',
            username: '',
            userId: null,
            cartItems: [],
            sizeOptions: [],
            keyword: '',
            searchHistory: []
        }
    },
    computed: {
        // 根据关键词过滤商品
        filteredItems() {
            if (!this.keyword.trim()) {
                return this.cartItems
            }
            const keyword = this.keyword.toLowerCase().trim()
            return this.cartItems.filter(item => 
                item.shoeName?.toLowerCase().includes(keyword) ||
                item.brandName?.toLowerCase().includes(keyword) ||
                item.typeName?.toLowerCase().includes(keyword) ||
                item.orderNumber?.toLowerCase().includes(keyword)
            )
        },
        
        // 搜索建议
        searchSuggestions() {
            if (!this.keyword.trim()) {
                return this.searchHistory.slice(0, 5)
            }
            
            const keyword = this.keyword.toLowerCase().trim()
            const suggestions = []
            
            // 从商品名称中搜索建议
            this.cartItems.forEach(item => {
                if (item.shoeName?.toLowerCase().includes(keyword)) {
                    suggestions.push(item.shoeName)
                }
                if (item.brandName?.toLowerCase().includes(keyword)) {
                    suggestions.push(item.brandName)
                }
                if (item.typeName?.toLowerCase().includes(keyword)) {
                    suggestions.push(item.typeName)
                }
            })
            
            // 去重并限制数量
            return [...new Set(suggestions)].slice(0, 5)
        },
        
        // 计算总数和价格
        totals() {
            const checkedItems = this.cartItems.filter(item => item.checked && !item.shoeDisabled)
            const count = this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
            const checkedCount = checkedItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
            const original = checkedItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
            const discounted = checkedItems.reduce((sum, item) => sum + (this.getCurrentPrice(item) * (item.quantity || 1)), 0)
            const points = checkedItems.reduce((sum, item) => sum + (item.points || 0) * (item.quantity || 1), 0)
            
            return {
                count,
                checkedCount,
                original,
                discounted,
                points
            }
        },
        
        // 全选状态
        selectAll: {
            get() {
                const availableItems = this.cartItems.filter(item => !item.shoeDisabled)
                return availableItems.length > 0 && availableItems.every(item => item.checked)
            },
            set(value) {
                this.cartItems.forEach(item => {
                    if (!item.shoeDisabled) {
                        item.checked = value
                    }
                })
            }
        },
        
        // 半选状态
        isIndeterminate() {
            const availableItems = this.cartItems.filter(item => !item.shoeDisabled)
            const checkedCount = availableItems.filter(item => item.checked).length
            return checkedCount > 0 && checkedCount < availableItems.length
        },
        
        // 是否有选中的商品
        hasCheckedItems() {
            return this.cartItems.some(item => item.checked && !item.shoeDisabled)
        },

        // 计算已选商品数量
        checkedItemsCount() {
            return this.cartItems.filter(item => item.checked && !item.shoeDisabled).length;
        },

        // 判断是否全选
        hasAllChecked() {
            return this.cartItems.length > 0 && this.cartItems.every(item => item.checked || item.shoeDisabled);
        }
    },
    methods: {
        // 加载购物车数据
        async loadCartData() {
            this.loading = true
            this.error = ''
            
            try {
                console.log('=== 开始加载购物车数据 ===')
                console.log('当前用户ID:', this.userId)
                console.log('购物车管理器用户ID:', cartManager.userId)
                
                // 使用购物车管理器获取购物车数据
                let cartData = await cartManager.getCartDetails()
                console.log('购物车管理器返回的数据:', cartData)
                console.log('第一个订单的详细结构:', cartData[0])
                console.log('第一个订单的orderShoeNum:', cartData[0]?.orderShoeNum)
                
                if (cartData && cartData.length > 0) {
                    console.log('购物车有数据，开始处理...')
                    // 处理购物车数据，确保包含所有必要信息
                    this.cartItems = cartData.map(order => {
                        console.log('处理订单:', order)
                        console.log('订单的orderShoeNum:', order.orderShoeNum)
                        
                        return {
                            orderId: order.orderId,
                            shoeId: order.orderShoeNum?.shoeId,
                            sizeId: order.sizeId,
                            quantity: order.orderShoeNum?.shoeNum || 1,
                            price: order.price || 0,
                            discountPrice: order.discountPrice || order.price || 0,
                            shoeName: order.shoeName || '未知商品',
                            brandName: order.brandName || '未知品牌',
                            typeName: order.typeName || '未知类型',
                            size: order.size || `尺码${order.sizeId}`,
                            image: order.image || null,
                            checked: false,
                            shoeDisabled: false
                        }
                    })
                    console.log('处理后的购物车商品:', this.cartItems)
                } else {
                    console.log('购物车没有数据')
                    this.cartItems = []
                }
                
                // 检查商品是否已下线
                await this.checkProductStatus()
                
                // 加载商品详细信息（名称、品牌、类型等）
                await this.loadShoeDetails()
                
            } catch (error) {
                console.error('加载购物车数据失败:', error)
                this.error = '加载购物车数据失败，请重试'
            } finally {
                this.loading = false
            }
        },
        
        // 检查商品状态
        async checkProductStatus() {
            try {
                const checkPromises = this.cartItems.map(async (item) => {
                    try {
                        // 确保有商品ID才调用API
                        if (!item.shoeId) {
                            console.warn('商品ID为空，跳过状态检查:', item)
                            item.shoeDisabled = true
                            return
                        }
                        
                        console.log('检查商品状态，商品ID:', item.shoeId)
                        
                        // 调用后端API检查商品状态
                        const response = await ShoeAPI.getById(item.shoeId)
                        if (response.data?.code === 200 && response.data.data) {
                            const shoeData = response.data.data
                            item.shoeDisabled = !shoeData.status || shoeData.status === 0
                            item.shoeName = shoeData.name || item.shoeName
                            item.price = shoeData.price || item.price
                            item.discountPrice = shoeData.discountPrice || item.price
                        } else {
                            item.shoeDisabled = true
                        }
                    } catch (error) {
                        console.error(`检查商品 ${item.shoeId} 状态失败:`, error)
                        item.shoeDisabled = true
                    }
                })
                
                await Promise.all(checkPromises)
            } catch (error) {
                console.error('检查商品状态失败:', error)
            }
        },
        
        async loadShoeDetails() {
            try {
                const promises = this.cartItems.map(async (item) => {
                    if (item.shoeId) {
                        try {
                            console.log('加载商品详情，商品ID:', item.shoeId)
                            
                            const shoeResponse = await ShoeAPI.getById(item.shoeId)
                            if (shoeResponse.data?.code === 200) {
                                const shoe = shoeResponse.data.data
                                console.log('获取到的商品信息:', shoe)
                                
                                Object.assign(item, {
                                    shoeName: shoe.name || item.shoeName,
                                    serialNumber: shoe.serialNumber,
                                    price: shoe.price || item.price,
                                    discountPrice: shoe.discountPrice || item.discountPrice,
                                    points: shoe.points || item.points,
                                    brandName: shoe.brand?.brandName || item.brandName,
                                    typeName: shoe.shoesType?.typeName || item.typeName,
                                    shoeDisabled: shoe.shoeDisabled || false
                                })
                                
                                // 获取商品图片
                                try {
                                    const imageResponse = await ShoeAPI.getImages(item.shoeId)
                                    if (imageResponse.data?.code === 200 && imageResponse.data.data?.length > 0) {
                                        item.image = imageResponse.data.data[0].imagePath
                                        console.log('获取到的商品图片:', item.image)
                                    }
                                } catch (imgError) {
                                    console.error(`加载商品${item.shoeId}图片失败:`, imgError)
                                    item.image = null
                                }
                            } else {
                                console.error(`获取商品${item.shoeId}信息失败:`, shoeResponse)
                            }
                        } catch (error) {
                            console.error(`加载商品${item.shoeId}详情失败:`, error)
                        }
                    } else {
                        console.warn('商品ID为空，跳过详情加载:', item)
                    }
                })
                
                await Promise.all(promises)
                console.log('所有商品详情加载完成:', this.cartItems)
            } catch (error) {
                console.error('加载商品详情失败:', error)
            }
        },
        
        // 处理图片加载错误
        handleImageError(event) {
            event.target.style.display = 'none'
            const noImage = event.target.parentNode.querySelector('.no-image')
            if (noImage) {
                noImage.style.display = 'flex'
            }
        },
        
        // 获取当前价格
        getCurrentPrice(item) {
            return item.discountPrice || item.price || 0
        },
        
        // 计算商品小计
        calculateSubtotal(item) {
            const price = this.getCurrentPrice(item)
            const quantity = item.quantity || 1
            return (price * quantity).toFixed(2)
        },
        
        // 加载尺码选项
        async loadSizeOptions() {
            try {
                const response = await ShoesSizeAPI.getAll()
                if (response.data?.code === 200 && response.data.data) {
                    this.sizeOptions = response.data.data
                }
            } catch (error) {
                console.error('加载尺码选项失败:', error)
            }
        },
        
        // 获取尺码名称
        getSizeName(sizeId) {
            const size = this.sizeOptions.find(s => s.sizeId === sizeId)
            return size ? size.size : `尺码${sizeId}`
        },
        
        // 获取订单状态文本
        getStatusText(status) {
            switch (status) {
                case 10: return '购物车'
                case 1: return '已付款'
                case 0: return '待处理'
                default: return '未知状态'
            }
        },
        
        // 获取订单状态样式类
        getStatusClass(status) {
            switch (status) {
                case 10: return 'status-cart'
                case 1: return 'status-paid'
                case 0: return 'status-pending'
                default: return 'status-unknown'
            }
        },
        
        // 获取商品图片
        getShoeImage(item) {
            if (item.image) {
                return `/api/shoeImg/getImage/${item.image}`
            }
            return '/src/assets/logo.png'
        },
        
        // 增加商品数量
        increaseQuantity(item) {
            if (item.quantity < 99) {
                item.quantity++
                this.updateOrderQuantity(item)
            }
        },
        
        // 减少商品数量
        decreaseQuantity(item) {
            if (item.quantity > 1) {
                item.quantity--
                this.updateOrderQuantity(item)
            }
        },
        
        // 验证商品数量
        validateQuantity(item) {
            if (item.quantity < 1) {
                item.quantity = 1
            } else if (item.quantity > 99) {
                item.quantity = 99
            }
            // 确保是整数
            item.quantity = Math.floor(item.quantity)
            // 更新到后端
            this.updateOrderQuantity(item)
        },
        
        async updateOrderSize(item) {
            try {
                // 使用购物车管理器更新尺码
                const success = await cartManager.updateCartItemSize(item.orderId, item.sizeId)
                
                if (success) {
                    this.showSuccess('尺码更新成功')
                } else {
                    this.showError('尺码更新失败')
                    // 恢复原值
                    this.loadCartData()
                }
            } catch (error) {
                console.error('更新尺码失败:', error)
                this.showError('更新尺码失败')
                // 恢复原值
                this.loadCartData()
            }
        },
        
        async updateOrderQuantity(item) {
            try {
                console.log('更新商品数量:', {
                    orderId: item.orderId,
                    shoeId: item.shoeId,
                    quantity: item.quantity
                })
                
                // 使用购物车管理器更新数量
                const success = await cartManager.updateCartItemQuantity(item.orderId, item.shoeId, item.quantity)
                
                if (success) {
                    this.showSuccess('数量更新成功')
                    // 触发购物车更新事件
                    cartManager.triggerUpdate()
                } else {
                    this.showError('数量更新失败')
                    // 恢复原值
                    this.loadCartData()
                }
            } catch (error) {
                console.error('更新数量失败:', error)
                this.showError('数量更新失败')
                // 恢复原值
                this.loadCartData()
            }
        },
        
        // 删除订单
        async removeOrder(item) {
            if (!confirm(`确定要删除商品"${item.shoeName}"吗？`)) return
            
            try {
                console.log('删除商品:', {
                    orderId: item.orderId,
                    shoeId: item.shoeId,
                    shoeName: item.shoeName
                })
                
                // 使用购物车管理器删除商品
                const success = await cartManager.removeFromCart(item.orderId, item.shoeId)
                
                if (success) {
                    this.showSuccess('删除成功')
                    // 从本地列表中移除
                    this.cartItems = this.cartItems.filter(x => x.orderId !== item.orderId)
                    // 使用购物车管理器触发更新
                    cartManager.triggerUpdate()
                } else {
                    this.showError('删除失败')
                }
            } catch (error) {
                console.error('删除订单失败:', error)
                this.showError('删除失败')
            }
        },
        
        async clearAll() {
            if (!confirm(`确定要清空购物车吗？\n当前购物车中有 ${this.cartItems.length} 件商品，此操作不可恢复！`)) return
            
            try {
                console.log('清空购物车，用户ID:', this.userId)
                
                // 使用购物车管理器清空购物车
                const success = await cartManager.clearCart()
                
                if (success) {
                    this.showSuccess('购物车已清空')
                    this.cartItems = []
                    // 使用购物车管理器触发更新
                    cartManager.triggerUpdate()
                } else {
                    this.showError('清空购物车失败')
                }
            } catch (error) {
                console.error('清空购物车失败:', error)
                this.showError('清空购物车失败')
            }
        },
        
        // 继续购物
        goShopping() {
            this.$router.push('/')
        },
        
        // 去结算
        goCheckout() {
            if (!this.hasCheckedItems) {
                this.showWarning('请先选择要购买的商品')
                return
            }
            
            // 获取选中的商品
            const selectedItems = this.cartItems.filter(item => item.checked && !item.shoeDisabled)
            
            if (selectedItems.length === 0) {
                this.showWarning('没有选中的商品')
                return
            }
            
            // 跳转到订单确认页面，传递购物车商品信息
            this.$router.push({
                name: 'OrderConfirmation',
                query: {
                    fromCart: 'true',
                    orderIds: selectedItems.map(item => item.orderId).join(','),
                    items: JSON.stringify(selectedItems.map(item => ({
                        orderId: item.orderId,
                        shoeId: item.shoeId,
                        sizeId: item.sizeId,
                        quantity: item.quantity,
                        price: item.price,
                        discountPrice: item.discountPrice,
                        shoeName: item.shoeName,
                        brandName: item.brandName,
                        typeName: item.typeName,
                        size: item.size,
                        points: item.points || 0
                    })))
                }
            })
        },
        
        // 单个商品支付
        async paySingleItem(item) {
            if (item.shoeDisabled) {
                this.showWarning('该商品已下线，无法购买')
                return
            }
            
            try {
                // 跳转到订单确认页面，传递单个商品信息
                this.$router.push({ 
                    name: 'OrderConfirmation', 
                    query: { 
                        fromCart: 'true',
                        orderIds: item.orderId.toString(),
                        items: JSON.stringify([{
                            orderId: item.orderId,
                            shoeId: item.shoeId,
                            sizeId: item.sizeId,
                            quantity: item.quantity,
                            price: item.price,
                            discountPrice: item.discountPrice,
                            shoeName: item.shoeName,
                            brandName: item.brandName,
                            typeName: item.typeName,
                            size: item.size,
                            points: item.points || 0
                        }])
                    }
                })
            } catch (error) {
                console.error('单个商品结算失败:', error)
                this.showError('结算失败，请重试')
            }
        },

        // 显示消息提示
        showMessage(message, type = 'info') {
            // 这里可以实现消息提示功能
            console.log(`${type}: ${message}`)
            alert(message)
        },
        
        // 显示成功消息
        showSuccess(message) {
            this.showMessage(message, 'success')
        },
        
        // 显示错误消息
        showError(message) {
            this.showMessage(message, 'error')
        },
        
        // 显示警告消息
        showWarning(message) {
            this.showMessage(message, 'warning')
        },
        
        // 切换全选状态
        toggleSelectAll() {
            const availableItems = this.cartItems.filter(item => !item.shoeDisabled)
            const allChecked = availableItems.every(item => item.checked)
            
            availableItems.forEach(item => {
                item.checked = !allChecked
            })
        },
        
        // 更新商品选择状态
        updateSelection() {
            // 触发计算属性重新计算
            this.$forceUpdate()
        }
    },
    
    async mounted() {
        // 获取用户信息
        const user = userManager.getCurrentUser()
        if (user) {
            this.username = typeof user === 'string' ? user : (user.username || '')
            this.userId = await userManager.getUserId()
        } else {
            this.username = '未登录用户'
            this.userId = null
        }

        // 设置购物车管理器的用户ID（如果全局未设置）
        if (this.userId && cartManager.userId !== this.userId) {
            cartManager.setUserId(this.userId)
        }
        
        // 加载购物车数据和尺码选项
        await Promise.all([
            this.loadCartData(),
            this.loadSizeOptions()
        ])
    }
}
</script>

<style scoped>
.cart-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #ffffff;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* 页面头部 */
.cart-hero {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    padding: 30px 0;
    margin-bottom: 30px;
    border-radius: 0 0 30px 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.hero-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}

.hero-text {
    flex: 1;
    margin-right: 40px;
}

.hero-title {
    font-size: 2.5rem;
    font-weight: 900;
    color: #ffffff;
    margin-bottom: 8px;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    letter-spacing: -1px;
}

.hero-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0;
    font-weight: 300;
}

.hero-stats {
    display: flex;
    gap: 20px;
}

.stat-item {
    text-align: center;
    background: rgba(255, 255, 255, 0.08);
    padding: 15px 20px;
    border-radius: 12px;
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
}

.stat-item:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.stat-number {
    font-size: 1.8rem;
    font-weight: 900;
    color: #ffffff;
    display: block;
    margin-bottom: 4px;
}

.stat-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
}

/* 购物车主体 */
.cart-main {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    margin-bottom: 40px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
}

.cart-main::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #000000, #333333, #000000);
    border-radius: 20px 20px 0 0;
}

/* 操作栏 */
.cart-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 32px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 1px solid #e9ecef;
    position: relative;
}

.cart-toolbar::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #dee2e6, transparent);
}

.toolbar-left {
    display: flex;
    align-items: center;
    gap: 20px;
}

.select-all-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.3s ease;
    color: #333;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.select-all-wrapper:hover {
    background: rgba(255, 255, 255, 1);
    border-color: rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.select-all-checkbox {
    width: 18px;
    height: 18px;
    accent-color: #000000;
}

.select-all-text {
    font-weight: 600;
    color: #333;
}

.clear-all-btn {
    padding: 10px 20px;
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
    position: relative;
    overflow: hidden;
}

.clear-all-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.clear-all-btn:hover::before {
    left: 100%;
}

.clear-all-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.btn-icon {
    width: 16px;
    height: 16px;
}

.toolbar-right {
    display: flex;
    align-items: center;
    gap: 20px;
}

.cart-summary {
    display: flex;
    align-items: center;
    gap: 15px;
    background: rgba(255, 255, 255, 0.9);
    padding: 12px 20px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.summary-text {
    color: #666;
    font-weight: 500;
}

.summary-total {
    font-size: 1.3rem;
    color: #000000;
    font-weight: 800;
}

.checkout-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #000000 0%, #333333 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
}

.checkout-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.checkout-btn:hover::before {
    left: 100%;
}

.checkout-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.checkout-btn:disabled {
    background: #6c757d;
    opacity: 0.7;
    cursor: not-allowed;
}

/* 商品列表 */
.cart-items {
    padding: 0;
}

.items-container {
    display: flex;
    flex-direction: column;
}

.cart-item-card {
    display: grid;
    grid-template-columns: 60px 140px 1fr 140px 160px 140px 120px;
    gap: 20px;
    align-items: center;
    padding: 24px 32px;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.3s ease;
    background: #ffffff;
    position: relative;
    margin: 8px 16px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.cart-item-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #000000, #333333);
    border-radius: 16px 16px 0 0;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.cart-item-card:hover::before {
    opacity: 1;
}

.cart-item-card:hover {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    transform: translateX(4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: rgba(0, 0, 0, 0.1);
}

.cart-item-card.disabled {
    opacity: 0.6;
    background: #f8f9fa;
}

.cart-item-card:last-child {
    border-bottom: none;
}

/* 选择框 */
.item-select {
    display: flex;
    justify-content: center;
}

.item-checkbox {
    width: 20px;
    height: 20px;
    accent-color: #000000;
    cursor: pointer;
    transition: all 0.3s ease;
}

.item-checkbox:checked {
    transform: scale(1.1);
}

/* 商品图片 */
.item-image {
    width: 140px;
    height: 140px;
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 1px solid #e9ecef;
}

.item-image:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
}

.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.item-image:hover .product-image {
    transform: scale(1.1);
}

.no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    color: #6c757d;
}

.no-image svg {
    width: 48px;
    height: 48px;
    opacity: 0.5;
}

.disabled-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-weight: 600;
    backdrop-filter: blur(2px);
}

/* 商品信息 */
.item-info {
    min-width: 0;
}

.info-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
}

.item-name {
    margin: 0;
    font-size: 1.2rem;
    color: #000000;
    font-weight: 700;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.3s ease;
}

.cart-item-card:hover .item-name {
    color: #333333;
}

.item-badges {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

.badge {
    font-size: 0.75rem;
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
}

.points-badge {
    background: linear-gradient(135deg, #000000, #333333);
    color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.points-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.discount-badge {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: #ffffff;
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.discount-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(220, 53, 69, 0.4);
}

.info-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.meta-item {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.85rem;
    color: #333333;
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
}

.meta-item:hover {
    background: linear-gradient(135deg, #e9ecef, #dee2e6);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-price {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.current-price {
    font-size: 1.3rem;
    font-weight: 800;
    color: #000000;
    transition: color 0.3s ease;
}

.cart-item-card:hover .current-price {
    color: #dc3545;
}

.original-price {
    font-size: 0.9rem;
    color: #6c757d;
    text-decoration: line-through;
}

/* 数量控制 */
.item-quantity {
    display: flex;
    justify-content: center;
}

.quantity-control {
    display: flex;
    align-items: center;
    border: 2px solid #000000;
    border-radius: 12px;
    overflow: hidden;
    background: white;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.quantity-control:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
}

.quantity-btn {
    width: 40px;
    height: 40px;
    border: none;
    background: #ffffff;
    color: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.quantity-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    transition: all 0.3s ease;
    transform: translate(-50%, -50%);
}

.quantity-btn:hover::before {
    width: 100%;
    height: 100%;
}

.quantity-btn:hover:not(:disabled) {
    background: #000000;
    color: #ffffff;
}

.quantity-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #f8f9fa;
    color: #6c757d;
}

.quantity-btn svg {
    width: 16px;
    height: 16px;
    position: relative;
    z-index: 1;
}

.quantity-input {
    width: 70px;
    height: 40px;
    text-align: center;
    border: none;
    font-size: 1rem;
    color: #000000;
    font-weight: 600;
    background: white;
    transition: background 0.3s ease;
}

.quantity-input:focus {
    outline: none;
    background: #f8f9fa;
}

/* 小计 */
.item-subtotal {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.subtotal-label {
    font-size: 0.8rem;
    color: #6c757d;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.subtotal-amount {
    font-size: 1.3rem;
    font-weight: 800;
    color: #000000;
    transition: color 0.3s ease;
}

.cart-item-card:hover .subtotal-amount {
    color: #dc3545;
}

/* 操作按钮 */
.item-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.action-btn {
    width: 100%;
    padding: 10px 16px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: relative;
    overflow: hidden;
}

.action-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.action-btn:hover::before {
    left: 100%;
}

.remove-btn {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.2);
}

.remove-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.buy-btn {
    background: linear-gradient(135deg, #000000 0%, #333333 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.buy-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.buy-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.7;
}

.action-btn svg {
    width: 14px;
    height: 14px;
    position: relative;
    z-index: 1;
}

/* 底部结算栏 */
.cart-footer {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: 32px;
    padding: 32px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-top: 1px solid #e9ecef;
    position: relative;
}

.cart-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #dee2e6, transparent);
}

.footer-left {
    display: flex;
    align-items: center;
}

.continue-shopping {
    padding: 12px 24px;
    background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
    position: relative;
    overflow: hidden;
}

.continue-shopping::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.continue-shopping:hover::before {
    left: 100%;
}

.continue-shopping:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
}

.footer-center {
    display: flex;
    justify-content: center;
}

.price-breakdown {
    background: white;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    min-width: 300px;
    border: 1px solid #e9ecef;
    position: relative;
    overflow: hidden;
}

.price-breakdown::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #000000, #333333);
}

.breakdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px dashed #e9ecef;
    color: #333333;
    transition: all 0.3s ease;
}

.breakdown-item:hover {
    background: rgba(0, 0, 0, 0.02);
    padding-left: 8px;
    padding-right: 8px;
    border-radius: 8px;
}

.breakdown-item:last-child {
    border-bottom: none;
}

.breakdown-label {
    font-size: 0.95rem;
    font-weight: 500;
    color: #666666;
}

.breakdown-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #000000;
}

.breakdown-item.savings .breakdown-value {
    color: #28a745;
}

.breakdown-item.points .breakdown-value {
    color: #000000;
}

.footer-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 16px;
}

.final-total {
    background: white;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e9ecef;
    position: relative;
    overflow: hidden;
}

.final-total::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #000000, #333333);
}

.total-label {
    font-size: 1.2rem;
    font-weight: 700;
    color: #333333;
}

.total-amount {
    font-size: 1.5rem;
    font-weight: 900;
    color: #000000;
}

.final-checkout-btn {
    padding: 16px 32px;
    background: linear-gradient(135deg, #000000 0%, #333333 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
}

.final-checkout-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.final-checkout-btn:hover::before {
    left: 100%;
}

.final-checkout-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.final-checkout-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.7;
}

/* 空购物车状态 */
.empty-cart {
    text-align: center;
    padding: 120px 20px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
}

.empty-cart::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #000000, #333333, #000000);
}

.empty-content {
    position: relative;
    z-index: 2;
}

.empty-icon {
    font-size: 6rem;
    margin-bottom: 24px;
    color: #e9ecef;
    animation: float 3s ease-in-out infinite;
}

.empty-icon svg {
    width: 120px;
    height: 120px;
    opacity: 0.3;
}

.empty-title {
    margin: 0 0 16px 0;
    color: #000000;
    font-size: 2rem;
    font-weight: 800;
}

.empty-description {
    margin: 0 0 32px 0;
    color: #666666;
    font-size: 1.1rem;
}

.empty-action-btn {
    padding: 16px 32px;
    background: linear-gradient(135deg, #000000 0%, #333333 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
}

.empty-action-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.empty-action-btn:hover::before {
    left: 100%;
}

.empty-action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}



/* 动画效果 */
@keyframes float {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-10px);
    }
}

/* 购物车项目动画 */
.cart-item-enter-active,
.cart-item-leave-active {
    transition: all 0.5s ease;
}

.cart-item-enter-from {
    opacity: 0;
    transform: translateX(-30px);
}

.cart-item-leave-to {
    opacity: 0;
    transform: translateX(30px);
}

.cart-item-move {
    transition: transform 0.5s ease;
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .hero-content {
        flex-direction: column;
        gap: 25px;
        text-align: center;
    }
    
    .hero-text {
        margin-right: 0;
    }
    
    .hero-title {
        font-size: 2rem;
    }
    
    .hero-stats {
        gap: 15px;
    }
    
    .cart-item-card {
        grid-template-columns: 50px 120px 1fr 120px 140px 120px 100px;
        gap: 16px;
        padding: 20px 24px;
        margin: 6px 12px;
    }
    
    .item-image {
        width: 120px;
        height: 120px;
    }
    
    .cart-footer {
        grid-template-columns: 1fr;
        gap: 24px;
    }
    
    .footer-left,
    .footer-right {
        justify-content: center;
    }
    
    .price-breakdown {
        min-width: auto;
        width: 100%;
        max-width: 400px;
    }
    

}

@media (max-width: 768px) {
    .cart-hero {
        padding: 20px 0;
        margin-bottom: 20px;
    }
    
    .hero-content {
        gap: 20px;
        padding: 0 1rem;
    }
    
    .hero-title {
        font-size: 1.8rem;
        margin-bottom: 6px;
    }
    
    .hero-subtitle {
        font-size: 0.9rem;
    }
    
    .hero-stats {
        gap: 12px;
    }
    
    .stat-item {
        padding: 12px 16px;
    }
    
    .stat-number {
        font-size: 1.5rem;
    }
    
    .stat-label {
        font-size: 0.75rem;
    }
    
    .cart-toolbar {
        flex-direction: column;
        gap: 20px;
        align-items: stretch;
        padding: 20px 24px;
    }
    
    .toolbar-left {
        justify-content: space-between;
    }
    
    .toolbar-right {
        flex-direction: column;
        gap: 16px;
    }
    
    .cart-summary {
        justify-content: center;
    }
    
    .cart-item-card {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 20px;
        text-align: center;
        margin: 8px 12px;
    }
    
    .item-image {
        width: 120px;
        height: 120px;
        margin: 0 auto;
    }
    
    .info-header {
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
    
    .item-badges {
        justify-content: center;
    }
    
    .info-meta {
        justify-content: center;
    }
    
    .item-actions {
        flex-direction: row;
        justify-content: center;
        gap: 12px;
    }
    
    .action-btn {
        width: auto;
        min-width: 120px;
    }
    
    .cart-footer {
        padding: 24px 20px;
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .price-breakdown {
        padding: 20px;
        margin: 0 auto;
    }
    
    .breakdown-item {
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }
    
    .final-checkout-btn {
        padding: 14px 24px;
        font-size: 1rem;
    }
    
    .empty-cart {
        padding: 80px 20px;
    }
    
    .empty-title {
        font-size: 1.5rem;
    }
    
    .empty-description {
        font-size: 1rem;
    }
    

}

@media (max-width: 480px) {
    .container {
        padding: 0 0.5rem;
    }
    
    .cart-hero {
        padding: 15px 0;
        margin-bottom: 15px;
    }
    
    .hero-content {
        padding: 0 0.5rem;
        gap: 15px;
    }
    
    .hero-title {
        font-size: 1.5rem;
        margin-bottom: 4px;
    }
    
    .hero-subtitle {
        font-size: 0.8rem;
    }
    
    .hero-stats {
        flex-direction: column;
        gap: 10px;
    }
    
    .stat-item {
        padding: 10px 15px;
        border-radius: 10px;
    }
    
    .stat-number {
        font-size: 1.3rem;
        margin-bottom: 2px;
    }
    
    .stat-label {
        font-size: 0.7rem;
    }
    
    .cart-toolbar {
        padding: 16px 12px;
    }
    
    .toolbar-left {
        flex-direction: column;
        gap: 12px;
        align-items: stretch;
    }
    
    .select-all-wrapper {
        justify-content: center;
    }
    
    .clear-all-btn {
        justify-content: center;
    }
    
    .cart-item-card {
        padding: 16px;
        margin: 6px 8px;
        border-radius: 12px;
    }
    
    .item-image {
        width: 100px;
        height: 100px;
    }
    
    .item-name {
        font-size: 1rem;
    }
    
    .info-meta {
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }
    
    .meta-item {
        font-size: 0.8rem;
        padding: 4px 10px;
    }
    
    .quantity-control {
        border-width: 1px;
    }
    
    .quantity-btn {
        width: 36px;
        height: 36px;
    }
    
    .quantity-input {
        width: 60px;
        height: 36px;
        font-size: 0.9rem;
    }
    
    .cart-footer {
        padding: 20px 16px;
    }
    
    .price-breakdown {
        padding: 16px;
        border-radius: 12px;
    }
    
    .breakdown-item {
        padding: 6px 0;
    }
    
    .final-total {
        padding: 20px 16px;
        border-radius: 12px;
    }
    
    .final-checkout-btn {
        padding: 12px 20px;
        font-size: 0.9rem;
    }
    
    .empty-cart {
        padding: 60px 16px;
        border-radius: 16px;
    }
    
    .empty-icon svg {
        width: 80px;
        height: 80px;
    }
    
    .empty-title {
        font-size: 1.3rem;
    }
    
    .empty-description {
        font-size: 0.9rem;
    }
    
    .empty-action-btn {
        padding: 12px 20px;
        font-size: 0.9rem;
    }
    

    

    
    /* 加载和错误状态移动端优化 */
    .loading-state,
    .error-state {
        padding: 80px 20px;
        border-radius: 16px;
    }
    
    .loading-state .spinner {
        width: 50px;
        height: 50px;
    }
    
    .loading-text {
        font-size: 1rem;
    }
    
    .error-icon svg {
        width: 60px;
        height: 60px;
    }
    
    .error-title {
        font-size: 1.5rem;
    }
    
    .error-message {
        font-size: 0.9rem;
        margin-bottom: 24px;
    }
    
    .retry-btn {
        padding: 12px 20px;
        font-size: 0.9rem;
    }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
    .cart-page {
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
    }
    
    .cart-main {
        background: #1a1a1a;
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    .cart-toolbar {
        background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    .cart-item-card {
        background: #2a2a2a;
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    .cart-item-card:hover {
        background: linear-gradient(135deg, #3a3a3a 0%, #2a2a2a 100%);
    }
    
    .cart-footer {
        background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    .price-breakdown,
    .final-total {
        background: #3a3a3a;
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    .empty-cart {
        background: #1a1a1a;
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    .item-name,
    .current-price,
    .subtotal-amount,
    .total-amount {
        color: #ffffff;
    }
    
    .meta-item {
        background: linear-gradient(135deg, #3a3a3a, #2a2a2a);
        border-color: rgba(255, 255, 255, 0.1);
        color: #ffffff;
    }
    
    .breakdown-label,
    .subtotal-label {
        color: #cccccc;
    }
    
    .breakdown-value {
        color: #ffffff;
    }
    
    /* 深色模式下的加载和错误状态 */
    .loading-state,
    .error-state {
        background: #1a1a1a;
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    .loading-text {
        color: #cccccc;
    }
    
    .error-title {
        color: #ffffff;
    }
    
    .error-message {
        color: #cccccc;
    }
    
    .path {
        stroke: #ffffff;
    }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
    .cart-item-card {
        border: 2px solid #000000;
    }
    
    .cart-item-card:hover {
        border-color: #333333;
    }
    
    .action-btn {
        border: 2px solid #000000;
    }
    
    .quantity-control {
        border-width: 3px;
    }
    
    .badge {
        border: 1px solid #000000;
    }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
    .cart-item-card,
    .action-btn,
    .quantity-btn,
    .badge,
    .meta-item,
    .breakdown-item {
        transition: none;
    }
    
    .cart-item-card:hover {
        transform: none;
    }
    
    .action-btn:hover,
    .quantity-btn:hover,
    .badge:hover,
    .meta-item:hover {
        transform: none;
    }
    

    
    .clear-all-btn::before,
    .checkout-btn::before,
    .continue-shopping::before,
    .final-checkout-btn::before,
    .empty-action-btn::before,
    .action-btn::before,
    .quantity-btn::before {
        display: none;
    }
}

/* 打印样式 */
@media print {
    .cart-page {
        background: white;
        color: black;
    }
    
    .cart-hero,
    .cart-toolbar,
    .item-actions,
    .cart-footer {
        display: none;
    }
    
    .cart-item-card {
        break-inside: avoid;
        border: 1px solid #000;
        margin: 10px 0;
        padding: 15px;
        box-shadow: none;
    }
    
    .item-image {
        width: 80px;
        height: 80px;
    }
    
    .cart-item-card {
        grid-template-columns: 60px 80px 1fr 100px 120px 100px;
        gap: 10px;
    }
}

/* 加载状态 */
.loading-state {
    text-align: center;
    padding: 120px 20px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    margin-bottom: 40px;
    position: relative;
    overflow: hidden;
}

.loading-state::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #000000, #333333, #000000);
}

.loading-spinner {
    margin-bottom: 24px;
}

.spinner {
    width: 60px;
    height: 60px;
    animation: rotate 2s linear infinite;
}

.path {
    stroke: #000000;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes dash {
    0% {
        stroke-dasharray: 1, 150;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35;
    }
    100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124;
    }
}

.loading-text {
    font-size: 1.2rem;
    color: #666666;
    font-weight: 500;
    margin: 0;
}

/* 错误状态 */
.error-state {
    text-align: center;
    padding: 120px 20px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    margin-bottom: 40px;
    position: relative;
    overflow: hidden;
}

.error-state::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #dc3545, #c82333, #dc3545);
}

.error-icon {
    margin-bottom: 24px;
    color: #dc3545;
}

.error-icon svg {
    width: 80px;
    height: 80px;
    opacity: 0.8;
}

.error-title {
    margin: 0 0 16px 0;
    color: #000000;
    font-size: 2rem;
    font-weight: 800;
}

.error-message {
    margin: 0 0 32px 0;
    color: #666666;
    font-size: 1.1rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}

.retry-btn {
    padding: 16px 32px;
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
    position: relative;
    overflow: hidden;
}

.retry-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
}

.retry-btn:hover::before {
    left: 100%;
}

.retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}

/* 商品推荐区域 */
</style>



