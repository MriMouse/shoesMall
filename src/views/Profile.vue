<template>
    <div class="profile">
        <div class="profile-container">
            <div class="profile-header">
                <div class="avatar">
                    <img :src="user.avatar || '/default-avatar.png'" :alt="user.username" />
                </div>
                <div class="user-info">
                    <h2>{{ user.username }}</h2>
                    <p>会员等级：{{ user.level || '普通会员' }}</p>
                    <p>注册时间：{{ formatDate(user.registerTime) }}</p>
                </div>
                <div class="actions">
                    <button @click="editProfile" class="btn btn-primary">编辑资料</button>
                    <button @click="logout" class="btn btn-secondary">退出登录</button>
                </div>
            </div>

            <div class="profile-content">
                <div class="profile-nav">
                    <button v-for="tab in tabs" :key="tab.key" :class="['tab-btn', { active: activeTab === tab.key }]"
                        @click="activeTab = tab.key">
                        {{ tab.label }}
                    </button>
                </div>

                <div class="profile-panel">
                    <!-- 订单管理 -->
                    <div v-if="activeTab === 'orders'" class="panel-content">
                        <h3>我的订单</h3>
                        <div v-if="orders.length === 0" class="empty-state">
                            <p>暂无订单记录</p>
                            <router-link to="/" class="btn btn-primary">去购物</router-link>
                        </div>
                        <div v-else class="orders-list">
                            <div v-for="order in orders" :key="order.id" class="order-item">
                                <div class="order-info">
                                    <span>订单号：{{ order.id }}</span>
                                    <span>状态：{{ order.status }}</span>
                                    <span>金额：¥{{ order.amount }}</span>
                                </div>
                                <div class="order-date">{{ formatDate(order.date) }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 收藏夹 -->
                    <div v-if="activeTab === 'favorites'" class="panel-content">
                        <h3>我的收藏</h3>
                        <div v-if="favorites.length === 0" class="empty-state">
                            <p>暂无收藏商品</p>
                            <router-link to="/" class="btn btn-primary">去看看</router-link>
                        </div>
                    </div>

                    <!-- 地址管理 -->
                    <div v-if="activeTab === 'address'" class="panel-content">
                        <h3>收货地址</h3>
                        <div class="address-list">
                            <div class="address-item">
                                <button class="btn btn-outline">+ 添加新地址</button>
                            </div>
                        </div>
                    </div>

                    <!-- 账户设置 -->
                    <div v-if="activeTab === 'settings'" class="panel-content">
                        <h3>账户设置</h3>
                        <div class="settings-list">
                            <div class="setting-item">
                                <label>邮箱通知</label>
                                <input type="checkbox" v-model="settings.emailNotification">
                            </div>
                            <div class="setting-item">
                                <label>短信通知</label>
                                <input type="checkbox" v-model="settings.smsNotification">
                            </div>
                            <div class="setting-item">
                                <button class="btn btn-primary">保存设置</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Profile',
    data() {
        return {
            user: {
                username: '用户名',
                level: '普通会员',
                registerTime: new Date().toISOString(),
                avatar: null
            },
            activeTab: 'orders',
            tabs: [
                { key: 'orders', label: '我的订单' },
                { key: 'favorites', label: '我的收藏' },
                { key: 'address', label: '收货地址' },
                { key: 'settings', label: '账户设置' }
            ],
            orders: [],
            favorites: [],
            settings: {
                emailNotification: true,
                smsNotification: false
            }
        }
    },
    mounted() {
        this.loadUserData()
    },
    methods: {
        loadUserData() {
            const userData = JSON.parse(localStorage.getItem('user') || '{}')
            if (userData.username) {
                this.user.username = userData.username
                this.user.registerTime = userData.loginTime || new Date().toISOString()
            }
        },

        formatDate(dateString) {
            if (!dateString) return '未知'
            return new Date(dateString).toLocaleDateString('zh-CN')
        },

        editProfile() {
            alert('编辑功能暂未开放')
        },

        logout() {
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('user')
                this.$router.push('/login')
            }
        }
    }
}
</script>

<style scoped>
.profile {
    min-height: 100vh;
    background-color: #f5f6fa;
    padding: 2rem 0;
}

.profile-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.profile-header {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #e1e8ed;
}

.user-info h2 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
}

.user-info p {
    margin: 0.25rem 0;
    color: #7f8c8d;
}

.actions {
    margin-left: auto;
    display: flex;
    gap: 1rem;
}

.profile-content {
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-nav {
    display: flex;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e1e8ed;
}

.tab-btn {
    padding: 1rem 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
    transition: all 0.3s;
    border-bottom: 3px solid transparent;
}

.tab-btn:hover {
    background-color: #e9ecef;
}

.tab-btn.active {
    background-color: white;
    border-bottom-color: #3498db;
    color: #3498db;
}

.profile-panel {
    padding: 2rem;
}

.panel-content h3 {
    margin: 0 0 1.5rem 0;
    color: #2c3e50;
}

.empty-state {
    text-align: center;
    padding: 3rem 0;
    color: #7f8c8d;
}

.empty-state p {
    margin-bottom: 1rem;
    font-size: 1.1rem;
}

.orders-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.order-item {
    border: 1px solid #e1e8ed;
    border-radius: 6px;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.order-info {
    display: flex;
    gap: 2rem;
}

.order-info span {
    color: #2c3e50;
}

.order-date {
    color: #7f8c8d;
    font-size: 0.9rem;
}

.address-list,
.settings-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.address-item,
.setting-item {
    padding: 1rem;
    border: 1px solid #e1e8ed;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    transition: all 0.3s;
}

.btn-primary {
    background-color: #3498db;
    color: white;
}

.btn-primary:hover {
    background-color: #2980b9;
}

.btn-secondary {
    background-color: #95a5a6;
    color: white;
}

.btn-secondary:hover {
    background-color: #7f8c8d;
}

.btn-outline {
    background-color: transparent;
    color: #3498db;
    border: 2px solid #3498db;
}

.btn-outline:hover {
    background-color: #3498db;
    color: white;
}
</style>
