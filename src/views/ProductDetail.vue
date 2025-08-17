<template>
  <div class="product-detail">
    <div class="breadcrumb">
      <span>首页 / 产品列表 / {{ product.name }}</span>
    </div>
    
    <div class="product-container">
      <!-- 左侧商品图片 -->
      <div class="product-images">
        <div class="main-image">
          <img :src="getProductImage()" :alt="product.name" @error="handleImageError" />
        </div>
      </div>
      
      <!-- 右侧商品信息 -->
      <div class="product-info">
        <h1 class="product-name">{{ product.name }}</h1>
        <div class="product-id">产品编号: {{ product.serialNumber }}</div>
        
        <!-- 价格信息 -->
        <div class="pricing">
          <div class="current-price">现价: ¥{{ product.discountPrice || product.price }}</div>
          <div class="original-price" v-if="product.discountPrice">原价: ¥{{ product.price }}</div>
        </div>
        
        <!-- 积分信息 -->
        <div class="points">可获得积分: {{ product.points }}分</div>
        
        <!-- 销量信息 -->
        <div class="sales">已售出数量: {{ product.salesVolume }}双</div>
        
        <!-- 尺码选择 -->
        <div class="size-selection">
          <h3>选择尺码</h3>
          <div class="size-options">
            <button v-for="size in availableSizes" :key="size.sizeId"
                    :class="['size-btn', { selected: selectedSize === size.sizeId }]"
                    @click="selectSize(size.sizeId)">
              {{ size.sizeName }} ({{ size.stock }}双)
            </button>
          </div>
        </div>
        
        <!-- 数量选择 -->
        <div class="quantity-selection">
          <h3>购买数量</h3>
          <div class="quantity-control">
            <button class="btn-quantity" @click="decreaseQuantity">-</button>
            <input type="number" v-model="quantity" min="1" :max="maxQuantity" class="quantity-input" />
            <button class="btn-quantity" @click="increaseQuantity">+</button>
          </div>
          <div class="stock-info">当前尺码库存: {{ selectedSizeStock }}双</div>
        </div>
        
        <!-- 商品标签 -->
        <div class="product-tags">
          <span v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="btn-add-cart" @click="addToCart">
            🛒 加入购物车
          </button>
          <button class="btn-buy-now" @click="buyNow">
            ⚡ 立即购买
          </button>
        </div>
        
        <!-- 购物车状态 -->
        <div class="cart-status" v-if="cartItemCount > 0">
          <span>购物车中有 {{ cartItemCount }} 件商品</span>
          <router-link to="/cart" class="view-cart-link">查看购物车</router-link>
        </div>
        
        <!-- 加入购物车成功提示 -->
        <div class="cart-success" v-if="showCartSuccess">
          <span>✅ 已成功加入购物车！</span>
          <router-link to="/cart" class="view-cart-link">查看购物车</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { OrderAPI, ShoeAPI, ShoesSizeAPI } from '@/api'
