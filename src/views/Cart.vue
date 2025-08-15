<template>
    <div class="cart-page">
        <div class="container">
            <!-- 购物车头部 -->
            <div class="cart-header">
                <h1>我的购物车</h1>
                <div class="cart-summary">
                    <span>共 {{ cartItems.length }} 件商品</span>
                    <button @click="clearAll" class="clear-all-btn">清空购物车</button>
                </div>
            </div>

            <!-- 购物车内容 -->
            <div v-if="cartItems.length > 0" class="cart-content">
                <!-- 全选和批量操作 -->
                <div class="batch-actions">
                    <label class="select-all">
                        <input 
                            type="checkbox" 
                            :checked="hasAllChecked" 
                            @change="toggleSelectAll"
                        />
                        <span>全选</span>
                    </label>
                    <button 
                        @click="goCheckout" 
                        :disabled="!hasCheckedItems"
                        class="checkout-btn"
                    >
                        结算 ({{ checkedItemsCount }})
                    </button>
                </div>

                <!-- 商品列表 -->
                <div class="cart-items">
                    <div 
                        v-for="item in cartItems" 
                        :key="item.orderId" 
                        class="cart-item"
                        :class="{ 'disabled': item.shoeDisabled }"
                    >
                        <div class="item-checkbox">
                            <input 
                                type="checkbox" 
                                v-model="item.checked"
                                :disabled="item.shoeDisabled"
                                @change="updateSelection"
                            />
                        </div>
                        
                        <div class="item-image">
                            <img 
                                v-if="item.image" 
                                :src="getShoeImage(item)" 
                                :alt="item.shoeName"
                                @error="handleImageError"
                            />
                            <div v-else class="no-image">📷</div>
                        </div>
                        
                        <div class="item-info">
                            <h3 class="item-name">{{ item.shoeName }}</h3>
                            <div class="item-meta">
                                <span class="brand">{{ item.brandName }}</span>
                                <span class="type">{{ item.typeName }}</span>
                            </div>
                            <div class="item-size">
                                <span>尺码：{{ item.size }}</span>
                            </div>
                        </div>
                        
                        <div class="item-price">
                            <span class="current-price">¥{{ getCurrentPrice(item) }}</span>
                            <span v-if="item.discountPrice && item.discountPrice < item.price" class="original-price">¥{{ item.price }}</span>
                        </div>
                        
                        <div class="item-quantity">
                            <button @click="decreaseQuantity(item)" :disabled="item.quantity <= 1">-</button>
                            <input 
                                v-model.number="item.quantity" 
                                type="number" 
                                min="1" 
                                max="99"
                                @blur="validateQuantity(item)"
                                @keyup.enter="validateQuantity(item)"
                            />
                            <button @click="increaseQuantity(item)" :disabled="item.quantity >= 99">+</button>
                        </div>
                        
                        <div class="item-subtotal">
                            ¥{{ calculateSubtotal(item) }}
                        </div>
                        
                        <div class="item-actions">
                            <button @click="removeOrder(item)" class="remove-btn">删除</button>
                            <button @click="paySingleItem(item)" :disabled="item.shoeDisabled" class="pay-btn">立即购买</button>
                        </div>
                    </div>
                </div>

                <!-- 底部汇总与操作 -->
                <div class="cart-footer">
                    <div class="totals">
                        <div class="totals-line">
                            <span>已选商品</span>
                            <span>{{ totals.checkedCount }} 件</span>
                        </div>
                        <div class="totals-line" v-if="totals.original > 0">
                            <span>商品总额</span>
                            <span>¥{{ totals.original.toFixed(2) }}</span>
                        </div>
                        <div class="totals-line savings" v-if="totals.original > totals.discounted">
                            <span>优惠</span>
                            <span>-¥{{ (totals.original - totals.discounted).toFixed(2) }}</span>
                        </div>
                        <div class="totals-line total">
                            <span>应付总额</span>
                            <span class="amount">¥{{ totals.discounted.toFixed(2) }}</span>
                        </div>
                    </div>
                    <div class="footer-actions">
                        <router-link to="/products" class="continue-shopping-btn">继续购物</router-link>
                        <button 
                            class="checkout-btn large" 
                            :disabled="!hasCheckedItems" 
                            @click="goCheckout"
                        >去结算</button>
                    </div>
                </div>
            </div>

            <!-- 空购物车 -->
            <div v-else class="empty-cart">
                <div class="empty-icon">🛒</div>
                <h3>购物车是空的</h3>
                <p>快去添加一些商品吧！</p>
                <router-link to="/home" class="continue-shopping-btn">继续购物</router-link>
            </div>
        </div>
    </div>
</template>

