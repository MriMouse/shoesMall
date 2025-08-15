<template>
	<header class="main-nav" :class="{ 'is-sticky': isSticky }" @mouseleave="scheduleClose">
		<!-- 顶部黑色窄条 -->
		<div class="top-bar">
			<div class="top-bar-inner">
				<div class="top-bar-left"></div>
				<div class="top-bar-right">
					<button class="login-status" @click="onLoginStatusClick">
						<svg class="login-icon" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<rect x="2" y="3" width="16" height="11" rx="2" ry="2"/>
							<line x1="8" y1="15" x2="12" y2="15"/>
							<line x1="9" y1="18" x2="11" y2="18"/>
						</svg>
						<span v-if="isLoggedIn">欢迎来到</span>
						<span v-else>请登录</span>
					</button>
				</div>
			</div>
		</div>
		<!-- 主要导航区域 -->
		<div class="nav-inner">
			<div class="brand" @click="goHome" aria-label="ShoesMall Home">
				<div class="brand-logo" role="img" aria-label="Shoes Logo">
					<svg viewBox="0 0 140 44" width="112" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g fill="none" stroke-linecap="round" stroke-linejoin="round">
							<!-- 轮廓白描 + 内嵌黑线，黑白相间，在黑色背景上清晰可辨 -->
							<path d="M10 30c8 0 16-2.5 24-8 3.5-2.6 5.5-6.5 8.5-6.5 4 0 9.5 7.5 18 10 7 2 12 2.5 17 6.5 2.8 2.2 4.8 5 4.8 7.2 0 2.2-2.4 3.8-6.8 3.8H26c-9.5 0-14-1-16.8-2.6-2.4-1.4-3.4-3-3.4-5.2 0-2.7 2.7-4.9 5-5.2z" stroke="#111" stroke-width="3"/>
							<path d="M10 30c8 0 16-2.5 24-8 3.5-2.6 5.5-6.5 8.5-6.5 4 0 9.5 7.5 18 10 7 2 12 2.5 17 6.5 2.8 2.2 4.8 5 4.8 7.2 0 2.2-2.4 3.8-6.8 3.8H26c-9.5 0-14-1-16.8-2.6-2.4-1.4-3.4-3-3.4-5.2 0-2.7 2.7-4.9 5-5.2z" stroke="#0a0a0a" stroke-width="1.5"/>

							<!-- 鞋口与后跟 -->
							<path d="M61 16c2.8 1.6 6.5 3.9 9 5.5" stroke="#111" stroke-width="3"/>
							<path d="M61 16c2.8 1.6 6.5 3.9 9 5.5" stroke="#0a0a0a" stroke-width="1.5"/>

							<!-- 鞋带（黑白双线叠加） -->
							<path d="M49 22h10M43 26h11M36 30h11" stroke="#111" stroke-width="3"/>
							<path d="M49 22h10M43 26h11M36 30h11" stroke="#0a0a0a" stroke-width="1.6"/>

							<!-- 鞋底高光 -->
							<path d="M24 40.5h84" stroke="#111" stroke-width="2"/>
							<path d="M24 40.5h84" stroke="#0a0a0a" stroke-width="1"/>
						</g>
					</svg>
				</div>
			</div>
			<nav class="primary-nav" @mouseenter="cancelClose" @mouseleave="scheduleClose">
				<ul class="nav-list">
					<li
						v-for="(group, index) in navGroups"
						:key="group.key"
						class="nav-item"
						@mouseenter="openMegaMenu(index)"
					>
					<span class="nav-link" @click="goBrandAll(group.key)">{{ group.label }}</span>
					</li>
				</ul>
			</nav>
			<div class="nav-search" @mouseleave="hideSuggestions">
				<div class="search-box" :class="{ focus: isSearchFocused }" @click="toggleSearchPanel">
					<div class="search-placeholder">
						<svg class="search-icon" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" shape-rendering="geometricPrecision">
							<circle cx="9" cy="9" r="6" vector-effect="non-scaling-stroke"/>
							<path d="M18 18l-4.5-4.5" vector-effect="non-scaling-stroke"/>
						</svg>
						<transition name="fade" mode="out-in">
							<span :key="currentHotSearchIndex">{{ currentHotSearchTerm }}</span>
						</transition>
					</div>
				</div>
				<div v-if="isSearchPanelOpen" class="search-overlay" @click="closeSearchPanel">
					<div class="search-panel" @click.stop>
						<div class="search-panel-header">
							<div class="search-input-wrapper">
								<svg class="search-icon" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" shape-rendering="geometricPrecision">
									<circle cx="9" cy="9" r="6" vector-effect="non-scaling-stroke"/>
									<path d="M18 18l-4.5-4.5" vector-effect="non-scaling-stroke"/>
								</svg>
								<input
									ref="searchInput"
									type="text"
									class="search-input"
									v-model="searchQuery"
									placeholder="搜索相关类型、品牌或商品"
									@focus="isSearchFocused = true"
									@blur="hideSuggestions"
									@input="updateSuggestions"
									@keydown.enter="submitSearch"
								/>
							</div>
							<button class="close-search-btn" @click="closeSearchPanel" aria-label="关闭搜索">
								<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<line x1="18" y1="6" x2="6" y2="18"/>
									<line x1="6" y1="6" x2="18" y2="18"/>
								</svg>
							</button>
						</div>
						<div class="search-panel-content">
							<div v-if="!searchQuery.trim()" class="hot-searches">
								<h3 class="hot-searches-title">热门搜索</h3>
								<div class="hot-searches-tags">
									<button class="search-tag" @click="selectHotSearch('Safari穿搭')">
										<span>🦒</span>
										<span>Safari穿搭</span>
									</button>
									<button class="search-tag" @click="selectHotSearch('明星同款')">
										<span>明星同款</span>
									</button>
									<button class="search-tag" @click="selectHotSearch('百搭三条纹')">
										<span>💜💜</span>
										<span>百搭三条纹</span>
									</button>
									<button class="search-tag" @click="selectHotSearch('夏日blokecore')">
										<span>⚽</span>
										<span>夏日blokecore</span>
									</button>
									<button class="search-tag" @click="selectHotSearch('造型感包袋')">
										<span>👜</span>
										<span>造型感包袋</span>
									</button>
									<button class="search-tag" @click="selectHotSearch('玛丽猫')">
										<span>🐱</span>
										<span>玛丽猫</span>
									</button>
									<button class="search-tag" @click="selectHotSearch('竞速美学')">
										<span>🏃</span>
										<span>竞速美学</span>
									</button>
									<button class="search-tag" @click="selectHotSearch('梅赛德斯AMG车队')">
										<span>🏁</span>
										<span>梅赛德斯AMG车队</span>
									</button>
									<button class="search-tag" @click="selectHotSearch('当红爆款')">
										<span>🔥</span>
										<span>当红爆款</span>
									</button>
									<button class="search-tag" @click="selectHotSearch('入群有礼')">
										<span>🎁</span>
										<span>入群有礼</span>
									</button>
								</div>
							</div>
							<div v-else class="search-suggestions">
								<div
									v-for="item in suggestions"
									:key="item.key"
									class="suggest-item"
									@click="selectSuggestion(item)"
								>
									<span v-html="highlight(item.label)"></span>
								</div>
								<div class="suggest-footer" @click="submitSearch">按回车搜索 "{{ searchQuery }}"</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="actions">
				<button class="icon-btn" @click="goCart" aria-label="购物袋">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M6 8h12l-1 12H7L6 8z"/>
						<path d="M9 8a3 3 0 0 1 6 0"/>
					</svg>
				</button>
				<button class="icon-btn" :class="{ 'disabled': !isLoggedIn }" @click="goProfile" aria-label="个人中心">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<circle cx="12" cy="8" r="3"/>
						<path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6"/>
					</svg>
				</button>
			</div>
			<!-- 全局单实例 Mega Menu，避免切换时闪烁 -->
			<div
				v-if="currentGroup && activeMenuIndex !== null"
				class="mega-menu"
				@mouseenter="cancelClose"
				@mouseleave="scheduleClose"
			>
				<div class="mega-left">
					<h4 class="mega-title">品牌分类</h4>
					<ul class="mega-cat-list">
						<li
							v-for="brand in currentGroup.brands"
							:key="brand.key"
							class="mega-cat-item"
							@mouseenter="hoverBrand(brand)"
							@click="goBrand(currentGroup.key, brand.key)"
						>
							<span>{{ brand.label }}</span>
						</li>
					</ul>
				</div>
				<div class="mega-right">
					<div class="mega-right-header">
						<span class="preview-title">{{ hoveredBrand ? hoveredBrand.label : '预览' }}</span>
						<button class="view-all" @click="goBrandAll(currentGroup.key)">查看全部</button>
					</div>
					<div class="preview-grid">
						<div class="preview-card" v-for="i in 8" :key="i">
							<div class="preview-media"></div>
							<div class="preview-meta">
								<div class="preview-line"></div>
								<div class="preview-line short"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>
