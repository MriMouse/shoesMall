<template>
	<section class="product-grid">
		<div class="grid-inner">
			<header class="section-header">
				<h3 class="section-title">精选商品</h3>
				<button class="view-all" @click="$emit('view-all')">查看全部</button>
			</header>
			<div class="grid">
				<div 
					class="card" 
					v-for="product in featured" 
					:key="product.shoeId"
					@click="goDetail(product.shoeId)"
					:style="product._thumb ? { backgroundImage: 'url(' + product._thumb + ')', backgroundSize: '80%', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: '#eaeeef' } : { backgroundColor: '#eaeeef' }"
				>
					<div class="badge" v-if="product.discountPrice && product.discountPrice < product.price">限时直降</div>
					<div class="card-media">
						<div v-if="!product._thumb" class="no-image">📷</div>
					</div>
					<div class="card-body">
						<div class="price-row">
							<span class="current">¥{{ product.discountPrice || product.price }}</span>
							<span v-if="product.discountPrice && product.discountPrice < product.price" class="original">¥{{ product.price }}</span>
						</div>
						<div class="name" :title="product.name">{{ product.name }}</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
	name: 'ProductGrid',
	emits: ['view-all'],
	setup() {
		const router = useRouter();
		const featured = ref([]);

		const loadFeatured = async () => {
			try {
				const res = await axios.post('/api/shoe/getAll', {}, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
				const list = (res.data && res.data.data) ? res.data.data.slice(0, 8) : [];
				const withImages = await Promise.all(list.map(async (p) => {
					try {
						const imgRes = await axios.get(`/api/shoeImg/list/${p.shoeId}`);
						const imgs = imgRes.data?.data || [];
						p._thumb = imgs.length ? `/api/shoeImg/getImage/${imgs[0].imagePath}` : '';
					} catch (e) {
						p._thumb = '';
					}
					return p;
				}));
				featured.value = withImages;
			} catch (e) {
				featured.value = [];
			}
		};

		const goDetail = (shoeId) => {
			router.push(`/product/${shoeId}`);
		};

		onMounted(loadFeatured);

		return { featured, goDetail };
	}
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
	gap: 6px; 
	background: #fff; 
	width: 100%;
	box-sizing: border-box;
}

.card { 
	border: 1px solid #eee; 
	border-radius: 0; 
	overflow: hidden; 
	background: #fff; 
	transition: transform .15s ease, box-shadow .15s ease; 
	box-sizing: border-box;
	width: 100%;
	cursor: pointer;
}

.card:hover { 
	transform: translateY(-3px); 
	box-shadow: 0 10px 24px rgba(0,0,0,0.08); 
}

.card-media { 
	background: transparent; 
	aspect-ratio: 1/1; 
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.card-media img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.no-image {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28px;
	color: #999;
}

.card-body { 
	padding: 12px; 
	box-sizing: border-box;
}

.price-row {
	display: flex;
	align-items: baseline;
	gap: 8px;
	margin-bottom: 6px;
}

.current {
	font-weight: 800;
	color: #111;
}

.original {
	color: #999;
	text-decoration: line-through;
}

.name {
	font-size: 14px;
	color: #333;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.badge {
	position: absolute;
	margin: 8px;
	padding: 4px 8px;
	background: #111;
	color: #fff;
	border-radius: 4px;
	font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
	.grid-inner {
		max-width: 100%;
		padding: 20px 16px 40px;
	}
	
	.grid {
		gap: 6px;
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
		gap: 6px;
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
		gap: 4px;
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
		gap: 6px;
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


