<template>
    <div class="product-display-container">
        <!-- 页面头部 -->
        <div class="product-header">
            <h2 class="title">
                <span class="icon">👟</span>
                产品展示
            </h2>
            <div class="product-count">总计: {{ totalCount }} 种商品</div>
        </div>

        <!-- 搜索区域 -->
        <div class="search-section">
            <div class="search-container">
                <div class="search-input-group">
                    <input 
                        type="text" 
                        v-model="searchKeyword" 
                        @input="handleSearch"
                        placeholder="搜索产品名称、序列号或描述..."
                        class="search-input"
                    >
                    <button class="search-btn" @click="handleSearch">
                        🔍
                    </button>
                </div>
                <div class="search-options">
                    <label class="search-option">
                        <input type="checkbox" v-model="searchInName" @change="handleSearch">
                        产品名称
                    </label>
                    <label class="search-option">
                        <input type="checkbox" v-model="searchInSerial" @change="handleSearch">
                        序列号
                    </label>
                    <label class="search-option">
                        <input type="checkbox" v-model="searchInDescription" @change="handleSearch">
                        描述
                    </label>
                </div>
            </div>
        </div>

        <!-- 筛选区域 -->
        <div class="filter-section">
            <h3 class="filter-title">条件筛选</h3>
            <div class="filter-container">
                <!-- 品牌筛选 -->
                <div class="filter-group">
                    <label class="filter-label">品牌:</label>
                    <div class="filter-options">
                        <button 
                            v-for="brand in brands" 
                            :key="brand.brandId"
                            @click="toggleBrandFilter(brand.brandId)"
                            class="filter-option"
                            :class="{ 'active': selectedBrands.includes(brand.brandId) }"
                        >
                            {{ brand.brandName }}
                        </button>
                    </div>
                </div>

                <!-- 版型筛选 -->
                <div class="filter-group">
                    <label class="filter-label">版型:</label>
                    <div class="filter-options">
                        <button 
                            v-for="type in types" 
                            :key="type.typeId"
                            @click="toggleTypeFilter(type.typeId)"
                            class="filter-option"
                            :class="{ 'active': selectedTypes.includes(type.typeId) }"
                        >
                            {{ type.typeName }}
                        </button>
                    </div>
                </div>

                <!-- 性别筛选 -->
                <div class="filter-group">
                    <label class="filter-label">性别:</label>
                    <div class="filter-options">
                        <button 
                            v-for="sex in sexOptions" 
                            :key="sex.value"
                            @click="toggleSexFilter(sex.value)"
                            class="filter-option"
                            :class="{ 'active': selectedSexes.includes(sex.value) }"
                            :title="`选择${sex.label}`"
                        >
                            {{ sex.label }}
                        </button>
                    </div>
                </div>

                <!-- 颜色筛选 -->
                <div class="filter-group">
                    <label class="filter-label">颜色:</label>
                    <div class="filter-options">
                        <button 
                            v-for="color in colors" 
                            :key="color.colorId"
                            @click="toggleColorFilter(color.colorId)"
                            class="filter-option"
                            :class="{ 'active': selectedColors.includes(color.colorId) }"
                        >
                            {{ color.colorName }}
                        </button>
                    </div>
                </div>

                <!-- 尺码筛选 - 显示所有尺码，不显示库存状态 -->
                <div class="filter-group">
                    <label class="filter-label">尺码:</label>
                    <div class="filter-options">
                        <button 
                            v-for="size in sizes" 
                            :key="size.sizeId"
                            @click="toggleSizeFilter(size.sizeId)"
                            class="filter-option"
                            :class="{ 'active': selectedSizes.includes(size.sizeId) }"
                            :title="`选择尺码 ${size.size}`"
                        >
                            {{ size.size }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- 清除筛选按钮 -->
            <div class="filter-actions">
                <button @click="clearAllFilters" class="clear-filters-btn">
                    <span class="btn-icon">🗑️</span>
                    清除所有筛选
                </button>
            </div>
        </div>

        <!-- 产品列表 -->
        <div class="products-section">
            <div v-if="loading" class="loading">正在加载产品...</div>
            <div v-else-if="error" class="error">{{ error }}</div>
            <div v-else-if="filteredProducts.length === 0" class="no-products">
                <div class="no-products-icon">📦</div>
                <h3>暂无产品</h3>
                <p>没有找到符合筛选条件的产品</p>
            </div>
            <div v-else class="products-grid">
                <div 
                    v-for="product in paginatedProducts" 
                    :key="product.shoeId" 
                    :data-product-id="product.shoeId"
                    class="product-card"
                >
                    <!-- 产品图片 -->
                    <div class="product-image-container">
                        <div v-if="product.images && product.images.length > 0" class="product-images">
                            <div class="image-carousel">
                                <img 
                                    :src="`/api/shoeImg/getImage/${product.images[product.currentImageIndex || 0].imagePath}`"
                                    :alt="product.name" 
                                    class="main-product-image"
                                    loading="lazy"
                                    @click="showImageGallery(product)"
                                >
                                <!-- 图片切换按钮 -->
                                <div v-if="product.images.length > 1" class="image-selector">
                                    <button 
                                        class="image-switch-btn" 
                                        @click="cycleProductImage(product)"
                                        :title="`切换图片 (${(product.currentImageIndex || 0) + 1}/${product.images.length})`"
                                    >
                                        {{ (product.currentImageIndex || 0) + 1 }}/{{ product.images.length }}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-image">
                            📷
                        </div>
                    </div>

                    <!-- 产品信息 -->
                    <div class="product-info">
                        <h4 class="product-name" :title="product.name">{{ product.name }}</h4>
                        <p class="product-serial">{{ product.serialNumber }}</p>
                        
                        <div class="product-details">
                            <span class="brand-tag">{{ product.brand?.brandName || 'N/A' }}</span>
                            <span class="type-tag">{{ product.shoesType?.typeName || 'N/A' }}</span>
                            <span class="color-tag">{{ product.color?.colorName || 'N/A' }}</span>
                            <span class="sex-tag">{{ getShoeSexText(product.shoeSex) }}</span>
                        </div>

                        <div class="price-section">
                            <span class="original-price">¥{{ product.price }}</span>
                            <span v-if="product.discountPrice" class="discount-price">¥{{ product.discountPrice }}</span>
                        </div>

                        <div class="product-meta">
                            <span class="sales-info">销量: {{ product.salesVolume || 0 }}</span>
                            <span class="points-info">积分: {{ product.points || 0 }}</span>
                        </div>

                        <!-- 显示产品所有尺码 - 修复尺码显示问题 -->
                        <div class="available-sizes">
                            <span class="sizes-label">可用尺码:</span>
                            <div class="size-tags">
                                <span 
                                    v-for="size in getProductAllSizes(product.shoeId)" 
                                    :key="size.sizeId"
                                    class="size-tag"
                                    :class="{ 'no-stock': size.inventoryNumber === 0 }"
                                    :title="`尺码 ${size.size}: ${size.inventoryNumber > 0 ? size.inventoryNumber + ' 双库存' : '无库存'}`"
                                >
                                    {{ size.size }}
                                </span>
                                <!-- 如果没有尺码数据，显示提示信息 -->
                                <span v-if="getProductAllSizes(product.shoeId).length === 0" class="no-sizes-info">
                                    暂无尺码信息
                                </span>
                            </div>
                        </div>

                        <div class="product-actions">
                            <button class="view-details-btn" @click="viewProductDetails(product)">
                                查看详情
                            </button>
                            <button class="add-to-cart-btn" @click="addToCart(product)">
                                加入购物车
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分页控件 -->
        <div v-if="totalPages > 1" class="pagination-container">
            <div class="pagination-info">
                <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
                <span class="page-size-control">
                    每页显示:
                    <input 
                        type="number" 
                        v-model.number="pageSize" 
                        @change="handlePageSizeChange" 
                        min="1" 
                        max="50"
                        class="page-size-input"
                    >
                    条
                </span>
            </div>
            <div class="pagination-controls">
                <button class="page-btn" @click="goToPage(1)" :disabled="currentPage === 1">首页</button>
                <button class="page-btn" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">上一页</button>
                <span class="page-numbers">
                    <button 
                        v-for="page in visiblePages" 
                        :key="page" 
                        class="page-number-btn"
                        :class="{ 'active': page === currentPage }" 
                        @click="goToPage(page)"
                    >
                        {{ page }}
                    </button>
                </span>
                <button class="page-btn" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">下一页</button>
                <button class="page-btn" @click="goToPage(totalPages)" :disabled="currentPage === totalPages">末页</button>
            </div>
        </div>

        <!-- 图片画廊模态框 -->
        <div v-if="showImageGalleryModal" class="dialog-overlay" @click="closeImageGallery">
            <div class="dialog image-gallery-dialog" @click.stop>
                <div class="dialog-header">
                    <h3>{{ galleryProduct?.name }} - 图片展示</h3>
                    <button class="close-btn" @click="closeImageGallery">✕</button>
                </div>
                <div class="dialog-content">
                    <div class="gallery-main-image">
                        <img 
                            v-if="galleryProduct?.images?.length > 0"
                            :src="`/api/shoeImg/getImage/${galleryProduct.images[galleryCurrentIndex].imagePath}`"
                            :alt="galleryProduct.name" 
                            class="main-gallery-image"
                        >
                        <div v-if="galleryProduct?.images?.length > 1" class="gallery-controls">
                            <button @click="previousGalleryImage" class="gallery-nav-btn prev">‹</button>
                            <button @click="nextGalleryImage" class="gallery-nav-btn next">›</button>
                        </div>
                    </div>
                    <div v-if="galleryProduct?.images?.length > 1" class="gallery-thumbnails">
                        <img 
                            v-for="(image, index) in galleryProduct.images" 
                            :key="image.imgId"
                            :src="`/api/shoeImg/getImage/${image.imagePath}`"
                            :alt="`${galleryProduct.name} ${index + 1}`" 
                            class="gallery-thumbnail"
                            :class="{ 'active': index === galleryCurrentIndex }" 
                            @click="galleryCurrentIndex = index"
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, reactive, nextTick, watch } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()

