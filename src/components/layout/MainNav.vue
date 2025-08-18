<template>
    <nav class="main-nav">
        <div class="nav-container">
            <div class="nav-left">
                <router-link to="/" class="nav-logo">
                    <img src="/src/assets/logo.png" alt="Logo" class="logo-img">
                    <span class="logo-text">鞋城</span>
                </router-link>
            </div>
            
            <div class="nav-center">
                <router-link to="/" class="nav-link">首页</router-link>
                <router-link to="/men" class="nav-link">男鞋</router-link>
                <router-link to="/women" class="nav-link">女鞋</router-link>
                <router-link to="/kids" class="nav-link">童鞋</router-link>
            </div>
            
            <div class="nav-right">
                <div class="search-box">
                    <input 
                        type="text" 
                        placeholder="搜索商品..." 
                        v-model="searchKeyword"
                        @keyup.enter="handleSearch"
                        class="search-input"
                    >
                    <button @click="handleSearch" class="search-btn">
                        <i class="search-icon">🔍</i>
                    </button>
                </div>
                
                <div class="user-actions">
                    <router-link to="/cart" class="nav-link cart-link">
                        <i class="cart-icon">🛒</i>
                        <span class="cart-text">购物车</span>
                        <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
                    </router-link>
                    
                    <div v-if="!isLoggedIn" class="auth-buttons">
                        <button @click="showLoginDrawer = true" class="login-btn">登录</button>
                    </div>
                    
                    <div v-else class="user-menu">
                        <div class="user-info" @click="toggleUserMenu">
                            <span class="username">{{ username }}</span>
                            <i class="dropdown-icon">▼</i>
                        </div>
                        <div v-if="showUserMenu" class="user-dropdown">
                            <router-link to="/profile" class="dropdown-item">个人中心</router-link>
                            <router-link to="/orders" class="dropdown-item">我的订单</router-link>
                            <button @click="handleLogout" class="dropdown-item logout-btn">退出登录</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 登录抽屉 -->
        <LoginDrawer 
            v-if="showLoginDrawer" 
            @close="showLoginDrawer = false"
            @login-success="handleLoginSuccess"
        />
    </nav>
</template>

<script>
import LoginDrawer from '../../views/auth/LoginDrawer.vue'
import { OrderAPI } from '../../api'
import cartManager from '../../utils/cart'
import userManager from '../../utils/userManager'

export default {
    name: 'MainNav',
    components: {
        LoginDrawer
    },
    data() {
        return {
            searchKeyword: '',
            showLoginDrawer: false,
            showUserMenu: false,
            cartItemCount: 0,
            username: '',
            isLoggedIn: false
        }
    },
    methods: {
        handleSearch() {
            if (this.searchKeyword.trim()) {
                this.$router.push({
                    path: '/',
                    query: { search: this.searchKeyword.trim() }
                })
                this.searchKeyword = ''
            }
        },
        
        toggleUserMenu() {
            this.showUserMenu = !this.showUserMenu
        },
        
        handleLoginSuccess(user) {
            this.showLoginDrawer = false
            this.isLoggedIn = true
            this.username = user.username || user
            
            // 设置购物车管理器的用户ID
            const userId = user.id || 1
            cartManager.setUserId(userId)
        },
        
        handleLogout() {
            localStorage.removeItem('user')
            this.isLoggedIn = false
            this.username = ''
            this.cartItemCount = 0
            this.showUserMenu = false
            
            // 清空购物车管理器的用户ID
            cartManager.setUserId(null)
            
            // 触发自定义事件，通知其他组件登录状态变化
            window.dispatchEvent(new CustomEvent('user-login-change'));
            
            this.$router.push('/')
        },
        
        async loadCartItemCount() {
            try {
                const userId = await userManager.getUserId()
                if (!userId) return
                
                // 使用购物车管理器
                cartManager.setUserId(userId)
                this.cartItemCount = await cartManager.getCartItemCount()
            } catch (error) {
                console.error('加载购物车数量失败:', error)
            }
        },
        
        async checkLoginStatus() {
            const user = userManager.getCurrentUser()
            if (user) {
                this.isLoggedIn = true
                this.username = typeof user === 'string' ? user : (user.username || '')
                
                // 设置购物车管理器的用户ID
                const userId = await userManager.getUserId()
                if (userId) {
                    cartManager.setUserId(userId)
                }
                this.loadCartItemCount()
            }
        },
        
        // 购物车更新回调
        onCartUpdated(count) {
            this.cartItemCount = count
        }
    },
    
    mounted() {
        this.checkLoginStatus()
        
        // 添加购物车更新监听器
        cartManager.addListener(this.onCartUpdated)
        
        // 监听购物车更新事件
        this.$root.$on('cart-updated', () => {
            this.loadCartItemCount()
        })
        
        // 监听window的购物车更新事件
        window.addEventListener('cart-updated', () => {
            this.loadCartItemCount()
        })
    },
    
    beforeUnmount() {
        // 移除购物车监听器
        cartManager.removeListener(this.onCartUpdated)
        
        // 移除事件监听器
        window.removeEventListener('cart-updated', () => {
            this.loadCartItemCount()
        })
    }
}
</script>

<style scoped>
.main-nav {
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
}

.nav-left {
    display: flex;
    align-items: center;
}

.nav-logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: #333;
    font-weight: bold;
    font-size: 1.5rem;
}

.logo-img {
    width: 40px;
    height: 40px;
    margin-right: 0.5rem;
}

.nav-center {
    display: flex;
    gap: 2rem;
}

.nav-link {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    transition: all 0.2s ease;
}

.nav-link:hover {
    background: #f8f9fa;
    color: #007bff;
}

.nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.search-box {
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border-radius: 20px;
    padding: 0.5rem;
}

.search-input {
    border: none;
    background: transparent;
    padding: 0.5rem;
    outline: none;
    width: 200px;
}

.search-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
}

.search-icon {
    font-size: 1rem;
}

.user-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.cart-link {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #dc3545;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: bold;
}

.auth-buttons {
    display: flex;
    gap: 0.5rem;
}

.login-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
}

.login-btn:hover {
    background: #0056b3;
}

.user-menu {
    position: relative;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background-color 0.2s ease;
}

.user-info:hover {
    background: #f8f9fa;
}

.username {
    font-weight: 500;
    color: #333;
}

.dropdown-icon {
    font-size: 0.8rem;
    color: #666;
}

.user-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    min-width: 150px;
    z-index: 1000;
}

.dropdown-item {
    display: block;
    padding: 0.75rem 1rem;
    text-decoration: none;
    color: #333;
    border-bottom: 1px solid #f8f9fa;
    transition: background-color 0.2s ease;
}

.dropdown-item:hover {
    background: #f8f9fa;
}

.dropdown-item:last-child {
    border-bottom: none;
}

.logout-btn {
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font-size: 1rem;
}

@media (max-width: 768px) {
    .nav-container {
        flex-direction: column;
        height: auto;
        padding: 1rem;
    }
    
    .nav-center {
        margin: 1rem 0;
    }
    
    .nav-right {
        width: 100%;
        justify-content: space-between;
    }
    
    .search-box {
        flex: 1;
        margin-right: 1rem;
    }
    
    .search-input {
        width: 100%;
    }
}
</style>
