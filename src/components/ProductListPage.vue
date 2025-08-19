<template>
    <div class="product-display-container">
        <!-- 顶部导航栏 -->
        <header class="main-nav">
            <div class="nav-inner">
                <div class="brand" @click="goHome" aria-label="ShoesMall Home">
                    <div class="brand-logo" role="img" aria-label="Shoes Logo">
                        <svg viewBox="0 0 140 44" width="112" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <path
                                    d="M10 30c8 0 16-2.5 24-8 3.5-2.6 5.5-6.5 8.5-6.5 4 0 9.5 7.5 18 10 7 2 12 2.5 17 6.5 2.8 2.2 4.8 5 4.8 7.2 0 2.2-2.4 3.8-6.8 3.8H26c-9.5 0-14-1-16.8-2.6-2.4-1.4-3.4-3-3.4-5.2 0-2.7 2.7-4.9 5-5.2z"
                                    stroke="#111" stroke-width="3" />
                                <path
                                    d="M10 30c8 0 16-2.5 24-8 3.5-2.6 5.5-6.5 8.5-6.5 4 0 9.5 7.5 18 10 7 2 12 2.5 17 6.5 2.8 2.2 4.8 5 4.8 7.2 0 2.2-2.4 3.8-6.8 3.8H26c-9.5 0-14-1-16.8-2.6-2.4-1.4-3.4-3-3.4-5.2 0-2.7 2.7-4.9 5-5.2z"
                                    stroke="#0a0a0a" stroke-width="1.5" />
                                <path d="M61 16c2.8 1.6 6.5 3.9 9 5.5" stroke="#111" stroke-width="3" />
                                <path d="M61 16c2.8 1.6 6.5 3.9 9 5.5" stroke="#0a0a0a" stroke-width="1.5" />
                                <path d="M49 22h10M43 26h11M36 30h11" stroke="#111" stroke-width="3" />
                                <path d="M49 22h10M43 26h11M36 30h11" stroke="#0a0a0a" stroke-width="1.6" />
                                <path d="M24 40.5h84" stroke="#111" stroke-width="2" />
                                <path d="M24 40.5h84" stroke="#0a0a0a" stroke-width="1" />
                            </g>
                        </svg>
                    </div>
                </div>
                <nav class="primary-nav">
                    <ul class="nav-list">
                        <li class="nav-item">
                            <span class="nav-link" @click="goHome">首页</span>
                        </li>
                        <li class="nav-item">
                            <span class="nav-link" @click="filterBySex(1)">男鞋</span>
                        </li>
                        <li class="nav-item">
                            <span class="nav-link" @click="filterBySex(2)">女鞋</span>
                        </li>
                        <li class="nav-item">
                            <span class="nav-link" @click="filterBySex(3)">童鞋</span>
                        </li>
                    </ul>
                </nav>
                <div class="nav-search">
                    <div class="search-container" :class="{ 'search-focused': isSearchFocused }">
                        <div class="search-input-wrapper">
                            <svg class="search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none"
                                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                aria-hidden="true">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <input 
                                type="text" 
                                v-model="searchKeyword" 
                                @input="handleSearchInput"
                                @keydown="handleSearchKeydown"
                                placeholder="搜索商品、品牌或类型..."
                                class="search-input-field"
                                @focus="handleSearchFocus"
                                @blur="handleSearchBlur"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <button 
                                v-if="searchKeyword.trim()" 
                                @click.stop="clearSearch" 
                                class="clear-search-button"
                                type="button"
                                aria-label="清除搜索"
                                title="清除搜索"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div v-if="isSearchFocused && searchKeyword.trim()" class="search-suggestions">
                            <div class="suggestion-item" @click="submitSearch">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                                <span>搜索 "{{ searchKeyword }}"</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <button class="icon-btn" @click="goCart" aria-label="购物车">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                    </button>
                    <button class="icon-btn" @click="goProfile" aria-label="个人中心">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <circle cx="12" cy="8" r="3" />
                            <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>

        <!-- 面包屑导航 -->
        <div class="breadcrumb-section">
            <div class="breadcrumb-inner">
                <span class="breadcrumb-item" @click="goHome">首页</span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item">{{ currentCategory }}</span>
                <span v-if="currentSubCategory" class="breadcrumb-separator">/</span>
                <span v-if="currentSubCategory" class="breadcrumb-item">{{ currentSubCategory }}</span>
            </div>
        </div>

        <!-- 页面标题 -->
        <div class="page-title-section">
            <h1 class="page-title">{{ currentCategory }}{{ currentSubCategory ? ' - ' + currentSubCategory : '' }}</h1>
            <div class="product-count">
                总计: {{ totalCount }} 种商品
                <span v-if="searchKeyword.trim()" class="search-status">
                    (搜索: "{{ searchKeyword }}")
                </span>
            </div>
        </div>

        <!-- 筛选和排序区域 -->
        <div class="filter-sort-section">
            <div class="filter-sort-inner">
                <!-- 筛选下拉菜单 -->
                <div class="filter-dropdowns">
                    <div class="filter-dropdown" @click.stop="toggleDropdown('gender')" v-if="!isSexFiltered">
                        <span class="dropdown-label">性别</span>
                        <span class="dropdown-arrow">▼</span>
                        <div v-if="activeDropdown === 'gender'" class="dropdown-menu" @click.stop>
                            <div class="dropdown-item" @click="toggleSexFilter(1)">男鞋</div>
                            <div class="dropdown-item" @click="toggleSexFilter(2)">女鞋</div>
                            <div class="dropdown-item" @click="toggleSexFilter(3)">童鞋</div>
                        </div>
                    </div>
                    
                    <div class="filter-dropdown" @click.stop="toggleDropdown('category')">
                        <span class="dropdown-label">产品分类</span>
                        <span class="dropdown-arrow">▼</span>
                        <div v-if="activeDropdown === 'category'" class="dropdown-menu" @click.stop>
                            <div 
                                v-for="type in types" 
                                :key="type.typeId"
                                class="dropdown-item"
                                @click="toggleTypeFilter(type.typeId)"
                            >
                                {{ type.typeName }}
                            </div>
                        </div>
                    </div>
                    
                    <div class="filter-dropdown" @click.stop="toggleDropdown('brand')">
                        <span class="dropdown-label">品牌</span>
                        <span class="dropdown-arrow">▼</span>
                        <div v-if="activeDropdown === 'brand'" class="dropdown-menu" @click.stop>
                            <div 
                                v-for="brand in brands" 
                                :key="brand.brandId"
                                class="dropdown-item"
                                @click="toggleBrandFilter(brand.brandId)"
                            >
                                {{ brand.brandName }}
                            </div>
                        </div>
                    </div>
                    
                    <div class="filter-dropdown" @click.stop="toggleDropdown('color')">
                        <span class="dropdown-label">颜色</span>
                        <span class="dropdown-arrow">▼</span>
                        <div v-if="activeDropdown === 'color'" class="dropdown-menu" @click.stop>
                            <div 
                                v-for="color in colors" 
                                :key="color.colorId"
                                class="dropdown-item"
                                @click="toggleColorFilter(color.colorId)"
                            >
                                {{ color.colorName }}
                            </div>
                        </div>
                    </div>
                    
                    <div class="filter-dropdown" @click.stop="toggleDropdown('size')">
                        <span class="dropdown-label">尺码</span>
                        <span class="dropdown-arrow">▼</span>
                        <div v-if="activeDropdown === 'size'" class="dropdown-menu" @click.stop>
                            <div 
                                v-for="size in sizes" 
                                :key="size.sizeId"
                                class="dropdown-item"
                                @click="toggleSizeFilter(size.sizeId)"
                            >
                                {{ size.size }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 排序选项 -->
                <div class="sort-options">
                    <div class="sort-button" @click="togglePriceSort">
                        <span>价格</span>
                        <span class="price-arrow">{{ priceSortDirection === 'asc' ? '↑' : '↓' }}</span>
                    </div>
                    
                    <div class="sort-button" @click="setSort('new')">
                        <span>新品</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 筛选选项显示 -->
        <div v-if="hasActiveFilters" class="active-filters-section">
            <div class="active-filters-inner">
                <span class="filters-label">已选筛选：</span>
                <div class="filter-tags">
                    <!-- 性别筛选标签 -->
                    <div v-for="sex in selectedSexes" :key="`sex-${sex}`" class="filter-tag">
                        <span>{{ getSexText(sex) }}</span>
                        <button @click="removeSexFilter(sex)" class="tag-close">×</button>
                    </div>
                    
                    <!-- 品牌筛选标签 -->
                    <div v-for="brandId in selectedBrands" :key="`brand-${brandId}`" class="filter-tag">
                        <span>{{ getBrandName(brandId) }}</span>
                        <button @click="removeBrandFilter(brandId)" class="tag-close">×</button>
                    </div>
                    
                    <!-- 类型筛选标签 -->
                    <div v-for="typeId in selectedTypes" :key="`type-${typeId}`" class="filter-tag">
                        <span>{{ getTypeName(typeId) }}</span>
                        <button @click="removeTypeFilter(typeId)" class="tag-close">×</button>
                    </div>
                    
                    <!-- 颜色筛选标签 -->
                    <div v-for="colorId in selectedColors" :key="`color-${colorId}`" class="filter-tag">
                        <span>{{ getColorName(colorId) }}</span>
                        <button @click="removeColorFilter(colorId)" class="tag-close">×</button>
                    </div>
                    
                    <!-- 尺码筛选标签 -->
                    <div v-for="sizeId in selectedSizes" :key="`size-${sizeId}`" class="filter-tag">
                        <span>{{ getSizeName(sizeId) }}</span>
                        <button @click="removeSizeFilter(sizeId)" class="tag-close">×</button>
                    </div>
                </div>
                <button @click="clearAllFilters" class="clear-filters-btn">清除全部</button>
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
                    @click="viewProductDetails(product)"
                    :style="getProductCardStyle(product)"
                >
                    <div class="badge" v-if="product.discountPrice && product.discountPrice < product.price">限时直降</div>
                    <div class="card-media">
                        <div v-if="!getProductImage(product)" class="no-image">📷</div>
                    </div>
                    <div class="card-body">
                        <div class="price-row">
                            <span class="current">¥{{ product.discountPrice || product.price }}</span>
                            <span v-if="product.discountPrice && product.discountPrice < product.price" class="original">¥{{ product.price }}</span>
                        </div>
                        <div class="name" :title="product.name">{{ product.name }}</div>
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
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, reactive, nextTick, watch } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { imageCache, imagePreloader, imageUtils } from '@/utils/imageOptimizer'