// 响应式数据
const products = ref([])
const filteredProducts = ref([])
const loading = ref(false)
const error = ref('')

// 筛选选项数据
const brands = ref([])
const types = ref([])
const colors = ref([])
const sizes = ref([])


// 筛选状态
const selectedBrands = ref([])
const selectedTypes = ref([])
const selectedColors = ref([])
const selectedSizes = ref([])
const selectedSexes = ref([])

// 性别选项
const sexOptions = [
    { value: 1, label: '男鞋' },
    { value: 2, label: '女鞋' },
    { value: 3, label: '童鞋' },
    { value: 4, label: '其他' }
]

// 资源缓存与并发控制
const imageCache = new Map()
const inventoryCache = new Map()
const inFlightImages = new Set()
const inFlightInventories = new Set()
let productCardIo = null

// 搜索功能
const searchKeyword = ref('')
const searchInName = ref(true)
const searchInSerial = ref(true)
const searchInDescription = ref(false)

// 分页数据
const currentPage = ref(1)
const pageSize = ref(20) // 每页20条产品
const totalCount = ref(0)

// 图片画廊
const showImageGalleryModal = ref(false)
const galleryProduct = ref(null)
const galleryCurrentIndex = ref(0)

// 计算属性
const totalPages = computed(() => {
    return Math.ceil(filteredProducts.value.length / pageSize.value)
})

