<template>
	<section class="product-grid">
		<div class="grid-inner">
			<header class="section-header">
				<h3 class="section-title">精选商品</h3>
				<button class="view-all" @click="$emit('view-all')">查看全部</button>
			</header>
			<div class="grid">
				<div class="card" v-for="i in 8" :key="i">
					<div class="card-media"></div>
					<div class="card-body">
						<div class="line"></div>
						<div class="line short"></div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
export default {
	name: 'ProductGrid',
	emits: ['view-all']
};
</script>

<style scoped>
.product-grid { background: #fff; }
.grid-inner { 
	max-width: 1200px; 
	margin: 0 auto; 
	padding: 24px 8px 48px; 
}
.section-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; }
.section-title { font-size: 22px; font-weight: 800; letter-spacing: .3px; }
.view-all { background: transparent; border: none; color: #000; cursor: pointer; font-weight: 700; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.card { border: 1px solid #eee; border-radius: 10px; overflow: hidden; background: #fff; transition: transform .15s ease, box-shadow .15s ease; }
.card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.08); }
.card-media { background: linear-gradient(135deg, #f0f0f0, #e6e6e6); aspect-ratio: 4/3; }
.card-body { padding: 12px; }
.line { height: 10px; background: #eaeaea; border-radius: 4px; margin-bottom: 8px; }
.line.short { width: 60%; }
@media (min-width: 720px) { .grid { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(4, 1fr); gap: 18px; } }
</style>


