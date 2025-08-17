<template>
    <div class="product-detail-container">
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
                        <div 
                            class="main-image-wrapper"
                            @mousemove="handleImageZoom"
                            @mouseleave="hideZoom"
                            ref="mainImageWrapper"
                        >
                            <img 
                                :src="currentMainImage" 
                                :alt="product.name"
                                class="main-image"
                                ref="mainImage"
                            >
                            <!-- 放大镜效果 -->
                            <div 
                                v-show="showZoom"
                                class="zoom-lens"
                                :style="zoomLensStyle"
                            ></div>
                        </div>
                        
                        <!-- 放大后的图片 - 固定在右侧 -->
                        <div 
                            v-show="showZoom"
                            class="zoomed-image-container"
                        >
                            <img 
                                :src="currentMainImage" 
                                :alt="product.name"
                                class="zoomed-image"
                                :style="zoomedImageStyle"
                            >
                        </div>
                    </div>

                    <!-- 缩略图列表 -->
                    <div v-if="product.images && product.images.length > 1" class="thumbnail-list">
                        <div 
                            v-for="(image, index) in product.images" 
                            :key="image.imgId"
                            class="thumbnail-item"
                            :class="{ 'active': currentImageIndex === index }"
                            @click="selectImage(index)"
                        >
                            <img 
                                :src="`/api/shoeImg/getImage/${image.imagePath}`"
                                :alt="`${product.name} ${index + 1}`"
                                class="thumbnail-image"
                            >
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
                            <button 
                                v-for="size in availableSizes" 
                                :key="size.sizeId"
                                class="size-option"
                                :class="{ 
                                    'selected': selectedSize === size.sizeId,
                                    'disabled': !size.hasStock
                                }"
                                @click="selectSize(size.sizeId)"
                                :disabled="!size.hasStock"
                            >
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
                            <button 
                                @click="decreaseQuantity" 
                                class="quantity-btn"
                                :disabled="quantity <= 1"
                            >
                                -
                            </button>
                            <input 
                                v-model.number="quantity" 
                                type="number" 
                                min="1" 
                                :max="maxQuantity"
                                class="quantity-input"
                                @input="validateQuantity"
                            >
                            <button 
                                @click="increaseQuantity" 
                                class="quantity-btn"
                                :disabled="quantity >= maxQuantity"
                            >
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
                        <button @click="addToCart" class="add-to-cart-btn" :disabled="!selectedSize">
                            🛒 加入购物车
                        </button>
                        <button @click="buyNow" class="buy-now-btn" :disabled="!selectedSize">
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
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import cartManager from '@/utils/cart'
import userManager from '@/utils/userManager'

// 路由相关
const route = useRoute()
const router = useRouter()

// 响应式数据
const product = ref(null)
const loading = ref(true)
const error = ref('')
const inventoryData = ref(null)

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
        const response = await axios.post('/shoe/getById', 
            `shoeId=${shoeId}`,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )

        if (response.data && response.data.code === 200 && response.data.data) {
            const productData = response.data.data
            
            // 获取产品图片
            try {
                const imageResponse = await axios.get(`/shoeImg/list/${shoeId}`)
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
        const response = await axios.get(`/inventory/getInventoryByShoeId/${shoeId}`)
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
    if (!selectedSize.value) {
        alert('请先选择尺码')
        return
    }

    if (!product.value || !product.value.shoeId) {
        alert('商品信息不完整，请刷新后重试')
        return
    }

    try {
        // 获取并设置用户ID
        const userId = await userManager.getUserId()
        if (!userId) {
            alert('请先登录')
            return
        }
        cartManager.setUserId(userId)

        // 调用购物车管理器（参数顺序：sizeId, quantity, shoeId）
        const ok = await cartManager.addToCart(selectedSize.value, quantity.value, product.value.shoeId)
        if (ok) {
            await cartManager.refreshCartCount()
            alert(`已将 ${product.value.name} 加入购物车`)
        } else {
            alert('加入购物车失败，请重试')
        }
    } catch (err) {
        console.error('加入购物车失败:', err)
        alert('加入购物车失败，请检查网络或稍后再试')
    }
}

const buyNow = () => {
    if (!selectedSize.value) {
        alert('请先选择尺码')
        return
    }
    
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

// 生命周期
onMounted(() => {
    loadProductDetail()
})
</script>

<style scoped>
.product-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Playfair Display', 'Georgia', serif;
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
    border-top: 4px solid rgb(211, 169, 101);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
    background: rgb(211, 169, 101);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 20px;
}

.sex-tag {
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
}

.retry-btn:hover {
    background: #d4af37;
}

/* 面包屑导航 */
.breadcrumb {
    margin-bottom: 30px;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
}

.breadcrumb-item {
    color: rgb(211, 169, 101);
    text-decoration: none;
    font-weight: 500;
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
    font-weight: 600;
    color: #333;
    margin: 0 0 20px 0;
    line-height: 1.3;
}

.product-serial {
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
}

.label {
    font-weight: 600;
    color: #666;
    margin-right: 10px;
}

.value {
    color: #333;
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

.points-section, .sales-section {
    margin-bottom: 20px;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
}

.section-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 15px 0;
}

.size-section, .quantity-section {
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
    border-color: rgb(211, 169, 101);
    color: rgb(211, 169, 101);
}

.size-option.selected {
    background: rgb(211, 169, 101);
    color: white;
    border-color: rgb(211, 169, 101);
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
    border-color: rgb(211, 169, 101);
    color: rgb(211, 169, 101);
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
    border-color: rgb(211, 169, 101);
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
    background: rgba(52, 152, 219, 0.1);
    color: #3498db;
}

.type-tag {
    background: rgba(46, 204, 113, 0.1);
    color: #2ecc71;
}

.color-tag {
    background: rgba(155, 89, 182, 0.1);
    color: #9b59b6;
}

.action-buttons {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
}

.add-to-cart-btn, .buy-now-btn {
    flex: 1;
    padding: 15px 20px;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.add-to-cart-btn {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
}

.buy-now-btn {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
}

.add-to-cart-btn:hover:not(:disabled), .buy-now-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.add-to-cart-btn:disabled, .buy-now-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

/* 产品详细信息 */
.product-details-section {
    background: white;
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
    background: #f8f9fa;
    border-radius: 8px;
}

.detail-label {
    font-weight: 600;
    color: #666;
    min-width: 120px;
    margin-right: 15px;
}

.detail-value {
    color: #333;
    font-weight: 500;
}

.detail-value.discount {
    color: #e74c3c;
    font-weight: 600;
}

.description-section {
    border-top: 1px solid #eee;
    padding-top: 30px;
}

.subsection-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 20px 0;
}

.description-text {
    line-height: 1.8;
    color: #666;
    font-size: 1rem;
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