const visiblePages = computed(() => {
    const pages = []
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, currentPage.value + 2)

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    return pages
})

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredProducts.value.slice(start, end)
})

// 优化后的 fetchProducts：仅获取产品基本信息，其它资源按需懒加载
const fetchProducts = async () => {
    loading.value = true
    error.value = ''
    try {
        const productResponse = await axios.post('/api/shoe/getAll', {}, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })

        if (productResponse.data && productResponse.data.data) {
            const productList = productResponse.data.data.map(p => {
                const item = reactive({ ...p })
                // 占位字段，避免模板初次渲染抖动
                item.images = Array.isArray(item.images) ? item.images : []
                item.currentImageIndex = 0
                item.inventoryData = Array.isArray(item.inventoryData) ? item.inventoryData : []
                return item
            })

            products.value = productList
            applyFilters()

            await nextTick()
            observeCurrentPage()
        } else {
            products.value = []
            filteredProducts.value = []
        }
    } catch (error) {
        console.error('获取产品数据失败:', error)
        error.value = '获取产品数据失败，请重试。'
        products.value = []
        filteredProducts.value = []
    } finally {
        loading.value = false
    }
}

// 初始化并配置 IntersectionObserver
function initIntersectionObserver() {
    if (productCardIo) {
        productCardIo.disconnect()
    }
    productCardIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = Number(entry.target.getAttribute('data-product-id'))
                ensureProductResources(id)
                productCardIo && productCardIo.unobserve(entry.target)
            }
        })
    }, { root: null, rootMargin: '300px 0px', threshold: 0.01 })
}

