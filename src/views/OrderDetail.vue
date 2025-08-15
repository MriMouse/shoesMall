<template>
    <div class="order-detail">
        <div class="container" v-if="order">
            <div class="header">
                <h1>订单详情 #{{ order.orderId }}</h1>
                <div class="status">状态：{{ order.status || '未知' }}</div>
            </div>
            <div class="section">
                <div>下单时间：{{ order.createdAt || '-' }}</div>
                <div>订单编号：{{ order.orderNumber || '-' }}</div>
            </div>
            <div class="section">
                <div>商品合计：¥{{ (line.price * line.quantity).toFixed(2) }}</div>
                <div v-if="line.discountPrice != null">折后合计：¥{{ (line.discountPrice * line.quantity).toFixed(2) }}</div>
                <div>数量：{{ line.quantity }}</div>
                <div>尺码：{{ line.sizeId }}</div>
            </div>
            <div class="actions">
                <router-link to="/profile" class="btn btn-secondary">返回个人中心</router-link>
            </div>
        </div>
    </div>
</template>

<script>
import { OrderAPI, OrderShoeNumAPI } from '../api'

export default {
    name: 'OrderDetailPage',
    data() {
        return { order: null, line: { price: 0, discountPrice: null, quantity: 1, sizeId: '' } }
    },
    methods: {
        async load() {
            const orderId = Number(this.$route.query.orderId)
            if (!orderId) return
            const [{ data: od }, { data: nums }] = await Promise.all([
                OrderAPI.getById(orderId),
                OrderShoeNumAPI.getByOrderId(orderId)
            ])
            this.order = od?.data || null
            const first = (nums?.data || [])[0] || { shoeNum: 1 }
            // 注意：后端 Order 未携带价格，前端可根据下单时保存的价格扩展，此处简化为从路由读取
            const q = this.$route.query
            this.line = {
                price: Number(q.price || 0),
                discountPrice: q.discountPrice != null ? Number(q.discountPrice) : null,
                quantity: first.shoeNum || 1,
                sizeId: this.order?.sizeId
            }
        }
    },
    mounted() { this.load() }
}
</script>

<style scoped>
.order-detail { min-height: 100vh; background: #fff; padding: 2rem 0; }
.container { max-width: 900px; margin: 0 auto; padding: 0 1rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.section { border: 1px solid var(--color-border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
.actions { display: flex; justify-content: flex-end; }
</style>



