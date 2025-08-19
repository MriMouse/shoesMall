<template>
  <div class="optimized-image-container" :class="{ 'loading': loading, 'error': hasError }">
    <!-- 加载状态 -->
    <div v-if="loading" class="image-loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">{{ loadingText }}</span>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="hasError" class="image-error" @click="retryLoad">
      <div class="error-icon">⚠️</div>
      <span class="error-text">{{ errorText }}</span>
      <button class="retry-btn">重试</button>
    </div>
    
    <!-- 图片容器 -->
    <div v-else class="image-wrapper" :style="imageStyle">
      <!-- 实际图片 -->
      <img
        v-if="imageSrc"
        :src="imageSrc"
        :alt="alt"
        :class="imageClass"
        @load="handleImageLoad"
        @error="handleImageError"
        @click="$emit('click', $event)"
        :style="customStyle"
      />
      
      <!-- 占位符 -->
      <div v-else class="image-placeholder">
        <div class="placeholder-icon">📷</div>
        <span class="placeholder-text">{{ placeholderText }}</span>
      </div>
    </div>
    
    <!-- 图片切换控制 -->
    <div v-if="showControls && images && images.length > 1" class="image-controls">
      <button 
        class="control-btn prev" 
        @click="previousImage"
        :disabled="currentIndex <= 0"
        :title="`上一张 (${currentIndex + 1}/${images.length})`"
      >
        ‹
      </button>
      <span class="image-counter">{{ currentIndex + 1 }}/{{ images.length }}</span>
      <button 
        class="control-btn next" 
        @click="nextImage"
        :disabled="currentIndex >= images.length - 1"
        :title="`下一张 (${currentIndex + 1}/${images.length})`"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { imageCache, imagePreloader, imageUtils } from '@/utils/imageOptimizer'

// Props
const props = defineProps({
  // 图片源
  src: {
    type: String,
    default: ''
  },
  // 图片列表（用于多图切换）
  images: {
    type: Array,
    default: () => []
  },
  // 初始图片索引
  initialIndex: {
    type: Number,
    default: 0
  },
  // 图片描述
  alt: {
    type: String,
    default: '图片'
  },
  // 自定义样式
  customStyle: {
    type: Object,
    default: () => ({})
  },
  // 图片类名
  imageClass: {
    type: String,
    default: ''
  },
  // 是否显示控制按钮
  showControls: {
    type: Boolean,
    default: false
  },
  // 加载文本
  loadingText: {
    type: String,
    default: '加载中...'
  },
  // 错误文本
  errorText: {
    type: String,
    default: '加载失败'
  },
  // 占位符文本
  placeholderText: {
    type: String,
    default: '暂无图片'
  },
  // 是否懒加载
  lazy: {
    type: Boolean,
    default: true
  },
  // 懒加载阈值
  threshold: {
    type: Number,
    default: 0.1
  },
  // 懒加载边距
  rootMargin: {
    type: String,
    default: '100px 0px'
  },
  // 是否预加载
  preload: {
    type: Boolean,
    default: true
  },
  // 预加载优先级
  preloadPriority: {
    type: String,
    default: 'normal',
    validator: (value) => ['low', 'normal', 'high'].includes(value)
  },
  // 图片尺寸
  width: {
    type: [Number, String],
    default: 'auto'
  },
  height: {
    type: [Number, String],
    default: 'auto'
  },
  // 图片填充模式
  objectFit: {
    type: String,
    default: 'cover',
    validator: (value) => ['fill', 'contain', 'cover', 'none', 'scale-down'].includes(value)
  }
})

// Emits
const emit = defineEmits(['load', 'error', 'click', 'imageChange'])

// 响应式数据
const loading = ref(false)
const hasError = ref(false)
const imageSrc = ref('')
const currentIndex = ref(props.initialIndex)
const observer = ref(null)
const isIntersecting = ref(false)

// 计算属性
const imageStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  objectFit: props.objectFit
}))

const currentImage = computed(() => {
  if (props.images && props.images.length > 0) {
    return props.images[currentIndex.value]
  }
  return null
})