// 观察当前分页中的卡片
function observeCurrentPage() {
    if (!productCardIo) initIntersectionObserver()
    const container = document.querySelector('.products-grid')
    if (!container) return
    const cards = container.querySelectorAll('.product-card')
    cards.forEach(card => productCardIo.observe(card))
}

// 按需加载指定产品的图片与库存
async function ensureProductResources(shoeId) {
    const product = products.value.find(p => p.shoeId === shoeId)
    if (!product) return

    // 加载图片（带缓存与并发保护）
    if (!product.images || product.images.length === 0) {
        if (imageCache.has(shoeId)) {
            product.images = imageCache.get(shoeId)
            product.currentImageIndex = 0
        } else if (!inFlightImages.has(shoeId)) {
            inFlightImages.add(shoeId)
            try {
                const imageResponse = await axios.get(`/api/shoeImg/list/${shoeId}`)
                const imgs = (imageResponse.data && imageResponse.data.data) ? imageResponse.data.data : []
                product.images = imgs
                product.currentImageIndex = 0
                imageCache.set(shoeId, imgs)
            } catch (e) {
                product.images = []
            } finally {
                inFlightImages.delete(shoeId)
            }
        }
    }

    // 加载库存（带缓存与并发保护）
    if (!product.inventoryData || product.inventoryData.length === 0) {
        if (inventoryCache.has(shoeId)) {
            product.inventoryData = inventoryCache.get(shoeId)
        } else if (!inFlightInventories.has(shoeId)) {
            inFlightInventories.add(shoeId)
            try {
                const inventoryResponse = await axios.get(`/api/inventory/getInventoryByShoeId/${shoeId}`)
                let inventoryArray = []
                const data = inventoryResponse.data?.data
                if (Array.isArray(data)) {
                    inventoryArray = data
                } else if (data?.inventories) {
                    inventoryArray = data.inventories
                } else if (data?.sizeInventories) {
                    inventoryArray = data.sizeInventories
                } else if (data) {
                    inventoryArray = [data]
                }
                product.inventoryData = inventoryArray
                inventoryCache.set(shoeId, inventoryArray)
            } catch (e) {
                product.inventoryData = []
            } finally {
                inFlightInventories.delete(shoeId)
            }
        }
    }
}

// 获取筛选选项数据
const fetchOptions = async () => {
    try {
        // 并行请求所有筛选选项，提高加载速度
        const [brandResponse, typeResponse, colorResponse, sizeResponse] = await Promise.all([
            axios.post('/brand/getAll', {}, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }),
            axios.post('/shoesType/getAll', {}, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }),
            axios.post('/color/getAll', {}, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }),
            axios.post('/shoesSize/getAll', {}, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
        ])

        // 处理品牌数据
        if (brandResponse.data && brandResponse.data.data) {
            brands.value = brandResponse.data.data.filter(brand => !brand.brandDisabled)
        }

        // 处理版型数据
        if (typeResponse.data && typeResponse.data.data) {
            types.value = typeResponse.data.data.filter(type => !type.typeDisabled)
        }

        // 处理颜色数据
        if (colorResponse.data && colorResponse.data.data) {
            colors.value = colorResponse.data.data.filter(color => !color.colorDisabled)
        }

        // 处理尺码数据
        if (sizeResponse.data && sizeResponse.data.data) {
            sizes.value = sizeResponse.data.data.filter(size => !size.sizeDisabled)
        }
    } catch (error) {
        console.error('获取筛选选项失败:', error)
    }
}

