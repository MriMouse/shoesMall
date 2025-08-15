<template>
    <div class="kids-shoes">
        <div class="container">
            <div class="page-header">
                <h1>童鞋专区</h1>
                <p>为孩子们精心挑选的舒适健康鞋履</p>
                <div class="age-tabs">
                    <button v-for="age in ageGroups" :key="age.key"
                        :class="['age-tab', { active: selectedAge === age.key }]" @click="selectedAge = age.key">
                        {{ age.label }}
                    </button>
                </div>
            </div>

            <div class="filters">
                <div class="filter-group">
                    <label>分类：</label>
                    <select v-model="selectedCategory">
                        <option value="">全部</option>
                        <option value="sports">运动鞋</option>
                        <option value="casual">休闲鞋</option>
                        <option value="sandals">凉鞋</option>
                        <option value="boots">靴子</option>
                        <option value="school">校园鞋</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>尺码：</label>
                    <select v-model="selectedSize">
                        <option value="">全部尺码</option>
                        <option value="baby">婴儿码 (11-13)</option>
                        <option value="toddler">学步码 (14-18)</option>
                        <option value="little-kid">小童码 (19-25)</option>
                        <option value="big-kid">大童码 (26-35)</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>价格：</label>
                    <select v-model="selectedPrice">
                        <option value="">全部价格</option>
                        <option value="0-150">0-150元</option>
                        <option value="150-300">150-300元</option>
                        <option value="300-500">300-500元</option>
                        <option value="500+">500元以上</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>排序：</label>
                    <select v-model="sortBy">
                        <option value="default">默认排序</option>
                        <option value="price-asc">价格从低到高</option>
                        <option value="price-desc">价格从高到低</option>
                        <option value="age-asc">适合年龄从小到大</option>
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
                        <div v-if="shoe.isRecommended" class="product-badge recommended">推荐</div>
                        <div v-if="shoe.isNew" class="product-badge new">新品</div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">{{ shoe.name }}</h3>
                        <p class="product-category">{{ getCategoryName(shoe.category) }}</p>
                        <div class="age-range">
                            <span class="age-tag">适合年龄：{{ shoe.ageRange }}</span>
                        </div>
                        <div class="product-price">
                            <span class="current-price">¥{{ shoe.price }}</span>
                            <span v-if="shoe.originalPrice" class="original-price">¥{{ shoe.originalPrice }}</span>
                        </div>
                        <div class="product-features">
                            <span v-for="feature in shoe.features" :key="feature" class="feature-tag">
                                {{ feature }}
                            </span>
                        </div>
                        <div class="product-rating">
                            <span class="stars">★★★★★</span>
                            <span class="rating-text">({{ shoe.rating || 4.8 }})</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="filteredShoes.length === 0" class="empty-state">
                <div class="empty-icon">👟</div>
                <p>没有找到符合条件的童鞋</p>
                <button @click="clearFilters" class="btn btn-primary">清除筛选</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'KidsShoes',
    data() {
        return {
            selectedAge: 'all',
            selectedCategory: '',
            selectedSize: '',
            selectedPrice: '',
            sortBy: 'default',
            ageGroups: [
                { key: 'all', label: '全部' },
                { key: 'baby', label: '婴儿 (0-2岁)' },
                { key: 'toddler', label: '学步 (2-4岁)' },
                { key: 'preschool', label: '学龄前 (4-6岁)' },
                { key: 'school', label: '学龄 (6-12岁)' }
            ],
            shoes: [
                {
                    id: 1,
                    name: 'Nike 儿童运动鞋',
                    category: 'sports',
                    ageGroup: 'school',
                    ageRange: '6-12岁',
                    sizeCategory: 'big-kid',
                    price: 399,
                    originalPrice: 499,
                    image: 'https://via.placeholder.com/300x200?text=Nike+Kids',
                    rating: 4.9,
                    features: ['透气网面', '防滑鞋底', '轻便设计'],
                    isRecommended: true
                },
                {
                    id: 2,
                    name: '学步软底鞋',
                    category: 'casual',
                    ageGroup: 'toddler',
                    ageRange: '1-3岁',
                    sizeCategory: 'toddler',
                    price: 128,
                    image: 'https://via.placeholder.com/300x200?text=Toddler+Shoes',
                    rating: 4.8,
                    features: ['软底设计', '护踝', '易穿脱'],
                    isNew: true
                },
                {
                    id: 3,
                    name: 'Adidas 三叶草童鞋',
                    category: 'casual',
                    ageGroup: 'preschool',
                    ageRange: '4-7岁',
                    sizeCategory: 'little-kid',
                    price: 289,
                    image: 'https://via.placeholder.com/300x200?text=Adidas+Kids',
                    rating: 4.7,
                    features: ['经典款式', '舒适内里', '耐磨外底']
                },
                {
                    id: 4,
                    name: '夏日儿童凉鞋',
                    category: 'sandals',
                    ageGroup: 'preschool',
                    ageRange: '3-8岁',
                    sizeCategory: 'little-kid',
                    price: 168,
                    originalPrice: 218,
                    image: 'https://via.placeholder.com/300x200?text=Kids+Sandals',
                    rating: 4.6,
                    features: ['透气凉爽', '防滑', '快干材质']
                },
                {
                    id: 5,
                    name: '校园学生鞋',
                    category: 'school',
                    ageGroup: 'school',
                    ageRange: '6-14岁',
                    sizeCategory: 'big-kid',
                    price: 198,
                    image: 'https://via.placeholder.com/300x200?text=School+Shoes',
                    rating: 4.5,
                    features: ['白色简约', '易清洁', '耐穿'],
                    isRecommended: true
                },
                {
                    id: 6,
                    name: '可爱婴儿鞋',
                    category: 'casual',
                    ageGroup: 'baby',
                    ageRange: '0-18个月',
                    sizeCategory: 'baby',
                    price: 88,
                    image: 'https://via.placeholder.com/300x200?text=Baby+Shoes',
                    rating: 4.9,
                    features: ['纯棉内里', '超柔软', '保护小脚'],
                    isNew: true
                }
            ]
        }
    },
    computed: {
        filteredShoes() {
            let filtered = [...this.shoes]

            // 年龄组筛选
            if (this.selectedAge !== 'all') {
                filtered = filtered.filter(shoe => shoe.ageGroup === this.selectedAge)
            }

            // 分类筛选
            if (this.selectedCategory) {
                filtered = filtered.filter(shoe => shoe.category === this.selectedCategory)
            }

            // 尺码筛选
            if (this.selectedSize) {
                filtered = filtered.filter(shoe => shoe.sizeCategory === this.selectedSize)
            }

            // 价格筛选
            if (this.selectedPrice) {
                const [min, max] = this.selectedPrice.includes('+')
                    ? [500, Infinity]
                    : this.selectedPrice.split('-').map(Number)
                filtered = filtered.filter(shoe => shoe.price >= min && shoe.price <= (max || Infinity))
            }

            // 排序
            if (this.sortBy === 'price-asc') {
                filtered.sort((a, b) => a.price - b.price)
            } else if (this.sortBy === 'price-desc') {
                filtered.sort((a, b) => b.price - a.price)
            } else if (this.sortBy === 'age-asc') {
                const ageOrder = { baby: 0, toddler: 1, preschool: 2, school: 3 }
                filtered.sort((a, b) => ageOrder[a.ageGroup] - ageOrder[b.ageGroup])
            }

            return filtered
        }
    },
    methods: {
        getCategoryName(category) {
            const categoryMap = {
                sports: '运动鞋',
                casual: '休闲鞋',
                sandals: '凉鞋',
                boots: '靴子',
                school: '校园鞋'
            }
            return categoryMap[category] || '其他'
        },

        clearFilters() {
            this.selectedAge = 'all'
            this.selectedCategory = ''
            this.selectedSize = ''
            this.selectedPrice = ''
            this.sortBy = 'default'
        }
    }
}
</script>

