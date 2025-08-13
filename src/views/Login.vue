<template>
    <div class="login">
        <div class="login-container">
            <div class="login-card">
                <h2>用户登录</h2>
                <form @submit.prevent="handleLogin" class="login-form">
                    <div class="form-group">
                        <label for="username">用户名</label>
                        <input id="username" v-model="loginForm.username" type="text" placeholder="请输入用户名" required>
                    </div>
                    <div class="form-group">
                        <label for="password">密码</label>
                        <input id="password" v-model="loginForm.password" type="password" placeholder="请输入密码" required>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" v-model="loginForm.remember">
                            记住我
                        </label>
                    </div>
                    <button type="submit" class="btn-login" :disabled="isLoading">
                        {{ isLoading ? '登录中...' : '登录' }}
                    </button>
                </form>
                <div class="login-footer">
                    <p>还没有账号？<a href="#" @click="handleRegister">立即注册</a></p>
                    <router-link to="/" class="back-home">返回首页</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Login-Page',
    data() {
        return {
            loginForm: {
                username: '',
                password: '',
                remember: false
            },
            isLoading: false
        }
    },
    methods: {
        async handleLogin() {
            if (!this.loginForm.username || !this.loginForm.password) {
                alert('请填写完整的登录信息')
                return
            }

            this.isLoading = true

            // 模拟登录请求
            setTimeout(() => {
                // 简单的登录验证（实际项目中应该调用API）
                if (this.loginForm.username && this.loginForm.password) {
                    const userData = {
                        username: this.loginForm.username,
                        loginTime: new Date().toISOString()
                    }

                    localStorage.setItem('user', JSON.stringify(userData))
                    alert('登录成功！')
                    this.$router.push('/home')
                } else {
                    alert('用户名或密码错误')
                }
                this.isLoading = false
            }, 1000)
        },

        handleRegister() {
            alert('注册功能暂未开放')
        }
    }
}
</script>

<style scoped>
.login {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.login-container {
    width: 100%;
    max-width: 400px;
}

.login-card {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.login-card h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #2c3e50;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #2c3e50;
}

.form-group input[type="text"],
.form-group input[type="password"] {
    padding: 0.75rem;
    border: 2px solid #e1e8ed;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s;
}

.form-group input[type="text"]:focus,
.form-group input[type="password"]:focus {
    outline: none;
    border-color: #3498db;
}

.form-group label:has(input[type="checkbox"]) {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
}

.form-group input[type="checkbox"] {
    width: auto;
}

.btn-login {
    background-color: #3498db;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-top: 1rem;
}

.btn-login:hover:not(:disabled) {
    background-color: #2980b9;
}

.btn-login:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
}

.login-footer {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid #e1e8ed;
}

.login-footer p {
    margin-bottom: 0.5rem;
}

.login-footer a {
    color: #3498db;
    text-decoration: none;
}

.login-footer a:hover {
    text-decoration: underline;
}

.back-home {
    display: inline-block;
    margin-top: 0.5rem;
    color: #7f8c8d !important;
    font-size: 0.9rem;
}
</style>
