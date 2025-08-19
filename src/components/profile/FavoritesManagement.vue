<template>
  <div class="favorites-management">
    <div class="favorites-header">
      <h3>我的收藏</h3>
      <div class="favorites-actions">
        <button @click="selectAll" class="btn btn-outline">
          {{ isAllSelected ? '取消全选' : '全选' }}
        </button>
        <button 
          v-if="selectedItems.length > 0" 
          @click="removeSelected" 
          class="btn btn-danger"
        >
          删除选中 ({{ selectedItems.length }})
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载收藏...</p>
    </div>

    <div v-else-if="favorites.length === 0" class="empty-state">
      <div class="empty-icon">❤️</div>
      <p>暂无收藏商品</p>
      <router-link to="/products" class="btn btn-primary">去逛逛</router-link>
    </div>

    <div v-else class="favorites-grid">
      <div 
        v-for="item in favorites" 
        :key="item.id" 
        class="favorite-item"
        :class="{ selected: selectedItems.includes(item.id) }"
      >
        <div class="item-checkbox">
          <input 
            type="checkbox" 
            :checked="selectedItems.includes(item.id)"
            @change="toggleSelection(item.id)"
          />
        </div>
        
        <div class="item-image">
          <img :src="item.image || '/placeholder-shoe.jpg'" :alt="item.name" />
        </div>
        
        <div class="item-info">
          <h4 class="item-name">{{ item.name }}</h4>
          <p class="item-brand">{{ item.brand }}</p>
          <div class="item-price">
            <span class="current-price">¥{{ item.price }}</span>
            <span v-if="item.originalPrice" class="original-price">¥{{ item.originalPrice }}</span>
          </div>
          <div class="item-colors">
            <span class="color-label">颜色：</span>
            <span class="color-value">{{ item.color }}</span>
          </div>
        </div>
        
        <div class="item-actions">
          <button @click="addToCart(item)" class="btn btn-primary">
            加入购物车
          </button>
          <button @click="removeFavorite(item)" class="btn btn-outline">
            取消收藏
          </button>
          <button @click="viewDetail(item)" class="btn btn-secondary">
            查看详情
          </button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="favorites.length > 0" class="pagination">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1" 
        class="btn btn-outline"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages" 
        class="btn btn-outline"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script>
import { CartAPI } from '@/api'
import userManager from '@/utils/userManager'

export default {
  name: 'FavoritesManagement',
  data() {
    return {
      favorites: [],
      selectedItems: [],
      loading: false,
      currentPage: 1,
      pageSize: 12,
      totalPages: 1
    }
  },
  computed: {
    isAllSelected() {
      return this.favorites.length > 0 && this.selectedItems.length === this.favorites.length
    }
  },
  mounted() {
    this.loadFavorites()
  },
  methods: {
    async loadFavorites() {
      try {
        this.loading = true
        // 这里应该调用后端API获取收藏列表
        // 由于后端可能没有对应的API，我们使用模拟数据
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.favorites = [
          {
            id: 1,
            name: 'Nike Air Max 270',
            brand: 'Nike',
            price: 899,
            originalPrice: 1099,
            color: '白色/黑色',
            image: '/placeholder-shoe.jpg',
            sizeId: 1,
            shoeId: 1
          },
          {
            id: 2,
            name: 'Adidas Ultraboost 21',
            brand: 'Adidas',
            price: 1299,
            originalPrice: 1499,
            color: '蓝色/白色',
            image: '/placeholder-shoe.jpg',
            sizeId: 2,
            shoeId: 2
          },
          {
            id: 3,
            name: 'Converse Chuck Taylor',
            brand: 'Converse',
            price: 399,
            originalPrice: 499,
            color: '黑色',
            image: '/placeholder-shoe.jpg',
            sizeId: 3,
            shoeId: 3
          },
          {
            id: 4,
            name: 'Vans Old Skool',
            brand: 'Vans',
            price: 459,
            originalPrice: 559,
            color: '黑白棋盘格',
            image: '/placeholder-shoe.jpg',
            sizeId: 4,
            shoeId: 4
          }
        ]
        
        this.totalPages = Math.ceil(this.favorites.length / this.pageSize)
      } catch (error) {
        console.error('加载收藏失败:', error)
      } finally {
        this.loading = false
      }
    },

    toggleSelection(itemId) {
      const index = this.selectedItems.indexOf(itemId)
      if (index > -1) {
        this.selectedItems.splice(index, 1)
      } else {
        this.selectedItems.push(itemId)
      }
    },

    selectAll() {
      if (this.isAllSelected) {
        this.selectedItems = []
      } else {
        this.selectedItems = this.favorites.map(item => item.id)
      }
    },

    async removeSelected() {
      if (!confirm(`确定要删除选中的 ${this.selectedItems.length} 个收藏吗？`)) {
        return
      }

      try {
        // 这里应该调用后端API删除收藏
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.favorites = this.favorites.filter(item => !this.selectedItems.includes(item.id))
        this.selectedItems = []
        
        alert('删除成功')
      } catch (error) {
        console.error('删除收藏失败:', error)
        alert('删除失败，请重试')
      }
    },

    async removeFavorite(item) {
      if (!confirm(`确定要取消收藏"${item.name}"吗？`)) {
        return
      }

      try {
        // 这里应该调用后端API删除单个收藏
        await new Promise(resolve => setTimeout(resolve, 500))
        
        this.favorites = this.favorites.filter(fav => fav.id !== item.id)
        this.selectedItems = this.selectedItems.filter(id => id !== item.id)
        
        alert('已取消收藏')
      } catch (error) {
        console.error('取消收藏失败:', error)
        alert('操作失败，请重试')
      }
    },

    async addToCart(item) {
      try {
        const userId = await userManager.getUserId()
        if (!userId) {
          alert('请先登录')
          return
        }

        // 调用购物车API
        await CartAPI.addToCart(userId, item.sizeId, item.shoeId, 1)
        
        alert('已加入购物车')
      } catch (error) {
        console.error('加入购物车失败:', error)
        alert('加入购物车失败，请重试')
      }
    },

    viewDetail(item) {
      // 跳转到商品详情页
      this.$router.push(`/product/${item.shoeId}`)
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    }
  }
}
</script>

<style scoped>
.favorites-management {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e1e8ed;
}

.favorites-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 600;
}

.favorites-actions {
  display: flex;
  gap: 12px;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
  color: #7f8c8d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.favorite-item {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
  position: relative;
}

.favorite-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.favorite-item.selected {
  border-color: #3498db;
  background-color: #f8f9ff;
}

.item-checkbox {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.item-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.item-image {
  width: 100%;
  height: 200px;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  margin-bottom: 16px;
}

.item-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  line-height: 1.4;
}

.item-brand {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #7f8c8d;
}

.item-price {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #e74c3c;
}

.original-price {
  font-size: 14px;
  color: #7f8c8d;
  text-decoration: line-through;
}

.item-colors {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.color-label {
  color: #7f8c8d;
}

.color-value {
  color: #2c3e50;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #e1e8ed;
}

.page-info {
  color: #7f8c8d;
  font-size: 14px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2980b9;
}

.btn-primary:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
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

.btn-outline:hover:not(:disabled) {
  background-color: #3498db;
  color: white;
}

.btn-outline:disabled {
  border-color: #bdc3c7;
  color: #bdc3c7;
  cursor: not-allowed;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

@media (max-width: 768px) {
  .favorites-management {
    padding: 16px;
  }
  
  .favorites-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .favorites-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .favorites-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .item-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
