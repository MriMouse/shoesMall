<template>
  <div class="profile">
    <div class="profile-container">
      <!-- 左侧导航（分组样式，贴合 adidas 账户页） -->
      <div class="profile-sidebar">
        <nav class="side-groups">
          <section class="side-group" v-for="group in sideGroups" :key="group.title">
            <div class="side-title">{{ group.title }}</div>
            <button 
              v-for="item in group.items" 
              :key="item.key"
              class="side-link"
              :class="{ active: activeTab === item.key }"
              @click="navigateTo(item.key)"
            >{{ item.label }}</button>
          </section>
          <section class="side-group">
            <button class="side-link logout" @click="handleLogout">退出账户</button>
          </section>
        </nav>
      </div>

      <div class="profile-main">
        <!-- 顶部结构（问候语 + 会员黑色进度横幅），贴合 adidas 账户页比例 -->
        <div class="profile-header">
          <h1 class="greeting">你好，{{ userName || '会员' }}</h1>
          <div class="header-actions">
            <button class="hero-edit" @click="activeTab='info'">编辑资料</button>
            <button class="hero-logout" @click="handleLogout">退出账户</button>
          </div>
        </div>

        

      <!-- 个人中心概览 -->
      <ProfileOverview 
        v-if="activeTab === 'overview'"
        @navigate="handleNavigation"
      />

      <!-- 个人信息组件 -->
      <UserInfoCard 
        v-if="activeTab === 'info'"
        @user-updated="handleUserUpdated"
      />

      <!-- 订单管理组件 -->
      <OrderManagement 
        v-if="activeTab === 'orders'"
      />

      <!-- 地址管理组件 -->
      <AddressManagement 
        v-if="activeTab === 'address'"
      />

      <!-- 账户设置组件 -->
      <AccountSettings 
        v-if="activeTab === 'settings'"
      />

      </div>
    </div>
  </div>
</template>

<script>
import ProfileOverview from '@/components/profile/ProfileOverview.vue'
import UserInfoCard from '@/components/profile/UserInfoCard.vue'
import OrderManagement from '@/components/profile/OrderManagement.vue'
import AddressManagement from '@/components/profile/AddressManagement.vue'
import AccountSettings from '@/components/profile/AccountSettings.vue'
import userManager from '@/utils/userManager'

export default {
  name: 'Profile-Page',
  components: {
    ProfileOverview,
    UserInfoCard,
    OrderManagement,
    AddressManagement,
    AccountSettings
  },
  data() {
    return {
      activeTab: 'overview',
      sideGroups: [
        {
          title: '个人中心',
          items: [
            { key: 'overview', label: '账户首页' },
            { key: 'info', label: '个人信息' }
          ]
        },
        {
          title: '订单中心',
          items: [
            { key: 'orders', label: '我的订单' }
          ]
        },
        {
          title: '账户设置',
          items: [
            { key: 'settings', label: '账户设置' },
            { key: 'address', label: '地址簿' }
          ]
        }
      ],
      userName: '',
      userPoints: 0,
      availableCoupons: 0,
      exclusiveBenefits: 0,
      avatarPath: '',
      avatarHover: false,
      uploadingHeroAvatar: false
    }
  },
  mounted() {
    // 检查用户是否已登录
    if (!userManager.isLoggedIn()) {
      this.$router.push('/')
      return
    }

    // 初始化横幅信息
    const currentUser = userManager.getCurrentUser()
    const currentUsername = userManager.getCurrentUsername()
    this.userName = (currentUser && currentUser.username) || currentUsername || '会员'
    this.userPoints = (currentUser && (currentUser.integral || 0)) || 0
    this.avatarPath = (currentUser && currentUser.avatarPath) || ''
    // 后端拉取更权威头像路径
    try {
      const username = userManager.getCurrentUsername()
      if (username) {
        import('@/api').then(m => m.UserAPI.getAvatarPath(username)).then(res => {
          if (res.data?.code === 200 && res.data.data) {
            this.avatarPath = res.data.data
          }
        }).catch((e)=>{ console.warn('获取头像路径失败:', e) })
      }
    } catch (e) { console.warn('获取头像路径异常:', e) }
    // 优惠/权益可与后端联动，这里先占位
    this.availableCoupons = 0
    this.exclusiveBenefits = 0
  },
  computed: {
    heroAvatarUrl() {
      if (!this.avatarPath || this.avatarPath === 'default') return ''
      const parts = this.avatarPath.split(/[/\\]/)
      const filename = parts[parts.length - 1]
      return `/api/users/getAvatar/${filename}`
    }
  },
  methods: {
    navigateTo(tab) {
      this.activeTab = tab
    },
    handleNavigation(tab) {
      this.activeTab = tab
    },
    
    handleUserUpdated(user) {
      // 用户信息更新后的处理
      console.log('用户信息已更新:', user)
    },

    handleLogout() {
      if (confirm('确定要退出登录吗？')) {
        userManager.logoutUser()
        this.$router.push('/')
      }
    },
    triggerHeroUpload() {
      if (this.$refs.heroAvatarInput) this.$refs.heroAvatarInput.click()
    },
    async handleHeroAvatarChange(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      this.uploadingHeroAvatar = true
      try {
        const formData = new FormData()
        // 后端要求字段名为 avatar
        formData.append('avatar', file)
        // 直接使用导入的 API 模块
        const { UserAPI } = await import('@/api')
        const uploadRes = await UserAPI.uploadAvatar(formData)
        if (uploadRes.data?.code === 200 && uploadRes.data.data) {
          const data = uploadRes.data.data
          const serverPath = typeof data === 'string' ? data : (data.avatarPath || data.path || '')
          if (!serverPath) throw new Error('返回头像路径为空')
          this.avatarPath = serverPath
          // 更新数据库字段
          let ok = false
          try {
            const userId = await userManager.getUserId()
            if (userId) {
              const { UserAPI } = await import('@/api')
              const resp = await UserAPI.updateAvatarById(userId, serverPath)
              ok = resp.data?.code === 200
            }
          } catch (e) { ok = false }
          if (!ok) {
            const username = userManager.getCurrentUsername()
            if (username) {
              const { UserAPI } = await import('@/api')
              const resp2 = await UserAPI.updateAvatar(username, serverPath)
              ok = resp2.data?.code === 200
            }
          }
          // 同步本地缓存
          const currentUser = userManager.getCurrentUser()
          if (currentUser) userManager.setCurrentUser({ ...currentUser, avatarPath: serverPath })
        } else {
          throw new Error(uploadRes.data?.msg || '上传失败')
        }
      } catch (err) {
        console.error('更换头像失败:', err)
        alert('更换头像失败，请重试')
      } finally {
        this.uploadingHeroAvatar = false
      }
    }
  }
}
</script>