const router = useRouter()
const route = useRoute()

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

// 搜索功能
const searchKeyword = ref('')
const isSearchFocused = ref(false)

// 分页数据
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)

// 下拉菜单状态
const activeDropdown = ref(null)

// 排序状态
const currentSort = ref('default')
const priceSortDirection = ref('desc')

// 当前分类信息
const currentCategory = ref('产品展示')
const currentSubCategory = ref('')

// 资源缓存与并发控制
const inventoryCache = new Map()
const inFlightImages = new Set()
const inFlightInventories = new Set()
let productCardIo = null

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

// 新增：筛选相关计算属性
const hasActiveFilters = computed(() => {
    return selectedBrands.value.length > 0 || 
           selectedTypes.value.length > 0 || 
           selectedColors.value.length > 0 || 
           selectedSizes.value.length > 0 || 
           selectedSexes.value.length > 0
})

const isSexFiltered = computed(() => {
    return selectedSexes.value.length > 0
})

// 获取产品数据
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
                item.images = Array.isArray(item.images) ? item.images : []
                item.currentImageIndex = 0
                item.inventoryData = Array.isArray(item.inventoryData) ? item.inventoryData : []
                return item
            })

            products.value = productList
            applyFilters()

            await nextTick()
            observeCurrentPage()
            
            // 使用 imagePreloader 预加载首页可见商品的图片
            const visibleProductIds = products.value.slice(0, 6).map(p => p.shoeId)
            if (visibleProductIds.length > 0) {
                // 预加载首页可见商品的图片
                imagePreloader.preloadImages(
                    visibleProductIds.map(id => `/api/shoeImg/list/${id}`),
                    'high'
                )
            }
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

