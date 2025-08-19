<template>
    <div class="product-grid">
        <div class="product-item" v-for="product in products" :key="product.shoeId">
            <div class="product-image">
                <!-- 图片加载状态管理 -->
                <div v-if="product.imageLoading" class="image-loading">
                    <div class="loading-spinner"></div>
                    <span>加载中...</span>
                </div>
                
                <!-- 图片容器 -->
                <div 
                    v-else-if="product.images && product.images.length > 0" 
                    class="image-container"
                    :style="{ backgroundImage: `url(${product.imageUrl})` }"
                >
                    <!-- 图片切换按钮 -->
                    <div v-if="product.images.length > 1" class="image-switcher">
                        <button 
                            @click.stop="switchImage(product, -1)" 
                            class="switch-btn prev"
                            :disabled="product.currentImageIndex <= 0"
                        >
                            ‹
                        </button>
                        <span class="image-counter">{{ product.currentImageIndex + 1 }}/{{ product.images.length }}</span>
                        <button 
                            @click.stop="switchImage(product, 1)" 
                            class="switch-btn next"
                            :disabled="product.currentImageIndex >= product.images.length - 1"
                        >
                            ›
                        </button>
                    </div>
                </div>
                
                <!-- 无图片占位符 -->
                <div v-else class="no-image">📷</div>
            </div>
            
            <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <div class="product-meta">
                    <span class="brand">{{ product.brandName }}</span>
                    <span class="type">{{ product.typeName }}</span>
                </div>
                <div class="product-price">
                    <span class="current-price">¥{{ product.discountPrice || product.price }}</span>
                    <span v-if="product.discountPrice && product.discountPrice < product.price" class="original-price">¥{{ product.price }}</span>
                </div>
                <div class="product-actions">
                    <select v-model="selectedSizes[product.shoeId]" class="size-select">
                        <option value="">选择尺码</option>
                        <option v-for="size in product.availableSizes" :key="size.sizeId" :value="size.sizeId">
                            {{ size.size }}
                        </option>
                    </select>
                    <input 
                        v-model.number="quantities[product.shoeId]" 
                        type="number" 
                        min="1" 
                        max="99" 
                        class="quantity-input"
                        placeholder="数量"
                    />
                    <button 
                        @click="addToCart(product)" 
                        :disabled="!selectedSizes[product.shoeId] || !quantities[product.shoeId]"
                        class="add-to-cart-btn"
                    >
                        加入购物车
                    </button>
                </div>
            </div>
        </div>
        
        <!-- 全局加载状态 -->
        <div v-if="loading" class="global-loading">
            <div class="loading-spinner"></div>
            <span>正在加载商品...</span>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ShoeAPI, ShoesSizeAPI, InventoryAPI } from '@/api'
import cartManager from '@/utils/cart'
import { imageCache, imagePreloader, imageUtils } from '@/utils/imageOptimizer'

