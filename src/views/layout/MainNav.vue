<template>
	<header class="main-nav" :class="{ 'is-sticky': isSticky }" @mouseleave="scheduleClose">
		<!-- 顶部黑色窄条 -->
		<div class="top-bar">
			<div class="top-bar-inner">
				<div class="top-bar-left"></div>
				<div class="top-bar-right">
					<button class="login-status" @click="onLoginStatusClick">
						<svg class="login-icon" viewBox="0 0 20 20" width="16" height="16" fill="none"
							stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
							aria-hidden="true">
							<rect x="2" y="3" width="16" height="11" rx="2" ry="2" />
							<line x1="8" y1="15" x2="12" y2="15" />
							<line x1="9" y1="18" x2="11" y2="18" />
						</svg>
						<span v-if="isLoggedIn">欢迎回来</span>
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
							<path
								d="M10 30c8 0 16-2.5 24-8 3.5-2.6 5.5-6.5 8.5-6.5 4 0 9.5 7.5 18 10 7 2 12 2.5 17 6.5 2.8 2.2 4.8 5 4.8 7.2 0 2.2-2.4 3.8-6.8 3.8H26c-9.5 0-14-1-16.8-2.6-2.4-1.4-3.4-3-3.4-5.2 0-2.7 2.7-4.9 5-5.2z"
								stroke="#111" stroke-width="3" />
							<path
								d="M10 30c8 0 16-2.5 24-8 3.5-2.6 5.5-6.5 8.5-6.5 4 0 9.5 7.5 18 10 7 2 12 2.5 17 6.5 2.8 2.2 4.8 5 4.8 7.2 0 2.2-2.4 3.8-6.8 3.8H26c-9.5 0-14-1-16.8-2.6-2.4-1.4-3.4-3-3.4-5.2 0-2.7 2.7-4.9 5-5.2z"
								stroke="#0a0a0a" stroke-width="1.5" />

							<!-- 鞋口与后跟 -->
							<path d="M61 16c2.8 1.6 6.5 3.9 9 5.5" stroke="#111" stroke-width="3" />
							<path d="M61 16c2.8 1.6 6.5 3.9 9 5.5" stroke="#0a0a0a" stroke-width="1.5" />

							<!-- 鞋带（黑白双线叠加） -->
							<path d="M49 22h10M43 26h11M36 30h11" stroke="#111" stroke-width="3" />
							<path d="M49 22h10M43 26h11M36 30h11" stroke="#0a0a0a" stroke-width="1.6" />

							<!-- 鞋底高光 -->
							<path d="M24 40.5h84" stroke="#111" stroke-width="2" />
							<path d="M24 40.5h84" stroke="#0a0a0a" stroke-width="1" />
						</g>
					</svg>
				</div>
			</div>
			<nav class="primary-nav" @mouseenter="cancelClose" @mouseleave="scheduleClose">
				<ul class="nav-list">
					<li v-for="(group, index) in navGroups" :key="group.key" class="nav-item"
						@mouseenter="openMegaMenu(index)"
						@mouseover="preloadMegaMenu(index)">
						<span class="nav-link" @click="goBrandAll(group.key)">{{ group.label }}</span>
					</li>
				</ul>
			</nav>
			<div class="nav-search" @mouseleave="hideSuggestions">
				<div class="search-box" :class="{ focus: isSearchFocused }" @click="toggleSearchPanel">
					<div class="search-placeholder">
						<svg class="search-icon" viewBox="0 0 20 20" width="20" height="20" fill="none"
							stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
							aria-hidden="true" shape-rendering="geometricPrecision">
							<circle cx="9" cy="9" r="6" vector-effect="non-scaling-stroke" />
							<path d="M18 18l-4.5-4.5" vector-effect="non-scaling-stroke" />
						</svg>
						<span>搜索商品、品牌或类型</span>
					</div>
				</div>
				<div v-if="isSearchPanelOpen" class="search-overlay" @click="closeSearchPanel">
					<div class="search-panel" @click.stop>
						<div class="search-panel-header">
							<div class="search-input-wrapper">
								<svg class="search-icon" viewBox="0 0 20 20" width="20" height="20" fill="none"
									stroke="currentColor" stroke-width="2" stroke-linecap="round"
									stroke-linejoin="round" aria-hidden="true" shape-rendering="geometricPrecision">
									<circle cx="9" cy="9" r="6" vector-effect="non-scaling-stroke" />
									<path d="M18 18l-4.5-4.5" vector-effect="non-scaling-stroke" />
								</svg>
								<input ref="searchInput" type="text" class="search-input" v-model="searchQuery"
									placeholder="搜索商品名称、品牌或类型" @focus="isSearchFocused = true" @blur="hideSuggestions"
									@input="updateSuggestions" @keydown.enter="submitSearch" />
							</div>
							<button class="close-search-btn" @click="closeSearchPanel" aria-label="关闭搜索">
								<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
									stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>
						<div class="search-panel-content">
							<div v-if="!searchQuery.trim()" class="search-tips">
								<!-- 热门搜索 -->
								<div class="hot-search-section">
									<h4 class="hot-search-title">热门搜索</h4>
									<ol class="hot-search-list">
										<li v-for="s in hotSearches.slice(0, 6)" :key="s.shoeId" class="hot-search-item" @click="goToProductDetailWithHistory(s.shoeId)">
											<span class="hot-name">{{ s.name }}</span>
										</li>
									</ol>
								</div>
								
								<!-- 搜索历史 -->
								<div v-if="isLoggedIn && searchHistory.length > 0" class="search-history-section">
									<div class="search-history-header">
										<h4 class="search-history-title">搜索历史</h4>
										<button class="clear-history-btn" @click="clearAllSearchHistory" title="清空所有历史">🗑️</button>
									</div>
									<div class="history-chips">
										<div v-for="h in searchHistory" :key="`${h.userId ?? h.user_id ?? h.id}-${h.shoeId ?? h.shoe_id}`" class="history-chip" @click="goToProductDetailFromHistory(h.shoeId ?? h.shoe_id)">
											<span class="chip-text">{{ h.shoe?.name || '商品' }}</span>
											<button class="chip-close" @click.stop="deleteSearchHistory(h.shoeId ?? h.shoe_id)" title="删除">×</button>
										</div>
									</div>
								</div>
								
								<!-- 搜索历史加载状态 -->
								<div v-else-if="isLoggedIn && searchHistoryLoading" class="search-history-loading">
									<div class="loading-spinner"></div>
									<p>加载搜索历史...</p>
								</div>
								
								<!-- 无搜索历史提示 -->
								<div v-else-if="isLoggedIn && searchHistory.length === 0" class="no-search-history">
									<p>暂无搜索历史</p>
								</div>
							</div>
							<div v-else class="search-suggestions">
								<div v-if="searchLoading" class="search-loading">
									<div class="loading-spinner"></div>
									<p>搜索中...</p>
								</div>
								<div v-else-if="searchResults.length === 0" class="no-results">
									<p>未找到相关商品</p>
									<p class="no-results-tip">尝试使用其他关键词搜索</p>
							</div>
								<div v-else class="search-results">
									<div v-for="product in searchResults" :key="product.shoeId" class="search-result-item"
										@click="goToProductDetailWithHistory(product.shoeId)">
										<div class="result-image">
											<img v-if="product.images && product.images.length > 0"
												:src="`/api/shoeImg/getImage/${product.images[0].imagePath}`" 
												:alt="product.name"
												class="result-product-image" 
												loading="lazy"
												@load="handleSearchImageLoad"
												@error="handleSearchImageError">
											<div v-else class="result-placeholder">🖼️</div>
						</div>
										<div class="result-info">
											<div class="result-name">{{ product.name }}</div>
											<div class="result-meta">
												<span class="result-brand">{{ product.brand?.brandName || 'N/A' }}</span>
												<span class="result-type">{{ product.shoesType?.typeName || 'N/A' }}</span>
											</div>
											<div class="result-price">¥{{ product.discountPrice || product.price }}</div>
										</div>
									</div>
								</div>
								<div v-if="searchResults.length > 0" class="search-footer" @click="submitSearch">
									按回车搜索 "{{ searchQuery }}" 的更多结果
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="actions">
				<button class="icon-btn" @click="goCart" aria-label="购物车">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
						stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<circle cx="9" cy="21" r="1" />
						<circle cx="20" cy="21" r="1" />
						<path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
					</svg>
				</button>
				<!-- 用户头像按钮 + 悬浮下拉菜单 -->
				<div class="user-menu-wrapper" @mouseenter="openUserMenu" @mouseleave="scheduleCloseUserMenu">
					<button class="icon-btn" :class="{ 'disabled': !isLoggedIn }" @click="goProfile" aria-label="个人中心">
						<img v-if="avatarPath" :src="avatarUrl" alt="avatar" class="avatar-img" />
						<svg v-else viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
							stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<circle cx="12" cy="8" r="3" />
							<path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" />
						</svg>
					</button>
					<input ref="avatarInput" type="file" accept="image/*" class="hidden-input" @change="handleAvatarChange" />
					<div v-if="isLoggedIn && showUserMenu" class="user-dropdown" @mouseenter="openUserMenu" @mouseleave="scheduleCloseUserMenu">
						<button class="dropdown-item" @click="goProfileTab('overview')">个人中心</button>
						<button class="dropdown-item" @click="goProfileTab('info')">个人信息</button>
						<button class="dropdown-item" @click="goProfileTab('orders')">我的订单</button>
						<button class="dropdown-item" @click="goProfileTab('address')">收货地址</button>
						<button class="dropdown-item" @click="goProfileTab('settings')">账户设置</button>
						<div class="dropdown-divider"></div>
						<button class="dropdown-item" @click="triggerUpload">更换头像</button>
						<div class="dropdown-divider"></div>
						<button class="dropdown-item logout" @click="logout">退出登录</button>
					</div>
				</div>
			</div>
			<!-- 全局单实例 Mega Menu，避免切换时闪烁 -->
			<div v-if="currentGroup && activeMenuIndex !== null" class="mega-menu" 
				@mouseenter="cancelClose"
				@mouseleave="scheduleClose"
				@mousemove="cancelClose">
				<div class="mega-left">
					<h4 class="mega-title">类型详情</h4>
					<ul class="mega-cat-list">
						<li v-for="category in currentGroup.categories" :key="category.key" class="mega-cat-item"
							@mouseenter="hoverCategory(category)" 
							@click="goCategory(currentGroup.key, category)">
							<span>{{ category.label }}</span>
						</li>
					</ul>
				</div>
				<div class="mega-right">
					<div class="mega-right-header">
						<span class="preview-title">{{ hoveredCategory ? hoveredCategory.label : '热门主推' }}</span>
						<button class="view-all" @click="goBrandAll(currentGroup.key)">查看全部</button>
					</div>
					<div class="preview-grid">
						<!-- 动态加载产品预览 -->
						<div v-for="product in previewProducts.slice(0, 9)" :key="product.shoeId" class="preview-card"
							@click="goToProductDetail(product.shoeId)">
							<div class="preview-media">
								<img v-if="product.images && product.images.length > 0"
									:src="`/api/shoeImg/getImage/${product.images[0].imagePath}`" 
									:alt="product.name"
									class="preview-image" 
									loading="lazy"
									@load="handleImageLoad" 
									@error="handleImageError">
								<div v-else class="preview-placeholder"></div>
							</div>
							<div class="preview-meta">
								<div class="preview-name">{{ product.name }}</div>
							</div>
						</div>
						<!-- 加载状态 -->
						<div v-if="previewLoading" class="preview-loading">
							<div class="loading-spinner"></div>
							<p>加载中...</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- 子路由内容区域：在 /products 路径下，仅渲染产品列表页面 -->
	<router-view />