<<<<<<< HEAD
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
                        
                        // 使用 imageUtils 预加载下一张图片
                        if (imgs.length > 1) {
                            const nextImagePath = `/api/shoeImg/getImage/${imgs[1].imagePath}`
                            imageUtils.preloadImages([nextImagePath])
                        }
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

=======
>>>>>>> 158d0305161c2d80786bd744a2ca4edadc2b590e
// 获取筛选选项数据
const fetchOptions = async () => {
    try {
        console.log('开始获取筛选选项数据...')
        
        const [brandResponse, typeResponse, colorResponse, sizeResponse] = await Promise.all([
            axios.post('/api/brand/getAll', {}, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }),
            axios.post('/api/shoesType/getAll', {}, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }),
            axios.post('/api/color/getAll', {}, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }),
            axios.post('/api/shoesSize/getAll', {}, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
        ])

        console.log('品牌响应:', brandResponse.data)
        console.log('类型响应:', typeResponse.data)
        console.log('颜色响应:', colorResponse.data)
        console.log('尺码响应:', sizeResponse.data)

        if (brandResponse.data && brandResponse.data.data) {
            brands.value = brandResponse.data.data.filter(brand => !brand.brandDisabled)
            console.log('加载品牌数据:', brands.value.length, '个')
        }

        if (typeResponse.data && typeResponse.data.data) {
            types.value = typeResponse.data.data.filter(type => !type.typeDisabled)
            console.log('加载类型数据:', types.value.length, '个')
        }

        if (colorResponse.data && colorResponse.data.data) {
            colors.value = colorResponse.data.data.filter(color => !color.colorDisabled)
            console.log('加载颜色数据:', colors.value.length, '个')
        }

        if (sizeResponse.data && sizeResponse.data.data) {
            sizes.value = sizeResponse.data.data.filter(size => !size.sizeDisabled)
            console.log('加载尺码数据:', sizes.value.length, '个')
        }
    } catch (error) {
        console.error('获取筛选选项失败:', error)
        // 设置默认值，避免页面崩溃
        brands.value = []
        types.value = []
        colors.value = []
        sizes.value = []
    }
}

// 搜索功能
const handleSearch = () => {
    // 实时搜索，不需要防抖
    applyFilters()
}

