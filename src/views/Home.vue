<template>
	<div class="home-page">
		<MainNav @open-login="onOpenLogin" />
		<main>
			<HeroCarousel
				@view-all="goAll"
				@view-men="goMen"
				@view-women="goWomen"
				@view-kids="goKids"
			/>
			<ProductGrid @view-all="goAll" />
		</main>
		<SiteFooter />
		<LoginDrawer 
			v-model="loginOpen" 
			:show-profile-access-message="showProfileAccessMessage"
			:access-message="loginAccessMessage"
			@login-success="onLoginSuccess" 
		/>
	</div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MainNav from '@/views/layout/MainNav.vue';
import SiteFooter from '@/views/layout/Footer.vue';
import LoginDrawer from '@/views/auth/LoginDrawer.vue';
import HeroCarousel from '@/views/home/HeroCarousel.vue';
import ProductGrid from '@/views/home/ProductGrid.vue';

export default {
	name: 'HomePage',
	components: { MainNav, SiteFooter, LoginDrawer, HeroCarousel, ProductGrid },
	setup() {
		const router = useRouter();
		const loginOpen = ref(false);
		const showProfileAccessMessage = ref(false);
		const loginAccessMessage = ref('');

		function onOpenLogin(payload = false) {
			loginOpen.value = true;
			// 兼容：true 表示来自个人中心，需要展示固定提示；字符串表示自定义提示
			if (typeof payload === 'string') {
				showProfileAccessMessage.value = false;
				loginAccessMessage.value = payload;
			} else {
				showProfileAccessMessage.value = !!payload;
				loginAccessMessage.value = '';
			}
		}

		function goAll() { router.push({ name: 'ProductListPage' }); }
		function goMen() { router.push('/men-shoes'); }
		function goWomen() { router.push('/women-shoes'); }
		function goKids() { router.push('/kids-shoes'); }
		function onLoginSuccess() {
			// 登录成功后不再跳转到个人中心，保持在首页，避免闪烁
			loginOpen.value = false;
			showProfileAccessMessage.value = false;
		}

		return { 
			loginOpen, 
			showProfileAccessMessage,
			loginAccessMessage,
			goAll, 
			goMen, 
			goWomen, 
			goKids,
			onLoginSuccess,
			onOpenLogin
		};
	}
};
</script>

<style scoped>
.home-page { 
	min-height: 100vh; 
	background: #fff; 
	width: 100%;
	box-sizing: border-box;
	overflow-x: hidden;
}

main { 
	display: grid; 
	gap: 24px; 
	width: 100%;
	box-sizing: border-box;
}

/* 响应式设计 */
@media (max-width: 1200px) {
	main {
		gap: 20px;
	}
}

@media (max-width: 960px) {
	main {
		gap: 16px;
	}
}

@media (max-width: 768px) {
	main {
		gap: 12px;
	}
}

@media (max-width: 480px) {
	main {
		gap: 8px;
	}
}
</style>