<style scoped>
.profile {
  min-height: 100vh;
  /* 黑白极简主题变量 */
  --bg: #f7f7f7;
  --surface: #ffffff;
  --text: #111111;
  --muted: #666666;
  --border: #e6e6e6;
  --accent: #111111;

  background-color: var(--bg);
  padding: 2rem 0;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 240px 1fr; /* 左侧窄栏 + 右侧主内容 */
  gap: 24px;
  justify-content: center;
}

.profile-sidebar { position: sticky; top: 2rem; height: fit-content; }

.profile-main { display: flex; flex-direction: column; gap: 16px; }

/* 顶部区域（问候语 + 操作） */
.profile-header { display: flex; justify-content: space-between; align-items: center; }
.greeting { font-size: 28px; font-weight: 700; margin: 0; }
.header-actions { display: flex; gap: 12px; }
.hero-edit, .hero-logout { border: 1px solid #111; background: #fff; color: #111; border-radius: 999px; padding: 8px 16px; cursor: pointer; }
.hero-edit:hover, .hero-logout:hover { background: #111; color: #fff; }

/* 会员黑色横幅（比例与留白贴合） */
.adiclub-banner { background: #0a0a0a; color: #fff; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: center; gap: 64px; }
.banner-left { display: flex; align-items: center; }
.progress { position: relative; width: 520px; height: 4px; }
.progress-track { position: absolute; top: 50%; left: 0; right: 0; height: 4px; background: rgba(255,255,255,.2); transform: translateY(-50%); border-radius: 2px; }
.progress-step { position: absolute; top: 50%; width: 10px; height: 10px; background: #fff; border-radius: 50%; transform: translate(-50%, -50%); }
.banner-metrics { display: flex; gap: 64px; }
.b-metric { text-align: center; min-width: 120px; }
.b-value { font-size: 24px; font-weight: 800; }
.b-label { color: #cfcfcf; margin-top: 4px; font-size: 12px; }

/* 左侧导航分组样式 */
.side-groups { display: flex; flex-direction: column; gap: 28px; }
.side-group { border-left: 1px solid #eee; padding-left: 12px; }
.side-title { font-size: 12px; color: #777; letter-spacing: .08em; margin-bottom: 8px; }
.side-link { display: block; width: 100%; text-align: left; background: transparent; border: none; padding: 8px 8px; border-radius: 8px; cursor: pointer; color: #111; font-size: 14px; }
.side-link:hover { background: #f5f5f5; }
.side-link.active { background: #111; color: #fff; }
.side-link.logout { border: 1px solid #111; border-radius: 999px; text-align: center; margin-top: 4px; }
.hidden-input { display: none; }

/* 顶部黑底会员横幅 */
.account-hero {
  background: #0a0a0a;
  color: #fff;
  border-radius: 14px;
  padding: 18px 20px;
}
.account-hero .hero-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.account-hero .hero-left { display:flex; align-items:center; gap:14px; }
.hero-avatar { position: relative; width: 54px; height: 54px; }
.hero-avatar-img { width:100%; height:100%; border-radius:50%; object-fit:cover; border:1px solid rgba(255,255,255,.4); }
.hero-avatar-placeholder { width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#1a1a1a; color:#fff; font-weight:800; border:1px solid rgba(255,255,255,.4); }
.hero-avatar-edit { position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); background:transparent; color:#fff; border:1px solid #fff; border-radius:10px; padding:2px 6px; font-size:12px; opacity:0; transition:opacity .15s ease; }
.hero-avatar-edit.show { opacity:1; }
.hidden-input { display:none; }
.hero-actions { display:flex; align-items:center; gap:8px; }
.hero-edit { background:transparent; color:#fff; border:1px solid #fff; border-radius:10px; padding:8px 12px; }
.account-hero .hello { font-size: 22px; font-weight: 700; }
.account-hero .hero-logout {
  background: transparent;
  color: #fff;
  border: 1px solid #fff;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
}
.account-hero .hero-logout:hover { background: #fff; color: #000; }
.account-hero .hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.account-hero .metric { text-align: center; }
.account-hero .metric-value { font-size: 26px; font-weight: 800; line-height: 1; }
.account-hero .metric-label { color: #cfcfcf; margin-top: 6px; font-size: 12px; letter-spacing: .05em; }

.sidebar-nav {
  background: var(--surface);
  border-radius: 14px;
  padding: 16px;
  border: 1px solid var(--border);
  box-shadow: none;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 4px;
  text-align: left;
  color: var(--text);
}

.nav-item:hover {
  background-color: rgba(0,0,0,0.03);
}

.nav-item.active {
  background-color: var(--accent);
  color: #fff;
  transform: none;
}

.logout-btn {
  margin-top: auto;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--text);
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: var(--text);
  color: #fff;
}

.logout-btn .nav-icon {
  font-size: 18px;
}

/* 移除前置UI图标占位，统一左对齐 */
.nav-icon { display: none; }

.nav-label {
  font-size: 14px;
  font-weight: 500;
}

/* 全局覆写子组件（黑白极简） */
:deep(.section-title) {
  color: var(--text);
  border-bottom: 1px solid var(--border) !important;
}

:deep(.btn) {
  appearance: none;
  border: 1px solid var(--text) !important;
  background: transparent !important;
  color: var(--text) !important;
  border-radius: 10px !important;
  padding: 10px 18px !important;
  transition: background .15s ease, color .15s ease, border-color .15s ease;
}
:deep(.btn:hover) {
  background: var(--text) !important;
  color: #fff !important;
}
:deep(.btn.btn-primary) {
  background: var(--text) !important;
  color: #fff !important;
}
:deep(.btn.btn-secondary) {
  background: transparent !important;
  color: var(--text) !important;
}

/* 卡片/容器统一风格 */
:deep(.user-card),
:deep(.stats-grid),
:deep(.quick-actions),
:deep(.recent-orders),
:deep(.membership-benefits),
:deep(.order-card),
:deep(.address-form-modal),
:deep(.modal-content),
:deep(.order-summary-section),
:deep(.address-section) {
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  box-shadow: none !important;
  border-radius: 14px !important;
}

/* 价格/高亮文本改为黑色，避免彩色 */
:deep(.value.price),
:deep(.order-amount),
:deep(.item-total) {
  color: var(--text) !important;
}

/* 状态标签灰阶化 */
:deep(.status-badge),
:deep(.status-paid),
:deep(.status-pending),
:deep(.status-shipped),
:deep(.status-completed),
:deep(.status-cancelled),
:deep(.status-returning),
:deep(.status-returned),
:deep(.status-refunding),
:deep(.status-cart),
:deep(.status-unknown) {
  background: #f0f0f0 !important;
  color: var(--text) !important;
  border: 1px solid #dedede !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .profile-container {
    grid-template-columns: 1fr 250px;
    gap: 20px;
  }
}

@media (max-width: 960px) {
  .profile-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .profile-sidebar {
    position: static;
    order: -1;
  }
  
  .sidebar-nav {
    display: flex;
    overflow-x: auto;
    padding: 12px;
  }
  
  .nav-item {
    flex-shrink: 0;
    min-width: 120px;
    margin-bottom: 0;
    margin-right: 8px;
  }
}

@media (max-width: 768px) {
  .profile {
    padding: 1rem 0;
  }
  
  .profile-container {
    padding: 0 0.5rem;
  }
  
  .sidebar-nav {
    padding: 8px;
  }
  
  .nav-item {
    padding: 10px 12px;
    min-width: 100px;
  }
  
  .nav-icon {
    font-size: 16px;
  }
  
  .nav-label {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 0 0.25rem;
  }
  
  .nav-item {
    min-width: 80px;
    padding: 8px 10px;
  }
  
  .nav-icon {
    font-size: 14px;
  }
  
  .nav-label {
    font-size: 11px;
  }
}
</style>