const handleSearchKeydown = (event) => {
    if (event.key === 'Enter') {
        event.preventDefault()
        submitSearch()
    }
}

const submitSearch = () => {
    if (!searchKeyword.value.trim()) return
    
    // 跳转到产品列表页面，传递搜索关键字
    router.push({ 
        name: 'ProductListPage', 
        query: { q: searchKeyword.value.trim() } 
    })
    
    isSearchFocused.value = false
}

// 新增：防抖搜索函数
let searchDebounceTimer = null
const debouncedSearch = () => {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
    }
    searchDebounceTimer = setTimeout(() => {
        // 无论是否有搜索关键字，都应用筛选
        applyFilters()
    }, 300) // 300ms 防抖延迟
}

// 新增：处理搜索输入
const handleSearchInput = () => {
    debouncedSearch()
}

// 新增：处理搜索焦点
const handleSearchFocus = () => {
    isSearchFocused.value = true
}

// 新增：处理搜索失焦
const handleSearchBlur = () => {
    // 延迟失焦，让清除按钮能够被点击
    setTimeout(() => {
        isSearchFocused.value = false
    }, 200)
}

const searchProducts = (products) => {
    if (!searchKeyword.value.trim()) {
        console.log('搜索关键词为空，返回所有产品')
        return products
    }

    const keyword = searchKeyword.value.toLowerCase().trim()
    console.log('开始搜索，关键词:', keyword)
    
    const filtered = products.filter(product => {
        // 搜索商品名称
        if (product.name && product.name.toLowerCase().includes(keyword)) {
            return true
        }
        // 搜索品牌名称
        if (product.brand?.brandName && product.brand.brandName.toLowerCase().includes(keyword)) {
            return true
        }
        // 搜索商品类型
        if (product.shoesType?.typeName && product.shoesType.typeName.toLowerCase().includes(keyword)) {
            return true
        }
        // 搜索颜色
        if (product.color?.colorName && product.color.colorName.toLowerCase().includes(keyword)) {
            return true
        }
        // 搜索产品编号
        if (product.serialNumber && product.serialNumber.toLowerCase().includes(keyword)) {
            return true
        }
        // 搜索描述
        if (product.description && product.description.toLowerCase().includes(keyword)) {
            return true
        }
        return false
    })
    
    console.log('搜索完成，匹配产品数量:', filtered.length)
    return filtered
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

// 根据性别筛选
const filterBySex = (sexValue) => {
    selectedSexes.value = [sexValue]
    currentCategory.value = sexValue === 1 ? '男鞋' : sexValue === 2 ? '女鞋' : '童鞋'
    currentSubCategory.value = ''
    applyFilters()
}

// 应用筛选和排序
const applyFilters = () => {
    let filtered = [...products.value]
    
    console.log('开始应用筛选，当前搜索关键词:', searchKeyword.value)
    console.log('筛选前产品数量:', filtered.length)
    
    // 应用搜索
    filtered = searchProducts(filtered)
    console.log('搜索后产品数量:', filtered.length)
    
    // 品牌筛选
    if (selectedBrands.value.length > 0) {
        filtered = filtered.filter(product => 
            selectedBrands.value.includes(product.brand?.brandId)
        )
        console.log('品牌筛选后产品数量:', filtered.length)
    }
    
    // 版型筛选
    if (selectedTypes.value.length > 0) {
        filtered = filtered.filter(product => 
            selectedTypes.value.includes(product.shoesType?.typeId)
        )
        console.log('类型筛选后产品数量:', filtered.length)
    }
    
    // 性别筛选
    if (selectedSexes.value.length > 0) {
        filtered = filtered.filter(product => 
            selectedSexes.value.includes(product.shoeSex)
        )
        console.log('性别筛选后产品数量:', filtered.length)
    }
    
    // 颜色筛选
    if (selectedColors.value.length > 0) {
        filtered = filtered.filter(product => 
            selectedColors.value.includes(product.color?.colorId)
        )
        console.log('颜色筛选后产品数量:', filtered.length)
    }
    
    // 尺码筛选
    if (selectedSizes.value.length > 0) {
        filtered = filtered.filter(product => {
            const productInventory = product.inventoryData || []
            return productInventory.some(inv => 
                selectedSizes.value.includes(inv.sizeId)
            )
        })
        console.log('尺码筛选后产品数量:', filtered.length)
    }
    
    // 应用排序
    filtered = applySorting(filtered)
    
    filteredProducts.value = filtered
    totalCount.value = filtered.length
<<<<<<< HEAD
    currentPage.value = 1 // 重置到第一页
    
    // 使用 imageUtils 预加载筛选后第一页商品的图片
    if (filtered.length > 0) {
        const firstPageProducts = filtered.slice(0, pageSize.value)
        firstPageProducts.forEach(product => {
            if (product.images && product.images.length > 0) {
                const imageUrl = `/api/shoeImg/getImage/${product.images[0].imagePath}`
                imageUtils.preloadImages([imageUrl])
            }
        })
    }
}

// 图片轮播功能
const cycleProductImage = async (product) => {
    if (product.images && product.images.length > 1) {
        const currentIndex = product.currentImageIndex || 0
        const nextIndex = (currentIndex + 1) % product.images.length
        product.currentImageIndex = nextIndex
        
        // 预加载下一张图片
        const nextNextIndex = (nextIndex + 1) % product.images.length
        const nextNextImage = product.images[nextNextIndex]
        if (nextNextImage) {
            imagePreloader.preloadImage(`/api/shoeImg/getImage/${nextNextImage.imagePath}`, 'normal')
        }
        
        await nextTick()
=======
    currentPage.value = 1
    
    console.log('最终筛选结果:', filtered.length, '个产品')
}

// 排序功能
const applySorting = (products) => {
    const sorted = [...products]
    
    switch (currentSort.value) {
        case 'price-asc':
            return sorted.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price))
        case 'price-desc':
            return sorted.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price))
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name))
        case 'new':
            return sorted.sort((a, b) => b.shoeId - a.shoeId) // 假设ID越大越新
        default:
            return sorted
