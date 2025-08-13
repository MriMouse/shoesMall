<template>
	<div class="home-page" :class="{ blurred: loginOpen }">
		<MainNav @open-login="loginOpen = true" />
		<main>
			<HeroCarousel
				@view-all="goAll"
				@view-men="goMen"
				@view-women="goWomen"
			/>
			<ProductGrid @view-all="goAll" />
		</main>
		<LoginDrawer v-model="loginOpen" @login-success="onLoginSuccess" />
	</div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MainNav from '@/components/layout/MainNav.vue';
import LoginDrawer from '@/components/auth/LoginDrawer.vue';
import HeroCarousel from '@/components/home/HeroCarousel.vue';
import ProductGrid from '@/components/home/ProductGrid.vue';

export default {
	name: 'HomePage',
	components: { MainNav, LoginDrawer, HeroCarousel, ProductGrid },
	setup() {
		const router = useRouter();
		const loginOpen = ref(false);

		function goAll() { router.push({ name: 'ProductListPage' }); }
		function goMen() { router.push('/men-shoes'); }
		function goWomen() { router.push('/women-shoes'); }
		function onLoginSuccess() { router.push('/profile'); }

		return { loginOpen, goAll, goMen, goWomen, onLoginSuccess };
	}
};
</script>

<style scoped>
.home-page { min-height: 100vh; background: #fff; }
.home-page.blurred { filter: blur(2px); pointer-events: none; user-select: none; }
main { display: grid; gap: 24px; }
</style>