// 方法
const loadImage = async () => {
  if (!props.src && (!props.images || props.images.length === 0)) {
    hasError.value = true
    return
  }

  loading.value = true
  hasError.value = false

  try {
    let src = ''
    
    if (props.images && props.images.length > 0) {
      // 多图模式
      const image = props.images[currentIndex.value]
      if (image && image.imagePath) {
        src = `/api/shoeImg/getImage/${image.imagePath}`
      }
    } else if (props.src) {
      // 单图模式
      src = props.src
    }

    if (!src) {
      throw new Error('无效的图片源')
    }

    // 检查缓存
    if (imageCache.has(src)) {
      imageSrc.value = src
      loading.value = false
      emit('load', { src, index: currentIndex.value })
      return
    }

    // 加载图片
    await imageUtils.isImageLoaded(src)
    
    // 缓存图片
    imageCache.set(src, true)
    
    imageSrc.value = src
    loading.value = false
    emit('load', { src, index: currentIndex.value })

    // 预加载下一张图片
    if (props.preload && props.images && props.images.length > 1) {
      const nextIndex = (currentIndex.value + 1) % props.images.length
      const nextImage = props.images[nextIndex]
      if (nextImage && nextImage.imagePath) {
        const nextSrc = `/api/shoeImg/getImage/${nextImage.imagePath}`
        imagePreloader.preloadImage(nextSrc, props.preloadPriority)
      }
    }

  } catch (error) {
    console.error('图片加载失败:', error)
    hasError.value = true
    loading.value = false
    emit('error', error)
  }
}

const handleImageLoad = (event) => {
  emit('load', { 
    src: event.target.src, 
    index: currentIndex.value,
    event 
  })
}

const handleImageError = (event) => {
  hasError.value = true
  emit('error', new Error('图片加载失败'), event)
}

const retryLoad = () => {
  loadImage()
}

const nextImage = () => {
  if (props.images && props.images.length > 1 && currentIndex.value < props.images.length - 1) {
    currentIndex.value++
    emit('imageChange', currentIndex.value)
    loadImage()
  }
}

const previousImage = () => {
  if (props.images && props.images.length > 1 && currentIndex.value > 0) {
    currentIndex.value--
    emit('imageChange', currentIndex.value)
    loadImage()
  }
}

const goToImage = (index) => {
  if (props.images && index >= 0 && index < props.images.length) {
    currentIndex.value = index
    emit('imageChange', currentIndex.value)
    loadImage()
  }
}

// 懒加载观察器
const initObserver = () => {
  if (!props.lazy) return

  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isIntersecting.value = true
          loadImage()
          if (observer.value) {
            observer.value.unobserve(entry.target)
          }
        }
      })
    },
    {
      threshold: props.threshold,
      rootMargin: props.rootMargin
    }
  )

  // 观察当前元素
  nextTick(() => {
    const element = document.querySelector('.optimized-image-container')
    if (element && observer.value) {
      observer.value.observe(element)
    }
  })
}

// 监听器
watch(() => props.src, () => {
  if (!props.lazy || isIntersecting.value) {
    loadImage()
  }
})

watch(() => props.images, () => {
  if (!props.lazy || isIntersecting.value) {
    loadImage()
  }
}, { deep: true })

watch(() => props.initialIndex, (newIndex) => {
  currentIndex.value = newIndex
  if (!props.lazy || isIntersecting.value) {
    loadImage()
  }
})

// 生命周期
onMounted(() => {
  if (!props.lazy) {
    loadImage()
  } else {
    initObserver()
  }
})

onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})

// 暴露方法
defineExpose({
  loadImage,
  nextImage,
  previousImage,
  goToImage,
  retryLoad
})
</script>

<style scoped>
.optimized-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f8f9fa;
  border-radius: 4px;
}

.image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.optimized-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.image-loading {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

.loading-text {
  font-size: 0.8rem;
  color: #999;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #dc3545;
  cursor: pointer;
  transition: background-color 0.2s;
}

.image-error:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.error-text {
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.retry-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #c82333;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.placeholder-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.placeholder-text {
  font-size: 0.8rem;
  color: #666;
}

.image-controls {
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

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  padding: 2px 6px;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.image-counter {
  color: white;
  font-size: 0.7rem;
  padding: 0 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-controls {
    bottom: 4px;
    right: 4px;
    padding: 2px;
  }
  
  .control-btn {
    font-size: 14px;
    padding: 1px 4px;
  }
  
  .image-counter {
    font-size: 0.6rem;
  }
}
</style>
