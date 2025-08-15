<template>
    <div class="men-shoes">
        <div class="container">
            <div class="page-header">
                <h1>男鞋专区</h1>
                <p>为男士精选的时尚鞋履</p>
            </div>

            <div class="filters">
                <div class="filter-group">
                    <label>分类：</label>
                    <select v-model="selectedCategory">
                        <option value="">全部</option>
                        <option value="sports">运动鞋</option>
                        <option value="casual">休闲鞋</option>
                        <option value="formal">正装鞋</option>
                        <option value="boots">靴子</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>价格：</label>
                    <select v-model="selectedPrice">
                        <option value="">全部价格</option>
                        <option value="0-200">0-200元</option>
                        <option value="200-500">200-500元</option>
                        <option value="500-1000">500-1000元</option>
                        <option value="1000+">1000元以上</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>排序：</label>
                    <select v-model="sortBy">
                        <option value="default">默认排序</option>
                        <option value="price-asc">价格从低到高</option>
                        <option value="price-desc">价格从高到低</option>
                        <option value="popularity">热门程度</option>
                    </select>
                </div>
            </div>

            <div class="products-grid">
                <div v-for="shoe in filteredShoes" :key="shoe.id" class="product-card">
                    <div class="product-image">
                        <img :src="shoe.image" :alt="shoe.name" />
                        <div class="product-overlay">
                            <button class="btn btn-primary">查看详情</button>
                            <button class="btn btn-secondary">加入购物车</button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">{{ shoe.name }}</h3>
                        <p class="product-category">{{ getCategoryName(shoe.category) }}</p>
                        <div class="product-price">
                            <span class="current-price">¥{{ shoe.price }}</span>
                            <span v-if="shoe.originalPrice" class="original-price">¥{{ shoe.originalPrice }}</span>
                        </div>
                        <div class="product-rating">
                            <span class="stars">★★★★☆</span>
                            <span class="rating-text">({{ shoe.rating || 4.2 }})</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="filteredShoes.length === 0" class="empty-state">
                <p>没有找到符合条件的商品</p>
                <button @click="clearFilters" class="btn btn-primary">清除筛选</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MenShoes',
    data() {
        return {
            selectedCategory: '',
            selectedPrice: '',
            sortBy: 'default',
            shoes: [
                {
                    id: 1,
                    name: 'Nike Air Max 270',
                    category: 'sports',
                    price: 899,
                    originalPrice: 999,
                    image: 'https://via.placeholder.com/300x200?text=Nike+Air+Max+270',
                    rating: 4.5
                },
                {
                    id: 2,
                    name: 'Adidas Ultraboost 22',
                    category: 'sports',
                    price: 1299,
                    image: 'https://via.placeholder.com/300x200?text=Adidas+Ultraboost',
                    rating: 4.7
                },
                {
                    id: 3,
                    name: '商务皮鞋经典款',
                    category: 'formal',
                    price: 588,
                    image: 'https://via.placeholder.com/300x200?text=Business+Shoes',
                    rating: 4.3
                },
                {
                    id: 4,
                    name: 'Converse 经典帆布鞋',
                    category: 'casual',
                    price: 299,
                    originalPrice: 399,
                    image: 'https://via.placeholder.com/300x200?text=Converse',
                    rating: 4.4
                },
                {
                    id: 5,
                    name: '马丁靴工装风',
                    category: 'boots',
                    price: 688,
                    image: 'https://via.placeholder.com/300x200?text=Martin+Boots',
                    rating: 4.2
                },
                {
                    id: 6,
                    name: 'Vans Old Skool',
                    category: 'casual',
                    price: 428,
                    image: 'https://via.placeholder.com/300x200?text=Vans+Old+Skool',
                    rating: 4.6
                }
            ]
        }
    },
    computed: {
        filteredShoes() {
            let filtered = [...this.shoes]

            // 分类筛选
            if (this.selectedCategory) {
                filtered = filtered.filter(shoe => shoe.category === this.selectedCategory)
            }

            // 价格筛选
            if (this.selectedPrice) {
                const [min, max] = this.selectedPrice.includes('+')
                    ? [1000, Infinity]
                    : this.selectedPrice.split('-').map(Number)
                filtered = filtered.filter(shoe => shoe.price >= min && shoe.price <= (max || Infinity))
            }

            // 排序
            if (this.sortBy === 'price-asc') {
                filtered.sort((a, b) => a.price - b.price)
            } else if (this.sortBy === 'price-desc') {
                filtered.sort((a, b) => b.price - a.price)
            } else if (this.sortBy === 'popularity') {
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
            }

            return filtered
        }
    },
    methods: {
        getCategoryName(category) {
            const categoryMap = {
                sports: '运动鞋',
                casual: '休闲鞋',
                formal: '正装鞋',
                boots: '靴子'
            }
            return categoryMap[category] || '其他'
        },

        clearFilters() {
            this.selectedCategory = ''
            this.selectedPrice = ''
            this.sortBy = 'default'
        }
    }
}
</script>