>>>>>>> 158d0305161c2d80786bd744a2ca4edadc2b590e
    }
}

const setSort = (sortType) => {
    currentSort.value = sortType
    if (sortType === 'price-asc' || sortType === 'price-desc') {
        priceSortDirection.value = sortType === 'price-asc' ? 'asc' : 'desc'
    }
    applyFilters()
    activeDropdown.value = null
}

const togglePriceSort = () => {
    priceSortDirection.value = priceSortDirection.value === 'asc' ? 'desc' : 'asc'
    currentSort.value = priceSortDirection.value === 'asc' ? 'price-asc' : 'price-desc'
    applyFilters()
}

// 下拉菜单控制
const toggleDropdown = (dropdownName) => {
    if (activeDropdown.value === dropdownName) {
        activeDropdown.value = null
    } else {
        activeDropdown.value = dropdownName
    }
}

// 点击外部关闭下拉菜单
const closeDropdowns = () => {
    activeDropdown.value = null
}

// 获取产品图片
const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
<<<<<<< HEAD
        galleryProduct.value = product
        galleryCurrentIndex.value = product.currentImageIndex || 0
        showImageGalleryModal.value = true
        
        // 使用 imagePreloader 预加载画廊中的所有图片
        if (product.images.length > 1) {
            const imageUrls = product.images.map(img => `/api/shoeImg/getImage/${img.imagePath}`)
            imagePreloader.preloadImages(imageUrls, 'high')
        }
=======
        const currentIndex = product.currentImageIndex || 0
        return `/api/shoeImg/getImage/${product.images[currentIndex].imagePath}`
>>>>>>> 158d0305161c2d80786bd744a2ca4edadc2b590e
    }
    return null
}

// 获取产品卡片样式
const getProductCardStyle = (product) => {
    const imageUrl = getProductImage(product)
    if (imageUrl) {
        return {
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: '80%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#eaeeef'
        }
    }
    return { backgroundColor: '#eaeeef' }
}

<<<<<<< HEAD
const previousGalleryImage = () => {
    if (galleryProduct.value && galleryProduct.value.images.length > 1) {
        galleryCurrentIndex.value = (galleryCurrentIndex.value - 1 + galleryProduct.value.images.length) % galleryProduct.value.images.length
        
        // 预加载上一张图片
        const prevIndex = (galleryCurrentIndex.value - 1 + galleryProduct.value.images.length) % galleryProduct.value.images.length
        const prevImage = galleryProduct.value.images[prevIndex]
        if (prevImage) {
            imagePreloader.preloadImage(`/api/shoeImg/getImage/${prevImage.imagePath}`, 'normal')
        }
    }
}

