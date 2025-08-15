<template>
    <div class="women-shoes">
        <div class="container">
            <div class="page-header">
                <h1>女鞋专区</h1>
                <p>为女士打造的时尚优雅鞋履</p>
            </div>

            <div class="filters">
                <div class="filter-group">
                    <label>分类：</label>
                    <select v-model="selectedCategory">
                        <option value="">全部</option>
                        <option value="heels">高跟鞋</option>
                        <option value="flats">平底鞋</option>
                        <option value="sports">运动鞋</option>
                        <option value="boots">靴子</option>
                        <option value="sandals">凉鞋</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>鞋跟高度：</label>
                    <select v-model="selectedHeelHeight">
                        <option value="">全部</option>
                        <option value="flat">平跟 (0-2cm)</option>
                        <option value="low">低跟 (3-5cm)</option>
                        <option value="mid">中跟 (6-8cm)</option>
                        <option value="high">高跟 (9cm以上)</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>价格：</label>
                    <select v-model="selectedPrice">
                        <option value="">全部价格</option>
                        <option value="0-300">0-300元</option>
                        <option value="300-600">300-600元</option>
                        <option value="600-1200">600-1200元</option>
                        <option value="1200+">1200元以上</option>
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
                        <div v-if="shoe.isNew" class="product-badge new">新品</div>
                        <div v-if="shoe.isHot" class="product-badge hot">热销</div>
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
                            <span class="rating-text">({{ shoe.rating || 4.3 }})</span>
                        </div>
                        <div class="product-colors">
                            <span v-for="color in shoe.colors" :key="color" :class="['color-dot', color]"
                                :title="color">
                            </span>
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
    name: 'WomenShoes',
    data() {
        return {
            selectedCategory: '',
            selectedHeelHeight: '',
            selectedPrice: '',
            sortBy: 'default',
            shoes: [
                {
                    id: 1,
                    name: '经典尖头高跟鞋',
                    category: 'heels',
                    heelHeight: 'high',
                    price: 688,
                    originalPrice: 888,
                    image: 'https://via.placeholder.com/300x200?text=High+Heels',
                    rating: 4.4,
                    colors: ['black', 'red', 'nude'],
                    isHot: true
                },
                {
                    id: 2,
                    name: '舒适芭蕾平底鞋',
                    category: 'flats',
                    heelHeight: 'flat',
                    price: 298,
                    image: 'https://via.placeholder.com/300x200?text=Ballet+Flats',
                    rating: 4.6,
                    colors: ['black', 'pink', 'beige'],
                    isNew: true
                },
                {
                    id: 3,
                    name: 'Nike Air Force 1 女款',
                    category: 'sports',
                    heelHeight: 'flat',
                    price: 799,
                    image: 'https://via.placeholder.com/300x200?text=Nike+Air+Force+1',
                    rating: 4.7,
                    colors: ['white', 'black', 'pink']
                },
                {
                    id: 4,
                    name: '时尚过膝长靴',
                    category: 'boots',
                    heelHeight: 'mid',
                    price: 1299,
                    originalPrice: 1599,
                    image: 'https://via.placeholder.com/300x200?text=Knee+High+Boots',
                    rating: 4.3,
                    colors: ['black', 'brown'],
                    isHot: true
                },
                {
                    id: 5,
                    name: '夏日清凉凉鞋',
                    category: 'sandals',
                    heelHeight: 'low',
                    price: 399,
                    image: 'https://via.placeholder.com/300x200?text=Summer+Sandals',
                    rating: 4.5,
                    colors: ['gold', 'silver', 'rose-gold']
                },
                {
                    id: 6,
                    name: '职场通勤中跟鞋',
                    category: 'heels',
                    heelHeight: 'mid',
                    price: 588,
                    image: 'https://via.placeholder.com/300x200?text=Office+Heels',
                    rating: 4.2,
                    colors: ['black', 'navy', 'grey']
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

            // 鞋跟高度筛选
            if (this.selectedHeelHeight) {
                filtered = filtered.filter(shoe => shoe.heelHeight === this.selectedHeelHeight)
            }

            // 价格筛选
            if (this.selectedPrice) {
                const [min, max] = this.selectedPrice.includes('+')
                    ? [1200, Infinity]
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
                heels: '高跟鞋',
                flats: '平底鞋',
                sports: '运动鞋',
                boots: '靴子',
                sandals: '凉鞋'
            }
            return categoryMap[category] || '其他'
        },

        clearFilters() {
            this.selectedCategory = ''
            this.selectedHeelHeight = ''
            this.selectedPrice = ''
            this.sortBy = 'default'
        }
    }
}
</script>

<style scoped>
.women-shoes {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffeef8 0%, #f8e8ff 100%);
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
    background: linear-gradient(45deg, #e91e63, #9c27b0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
}

.page-header p {
    font-size: 1.1rem;
    color: #7f8c8d;
}

.filters {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    box-shadow: 0 2px 15px rgba(233, 30, 99, 0.1);
    border: 1px solid rgba(233, 30, 99, 0.1);
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
    border: 2px solid rgba(233, 30, 99, 0.2);
    border-radius: 6px;
    background: white;
    cursor: pointer;
    transition: border-color 0.3s;
}

.filter-group select:focus {
    outline: none;
    border-color: #e91e63;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.product-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(233, 30, 99, 0.1);
    transition: all 0.3s;
    border: 1px solid rgba(233, 30, 99, 0.05);
}

.product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 10px 30px rgba(233, 30, 99, 0.2);
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
    transition: transform 0.3s;
}

.product-card:hover .product-image img {
    transform: scale(1.1);
}

.product-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(233, 30, 99, 0.9), rgba(156, 39, 176, 0.9));
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