// 修复后的 getProductAllSizes 函数 - 使用 ProductDetail 的库存调用方式
const getProductAllSizes = (shoeId) => {
    // 从产品对象中获取库存数据
    const product = products.value.find(p => p.shoeId === shoeId)
    if (!product || !product.inventoryData || !Array.isArray(product.inventoryData)) {
        console.log(`产品 ${shoeId} 没有库存数据`)
        return []
    }
    
    console.log(`产品 ${shoeId} 的库存数据:`, product.inventoryData)
    
    // 直接使用库存数据，因为已经通过 ProductDetail 的方式处理过了
    const result = product.inventoryData
        .map(inv => ({
            sizeId: inv.sizeId,
            size: inv.size,
            inventoryNumber: inv.inventoryNumber || 0
        }))
        .filter(item => item.size && item.size !== 'undefined') // 过滤掉无效的尺码
        .sort((a, b) => {
            // 按尺码大小排序，处理数字和字符串混合的情况
            const aSize = parseInt(a.size) || 0
            const bSize = parseInt(b.size) || 0
            return aSize - bSize
        })
    
    console.log(`产品 ${shoeId} 的最终尺码结果:`, result)
    return result
}

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

// 搜索功能
const handleSearch = () => {
    applyFilters()
}

const searchProducts = (products) => {
    if (!searchKeyword.value.trim()) {
        return products
    }

    const keyword = searchKeyword.value.toLowerCase().trim()
    return products.filter(product => {
        // 检查产品名称
        if (searchInName.value && product.name && product.name.toLowerCase().includes(keyword)) {
            return true
        }
        
        // 检查序列号
        if (searchInSerial.value && product.serialNumber && product.serialNumber.toLowerCase().includes(keyword)) {
            return true
        }
        
        // 检查描述
        if (searchInDescription.value && product.description && product.description.toLowerCase().includes(keyword)) {
            return true
        }
        
        return false
    })
}

// 筛选功能
const toggleBrandFilter = (brandId) => {
    const index = selectedBrands.value.indexOf(brandId)
    if (index > -1) {
        selectedBrands.value.splice(index, 1)
    } else {
        selectedBrands.value.push(brandId)
    }
    applyFilters()
}

const toggleTypeFilter = (typeId) => {
    const index = selectedTypes.value.indexOf(typeId)
    if (index > -1) {
        selectedTypes.value.splice(index, 1)
    } else {
        selectedTypes.value.push(typeId)
    }
    applyFilters()
}

const toggleColorFilter = (colorId) => {
    const index = selectedColors.value.indexOf(colorId)
    if (index > -1) {
        selectedColors.value.splice(index, 1)
    } else {
        selectedColors.value.push(colorId)
    }
    applyFilters()
}

const toggleSizeFilter = (sizeId) => {
    const index = selectedSizes.value.indexOf(sizeId)
    if (index > -1) {
        selectedSizes.value.splice(index, 1)
    } else {
        selectedSizes.value.push(sizeId)
    }
    applyFilters()
}

const toggleSexFilter = (value) => {
    const index = selectedSexes.value.indexOf(value)
    if (index > -1) {
        selectedSexes.value.splice(index, 1)
    } else {
        selectedSexes.value.push(value)
    }
    applyFilters()
}

const clearAllFilters = () => {
    selectedBrands.value = []
    selectedTypes.value = []
    selectedColors.value = []
    selectedSizes.value = []
    selectedSexes.value = []
    searchKeyword.value = ''
    applyFilters()
}

const applyFilters = () => {
    let filtered = [...products.value]

    // 先应用搜索
    filtered = searchProducts(filtered)

    // 品牌筛选
    if (selectedBrands.value.length > 0) {
        filtered = filtered.filter(product => 
            selectedBrands.value.includes(product.brand?.brandId)
        )
    }

    // 版型筛选
    if (selectedTypes.value.length > 0) {
        filtered = filtered.filter(product => 
            selectedTypes.value.includes(product.shoesType?.typeId)
        )
    }

    // 性别筛选
    if (selectedSexes.value.length > 0) {
        filtered = filtered.filter(product => 
            selectedSexes.value.includes(product.shoeSex)
        )
    }

    // 颜色筛选
    if (selectedColors.value.length > 0) {
        filtered = filtered.filter(product => 
            selectedColors.value.includes(product.color?.colorId)
        )
    }

    // 尺码筛选 - 修复：只要该产品有该尺码记录就显示
    if (selectedSizes.value.length > 0) {
        filtered = filtered.filter(product => {
            const productInventory = product.inventoryData || []
            // 只要该产品有选中尺码的库存记录就显示，不管库存数量
            return productInventory.some(inv => 
                selectedSizes.value.includes(inv.sizeId)
            )
        })
    }

    filteredProducts.value = filtered
    totalCount.value = filtered.length
    currentPage.value = 1 // 重置到第一页
}

