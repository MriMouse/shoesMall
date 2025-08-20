import { CartAPI } from '../api'
import userManager from './userManager'

class CartManager {
    constructor() {
        this.cartItemCount = 0
        this.userId = null
        this.listeners = []
    }

    // 尝试从本地用户名解析真实的用户ID，并回写localStorage
    async ensureUserIdFromLocalStorage() {
        if (this.userId && this.userId !== 1) return this.userId
        
        // 使用用户管理工具获取用户ID（会调用后端API）
        const userId = await userManager.getUserId()
        if (userId) {
            this.setUserId(userId)
            return userId
        }
        
        return null
    }

    // 设置用户ID
    setUserId(userId) {
        this.userId = userId
        this.loadCartItemCount()
    }

    // 获取购物车商品数量
    async getCartItemCount() {
        if (!this.userId) {
            await this.ensureUserIdFromLocalStorage()
            if (!this.userId) return 0
        }
        
        try {
            const response = await CartAPI.getCartItemCount(this.userId)
            if (response.data?.code === 200) {
                this.cartItemCount = response.data.data || 0
                this.notifyListeners()
                return this.cartItemCount
            }
        } catch (error) {
            console.error('获取购物车数量失败:', error)
        }
        return 0
    }

    // 加载购物车商品数量
    async loadCartItemCount() {
        await this.getCartItemCount()
    }

    // 添加购物车更新监听器
    addListener(callback) {
        this.listeners.push(callback)
    }

    // 移除购物车更新监听器
    removeListener(callback) {
        const index = this.listeners.indexOf(callback)
        if (index > -1) {
            this.listeners.splice(index, 1)
        }
    }

    // 通知所有监听器
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.cartItemCount)
            } catch (error) {
                console.error('购物车监听器执行失败:', error)
            }
        })
    }

    // 触发购物车更新事件
    triggerUpdate() {
        this.loadCartItemCount()
        // 触发全局事件
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cart-updated'))
        }
    }

    // 清空购物车
    async clearCart() {
        if (!this.userId) {
            await this.ensureUserIdFromLocalStorage()
            if (!this.userId) return false
        }
        
        try {
            const response = await CartAPI.clearUserCart(this.userId)
            if (response.data?.code === 200) {
                this.cartItemCount = 0
                this.notifyListeners()
                return true
            }
        } catch (error) {
            console.error('清空购物车失败:', error)
        }
        return false
    }

    // 从购物车移除商品
    async removeFromCart(orderId, shoeId) {
        try {
            console.log('调用删除API:', { orderId, shoeId })
            const response = await CartAPI.removeFromCart(orderId, shoeId)
            console.log('删除API响应:', response.data)
            
            if (response.data?.code === 200) {
                console.log('删除成功，更新购物车数量')
                await this.loadCartItemCount()
                return true
            } else {
                console.error('删除失败，错误码:', response.data?.code, '错误信息:', response.data?.msg)
                return false
            }
        } catch (error) {
            console.error('从购物车移除商品失败:', error)
            console.error('错误详情:', error.response?.data)
            return false
        }
    }

    // 加入购物车 - 核心功能
    async addToCart(sizeId, quantity, shoeId = null) {
        // 检查用户是否已登录
        if (!userManager.isLoggedIn()) {
            console.error('用户未登录，无法加入购物车')
            alert('请先登录后再添加商品到购物车')
            return false
        }
        
        // 确保已解析到用户ID
        if (!this.userId || this.userId === 1) {
            await this.ensureUserIdFromLocalStorage()
        }
        if (!this.userId) {
            console.error('无法获取用户ID，请重新登录')
            alert('无法获取用户信息，请重新登录')
            return false
        }
        
        if (!sizeId || !quantity || !shoeId) {
            console.error('参数不完整:', { sizeId, quantity, shoeId })
            alert('商品信息不完整，请重新选择')
            return false
        }
        
        if (quantity <= 0) {
            console.error('商品数量必须大于0')
            alert('商品数量必须大于0')
            return false
        }
        
        try {
            console.log('=== 调用加入购物车API ===')
            console.log('用户ID:', this.userId)
            console.log('尺码ID:', sizeId)
            console.log('商品ID:', shoeId)
            console.log('数量:', quantity)
            
            // 调用CartAPI.addToCart，参数顺序：userId, sizeId, shoeId, quantity
            const response = await CartAPI.addToCart(this.userId, sizeId, shoeId, quantity)
            console.log('API响应:', response)
            console.log('响应状态码:', response.status)
            console.log('响应数据:', response.data)
            
            if (response.data?.code === 200) {
                console.log('加入购物车成功')
                await this.loadCartItemCount()
                return true
            } else {
                console.error('加入购物车失败，响应码:', response.data?.code)
                console.error('错误信息:', response.data?.msg)
                return false
            }
        } catch (error) {
            console.error('加入购物车异常:', error)
            console.error('错误详情:', error.response?.data)
            console.error('错误状态码:', error.response?.status)
            return false
        }
    }

    // 获取购物车详情
    async getCartDetails() {
        if (!this.userId) {
            await this.ensureUserIdFromLocalStorage()
            if (!this.userId) return []
        }
        
        try {
            const response = await CartAPI.getCartOrdersWithDetails(this.userId)
            if (response.data?.code === 200) {
                return response.data.data || []
            }
        } catch (error) {
            console.error('获取购物车详情失败:', error)
        }
        return []
    }

    // 检查购物车是否为空
    async isCartEmpty() {
        const cartDetails = await this.getCartDetails()
        return cartDetails.length === 0
    }

    // 刷新购物车数量
    async refreshCartCount() {
        await this.loadCartItemCount()
    }

    // 更新购物车商品数量
    async updateCartItemQuantity(orderId, shoeId, quantity) {
        try {
            const response = await CartAPI.updateCartItemQuantity(orderId, shoeId, quantity)
            if (response.data?.code === 200) {
                await this.loadCartItemCount()
                return true
            }
        } catch (error) {
            console.error('更新购物车商品数量失败:', error)
        }
        return false
    }

    // 更新购物车商品尺码
    async updateCartItemSize(orderId, sizeId) {
        try {
            const response = await CartAPI.updateOrderSize(orderId, sizeId)
            if (response.data?.code === 200) {
                return true
            }
        } catch (error) {
            console.error('更新购物车商品尺码失败:', error)
        }
        return false
    }

    // 批量更新订单状态（结算时使用）
    async batchUpdateOrderStatus(orderIds, status) {
        try {
            const response = await CartAPI.batchUpdateOrderStatus(orderIds, status)
            if (response.data?.code === 200) {
                await this.loadCartItemCount()
                return true
            }
        } catch (error) {
            console.error('批量更新订单状态失败:', error)
        }
        return false
    }
}

// 创建单例实例
const cartManager = new CartManager()

export default cartManager