<style scoped>
.men-shoes {
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 2rem 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.page-header {
    text-align: center;
    margin-bottom: 2rem;
}

.page-header h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
}

.page-header p {
    font-size: 1.1rem;
    color: #7f8c8d;
}

.filters {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.filter-group label {
    font-weight: 500;
    color: #2c3e50;
}

.filter-group select {
    padding: 0.5rem;
    border: 2px solid #e1e8ed;
    border-radius: 4px;
    background: white;
    cursor: pointer;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.product-card {
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    opacity: 0;
    transition: opacity 0.3s;
}

.product-card:hover .product-overlay {
    opacity: 1;
}

.product-info {
    padding: 1.5rem;
}

.product-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
}

.product-category {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin: 0 0 1rem 0;
}

.product-price {
    margin-bottom: 0.5rem;
}

.current-price {
    font-size: 1.3rem;
    font-weight: bold;
    color: #e74c3c;
}

.original-price {
    font-size: 1rem;
    color: #95a5a6;
    text-decoration: line-through;
    margin-left: 0.5rem;
}

.product-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.stars {
    color: #f39c12;
}

.rating-text {
    color: #7f8c8d;
    font-size: 0.9rem;
}

.empty-state {
    text-align: center;
    padding: 3rem 0;
    color: #7f8c8d;
}

.empty-state p {
    font-size: 1.1rem;
    margin-bottom: 1rem;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
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

/* 响应式设计 */
@media (max-width: 1200px) {
	.men-shoes-page {
		padding: 0 16px;
	}
	
	.products-grid {
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}
}

@media (max-width: 960px) {
	.men-shoes-page {
		padding: 0 12px;
	}
	
	.page-header {
		padding: 20px 0;
	}
	
	.page-title {
		font-size: 28px;
	}
	
	.products-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 16px;
	}
	
	.product-card {
		border-radius: 8px;
	}
	
	.product-info {
		padding: 1rem;
	}
	
	.product-name {
		font-size: 1rem;
	}
	
	.current-price {
		font-size: 1.2rem;
	}
}

@media (max-width: 768px) {
	.men-shoes-page {
		padding: 0 8px;
	}
	
	.page-header {
		padding: 16px 0;
	}
	
	.page-title {
		font-size: 24px;
	}
	
	.products-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}
	
	.product-info {
		padding: 0.8rem;
	}
	
	.product-name {
		font-size: 0.9rem;
	}
	
	.product-category {
		font-size: 0.8rem;
	}
	
	.current-price {
		font-size: 1.1rem;
	}
	
	.original-price {
		font-size: 0.9rem;
	}
}

@media (max-width: 480px) {
	.men-shoes-page {
		padding: 0 6px;
	}
	
	.page-header {
		padding: 12px 0;
	}
	
	.page-title {
		font-size: 20px;
	}
	
	.products-grid {
		grid-template-columns: 1fr;
		gap: 10px;
	}
	
	.product-card {
		border-radius: 6px;
	}
	
	.product-info {
		padding: 0.6rem;
	}
	
	.product-name {
		font-size: 0.85rem;
	}
	
	.product-category {
		font-size: 0.75rem;
	}
	
	.current-price {
		font-size: 1rem;
	}
	
	.original-price {
		font-size: 0.8rem;
	}
	
	.empty-state {
		padding: 2rem 0;
	}
	
	.empty-state p {
		font-size: 1rem;
	}
}
</style>