// 图片轮播功能
const cycleProductImage = async (product) => {
    if (product.images && product.images.length > 1) {
        const currentIndex = product.currentImageIndex || 0
        const nextIndex = (currentIndex + 1) % product.images.length
        product.currentImageIndex = nextIndex
        await nextTick()
    }
}

// 图片画廊功能
const showImageGallery = (product) => {
    if (product.images && product.images.length > 0) {
        galleryProduct.value = product
        galleryCurrentIndex.value = product.currentImageIndex || 0
        showImageGalleryModal.value = true
    }
}

const closeImageGallery = () => {
    showImageGalleryModal.value = false
    galleryProduct.value = null
    galleryCurrentIndex.value = 0
}

const previousGalleryImage = () => {
    if (galleryProduct.value && galleryProduct.value.images.length > 1) {
        galleryCurrentIndex.value = (galleryCurrentIndex.value - 1 + galleryProduct.value.images.length) % galleryProduct.value.images.length
    }
}

const nextGalleryImage = () => {
    if (galleryProduct.value && galleryProduct.value.images.length > 1) {
        galleryCurrentIndex.value = (galleryCurrentIndex.value + 1) % galleryProduct.value.images.length
    }
}

// 产品操作
const viewProductDetails = (product) => {
    // 跳转到产品详情页面
    router.push(`/product/${product.shoeId}`)
}

const addToCart = async (product) => {
    // 跳转到商品详情页面，让用户在详情页面选择尺码后再加入购物车
    router.push(`/product/${product.shoeId}`)
}

// 分页功能
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
        currentPage.value = page
    }
}

const handlePageSizeChange = () => {
    currentPage.value = 1
}

// 生命周期钩子
onMounted(async () => {
    try {
        // 先获取筛选选项，再获取产品数据
        console.log('开始获取筛选选项...')
        await fetchOptions()
        console.log('筛选选项获取完成，开始获取产品数据...')
        await fetchProducts()
        console.log('产品数据获取完成')
        initIntersectionObserver()
        observeCurrentPage()
        
        // 从路由参数获取初始筛选值
        const route = useRoute()
        if (route.query.shoeSex) {
            const shoeSex = parseInt(route.query.shoeSex)
            if (!isNaN(shoeSex) && shoeSex >= 1 && shoeSex <= 4) {
                selectedSexes.value = [shoeSex]
                applyFilters()
            }
        }
    } catch (error) {
        console.error('初始化失败:', error)
        error.value = '初始化失败，请刷新页面重试'
    }
})

// 在分页或筛选变更后重新观察
watch([paginatedProducts, currentPage, pageSize], async () => {
    await nextTick()
    observeCurrentPage()
})

onBeforeUnmount(() => {
    if (productCardIo) {
        productCardIo.disconnect()
        productCardIo = null
    }
})
</script>

<style scoped>
.product-display-container {
    max-width: 1600px;
    width: 98%;
    margin: 20px auto;
    padding: 24px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    font-family: 'Playfair Display', 'Georgia', serif;
    /* 确保容器可以滚动 */
    overflow-y: auto;
    max-height: calc(100vh - 40px);
}

.product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid rgb(211, 169, 101);
}

.title {
    font-size: 2rem;
    font-weight: 600;
    color: rgb(211, 169, 101);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
}

.icon {
    font-size: 2.2rem;
}

.product-count {
    font-size: 1.1rem;
    color: #666;
    font-weight: 500;
    background: rgba(211, 169, 101, 0.1);
    padding: 8px 16px;
    border-radius: 20px;
}

/* 搜索区域样式 */
.search-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.search-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.search-input-group {
    display: flex;
    gap: 12px;
    align-items: center;
}

.search-input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.3s ease;
    font-family: 'Lora', 'Georgia', serif;
}

.search-input:focus {
    outline: none;
    border-color: rgb(211, 169, 101);
    box-shadow: 0 0 0 3px rgba(211, 169, 101, 0.1);
}

