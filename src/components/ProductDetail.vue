<template>
    <div class="product-detail-container">
        <BasicToast ref="toast" :message="toastMessage" :type="toastType" :duration="3000" />
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>正在加载产品详情...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-container">
            <div class="error-icon">❌</div>
            <h3>加载失败</h3>
            <p>{{ error }}</p>
            <button @click="loadProductDetail" class="retry-btn">重试</button>
        </div>

        <!-- 产品详情内容 -->
        <div v-else-if="product" class="product-detail-content">
            <!-- 面包屑导航 -->
            <div class="breadcrumb">
                <router-link to="/home" class="breadcrumb-item">首页</router-link>
                <span class="breadcrumb-separator">/</span>
                <router-link to="/products" class="breadcrumb-item">产品列表</router-link>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-current">{{ product.name }}</span>
            </div>

            <!-- 产品主要信息区域 -->
            <div class="product-main-section">
                <!-- 左侧图片展示区域 -->
                <div class="product-images-section">
                    <!-- 主图片展示 -->
                    <div class="main-image-container">
                        <div class="main-image-wrapper" @mousemove="handleImageZoom" @mouseleave="hideZoom"
                            ref="mainImageWrapper">
                            <img :src="currentMainImage" :alt="product.name" class="main-image" ref="mainImage">
                            <!-- 放大镜效果 -->
                            <div v-show="showZoom" class="zoom-lens" :style="zoomLensStyle"></div>
                        </div>

                        <!-- 放大后的图片 - 固定在右侧 -->
                        <div v-show="showZoom" class="zoomed-image-container">
                            <img :src="currentMainImage" :alt="product.name" class="zoomed-image"
                                :style="zoomedImageStyle">
                        </div>
                    </div>

                    <!-- 缩略图列表 -->
                    <div v-if="product.images && product.images.length > 1" class="thumbnail-list">
                        <div v-for="(image, index) in product.images" :key="image.imgId" class="thumbnail-item"
                            :class="{ 'active': currentImageIndex === index }" @click="selectImage(index)">
                            <img :src="`/api/shoeImg/getImage/${image.imagePath}`" :alt="`${product.name} ${index + 1}`"
                                class="thumbnail-image">
                        </div>
                    </div>

                    <!-- 评论展示区域 -->
                    <div class="comments-preview-section">
                        <div class="comments-header">
                            <h3 class="comments-title">用户评价</h3>
                            <div class="rating-summary">
                                <span class="average-rating">{{ averageRating.toFixed(1) }}</span>
                                <div class="stars">
                                    <span 
                                        v-for="i in 5" 
                                        :key="i" 
                                        class="star"
                                        :class="{ 'filled': i <= Math.round(averageRating) }"
                                    >
                                        ★
                                    </span>
                                </div>
                                <span class="comment-count">{{ comments.length }} 条评价</span>
                            </div>
                        </div>

                        <!-- 评论列表预览 -->
                        <div v-if="comments.length > 0" class="comments-preview">
                            <div v-for="(comment) in previewComments" :key="`${comment.userId}-${comment.shoeId}`" 
                                 class="comment-preview-item">
                                <div class="comment-user-info">
                                    <div class="user-avatar">
                                        <img v-if="getUserAvatar(comment.userId)" 
                                             :src="getUserAvatar(comment.userId)" 
                                             :alt="getUserName(comment.userId)"
                                             class="avatar-image">
                                        <span v-else>👤</span>
                                    </div>
                                    <div class="user-details">
                                        <div class="username">{{ getUserName(comment.userId) }}</div>
                                        <div class="comment-rating">
                                            <span 
                                                v-for="i in 5" 
                                                :key="i" 
                                                class="star-small"
                                                :class="{ 'filled': i <= comment.rating }"
                                            >
                                                ★
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="comment-content-preview">
                                    {{ comment.content.length > 50 ? comment.content.substring(0, 50) + '...' : comment.content }}
                                </div>
                                <div class="comment-time">{{ formatCommentTime(comment.commentTime) }}</div>
                            </div>
                        </div>

                        <!-- 无评论状态 -->
                        <div v-else class="no-comments">
                            <div class="no-comments-icon">💬</div>
                            <p>暂无评价，快来发表第一条评价吧！</p>
                        </div>

                        <!-- 评论操作区域 -->
                        <div class="comment-actions">
                            <!-- 查看全部评论按钮 -->
                            <div class="view-all-comments">
                                <router-link 
                                    :to="{ name: 'ViewComments', params: { shoeId: product.shoeId } }" 
                                    class="view-all-btn"
                                >
                                    查看全部评价 →
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧产品信息区域 -->
                <div class="product-info-section">
                    <!-- 产品标题 -->
                    <h1 class="product-title">{{ product.name }}</h1>

                    <!-- 产品编号 -->
                    <div class="product-serial">
                        <span class="label">产品编号：</span>
                        <span class="value">{{ product.serialNumber }}</span>
                    </div>

                    <!-- 价格信息 -->
                    <div class="price-section">
                        <div class="current-price">
                            <span class="label">现价：</span>
                            <span class="price">¥{{ product.discountPrice || product.price }}</span>
                        </div>
                        <div v-if="product.discountPrice" class="original-price">
                            <span class="label">原价：</span>
                            <span class="price">¥{{ product.price }}</span>
                        </div>
                    </div>

                    <!-- 积分信息 -->
                    <div class="points-section">
                        <span class="label">可获得积分：</span>
                        <span class="value">{{ product.points || 0 }} 分</span>
                    </div>

                    <!-- 销量信息 -->
                    <div class="sales-section">
                        <span class="label">已售出数量：</span>
                        <span class="value">{{ product.salesVolume || 0 }} 双</span>
                    </div>

                    <!-- 尺码选择 -->
                    <div class="size-section">
                        <h3 class="section-title">选择尺码</h3>
                        <div class="size-options">
                            <button v-for="size in availableSizes" :key="size.sizeId" class="size-option" :class="{
                                'selected': selectedSize === size.sizeId,
                                'disabled': !size.hasStock
                            }" @click="selectSize(size.sizeId)" :disabled="!size.hasStock">
                                {{ size.size }}
                                <span v-if="size.hasStock" class="stock-info">({{ size.stock }}双)</span>
                                <span v-else class="stock-info">(无库存)</span>
                            </button>
                        </div>
                    </div>

                    <!-- 购买数量 -->
                    <div class="quantity-section">
                        <h3 class="section-title">购买数量</h3>
                        <div class="quantity-controls">
                            <button @click="decreaseQuantity" class="quantity-btn" :disabled="quantity <= 1">
                                -
                            </button>
                            <input v-model.number="quantity" type="number" min="1" :max="maxQuantity"
                                class="quantity-input" @input="validateQuantity">
                            <button @click="increaseQuantity" class="quantity-btn" :disabled="quantity >= maxQuantity">
                                +
                            </button>
                        </div>
                        <div v-if="selectedSize" class="stock-warning">
                            当前尺码库存: {{ getCurrentSizeStock() }} 双
                        </div>
                    </div>

                    <!-- 产品标签 -->
                    <div class="product-tags">
                        <span class="tag brand-tag">{{ product.brand?.brandName || 'N/A' }}</span>
                        <span class="tag type-tag">{{ product.shoesType?.typeName || 'N/A' }}</span>
                        <span class="tag color-tag">{{ product.color?.colorName || 'N/A' }}</span>
                        <span class="tag sex-tag">{{ getShoeSexText(product.shoeSex) }}</span>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="action-buttons">
                        <button @click="addToCart" class="add-to-cart-btn" :class="{ 'disabled': !isLoggedIn }" :disabled="isLoggedIn ? !selectedSize : false">
                            🛒 加入购物车
                        </button>
                        <button @click="buyNow" class="buy-now-btn" :class="{ 'disabled': !isLoggedIn }" :disabled="isLoggedIn ? !selectedSize : false">
                            💳 立即购买
                        </button>
                    </div>
                </div>
            </div>

            <!-- 产品详细信息 -->
            <div class="product-details-section">
                <h2 class="section-title">产品详细信息</h2>

                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">产品名称：</span>
                        <span class="detail-value">{{ product.name }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">产品编号：</span>
                        <span class="detail-value">{{ product.serialNumber }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">品牌：</span>
                        <span class="detail-value">{{ product.brand?.brandName || 'N/A' }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">版型：</span>
                        <span class="detail-value">{{ product.shoesType?.typeName || 'N/A' }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">颜色：</span>
                        <span class="detail-value">{{ product.color?.colorName || 'N/A' }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">适用性别：</span>
                        <span class="detail-value">{{ getShoeSexText(product.shoeSex) }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">原价：</span>
                        <span class="detail-value">¥{{ product.price }}</span>
                    </div>

                    <div v-if="product.discountPrice" class="detail-item">
                        <span class="detail-label">现价：</span>
                        <span class="detail-value discount">¥{{ product.discountPrice }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">可获得积分：</span>
                        <span class="detail-value">{{ product.points || 0 }} 分</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">已售出数量：</span>
                        <span class="detail-value">{{ product.salesVolume || 0 }} 双</span>
                    </div>

                    <div v-if="product.origin" class="detail-item">
                        <span class="detail-label">产地：</span>
                        <span class="detail-value">{{ product.origin }}</span>
                    </div>

                    <div v-if="product.launchDate" class="detail-item">
                        <span class="detail-label">上市日期：</span>
                        <span class="detail-value">{{ formatDate(product.launchDate) }}</span>
                    </div>
                </div>

                <!-- 产品描述 -->
                <div v-if="product.description" class="description-section">
                    <h3 class="subsection-title">产品描述</h3>
                    <p class="description-text">{{ product.description }}</p>
                </div>
            </div>
        </div>

        <!-- Toast 提示组件 -->
        <!-- <BasicToast ref="toast" :message="toastMessage" :type="toastType" /> -->
        <!-- 页面底部 -->
        <SiteFooter />
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import BasicToast from '@/views/BasicToast.vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import cartManager from '@/utils/cart'
import userManager from '@/utils/userManager'
import { ClickLogAPI } from '@/api'
import SiteFooter from '@/views/layout/Footer.vue'

// 路由相关
const route = useRoute()
const router = useRouter()

// 响应式数据
const product = ref(null)
const loading = ref(true)
const error = ref('')
const inventoryData = ref(null)

// 评论相关数据
const comments = ref([])
const commentsLoading = ref(false)
const userInfoMap = ref({}) // 存储用户信息映射

// 图片相关
const currentImageIndex = ref(0)
const showZoom = ref(false)
const zoomLensStyle = ref({})
const zoomedImageStyle = ref({})

// 选择相关
const selectedSize = ref(null)
const quantity = ref(1)

// 模板引用
const mainImageWrapper = ref(null)
const mainImage = ref(null)

// Toast相关
const toast = ref(null)
const toastMessage = ref('')
toastMessage.value = ''
const toastType = ref('success')
const showToast = (message, type = 'error') => {
    toastMessage.value = message
    toastType.value = type
    toast.value?.show?.()
}

// 登录状态（与 MainNav 逻辑保持一致）
const isLoggedIn = ref(!!localStorage.getItem('user'))
function updateLoginState() { isLoggedIn.value = !!localStorage.getItem('user') }
window.addEventListener('storage', (e) => { if (e.key === 'user') updateLoginState() })
window.addEventListener('user-login-change', updateLoginState)

// 计算属性
const currentMainImage = computed(() => {
    if (product.value?.images && product.value.images.length > 0) {
        return `/api/shoeImg/getImage/${product.value.images[currentImageIndex.value].imagePath}`
    }
    return ''
})

const availableSizes = computed(() => {
    if (!inventoryData.value || !Array.isArray(inventoryData.value)) return []

    return inventoryData.value.map(item => ({
        sizeId: item.sizeId,
        size: item.size,
        stock: item.inventoryNumber,
        hasStock: item.inventoryNumber > 0
    }))
})

const maxQuantity = computed(() => {
    if (!selectedSize.value || !inventoryData.value || !Array.isArray(inventoryData.value)) return 99

    const selectedInventory = inventoryData.value.find(item => item.sizeId === selectedSize.value)
    return selectedInventory ? Math.min(selectedInventory.inventoryNumber, 99) : 99
})

// 评论相关计算属性
const averageRating = computed(() => {
    if (comments.value.length === 0) return 0
    const total = comments.value.reduce((sum, comment) => sum + comment.rating, 0)
    return total / comments.value.length
})

const previewComments = computed(() => {
    // 只显示前3条评论作为预览
    return comments.value.slice(0, 3)
})

// 获取鞋子性别文本
const getShoeSexText = (shoeSex) => {
    if (!shoeSex) return 'N/A'

    switch (Number(shoeSex)) {
        case 1:
            return '男鞋'
        case 2:
            return '女鞋'
        case 3:
            return '童鞋'
        case 4:
            return '其他'
        default:
            return '未知'
    }
}

// 获取产品详情
const loadProductDetail = async () => {
    const shoeId = route.params.id || route.query.shoeId

    if (!shoeId) {
        error.value = '缺少产品ID参数'
        loading.value = false
        return
    }

    loading.value = true
    error.value = ''

    try {
        // 调用后端接口获取产品详情
        const response = await axios.post('/api/shoe/getById',
            `shoeId=${shoeId}`,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )

        if (response.data && response.data.code === 200 && response.data.data) {
            const productData = response.data.data

            // 获取产品图片
            try {
                const imageResponse = await axios.get(`/api/shoeImg/list/${shoeId}`)
                if (imageResponse.data && imageResponse.data.data) {
                    productData.images = imageResponse.data.data
                } else {
                    productData.images = []
                }
            } catch (imgError) {
                console.warn('获取产品图片失败:', imgError)
                productData.images = []
            }

            product.value = productData
            currentImageIndex.value = 0

            // 获取库存信息
            await loadInventoryData(shoeId)
            // 加载评论数据
            await loadComments(shoeId)
        } else {
            error.value = response.data?.message || '获取产品详情失败'
        }
    } catch (err) {
        console.error('获取产品详情失败:', err)
        error.value = '网络错误，请重试'
    } finally {
        loading.value = false
    }
}

// 获取库存数据
const loadInventoryData = async (shoeId) => {
    try {
        const response = await axios.get(`/api/inventory/getInventoryByShoeId/${shoeId}`)
        console.log('库存接口响应:', response.data) // 添加调试日志

        if (response.data && response.data.code === 200 && response.data.data) {
            // 根据后端返回的数据结构处理
            let inventoryArray = []

            if (Array.isArray(response.data.data)) {
                // 如果返回的是数组
                inventoryArray = response.data.data
            } else if (response.data.data.inventories) {
                // 如果返回的是包含 inventories 字段的对象
                inventoryArray = response.data.data.inventories
            } else if (response.data.data.sizeInventories) {
                // 如果返回的是包含 sizeInventories 字段的对象
                inventoryArray = response.data.data.sizeInventories
            } else {
                // 如果返回的是单个库存对象，转换为数组
                inventoryArray = [response.data.data]
            }

            console.log('处理后的库存数组:', inventoryArray)
            inventoryData.value = inventoryArray
        } else {
            console.warn('库存接口返回数据异常:', response.data)
            inventoryData.value = []
        }
    } catch (err) {
        console.error('获取库存信息失败:', err)
        inventoryData.value = []
    }
}

// 加载评论数据
const loadComments = async (shoeId) => {
    try {
        commentsLoading.value = true
        const response = await axios.post('/api/comment/getByShoeId', 
            `shoeId=${shoeId}`,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        
        if (response.data && response.data.code === 200 && response.data.data) {
            comments.value = response.data.data
            
            // 逐个加载用户信息，因为后端只支持单个用户ID查询
            const userIds = [...new Set(comments.value.map(c => c.userId))]
            if (userIds.length > 0) {
                try {
                    // 逐个查询用户信息
                    for (const userId of userIds) {
                        try {
                            const userResponse = await axios.post('/api/users/getUsersByIds',
                                `id=${userId}`,
                                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                            )
                            if (userResponse.data && userResponse.data.code === 200 && userResponse.data.data) {
                                userInfoMap.value[userId] = userResponse.data.data
                            }
                        } catch (userError) {
                            console.warn(`获取用户${userId}信息失败:`, userError)
                        }
                    }
                } catch (userError) {
                    console.warn('获取用户信息失败:', userError)
                }
            }
        } else {
            comments.value = []
        }
    } catch (err) {
        console.error('获取评论失败:', err)
        comments.value = []
    } finally {
        commentsLoading.value = false
    }
}

// 图片选择
const selectImage = (index) => {
    currentImageIndex.value = index
    showZoom.value = false
}

// 图片放大镜效果 - 优化版本
const handleImageZoom = (event) => {
    if (!mainImageWrapper.value || !mainImage.value) return

    const rect = mainImageWrapper.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const lensSize = 100
    const zoomLevel = 2

    // 计算放大镜位置
    const lensX = Math.max(0, Math.min(x - lensSize / 2, rect.width - lensSize))
    const lensY = Math.max(0, Math.min(y - lensSize / 2, rect.height - lensSize))

    // 设置放大镜样式
    zoomLensStyle.value = {
        left: `${lensX}px`,
        top: `${lensY}px`,
        width: `${lensSize}px`,
        height: `${lensSize}px`
    }

    // 设置放大图片样式 - 根据鼠标位置计算偏移
    const zoomedX = -(x * zoomLevel - lensSize / 2)
    const zoomedY = -(y * zoomLevel - lensSize / 2)

    zoomedImageStyle.value = {
        transform: `translate(${zoomedX}px, ${zoomedY}px) scale(${zoomLevel})`
    }

    showZoom.value = true
}

const hideZoom = () => {
    showZoom.value = false
}

// 尺码选择
const selectSize = (sizeId) => {
    if (selectedSize.value === sizeId) {
        selectedSize.value = null
    } else {
        selectedSize.value = sizeId
        // 重置数量为1
        quantity.value = 1
    }
}

// 数量控制
const increaseQuantity = () => {
    if (quantity.value < maxQuantity.value) {
        quantity.value++
    }
}

const decreaseQuantity = () => {
    if (quantity.value > 1) {
        quantity.value--
    }
}

const validateQuantity = () => {
    if (quantity.value < 1) quantity.value = 1
    if (quantity.value > maxQuantity.value) quantity.value = maxQuantity.value
}

// 获取当前选中尺码的库存 - 修复了这里的错误
const getCurrentSizeStock = () => {
    if (!selectedSize.value || !inventoryData.value || !Array.isArray(inventoryData.value)) return 0
    const selectedInventory = inventoryData.value.find(item => item.sizeId === selectedSize.value)
    return selectedInventory ? selectedInventory.inventoryNumber : 0
}

// 操作按钮
const addToCart = async () => {
    // 未登录：统一提示并返回
    if (!isLoggedIn.value) { showToast('操作失败，请先登录', 'error'); return }
    if (!selectedSize.value) { showToast('请先选择尺码', 'warning'); return }
    if (!product.value || !product.value.shoeId) { showToast('商品信息不完整，请刷新后重试', 'error'); return }

    try {
        const userId = await userManager.getUserId()
        if (!userId) { showToast('操作失败，请先登录', 'error'); return }
        cartManager.setUserId(userId)
        const ok = await cartManager.addToCart(selectedSize.value, quantity.value, product.value.shoeId)
        if (ok) {
            await cartManager.refreshCartCount()
            showToast(`已将 ${product.value.name} 加入购物车`, 'success')
        } else {
            showToast('操作失败，请先登录', 'error')
        }
    } catch (err) {
        console.error('加入购物车失败:', err)
        showToast('操作失败，请先登录', 'error')
    }
}

const buyNow = () => {
    if (!isLoggedIn.value) { showToast('操作失败，请先登录', 'error'); return }
    if (!selectedSize.value) { showToast('请先选择尺码', 'warning'); return }

    // 检查是否从订单确认页面跳转过来
    const fromOrderConfirmation = sessionStorage.getItem('fromOrderConfirmation')

    // 跳转到订单确认页面，传递商品信息
    router.push({
        name: 'OrderConfirmation',
        query: {
            productId: product.value.shoeId,
            sizeId: selectedSize.value,
            quantity: quantity.value,
            fromOrderConfirmation: fromOrderConfirmation ? 'true' : 'false'
        }
    })
}

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return 'N/A'

    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN')
    } catch (err) {
        return dateString
    }
}

// 格式化评论时间
const formatCommentTime = (timeString) => {
    if (!timeString) return '未知时间'
    try {
        const date = new Date(timeString)
        return date.toLocaleDateString('zh-CN')
    } catch (error) {
        return timeString
    }
}

// 获取用户头像
const getUserAvatar = (userId) => {
    const user = userInfoMap.value[userId]
    if (user?.avatarPath) {
        return `/api/shoeImg/getImage/${user.avatarPath}`
    }
    return null
}

// 获取用户名
const getUserName = (userId) => {
    const user = userInfoMap.value[userId]
    return user?.username || `用户${userId}`
}

// 生命周期
onMounted(() => {
    loadProductDetail()
    // 进入详情页即记录搜索历史（如果从搜索或列表进入）
    recordSearchHistoryOnView()
    // 进入详情页记录一次点击
    recordClickOnEnter()
    updateLoginState()
    
    // 监听用户登录状态变化
    window.addEventListener('user-login-change', updateLoginState)
})

// 组件卸载时清理事件监听
onUnmounted(() => {
    window.removeEventListener('user-login-change', updateLoginState)
})

// 进入详情页记录历史（带本地短期阻止，避免刚删又写回）
async function recordSearchHistoryOnView() {
    try {
        const shoeId = route.params.id || route.query.shoeId
        if (!shoeId) return
        const userId = await userManager.getUserId()
        if (!userId) return
        // 与 MainNav.vue 使用同一套阻止规则
        const HISTORY_BLOCK_MS = 5 * 60 * 1000
        const blockKey = `search-history-block:${userId}:${Number(shoeId)}`
        try {
            const ts = sessionStorage.getItem(blockKey)
            if (ts && Date.now() - Number(ts) < HISTORY_BLOCK_MS) {
                return // 在阻止窗口内，跳过写入
            }
        } catch (_) { void 0 }
        const params = new URLSearchParams({ userId, shoeId })
        await axios.post('/api/searchHistory/add', params)
    } catch (e) {
        // 静默失败即可，不影响详情页
        console.warn('记录搜索历史失败(详情页):', e?.message || e)
    }
}

// 进入页面记录一次点击
async function recordClickOnEnter() {
    try {
        const shoeId = route.params.id || route.query.shoeId
        if (!shoeId) return

        // 获取用户ID（可空）
        const userId = await userManager.getUserId()

        // 获取公网IP（失败则回退为 0.0.0.0）
        let ip = '0.0.0.0'
        try {
            const ipRes = await axios.get('https://api.ipify.org?format=json')
            if (ipRes?.data?.ip) ip = ipRes.data.ip
        } catch (_) {
            // ignore
        }

        await ClickLogAPI.recordClick(Number(shoeId), userId ?? undefined, ip)
    } catch (e) {
        // 静默失败，不影响正常功能
        console.warn('记录点击失败:', e?.message || e)
    }
}
</script>

<style scoped>
.product-detail-container {
    /* 统一到 MainNav 黑白极简主题 */
    --color-text: #111;
    --color-subtext: #666;
    --color-border: #ddd;
    --color-bg: #fff;
    --color-bg-soft: #f8f8f8;
    --color-accent: #c6ff00;
    --btn-radius: 8px;
    --btn-border: 1.5px;

    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: Helvetica Neue, Arial, sans-serif;
}

/* 加载状态 */
.loading-container {
    text-align: center;
    padding: 60px 20px;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid var(--color-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 错误状态 */
.error-container {
    text-align: center;
    padding: 60px 20px;
    color: #dc3545;
}

.error-icon {
    font-size: 3rem;
    margin-bottom: 20px;
}

.retry-btn {
    background: transparent;
    color: #000;
    border: var(--btn-border) solid #000;
    padding: 12px 24px;
    border-radius: var(--btn-radius);
    cursor: pointer;
    font-size: 1rem;
    margin-top: 20px;
    transition: background .15s ease, color .15s ease, border-color .15s ease, transform .1s ease;
}

.sex-tag {
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
}

.retry-btn:hover {
    background: #000;
    color: #fff;
    border-color: #000;
}

/* 面包屑导航 */
.breadcrumb {
    margin-bottom: 30px;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
}

.breadcrumb-item {
    color: #000;
    text-decoration: none;
    font-weight: 600;
}

.breadcrumb-item:hover {
    text-decoration: underline;
}

.breadcrumb-separator {
    margin: 0 10px;
    color: #999;
}

.breadcrumb-current {
    color: #666;
    font-weight: 600;
}

/* 产品主要信息区域 */
.product-main-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
}

/* 图片展示区域 */
.product-images-section {
    position: relative;
}

.main-image-container {
    position: relative;
    margin-bottom: 20px;
}

.main-image-wrapper {
    position: relative;
    width: 100%;
    height: 400px;
    overflow: hidden;
    border-radius: 12px;
    cursor: zoom-in;
}

.main-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.zoom-lens {
    position: absolute;
    border: 2px solid rgb(211, 169, 101);
    background: rgba(211, 169, 101, 0.1);
    pointer-events: none;
    z-index: 10;
}

.zoomed-image-container {
    position: absolute;
    top: 0;
    left: 100%;
    width: 400px;
    height: 400px;
    overflow: hidden;
    border-radius: 12px;
    border: 2px solid rgb(211, 169, 101);
    background: white;
    z-index: 20;
    margin-left: 20px;
}

.zoomed-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform-origin: 0 0;
}

.thumbnail-list {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 10px 0;
}

.thumbnail-item {
    flex-shrink: 0;
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.thumbnail-item:hover {
    border-color: rgb(211, 169, 101);
}

.thumbnail-item.active {
    border-color: rgb(211, 169, 101);
    border-width: 3px;
}

.thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* 产品信息区域 */
.product-info-section {
    padding: 20px;
}

.product-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 20px 0;
    line-height: 1.3;
}

.product-serial {
    margin-bottom: 20px;
    padding: 15px;
    background: var(--color-bg-soft);
    border-radius: var(--btn-radius);
}

.label {
    font-weight: 600;
    color: var(--color-subtext);
    margin-right: 10px;
}

.value {
    color: var(--color-text);
    font-weight: 500;
}

.price-section {
    margin-bottom: 25px;
}

.current-price {
    margin-bottom: 10px;
}

.current-price .price {
    font-size: 2rem;
    font-weight: 700;
    color: #e74c3c;
}

.original-price .price {
    font-size: 1.2rem;
    color: #999;
    text-decoration: line-through;
}

.points-section,
.sales-section {
    margin-bottom: 20px;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
}

.section-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 15px 0;
}

.size-section,
.quantity-section {
    margin-bottom: 25px;
}

.size-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.size-option {
    padding: 10px 20px;
    border: 2px solid #ddd;
    border-radius: 25px;
    background: white;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    position: relative;
    min-width: 80px;
    text-align: center;
}

.size-option:hover:not(.disabled) {
    border-color: #000;
    color: #000;
}

.size-option.selected {
    background: #000;
    color: #fff;
    border-color: #000;
}

.size-option.disabled {
    background: #f5f5f5;
    color: #ccc;
    border-color: #ddd;
    cursor: not-allowed;
}

.stock-info {
    font-size: 0.8rem;
    margin-left: 5px;
    opacity: 0.8;
}

.quantity-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.quantity-btn {
    width: 40px;
    height: 40px;
    border: 2px solid #ddd;
    background: white;
    color: #666;
    cursor: pointer;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: 600;
    transition: all 0.3s ease;
}

.quantity-btn:hover:not(:disabled) {
    border-color: #000;
    color: #000;
}

.quantity-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.quantity-input {
    width: 80px;
    height: 40px;
    text-align: center;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
}

.quantity-input:focus {
    outline: none;
    border-color: #000;
}

.stock-warning {
    font-size: 0.9rem;
    color: #e74c3c;
    font-weight: 500;
}

.product-tags {
    display: flex;
    gap: 10px;
    margin-bottom: 25px;
    flex-wrap: wrap;
}

.tag {
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 0.9rem;
    font-weight: 500;
}

.brand-tag {
    background: #f2f2f2;
    color: #333;
}

.type-tag {
    background: #f2f2f2;
    color: #333;
}

.color-tag {
    background: #f2f2f2;
    color: #333;
}

.action-buttons {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
}

.add-to-cart-btn,
.buy-now-btn {
    flex: 1;
    padding: 14px 20px;
    border-radius: var(--btn-radius);
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
    transition: background .15s ease, color .15s ease, border-color .15s ease, transform .1s ease;
    border: var(--btn-border) solid #000;
    background: transparent;
    color: #000;
}

.add-to-cart-btn:hover:not(:disabled),
.buy-now-btn:hover:not(:disabled) {
    background: #000;
    color: #fff;
    border-color: #000;
    transform: translateY(-1px);
}

.add-to-cart-btn:disabled,
.buy-now-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

/* 产品详细信息 */
.product-details-section {
    background: var(--color-bg);
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.detail-item {
    display: flex;
    align-items: center;
    padding: 15px;
    background: var(--color-bg-soft);
    border-radius: 8px;
}

.detail-label {
    font-weight: 600;
    color: var(--color-subtext);
    min-width: 120px;
    margin-right: 15px;
}

.detail-value {
    color: var(--color-text);
    font-weight: 500;
}

.detail-value.discount {
    color: #e74c3c;
    font-weight: 600;
}

.rating-display {
    display: flex;
    align-items: center;
    gap: 5px;
}

.detail-stars {
    display: flex;
    gap: 2px;
}

.star-detail {
    font-size: 1rem;
    color: #ccc;
}

.star-detail.filled {
    color: #e74c3c;
}

.description-section {
    border-top: 1px solid #eee;
    padding-top: 30px;
}

.subsection-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 20px 0;
}

.description-text {
    line-height: 1.8;
    color: var(--color-subtext);
    font-size: 1rem;
}

/* 评论展示区域 */
.comments-preview-section {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px solid #eee;
}

.comments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.comments-title {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
}

.rating-summary {
    display: flex;
    align-items: center;
    gap: 10px;
}

.average-rating {
    font-size: 1.8rem;
    font-weight: 700;
    color: #e74c3c;
}

.stars {
    display: flex;
    gap: 3px;
}

.star {
    font-size: 1.2rem;
    color: #ccc;
}

.star.filled {
    color: #e74c3c;
}

.comment-count {
    font-size: 0.9rem;
    color: #666;
}

.comments-preview {
    margin-bottom: 20px;
}

.comment-preview-item {
    background: var(--color-bg-soft);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    border: 1px solid #eee;
}

.comment-user-info {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.user-avatar {
    font-size: 1.5rem;
    margin-right: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-details {
    display: flex;
    align-items: center;
    gap: 8px;
}

.username {
    font-weight: 600;
    color: var(--color-text);
}

.comment-rating {
    display: flex;
    gap: 3px;
}

.star-small {
    font-size: 0.8rem;
    color: #ccc;
}

.star-small.filled {
    color: #e74c3c;
}

.comment-content-preview {
    font-size: 0.95rem;
    color: var(--color-subtext);
    line-height: 1.6;
    margin-bottom: 10px;
}

.comment-time {
    font-size: 0.8rem;
    color: #999;
    text-align: right;
}

.no-comments {
    text-align: center;
    padding: 40px 0;
    color: #999;
}

.no-comments-icon {
    font-size: 3rem;
    margin-bottom: 15px;
}

/* 评论操作区域 */
.comment-actions {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}

.view-all-comments {
    text-align: center;
    margin-top: 20px;
}

.view-all-btn {
    display: inline-block;
    padding: 10px 20px;
    background: #f2f2f2;
    color: #333;
    border-radius: var(--btn-radius);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    transition: background .15s ease, color .15s ease;
}

.view-all-btn:hover {
    background: #e0e0e0;
    color: #000;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .product-main-section {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .main-image-wrapper {
        height: 300px;
    }

    .zoomed-image-container {
        display: none;
    }

    .details-grid {
        grid-template-columns: 1fr;
    }

    .action-buttons {
        flex-direction: column;
    }

    .size-options {
        justify-content: center;
    }

    /* 评论区域响应式调整 */
    .comments-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }

    .rating-summary {
        flex-wrap: wrap;
        gap: 8px;
    }

    .comment-preview-item {
        padding: 12px;
    }

    .comment-user-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
}

@media (max-width: 480px) {
    .product-detail-container {
        padding: 10px;
    }

    .product-title {
        font-size: 1.5rem;
    }

    .main-image-wrapper {
        height: 250px;
    }

    .thumbnail-item {
        width: 60px;
        height: 60px;
    }
}
</style>