<script>
import { ShoeAPI, ShoesSizeAPI } from '@/api'
import cartManager from '@/utils/cart'

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
                        size: item.size
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
                            size: item.size
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
        const userStr = localStorage.getItem('user')
        if (userStr) {
            try {
                const user = JSON.parse(userStr)
                this.username = user.username || userStr
                this.userId = user.id || 1
            } catch (e) {
                this.username = userStr
                this.userId = 1
            }
        } else {
            this.username = '未登录用户'
            this.userId = null
        }
        
        // 设置购物车管理器的用户ID
        if (this.userId) {
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
    background: #f8f9fa;
    padding: 2rem 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.cart-header {
    background: white;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cart-header h1 {
    margin: 0;
    font-size: 2rem;
    color: #333;
}

.cart-summary {
    display: flex;
    align-items: center;
    gap: 16px;
}

.cart-summary span {
    color: #6c757d;
    font-size: 1rem;
}

.clear-all-btn {
    padding: 8px 16px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s ease;
}

.clear-all-btn:hover {
    background: #c82333;
}

.cart-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.batch-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e9ecef;
    background: #f8f9fa;
}

.select-all {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.select-all input[type="checkbox"] {
    width: 18px;
    height: 18px;
}

.checkout-btn {
    padding: 12px 24px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background 0.3s ease;
}

.checkout-btn:hover:not(:disabled) {
    background: #0056b3;
}

.checkout-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.cart-items {
    padding: 0;
}

.cart-footer {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 24px;
    padding: 20px 24px;
    background: #fff;
}

.totals {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 16px 20px;
}

.totals-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px dashed #e9ecef;
    color: #495057;
}

.totals-line:last-child {
    border-bottom: none;
}

.totals-line.total {
    font-weight: 700;
    font-size: 1.1rem;
}

.totals-line.savings {
    color: #28a745;
}

.totals .amount {
    color: #e74c3c;
}

.footer-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
}

.checkout-btn.large {
    padding: 12px 28px;
}

.cart-item {
    display: grid;
    grid-template-columns: 50px 120px 1fr 120px 150px 120px 120px;
    gap: 16px;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e9ecef;
    transition: background 0.3s ease;
}

.cart-item:hover {
    background: #f8f9fa;
}

.cart-item.disabled {
    opacity: 0.6;
    background: #f8f9fa;
}

.item-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
}

.item-image {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
}

.item-image img {
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

.item-info {
    min-width: 0;
}

.item-name {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    color: #333;
    font-weight: 600;
}

.item-meta {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;
    font-size: 0.9rem;
    color: #6c757d;
}

.item-size {
    font-size: 0.9rem;
    color: #495057;
}

.item-price {
    text-align: center;
}

.current-price {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    color: #e74c3c;
}

.original-price {
    display: block;
    font-size: 0.9rem;
    color: #6c757d;
    text-decoration: line-through;
    margin-top: 4px;
}

.item-quantity {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
}

.item-quantity button {
    width: 32px;
    height: 32px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.item-quantity button:hover:not(:disabled) {
    background: #f8f9fa;
}

.item-quantity button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.item-quantity input {
    width: 60px;
    height: 32px;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
}

.item-subtotal {
    text-align: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: #e74c3c;
}

.item-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.remove-btn, .pay-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s ease;
}

.remove-btn {
    background: #dc3545;
    color: white;
}

.remove-btn:hover {
    background: #c82333;
}

.pay-btn {
    background: #28a745;
    color: white;
}

.pay-btn:hover:not(:disabled) {
    background: #218838;
}

.pay-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.empty-cart {
    text-align: center;
    padding: 80px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 16px;
}

.empty-cart h3 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 1.5rem;
}

.empty-cart p {
    margin: 0 0 24px 0;
    color: #6c757d;
    font-size: 1rem;
}

.continue-shopping-btn {
    display: inline-block;
    padding: 12px 24px;
    background: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: background 0.3s ease;
}

.continue-shopping-btn:hover {
    background: #0056b3;
}

@media (max-width: 1024px) {
    .cart-item {
        grid-template-columns: 50px 100px 1fr 100px 120px 100px 100px;
        gap: 12px;
        padding: 16px 20px;
    }
    
    .item-image {
        width: 100px;
        height: 100px;
    }
}

@media (max-width: 768px) {
    .cart-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
    }
    
    .cart-item {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 20px;
        text-align: center;
    }
    
    .item-image {
        width: 120px;
        height: 120px;
        margin: 0 auto;
    }
    
    .item-quantity {
        justify-content: center;
    }
    
    .item-actions {
        flex-direction: row;
        justify-content: center;
    }
    
    .batch-actions {
        flex-direction: column;
        gap: 16px;
        text-align: center;
    }
}
</style>