.search-btn {
    padding: 12px 20px;
    background: linear-gradient(135deg, rgb(211, 169, 101), #d4af37);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.1rem;
    font-weight: 600;
}

.search-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(211, 169, 101, 0.3);
}

.search-options {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
}

.search-option {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
}

.search-option input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: rgb(211, 169, 101);
    cursor: pointer;
}

/* 筛选区域样式 */
.filter-section {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.filter-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: rgb(211, 169, 101);
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
}

.filter-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.filter-group {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.filter-label {
    min-width: 60px;
    font-weight: 600;
    color: #333;
    padding-top: 8px;
}

.filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    flex: 1;
    /* 添加滚动功能 */
    max-height: 120px;
    overflow-y: auto;
    padding-right: 8px;
}

/* 自定义滚动条样式 */
.filter-options::-webkit-scrollbar {
    width: 6px;
}

.filter-options::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.filter-options::-webkit-scrollbar-thumb {
    background: rgb(211, 169, 101);
    border-radius: 3px;
}

.filter-options::-webkit-scrollbar-thumb:hover {
    background: #d4af37;
}

.filter-option {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 20px;
    background: white;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
    white-space: nowrap;
}

.filter-option:hover {
    border-color: rgb(211, 169, 101);
    color: rgb(211, 169, 101);
    transform: translateY(-1px);
}

.filter-option.active {
    background: rgb(211, 169, 101);
    color: white;
    border-color: rgb(211, 169, 101);
}

.filter-actions {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
}

.clear-filters-btn {
    border: none;
    padding: 10px 20px;
    border-radius: 25px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #6c757d, #5a6268);
    color: white;
}

.clear-filters-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-icon {
    font-size: 1rem;
}

/* 产品列表样式 */
.products-section {
    margin-bottom: 24px;
}

.loading, .error, .no-products {
    text-align: center;
    padding: 40px;
    font-size: 1.1rem;
    font-weight: 500;
}

.loading {
    color: rgb(211, 169, 101);
}

.error {
    color: #dc3545;
    background: rgba(220, 53, 69, 0.1);
    border-radius: 8px;
}

.no-products {
    color: #666;
}

.no-products-icon {
    font-size: 3rem;
    margin-bottom: 16px;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
}

.product-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.product-image-container {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.product-images {
    width: 100%;
    height: 100%;
    position: relative;
}

.image-carousel {
    position: relative;
    width: 100%;
    height: 100%;
}

.main-product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
    transition: all 0.3s ease;
}

.main-product-image:hover {
    transform: scale(1.05);
}

.image-selector {
    position: absolute;
    bottom: 8px;
    right: 8px;
}

.image-switch-btn {
    background: rgba(211, 169, 101, 0.9);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
}

.image-switch-btn:hover {
    background: rgb(211, 169, 101);
    transform: scale(1.05);
}

.no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border: 2px solid #ddd;
    font-size: 2rem;
    color: #999;
}

.product-info {
    padding: 16px;
}

.product-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-serial {
    color: #666;
    font-size: 0.8rem;
    margin: 0 0 12px 0;
}

.product-details {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
}

.brand-tag, .type-tag, .color-tag, .sex-tag {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 500;
    background: rgba(211, 169, 101, 0.1);
    color: rgb(211, 169, 101);
}

/* 性别标签特殊样式 */
.sex-tag {
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
}

.price-section {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.original-price {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
}

.discount-price {
    font-size: 1rem;
    font-weight: 600;
    color: #e74c3c;
}

.product-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 0.8rem;
    color: #666;
}

/* 可用尺码样式 */
.available-sizes {
    margin-bottom: 16px;
}

.sizes-label {
    display: block;
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 8px;
    font-weight: 500;
}

.size-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.size-tag {
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 500;
    background: rgba(40, 167, 69, 0.1);
    color: #28a745;
    border: 1px solid rgba(40, 167, 69, 0.2);
}

/* 新增：无库存尺码的样式 */
.size-tag.no-stock {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    border-color: rgba(220, 53, 69, 0.2);
}

/* 新增：无尺码信息的提示样式 */
.no-sizes-info {
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 500;
    background: rgba(108, 117, 125, 0.1);
    color: #6c757d;
    border: 1px solid rgba(108, 117, 125, 0.2);
    font-style: italic;
}