</template>

<script>
import { reactive, ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
    name: 'MainNav',
    emits: ['open-login'],
    setup(props, { emit }) {
		const router = useRouter();
		const isSticky = ref(false);
		const activeMenuIndex = ref(null);
		const currentGroup = ref(null);
		const hoveredBrand = ref(null);
		let closeTimer = null;

		// 检查登录状态
        const isLoggedIn = computed(() => {
			return !!localStorage.getItem('user');
		});

        function onLoginStatusClick() {
            if (isLoggedIn.value) {
                alert('欢迎使用平台！');
            } else {
                emit('open-login');
            }
        }

		const navGroups = reactive([
			{
				key: 'men',
				label: '男鞋',
				brands: [
					{ key: 'running', label: '跑步' },
					{ key: 'training', label: '训练' },
					{ key: 'originals', label: 'Originals' },
					{ key: 'basketball', label: '篮球' }
				]
			},
			{
				key: 'women',
				label: '女鞋',
				brands: [
					{ key: 'running', label: '跑步' },
					{ key: 'training', label: '训练' },
					{ key: 'originals', label: 'Originals' },
					{ key: 'lifestyle', label: '生活方式' }
				]
			},
			{
				key: 'kids',
				label: '童鞋',
				brands: [
					{ key: 'little', label: '小童' },
					{ key: 'junior', label: '大童' },
					{ key: 'running', label: '跑步' }
				]
			},
			{
				key: 'brands',
				label: '品牌',
				brands: [
					{ key: 'nike', label: 'Nike' },
					{ key: 'adidas', label: 'Adidas' },
					{ key: 'puma', label: 'Puma' },
					{ key: 'reebok', label: 'Reebok' },
					{ key: 'converse', label: 'Converse' },
					{ key: 'vans', label: 'Vans' }
				]
			}
		]);

		const handleScroll = () => {
			isSticky.value = window.scrollY > 10;
		};

		onMounted(() => {
			window.addEventListener('scroll', handleScroll, { passive: true });
			startHotSearchRotation(); // 启动热门搜索词条循环
		});

		onBeforeUnmount(() => {
			window.removeEventListener('scroll', handleScroll);
			stopHotSearchRotation(); // 停止热门搜索词条循环
		});

		function openMegaMenu(index) {
			activeMenuIndex.value = index;
			currentGroup.value = navGroups[index];
			cancelClose();
		}

		function keepMegaOpen(index) {
			activeMenuIndex.value = index;
			currentGroup.value = navGroups[index];
		}

		function closeMegaMenu() { activeMenuIndex.value = null; currentGroup.value = null; }

		function scheduleClose() {
			cancelClose();
			closeTimer = setTimeout(() => { activeMenuIndex.value = null; currentGroup.value = null; }, 120);
		}

		function cancelClose() {
			if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
		}

		function hoverBrand(brand) {
			hoveredBrand.value = brand;
		}

		function goHome() {
			router.push('/');
		}

		function goProfile() {
			// 检查是否已登录
			if (isLoggedIn.value) {
				router.push('/profile');
			} else {
				// 未登录时提示用户登录
				alert('请先登录后再访问个人中心');
			}
		}

		function goCart() {
			// 检查是否已登录
			if (isLoggedIn.value) {
				router.push({ name: 'Cart' });
			} else {
				// 未登录时提示用户登录
				alert('请先登录后再访问购物车');
			}
		}

		function goBrand(groupKey, brandKey) {
			router.push({ name: 'ProductListPage', query: { group: groupKey, brand: brandKey } });
		}

		function goBrandAll(groupKey) {
			router.push({ name: 'ProductListPage', query: { group: groupKey } });
		}

		// 搜索框逻辑
		const searchQuery = ref('');
		const isSearchFocused = ref(false);
		const suggestions = ref([]);
		const isSearchPanelOpen = ref(false);
		const searchInput = ref(null);
		
		// 热门搜索词条循环展示
		const hotSearchTerms = [
			'竞速美学',
			'Safari穿搭 🦒',
			'明星同款',
			'百搭三条纹 💜💜',
			'夏日blokecore ⚽',
			'造型感包袋 👜',
			'玛丽猫 🐱',
			'梅赛德斯AMG车队 🏁',
			'当红爆款 🔥',
			'入群有礼 🎁'
		];
		const currentHotSearchIndex = ref(0);
		const currentHotSearchTerm = ref(hotSearchTerms[0]);
		let hotSearchTimer = null;

		// 开始循环展示热门搜索词条
		function startHotSearchRotation() {
			hotSearchTimer = setInterval(() => {
				currentHotSearchIndex.value = (currentHotSearchIndex.value + 1) % hotSearchTerms.length;
				currentHotSearchTerm.value = hotSearchTerms[currentHotSearchIndex.value];
			}, 3000); // 每3秒切换一次
		}

		// 停止循环展示
		function stopHotSearchRotation() {
			if (hotSearchTimer) {
				clearInterval(hotSearchTimer);
				hotSearchTimer = null;
			}
		}

		function toggleSearchPanel() {
			isSearchPanelOpen.value = !isSearchPanelOpen.value;
			if (isSearchPanelOpen.value) {
				stopHotSearchRotation(); // 打开搜索面板时暂停循环
				setTimeout(() => {
					searchInput.value?.focus();
				}, 100);
			} else {
				startHotSearchRotation(); // 关闭搜索面板时恢复循环
			}
		}

		function closeSearchPanel() {
			isSearchPanelOpen.value = false;
			searchQuery.value = '';
			suggestions.value = [];
			isSearchFocused.value = false;
			startHotSearchRotation(); // 关闭搜索面板时恢复循环
		}

		function updateSuggestions() {
			const q = searchQuery.value.trim().toLowerCase();
			if (!q) { suggestions.value = []; return; }
			const base = [
				{ key: 'ultra', label: 'Ultraboost 系列' },
				{ key: 'stan', label: 'Stan Smith 经典' },
				{ key: 'campus', label: 'Campus 休闲' },
				{ key: 'running', label: '跑步 男鞋' },
				{ key: 'training', label: '训练 女鞋' },
				{ key: 'kids', label: '童鞋 热门' },
				{ key: 'nike', label: 'Nike 品牌' },
				{ key: 'adidas', label: 'Adidas 品牌' },
				{ key: 'puma', label: 'Puma 品牌' },
				{ key: 'reebok', label: 'Reebok 品牌' }
			];
			suggestions.value = base.filter(i => i.label.toLowerCase().includes(q)).slice(0, 6);
		}

		function submitSearch() {
			if (!searchQuery.value.trim()) return;
			router.push({ name: 'ProductListPage', query: { q: searchQuery.value.trim() } });
			isSearchFocused.value = false;
			closeSearchPanel();
		}

		function clearSearch() {
			searchQuery.value = '';
			suggestions.value = [];
			isSearchFocused.value = false;
		}

		function selectSuggestion(item) {
			searchQuery.value = item.label;
			submitSearch();
		}

		function selectHotSearch(query) {
			searchQuery.value = query;
			submitSearch();
		}

		function hideSuggestions() {
			setTimeout(() => { isSearchFocused.value = false; }, 100);
		}

		function highlight(text) {
			const q = searchQuery.value.trim();
			if (!q) return text;
			const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`, 'ig');
			return text.replace(re, '<mark>$1</mark>');
		}

		return {
			isSticky,
			navGroups,
			activeMenuIndex,
			currentGroup,
			hoveredBrand,
			isLoggedIn,
			openMegaMenu,
			keepMegaOpen,
			scheduleClose,
			cancelClose,
			closeMegaMenu,
			hoverBrand,
			goBrand,
			goBrandAll,
			goHome,
			goProfile,
			goCart,
			searchQuery,
			isSearchFocused,
			suggestions,
			updateSuggestions,
			submitSearch,
			clearSearch,
			selectSuggestion,
			hideSuggestions,
			highlight,
            isSearchPanelOpen,
			toggleSearchPanel,
			closeSearchPanel,
			selectHotSearch,
			searchInput,
			currentHotSearchIndex,
			currentHotSearchTerm,
            hotSearchTerms,
            onLoginStatusClick
		};
	}
};
</script>

<style scoped>
.main-nav {
	position: sticky;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1000;
	background: #fff;
	color: #000;
	border-bottom: 1px solid #eee;
}

.main-nav.is-sticky {
	box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

/* 顶部黑色窄条 */
.top-bar {
	background: #000;
	color: #fff;
	height: 40px;
	border-bottom: 1px solid rgba(255,255,255,0.08);
}

.top-bar-inner {
	max-width: 1200px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100%;
	padding: 0 16px;
}

.top-bar-left {
	flex: 1;
}

.top-bar-right {
	display: flex;
	align-items: center;
	margin-right: -120px; /* 右移登录按钮 (从-32px改为-48px) */
}

.login-status {
	background: transparent;
	border: 1px solid rgba(255,255,255,0.3); /* 添加白色边框 */
	color: #fff;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	padding: 6px 12px; /* 增加水平内边距 */
	border-radius: 6px;
	transition: background .15s ease, border-color .15s ease;
	display: flex;
	align-items: center;
	gap: 8px; /* 增加图标和文字的间距 */
	letter-spacing: 0.5px; /* 增加字间距 */
}

.login-status:hover {
	background: rgba(255,255,255,0.1);
	border-color: rgba(255,255,255,0.6); /* 悬停时边框变亮 */
}

.login-icon {
	color: #fff;
	flex-shrink: 0;
}

/* 主要导航区域 */
.nav-inner {
	max-width: 1200px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 80px;
	padding: 0 16px;
	background: #fff;
}

.brand {
	display: flex;
	align-items: center;
	cursor: pointer;
	margin-left: -42px; /* 左移logo (从-32px改为-42px) */
}

.brand-logo { padding: 2px 0; }
.brand-logo svg { display: block; filter: drop-shadow(0 1px 0 rgba(0,0,0,0.08)); }

.primary-nav .nav-list {
	list-style: none;
	display: flex;
	gap: 24px;
	align-items: center;
}

.primary-nav { margin-left: 40px; } /* 减少左边距，与logo一起左移 */

.nav-search { flex: 1; display: flex; justify-content: flex-end; padding: 0 24px 0 8px; position: relative; margin-right: 64px; } /* 左移搜索栏 (从32px改为64px) */
.search-box { width: 36%; max-width: 380px; min-width: 220px; position: relative; margin-right: 16px; cursor: pointer; } /* 缩小搜索框宽度 */
.search-box .search-icon {
	position: absolute;
	left: 10px;
	top: 50%;
	transform: translateY(-50%);
	color: #666;
	filter: none;
	z-index: 3;
	pointer-events: none;
}
.search-icon-mask { position: absolute; left: 0; top: 0; bottom: 0; width: 36px; border-top-left-radius: 999px; border-bottom-left-radius: 999px; background: transparent; z-index: 2; pointer-events: none; }
.search-placeholder {
	width: 100%; 
	height: 36px; 
	border-radius: 999px; 
	border: 1px solid #ddd; 
	background: #f8f8f8; 
	color: #999; 
	padding: 0 14px 0 36px; 
	display: flex;
	align-items: center;
	font-size: 14px;
	z-index: 1; 
	position: relative;
	transition: border-color .15s ease, background .15s ease;
}
.search-placeholder .search-icon {
	position: static;
	transform: none;
	margin-right: 8px;
}
.search-box:hover .search-placeholder {
	border-color: #000;
	background: #fff;
}
.search-input {
	width: 100%; height: 36px; border-radius: 999px; border: 1px solid #ddd; background: #f8f8f8; color: #333; padding: 0 14px 0 36px; outline: none;
	z-index: 1; position: relative;
	transition: border-color .15s ease, background .15s ease;
}
.search-box.focus .search-input { border-color: #000; background: #fff; }
.suggest-panel {
	position: absolute; top: 42px; left: 0; width: 100%; background: rgba(255,255,255,0.98);
	backdrop-filter: blur(8px); border: 1px solid #eee; border-radius: 12px; padding: 8px; z-index: 1001;
	box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}
.suggest-item { padding: 8px 10px; border-radius: 8px; color: #333; cursor: pointer; }
.suggest-item:hover { background: #f5f5f5; }
.suggest-footer { padding: 10px; border-top: 1px dashed #eee; color: #666; cursor: pointer; border-radius: 0 0 12px 12px; }
.suggest-footer:hover { background: #f5f5f5; color: #333; }
mark { background: #c6ff00; color: #111; border-radius: 4px; padding: 0 2px; }

.nav-item {
	position: relative;
}

.nav-link {
	font-family: Helvetica Neue, Arial, sans-serif;
	font-weight: 600;
	font-size: 16px;
	padding: 8px 4px;
	color: #000;
	cursor: pointer;
	border-bottom: 2px solid transparent;
	transition: border-color .2s ease;
}

.nav-item:hover .nav-link {
	border-color: #c6ff00;
}

.actions {
	display: flex;
	align-items: center;
	gap: 24px; /* 增加两个UI按钮之间的距离 (从12px改为24px) */
	margin-right: -42px; /* 右移UI按钮 (从-32px改为-42px) */
}

.icon-btn {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: transparent;
	border: 1.5px solid #000;
	color: #000;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: background .15s ease, transform .15s ease, color .15s ease, border-color .15s ease;
}

.icon-btn:first-child {
	margin-left: -32px; /* 左移第一个UI按钮（购物袋） */
}

.icon-btn:hover { background: #000; color: #fff; border-color: #000; transform: translateY(-1px); }

.icon-btn.disabled {
	opacity: 0.5;
	cursor: not-allowed;
	border-color: #ccc;
	color: #ccc;
}

.icon-btn.disabled:hover {
	background: transparent;
	color: #ccc;
	border-color: #ccc;
	transform: none;
}

.mega-menu {
	position: fixed;
	top: 120px; /* 与导航高度一致 (40px + 80px) */
	left: 0;
	right: 0;
	width: 100vw;
	min-height: 420px;
	background: #fff;
	color: #000;
	border-top: 1px solid #eee;
	box-shadow: 0 20px 40px rgba(0,0,0,0.14);
	display: grid;
	grid-template-columns: 280px 1fr;
	gap: 0;
	padding: 20px 32px;
	animation: fadeIn .18s ease;
	z-index: 999;
}

@keyframes fadeIn {
	from { opacity: 0; transform: translateY(6px); }
	to { opacity: 1; transform: translateY(0); }
}

.mega-left { border-right: 1px solid #f0f0f0; padding-right: 16px; }
.mega-title {
	font-size: 12px;
	color: #666;
	margin-bottom: 8px;
}
.mega-cat-list {
	list-style: none;
	display: grid;
	gap: 6px;
}
.mega-cat-item {
	padding: 8px 10px;
	border-radius: 6px;
	cursor: pointer;
	transition: background .15s ease;
}
.mega-cat-item:hover {
	background: #f7f7f7;
}
.mega-right { padding-left: 24px; }
.mega-right-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8px;
}
.view-all {
	background: transparent;
	border: none;
	color: #000;
	font-weight: 600;
	cursor: pointer;
	padding: 6px 8px;
	border-radius: 4px;
}
.view-all:hover {
	background: #f5f5f5;
}
.preview-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.preview-card {
	border: 1px solid #eee;
	border-radius: 8px;
	overflow: hidden;
	background: #fff;
}
.preview-media { height: 140px; background: linear-gradient(135deg, #121212, #2b2b2b); }
.preview-meta {
	padding: 8px;
}
.preview-line {
	height: 8px;
	background: #eaeaea;
	border-radius: 4px;
	margin-bottom: 6px;
}
.preview-line.short { width: 60%; }

.search-panel {
	position: fixed;
	top: 0; /* 从屏幕最上方开始 */
	left: 0;
	right: 0;
	width: 100vw;
	background: #fff;
	z-index: 1001; /* 确保在遮罩层之上 */
	animation: fadeIn .18s ease;
	box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.search-panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	max-width: 1200px;
	margin: 0 auto;
	position: relative;
}

.search-panel-header::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 24px;
	right: 24px;
	height: 1px;
	background: #ddd;
}

.search-input-wrapper {
	position: relative;
	flex: 1;
	max-width: 600px;
}

.search-input-wrapper .search-icon {
	position: absolute;
	left: 12px;
	top: 50%;
	transform: translateY(-50%);
	color: #666;
	z-index: 3;
	pointer-events: none;
}

.search-input {
	width: 100%;
	height: 44px;
	border-radius: 999px;
	border: 1px solid #ddd;
	background: #f8f8f8;
	color: #333;
	padding: 0 16px 0 44px;
	outline: none;
	font-size: 16px;
	transition: border-color .15s ease, background .15s ease;
}

.search-input:focus {
	border-color: #000;
	background: #fff;
}

.search-input::placeholder {
	color: #999;
}

.close-search-btn {
	background: transparent;
	border: none;
	color: #666;
	cursor: pointer;
	padding: 8px;
	border-radius: 50%;
	transition: background .15s ease, color .15s ease;
}

.close-search-btn:hover {
	background: #f5f5f5;
	color: #333;
}

.search-panel-content {
	max-width: 1200px;
	margin: 0 auto;
	padding: 24px;
}

.hot-searches {
	margin-bottom: 24px;
}

.hot-searches-title {
	font-size: 16px;
	color: #333;
	margin-bottom: 16px;
	font-weight: 600;
	display: flex;
	align-items: center;
}

.hot-searches-title::before {
	content: '';
	width: 16px;
	height: 16px;
	background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%23666" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="M18 18l-4.5-4.5"/></svg>') no-repeat center;
	background-size: contain;
	margin-right: 8px;
}

.hot-searches-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
}

.search-tag {
	background: #f8f8f8;
	border: 1px solid #eee;
	border-radius: 20px;
	padding: 8px 16px;
	font-size: 14px;
	color: #333;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 6px;
	transition: background .15s ease, border-color .15s ease, transform .15s ease;
}

.search-tag:hover {
	background: #f0f0f0;
	border-color: #ddd;
	transform: translateY(-1px);
}

.search-suggestions {
	position: relative;
}

.search-suggestions .suggest-item {
	padding: 12px 0;
	border-bottom: 1px solid #f5f5f5;
	color: #333;
	cursor: pointer;
	transition: background .15s ease;
}

.search-suggestions .suggest-item:last-child {
	border-bottom: none;
}

.search-suggestions .suggest-item:hover {
	background: #f8f8f8;
}

.search-suggestions .suggest-footer {
	padding: 16px 0;
	border-top: 1px solid #eee;
	color: #666;
	cursor: pointer;
	margin-top: 16px;
}

.search-suggestions .suggest-footer:hover {
	background: #f8f8f8;
	color: #333;
}

.search-panel .suggest-item mark {
	background: #c6ff00;
	color: #111;
	border-radius: 4px;
	padding: 0 2px;
}

.search-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0,0,0,0.5);
	backdrop-filter: blur(4px);
	z-index: 1000; /* 提高z-index，使其覆盖导航栏 */
	animation: fadeIn .18s ease;
}

.search-placeholder span {
	transition: opacity 0.3s ease;
}

.search-placeholder span.fade-enter-active,
.search-placeholder span.fade-leave-active {
	transition: opacity 0.3s ease;
}

.search-placeholder span.fade-enter-from,
.search-placeholder span.fade-leave-to {
	opacity: 0;
}

@media (max-width: 960px) {
	.mega-menu { top: 112px; min-height: 360px; padding: 16px; grid-template-columns: 1fr; }
	.mega-left { border: none; padding-right: 0; }
	.mega-right { padding-left: 0; margin-top: 12px; }
	.preview-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>



