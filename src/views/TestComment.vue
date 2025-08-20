<template>
  <div class="test-comment-page">
    <div class="page-header">
      <h2>评论功能测试页面</h2>
      <p>用于测试评论组件的各项功能</p>
    </div>
    
    <div class="test-section">
      <h3>测试评论组件</h3>
      <p>商品ID: {{ testShoeId }}</p>
      
      <!-- 评论组件 -->
      <ProductComment :shoeId="testShoeId" />
    </div>
    
    <div class="test-controls">
      <h3>测试控制</h3>
      <div class="control-group">
        <label>测试商品ID:</label>
        <input v-model="testShoeId" type="number" min="1" class="test-input" />
        <button @click="refreshComment" class="btn btn-primary">刷新评论</button>
      </div>
      
      <div class="control-group">
        <button @click="goBack" class="btn btn-secondary">返回</button>
      </div>
    </div>
  </div>
</template>

<script>
import ProductComment from '@/components/ProductComment.vue'

export default {
  name: 'TestComment',
  components: {
    ProductComment
  },
  data() {
    return {
      testShoeId: 1 // 默认测试商品ID
    }
  },
  methods: {
    refreshComment() {
      // 强制刷新评论组件
      this.$forceUpdate()
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.test-comment-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #111111;
  font-size: 1.8rem;
}

.page-header p {
  margin: 0;
  color: #666666;
  font-size: 1rem;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e6e6e6;
}

.test-section h3 {
  margin: 0 0 15px 0;
  color: #111111;
  font-size: 1.3rem;
}

.test-section p {
  margin: 0 0 20px 0;
  color: #666666;
  font-size: 0.9rem;
}

.test-controls {
  padding: 20px;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
}

.test-controls h3 {
  margin: 0 0 20px 0;
  color: #111111;
  font-size: 1.3rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.control-group label {
  font-weight: 600;
  color: #111111;
  min-width: 100px;
}

.test-input {
  padding: 8px 12px;
  border: 1px solid #e6e6e6;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 100px;
}

.test-input:focus {
  outline: none;
  border-color: #111111;
  box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.1);
}

.btn {
  border: 2px solid #111111;
  background: transparent;
  color: #111111;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn:hover {
  background: #111111;
  color: #fff;
  transform: translateY(-1px);
}

.btn-primary {
  background: #111111;
  color: #fff;
}

.btn-primary:hover {
  background: #000;
}

.btn-secondary {
  background: transparent;
  color: #111111;
}

@media (max-width: 768px) {
  .test-comment-page {
    padding: 16px;
  }
  
  .control-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .test-input {
    width: 100%;
    max-width: 200px;
  }
}
</style>
