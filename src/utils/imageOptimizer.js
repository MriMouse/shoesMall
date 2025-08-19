/**
 * 图片优化工具
 * 提供图片压缩、缓存、预加载等功能
 */

// 图片缓存系统
class ImageCache {
    constructor(maxSize = 100) {
        this.cache = new Map()
        this.maxSize = maxSize
        this.accessOrder = []
    }

    // 获取缓存的图片
    get(key) {
        if (this.cache.has(key)) {
            // 更新访问顺序
            const index = this.accessOrder.indexOf(key)
            if (index > -1) {
                this.accessOrder.splice(index, 1)
            }
            this.accessOrder.push(key)
            return this.cache.get(key)
        }
        return null
    }

    // 设置缓存的图片
    set(key, value) {
        if (this.cache.has(key)) {
            // 更新访问顺序
            const index = this.accessOrder.indexOf(key)
            if (index > -1) {
                this.accessOrder.splice(index, 1)
            }
        }

        // 如果缓存已满，移除最久未使用的项
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.accessOrder.shift()
            if (oldestKey) {
                this.cache.delete(oldestKey)
            }
        }

        this.cache.set(key, value)
        this.accessOrder.push(key)
    }

    // 检查是否包含某个键
    has(key) {
        return this.cache.has(key)
    }

    // 清除缓存
    clear() {
        this.cache.clear()
        this.accessOrder = []
    }

    // 获取缓存大小
    get size() {
        return this.cache.size
    }
}

// 图片预加载管理器
class ImagePreloader {
    constructor(maxConcurrent = 3) {
        this.maxConcurrent = maxConcurrent
        this.activePreloads = 0
        this.preloadQueue = []
        this.preloadCache = new Set()
    }

    // 预加载图片
    async preloadImage(src, priority = 'normal') {
        // 如果已经预加载过，直接返回
        if (this.preloadCache.has(src)) {
            return Promise.resolve()
        }

        // 高优先级图片直接加载
        if (priority === 'high') {
            return this._loadImage(src)
        }

        // 添加到队列
        this.preloadQueue.push({ src, priority })
        this._processQueue()
        
        // 返回一个Promise，当图片加载完成时resolve
        return new Promise((resolve) => {
            const checkComplete = () => {
                if (this.preloadCache.has(src)) {
                    resolve()
                } else {
                    setTimeout(checkComplete, 100)
                }
            }
            checkComplete()
        })
    }

    // 处理预加载队列
    async _processQueue() {
        if (this.activePreloads >= this.maxConcurrent || this.preloadQueue.length === 0) {
            return
        }

        this.activePreloads++
        const { src } = this.preloadQueue.shift()

        try {
            await this._loadImage(src)
        } catch (error) {
            console.warn(`预加载图片失败: ${src}`, error)
        } finally {
            this.activePreloads--
            this._processQueue()
        }
    }

    // 实际加载图片
    _loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            
            // 设置超时
            const timeout = setTimeout(() => {
                reject(new Error('图片加载超时'))
            }, 10000)

            img.onload = () => {
                clearTimeout(timeout)
                this.preloadCache.add(src)
                resolve()
            }

            img.onerror = () => {
                clearTimeout(timeout)
                reject(new Error('图片加载失败'))
            }

            img.src = src
        })
    }

    // 批量预加载
    async preloadImages(imageList, priority = 'normal') {
        const promises = imageList.map(src => this.preloadImage(src, priority))
        return Promise.allSettled(promises)
    }

    // 清除预加载缓存
    clearCache() {
        this.preloadCache.clear()
    }
}

// 图片压缩工具
class ImageCompressor {
    constructor() {
        this.canvas = document.createElement('canvas')
        this.ctx = this.canvas.getContext('2d')
    }

    // 压缩图片
    async compressImage(file, options = {}) {
        const {
            maxWidth = 800,
            maxHeight = 600,
            quality = 0.8,
            format = 'jpeg'
        } = options

        return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => {
                // 计算新的尺寸
                let { width, height } = img
                
                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }
                
                if (height > maxHeight) {
                    width = (width * maxHeight) / height
                    height = maxHeight
                }

                // 设置canvas尺寸
                this.canvas.width = width
                this.canvas.height = height

                // 绘制图片
                this.ctx.drawImage(img, 0, 0, width, height)

                // 转换为blob
                this.canvas.toBlob(
                    (blob) => {
                        resolve(blob)
                    },
                    `image/${format}`,
                    quality
                )
            }
            img.src = URL.createObjectURL(file)
        })
    }

    // 调整图片尺寸
    async resizeImage(src, width, height) {
        return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => {
                this.canvas.width = width
                this.canvas.height = height
                this.ctx.drawImage(img, 0, 0, width, height)
                
                this.canvas.toBlob((blob) => {
                    resolve(blob)
                }, 'image/jpeg', 0.8)
            }
            img.src = src
        })
    }
}

// 图片懒加载观察器
class LazyImageObserver {
    constructor(options = {}) {
        this.options = {
            rootMargin: '100px 0px',
            threshold: 0.1,
            ...options
        }
        this.observer = null
        this.observedElements = new Map()
        this.init()
    }

    init() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target
                    const callback = this.observedElements.get(element)
                    
                    if (callback) {
                        callback(element)
                        this.unobserve(element)
                    }
                }
            })
        }, this.options)
    }

    // 观察元素
    observe(element, callback) {
        this.observedElements.set(element, callback)
        this.observer.observe(element)
    }

    // 停止观察元素
    unobserve(element) {
        this.observedElements.delete(element)
        this.observer.unobserve(element)
    }

    // 断开观察器
    disconnect() {
        this.observer.disconnect()
        this.observedElements.clear()
    }
}

// 创建全局实例
export const imageCache = new ImageCache(200)
export const imagePreloader = new ImagePreloader(5)
export const imageCompressor = new ImageCompressor()
export const lazyImageObserver = new LazyImageObserver()

// 工具函数
export const imageUtils = {
    // 获取图片的合适尺寸
    getOptimalImageSize(originalWidth, originalHeight, maxWidth = 800, maxHeight = 600) {
        let { width, height } = { width: originalWidth, height: originalHeight }
        
        if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
        }
        
        if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
        }
        
        return { width: Math.round(width), height: Math.round(height) }
    },

    // 生成图片占位符
    generatePlaceholder(width, height, text = '图片加载中...') {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#f8f9fa'
        ctx.fillRect(0, 0, width, height)
        
        ctx.fillStyle = '#666'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, width / 2, height / 2)
        
        return canvas.toDataURL()
    },

    // 检查图片是否已加载
    isImageLoaded(src) {
        return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => resolve(true)
            img.onerror = () => resolve(false)
            img.src = src
        })
    },

    // 预加载关键图片
    async preloadCriticalImages(imageList) {
        return imagePreloader.preloadImages(imageList, 'high')
    },

    // 批量预加载图片
    async preloadImages(imageList) {
        return imagePreloader.preloadImages(imageList, 'normal')
    }
}

// 默认导出
export default {
    ImageCache,
    ImagePreloader,
    ImageCompressor,
    LazyImageObserver,
    imageCache,
    imagePreloader,
    imageCompressor,
    lazyImageObserver,
    imageUtils
}