<style scoped>
.kids-shoes {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 50%, #fd79a8 100%);
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
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
}

.page-header p {
    font-size: 1.1rem;
    color: #2d3436;
    margin-bottom: 1.5rem;
}

.age-tabs {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.age-tab {
    padding: 0.5rem 1rem;
    border: 2px solid #ff6b6b;
    background: white;
    color: #ff6b6b;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
}

.age-tab:hover,
.age-tab.active {
    background: #ff6b6b;
    color: white;
    transform: translateY(-2px);
}

.filters {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    margin-bottom: 2rem;
    display: flex;
    gap: 2rem;
    flex-wrap: wrap;
    box-shadow: 0 5px 20px rgba(255, 107, 107, 0.1);
    border: 2px solid rgba(255, 107, 107, 0.1);
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.filter-group label {
    font-weight: 600;
    color: #2d3436;
}

.filter-group select {
    padding: 0.5rem;
    border: 2px solid rgba(255, 107, 107, 0.3);
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: border-color 0.3s;
    font-family: inherit;
}

.filter-group select:focus {
    outline: none;
    border-color: #ff6b6b;
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.product-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 5px 25px rgba(255, 107, 107, 0.15);
    transition: all 0.3s;
    border: 2px solid rgba(255, 107, 107, 0.05);
}

.product-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 15px 40px rgba(255, 107, 107, 0.25);
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
    transform: scale(1.15);
}

.product-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255, 107, 107, 0.9), rgba(78, 205, 196, 0.9));
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
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: bold;
    color: white;
}

