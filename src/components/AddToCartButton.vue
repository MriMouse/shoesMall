<template>
  <div class="add-to-cart-container">
    <div class="quantity-selector">
      <label>数量:</label>
      <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
      <span class="quantity">{{ quantity }}</span>
      <button @click="increaseQuantity" :disabled="quantity >= maxQuantity">+</button>
    </div>
    
    <div class="size-selector" v-if="sizes && sizes.length > 0">
      <label>尺码:</label>
      <select v-model="selectedSizeId" @change="onSizeChange">
        <option value="">请选择尺码</option>
        <option v-for="size in sizes" :key="size.sizeId" :value="size.sizeId">
          {{ size.size }}码
        </option>
      </select>
    </div>
    
    <div class="action-buttons">
      <button 
        class="add-to-cart-btn" 
        @click="addToCart"
        :disabled="!canAddToCart || isAdding"
      >
        {{ isAdding ? '添加中...' : '加入购物车' }}
      </button>
      
      <button 
        class="buy-now-btn" 
        @click="buyNow"
        :disabled="!canBuyNow || isBuying"
      >
        {{ isBuying ? '购买中...' : '立即购买' }}
      </button>
    </div>
    
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script>
import cartManager from '../utils/cart'
import userManager from '../utils/userManager'

export default {
  name: 'AddToCartButton',
  props: {
    shoeId: {
      type: Number,
      required: true
    },
    sizes: {
      type: Array,
      default: () => []
    },
    maxQuantity: {
      type: Number,
      default: 99
    }
  },
  data() {
    return {
      quantity: 1,
      selectedSizeId: '',
      isAdding: false,
      isBuying: false,
      message: '',
      messageType: 'info' // 'info', 'success', 'error'
    }
  },
  computed: {
    canAddToCart() {
      return this.selectedSizeId && this.quantity > 0 && userManager.isLoggedIn()
    },
    canBuyNow() {
      return this.canAddToCart
    }
  },
  methods: {
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--
      }
    },
    increaseQuantity() {
      if (this.quantity < this.maxQuantity) {
        this.quantity++
      }
    },
    onSizeChange() {
      this.clearMessage()
    },
    clearMessage() {
      this.message = ''
      this.messageType = 'info'
    },
    showMessage(text, type = 'info') {
      this.message = text
      this.messageType = type
      // 3秒后自动清除消息
      setTimeout(() => {
        this.clearMessage()
      }, 3000)
    },
    async addToCart() {
      if (!this.canAddToCart) {
        if (!userManager.isLoggedIn()) {
          this.showMessage('请先登录后再添加商品到购物车', 'error')
          return
        }
        if (!this.selectedSizeId) {
          this.showMessage('请选择商品尺码', 'error')
          return
        }
        return
      }

      this.isAdding = true
      this.clearMessage()

      try {
        const result = await cartManager.addToCart(
          this.selectedSizeId,
          this.quantity,
          this.shoeId
        )

        if (result) {
          this.showMessage('商品已成功添加到购物车！', 'success')
          // 触发购物车更新事件
          this.$emit('cart-updated')
        } else {
          this.showMessage('添加购物车失败，请重试', 'error')
        }
      } catch (error) {
        console.error('添加购物车失败:', error)
        this.showMessage('添加购物车失败: ' + error.message, 'error')
      } finally {
        this.isAdding = false
      }
    },
    async buyNow() {
      if (!this.canBuyNow) {
        if (!userManager.isLoggedIn()) {
          this.showMessage('请先登录后再购买商品', 'error')
          return
        }
        if (!this.selectedSizeId) {
          this.showMessage('请选择商品尺码', 'error')
          return
        }
        return
      }

      this.isBuying = true
      this.clearMessage()

      try {
        // 先添加到购物车
        const result = await cartManager.addToCart(
          this.selectedSizeId,
          this.quantity,
          this.shoeId
        )

        if (result) {
          this.showMessage('商品已添加到购物车，正在跳转到结算页面...', 'success')
          // 跳转到购物车页面进行结算
          this.$router.push('/cart')
        } else {
          this.showMessage('添加购物车失败，请重试', 'error')
        }
      } catch (error) {
        console.error('购买失败:', error)
        this.showMessage('购买失败: ' + error.message, 'error')
      } finally {
        this.isBuying = false
      }
    }
  },
  mounted() {
    // 如果有默认尺码，自动选择
    if (this.sizes && this.sizes.length > 0) {
      this.selectedSizeId = this.sizes[0].sizeId
    }
  }
}
</script>

<style scoped>
.add-to-cart-container {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.quantity-selector {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.quantity-selector label {
  margin-right: 10px;
  font-weight: bold;
}

.quantity-selector button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  font-size: 16px;
}

.quantity-selector button:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.quantity {
  margin: 0 15px;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.size-selector {
  margin-bottom: 20px;
}

.size-selector label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.size-selector select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.add-to-cart-btn,
.buy-now-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-to-cart-btn {
  background-color: #ff6b35;
  color: white;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #e55a2b;
}

.buy-now-btn {
  background-color: #28a745;
  color: white;
}

.buy-now-btn:hover:not(:disabled) {
  background-color: #218838;
}

.add-to-cart-btn:disabled,
.buy-now-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.message {
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
}

.message.info {
  background-color: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