const nextGalleryImage = () => {
    if (galleryProduct.value && galleryProduct.value.images.length > 1) {
        galleryCurrentIndex.value = (galleryCurrentIndex.value + 1) % galleryProduct.value.images.length
        
        // 预加载下一张图片
        const nextIndex = (galleryCurrentIndex.value + 1) % galleryProduct.value.images.length
        const nextImage = galleryProduct.value.images[nextIndex]
        if (nextImage) {
            imagePreloader.preloadImage(`/api/shoeImg/getImage/${nextImage.imagePath}`, 'normal')
        }
    }
=======
// 导航功能
const goHome = () => {
    router.push('/')
}

const goCart = () => {
    router.push('/cart')
}

const goProfile = () => {
    router.push('/profile')
>>>>>>> 158d0305161c2d80786bd744a2ca4edadc2b590e
}

// 产品操作
const viewProductDetails = (product) => {
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

// 清除搜索
const clearSearch = () => {
    searchKeyword.value = ''
    applyFilters() // 应用筛选以更新产品列表
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

    // 加载图片
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

    // 加载库存
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

// 筛选选项显示相关
const getSexText = (value) => {
    if (value === 1) return '男鞋'
    if (value === 2) return '女鞋'
    if (value === 3) return '童鞋'
    return '其他'
}

const getBrandName = (brandId) => {
    const brand = brands.value.find(b => b.brandId === brandId)
    return brand ? brand.brandName : '未知品牌'
}

const getTypeName = (typeId) => {
    const type = types.value.find(t => t.typeId === typeId)
    return type ? type.typeName : '未知类型'
}

const getColorName = (colorId) => {
    const color = colors.value.find(c => c.colorId === colorId)
    return color ? color.colorName : '未知颜色'
}

const getSizeName = (sizeId) => {
    const size = sizes.value.find(s => s.sizeId === sizeId)
    return size ? size.size : '未知尺码'
}

// 移除筛选的方法
const removeSexFilter = (sex) => {
    const index = selectedSexes.value.indexOf(sex)
    if (index > -1) {
        selectedSexes.value.splice(index, 1)
        applyFilters()
    }
}

const removeBrandFilter = (brandId) => {
    const index = selectedBrands.value.indexOf(brandId)
    if (index > -1) {
        selectedBrands.value.splice(index, 1)
        applyFilters()
    }
}

const removeTypeFilter = (typeId) => {
    const index = selectedTypes.value.indexOf(typeId)
    if (index > -1) {
        selectedTypes.value.splice(index, 1)
        applyFilters()
    }
}

const removeColorFilter = (colorId) => {
    const index = selectedColors.value.indexOf(colorId)
    if (index > -1) {
        selectedColors.value.splice(index, 1)
        applyFilters()
    }
}

const removeSizeFilter = (sizeId) => {
    const index = selectedSizes.value.indexOf(sizeId)
    if (index > -1) {
        selectedSizes.value.splice(index, 1)
        applyFilters()
    }
}

const clearAllFilters = () => {
    selectedBrands.value = []
    selectedTypes.value = []
    selectedColors.value = []
    selectedSizes.value = []
    selectedSexes.value = []
    applyFilters()
}

// 生命周期钩子
onMounted(async () => {
    try {
        await fetchOptions()
        await fetchProducts()
        initIntersectionObserver()
        observeCurrentPage()
        
        // 从路由参数获取初始筛选值
        if (route.query && route.query.shoeSex) {
            const shoeSex = parseInt(route.query.shoeSex)
            if (!isNaN(shoeSex) && shoeSex >= 1 && shoeSex <= 4) {
                filterBySex(shoeSex)
            }
        }
        
        // 从路由参数获取搜索关键字
        if (route.query && route.query.q) {
            searchKeyword.value = route.query.q
            setTimeout(() => {
                handleSearch()
            }, 100)
        }

        // 添加点击外部关闭下拉菜单的事件监听
        document.addEventListener('click', closeDropdowns)
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
    document.removeEventListener('click', closeDropdowns)
    // 清理防抖定时器
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
        searchDebounceTimer = null
    }
})
</script>

<style scoped>
.product-display-container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 0;
    background: #fff;
    font-family: Helvetica Neue, Arial, sans-serif;
    color: #000;
}

/* 顶部导航栏样式 */
.main-nav {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: #fff;
    color: #000;
    border-bottom: 1px solid #eee;
}

.nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 80px;
    padding: 0 16px;
    background: #fff;
    box-sizing: border-box;
    width: 100%;
    position: relative;
}

.brand {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-left: -42px;
    flex-shrink: 0;
}

.brand-logo {
    padding: 2px 0;
    flex-shrink: 0;
}

.brand-logo svg {
    display: block;
    filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.08));
    max-width: 100%;
    height: auto;
}

.primary-nav {
    margin-left: 40px;
    flex-shrink: 0;
}

.primary-nav .nav-list {
    list-style: none;
    display: flex;
    gap: 24px;
    align-items: center;
    flex-wrap: nowrap;
}

.nav-item {
    position: relative;
    flex-shrink: 0;
}

.nav-link {
    font-family: Helvetica Neue, Arial, sans-serif;
    font-weight: 600;
    font-size: 16px;
    padding: 8px 4px;
    color: #000;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: border-color .15s ease;
    white-space: nowrap;
    transform: translateZ(0);
    will-change: border-color;
}

.nav-item:hover .nav-link {
    border-color: #c6ff00;
}

.nav-search {
    flex: 1;
    display: flex;
    justify-content: flex-end;
    padding: 0 24px 0 8px;
    position: relative;
    margin-right: 64px;
    min-width: 0;
}

.search-container {
    width: 36%;
    max-width: 380px;
    min-width: 220px;
    position: relative;
    margin-right: 16px;
    flex-shrink: 0;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 8px;
    transition: all 0.2s ease;
    overflow: hidden;
}

