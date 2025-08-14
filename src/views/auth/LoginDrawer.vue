<template>
	<div>
		<div class="overlay" v-if="modelValue" @click="onClose"></div>
		<aside class="drawer" :class="{ open: modelValue }" @click.stop>
			<header class="drawer-header">
				<h3 class="drawer-title">登录</h3>
				<button class="close-btn" @click="onClose" aria-label="关闭">×</button>
			</header>
			<section class="drawer-body">
				<form class="login-form" @submit.prevent="submit">
					<label class="field">
						<span>邮箱</span>
						<input type="email" v-model="email" placeholder="请输入邮箱" />
					</label>
					<label class="field">
						<span>密码</span>
						<input type="password" v-model="password" placeholder="请输入密码" />
					</label>
					<button class="submit-btn" type="submit">登录</button>
				</form>
			</section>
		</aside>
	</div>
</template>

<script>
import { ref, watch } from 'vue';

export default {
	name: 'LoginDrawer',
	props: {
		modelValue: { type: Boolean, default: false }
	},
	emits: ['update:modelValue', 'login-success'],
	setup(props, { emit }) {
		const email = ref('');
		const password = ref('');

		function onClose() {
			emit('update:modelValue', false);
		}

		function submit() {
			// 模拟登录
			localStorage.setItem('user', JSON.stringify({ email: email.value }));
			emit('login-success');
			emit('update:modelValue', false);
		}

		watch(() => props.modelValue, (open) => {
			if (open) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		});

		return { email, password, onClose, submit };
	}
};
</script>

<style scoped>
.overlay {
	position: fixed;
	inset: 0;
	background: rgba(0,0,0,0.5);
	backdrop-filter: blur(4px);
	z-index: 999;
}
.drawer {
	position: fixed;
	top: 0;
	right: 0;
	height: 100vh;
	width: 360px;
	max-width: 92vw;
	background: #111;
	color: #fff;
	transform: translateX(100%);
	transition: transform .25s ease;
	z-index: 1000;
	display: flex;
	flex-direction: column;
}
.drawer.open { transform: translateX(0); }
.drawer-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	height: 64px;
	padding: 0 16px;
	border-bottom: 1px solid rgba(255,255,255,0.08);
	position: relative;
}
.drawer-title { font-weight: 700; letter-spacing: .5px; }
.close-btn {
	position: absolute;
	top: 12px;
	right: 12px;
	width: 36px; 
	height: 36px; 
	border-radius: 50%; 
	border: 1px solid rgba(255,255,255,0.32);
	background: transparent; 
	color: #fff; 
	cursor: pointer;
	font-size: 18px;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background .15s ease, border-color .15s ease;
}
.close-btn:hover {
	background: rgba(255,255,255,0.1);
	border-color: rgba(255,255,255,0.6);
}
.drawer-body { padding: 16px; }
.login-form { display: grid; gap: 12px; }
.field { display: grid; gap: 6px; }
.field span { font-size: 12px; color: #cfcfcf; }
.field input {
	background: #1a1a1a; border: 1px solid #2a2a2a; color: #fff;
	padding: 10px 12px; border-radius: 8px; outline: none;
}
.field input:focus { border-color: #c6ff00; }
.submit-btn {
	margin-top: 4px; background: #c6ff00; color: #111; font-weight: 800; letter-spacing: .5px;
	border: none; padding: 12px; border-radius: 10px; cursor: pointer;
}
.submit-btn:hover { filter: brightness(0.95); }
</style>


