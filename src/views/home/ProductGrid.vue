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
.product-grid { 
	background: #fff; 
	width: 100%;
	box-sizing: border-box;
}

.grid-inner { 
	max-width: 1200px; 
	margin: 0 auto; 
	padding: 24px 8px 48px; 
	box-sizing: border-box;
	width: 100%;
}

.section-header { 
	display: flex; 
	align-items: baseline; 
	justify-content: space-between; 
	margin-bottom: 16px; 
	box-sizing: border-box;
}

.section-title { 
	font-size: 22px; 
	font-weight: 800; 
	letter-spacing: .3px; 
}

.view-all { 
	background: transparent; 
	border: none; 
	color: #000; 
	cursor: pointer; 
	font-weight: 700; 
	white-space: nowrap;
}

.grid { 
	display: grid; 
	grid-template-columns: repeat(4, 1fr); 
	gap: 16px; 
	width: 100%;
	box-sizing: border-box;
}

.card { 
	border: 1px solid #eee; 
	border-radius: 10px; 
	overflow: hidden; 
	background: #fff; 
	transition: transform .15s ease, box-shadow .15s ease; 
	box-sizing: border-box;
	width: 100%;
}

.card:hover { 
	transform: translateY(-3px); 
	box-shadow: 0 10px 24px rgba(0,0,0,0.08); 
}

.card-media { 
	background: linear-gradient(135deg, #f0f0f0, #e6e6e6); 
	aspect-ratio: 4/3; 
	width: 100%;
}

.card-body { 
	padding: 12px; 
	box-sizing: border-box;
}

.line { 
	height: 10px; 
	background: #eaeaea; 
	border-radius: 4px; 
	margin-bottom: 8px; 
	width: 100%;
}

.line.short { 
	width: 60%; 
}

/* 响应式设计 */
@media (max-width: 1200px) {
	.grid-inner {
		max-width: 100%;
		padding: 20px 16px 40px;
	}
	
	.grid {
		gap: 16px;
	}
}

@media (max-width: 960px) {
	.grid-inner {
		padding: 16px 12px 32px;
	}
	
	.section-title {
		font-size: 20px;
	}
	
	.grid {
		grid-template-columns: repeat(3, 1fr);
		gap: 14px;
	}
}

@media (max-width: 768px) {
	.grid-inner {
		padding: 12px 8px 24px;
	}
	
	.section-header {
		margin-bottom: 12px;
	}
	
	.section-title {
		font-size: 18px;
	}
	
	.grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}
	
	.card-body {
		padding: 10px;
	}
	
	.line {
		height: 8px;
		margin-bottom: 6px;
	}
}

@media (max-width: 480px) {
	.grid-inner {
		padding: 8px 6px 20px;
	}
	
	.section-header {
		margin-bottom: 10px;
	}
	
	.section-title {
		font-size: 16px;
	}
	
	.grid {
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}
	
	.card-body {
		padding: 8px;
	}
	
	.line {
		height: 6px;
		margin-bottom: 4px;
	}
	
	.line.short {
		width: 50%;
	}
}
</style>