.product-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
    color: white;
}

.product-badge.new {
    background: linear-gradient(45deg, #4ecdc4, #44a08d);
}

.product-badge.hot {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
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
    color: #e91e63;
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
    margin-bottom: 1rem;
}

.stars {
    color: #f39c12;
}

.rating-text {
    color: #7f8c8d;
    font-size: 0.9rem;
}

.product-colors {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.color-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
}

.color-dot:hover {
    transform: scale(1.2);
}

.color-dot.black {
    background-color: #2c3e50;
}

.color-dot.red {
    background-color: #e74c3c;
}

.color-dot.nude {
    background-color: #d4a574;
}

.color-dot.pink {
    background-color: #fd79a8;
}

.color-dot.beige {
    background-color: #f5deb3;
}

.color-dot.white {
    background-color: #ecf0f1;
    border-color: #bdc3c7;
}

.color-dot.brown {
    background-color: #8b4513;
}

.color-dot.gold {
    background-color: #f1c40f;
}

.color-dot.silver {
    background-color: #95a5a6;
}

.color-dot.rose-gold {
    background-color: #e8b4b8;
}

.color-dot.navy {
    background-color: #2d3e50;
}

.color-dot.grey {
    background-color: #7f8c8d;
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
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s;
}

.btn-primary {
    background: linear-gradient(45deg, #e91e63, #9c27b0);
    color: white;
}

.btn-primary:hover {
    background: linear-gradient(45deg, #c2185b, #7b1fa2);
    transform: translateY(-1px);
}

.btn-secondary {
    background: linear-gradient(45deg, #95a5a6, #7f8c8d);
    color: white;
}

.btn-secondary:hover {
    background: linear-gradient(45deg, #7f8c8d, #6c7b7d);
    transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
	.women-shoes-page {
		padding: 0 16px;
	}
	
	.products-grid {
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}
}

@media (max-width: 960px) {
	.women-shoes-page {
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
	
	.color-options {
		gap: 6px;
	}
	
	.color-dot {
		width: 16px;
		height: 16px;
	}
}

@media (max-width: 768px) {
	.women-shoes-page {
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
	
	.color-options {
		gap: 4px;
	}
	
	.color-dot {
		width: 14px;
		height: 14px;
	}
}

@media (max-width: 480px) {
	.women-shoes-page {
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
	
	.color-options {
		gap: 3px;
	}
	
	.color-dot {
		width: 12px;
		height: 12px;
	}
	
	.empty-state {
		padding: 2rem 0;
	}
	
	.empty-state p {
		font-size: 1rem;
	}
}
</style>
