<template>
	<section class="hero">
		<div class="hero-inner">
			<div class="slides" :style="{ transform: `translateX(-${activeIndex * 100}%)` }">
				<div class="slide" v-for="(slide, i) in slides" :key="i">
					<div class="slide-media" :style="{ backgroundImage: `url(${slide.src})` }"></div>
					<div class="slide-content">
						<h2 class="headline">{{ slide.title }}</h2>
						<div class="cta-group">
							<button
								v-for="(cta, idx) in slide.ctas"
								:key="idx"
								class="cta"
								:class="{ primary: !!cta.primary, ghost: !cta.primary }"
								@click="onCtaClick(cta.event)"
							>{{ cta.label }}</button>
						</div>
					</div>
				</div>
			</div>
			<div class="dots">
				<button v-for="i in slides.length" :key="i" class="dot" :class="{ active: activeIndex === i - 1 }" @click="go(i - 1)" />
			</div>
		</div>
	</section>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

export default {
	name: 'HeroCarousel',
	emits: ['view-all', 'view-men', 'view-women', 'view-kids'],
	setup() {
		const router = useRouter();
		const ads = ref(['/ads/ad1.jpg', '/ads/ad2.jpg']);
		const slides = ref([]);
		const activeIndex = ref(0);
		let timer = null;

		function go(index) {
			activeIndex.value = index;
		}

		function onCtaClick(event) {
			// 将既有事件语义映射到产品列表页路由参数
			if (event === 'view-women') {
				router.push({ name: 'ProductListPage', query: { shoeSex: 2 } });
				return;
			}
			if (event === 'view-men') {
				router.push({ name: 'ProductListPage', query: { shoeSex: 1 } });
				return;
			}
			if (event === 'view-kids') {
				router.push({ name: 'ProductListPage', query: { shoeSex: 3 } });
				return;
			}
			if (event === 'view-all') {
				router.push({ name: 'ProductListPage' });
				return;
			}
		}

		function buildSlides() {
			const images = ads.value || [];
			const defaultTitles = [
				'女士潮流穿搭 新季焕新从足下开始',
				'儿童休闲日常 轻便舒适每一步',
				'篮球热血开场 稳定防护强力支撑',
				'网球灵动挥拍 轻盈回弹畅快制胜',
				'儿童运动加速 活力满格自在奔跑'
			];
			const defaultCtas = [
				[
					{ label: '女士专区', event: 'view-women', primary: true },
					{ label: '男士精选', event: 'view-men' },
					{ label: '全部商品', event: 'view-all' }
				],
				[
					{ label: '儿童专区', event: 'view-kids', primary: true },
					{ label: '全部商品', event: 'view-all' }
				],
				[
					{ label: '男士运动', event: 'view-men', primary: true },
					{ label: '女士运动', event: 'view-women' },
					{ label: '全部商品', event: 'view-all' }
				],
				[
					{ label: '男士网球', event: 'view-men', primary: true },
					{ label: '女士网球', event: 'view-women' },
					{ label: '全部商品', event: 'view-all' }
				],
				[
					{ label: '儿童运动', event: 'view-kids', primary: true },
					{ label: '全部商品', event: 'view-all' }
				]
			];
			slides.value = images.map((src, i) => ({
				src,
				title: defaultTitles[i] || '品质好物 焕新出发',
				ctas: defaultCtas[i] || [
					{ label: '立即选购', event: 'view-all', primary: true }
				]
			}));
			if (activeIndex.value >= slides.value.length) activeIndex.value = 0;
		}

		function start() {
			stop();
			timer = setInterval(() => {
				if (!slides.value.length) return;
				activeIndex.value = (activeIndex.value + 1) % slides.value.length;
			}, 2500);
		}

		function stop() {
			if (timer) clearInterval(timer);
		}

		async function loadAdsManifest() {
			try {
				const res = await fetch('/ads/manifest.json', { cache: 'no-store' });
				if (res.ok) {
					const data = await res.json();
					if (Array.isArray(data.images) && data.images.length) {
						ads.value = data.images;
						activeIndex.value = 0;
						buildSlides();
					}
				}
			} catch (e) {
				// ignore, fallback to defaults
			}
		}

		onMounted(() => { buildSlides(); loadAdsManifest(); start(); });
		onBeforeUnmount(stop);

		return { ads, slides, activeIndex, go, onCtaClick };
	}
};
</script>