export default {
    name: 'ProductGrid',
    setup() {
        const products = ref([])
        const selectedSizes = reactive({})
        const quantities = reactive({})
        const loading = ref(false)
        
        // 图片加载状态管理
        const imageLoadPromises = new Map()
        
        // 图片懒加载观察器
        let imageObserver = null

        // 初始化图片懒加载观察器
        const initImageObserver = () => {
            if (imageObserver) {
                imageObserver.disconnect()
            }
            
            imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const productId = entry.target.dataset.productId
                        const product = products.value.find(p => p.shoeId == productId)
                        if (product && !product.images) {
                            loadProductImages(product)
                        }
                        imageObserver.unobserve(entry.target)
                    }
                })
            }, {
                rootMargin: '100px 0px', // 提前100px开始加载
                threshold: 0.1
            })
        }

        // 加载商品图片（带缓存和优化）
        const loadProductImages = async (product) => {
            if (product.images || product.imageLoading) return
            
            // 检查缓存
            if (imageCache.has(product.shoeId)) {
                product.images = imageCache.get(product.shoeId)
                product.currentImageIndex = 0
                product.imageUrl = `/api/shoeImg/getImage/${product.images[0].imagePath}`
                return
            }
            
            // 防止重复请求
            if (imageLoadPromises.has(product.shoeId)) {
                await imageLoadPromises.get(product.shoeId)
                return
            }
            
            product.imageLoading = true
            
            const loadPromise = (async () => {
                try {
                    // 使用优化的图片加载
                    const imageResponse = await fetch(`/api/shoeImg/list/${product.shoeId}`, {
                        signal: AbortSignal.timeout(10000) // 10秒超时
                    })
                    
                    if (!imageResponse.ok) throw new Error('图片加载失败')
                    
                    const imageData = await imageResponse.json()
                    
                    if (imageData?.data && imageData.data.length > 0) {
                        product.images = imageData.data
                        product.currentImageIndex = 0
                        product.imageUrl = `/api/shoeImg/getImage/${product.images[0].imagePath}`
                        
                        // 缓存图片数据
                        imageCache.set(product.shoeId, product.images)
                        
                        // 预加载下一张图片
                        if (product.images.length > 1) {
                            imagePreloader.preloadImage(`/api/shoeImg/getImage/${product.images[1].imagePath}`)
                        }
                    } else {
                        product.images = []
                    }
                } catch (error) {
                    console.error(`加载商品 ${product.shoeId} 图片失败:`, error)
                    product.images = []
                } finally {
                    product.imageLoading = false
                    imageLoadPromises.delete(product.shoeId)
                }
            })()
            
            imageLoadPromises.set(product.shoeId, loadPromise)
            await loadPromise
        }



        // 切换图片
        const switchImage = (product, direction) => {
            if (!product.images || product.images.length <= 1) return
            
            const newIndex = product.currentImageIndex + direction
            if (newIndex >= 0 && newIndex < product.images.length) {
                product.currentImageIndex = newIndex
                product.imageUrl = `/api/shoeImg/getImage/${product.images[newIndex].imagePath}`
                
                // 预加载下一张图片
                const nextIndex = newIndex + direction
                if (nextIndex >= 0 && nextIndex < product.images.length) {
                    imagePreloader.preloadImage(`/api/shoeImg/getImage/${product.images[nextIndex].imagePath}`)
                }
            }
        }

        // 加载商品数据
        const loadProducts = async () => {
            loading.value = true
            try {
                const response = await ShoeAPI.getAll()
                if (response.data?.code === 200 && response.data.data) {
                    products.value = response.data.data.map(product => ({
                        ...product,
                        images: null,
                        currentImageIndex: 0,
                        imageUrl: '',
                        imageLoading: false
                    }))
                    
                    // 初始化数量
                    products.value.forEach(product => {
                        quantities[product.shoeId] = 1
                    })
                    
                    // 等待DOM更新后初始化懒加载
                    await nextTick()
                    initImageObserver()
                    
                    // 为每个商品设置懒加载观察
                    products.value.forEach(product => {
                        const element = document.querySelector(`[data-product-id="${product.shoeId}"]`)
                        if (element) {
                            imageObserver.observe(element)
                        }
                    })
                    
                    // 为每个商品加载可用尺码和库存
                    await Promise.all(products.value.map(async (product) => {
                        try {
                            // 获取商品可用尺码
                            const sizesResponse = await ShoesSizeAPI.getAll()
                            if (sizesResponse.data?.code === 200 && sizesResponse.data.data) {
                                // 检查每个尺码的库存
                                const availableSizes = []
                                for (const size of sizesResponse.data.data) {
                                    try {
                                        const inventoryResponse = await InventoryAPI.checkInventorySufficient(
                                            product.shoeId, 
                                            size.sizeId, 
                                            1
                                        )
                                        if (inventoryResponse.data?.code === 200 && inventoryResponse.data.data) {
                                            availableSizes.push(size)
                                        }
                                    } catch (error) {
                                        console.error(`检查库存失败: ${product.shoeId}-${size.sizeId}`, error)
                                    }
                                }
                                product.availableSizes = availableSizes
                            }
                        } catch (error) {
                            console.error(`加载商品 ${product.shoeId} 尺码失败:`, error)
                            product.availableSizes = []
                        }
                    }))
                }
            } catch (error) {
                console.error('加载商品失败:', error)
            } finally {
                loading.value = false
            }
        }

        // 加入购物车
        const addToCart = async (product) => {
            const sizeId = selectedSizes[product.shoeId]
            const quantity = quantities[product.shoeId]
            
            if (!sizeId || !quantity) {
                alert('请选择尺码和数量')
                return
            }
            
            try {
                // 检查库存
                const inventoryResponse = await InventoryAPI.checkInventorySufficient(product.shoeId, sizeId, quantity)
                if (inventoryResponse.data?.code !== 200 || !inventoryResponse.data.data) {
                    alert('库存不足')
                    return
                }
                
                // 使用购物车管理器加入购物车
                const success = await cartManager.addToCart(sizeId, quantity, product.shoeId)
                
                if (success) {
                    alert('成功加入购物车！')
                    // 重置选择
                    selectedSizes[product.shoeId] = ''
                    quantities[product.shoeId] = 1
                } else {
                    alert('加入购物车失败，请重试')
                }
            } catch (error) {
                console.error('加入购物车失败:', error)
                alert('加入购物车失败，请重试')
            }
        }

        onMounted(() => {
            loadProducts()
        })

        return {
            products,
            selectedSizes,
            quantities,
            loading,
            addToCart,
            switchImage
        }
    }
}
</script>

