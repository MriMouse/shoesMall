<template>
	<section class="hero">
		<div class="hero-inner">
			<div class="slides" :style="{ transform: `translateX(-${activeIndex * 100}%)` }">
				<div class="slide" v-for="i in 3" :key="i">
					<div class="slide-media"></div>
					<div class="slide-content">
						<h2 class="headline">主推产品占位标题 {{ i }}</h2>
						<div class="cta-group">
							<button class="cta primary" @click="$emit('view-all')">查看全部</button>
							<button class="cta ghost" @click="$emit('view-men')">男鞋</button>
							<button class="cta ghost" @click="$emit('view-women')">女鞋</button>
						</div>
					</div>
				</div>
			</div>
			<div class="dots">
				<button v-for="i in 3" :key="i" class="dot" :class="{ active: activeIndex === i - 1 }" @click="go(i - 1)" />
			</div>
		</div>
	</section>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default {
	name: 'HeroCarousel',
	emits: ['view-all', 'view-men', 'view-women'],
	setup() {
		const activeIndex = ref(0);
		let timer = null;

		function go(index) {
			activeIndex.value = index;
		}

		function start() {
			stop();
			timer = setInterval(() => {
				activeIndex.value = (activeIndex.value + 1) % 3;
			}, 4000);
		}

		function stop() {
			if (timer) clearInterval(timer);
		}

		onMounted(start);
		onBeforeUnmount(stop);

		return { activeIndex, go };
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