<style scoped>
.hero {
	background: #000;
	color: #fff;
	min-height: 70vh;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100vw;
	margin-left: calc(-50vw + 50%);
	box-sizing: border-box;
	overflow: hidden;
}

.hero-inner { 
	width: 100%; 
	overflow: hidden; 
	position: relative; 
	box-sizing: border-box;
}

.slides { 
	display: flex; 
	transition: transform .5s ease; 
	width: 100%;
}

.slide { 
	min-width: 100%; 
	position: relative; 
	display: grid; 
	grid-template-columns: 1fr; 
	box-sizing: border-box;
}

.slide-media { 
	height: 70vh; 
	background: linear-gradient(135deg, #0f0f0f, #1a1a1a); 
	width: 100%;
	background-size: cover;
	background-position: center;
}

.slide-content { 
	position: absolute; 
	left: 24px; 
	bottom: 24px; 
	right: 24px; 
	box-sizing: border-box;
}

.headline { 
	font-size: 40px; 
	font-weight: 800; 
	letter-spacing: .5px; 
	line-height: 1.2;
}

.cta-group { 
	margin-top: 14px; 
	display: flex; 
	gap: 10px; 
	flex-wrap: wrap; 
}

.cta { 
	padding: 10px 14px; 
	border-radius: 999px; 
	border: 1px solid #2a2a2a; 
	background: #111; 
	color: #fff; 
	cursor: pointer; 
	white-space: nowrap;
	box-sizing: border-box;
}

.cta.primary { 
	background: #c6ff00; 
	color: #111; 
	border-color: #c6ff00; 
	font-weight: 800; 
}

.cta.ghost:hover { 
	background: #1a1a1a; 
}

.dots { 
	position: absolute; 
	bottom: 10px; 
	left: 0; 
	right: 0; 
	display: flex; 
	gap: 8px; 
	justify-content: center; 
}

.dot { 
	width: 8px; 
	height: 8px; 
	border-radius: 50%; 
	border: none; 
	background: #444; 
	cursor: pointer; 
}

.dot.active { 
	background: #c6ff00; 
}

/* 响应式设计 */
@media (max-width: 1200px) {
	.slide-content {
		left: 20px;
		bottom: 20px;
		right: 20px;
	}
	
	.headline {
		font-size: 36px;
	}
}

@media (max-width: 960px) {
	.hero {
		min-height: 60vh;
	}
	
	.slide-media {
		height: 60vh;
	}
	
	.slide-content {
		left: 16px;
		bottom: 16px;
		right: 16px;
	}
	
	.headline {
		font-size: 32px;
	}
	
	.cta-group {
		gap: 8px;
	}
	
	.cta {
		padding: 8px 12px;
		font-size: 14px;
	}
}

@media (max-width: 768px) {
	.hero {
		min-height: 55vh;
	}
	
	.slide-media {
		height: 55vh;
	}
	
	.slide-content {
		left: 12px;
		bottom: 12px;
		right: 12px;
	}
	
	.headline {
		font-size: 28px;
	}
	
	.cta-group {
		margin-top: 12px;
		gap: 6px;
	}
	
	.cta {
		padding: 6px 10px;
		font-size: 13px;
	}
	
	.dots {
		bottom: 8px;
		gap: 6px;
	}
	
	.dot {
		width: 6px;
		height: 6px;
	}
}

@media (max-width: 480px) {
	.hero {
		min-height: 50vh;
	}
	
	.slide-media {
		height: 50vh;
	}
	
	.slide-content {
		left: 8px;
		bottom: 8px;
		right: 8px;
	}
	
	.headline {
		font-size: 24px;
	}
	
	.cta-group {
		margin-top: 10px;
		gap: 4px;
	}
	
	.cta {
		padding: 5px 8px;
		font-size: 12px;
	}
	
	.dots {
		bottom: 6px;
		gap: 4px;
	}
	
	.dot {
		width: 5px;
		height: 5px;
	}
}
</style>