.product-actions {
    display: flex;
    gap: 8px;
}

.view-details-btn, .add-to-cart-btn {
    flex: 1;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.view-details-btn {
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
}

.add-to-cart-btn {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
}

.view-details-btn:hover, .add-to-cart-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 分页样式 */
.pagination-container {
    margin-top: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 20px;
    background: rgba(243, 242, 234, 0.3);
    border-radius: 12px;
    font-family: 'Lora', 'Georgia', serif;
}

.pagination-info {
    display: flex;
    align-items: center;
    gap: 20px;
    color: #666;
    font-weight: 500;
}

.page-size-control {
    display: flex;
    align-items: center;
    gap: 8px;
}

.page-size-input {
    width: 60px;
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    text-align: center;
    transition: border-color 0.3s ease;
}

.page-size-input:focus {
    outline: none;
    border-color: rgb(211, 169, 101);
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.page-btn {
    background: white;
    color: rgb(211, 169, 101);
    border: 1px solid rgb(211, 169, 101);
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
    font-family: 'Lora', serif;
}

.page-btn:hover:not(:disabled) {
    background: rgb(211, 169, 101);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.page-btn:disabled {
    background: #f5f5f5;
    color: #ccc;
    border-color: #ddd;
    cursor: not-allowed;
    transform: none;
}

.page-numbers {
    display: flex;
    gap: 4px;
}

.page-number-btn {
    background: white;
    color: rgb(211, 169, 101);
    border: 1px solid rgb(211, 169, 101);
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
    min-width: 40px;
    font-family: 'Lora', serif;
}

.page-number-btn:hover {
    background: rgba(211, 169, 101, 0.1);
    transform: translateY(-1px);
}

.page-number-btn.active {
    background: rgb(211, 169, 101);
    color: white;
    font-weight: 600;
}

/* 图片画廊模态框样式 */
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.dialog {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.image-gallery-dialog {
    max-width: 800px;
    max-height: 90vh;
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #eee;
    background: linear-gradient(135deg, rgb(211, 169, 101), #d4af37);
    color: white;
    border-radius: 12px 12px 0 0;
}

.dialog-header h3 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background 0.2s ease;
}

.close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
}

.dialog-content {
    padding: 24px;
}

.gallery-main-image {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;
    min-height: 400px;
}

.main-gallery-image {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
    border-radius: 8px;
}

.gallery-controls {
    position: absolute;
    top: 50%;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transform: translateY(-50%);
    pointer-events: none;
}

.gallery-nav-btn {
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    pointer-events: all;
    display: flex;
    align-items: center;
    justify-content: center;
}

.gallery-nav-btn:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
}

.gallery-nav-btn.prev {
    margin-left: 10px;
}

.gallery-nav-btn.next {
    margin-right: 10px;
}

.gallery-thumbnails {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
}

.gallery-thumbnail {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
    border: 2px solid #ddd;
    cursor: pointer;
    transition: all 0.3s ease;
}

.gallery-thumbnail:hover {
    border-color: rgb(211, 169, 101);
}

.gallery-thumbnail.active {
    border-color: rgb(211, 169, 101);
    border-width: 3px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
}


@media (max-width: 768px) {
    .product-display-container {
        width: 99%;
        padding: 16px;
        max-height: calc(100vh - 20px);
    }

    .product-header {
        flex-direction: column;
        gap: 12px;
        text-align: center;
    }

    .title {
        font-size: 1.5rem;
    }

    .search-input-group {
        flex-direction: column;
    }

    .search-options {
        justify-content: center;
    }

    .filter-group {
        flex-direction: column;
        align-items: flex-start;
    }

    .filter-label {
        min-width: auto;
        padding-top: 0;
    }

    .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
    }

    .pagination-container {
        flex-direction: column;
        gap: 12px;
    }

    .pagination-info {
        flex-direction: column;
        gap: 8px;
    }
}

@media (max-width: 480px) {
    .product-display-container {
        margin: 10px;
        padding: 12px;
        max-height: calc(100vh - 20px);
    }

    .title {
        font-size: 1.3rem;
    }

    .products-grid {
        grid-template-columns: 1fr;
    }

    .product-actions {
        flex-direction: column;
    }
}
</style>