<template>
    <div class="product-grid">
        <div class="product-item" v-for="product in products" :key="product.shoeId">
            <div class="product-image">
                <img 
                    v-if="product.images && product.images.length > 0" 
                    :src="`/api/shoeImg/getImage/${product.images[0].imagePath}`" 
                    :alt="product.name"
                    @error="handleImageError"
                />
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
    </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ShoeAPI, ShoesSizeAPI, InventoryAPI } from '@/api'
import cartManager from '@/utils/cart'

export default {
    name: 'ProductGrid',
    setup() {
        const products = ref([])
        const selectedSizes = reactive({})
        const quantities = reactive({})
        const loading = ref(false)

        // 加载商品数据
        const loadProducts = async () => {
            loading.value = true
            try {
                const response = await ShoeAPI.getAll()
                if (response.data?.code === 200 && response.data.data) {
                    products.value = response.data.data
                    
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
                        
                        // 初始化数量为1
                        quantities[product.shoeId] = 1
                    })
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
                if (!inventoryResponse.data?.code === 200 || !inventoryResponse.data.data) {
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

        // 图片加载失败处理
        const handleImageError = (event) => {
            event.target.style.display = 'none'
            const noImage = event.target.parentNode.querySelector('.no-image')
            if (noImage) {
                noImage.style.display = 'flex'
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
            handleImageError
        }
    }
}
</script>

<style scoped>
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
}

.product-item {
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 16px;
    background: white;
    transition: all 0.3s ease;
}

.product-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.product-image {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.no-image {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    color: #6c757d;
    font-size: 3rem;
}

.product-info {
    text-align: center;
}

.product-name {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    color: #333;
    font-weight: 600;
}

.product-meta {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-bottom: 12px;
    font-size: 0.9rem;
    color: #6c757d;
}

.product-price {
    margin-bottom: 16px;
}

.current-price {
    font-size: 1.2rem;
    font-weight: 600;
    color: #e74c3c;
}

.original-price {
    margin-left: 8px;
    font-size: 1rem;
    color: #6c757d;
    text-decoration: line-through;
}

.product-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.size-select, .quantity-input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
}

.add-to-cart-btn {
    padding: 10px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.3s ease;
}

.add-to-cart-btn:hover:not(:disabled) {
    background: #0056b3;
}

.add-to-cart-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .product-grid {
        grid-template-columns: 1fr;
        padding: 10px;
    }
    
    .product-item {
        padding: 12px;
    }
}
</style>

