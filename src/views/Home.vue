<template>
    <div class="home">
        <header class="header">
            <div class="container">
                <h1 class="logo">鞋之城</h1>
                <nav class="nav">
                    <router-link to="/product-list" class="nav-link">产品列表</router-link>
                    <router-link to="/men-shoes" class="nav-link">男鞋</router-link>
                    <router-link to="/women-shoes" class="nav-link">女鞋</router-link>
                    <router-link to="/kids-shoes" class="nav-link">童鞋</router-link>
                    <router-link to="/profile" class="nav-link">个人中心</router-link>
                    <router-link to="/login" class="nav-link">登录</router-link>
                </nav>
            </div>
        </header>

        <main class="main">
            <section class="hero">
                <div class="hero-content">
                    <h2>欢迎来到鞋之城</h2>
                    <p>发现最新款式，找到您的完美鞋履</p>
                    <div class="hero-buttons">
                        <router-link to="/product-list" class="btn btn-primary">查看所有产品</router-link>
                        <router-link to="/men-shoes" class="btn btn-primary">男鞋专区</router-link>
                        <router-link to="/women-shoes" class="btn btn-primary">女鞋专区</router-link>
                        <router-link to="/kids-shoes" class="btn btn-primary">童鞋专区</router-link>
                    </div>
                </div>
            </section>

            <section class="featured">
                <div class="container">
                    <h3>热门分类</h3>
                    <div class="category-grid">
                        <div class="category-card">
                            <h4>运动鞋</h4>
                            <p>舒适透气，运动首选</p>
                        </div>
                        <div class="category-card">
                            <h4>休闲鞋</h4>
                            <p>日常穿搭，时尚百搭</p>
                        </div>
                        <div class="category-card">
                            <h4>正装鞋</h4>
                            <p>商务场合，精致典雅</p>
                        </div>
                        <div class="category-card">
                            <h4>靴子</h4>
                            <p>保暖时尚，季节必备</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script>
export default {
    name: 'HomePage',
    mounted() {
        console.log('主页加载完成')
    }
}
</script>

<style scoped>
.home {
    min-height: 100vh;
}

.header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem 0;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.8rem;
    font-weight: bold;
    margin: 0;
}

.nav {
    display: flex;
    gap: 2rem;
}

.nav-link {
    color: white;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
    background-color: #34495e;
}

.hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 0;
    text-align: center;
}

.hero-content h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.hero-content p {
    font-size: 1.2rem;
    margin-bottom: 2rem;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    padding: 0.75rem 1.5rem;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 500;
    transition: transform 0.2s;
}

.btn:hover {
    transform: translateY(-2px);
}

.btn-primary {
    background-color: #3498db;
    color: white;
}

.featured {
    padding: 4rem 0;
    background-color: #f8f9fa;
}

.featured h3 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #2c3e50;
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
}

.category-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
}

.category-card:hover {
    transform: translateY(-5px);
}

.category-card h4 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: #2c3e50;
}

.category-card p {
    color: #7f8c8d;
}
</style>