<style scoped>
.product-grid {
    /* 统一 MainNav 黑白极简主题 */
    --color-text: #111;
    --color-subtext: #666;
    --color-border: #ddd;
    --color-bg: #fff;
    --btn-radius: 8px;
    --btn-border: 1.5px;

    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 10px;
    padding: 20px;
    position: relative;
}

.product-item {
    border: 1px solid var(--color-border);
    border-radius: 0;
    padding: 16px;
    background: var(--color-bg);
    transition: box-shadow .15s ease, transform .1s ease;
}

.product-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.product-image {
    width: 100%;
    height: 300px;
    border-radius: 0;
    overflow: hidden;
    margin-bottom: 16px;
    position: relative;
    background: #f8f9fa;
}

.image-container {
    width: 100%;
    height: 100%;
    background-size: 80%;
    background-position: center;
    background-repeat: no-repeat;
    background-color: #fff;
    position: relative;
}

.image-loading {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    color: #666;
    font-size: 0.9rem;
}

.loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #ddd;
    border-top: 2px solid #666;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.image-switcher {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
    padding: 4px;
}

.switch-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 16px;
    padding: 2px 6px;
    border-radius: 2px;
    transition: background-color 0.2s;
}

.switch-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
}

.switch-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.image-counter {
    color: white;
    font-size: 0.7rem;
    padding: 0 4px;
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

.global-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: #666;
    font-size: 1rem;
}

.product-info {
    text-align: center;
    color: var(--color-text);
}

.product-name {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--color-text);
}

.product-meta {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 12px;
}

.brand, .type {
    padding: 4px 8px;
    background: #f2f2f2;
    border-radius: 12px;
    font-size: 0.8rem;
    color: #333;
}

.product-price {
    margin-bottom: 16px;
}

.current-price {
    font-size: 1.2rem;
    font-weight: 700;
    color: #e74c3c;
}

.original-price {
    font-size: 0.9rem;
    color: #999;
    text-decoration: line-through;
    margin-left: 8px;
}

.product-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.size-select, .quantity-input {
    padding: 8px;
    border: 1px solid var(--color-border);
    border-radius: var(--btn-radius);
    font-size: 0.9rem;
}

.add-to-cart-btn {
    padding: 10px;
    background: #111;
    color: white;
    border: none;
    border-radius: var(--btn-radius);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.add-to-cart-btn:hover:not(:disabled) {
    background: #333;
    transform: translateY(-1px);
}

.add-to-cart-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 8px;
        padding: 16px;
    }
    
    .product-image {
        height: 250px;
    }
    
    .image-switcher {
        bottom: 4px;
        right: 4px;
        padding: 2px;
    }
    
    .switch-btn {
        font-size: 14px;
        padding: 1px 4px;
    }
}
</style>