import cartManager from '@/utils/cart'

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: {
        id: null,
        name: '',
        serialNumber: '',
        price: 0,
        discountPrice: 0,
        points: 0,
        salesVolume: 0,
        brand: '',
        tags: [],
        images: [],
        inventoryData: [] // 保存库存数据
      },
      selectedSize: null,
      quantity: 1,
      availableSizes: [],
      loading: false,
      showCartSuccess: false // 新增：控制加入购物车成功提示的显示
    }
  },
  
  computed: {
    selectedSizeStock() {
      if (!this.selectedSize) return 0
      const size = this.availableSizes.find(s => s.sizeId === this.selectedSize)
      return size ? size.stock : 0
    },
    
    maxQuantity() {
      return this.selectedSizeStock
    },

    cartItemCount() {
      return cartManager.getCartItemCount()
    }
  },
  
  mounted() {
    this.loadProductData()
    this.initCartManager()
  },
  
  methods: {
    async loadProductData() {
      const productId = this.$route.params.id || this.$route.query.productId
      if (productId) {
        console.log('加载商品ID:', productId)
        this.loading = true
        
        try {
          // 加载商品基本信息
          const shoeResponse = await ShoeAPI.getById(productId)
          if (shoeResponse.data?.code === 200) {
            const shoe = shoeResponse.data.data
            this.product = {
              id: shoe.shoeId,
              shoeId: shoe.shoeId, // 添加shoeId字段
              name: shoe.name || '',
              serialNumber: shoe.serialNumber || '',
              price: shoe.price || 0,
              discountPrice: shoe.discountPrice || shoe.price || 0,
              points: shoe.points || 0,
              salesVolume: shoe.salesVolume || 0,
              brand: shoe.brand?.brandName || '',
              tags: [shoe.brand?.brandName, shoe.shoesType?.typeName].filter(Boolean),
              images: [],
              inventoryData: shoe.inventoryData || [] // 保存库存数据
            }
            
            console.log('加载的商品数据:', shoe)
            console.log('处理后的商品数据:', this.product)
            
            // 加载商品图片
            try {
              const imageResponse = await ShoeAPI.getImages(productId)
              if (imageResponse.data?.code === 200 && imageResponse.data.data?.length > 0) {
                this.product.images = imageResponse.data.data.map(img => 
                  `/api/shoeImg/getImage/${img.imagePath}`
                )
              }
            } catch (imgError) {
              console.error('加载商品图片失败:', imgError)
              this.product.images = ['/src/assets/logo.png']
            }
            
            // 加载尺码信息
            await this.loadSizeOptions(productId)
          } else {
            console.error('加载商品信息失败:', shoeResponse.data?.msg)
          }
        } catch (error) {
          console.error('加载商品数据失败:', error)
        } finally {
          this.loading = false
        }
      }
    },
    
    async loadSizeOptions(productId) {
      try {
        console.log('=== 加载尺码选项调试信息 ===')
        console.log('商品数据:', this.product)
        console.log('库存数据:', this.product.inventoryData)
        
        // 使用商品数据中的inventoryData来获取尺码信息
        if (this.product.inventoryData && this.product.inventoryData.length > 0) {
          this.availableSizes = this.product.inventoryData.map(item => ({
            sizeId: item.sizeId,
            sizeName: item.size,
            stock: item.inventoryNumber || 0
          }))
          
          // 默认选择第一个有库存的尺码
          const availableSize = this.availableSizes.find(size => size.stock > 0)
          if (availableSize) {
            this.selectedSize = availableSize.sizeId
          } else if (this.availableSizes.length > 0) {
            this.selectedSize = this.availableSizes[0].sizeId
          }
          
          console.log('加载的尺码选项:', this.availableSizes)
          console.log('选中的尺码:', this.selectedSize)
        } else {
          // 如果没有库存数据，显示错误信息
          console.error('没有找到库存数据，无法加载尺码选项')
          this.availableSizes = []
          this.selectedSize = null
          this.showMessage('该商品暂无可用尺码', 'warning')
        }
      } catch (error) {
        console.error('加载尺码选项失败:', error)
        this.availableSizes = []
        this.selectedSize = null
        this.showMessage('加载尺码选项失败', 'error')
      }
    },
    
    selectSize(sizeId) {
      this.selectedSize = sizeId
      this.quantity = 1
    },
    
    increaseQuantity() {
      if (this.quantity < this.maxQuantity) {
        this.quantity++
      }
    },
    
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    
    async addToCart() {
      if (!this.selectedSize) {
        this.showMessage('请先选择尺码', 'warning')
        return
      }
      
      if (this.quantity < 1) {
        this.showMessage('购买数量不能少于1', 'warning')
        return
      }
      
      this.loading = true
      
      try {
        // 获取用户信息
        const userStr = localStorage.getItem('user')
        if (!userStr) {
            this.showMessage('请先登录', 'error')
            return
        }
        
        let user
        try {
            // 尝试解析为JSON格式（新格式）
            user = JSON.parse(userStr)
        } catch (e) {
            // 如果解析失败，说明是旧格式（直接存储用户名）
            user = {
                username: userStr,
                id: null // 旧格式没有用户ID
            }
        }
        
        // 兼容 user.id 或 user.userId 两种格式
        const resolvedUserId = Number(user.id || user.userId)
        if (!resolvedUserId) {
            this.showMessage('用户信息不完整，请重新登录', 'error')
            return
        }
        
        // 设置购物车管理器的用户ID
        cartManager.setUserId(resolvedUserId)
        
        // 调用购物车管理器加入购物车
        console.log('=== 加入购物车调试信息 ===')
        console.log('用户信息:', user)
        console.log('选择的尺码ID:', this.selectedSize)
        console.log('购买数量:', this.quantity)
        console.log('商品信息:', this.product)
        console.log('商品ID:', this.product.id)
        console.log('商品shoeId:', this.product.shoeId)
        
        // 确保参数完整性
        if (!this.selectedSize || !this.quantity || !this.product.id) {
          console.error('参数不完整:', {
            selectedSize: this.selectedSize,
            quantity: this.quantity,
            productId: this.product.id
          })
          this.showMessage('商品信息不完整，请刷新页面重试', 'error')
          return
        }
        
        const success = await cartManager.addToCart(this.selectedSize, this.quantity, this.product.id)
        
        console.log('加入购物车结果:', success)
        
        if (success) {
          this.showMessage('成功加入购物车！', 'success')
          // 使用购物车管理器触发更新
          cartManager.triggerUpdate()
          // 刷新购物车数量显示
          await cartManager.refreshCartCount()
          this.showCartSuccess = true // 显示成功提示
          setTimeout(() => {
            this.showCartSuccess = false
          }, 3000) // 3秒后隐藏提示
        } else {
          this.showMessage('加入购物车失败，请重试', 'error')
          console.error('加入购物车失败，API返回false')
        }
      } catch (error) {
        console.error('加入购物车异常:', error)
        let errorMessage = '加入购物车失败，请重试'
        
        // 根据错误类型提供更具体的错误信息
        if (error.response) {
          if (error.response.status === 400) {
            errorMessage = '请求参数错误，请检查商品信息'
          } else if (error.response.status === 500) {
            errorMessage = '服务器内部错误，请稍后重试'
          } else if (error.response.data?.msg) {
            errorMessage = error.response.data.msg
          }
        } else if (error.request) {
          errorMessage = '网络连接失败，请检查网络设置'
        }
        
        this.showMessage(errorMessage, 'error')
      } finally {
        this.loading = false
      }
    },

    // 工具函数
    formatDate(date) {
      const d = new Date(date)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    },
    addDays(date, days) {
      const d = new Date(date)
      d.setDate(d.getDate() + days)
      return d
    },
    generateOrderNumber() {
      // 生成不超过 9 位的整型订单号，避免数据库 INT 溢出
      const base = Math.floor(Date.now() / 1000) % 100000000 // 0-8 位
      const rand = Math.floor(Math.random() * 900) + 100     // 3 位
      return String(base * 1000 + rand)                      // 最多 11 位字符串；DB 按 INT 存储也不会超 2,147,483,647
    },
    
    // 更新购物车数量显示
    async updateCartCount() {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          let user
          try {
            user = JSON.parse(userStr)
          } catch (e) {
            return
          }
          
          if (user.id) {
            const response = await OrderAPI.getCartOrders(user.id)
            if (response.data?.code === 200) {
              const cartCount = response.data.data?.length || 0
              // 触发全局事件更新购物车数量
              this.$emit('cart-updated', cartCount)
            }
          }
        }
      } catch (error) {
        console.error('更新购物车数量失败:', error)
      }
    },
    
    buyNow() {
      if (!this.selectedSize) {
        this.showMessage('请先选择尺码', 'warning')
        return
      }
      
      this.$router.push({
        name: 'OrderConfirmation',
        query: {
          productId: this.product.id,
          sizeId: this.selectedSize,
          quantity: this.quantity
        }
      })
    },
    
    getProductImage() {
      return this.product.images && this.product.images.length > 0 
        ? this.product.images[0] 
        : '/src/assets/logo.png'
    },
    
    handleImageError(event) {
      event.target.src = '/src/assets/logo.png'
    },
    
    showMessage(message, type = 'info') {
      const messageDiv = document.createElement('div')
      messageDiv.className = `message message-${type}`
      messageDiv.textContent = message
      messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 10px 20px;
        border-radius: 4px;
        color: white;
        z-index: 9999;
        font-size: 14px;
      `
      
      if (type === 'success') {
        messageDiv.style.backgroundColor = '#52c41a'
      } else if (type === 'warning') {
        messageDiv.style.backgroundColor = '#faad14'
      } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#ff4d4f'
      } else {
        messageDiv.style.backgroundColor = '#1890ff'
      }
      
      document.body.appendChild(messageDiv)
      
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.parentNode.removeChild(messageDiv)
        }
      }, 3000)
    },

    initCartManager() {
      // 初始化购物车管理器，设置用户ID
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user.id) {
            cartManager.setUserId(user.id)
            // 加载购物车数量
            this.loadCartCount()
          }
        } catch (e) {
          console.error('解析用户信息失败:', e)
        }
      }
    },
    
    async loadCartCount() {
      try {
        if (cartManager.userId) {
          await cartManager.loadCartItemCount()
          this.cartItemCount = cartManager.cartItemCount
        }
      } catch (error) {
        console.error('加载购物车数量失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}

.product-container {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.product-images {
  flex: 1;
}

.main-image {
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}

.main-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.product-id {
  color: #666;
  margin-bottom: 20px;
}

.pricing {
  margin-bottom: 20px;
}

.current-price {
  font-size: 24px;
  color: #ff4d4f;
  font-weight: bold;
  margin-bottom: 5px;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 16px;
}

.points, .sales {
  color: #666;
  margin-bottom: 15px;
  font-size: 14px;
}

.size-selection, .quantity-selection {
  margin-bottom: 25px;
}

.size-selection h3, .quantity-selection h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
}

.size-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.size-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.size-btn:hover {
  border-color: #1890ff;
}

.size-btn.selected {
  background: #1890ff;
  color: white;
  border-color: #1890ff;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.btn-quantity {
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.quantity-input {
  width: 60px;
  height: 32px;
  text-align: center;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.stock-info {
  color: #666;
  font-size: 12px;
}

.product-tags {
  margin-bottom: 25px;
}

.tag {
  display: inline-block;
  padding: 4px 8px;
  background: #f0f0f0;
  color: #666;
  border-radius: 4px;
  margin-right: 8px;
  font-size: 12px;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.btn-add-cart, .btn-buy-now {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-cart {
  background: #52c41a;
  color: white;
}

.btn-add-cart:hover {
  background: #389e0d;
}

.btn-buy-now {
  background: #ff4d4f;
  color: white;
}

.btn-buy-now:hover {
  background: #cf1322;
}

.cart-status {
  margin-top: 20px;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 10px;
}

.view-cart-link {
  color: #1890ff;
  text-decoration: none;
}

.view-cart-link:hover {
  text-decoration: underline;
}

.cart-success {
  margin-top: 20px;
  font-size: 14px;
  color: #52c41a;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f0f9eb;
  padding: 10px 20px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .product-container {
    flex-direction: column;
    gap: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
