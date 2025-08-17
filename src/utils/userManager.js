import axios from 'axios'

class UserManager {
    constructor() {
        this.currentUser = null
        this.userId = null
    }

    // 获取当前登录用户信息
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user')
            if (!userStr) return null
            
            // 尝试解析JSON
            let parsed
            try {
                parsed = JSON.parse(userStr)
                // 如果解析成功且是对象，返回对象
                if (typeof parsed === 'object' && parsed !== null) {
                    return parsed
                }
                // 如果解析成功但不是对象（比如数字），当作字符串处理
                return { username: String(parsed) }
            } catch (e) {
                // 如果解析失败，说明存储的是用户名字符串
                return userStr
            }
        } catch (e) {
            console.warn('获取当前用户信息失败:', e)
            return null
        }
    }

    // 设置当前用户
    setCurrentUser(user) {
        this.currentUser = user
        this.userId = user?.id || user?.userId
        localStorage.setItem('user', JSON.stringify(user))
    }

    // 获取当前用户名
    getCurrentUsername() {
        const user = this.getCurrentUser()
        // 如果user是字符串，直接返回；如果是对象，返回username
        if (typeof user === 'string') {
            return user
        }
        return user?.username || null
    }

    // 检查用户是否已登录
    isLoggedIn() {
        const user = this.getCurrentUser()
        // 如果user是字符串（用户名），说明已登录
        if (typeof user === 'string' && user.trim()) {
            return true
        }
        // 如果user是对象且有username，说明已登录
        return !!(user && user.username)
    }

    // 根据用户名获取用户ID（直接调用后端API）
    async getUserIdByUsername(username) {
        if (!username) {
            console.error('用户名不能为空')
            return null
        }

        try {
            console.log('正在通过用户名获取用户ID:', username)
            
            // 先预热系统 - 调用getAllUsers接口
            try {
                console.log('预热系统 - 调用getAllUsers接口...')
                await axios.post('http://localhost:8081/users/getAllUsers', {}, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
                console.log('系统预热成功')
            } catch (preheatError) {
                console.warn('系统预热失败，但继续尝试获取用户ID:', preheatError.message)
            }
            
            console.log('调用API: /users/getUserIdByUsername')
            console.log('参数:', { username })
            
            const params = new URLSearchParams({ username })
            const response = await axios.post('http://localhost:8081/users/getUserIdByUsername', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            console.log('获取用户ID响应:', response)
            console.log('响应状态码:', response.status)
            console.log('响应数据:', response.data)
            
            if (response.data && response.data.code === 200 && response.data.data) {
                const userId = Number(response.data.data)
                console.log('成功获取用户ID:', userId, '用户名:', username)
                return userId
            } else {
                console.warn('获取用户ID失败:', response.data?.msg)
                console.warn('响应码:', response.data?.code)
                return null
            }
        } catch (error) {
            console.error('获取用户ID异常:', error)
            console.error('错误类型:', error.constructor.name)
            console.error('错误消息:', error.message)
            
            if (error.response) {
                console.error('错误响应状态码:', error.response.status)
                console.error('错误响应数据:', error.response.data)
            } else if (error.request) {
                console.error('网络请求失败:', error.request)
            } else {
                console.error('请求配置错误:', error.message)
            }
            
            return null
        }
    }

    // 获取用户ID（优先使用缓存，如果没有则从服务器获取）
    async getUserId() {
        // 如果已经有用户ID且不是默认值，直接返回
        if (this.userId && this.userId !== 1) {
            return this.userId
        }

        const username = this.getCurrentUsername()
        if (!username) {
            console.error('未找到用户名，请先登录')
            return null
        }

        // 添加重试机制
        const maxRetries = 3
        let lastError = null

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`尝试获取用户ID (第${attempt}次):`, username)
                
                const userId = await this.getUserIdByUsername(username)
                if (userId) {
                    this.userId = userId
                    console.log('成功获取用户ID:', userId)
                    
                    // 更新本地存储的用户信息
                    const currentUser = this.getCurrentUser()
                    if (currentUser) {
                        // 如果currentUser是字符串，转换为对象
                        const userObj = typeof currentUser === 'string' 
                            ? { username: currentUser, id: userId }
                            : { ...currentUser, id: userId }
                        this.setCurrentUser(userObj)
                    }
                    return userId
                } else {
                    console.warn(`第${attempt}次获取用户ID失败，用户名:`, username)
                    if (attempt < maxRetries) {
                        // 等待一段时间后重试
                        await new Promise(resolve => setTimeout(resolve, 1000))
                    }
                }
            } catch (error) {
                lastError = error
                console.error(`第${attempt}次获取用户ID异常:`, error.message)
                if (attempt < maxRetries) {
                    // 等待一段时间后重试
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
            }
        }

        console.error('无法获取用户ID，已重试', maxRetries, '次，用户名:', username)
        if (lastError) {
            console.error('最后一次错误:', lastError)
        }
        return null
    }

    // 登录用户
    loginUser(username, userId = null) {
        const user = { username }
        if (userId) {
            user.id = userId
        }
        this.setCurrentUser(user)
        return user
    }

    // 登出用户
    logoutUser() {
        this.currentUser = null
        this.userId = null
        localStorage.removeItem('user')
    }
}

// 创建单例实例
const userManager = new UserManager()

export default userManager