.search-container:hover .search-input-wrapper {
    border-color: #bbb;
    background: #f5f5f5;
}

.search-container.search-focused .search-input-wrapper {
    border-color: #000;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    z-index: 2;
    pointer-events: none;
    transition: color 0.2s ease;
}

.search-container.search-focused .search-icon {
    color: #000;
}

.search-input-field {
    width: 100%;
    height: 40px;
    padding: 0 40px 0 40px;
    border: none;
    background: transparent;
    color: #333;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s ease;
}

.search-input-field::placeholder {
    color: #999;
    transition: color 0.2s ease;
}

.search-container.search-focused .search-input-field::placeholder {
    color: #666;
}

.clear-search-button {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 3;
}

.clear-search-button:hover {
    background: #f0f0f0;
    color: #666;
}

.search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid #ddd;
    border-top: none;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    margin-top: -1px;
}

.suggestion-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s ease;
    color: #333;
    font-size: 14px;
}

.suggestion-item:hover {
    background: #f5f5f5;
}

.suggestion-item svg {
    color: #666;
    flex-shrink: 0;
}

.actions {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-right: -42px;
    flex-shrink: 0;
}

.icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: transparent;
    border: 1.5px solid #000;
    color: #000;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background .1s ease, transform .1s ease, color .1s ease, border-color .1s ease;
    flex-shrink: 0;
    transform: translateZ(0);
    will-change: background, transform, color, border-color;
}

.icon-btn:first-child {
    margin-left: -32px;
}

.icon-btn:hover {
    background: #000;
    color: #fff;
    border-color: #000;
    transform: translateY(-1px) translateZ(0);
}

/* 面包屑导航样式 */
.breadcrumb-section {
    background: #fff;
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
}

.breadcrumb-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #666;
}

.breadcrumb-item {
    cursor: pointer;
    transition: color 0.15s ease;
}

.breadcrumb-item:hover {
    color: #000;
}

.breadcrumb-separator {
    color: #ccc;
}

/* 页面标题样式 */
.page-title-section {
    background: #fff;
    padding: 20px 16px;
    border-bottom: 1px solid #eee;
}

.page-title {
    font-size: 24px;
    font-weight: 600;
    color: #000;
    margin: 0 0 8px 0;
}

.product-count {
    font-size: 14px;
    color: #666;
    font-weight: 500;
}

.search-status {
    font-size: 12px;
    color: #666;
    font-weight: 400;
    margin-left: 8px;
    font-style: italic;
}

/* 筛选和排序区域样式 */
.filter-sort-section {
    background: #fff;
    padding: 16px;
    border-bottom: 1px solid #eee;
}

.filter-sort-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.filter-dropdowns {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.filter-dropdown {
    position: relative;
    cursor: pointer;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 100px;
}

.filter-dropdown:hover {
    border-color: #000;
}

.dropdown-label {
    font-size: 14px;
    color: #333;
    font-weight: 500;
}

.dropdown-arrow {
    font-size: 12px;
    color: #666;
    transition: transform 0.15s ease;
}

.filter-dropdown:hover .dropdown-arrow {
    transform: rotate(180deg);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
    margin-top: 4px;
}

.dropdown-item {
    padding: 8px 12px;
    font-size: 14px;
    color: #333;
    cursor: pointer;
    transition: background 0.15s ease;
}

.dropdown-item:hover {
    background: #f5f5f5;
}

.sort-options {
    display: flex;
    gap: 12px;
    align-items: center;
}

.sort-dropdown {
    position: relative;
    cursor: pointer;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.sort-dropdown:hover {
    border-color: #000;
}

.sort-button {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #333;
}

.sort-button:hover {
    border-color: #000;
    background: #f5f5f5;
}

.price-arrow {
    font-size: 12px;
    color: #666;
}

/* 筛选选项显示样式 */
.active-filters-section {
    background: #fff;
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
}

.active-filters-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.filters-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
    white-space: nowrap;
}

.filter-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.filter-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
    color: #333;
    transition: all 0.15s ease;
}

.filter-tag:hover {
    background: #e8e8e8;
    border-color: #ccc;
}

.tag-close {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.15s ease;
}

.tag-close:hover {
    background: #ddd;
    color: #666;
}

.clear-filters-btn {
    background: none;
    border: 1px solid #ddd;
    color: #666;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
}

.clear-filters-btn:hover {
    background: #f5f5f5;
    border-color: #ccc;
    color: #333;
}

/* 产品列表样式 */
.products-section {
    margin-bottom: 20px;
    padding: 0 16px;
}

.loading, .error, .no-products {
    text-align: center;
    padding: 40px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
}

.loading {
    color: #000;
}

.error {
    color: #dc3545;
    background: rgba(220, 53, 69, 0.1);
    border-radius: 6px;
}

.no-products {
    color: #666;
}

.no-products-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    background: #fff;
    width: 100%;
    box-sizing: border-box;
}

