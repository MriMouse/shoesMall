<template>
    <header class="main-nav" :class="{ 'is-sticky': isSticky }" @mouseleave="scheduleClose">
		<div class="nav-inner">
			<div class="brand" @click="goHome" aria-label="ShoesMall Home">
				<div class="brand-logo" role="img" aria-label="Shoes Logo">
					<svg viewBox="0 0 140 44" width="112" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g fill="none" stroke-linecap="round" stroke-linejoin="round">
							<!-- 轮廓白描 + 内嵌黑线，黑白相间，在黑色背景上清晰可辨 -->
							<path d="M10 30c8 0 16-2.5 24-8 3.5-2.6 5.5-6.5 8.5-6.5 4 0 9.5 7.5 18 10 7 2 12 2.5 17 6.5 2.8 2.2 4.8 5 4.8 7.2 0 2.2-2.4 3.8-6.8 3.8H26c-9.5 0-14-1-16.8-2.6-2.4-1.4-3.4-3-3.4-5.2 0-2.7 2.7-4.9 5-5.2z" stroke="#fff" stroke-width="3"/>
							<path d="M10 30c8 0 16-2.5 24-8 3.5-2.6 5.5-6.5 8.5-6.5 4 0 9.5 7.5 18 10 7 2 12 2.5 17 6.5 2.8 2.2 4.8 5 4.8 7.2 0 2.2-2.4 3.8-6.8 3.8H26c-9.5 0-14-1-16.8-2.6-2.4-1.4-3.4-3-3.4-5.2 0-2.7 2.7-4.9 5-5.2z" stroke="#0a0a0a" stroke-width="1.5"/>

							<!-- 鞋口与后跟 -->
							<path d="M61 16c2.8 1.6 6.5 3.9 9 5.5" stroke="#fff" stroke-width="3"/>
							<path d="M61 16c2.8 1.6 6.5 3.9 9 5.5" stroke="#0a0a0a" stroke-width="1.5"/>

							<!-- 鞋带（黑白双线叠加） -->
							<path d="M49 22h10M43 26h11M36 30h11" stroke="#fff" stroke-width="3"/>
							<path d="M49 22h10M43 26h11M36 30h11" stroke="#0a0a0a" stroke-width="1.6"/>

							<!-- 鞋底高光 -->
							<path d="M24 40.5h84" stroke="#fff" stroke-width="2"/>
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
                <div class="search-box" :class="{ focus: isSearchFocused }">
					<svg class="search-icon" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" shape-rendering="geometricPrecision">
						<circle cx="9" cy="9" r="6" vector-effect="non-scaling-stroke"/>
						<path d="M18 18l-4.5-4.5" vector-effect="non-scaling-stroke"/>
					</svg>
                    <input
						class="search-input"
						type="search"
						v-model="searchQuery"
						placeholder="搜索商品、系列或分类"
						@focus="isSearchFocused = true"
						@input="updateSuggestions"
						@keydown.enter.prevent="submitSearch"
						@keydown.esc.prevent="clearSearch"
					/>
                    <div class="search-icon-mask"></div>
				</div>
				<div v-if="isSearchFocused && suggestions.length" class="suggest-panel">
					<div
						v-for="item in suggestions"
						:key="item.key"
						class="suggest-item"
						@click="selectSuggestion(item)"
					>
						<span v-html="highlight(item.label)"></span>
					</div>
					<div class="suggest-footer" @click="submitSearch">按回车搜索 “{{ searchQuery }}”</div>
				</div>
			</div>
            <div class="actions">
				<button class="icon-btn" @click="goCart" aria-label="购物袋">
					<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M6 8h12l-1 12H7L6 8z"/>
						<path d="M9 8a3 3 0 0 1 6 0"/>
					</svg>
				</button>
				<button class="icon-btn" @click="$emit('open-login')" aria-label="登录">
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
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

