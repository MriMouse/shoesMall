<template>
    <div class="test-cart-page">
        <div class="container">
            <h1>购物车功能测试</h1>
            
            <div class="test-section">
                <h2>用户信息</h2>
                <div class="user-info">
                    <p>当前用户: {{ username || '未登录' }}</p>
                    <p>用户ID: {{ userId || '未知' }}</p>
                    <p>购物车商品数量: {{ cartItemCount }}</p>
                </div>
            </div>
            
            <div class="test-section">
                <h2>购物车操作</h2>
                <div class="test-buttons">
                    <button @click="testAddToCart" class="btn btn-primary">测试加入购物车</button>
                    <button @click="testGetCartCount" class="btn btn-secondary">获取购物车数量</button>
                    <button @click="testClearCart" class="btn btn-danger">清空购物车</button>
                    <button @click="testLoadCartData" class="btn btn-info">加载购物车数据</button>
                </div>
            </div>
            
            <div class="test-section">
                <h2>购物车数据</h2>
                <div v-if="cartData.length > 0" class="cart-data">
                    <div v-for="item in cartData" :key="item.orderId" class="cart-item">
                        <div class="item-info">
                            <p>订单ID: {{ item.orderId }}</p>
                            <p>商品名称: {{ item.shoeName || '未知商品' }}</p>
                            <p>数量: {{ item.quantity || 1 }}</p>
                            <p>价格: ¥{{ item.price || 0 }}</p>
                        </div>
                        <div class="item-actions">
                            <button @click="testRemoveFromCart(item.orderId)" class="btn btn-sm btn-danger">删除</button>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-cart">
                    <p>购物车为空</p>
                </div>
            </div>
            
            <div class="test-section">
                <h2>测试日志</h2>
                <div class="log-container">
                    <div v-for="(log, index) in logs" :key="index" class="log-item" :class="log.type">
                        <span class="log-time">{{ log.time }}</span>
                        <span class="log-message">{{ log.message }}</span>
                    </div>
                </div>
                <button @click="clearLogs" class="btn btn-secondary">清空日志</button>
            </div>
        </div>
    </div>
</template>

<script>
import { OrderAPI } from '../api'
import cartManager from '../utils/cart'

