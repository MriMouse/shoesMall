import { OrderAPI } from '../api'

class CartManager {
    constructor() {
        this.cartItemCount = 0
        this.userId = null
        this.listeners = []
    }

    // 设置用户ID
    setUserId(userId) {
        this.userId = userId
        this.loadCartItemCount()
    }

    // 获取购物车商品数量
    async getCartItemCount() {
        if (!this.userId) return 0
        
        try {
            const response = await OrderAPI.getCartItemCount(this.userId)
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
        if (!this.userId) return false
        
        try {
            const response = await OrderAPI.clearUserCart(this.userId)
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
    async removeFromCart(orderId) {
        try {
            const response = await OrderAPI.removeFromCart(orderId)
            if (response.data?.code === 200) {
                await this.loadCartItemCount()
                return true
            }
        } catch (error) {
            console.error('从购物车移除商品失败:', error)
        }
        return false
    }

    // 加入购物车
    async addToCart(sizeId, quantity) {
        if (!this.userId) return false
        
        try {
            const response = await OrderAPI.addToCart(this.userId, sizeId, quantity)
            if (response.data?.code === 200) {
                await this.loadCartItemCount()
                return true
            }
        } catch (error) {
            console.error('加入购物车失败:', error)
        }
        return false
    }
}

// 创建单例实例
const cartManager = new CartManager()

export default cartManager