.product-card {
    border: 1px solid #eee;
    border-radius: 0;
    overflow: hidden;
    background: #fff;
    transition: transform .15s ease, box-shadow .15s ease;
    box-sizing: border-box;
    width: 100%;
    cursor: pointer;
    position: relative;
}

.product-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(0,0,0,0.08);
}

.card-media {
    background: transparent;
    aspect-ratio: 1/1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #999;
}

.card-body {
    padding: 12px;
    box-sizing: border-box;
}

.price-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 6px;
}

.current {
    font-weight: 800;
    color: #111;
}

.original {
    color: #999;
    text-decoration: line-through;
}

.name {
    font-size: 14px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.badge {
    position: absolute;
    margin: 8px;
    padding: 4px 8px;
    background: #111;
    color: #fff;
    border-radius: 4px;
    font-size: 12px;
}

/* 分页样式 */
.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    padding: 20px 16px;
    background: #fff;
    border-top: 1px solid #eee;
    font-family: Helvetica Neue, Arial, sans-serif;
}

.pagination-info {
    display: flex;
    align-items: center;
    gap: 20px;
    color: #666;
    font-weight: 500;
    font-size: 13px;
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
    border-radius: 4px;
    font-size: 13px;
    text-align: center;
    transition: border-color 0.15s ease;
}

.page-size-input:focus {
    outline: none;
    border-color: #000;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.page-btn {
    background: #fff;
    color: #000;
    border: 1px solid #ddd;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 13px;
    font-weight: 500;
    font-family: Helvetica Neue, Arial, sans-serif;
}

.page-btn:hover:not(:disabled) {
    background: #000;
    color: #fff;
    border-color: #000;
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
    background: #fff;
    color: #000;
    border: 1px solid #ddd;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 13px;
    font-weight: 500;
    min-width: 40px;
    font-family: Helvetica Neue, Arial, sans-serif;
}

.page-number-btn:hover {
    background: #f5f5f5;
    border-color: #000;
}

.page-number-btn.active {
    background: #000;
    color: #fff;
    font-weight: 600;
    border-color: #000;
}

/* 搜索框响应式设计 */
@media (max-width: 768px) {
    .nav-search {
        margin-right: 16px;
        padding: 0 12px 0 8px;
    }
    
    .search-container {
        width: 100%;
        max-width: none;
        min-width: 200px;
    }
    
    .search-input-field {
        height: 36px;
        padding: 0 36px 0 36px;
        font-size: 13px;
    }
    
    .search-icon {
        left: 10px;
        width: 16px;
        height: 16px;
    }
    
    .clear-search-button {
        right: 6px;
        padding: 3px;
    }
    
    .clear-search-button svg {
        width: 14px;
        height: 14px;
    }
}

@media (max-width: 480px) {
    .nav-search {
        margin-right: 8px;
        padding: 0 8px 0 4px;
    }
    
    .search-container {
        min-width: 160px;
    }
    
    .search-input-field {
        height: 32px;
        padding: 0 32px 0 32px;
        font-size: 12px;
    }
    
    .search-icon {
        left: 8px;
        width: 14px;
        height: 14px;
    }
    
    .clear-search-button {
        right: 4px;
        padding: 2px;
    }
    
    .clear-search-button svg {
        width: 12px;
        height: 12px;
    }
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .product-display-container {
        max-width: 100%;
        padding: 0 16px;
    }
    
    .products-grid {
        gap: 6px;
    }
}

@media (max-width: 960px) {
    .product-display-container {
        padding: 0 12px;
    }
    
    .product-header,
    .search-section,
    .filter-section {
        padding: 16px 12px;
    }
    
    .products-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
    }
    
    .pagination-container {
        padding: 16px 12px;
    }
}

@media (max-width: 768px) {
    .product-display-container {
        padding: 0 8px;
    }
    
    .product-header {
        flex-direction: column;
        gap: 12px;
        text-align: center;
        padding: 12px 8px;
    }

    .title {
        font-size: 20px;
    }
    
    .icon {
        font-size: 24px;
    }

    .search-section,
    .filter-section {
        padding: 12px 8px;
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
        grid-template-columns: repeat(2, 1fr);
        gap: 4px;
    }

    .card-body {
        padding: 10px;
    }

    .pagination-container {
        flex-direction: column;
        gap: 12px;
        padding: 12px 8px;
    }

    .pagination-info {
        flex-direction: column;
        gap: 8px;
    }
}

@media (max-width: 480px) {
    .product-display-container {
        padding: 0 4px;
    }
    
    .product-header,
    .search-section,
    .filter-section {
        padding: 8px 4px;
    }

    .title {
        font-size: 18px;
    }
    
    .icon {
        font-size: 20px;
    }

    .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
    }
    
    .card-body {
        padding: 8px;
    }
    
    .pagination-container {
        padding: 8px 4px;
    }
}
</style>