.product-badge.recommended {
    background: linear-gradient(45deg, #00b894, #00cec9);
}

.product-badge.new {
    background: linear-gradient(45deg, #fd79a8, #fdcb6e);
}

.product-info {
    padding: 1.5rem;
}

.product-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3436;
    margin: 0 0 0.5rem 0;
}

.product-category {
    color: #636e72;
    font-size: 0.9rem;
    margin: 0 0 0.5rem 0;
}

.age-range {
    margin-bottom: 1rem;
}

.age-tag {
    background: linear-gradient(45deg, #74b9ff, #0984e3);
    color: white;
    padding: 0.2rem 0.8rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
}

.product-price {
    margin-bottom: 1rem;
}

.current-price {
    font-size: 1.3rem;
    font-weight: bold;
    color: #ff6b6b;
}

.original-price {
    font-size: 1rem;
    color: #b2bec3;
    text-decoration: line-through;
    margin-left: 0.5rem;
}

.product-features {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.feature-tag {
    background: rgba(78, 205, 196, 0.2);
    color: #00b894;
    padding: 0.2rem 0.6rem;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 500;
}

.product-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.stars {
    color: #fdcb6e;
    font-size: 1.1rem;
}

.rating-text {
    color: #636e72;
    font-size: 0.9rem;
}

.empty-state {
    text-align: center;
    padding: 4rem 0;
    color: #636e72;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.empty-state p {
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
}

.btn {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s;
    font-family: inherit;
}

.btn-primary {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    color: white;
}

.btn-primary:hover {
    background: linear-gradient(45deg, #ee5a52, #45b7d1);
    transform: translateY(-2px);
}

.btn-secondary {
    background: linear-gradient(45deg, #74b9ff, #0984e3);
    color: white;
}

.btn-secondary:hover {
    background: linear-gradient(45deg, #0984e3, #0c5aa6);
    transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 1200px) {
	.kids-shoes-page {
		padding: 0 16px;
	}
	
	.products-grid {
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}
}

@media (max-width: 960px) {
	.kids-shoes-page {
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
	
	.product-features {
		gap: 0.4rem;
	}
	
	.feature-tag {
		font-size: 0.65rem;
		padding: 0.15rem 0.5rem;
	}
}

@media (max-width: 768px) {
	.kids-shoes-page {
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
	
	.product-features {
		gap: 0.3rem;
	}
	
	.feature-tag {
		font-size: 0.6rem;
		padding: 0.1rem 0.4rem;
	}
	
	.stars {
		font-size: 1rem;
	}
	
	.rating-text {
		font-size: 0.8rem;
	}
}

@media (max-width: 480px) {
	.kids-shoes-page {
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
	
	.product-features {
		gap: 0.25rem;
	}
	
	.feature-tag {
		font-size: 0.55rem;
		padding: 0.1rem 0.3rem;
	}
	
	.stars {
		font-size: 0.9rem;
	}
	
	.rating-text {
		font-size: 0.75rem;
	}
	
	.empty-state {
		padding: 3rem 0;
	}
	
	.empty-icon {
		font-size: 3rem;
	}
	
	.empty-state p {
		font-size: 1rem;
	}
}
</style>
