<template>
	<footer class="site-footer" role="contentinfo">
		<div class="footer-container">
			<div class="footer-grid">
				<section class="footer-col">
					<h3 class="col-title">帮助中心</h3>
					<ul class="col-list">
						<li><a href="javascript:void(0)">在线客服</a></li>
						<li><a href="javascript:void(0)">客服热线</a></li>
						<li><a href="javascript:void(0)">关于我们</a></li>
						<li><a href="javascript:void(0)">职业发展</a></li>
						<li><a href="javascript:void(0)">员工登录</a></li>
						<li><a href="javascript:void(0)">常见问题</a></li>
					</ul>
				</section>

				<section class="footer-col">
					<h3 class="col-title">网站政策</h3>
					<ul class="col-list">
						<li><a href="javascript:void(0)">物流配送规则</a></li>
						<li><a href="javascript:void(0)">退换货规则</a></li>
						<li><a href="javascript:void(0)">会员规则</a></li>
						<li><a href="javascript:void(0)">下单指南</a></li>
						<li><a href="javascript:void(0)">算法服务说明</a></li>
						<li><a href="javascript:void(0)">印制服务条款</a></li>
					</ul>
				</section>

				<section class="footer-col">
					<h3 class="col-title">更多精彩</h3>
					<ul class="col-list">
						<li><a href="javascript:void(0)">商城 APP</a></li>
						<li><a href="javascript:void(0)">CONFIRMED APP</a></li>
						<li><a href="javascript:void(0)">微信小程序</a></li>
						<li><a href="javascript:void(0)">会员中心</a></li>
					</ul>
				</section>

				<section class="footer-col">
					<h3 class="col-title">关注我们</h3>
					<ul class="social-list">
						<li class="social-item">
							<span class="social-icon" aria-hidden="true">🟩</span>
							<span>微信</span>
						</li>
						<li class="social-item">
							<span class="social-icon" aria-hidden="true">🟦</span>
							<span>微博</span>
						</li>
						<li class="social-item">
							<span class="social-icon" aria-hidden="true">🎵</span>
							<span>抖音</span>
						</li>
					</ul>
				</section>

				<section class="footer-col">
					<h3 class="col-title">企业团购热线及邮箱：</h3>
					<div class="contact-block">
						<div>热线：<a href="tel:4008801515">400-880-1515</a></div>
						<div>邮箱：<a href="mailto:b2b@example.com">b2b@example.com</a></div>
					</div>
					<div class="payments">
						<span class="pay-label">我们接受下列支付方式：</span>
						<div class="pay-icons">
							<span class="pay-badge">微信支付</span>
							<span class="pay-badge">支付宝</span>
						</div>
					</div>
				</section>
			</div>

			<div class="footer-bottom">
				<div class="meta-left">
					<span class="meta-item">中国</span>
					<a class="meta-item" href="javascript:void(0)">隐私声明</a>
					<a class="meta-item" href="javascript:void(0)">使用条款</a>
				</div>
				<div class="meta-right">
					<span class="meta-item">© 鞋品商城</span>
					<span class="meta-item">苏ICP备14048805号-1</span>
					<span class="meta-item">苏公网安备32059002005571号</span>
					<span class="meta-item">营业执照</span>
				</div>
			</div>
		</div>
	</footer>
</template>

<script>
export default {
	name: 'SiteFooter',
};
</script>

<style scoped>
.site-footer {
	background: #f7f7f7;
	border-top: 1px solid #eee;
	color: #222;
	width: 100%;
	margin-top: 24px;
}

.footer-container {
	max-width: 1200px;
	margin: 0 auto;
	padding: 32px 16px 20px;
	box-sizing: border-box;
}

.footer-grid {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 24px;
}

.footer-col {}

.col-title {
	font-size: 16px;
	font-weight: 700;
	margin: 0 0 12px;
}

.col-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: grid;
	gap: 8px;
}

.col-list a {
	color: #222;
	text-decoration: none;
	font-size: 14px;
}

.col-list a:hover {
	text-decoration: underline;
}

.social-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: grid;
	gap: 10px;
}

.social-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.social-icon { width: 18px; display: inline-flex; align-items: center; justify-content: center; }

.contact-block { color: #333; font-size: 14px; display: grid; gap: 6px; margin-bottom: 10px; }
.contact-block a { color: inherit; text-decoration: none; }
.contact-block a:hover { text-decoration: underline; }

.payments { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.pay-label { font-size: 13px; color: #666; }
.pay-icons { display: flex; gap: 8px; }
.pay-badge { background: #fff; border: 1px solid #e5e5e5; padding: 4px 8px; border-radius: 6px; font-size: 12px; }

.footer-bottom {
	margin-top: 28px;
	padding-top: 16px;
	border-top: 1px solid #eee;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	flex-wrap: wrap;
}

.meta-left, .meta-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.meta-item { color: #666; font-size: 12px; text-decoration: none; }
.meta-left .meta-item { cursor: pointer; }
.meta-left .meta-item:hover { text-decoration: underline; }

@media (max-width: 960px) {
	.footer-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
	.footer-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
	.footer-grid { grid-template-columns: 1fr; }
	.footer-container { padding: 24px 12px 16px; }
}
</style>