export default {
	name: 'MainNav',
	emits: ['open-login'],
	setup() {
		const router = useRouter();
		const isSticky = ref(false);
        const activeMenuIndex = ref(null);
        const currentGroup = ref(null);
		const hoveredBrand = ref(null);
		let closeTimer = null;

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
			}
		]);

		const handleScroll = () => {
			isSticky.value = window.scrollY > 10;
		};

		onMounted(() => {
			window.addEventListener('scroll', handleScroll, { passive: true });
		});

		onBeforeUnmount(() => {
			window.removeEventListener('scroll', handleScroll);
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
			router.push('/profile');
		}

		function goCart() {
			// 目前没有购物袋页面，占位跳转到产品列表
			router.push({ name: 'ProductListPage' });
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

		function updateSuggestions() {
			const q = searchQuery.value.trim().toLowerCase();
			if (!q) { suggestions.value = []; return; }
			const base = [
				{ key: 'ultra', label: 'Ultraboost 系列' },
				{ key: 'stan', label: 'Stan Smith 经典' },
				{ key: 'campus', label: 'Campus 休闲' },
				{ key: 'running', label: '跑步 男鞋' },
				{ key: 'training', label: '训练 女鞋' },
				{ key: 'kids', label: '童鞋 热门' }
			];
			suggestions.value = base.filter(i => i.label.toLowerCase().includes(q)).slice(0, 6);
		}

		function submitSearch() {
			if (!searchQuery.value.trim()) return;
			router.push({ name: 'ProductListPage', query: { q: searchQuery.value.trim() } });
			isSearchFocused.value = false;
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
			highlight
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
	background: #000;
	color: #fff;
	border-bottom: 1px solid rgba(255,255,255,0.08);
}
.main-nav.is-sticky {
	box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}
.nav-inner {
	max-width: 1200px;
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 64px;
	padding: 0 16px;
}
.brand {
	display: flex;
	align-items: center;
	cursor: pointer;
}
.brand-logo { padding: 2px 0; }
.brand-logo svg { display: block; filter: drop-shadow(0 1px 0 rgba(255,255,255,0.08)); }
.primary-nav .nav-list {
	list-style: none;
	display: flex;
	gap: 24px;
	align-items: center;
}
.primary-nav { margin-left: 72px; }
.nav-search { flex: 1; display: flex; justify-content: flex-end; padding: 0 24px 0 8px; position: relative; }
.search-box { width: 44%; max-width: 460px; min-width: 260px; position: relative; margin-right: 16px; }
.search-box .search-icon {
	position: absolute;
	left: 10px;
	top: 50%;
	transform: translateY(-50%);
	color: #e6e6e6;
	filter: none;
	z-index: 3; /* 置于输入框之上，避免被 backdrop-filter 模糊 */
	pointer-events: none;
}
.search-icon-mask { position: absolute; left: 0; top: 0; bottom: 0; width: 36px; border-top-left-radius: 999px; border-bottom-left-radius: 999px; background: transparent; z-index: 2; pointer-events: none; }
.search-input {
	width: 100%; height: 36px; border-radius: 999px; border: 1px solid #2a2a2a; background: rgba(255,255,255,0.06);
	backdrop-filter: blur(4px); color: #fff; padding: 0 14px 0 36px; outline: none;
	z-index: 1; position: relative;
	transition: border-color .15s ease, background .15s ease;
}
.search-box.focus .search-input { border-color: #c6ff00; background: rgba(255,255,255,0.1); }
.suggest-panel {
	position: absolute; top: 42px; left: 0; width: 100%; background: rgba(17,17,17,0.96);
	backdrop-filter: blur(8px); border: 1px solid #2a2a2a; border-radius: 12px; padding: 8px; z-index: 1001;
}
.suggest-item { padding: 8px 10px; border-radius: 8px; color: #eee; cursor: pointer; }
.suggest-item:hover { background: rgba(255,255,255,0.06); }
.suggest-footer { padding: 10px; border-top: 1px dashed #2a2a2a; color: #bbb; cursor: pointer; border-radius: 0 0 12px 12px; }
.suggest-footer:hover { background: rgba(255,255,255,0.06); color: #fff; }
mark { background: #c6ff00; color: #111; border-radius: 4px; padding: 0 2px; }
.nav-item {
	position: relative;
}
.nav-link {
	font-family: Helvetica Neue, Arial, sans-serif;
	font-weight: 600;
	font-size: 16px;
	padding: 8px 4px;
	color: #fff;
	cursor: pointer;
	border-bottom: 2px solid transparent;
	transition: border-color .2s ease;
}
.nav-item:hover .nav-link {
	border-color: #c6ff00; /* 荧光绿强调 */
}
.mega-menu {
	position: fixed;
	top: 64px; /* 与导航高度一致 */
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
.actions {
	display: flex;
	align-items: center;
	gap: 12px;
}
.icon-btn {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background: transparent;
	border: 1.5px solid #fff;
	color: #fff;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: background .15s ease, transform .15s ease, color .15s ease, border-color .15s ease;
}
.icon-btn:hover { background: #1c1c1c; color: #fff; border-color: #fff; transform: translateY(-1px); }

@media (max-width: 960px) {
	.mega-menu { top: 56px; min-height: 360px; padding: 16px; grid-template-columns: 1fr; }
	.mega-left { border: none; padding-right: 0; }
	.mega-right { padding-left: 0; margin-top: 12px; }
	.preview-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>