export default {
    name: 'TestCart',
    data() {
        return {
            username: '',
            userId: null,
            cartItemCount: 0,
            cartData: [],
            logs: []
        }
    },
    methods: {
        addLog(message, type = 'info') {
            const time = new Date().toLocaleTimeString()
            this.logs.unshift({ time, message, type })
            if (this.logs.length > 50) {
                this.logs = this.logs.slice(0, 50)
            }
        },
        
        clearLogs() {
            this.logs = []
        },
        
        async testAddToCart() {
            try {
                this.addLog('开始测试加入购物车...', 'info')
                
                if (!this.userId) {
                    this.addLog('用户未登录，无法测试', 'error')
                    return
                }
                
                // 模拟加入购物车（使用尺码ID 1，数量 1）
                const response = await OrderAPI.addToCart(this.userId, 1, 1)
                
                if (response.data?.code === 200) {
                    this.addLog('加入购物车成功', 'success')
                    await this.testGetCartCount()
                    await this.testLoadCartData()
                } else {
                    this.addLog(`加入购物车失败: ${response.data?.msg || '未知错误'}`, 'error')
                }
            } catch (error) {
                this.addLog(`加入购物车异常: ${error.message}`, 'error')
            }
        },
        
        async testGetCartCount() {
            try {
                this.addLog('获取购物车数量...', 'info')
                
                if (!this.userId) {
                    this.addLog('用户未登录，无法获取', 'error')
                    return
                }
                
                const response = await OrderAPI.getCartItemCount(this.userId)
                
                if (response.data?.code === 200) {
                    this.cartItemCount = response.data.data || 0
                    this.addLog(`购物车商品数量: ${this.cartItemCount}`, 'success')
                } else {
                    this.addLog(`获取购物车数量失败: ${response.data?.msg || '未知错误'}`, 'error')
                }
            } catch (error) {
                this.addLog(`获取购物车数量异常: ${error.message}`, 'error')
            }
        },
        
        async testClearCart() {
            try {
                this.addLog('清空购物车...', 'info')
                
                if (!this.userId) {
                    this.addLog('用户未登录，无法清空', 'error')
                    return
                }
                
                const response = await OrderAPI.clearUserCart(this.userId)
                
                if (response.data?.code === 200) {
                    this.addLog('购物车清空成功', 'success')
                    this.cartData = []
                    await this.testGetCartCount()
                } else {
                    this.addLog(`清空购物车失败: ${response.data?.msg || '未知错误'}`, 'error')
                }
            } catch (error) {
                this.addLog(`清空购物车异常: ${error.message}`, 'error')
            }
        },
        
        async testLoadCartData() {
            try {
                this.addLog('加载购物车数据...', 'info')
                
                if (!this.userId) {
                    this.addLog('用户未登录，无法加载', 'error')
                    return
                }
                
                const response = await OrderAPI.getCartOrdersWithDetails(this.userId)
                
                if (response.data?.code === 200) {
                    this.cartData = response.data.data || []
                    this.addLog(`加载购物车数据成功，共 ${this.cartData.length} 件商品`, 'success')
                } else {
                    this.addLog(`加载购物车数据失败: ${response.data?.msg || '未知错误'}`, 'error')
                }
            } catch (error) {
                this.addLog(`加载购物车数据异常: ${error.message}`, 'error')
            }
        },
        
        async testRemoveFromCart(orderId) {
            try {
                this.addLog(`删除购物车商品，订单ID: ${orderId}`, 'info')
                
                const response = await OrderAPI.removeFromCart(orderId)
                
                if (response.data?.code === 200) {
                    this.addLog('删除购物车商品成功', 'success')
                    await this.testGetCartCount()
                    await this.testLoadCartData()
                } else {
                    this.addLog(`删除购物车商品失败: ${response.data?.msg || '未知错误'}`, 'error')
                }
            } catch (error) {
                this.addLog(`删除购物车商品异常: ${error.message}`, 'error')
            }
        },
        
        checkLoginStatus() {
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
                
                // 设置购物车管理器的用户ID
                cartManager.setUserId(this.userId)
                
                this.addLog(`用户已登录: ${this.username} (ID: ${this.userId})`, 'success')
            } else {
                this.addLog('用户未登录', 'warning')
            }
        }
    },
    
    async mounted() {
        this.checkLoginStatus()
        await this.testGetCartCount()
        await this.testLoadCartData()
        
        // 添加购物车更新监听器
        cartManager.addListener((count) => {
            this.cartItemCount = count
            this.addLog(`购物车数量更新: ${count}`, 'info')
        })
    },
    
    beforeUnmount() {
        cartManager.removeListener((count) => {
            this.cartItemCount = count
        })
    }
}
</script>

<style scoped>
.test-cart-page {
    padding: 2rem;
    background: #f8f9fa;
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

.test-section {
    background: white;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.test-section h2 {
    margin-top: 0;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 0.5rem;
}

.user-info p {
    margin: 0.5rem 0;
    font-size: 1rem;
}

.test-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #545b62;
}

.btn-danger {
    background: #dc3545;
    color: white;
}

.btn-danger:hover {
    background: #c82333;
}

.btn-info {
    background: #17a2b8;
    color: white;
}

.btn-info:hover {
    background: #138496;
}

.btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

.cart-data {
    display: grid;
    gap: 1rem;
}

.cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    background: #f8f9fa;
}

.item-info p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
}

.empty-cart {
    text-align: center;
    color: #6c757d;
    padding: 2rem;
}

.log-container {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 1rem;
    background: #f8f9fa;
    margin-bottom: 1rem;
}

.log-item {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e9ecef;
    font-family: monospace;
    font-size: 0.875rem;
}

.log-item:last-child {
    border-bottom: none;
}

.log-time {
    color: #6c757d;
    min-width: 80px;
}

.log-message {
    flex: 1;
}

.log-item.success .log-message {
    color: #28a745;
}

.log-item.error .log-message {
    color: #dc3545;
}

.log-item.warning .log-message {
    color: #ffc107;
}

.log-item.info .log-message {
    color: #17a2b8;
}

@media (max-width: 768px) {
    .test-cart-page {
        padding: 1rem;
    }
    
    .test-buttons {
        flex-direction: column;
    }
    
    .cart-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
}
</style>