</template>

<script>
import { reactive, ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { UserAPI } from '@/api';
import axios from 'axios';
import userManager from '../../utils/userManager';

export default {
	name: 'MainNav',
	emits: ['open-login'],
	setup(props, { emit }) {
		const router = useRouter();
		// 用户下拉菜单
		const showUserMenu = ref(false);
		let userMenuTimer = null;
		const isSticky = ref(false);
		const activeMenuIndex = ref(null);
		const currentGroup = ref(null);
		const hoveredCategory = ref(null);
		let closeTimer = null;
		// 新增：防抖定时器
		let debounceTimer = null;
		// 新增：图片缓存
		const imageCache = new Map();
		// 新增：图片预加载队列
		const imagePreloadQueue = new Set();
		// 新增：请求序列号，避免过时响应覆盖最新数据
		let requestSeq = 0;
		// 新增：全量商品缓存与进行中的请求，避免重复请求
		let allShoesCache = null;
		let allShoesPromise = null;
		// 新增：不同分组的预览结果缓存（例如 men/women/kids/brands）
		const previewCache = new Map();

		// 新增：产品预览相关
		const previewProducts = ref([]);
		const previewLoading = ref(false);

		// 热门搜索
		const hotSearches = ref([]);
		async function loadHotSearches(limit = 6) {
			try {
				const idsResp = await axios.post('/api/clickLog/getHotShoeIds', new URLSearchParams({ limit }));
				const ids = Array.isArray(idsResp?.data?.data) ? idsResp.data.data : [];
				if (!ids.length) { hotSearches.value = []; return; }
				const details = await Promise.all(ids.map(async (shoeId) => {
					try {
						const p = new URLSearchParams({ shoeId });
						const res = await axios.post('/api/shoe/getById', p);
						const shoe = res?.data?.data || {};
						return { shoeId, name: shoe.name || `商品 ${shoeId}` };
					} catch (_) { return { shoeId, name: `商品 ${shoeId}` }; }
				}));
				hotSearches.value = details;
			} catch (_) { hotSearches.value = []; }
		}

		// 新增：动态分类数据
		const dynamicCategories = ref([]);

		// 检查登录状态
		const isLoggedIn = ref(false);
		
		// 检查登录状态的函数
		const checkLoginStatus = () => {
			const user = localStorage.getItem('user');
			isLoggedIn.value = !!user;
			// 如果登录状态改变，重新加载搜索历史
			if (isLoggedIn.value) {
				loadSearchHistory();
			} else {
				searchHistory.value = [];
			}
		};

		// 新增：统一获取当前用户ID（兼容本地仅存用户名的情况）
		async function getCurrentUserId() {
			try {
				const raw = localStorage.getItem('user');
				if (!raw) return null;
				let parsed = null;
				try { parsed = JSON.parse(raw); } catch (_) { /* raw 可能是用户名字符串 */ }
				let userId = null;
				if (parsed && typeof parsed === 'object') {
					userId = parsed.id || parsed.userId || null;
					if (!userId && parsed.username) {
						userId = await userManager.getUserIdByUsername(parsed.username);
					}
				} else {
					// raw 是用户名
					userId = await userManager.getUserIdByUsername(raw);
				}

				return userId || null;
			} catch (e) {
				console.warn('解析当前用户ID失败:', e);
				return null;
			}
		}
		
		// 监听 localStorage 变化
		const handleStorageChange = (e) => {
			if (e.key === 'user') {
				checkLoginStatus();
			}
		};

		function onLoginStatusClick() {
			if (isLoggedIn.value) {
				// 已登录时直接跳转到个人中心页面
				router.push('/profile');
			} else {
				emit('open-login');
			}
		}

		function openUserMenu() {
			showUserMenu.value = true;
			if (userMenuTimer) clearTimeout(userMenuTimer);
		}
		function scheduleCloseUserMenu() {
			if (userMenuTimer) clearTimeout(userMenuTimer);
			userMenuTimer = setTimeout(() => { showUserMenu.value = false; }, 150);
		}
		function goProfileTab(tab) {
			router.push('/profile');
			sessionStorage.setItem('profile-target-tab', tab);
		}
		function logout() {
			localStorage.removeItem('user');
			showUserMenu.value = false;
			router.push('/');
		}

		const navGroups = reactive([
			{
				key: 'men',
				label: '男鞋',
				shoeSex: 1,
				categories: [] // 将从后端动态加载
			},
			{
				key: 'women',
				label: '女鞋',
				shoeSex: 2,
				categories: [] // 将从后端动态加载
			},
			{
				key: 'kids',
				label: '童鞋',
				shoeSex: 3,
				categories: [] // 将从后端动态加载
			},
			{
				key: 'brands',
				label: '品牌',
				categories: [] // 将从后端动态加载
			}
		]);

		const handleScroll = () => {
			isSticky.value = window.scrollY > 10;
		};

		onMounted(() => {
			window.addEventListener('scroll', handleScroll, { passive: true });
			// 检查初始登录状态
			checkLoginStatus();
			// 监听 localStorage 变化
			window.addEventListener('storage', handleStorageChange);
			// 监听自定义登录成功事件
			window.addEventListener('user-login-change', checkLoginStatus);
			
			loadCategoriesFromBackend(); // 加载分类数据
			
			// 预加载一些常用图片，提升用户体验
			setTimeout(() => {
				preloadCommonImages();
			}, 1000); // 延迟1秒开始预加载，避免影响初始加载

			// 加载热门搜索
			loadHotSearches();
		});

		onBeforeUnmount(() => {
			window.removeEventListener('scroll', handleScroll);
			// 清理事件监听器
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener('user-login-change', checkLoginStatus);
			// 清理定时器
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
			// 清理防抖定时器
			if (searchDebounceTimer) {
				clearTimeout(searchDebounceTimer);
			}
			// 清理图片缓存
			imageCache.clear();
		});

		// 新增：从后端加载分类数据
		const loadCategoriesFromBackend = async () => {
			try {
				console.log('开始加载分类数据...');
				
				// 并行请求所有数据，提高加载速度
				const [brandResponse, typeResponse, shoeResponse] = await Promise.all([
					// 加载品牌数据
					axios.post('/api/brand/getAll', {}, {
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
					}),
					// 加载鞋子类型数据
					axios.post('/api/shoesType/getAll', {}, {
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
					}),
					// 加载所有产品数据
					axios.post('/api/shoe/getAll', {}, {
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
					})
				]);

				// 处理品牌数据
				if (brandResponse.data && brandResponse.data.data) {
					const activeBrands = brandResponse.data.data.filter(brand => !brand.brandDisabled);
					const brandsGroup = navGroups.find(group => group.key === 'brands');
					if (brandsGroup) {
						brandsGroup.categories = activeBrands.map(brand => ({
							key: brand.brandId.toString(),
							label: brand.brandName,
							brandId: brand.brandId,
							brandName: brand.brandName
						}));
					}
					console.log('品牌数据加载成功:', activeBrands.length, '个品牌');
				}

				// 处理鞋子类型数据
				if (typeResponse.data && typeResponse.data.data) {
					const activeTypes = typeResponse.data.data.filter(type => !type.typeDisabled);
					console.log('鞋子类型数据加载成功:', activeTypes.length, '个类型');
					console.log('可用类型:', activeTypes.map(t => t.typeName));

					// 处理产品数据
					if (shoeResponse.data && shoeResponse.data.data) {
						const allShoes = shoeResponse.data.data;
						console.log('产品数据加载成功:', allShoes.length, '个产品');

						// 为每个性别组分配类型
						navGroups.forEach(group => {
							if (group.key !== 'brands' && group.shoeSex) {
								// 根据shoe_sex筛选产品
								const shoesBySex = allShoes.filter(shoe => 
									shoe.shoeSex === group.shoeSex
								);
								console.log(`${group.label} 性别产品数量:`, shoesBySex.length);

								// 从筛选后的产品中提取shoe_type类型ID
								const typeIdsBySex = [...new Set(
									shoesBySex
										.filter(shoe => shoe.shoesType?.typeId)
										.map(shoe => shoe.shoesType.typeId)
								)];
								console.log(`${group.label} 对应的类型ID:`, typeIdsBySex);

								// 根据提取的typeId筛选类型
								const filteredTypes = activeTypes.filter(type => 
									typeIdsBySex.includes(type.typeId)
								);
								console.log(`${group.label} 筛选后的类型:`, filteredTypes.map(t => t.typeName));

								// 设置分类
								group.categories = filteredTypes.map(type => ({
									key: type.typeId.toString(),
									label: type.typeName,
									typeId: type.typeId,
									typeName: type.typeName
								}));
							}
						});
					} else {
						console.warn('产品数据为空，无法进行性别筛选');
					}
				} else {
					console.warn('鞋子类型数据为空');
				}

				console.log('分类数据加载完成:', navGroups);
			} catch (error) {
				console.error('加载分类数据失败:', error);
				// 如果加载失败，清空所有分类
				navGroups.forEach(group => {
					group.categories = [];
				});
			}
		};

		function openMegaMenu(index) {
			// 如果已经是当前菜单，不需要重新打开
			if (activeMenuIndex.value === index && currentGroup.value === navGroups[index]) {
				return;
			}
			
			activeMenuIndex.value = index;
			currentGroup.value = navGroups[index];
			// 重置已悬停分类，避免自动选中左侧第一个
			hoveredCategory.value = null;
			// 清理可能存在的防抖/预加载定时器
			if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
			cancelClose();
			
			// 延迟加载产品预览数据，避免闪烁
			setTimeout(() => {
				loadPreviewProducts();
			}, 50);
		}

		// 新增：预加载函数，在用户悬停导航项时就开始准备数据
		function preloadMegaMenu() {
			// 不再自动预选左侧第一个分类；保持初始为通用"热门主推"预览
			// 如需预热图片，可在此处添加仅缓存加载的逻辑，但不要更新 previewProducts
			return;
		}

		// 新增：图片预加载函数
		async function preloadImages(productIds) {
			const promises = productIds.map(async (productId) => {
				if (imageCache.has(`product_${productId}`)) return; // 已缓存
				if (imagePreloadQueue.has(productId)) return; // 已在队列中
				
				imagePreloadQueue.add(productId);
				try {
					const imageResponse = await axios.get(`/api/shoeImg/list/${productId}`);
					if (imageResponse.data && imageResponse.data.data) {
						imageCache.set(`product_${productId}`, imageResponse.data.data);
					}
				} catch (error) {
					console.warn(`预加载图片失败: ${productId}`, error);
				} finally {
					imagePreloadQueue.delete(productId);
				}
			});
			
			// 并行预加载，不等待完成
			Promise.allSettled(promises);
		}

		// 新增：图片加载完成处理函数
		function handleImageLoad(event) {
			const img = event.target;
			img.classList.add('loaded');
			img.removeAttribute('loading');
		}

		// 新增：图片加载错误处理函数
		function handleImageError(event) {
			const img = event.target;
			img.style.display = 'none';
			// 显示占位符
			const placeholder = img.parentElement.querySelector('.preview-placeholder');
			if (placeholder) {
				placeholder.classList.add('show'); // 显示占位符
			}
		}

		function keepMegaOpen(index) {
			activeMenuIndex.value = index;
			currentGroup.value = navGroups[index];
		}

		function closeMegaMenu() {
			activeMenuIndex.value = null;
			currentGroup.value = null;
			previewProducts.value = []; // 清空预览数据
		}

		function scheduleClose() {
			cancelClose();
			// 增加延迟时间，避免闪烁
			closeTimer = setTimeout(() => {
				closeMegaMenu();
			}, 150); // 从0改为150ms，给用户足够时间移动到下拉菜单
		}

		function cancelClose() {
			if (closeTimer) { 
				clearTimeout(closeTimer); 
				closeTimer = null; 
			}
		}

		function hoverCategory(category) {
			// 如果已经是当前悬停的分类，不需要重新加载
			if (hoveredCategory.value && hoveredCategory.value.key === category.key) {
				return;
			}
			
			hoveredCategory.value = category;
			
			// 增加防抖延迟，避免频繁切换
			if (debounceTimer) {
				clearTimeout(debounceTimer);
			}
			
			// 增加延迟，避免闪烁
			debounceTimer = setTimeout(() => {
				loadPreviewProductsByCategory(category);
			}, 150); // 从100ms增加到150ms，进一步减少闪烁
		}

		// 修改：加载产品预览数据 - 添加缓存机制和图片预加载
		const loadPreviewProducts = async () => {
			if (!currentGroup.value) return;

			const seq = ++requestSeq;
			previewLoading.value = true;
			try {
				// 分组级别缓存，优先直接返回
				const groupKey = currentGroup.value.key;
				const groupCacheKey = `preview_group_${groupKey}`;
				if (previewCache.has(groupCacheKey)) {
					previewProducts.value = previewCache.get(groupCacheKey);
					return;
				}

				// 使用全量商品缓存，避免重复请求
				const allShoes = await (async () => {
					if (allShoesCache) return allShoesCache;
					if (allShoesPromise) return await allShoesPromise;
					allShoesPromise = axios.post('/api/shoe/getAll', {}, {
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
					}).then(res => {
						const data = (res.data && res.data.data) ? res.data.data : [];
						allShoesCache = data;
						allShoesPromise = null;
						return allShoesCache;
					}).catch(err => { allShoesPromise = null; throw err; });
					return await allShoesPromise;
				})();

				if (allShoes && allShoes.length) {
					let products = allShoes;

					// 根据当前组类型筛选产品
					if (currentGroup.value.key === 'brands') {
						// 品牌分类：显示所有品牌的产品
						products = products.slice(0, 9); // 限制显示9个产品（3x3）
					} else {
						// 性别分类：根据 shoe_sex 筛选
						products = products.filter(product =>
							product.shoeSex === currentGroup.value.shoeSex
						).slice(0, 9);
					}

					// 立即预加载所有产品的图片
					const productIds = products.map(p => p.shoeId);
					preloadImages(productIds);

					// 优化图片加载：使用缓存和并行加载
					const productsWithImages = await Promise.all(
						products.map(async (product) => {
							// 检查缓存
							const cacheKey = `product_${product.shoeId}`;
							if (imageCache.has(cacheKey)) {
								product.images = imageCache.get(cacheKey);
								return product;
							}

							try {
								const imageResponse = await axios.get(`/api/shoeImg/list/${product.shoeId}`, { timeout: 5000 });
								if (imageResponse.data && imageResponse.data.data) {
									product.images = imageResponse.data.data;
									// 存入缓存
									imageCache.set(cacheKey, product.images);
								} else {
									product.images = [];
								}
							} catch (error) {
								product.images = [];
							}
							return product;
						})
					);

					// 若有更新后的请求已发出，忽略过时响应
					if (seq !== requestSeq) return;
					previewProducts.value = productsWithImages;
					// 缓存本组预览结果
					previewCache.set(groupCacheKey, productsWithImages);
				}
			} catch (error) {
				console.error('加载产品预览失败:', error);
				previewProducts.value = [];
			} finally {
				if (seq === requestSeq) previewLoading.value = false;
			}
		};

		// 修改：根据分类加载产品预览 - 优化性能和缓存，添加图片预加载
		const loadPreviewProductsByCategory = async (category) => {
			if (!currentGroup.value) return;

			const seq = ++requestSeq;
			// 检查缓存
			const cacheKey = `category_${currentGroup.value.key}_${category.key}`;
			if (imageCache.has(cacheKey)) {
				previewProducts.value = imageCache.get(cacheKey);
				return;
			}

			previewLoading.value = true;
			try {
				// 使用全量商品缓存
				const allShoes = await (async () => {
					if (allShoesCache) return allShoesCache;
					if (allShoesPromise) return await allShoesPromise;
					allShoesPromise = axios.post('/api/shoe/getAll', {}, {
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
					}).then(res => {
						const data = (res.data && res.data.data) ? res.data.data : [];
						allShoesCache = data;
						allShoesPromise = null;
						return allShoesCache;
					}).catch(err => { allShoesPromise = null; throw err; });
					return await allShoesPromise;
				})();

				if (allShoes && allShoes.length) {
					let products = allShoes;

					// 根据分类筛选产品
					if (currentGroup.value.key === 'brands') {
						// 品牌分类：根据品牌筛选
						if (category.brandId) {
							products = products.filter(product =>
								product.brand?.brandId === category.brandId
							);
						} else {
							products = products.filter(product => {
								const brandName = product.brand?.brandName?.toLowerCase();
								const brandKey = category.key.toLowerCase();
								return brandName?.includes(brandKey) || brandName?.includes(category.label.toLowerCase());
							});
						}
					} else {
						// 性别分类：根据shoe_type和shoe_sex双重筛选
						products = products.filter(product => {
							// 首先确保性别匹配
							if (product.shoeSex !== currentGroup.value.shoeSex) {
								return false;
							}

							// 然后根据shoe_type进行筛选
							if (category.typeId) {
								// 使用typeId进行精确筛选
								return product.shoesType?.typeId === category.typeId;
							} else {
								// 使用typeName进行模糊筛选
								const typeName = product.shoesType?.typeName?.toLowerCase();
								const categoryKey = category.key.toLowerCase();
								const categoryLabel = category.label.toLowerCase();
								
								// 检查产品类型是否匹配当前分类
								return typeName?.includes(categoryKey) || typeName?.includes(categoryLabel) || (product.shoesType?.typeId && product.shoesType.typeId.toString() === category.key);
							}
						});
					}

					// 限制显示数量（最多9个）
					products = products.slice(0, 9);

					// 立即预加载所有产品的图片
					const productIds = products.map(p => p.shoeId);
					preloadImages(productIds);

					// 优化图片加载：使用缓存和并行加载
					const productsWithImages = await Promise.all(
						products.map(async (product) => {
							// 检查产品图片缓存
							const productCacheKey = `product_${product.shoeId}`;
							if (imageCache.has(productCacheKey)) {
								product.images = imageCache.get(productCacheKey);
								return product;
							}

							try {
								const imageResponse = await axios.get(`/api/shoeImg/list/${product.shoeId}`, { timeout: 5000 });
								if (imageResponse.data && imageResponse.data.data) {
									product.images = imageResponse.data.data;
									// 存入产品图片缓存
									imageCache.set(productCacheKey, product.images);
								} else {
									product.images = [];
								}
							} catch (error) {
								product.images = [];
							}
							return product;
						})
					);

					if (seq !== requestSeq) return;
					previewProducts.value = productsWithImages;
					// 存入分类缓存
					imageCache.set(cacheKey, productsWithImages);
				}
			} catch (error) {
				console.error('加载分类产品预览失败:', error);
				previewProducts.value = [];
			} finally {
				if (seq === requestSeq) previewLoading.value = false;
			}
		};

		function goHome() {
			router.push('/');
		}

		function goProfile() {
			// 检查是否已登录
			if (isLoggedIn.value) {
				router.push('/profile');
			} else {
				// 未登录时打开登录抽屉，并标识来自个人中心
				emit('open-login', true);
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

		function goCategory(groupKey, category) {
			// 修改：传递分类信息
			if (groupKey === 'brands' && category.brandId) {
				// 品牌分类：传递品牌ID
				router.push({
					name: 'ProductListPage',
					query: {
						group: groupKey,
						brandId: category.brandId,
						brandName: category.brandName
					}
				});
			} else if (groupKey !== 'brands' && category.typeId) {
				// 性别分类：传递类型ID和性别
				router.push({
					name: 'ProductListPage',
					query: {
						group: groupKey,
						typeId: category.typeId,
						typeName: category.typeName,
						shoeSex: navGroups.find(g => g.key === groupKey)?.shoeSex
					}
				});
			} else {
				// 其他分类：传递分类key
				router.push({
					name: 'ProductListPage',
					query: {
						group: groupKey,
						category: category.key
					}
				});
			}
		}

		function goBrandAll(groupKey) {
			router.push({ name: 'ProductListPage', query: { group: groupKey } });
		}

		// 新增：跳转到产品详情页面
		function goToProductDetail(shoeId) {
			router.push(`/product/${shoeId}`);
		}

		// 搜索框逻辑
		const searchQuery = ref('');
		const isSearchFocused = ref(false);
		const isSearchPanelOpen = ref(false);
		const searchInput = ref(null);
		// 新增：搜索功能
		const searchLoading = ref(false);
		const searchResults = ref([]);
		let searchDebounceTimer = null;

		// 新增：搜索历史相关
		const searchHistory = ref([]);
		const searchHistoryLoading = ref(false);

		// 新增：删除后短时间阻止重新写入的前端防抖（避免刚删除又被详情页/其他地方立刻写回）
		const HISTORY_BLOCK_MS = 3 * 1000; // 3秒窗口
		const makeHistoryBlockKey = (userId, shoeId) => `search-history-block:${userId}:${shoeId}`;
		const markHistoryDeleted = (userId, shoeId) => {
			try {
				sessionStorage.setItem(makeHistoryBlockKey(userId, shoeId), String(Date.now()));
			} catch (_e) { void 0 }
		};
		const shouldBlockAddHistory = (userId, shoeId) => {
			try {
				const v = sessionStorage.getItem(makeHistoryBlockKey(userId, shoeId));
				if (!v) return false;
				return Date.now() - Number(v) < HISTORY_BLOCK_MS;
			} catch (_) { return false; }
		};

		// 新增：防抖搜索函数
		const debouncedSearch = (query) => {
			if (searchDebounceTimer) {
				clearTimeout(searchDebounceTimer);
			}
			searchDebounceTimer = setTimeout(() => {
				if (query.trim()) {
					searchProducts(query);
				} else {
					searchResults.value = [];
				}
			}, 300); // 300ms 防抖延迟
		};

		// 新增：记录搜索历史
		const recordSearchHistory = async (shoeId) => {
			if (!isLoggedIn.value) return; // 未登录用户不记录

			try {
				const resolvedUserId = Number(await getCurrentUserId());
				if (!resolvedUserId) return;
				// 若刚被删除，短时间内不再写入，避免“删不掉”的观感
				if (shouldBlockAddHistory(resolvedUserId, Number(shoeId))) return;

				// 先查询是否已存在，存在则跳过，避免后端主键冲突
				const checkParams = new URLSearchParams({ userId: resolvedUserId, shoeId });
				try {
					const getResp = await axios.post('/api/searchHistory/get', checkParams, {
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
					});
					if (getResp?.data?.code === 200 && getResp?.data?.data) {
						return; // 已存在，直接返回
					}
				} catch (_) { /* 查询失败时继续尝试添加 */ console.debug('searchHistory/get 查询失败，继续尝试 add'); }
				const params = new URLSearchParams({ userId: resolvedUserId, shoeId });
				await axios.post('/api/searchHistory/add', params, {
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				});

				// 重新加载搜索历史
				loadSearchHistory();
			} catch (error) {
				console.warn('记录搜索历史失败:', error);
			}
		};

		// 新增：加载搜索历史
		const loadSearchHistory = async () => {
			if (!isLoggedIn.value) {
				searchHistory.value = [];
				return;
			}

			try {
				searchHistoryLoading.value = true;
				const resolvedUserId = await getCurrentUserId();
				if (!resolvedUserId) { searchHistory.value = []; return; }

				const historyParams = new URLSearchParams({ userId: resolvedUserId, limit: 10 });
				const response = await axios.post('/api/searchHistory/getRecentByUserId', historyParams);

				if (response.data && response.data.data) {
					// 获取历史记录中的鞋子信息
					const historyWithShoes = await Promise.all(
						response.data.data.map(async (raw) => {
							// 兼容后端字段命名（shoeId/userId 或 shoe_id/id/user_id）
							const normalized = {
								userId: raw.userId ?? raw.user_id ?? raw.id ?? null,
								shoeId: raw.shoeId ?? raw.shoe_id ?? raw.shoeid ?? null,
								searchOrder: raw.searchOrder ?? raw.search_order ?? raw.search_index ?? null
							};
							const { shoeId } = normalized;
							if (!shoeId) return null;
							try {
								const shoeParams = new URLSearchParams({ shoeId });
								const shoeResponse = await axios.post('/api/shoe/getById', shoeParams);

								if (shoeResponse.data && shoeResponse.data.data) {
									const shoe = shoeResponse.data.data;
									// 获取鞋子图片
									try {
										const imageResponse = await axios.get(`/api/shoeImg/list/${shoe.shoeId}`);
										if (imageResponse.data && imageResponse.data.data) {
											shoe.images = imageResponse.data.data;
										} else {
											shoe.images = [];
										}
									} catch (error) {
										shoe.images = [];
									}
									return { ...normalized, shoe };
								}
							} catch (error) {
								console.warn(`获取鞋子 ${shoeId} 信息失败:`, error);
								return null;
							}
						})
					);

					// 过滤掉无效的记录
					searchHistory.value = historyWithShoes.filter(item => item !== null);
				} else {
					searchHistory.value = [];
				}
			} catch (error) {
				console.error('加载搜索历史失败:', error);
				searchHistory.value = [];
			} finally {
				searchHistoryLoading.value = false;
			}
		};



		// 新增：删除搜索历史
		const deleteSearchHistory = async (shoeId) => {
			if (!isLoggedIn.value) return;

			// 乐观更新：先从本地移除，失败再回滚
			const previous = [...searchHistory.value];
			searchHistory.value = previous.filter(h => (h.shoeId ?? h.shoe_id) !== shoeId);

			try {
				const resolvedUserId = Number(await getCurrentUserId());
				if (!resolvedUserId) { searchHistory.value = previous; return; }
				const delParams = new URLSearchParams({ userId: resolvedUserId, shoeId });
				const resp = await axios.post('/api/searchHistory/delete', delParams, {
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				});

				// 如果后端返回失败，则回滚并提示
				const ok = resp?.data?.code === 200 && (resp.data?.data === true || resp.data?.data === 'true');
				if (!ok) {
					console.warn('后端删除失败，回滚本地状态:', resp?.data);
					searchHistory.value = previous;
					return;
				}
				// 标记该项在短时间窗口内不允许重新写入，避免详情页/其他地方立即 add 回来
				markHistoryDeleted(resolvedUserId, Number(shoeId));
				// 强制刷新一次，确保与后端一致
				await loadSearchHistory();
			} catch (error) {
				console.error('删除搜索历史失败:', error);
				// 回滚
				searchHistory.value = previous;
			}
		};

		// 新增：清空所有搜索历史
		const clearAllSearchHistory = async () => {
			if (!isLoggedIn.value) return;

			try {
				const resolvedUserId = await getCurrentUserId();
				if (!resolvedUserId) return;
				const clearParams = new URLSearchParams({ userId: resolvedUserId });
				await axios.post('/api/searchHistory/deleteAllByUserId', clearParams, {
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				});

				searchHistory.value = [];
			} catch (error) {
				console.error('清空搜索历史失败:', error);
			}
		};

		// 新增：搜索产品函数
		async function searchProducts(query) {
			if (!query || !query.trim()) {
				searchResults.value = [];
				return;
			}

			searchLoading.value = true;
			try {
				// 使用现有的全量商品数据进行本地搜索
				let allShoes = [];
				if (allShoesCache) {
					allShoes = allShoesCache;
				} else {
					const response = await axios.post('/api/shoe/getAll', {}, {
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
					});
					if (response.data && response.data.data) {
						allShoes = response.data.data;
						allShoesCache = allShoes;
					}
				}

				if (allShoes.length > 0) {
					// 本地模糊搜索
					const searchTerm = query.toLowerCase().trim();
					const filteredProducts = allShoes.filter(product => {
						// 搜索商品名称
						if (product.name && product.name.toLowerCase().includes(searchTerm)) {
							return true;
						}
						// 搜索品牌名称
						if (product.brand?.brandName && product.brand.brandName.toLowerCase().includes(searchTerm)) {
							return true;
						}
						// 搜索商品类型
						if (product.shoesType?.typeName && product.shoesType.typeName.toLowerCase().includes(searchTerm)) {
							return true;
						}
						// 搜索颜色
						if (product.color?.colorName && product.color.colorName.toLowerCase().includes(searchTerm)) {
							return true;
						}
						// 搜索产品编号
						if (product.serialNumber && product.serialNumber.toLowerCase().includes(searchTerm)) {
							return true;
						}
						return false;
					});

					// 限制搜索结果数量为5个
					searchResults.value = filteredProducts.slice(0, 5);

					// 为搜索结果加载图片数据
					await Promise.all(
						searchResults.value.map(async (product) => {
							try {
								// 检查图片缓存
								const cacheKey = `product_${product.shoeId}`;
								if (imageCache.has(cacheKey)) {
									product.images = imageCache.get(cacheKey);
								} else {
									const imageResponse = await axios.get(`/api/shoeImg/list/${product.shoeId}`, { timeout: 5000 });
									if (imageResponse.data && imageResponse.data.data) {
										product.images = imageResponse.data.data;
										// 存入缓存
										imageCache.set(cacheKey, product.images);
									} else {
										product.images = [];
									}
								}
							} catch (error) {
								console.warn(`加载产品 ${product.name} 图片失败:`, error);
								product.images = [];
							}
							return product;
						})
					);
				} else {
					searchResults.value = [];
				}
			} catch (error) {
				console.error('搜索产品失败:', error);
				searchResults.value = [];
			} finally {
				searchLoading.value = false;
			}
		}

		// 新增：处理搜索图片加载成功
		function handleSearchImageLoad(event) {
			const img = event.target;
			img.style.display = 'block';
			img.classList.add('loaded');
			// 隐藏占位符
			const placeholder = img.parentElement.querySelector('.result-placeholder');
			if (placeholder) {
				placeholder.style.display = 'none';
			}
		}

		// 新增：处理搜索图片加载错误
		function handleSearchImageError(event) {
			const img = event.target;
			img.style.display = 'none';
			// 显示占位符
			const placeholder = img.parentElement.querySelector('.result-placeholder');
			if (placeholder) {
				placeholder.style.display = 'flex';
			}
		}

		function toggleSearchPanel() {
			isSearchPanelOpen.value = !isSearchPanelOpen.value;
			if (isSearchPanelOpen.value) {
				setTimeout(() => {
					searchInput.value?.focus();
				}, 100);
				// 打开搜索面板时加载搜索历史
				loadSearchHistory();
			}
		}

		function closeSearchPanel() {
			isSearchPanelOpen.value = false;
			searchQuery.value = '';
			searchResults.value = [];
			isSearchFocused.value = false;
			// 清理防抖定时器
			if (searchDebounceTimer) {
				clearTimeout(searchDebounceTimer);
				searchDebounceTimer = null;
			}
		}

		function updateSuggestions() {
			// 使用防抖搜索
			debouncedSearch(searchQuery.value);
		}

		function submitSearch() {
			if (!searchQuery.value.trim()) return;
			
			// 跳转到产品列表页面，传递搜索关键字
			router.push({ 
				name: 'ProductListPage', 
				query: { q: searchQuery.value.trim() } 
			});
			
			isSearchFocused.value = false;
			closeSearchPanel();
		}

		// 新增：跳转到产品详情页面并记录搜索历史
		function goToProductDetailWithHistory(shoeId) {
			// 记录搜索历史
			recordSearchHistory(shoeId);
			// 跳转到产品详情页面
			router.push(`/product/${shoeId}`);
			// 关闭搜索面板
			closeSearchPanel();
		}

		// 新增：从搜索历史跳转到产品详情
		function goToProductDetailFromHistory(shoeId) {
			// 跳转到产品详情页面
			router.push(`/product/${shoeId}`);
			// 关闭搜索面板
			closeSearchPanel();
		}

		function hideSuggestions() {
			setTimeout(() => { isSearchFocused.value = false; }, 100);
		}

		// 新增：预加载常用图片
		async function preloadCommonImages() {
			try {
				// 预加载一些热门产品的图片
				const response = await axios.post('/api/shoe/getAll', {}, {
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
				});
				
				if (response.data && response.data.data) {
					const popularProducts = response.data.data.slice(0, 16); // 预加载前16个产品
					const productIds = popularProducts.map(p => p.shoeId);
					preloadImages(productIds);
				}
			} catch (error) {
				console.warn('预加载常用图片失败:', error);
			}
		}

		const avatarPath = ref('');
		const avatarUrl = computed(() => {
			if (!avatarPath.value) return '';
			const filename = avatarPath.value.split('/').pop();
			return `/api/users/getAvatar/${filename}`;
		});
		onMounted(async () => {
			const user = localStorage.getItem('user');
			try {
				if (user) {
					const u = typeof user === 'string' ? JSON.parse(user) : user;
					avatarPath.value = u.avatarPath || '';
				}
			} catch (e) { console.warn('读取本地用户失败', e); }
			// 同步获取后端头像路径
			try {
				const raw = localStorage.getItem('user');
				if (raw) {
					const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
					if (obj?.username) {
						const res = await UserAPI.getAvatarPath(obj.username);
						if (res.data?.code === 200 && res.data.data) {
							avatarPath.value = res.data.data;
						}
					}
				}
			} catch (e) { console.warn('获取后端头像路径异常:', e) }
		});
		const avatarInput = ref(null);
		function triggerUpload() { avatarInput.value && avatarInput.value.click(); }
		async function handleAvatarChange(e) {
			const file = e.target.files && e.target.files[0];
			if (!file) return;
			// 上传到后端
			const formData = new FormData();
			// 后端要求字段名为 avatar
			formData.append('avatar', file);
			try {
				const uploadRes = await UserAPI.uploadAvatar(formData);
				if (uploadRes.data?.code === 200 && uploadRes.data.data) {
					const serverPath = uploadRes.data.data; // 后端返回的头像相对路径
					avatarPath.value = serverPath;
					// 更新数据库 user.avatar_path
					const raw = localStorage.getItem('user');
					let userId = null; let username = null; let obj = null;
					if (raw) { obj = typeof raw === 'string' ? JSON.parse(raw) : raw; userId = obj.id; username = obj.username; }
					if (userId) {
						await UserAPI.updateAvatarById(userId, serverPath);
					} else if (username) {
						await UserAPI.updateAvatar(username, serverPath);
					}
					// 同步本地
					if (obj) { obj.avatarPath = serverPath; localStorage.setItem('user', JSON.stringify(obj)); }
				} else {
					console.warn('头像上传失败:', uploadRes.data);
				}
			} catch (err) {
				console.error('上传头像出错:', err);
			}
		}

		return {
			router,
			isSticky,
			activeMenuIndex,
			currentGroup,
			hoveredCategory,
			showUserMenu,
			openUserMenu,
			scheduleCloseUserMenu,
			goProfileTab,
			logout,
			navGroups,
			isLoggedIn,
			previewProducts,
			previewLoading,
			dynamicCategories,
			openMegaMenu,
			preloadMegaMenu,
			preloadImages,
			preloadCommonImages,
			keepMegaOpen,
			scheduleClose,
			cancelClose,
			closeMegaMenu,
			hoverCategory,
			goCategory,
			goBrandAll,
			goHome,
			goProfile,
			goCart,
			goToProductDetail,
			loadCategoriesFromBackend,
			handleImageLoad,
			handleImageError,
			searchQuery,
			isSearchFocused,
			updateSuggestions,
			submitSearch,
			hideSuggestions,
			isSearchPanelOpen,
			toggleSearchPanel,
			closeSearchPanel,
			searchInput,
			onLoginStatusClick,
			searchLoading,
			searchResults,
			searchProducts,
			handleSearchImageError,
			handleSearchImageLoad,
			hotSearches,
			// 新增：搜索历史相关
			searchHistory,
			searchHistoryLoading,
			recordSearchHistory,
			loadSearchHistory,
			deleteSearchHistory,
			clearAllSearchHistory,
			goToProductDetailWithHistory,
			goToProductDetailFromHistory,
			avatarPath,
			avatarUrl,
			avatarInput,
			triggerUpload,
			handleAvatarChange
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
	position: relative;
	/* 为mega-menu提供定位上下文 */
}

.main-nav.is-sticky {
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 顶部黑色窄条 */
.top-bar {
	background: #000;
	color: #fff;
	height: 40px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	width: 100%;
	box-sizing: border-box;
	position: relative;
	overflow: visible;
	margin: 0;
	padding: 0;
}

.top-bar-inner {
	max-width: 1200px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 100%;
	padding: 0 16px;
	box-sizing: border-box;
	width: 100%;
	position: relative;
	margin-right: 0;
}

.top-bar-left {
	flex: 1;
}

.top-bar-right {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	position: absolute;
	right: 8px;
	top: 0;
	bottom: 0;
	z-index: 10;
	width: auto;
}

.login-status {
	background: transparent;
	border: 1px solid rgba(255, 255, 255, 0.3);
	color: #fff;
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	padding: 6px 12px;
	border-radius: 8px;
	transition: background .15s ease, border-color .15s ease;
	display: flex;
	align-items: center;
	gap: 8px;
	letter-spacing: 0.5px;
	white-space: nowrap;
	flex-shrink: 0;
	min-width: 80px;
	justify-content: center;
	margin: 0;
	position: relative;
}

.login-status:hover {
	background: rgba(255, 255, 255, 0.1);
	border-color: rgba(255, 255, 255, 0.6);
	/* 悬停时边框变亮 */
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
	box-sizing: border-box;
	width: 100%;
	position: relative;
}

.brand {
	display: flex;
	align-items: center;
	cursor: pointer;
	margin-left: -42px;
	/* 左移logo (从-32px改为-42px) */
	flex-shrink: 0;
}

.brand-logo {
	padding: 2px 0;
	flex-shrink: 0;
}

.brand-logo svg {
	display: block;
	filter: drop-shadow(0 1px 0 rgba(0, 0, 0, 0.08));
	max-width: 100%;
	height: auto;
}

.primary-nav {
	margin-left: 40px;
	flex-shrink: 0;
}

/* 减少左边距，与logo一起左移 */

.primary-nav .nav-list {
	list-style: none;
	display: flex;
	gap: 24px;
	align-items: center;
	flex-wrap: nowrap;
}

.nav-search {
	flex: 1;
	display: flex;
	justify-content: flex-end;
	padding: 0 8px 0 8px;
	position: relative;
	margin-right: 40px;
	min-width: 0;
}

/* 左移搜索栏 (从32px改为64px) */

.search-box {
	width: 34%;
	max-width: 380px;
	min-width: 220px;
	position: relative;
	margin-right: 8px;
	cursor: pointer;
	flex-shrink: 0;
}

/* 缩小搜索框宽度 */

.search-box .search-icon {
	position: absolute;
	left: 8px;
	top: 50%;
	transform: translateY(-50%);
	color: #666;
	filter: none;
	z-index: 3;
	pointer-events: none;
}

/* 已移除未使用的 .search-icon-mask */


.search-placeholder {
	width: 100%;
	height: 36px;
	border-radius: 999px;
	border: 1px solid #ddd;
	background: #f8f8f8;
	color: #999;
	padding: 0 14px 0 32px;
	display: flex;
	align-items: center;
	font-size: 14px;
	z-index: 1;
	position: relative;
	transition: border-color .1s ease, background .1s ease;
	box-sizing: border-box;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	/* 添加硬件加速 */
	transform: translateZ(0);
	will-change: border-color, background;
}

.search-placeholder .search-icon {
	position: static;
	transform: none;
	margin-right: 8px;
	flex-shrink: 0;
}

.search-box:hover .search-placeholder {
	border-color: #000;
	background: #fff;
}

.search-input {
	width: 100%;
	height: 36px;
	border-radius: 999px;
	border: 1px solid #ddd;
	background: #f8f8f8;
	color: #333;
	padding: 0 14px 0 32px;
	outline: none;
	z-index: 1;
	position: relative;
	transition: border-color .1s ease, background .1s ease;
	box-sizing: border-box;
	/* 添加硬件加速 */
	transform: translateZ(0);
	will-change: border-color, background;
}

.search-box.focus .search-input {
	border-color: #000;
	background: #fff;
}

/* 已移除未使用的 .suggest-panel */



.nav-item {
	position: relative;
	flex-shrink: 0;
}

.nav-link {
	font-family: Helvetica Neue, Arial, sans-serif;
	font-weight: 600;
	font-size: 16px;
	padding: 8px 4px;
	color: #000;
	cursor: pointer;
	border-bottom: 2px solid transparent;
	transition: border-color .15s ease;
	white-space: nowrap;
	/* 添加硬件加速 */
	transform: translateZ(0);
	will-change: border-color;
}

.nav-item:hover .nav-link {
	border-color: #c6ff00;
}

.actions {
	display: flex;
	align-items: center;
	gap: 36px;
	/* 增大两个按钮间距 */
	margin-right: -24px;
	flex-shrink: 0;
}
.user-menu-wrapper { margin-left: 4px; position: relative; }

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
	transition: background .1s ease, transform .1s ease, color .1s ease, border-color .1s ease;
	flex-shrink: 0;
	/* 添加硬件加速 */
	transform: translateZ(0);
	will-change: background, transform, color, border-color;
}

/* 下拉菜单样式（用户头像菜单） */
.user-dropdown {
	position: absolute;
	top: 52px;
	/* 水平居中到触发按钮（个人中心） */
	left: 50%;
	/* 让下拉菜单宽度随内容自适应，避免右侧留白过多 */
	min-width: 0;
	width: max-content;
	background: #fff;
	border: 1px solid #eee;
	border-radius: 12px;
	box-shadow: 0 12px 32px rgba(0,0,0,.12);
	padding: 4px;
	display: flex;
	flex-direction: column;
	z-index: 1000;
	transform: translateX(calc(-50% - 8px));
}

.dropdown-item {
	width: 100%;
	text-align: left;
	background: transparent;
	border: none;
	padding: 6px 10px;
	border-radius: 8px;
	font-size: 14px;
	line-height: 1.2;
	color: #111;
	cursor: pointer;
	transition: background .12s ease, color .12s ease;
}

.dropdown-item:hover { background: #f5f5f5; }
.dropdown-item.logout { color: #c0392b; }

.dropdown-divider {
	height: 1px;
	background: #eee;
	margin: 2px 0;
}

.avatar-img { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
.hidden-input { display: none; }

.icon-btn:first-child {
	margin-left: -16px;
	/* 左移第一个UI按钮（购物袋），增大与个人中心的距离 */
}

.icon-btn:hover {
	background: #000;
	color: #fff;
	border-color: #000;
	transform: translateY(-1px) translateZ(0);
}

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
	position: absolute;
	top: 100%;
	/* 使下拉菜单始终紧贴白色导航栏底部 */
	left: 50%;
	/* 居中并保持全屏宽度 */
	width: 100vw;
	height: auto;
	background: #fff;
	color: #000;
	border-top: 1px solid #eee;
	box-shadow: 0 20px 40px rgba(0, 0, 0, 0.14);
	display: grid;
	grid-template-columns: 280px 1fr;
	gap: 0;
	padding: 20px 32px 20px 32px;
	animation: fadeIn .2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	z-index: 999;
	box-sizing: border-box;
	/* 添加硬件加速 */
	transform: translateX(-50%) translateZ(0);
	will-change: opacity, transform;
	/* 添加过渡效果 */
	transition: opacity 0.2s ease, transform 0.2s ease;
	/* 防止闪烁的CSS属性 */
	backface-visibility: hidden;
	transform-style: preserve-3d;
	/* 确保内容不会溢出 */
	overflow-x: visible;
	overflow-y: visible;
	/* 强制占满整个视口宽度，消除左右边距 */
	margin: 0;
	/* 确保左右边距为0，内容完全占满 */
	padding-left: 32px;
	padding-right: 32px;
	/* 强制占满整个视口宽度 */
	max-width: 100vw;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-8px) translateZ(0);
	}

	to {
		opacity: 1;
		transform: translateY(0) translateZ(0);
	}
}

.mega-left {
	border-right: 1px solid #f0f0f0;
	padding-right: 16px;
	/* 确保左侧内容从最左边开始 */
	padding-left: 0;
	margin-left: 0;
	/* 强制占满可用宽度 */
	width: 100%;
	box-sizing: border-box;
}

.mega-title {
	font-size: 12px;
	color: #666;
	margin-bottom: 8px;
	/* 确保标题从最左边开始 */
	padding-left: 0;
	margin-left: 0;
}

.mega-cat-list {
	list-style: none;
	display: grid;
	gap: 6px;
	/* 确保列表从最左边开始 */
	padding-left: 0;
	margin-left: 0;
}

.mega-cat-item {
	padding: 8px 10px;
	border-radius: 6px;
	cursor: pointer;
	transition: background .15s ease, transform .15s ease;
	/* 添加硬件加速 */
	transform: translateZ(0);
	will-change: background, transform;
	/* 添加悬停状态的边框 */
	border: 1px solid transparent;
	/* 确保项目从最左边开始 */
	padding-left: 10px;
	margin-left: 0;
}

.mega-cat-item:hover {
	background: #f7f7f7;
	transform: translateX(2px) translateZ(0);
	border-color: #e0e0e0;
}

.mega-right {
	padding-left: 24px;
	/* 确保右侧内容不被遮挡 */
	overflow: visible;
	width: 100%;
	box-sizing: border-box;
	/* 确保右边距足够 */
	padding-right: 0;
	/* 强制占满可用宽度 */
	min-width: 0;
}

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

.preview-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 2px;
	max-width: 100%;
	/* 确保网格不被遮挡 */
	overflow: visible;
	width: 100%;
	box-sizing: border-box;
	/* 确保网格占满整个可用宽度 */
	min-width: 0;
	/* 添加右边距确保最后一个产品完全可见 */
	padding-right: 0;
}


.preview-card {
	border: 1px solid #fff;
	border-width: 1px 0 0 1px;
	border-radius: 0;
	background: #eef2f5;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 10px 12px;
	box-sizing: border-box;
	overflow: visible;
	/* 添加硬件加速 */
	transform: translateZ(0);
	position: relative;
	/* 确保卡片完全可见 */
	width: 100%;
	min-width: 0;
	/* 确保右边距足够 */
	margin-right: 0;
	/* 强制占满网格单元格 */
	flex: 1;
}

.preview-card:hover {
	transform: none;
	box-shadow: none;
	border-color: #fff;
}

.preview-card:hover::after {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: transparent;
	pointer-events: none;
}

.preview-media {
	height: 60px;
	width: 100px;
	background: transparent;
	position: relative;
	overflow: hidden;
}

.preview-image {
	width: 100%;
	height: 100%;
	object-fit: contain;
	/* 添加硬件加速 */
	transform: translateZ(0);
	backface-visibility: hidden;
	transform-style: preserve-3d;
	opacity: 1;
}

.preview-card:hover .preview-image {
	transform: none;
}

/* 图片加载状态 */
.preview-image[loading] {
	opacity: 0.7;
}

.preview-image.loaded {
	opacity: 1;
}

.preview-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 2rem;
	color: #999;
	/* 添加占位符样式优化 */
	background: linear-gradient(135deg, #f5f5f5, #e8e8e8);
	border: 1px dashed #ddd;
	/* 默认隐藏，只在需要时显示 */
	display: none;
}

.preview-placeholder.show {
	display: flex;
}

.preview-meta {
	padding: 0;
	min-width: 0;
	/* 确保文字不被遮挡 */
	overflow: visible;
	width: 100%;
	box-sizing: border-box;
	/* 确保右边距足够 */
	padding-right: 0;
	/* 强制占满可用宽度 */
	flex: 1;
}

.preview-name {
	font-size: 14px;
	font-weight: 600;
	color: #111;
	line-height: 1.2;
	letter-spacing: 0;
	text-transform: none;
	overflow: visible;
	text-overflow: clip;
	white-space: normal;
	min-width: 0;
	/* 确保文字完全显示 */
	word-wrap: break-word;
	word-break: break-word;
	/* 确保右边距足够 */
	padding-right: 0;
	/* 强制占满可用宽度 */
	width: 100%;
}

/* 已移除未使用的 .preview-price */

/* 新增：加载状态样式 */
.preview-loading {
	grid-column: span 3;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 40px;
	color: #666;
}

.loading-spinner {
	width: 30px;
	height: 30px;
	border: 3px solid #f3f3f3;
	border-top: 3px solid #c6ff00;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-bottom: 16px;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

.search-panel {
	position: fixed;
	top: 0;
	/* 从屏幕最上方开始 */
	left: 0;
	right: 0;
	width: 100vw;
	background: #fff;
	z-index: 1001;
	/* 确保在遮罩层之上 */
	animation: fadeIn .08s ease;
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	box-sizing: border-box;
}

.search-panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 20px;
	max-width: 1200px;
	margin: 0 auto;
	position: relative;
	box-sizing: border-box;
}

.search-panel-header::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 20px;
	right: 20px;
	height: 1px;
	background: #eee;
}

.search-input-wrapper {
	position: relative;
	flex: 1;
	max-width: 600px;
}

.search-input-wrapper .search-icon {
	position: absolute;
	left: 8px;
	top: 50%;
	transform: translateY(-50%);
	color: #666;
	z-index: 3;
	pointer-events: none;
}

.search-input {
	width: 100%;
	height: 40px;
	border-radius: 999px;
	border: 1px solid #ddd;
	background: #f8f8f8;
	color: #333;
	padding: 0 16px 0 32px;
	outline: none;
	font-size: 15px;
	transition: border-color .15s ease, background .15s ease;
	box-sizing: border-box;
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
	padding: 20px;
	box-sizing: border-box;
}

.search-tips {
	margin-bottom: 20px;
}

.search-tips-title {
	font-size: 14px;
	color: #333;
	margin-bottom: 12px;
	font-weight: 600;
	display: flex;
	align-items: center;
}

.search-tips-title::before {
	content: '';
	width: 14px;
	height: 14px;
	background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%23666" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="M18 18l-4.5-4.5"/></svg>') no-repeat center;
	background-size: contain;
	margin-right: 6px;
}

.search-tips-content {
	color: #666;
	line-height: 1.4;
}

.search-tips-content p {
	margin: 6px 0;
	font-size: 13px;
}

.search-suggestions {
	position: relative;
}





/* 搜索结果样式 */
.search-loading {
	text-align: center;
	padding: 40px 20px;
	color: #666;
}

.search-loading .loading-spinner {
	width: 30px;
	height: 30px;
	border: 3px solid #f3f3f3;
	border-top: 3px solid #c6ff00;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto 16px;
}

.no-results {
	text-align: center;
	padding: 40px 20px;
	color: #666;
}

.no-results-tip {
	font-size: 14px;
	color: #999;
	margin-top: 8px;
}

.search-results {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.search-result-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	border: none;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s ease;
	background: transparent;
}

.search-result-item:hover {
	background: #f5f5f5;
	transform: none;
	box-shadow: none;
}

.result-image {
	width: 48px;
	height: 48px;
	flex-shrink: 0;
	position: relative;
	overflow: hidden;
	border-radius: 4px;
	background: #f5f5f5;
}

.result-product-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.result-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.2rem;
	color: #999;
	background: #f0f0f0;
	border-radius: 4px;
}

.result-info {
	flex: 1;
	min-width: 0;
}

.result-name {
	font-size: 14px;
	font-weight: 500;
	color: #333;
	margin-bottom: 4px;
	line-height: 1.3;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.result-meta {
	display: flex;
	gap: 8px;
	margin-bottom: 4px;
}

.result-brand, .result-type {
	font-size: 11px;
	color: #666;
	background: transparent;
	padding: 0;
	border-radius: 0;
}

.result-price {
	font-size: 14px;
	font-weight: 600;
	color: #e74c3c;
}

.search-footer {
	padding: 12px 0;
	border-top: 1px solid #eee;
	color: #666;
	cursor: pointer;
	margin-top: 12px;
	text-align: center;
	background: #f8f8f8;
	border-radius: 6px;
	transition: background 0.15s ease;
	font-size: 13px;
}

.search-footer:hover {
	background: #f0f0f0;
	color: #333;
}

/* 搜索历史样式 */
.search-history-section {
	margin-top: 20px;
	padding-top: 20px;
	border-top: 1px solid #eee;
}

.search-history-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.search-history-title {
	font-size: 14px;
	color: #333;
	font-weight: 600;
	margin: 0;
}

.clear-history-btn {
	background: transparent;
	border: none;
	color: #999;
	cursor: pointer;
	padding: 4px;
	border-radius: 4px;
	transition: all 0.15s ease;
	font-size: 14px;
}

.clear-history-btn:hover {
	background: #f5f5f5;
	color: #666;
}

/* 已移除未使用的旧版搜索历史列表样式（改为 chip 风格） */

.search-history-loading {
	text-align: center;
	padding: 20px;
	color: #666;
}

.search-history-loading .loading-spinner {
	width: 20px;
	height: 20px;
	border: 2px solid #f3f3f3;
	border-top: 2px solid #c6ff00;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin: 0 auto 8px;
}

.no-search-history {
	text-align: center;
	padding: 20px;
	color: #999;
	font-size: 13px;
}

.search-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(8px);
	z-index: 1000;
	/* 提高z-index，使其覆盖导航栏 */
	animation: fadeIn .08s ease;
}

.search-placeholder span {
	transition: opacity 0.3s ease;
}

/* 已移除未使用的 fade 过渡类 */

/* 响应式设计 */
@media (max-width: 1200px) {
	.top-bar-inner,
	.nav-inner,
	.search-panel-header,
	.search-panel-content {
		max-width: 100%;
		padding-left: 16px;
		padding-right: 16px;
	}

	.search-box {
		width: 40%;
		min-width: 200px;
	}
	
	.top-bar-right {
		right: 8px;
	}
}

@media (max-width: 960px) {
	.top-bar {
		height: 36px;
	}
	
	.top-bar-inner {
		padding: 0 12px;
	}
	
	.login-status {
		font-size: 13px;
		padding: 5px 10px;
		gap: 6px;
		min-width: 70px;
	}
	
	.top-bar-right {
		right: 6px;
	}
	
	.nav-inner {
		height: 70px;
		padding: 0 12px;
	}

	.brand {
		margin-left: -20px;
	}

	.brand-logo svg {
		width: 90px;
		height: 32px;
	}

	.primary-nav {
		margin-left: 20px;
	}

	.primary-nav .nav-list {
		gap: 16px;
	}

	.nav-link {
		font-size: 14px;
		padding: 6px 3px;
	}

	.nav-search {
		margin-right: 40px;
		padding: 0 16px 0 6px;
	}

	.search-box {
		width: 45%;
		min-width: 180px;
		margin-right: 12px;
	}

	.actions {
		margin-right: -20px;
		gap: 16px;
	}

	.icon-btn:first-child {
		margin-left: -16px;
	}

	.mega-menu {
		top: 100%;
		height: auto;
		padding: 16px 16px 16px 16px;
		grid-template-columns: 1fr;
		/* 确保在小屏幕上完全显示 */
		overflow-x: visible;
		overflow-y: visible;
		width: 100vw;
		/* 强制占满整个视口宽度 */
		max-width: 100vw;
		/* 确保左右边距足够 */
		padding-left: 16px;
		padding-right: 16px;
		/* 确保从屏幕最左边开始 */
		margin: 0;
	}

	.mega-left {
		border: none;
		padding-right: 0;
		/* 确保左侧内容从最左边开始 */
		padding-left: 0;
		margin-left: 0;
	}

	.mega-right {
		padding-left: 0;
		margin-top: 12px;
		/* 确保右侧内容完全显示 */
		overflow: visible;
		width: 100%;
		/* 确保右边距足够 */
		padding-right: 0;
	}

	.preview-grid {
		grid-template-columns: repeat(3, 1fr);
		/* 确保网格完全显示 */
		overflow: visible;
		width: 100%;
		gap: 2px;
		/* 确保右边距足够 */
		padding-right: 0;
	}
}

@media (max-width: 768px) {
	.top-bar {
		height: 32px;
	}

	.top-bar-inner {
		padding: 0 8px;
	}

	.login-status {
		font-size: 12px;
		padding: 4px 8px;
		gap: 4px;
		min-width: 60px;
	}

	.top-bar-right {
		right: 4px;
	}

	.nav-inner {
		height: 60px;
		padding: 0 8px;
		flex-wrap: wrap;
	}

	.brand {
		margin-left: -8px;
	}

	.brand-logo svg {
		width: 80px;
		height: 28px;
	}

	.primary-nav {
		margin-left: 12px;
		order: 3;
		width: 100%;
		margin-top: 8px;
	}

	.primary-nav .nav-list {
		gap: 12px;
		justify-content: center;
	}

	.nav-link {
		font-size: 13px;
		padding: 4px 2px;
	}

	.nav-search {
		margin-right: 20px;
		padding: 0 8px 0 4px;
		flex: 1;
	}

	.search-box {
		width: 100%;
		max-width: none;
		min-width: 0;
		margin-right: 8px;
	}

	.actions {
		margin-right: -8px;
		gap: 12px;
	}

	.icon-btn {
		width: 36px;
		height: 36px;
	}

	.icon-btn:first-child {
		margin-left: -8px;
	}

	.mega-menu {
		top: 100%;
		height: auto;
		padding: 12px 12px 12px 12px;
		/* 确保在中等屏幕上完全显示 */
		overflow-x: visible;
		overflow-y: visible;
		width: 100vw;
		grid-template-columns: 1fr;
		/* 强制占满整个视口宽度 */
		max-width: 100vw;
		/* 确保左右边距足够 */
		padding-left: 12px;
		padding-right: 12px;
		/* 确保从屏幕最左边开始 */
		margin: 0;
	}

	.preview-grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 2px;
		overflow: visible;
		width: 100%;
		/* 确保右边距足够 */
		padding-right: 0;
	}
}

@media (max-width: 480px) {
	.top-bar {
		height: 28px;
	}

	.top-bar-inner {
		padding: 0 6px;
	}

	.login-status {
		font-size: 11px;
		padding: 3px 6px;
		gap: 3px;
		min-width: 50px;
	}

	.top-bar-right {
		right: 3px;
	}

	.top-bar-inner,
	.nav-inner,
	.search-panel-header,
	.search-panel-content {
		padding-left: 6px;
		padding-right: 6px;
	}

	.brand-logo svg {
		width: 70px;
		height: 24px;
	}

	.primary-nav .nav-list {
		gap: 8px;
	}

	.nav-link {
		font-size: 12px;
		padding: 3px 1px;
	}

	.search-box {
		margin-right: 6px;
	}

	.search-placeholder {
		font-size: 12px;
		height: 32px;
		padding: 0 12px 0 28px;
	}

	.actions {
		gap: 8px;
	}

	.icon-btn {
		width: 32px;
		height: 32px;
	}

	.mega-menu {
		/* 确保在小屏幕上完全显示 */
		overflow-x: visible;
		overflow-y: visible;
		width: 100vw;
		padding: 8px 8px 8px 8px;
		grid-template-columns: 1fr;
		/* 强制占满整个视口宽度 */
		max-width: 100vw;
		/* 确保左右边距足够 */
		padding-left: 8px;
		padding-right: 8px;
		/* 确保从屏幕最左边开始 */
		margin: 0;
		top: 100%;
		height: auto;
	}

	.preview-grid {
		grid-template-columns: 1fr;
		gap: 2px;
		overflow: visible;
		width: 100%;
		/* 确保右边距足够 */
		padding-right: 0;
	}

	.preview-card {
		padding: 8px;
		gap: 8px;
		/* 确保右边距足够 */
		margin-right: 0;
	}

	.preview-name {
		font-size: 13px;
		/* 确保右边距足够 */
		padding-right: 0;
	}
}

@media (max-width: 360px) {
	.top-bar {
		height: 24px;
	}
	
	.top-bar-inner {
		padding: 0 4px;
	}
	
	.login-status {
		font-size: 10px;
		padding: 2px 4px;
		gap: 2px;
		min-width: 45px;
	}
	
	.top-bar-right {
		right: 2px;
	}
	
	.nav-inner {
		height: 56px;
		padding: 0 4px;
	}
	
	.brand {
		margin-left: -4px;
	}
	
	.brand-logo svg {
		width: 60px;
		height: 20px;
	}
	
	.primary-nav {
		margin-left: 8px;
	}
	
	.primary-nav .nav-list {
		gap: 6px;
	}
	
	.nav-link {
		font-size: 11px;
		padding: 2px 1px;
	}
	
	.nav-search {
		margin-right: 16px;
		padding: 0 4px 0 2px;
	}
	
	.search-box {
		margin-right: 4px;
	}
	
	.search-placeholder {
		font-size: 11px;
		height: 28px;
		padding: 0 10px 0 26px;
	}
	
	.actions {
		margin-right: -4px;
		gap: 6px;
	}
	
	.icon-btn {
		width: 28px;
		height: 28px;
	}
	
	.icon-btn:first-child {
		margin-left: -4px;
	}
}

/* 超小屏幕特殊处理 */
@media (max-width: 320px) {
	.top-bar {
		height: 22px;
	}
	
	.top-bar-inner {
		padding: 0 2px;
	}
	
	.login-status {
		font-size: 9px;
		padding: 1px 3px;
		gap: 1px;
		min-width: 40px;
	}
	
	.top-bar-right {
		right: 1px;
	}
	
	.nav-inner {
		height: 52px;
		padding: 0 2px;
	}
	
	.brand-logo svg {
		width: 50px;
		height: 18px;
	}
	
	.primary-nav .nav-list {
		gap: 4px;
	}
	
	.nav-link {
		font-size: 10px;
		padding: 1px 1px;
	}
	
	.search-placeholder {
		font-size: 10px;
		height: 26px;
		padding: 0 8px 0 24px;
	}
	
	.icon-btn {
		width: 26px;
		height: 26px;
	}
}

/* Chip 风格的搜索历史 */
.history-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.history-chip {
	background: #f2f2f2;
	border: 1px solid #e5e5e5;
	border-radius: 8px;
	padding: 8px 12px;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 8px;
	transition: background 0.15s ease, border-color 0.15s ease;
}

.history-chip:hover {
	background: #ebebeb;
	border-color: #dcdcdc;
}

.chip-text {
	font-size: 13px;
	color: #333;
	max-width: 220px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.chip-close {
	border: none;
	background: transparent;
	color: #999;
	cursor: pointer;
	font-size: 14px;
	line-height: 1;
	padding: 0 2px;
	border-radius: 4px;
}

.chip-close:hover {
	background: rgba(0,0,0,0.05);
	color: #666;
}

</style>

<style scoped>
.hot-search-section { margin-top: 16px; }
.hot-search-title { font-size: 14px; color: #333; font-weight: 600; margin: 8px 0; }
.hot-search-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
.hot-search-item { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 0; border-radius: 6px; transition: background .12s ease; }
.hot-search-item:hover { background: #f7f7f7; }
.hot-name { font-size: 13px; color: #333; }
</style>