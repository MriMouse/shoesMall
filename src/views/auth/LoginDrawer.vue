<template>
	<div>
		<div class="overlay" v-if="modelValue"></div>
		<aside class="drawer" :class="{ open: modelValue }" @click.stop>
			<header class="drawer-header">
				<h3 class="drawer-title">{{ currentView === 'login' ? '登录' : currentView === 'register' ? '注册' : currentView === 'forgot' ? '忘记密码' : '重置密码' }}</h3>
				<button class="close-btn" @click="onClose" aria-label="关闭">×</button>
			</header>
			<div class="drawer-content">
				<!-- 登录页面 -->
				<div v-if="currentView === 'login'" class="login-form">
					<form @submit.prevent="handleLogin" novalidate>
						<div class="input-group">
							<label for="username">用户名</label>
							<input type="text" id="username" v-model="loginForm.username" placeholder="请输入用户名" />
						</div>
						<div class="input-group">
							<label for="password">密码</label>
							<input type="password" id="password" v-model="loginForm.password" placeholder="请输入密码" />
						</div>
						<button type="submit" class="submit-btn" :disabled="loginLoading">
							{{ loginLoading ? '登录中...' : '登录' }}
						</button>
					</form>
					<div class="form-links">
						<button class="link-btn" @click="currentView = 'register'">注册新账号</button>
						<button class="link-btn" @click="currentView = 'forgot'">忘记密码？</button>
					</div>
					<p v-if="loginError" class="error-message">{{ loginError }}</p>
				</div>

				<!-- 注册页面 -->
				<div v-if="currentView === 'register'" class="register-form">
					<form @submit.prevent="handleRegister" novalidate>
						<div class="input-group">
							<label for="reg-username">用户名</label>
							<input type="text" id="reg-username" v-model="registerForm.username" placeholder="请输入用户名" />
						</div>
						<div class="input-group">
							<label for="reg-email">邮箱</label>
							<input type="email" id="reg-email" v-model="registerForm.email" placeholder="请输入邮箱" />
						</div>
						<div class="input-group">
							<label for="reg-gender">性别</label>
							<select id="reg-gender" v-model="registerForm.gender">
								<option value="">请选择性别</option>
								<option value="男">男</option>
								<option value="女">女</option>
							</select>
						</div>
						<div class="input-group">
							<label for="reg-password">密码</label>
							<input type="password" id="reg-password" v-model="registerForm.password" placeholder="请输入密码" />
						</div>
						<button type="submit" class="submit-btn" :disabled="registerLoading">
							{{ registerLoading ? '注册中...' : '注册' }}
						</button>
					</form>
					<div class="form-links">
						<button class="link-btn" @click="currentView = 'login'">返回登录</button>
					</div>
					<p v-if="registerError" class="error-message">{{ registerError }}</p>
					<p v-if="registerSuccess" class="success-message">{{ registerSuccess }}</p>
				</div>

				<!-- 忘记密码页面 -->
				<div v-if="currentView === 'forgot'" class="forgot-form">
					<form @submit.prevent="handleGetCode" novalidate>
						<div class="input-group">
							<label for="forgot-username">用户名</label>
							<input type="text" id="forgot-username" v-model="forgotForm.username" placeholder="请输入用户名" />
						</div>
						<div class="input-group">
							<label for="forgot-email">邮箱</label>
							<input type="email" id="forgot-email" v-model="forgotForm.email" placeholder="请输入邮箱" />
						</div>
						<button type="submit" class="submit-btn" :disabled="codeLoading">
							{{ codeLoading ? '发送中...' : '获取验证码' }}
						</button>
					</form>
					<div class="form-links">
						<button class="link-btn" @click="currentView = 'login'">返回登录</button>
					</div>
					<p v-if="forgotError" class="error-message">{{ forgotError }}</p>
					<p v-if="forgotSuccess" class="success-message">{{ forgotSuccess }}</p>
				</div>

				<!-- 重置密码页面 -->
				<div v-if="currentView === 'reset'" class="reset-form">
					<form @submit.prevent="handleResetPassword" novalidate>
						<div class="input-group">
							<label for="reset-code">验证码</label>
							<input type="text" id="reset-code" v-model="resetForm.code" placeholder="请输入验证码" />
						</div>
						<div class="input-group">
							<label for="reset-password">新密码</label>
							<input type="password" id="reset-password" v-model="resetForm.newPassword" placeholder="请输入新密码" />
						</div>
						<div class="input-group">
							<label for="reset-confirm">确认密码</label>
							<input type="password" id="reset-confirm" v-model="resetForm.confirmPassword" placeholder="请再次输入新密码" />
						</div>
						<button type="submit" class="submit-btn" :disabled="resetLoading">
							{{ resetLoading ? '重置中...' : '重置密码' }}
						</button>
					</form>
					<div class="form-links">
						<button class="link-btn" @click="currentView = 'login'">返回登录</button>
					</div>
					<p v-if="resetError" class="error-message">{{ resetError }}</p>
					<p v-if="resetSuccess" class="success-message">{{ resetSuccess }}</p>
				</div>
			</div>
		</aside>
	</div>
</template>

<script>
import { ref, watch, onBeforeUnmount } from 'vue';
import axios from 'axios';

export default {
	name: 'LoginDrawer',
	props: { modelValue: Boolean },
	emits: ['update:modelValue', 'login-success'],
	setup(props, { emit }) {
		// 当前视图状态
		const currentView = ref('login');
		
		// 登录表单
		const loginForm = ref({
			username: '',
			password: ''
		});
		const loginLoading = ref(false);
		const loginError = ref('');

		// 注册表单
		const registerForm = ref({
			username: '',
			email: '',
			gender: '',
			password: ''
		});
		const registerLoading = ref(false);
		const registerError = ref('');
		const registerSuccess = ref('');

		// 忘记密码表单
		const forgotForm = ref({
			username: '',
			email: ''
		});
		const codeLoading = ref(false);
		const forgotError = ref('');
		const forgotSuccess = ref('');
		const resetToken = ref('');

		// 重置密码表单
		const resetForm = ref({
			code: '',
			newPassword: '',
			confirmPassword: ''
		});
		const resetLoading = ref(false);
		const resetError = ref('');
		const resetSuccess = ref('');

		// 关闭抽屉
		const onClose = () => {
			emit('update:modelValue', false);
			resetForms();
		};

		// 重置所有表单
		const resetForms = () => {
			loginForm.value = { username: '', password: '' };
			registerForm.value = { username: '', email: '', gender: '', password: '' };
			forgotForm.value = { username: '', email: '' };
			resetForm.value = { code: '', newPassword: '', confirmPassword: '' };
			loginError.value = '';
			registerError.value = '';
			registerSuccess.value = '';
			forgotError.value = '';
			forgotSuccess.value = '';
			resetError.value = '';
			resetSuccess.value = '';
			currentView.value = 'login';
		};

		// 登录处理
		const handleLogin = async () => {
			// 自定义必填校验（替代浏览器原生提示）
			if (!loginForm.value.username || !loginForm.value.password) {
				loginError.value = '请完整填写用户名与密码';
				return;
			}
			loginLoading.value = true;
			loginError.value = '';
			
			try {
				// 使用URLSearchParams来发送表单数据
				const params = new URLSearchParams();
				params.append('username', loginForm.value.username);
				params.append('password', loginForm.value.password);
				
				const response = await axios.post('/api/usersLogin/userLogin', params, {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				});

				if (response.data.code === 200 && response.data.data === true) {
					// 旧格式：只有布尔值，使用固定的用户ID
					const userData = {
						username: loginForm.value.username,
						id: 1 // 使用固定的用户ID
					};
					localStorage.setItem('user', JSON.stringify(userData));
					emit('login-success');
					onClose();
					// 登录成功后跳转到主页面
					window.location.href = '/';
				} else if (response.data.code === 200 && response.data.data && response.data.data.success) {
					// 新的登录响应格式，包含用户信息
					const userInfo = response.data.data;
					const userData = {
						username: userInfo.username,
						id: userInfo.userId
					};
					localStorage.setItem('user', JSON.stringify(userData));
					emit('login-success');
					onClose();
					// 登录成功后跳转到主页面
					window.location.href = '/';
				} else {
					loginError.value = '登录失败，密码或用户名错误';
				}
			} catch (error) {
				console.error('登录错误:', error);
				if (error.response?.data?.msg) {
					loginError.value = error.response.data.msg;
				} else if (error.code === 'ERR_NETWORK') {
					loginError.value = '无法连接到服务器，请检查后端服务是否启动';
				} else {
					loginError.value = '登录失败，请检查网络连接';
				}
			} finally {
				loginLoading.value = false;
			}
		};

		// 注册处理
		const handleRegister = async () => {
			// 自定义必填校验
			if (!registerForm.value.username || !registerForm.value.email || !registerForm.value.gender || !registerForm.value.password) {
				registerError.value = '请完整填写所有必填信息';
				return;
			}
			registerLoading.value = true;
			registerError.value = '';
			registerSuccess.value = '';
			
			try {
				// 使用URLSearchParams来发送表单数据
				const params = new URLSearchParams();
				params.append('username', registerForm.value.username);
				params.append('email', registerForm.value.email);
				params.append('gender', registerForm.value.gender);
				params.append('password', registerForm.value.password);
				
				const response = await axios.post('/api/usersLogin/userRegister', params, {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				});

				if (response.data.code === 200 && response.data.data === true) {
					registerSuccess.value = '注册成功！请返回登录页面进行登录';
					setTimeout(() => {
						currentView.value = 'login';
					}, 2000);
				} else {
					// 根据后端返回的错误信息进行具体处理
					const errorMsg = response.data.msg || '';
					if (errorMsg.includes('用户已被占用')) {
						// 由于后端返回的是笼统的"用户已被占用"，我们需要进一步判断
						// 这里可以根据实际情况进行更精确的判断
						// 暂时显示通用的错误信息
						registerError.value = '注册失败，用户名或邮箱已被占用';
					} else if (errorMsg.includes('邮箱') && errorMsg.includes('用户名')) {
						registerError.value = '不能重复注册';
					} else if (errorMsg.includes('邮箱')) {
						registerError.value = '注册失败，该邮箱已被占用';
					} else if (errorMsg.includes('用户名')) {
						registerError.value = '注册失败，该用户名已被占用';
					} else {
						registerError.value = errorMsg || '注册失败';
					}
				}
			} catch (error) {
				console.error('注册错误:', error);
				if (error.response?.data?.msg) {
					// 如果后端返回了具体的错误信息，使用我们的自定义处理逻辑
					const errorMsg = error.response.data.msg;
					if (errorMsg.includes('邮箱') && errorMsg.includes('用户名')) {
						registerError.value = '不能重复注册';
					} else if (errorMsg.includes('邮箱')) {
						registerError.value = '注册失败，该邮箱已被占用';
					} else if (errorMsg.includes('用户名')) {
						registerError.value = '注册失败，该用户名已被占用';
					} else {
						registerError.value = errorMsg;
					}
				} else if (error.code === 'ERR_NETWORK') {
					registerError.value = '无法连接到服务器，请检查后端服务是否启动';
				} else if (error.code === 'ECONNREFUSED') {
					registerError.value = '连接被拒绝，请检查后端服务是否启动';
				} else if (error.code === 'ERR_INTERNET_DISCONNECTED') {
					registerError.value = '网络连接断开，请检查网络连接';
				} else {
					registerError.value = '注册失败，请检查网络连接';
				}
			} finally {
				registerLoading.value = false;
			}
		};

		// 获取验证码
		const handleGetCode = async () => {
			// 自定义必填校验
			if (!forgotForm.value.username || !forgotForm.value.email) {
				forgotError.value = '请填写用户名与邮箱';
				return;
			}
			codeLoading.value = true;
			forgotError.value = '';
			forgotSuccess.value = '';
			
			try {
				const response = await axios.get('/api/usersLogin/getCode', {
					params: {
						username: forgotForm.value.username,
						email: forgotForm.value.email
					}
				});

				if (response.data.code === 200 && response.data.data.success) {
					resetToken.value = response.data.data.token;
					forgotSuccess.value = '验证码已发送到您的邮箱，请查收';
					setTimeout(() => {
						currentView.value = 'reset';
					}, 2000);
				} else {
					forgotError.value = response.data.msg || '获取验证码失败';
				}
			} catch (error) {
				console.error('获取验证码错误:', error);
				if (error.response?.data?.msg) {
					forgotError.value = error.response.data.msg;
				} else {
					forgotError.value = '获取验证码失败，请检查网络连接';
				}
			} finally {
				codeLoading.value = false;
			}
		};

		// 重置密码
		const handleResetPassword = async () => {
			// 自定义必填校验
			if (!resetForm.value.code || !resetForm.value.newPassword || !resetForm.value.confirmPassword) {
				resetError.value = '请完整填写验证码与新密码';
				return;
			}
			if (resetForm.value.newPassword !== resetForm.value.confirmPassword) {
				resetError.value = '两次输入的密码不一致';
				return;
			}

			resetLoading.value = true;
			resetError.value = '';
			resetSuccess.value = '';
			
			try {
				// 使用URLSearchParams来发送表单数据
				const params = new URLSearchParams();
				params.append('username', forgotForm.value.username);
				params.append('newPassword', resetForm.value.newPassword);
				params.append('code', resetForm.value.code);
				params.append('token', resetToken.value);
				
				const response = await axios.post('/api/usersLogin/resetPassword', params, {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				});

				if (response.data.code === 200) {
					resetSuccess.value = '密码重置成功！请返回登录页面进行登录';
					setTimeout(() => {
						currentView.value = 'login';
					}, 2000);
				} else {
					resetError.value = response.data.msg || '密码重置失败';
				}
			} catch (error) {
				console.error('重置密码错误:', error);
				if (error.response?.data?.msg) {
					resetError.value = error.response.data.msg;
				} else if (error.code === 'ERR_NETWORK') {
					resetError.value = '无法连接到服务器，请检查后端服务是否启动';
				} else {
					resetError.value = '密码重置失败，请检查网络连接';
				}
			} finally {
				resetLoading.value = false;
			}
		};

		// 监听抽屉开闭：开时锁定页面滚动并仅允许操作抽屉；关时恢复
		watch(() => props.modelValue, (newVal) => {
			if (newVal) {
				document.body.classList.add('drawer-lock');
			} else {
				document.body.classList.remove('drawer-lock');
				resetForms();
			}
		});

		onBeforeUnmount(() => {
			document.body.classList.remove('drawer-lock');
		});

		return {
			currentView,
			loginForm,
			loginLoading,
			loginError,
			registerForm,
			registerLoading,
			registerError,
			registerSuccess,
			forgotForm,
			codeLoading,
			forgotError,
			forgotSuccess,
			resetForm,
			resetLoading,
			resetError,
			resetSuccess,
			onClose,
			handleLogin,
			handleRegister,
			handleGetCode,
			handleResetPassword
		};
	}
};
</script>

<style scoped>
.overlay {
	position: fixed;
	inset: 0;
	background: rgba(0,0,0,0.5);
	backdrop-filter: blur(8px);
	z-index: 9998;
	animation: fadeIn .3s ease-out;
	box-sizing: border-box;
}

.drawer {
	position: fixed;
	top: 0;
	right: 0;
	width: 420px;
	height: 100%;
	background: #fff;
	color: #333;
	box-shadow: -8px 0 32px rgba(0,0,0,0.15);
	transform: translateX(100%);
	transition: transform .4s cubic-bezier(0.4, 0, 0.2, 1);
	z-index: 9999;
	display: flex;
	flex-direction: column;
	border-left: 1px solid rgba(0,0,0,0.1);
	box-sizing: border-box;
}

.drawer.open {
	transform: translateX(0);
}

.drawer-header {
	padding: 32px 32px 24px;
	border-bottom: 1px solid rgba(0,0,0,0.1);
	display: flex;
	justify-content: space-between;
	align-items: center;
	background: #fff;
	position: relative;
	box-sizing: border-box;
}

.drawer-title {
	font-size: 28px;
	font-weight: 700;
	margin: 0;
	color: #333;
	letter-spacing: -0.5px;
	font-family: 'Helvetica Neue', Arial, sans-serif;
}

.close-btn {
	position: absolute;
	top: 24px;
	right: 24px;
	width: 40px;
	height: 40px;
	border-radius: 50%;
	border: 1px solid rgba(0,0,0,0.2);
	background: transparent;
	color: #333;
	cursor: pointer;
	font-size: 20px;
	font-weight: 300;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all .2s ease;
	box-sizing: border-box;
}

.close-btn:hover {
	background: rgba(0,0,0,0.05);
	border-color: rgba(0,0,0,0.4);
	transform: scale(1.05);
}

.drawer-content {
	padding: 32px;
	flex-grow: 1;
	overflow-y: auto;
	background: #fff;
	box-sizing: border-box;
}

.input-group {
	margin-bottom: 24px;
	box-sizing: border-box;
}

.input-group label {
	display: block;
	margin-bottom: 8px;
	font-size: 13px;
	color: rgba(0,0,0,0.8);
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	font-family: 'Helvetica Neue', Arial, sans-serif;
}

.input-group input,
.input-group select {
	width: 100%;
	padding: 16px 20px;
	border: 1px solid rgba(0,0,0,0.2);
	border-radius: 12px;
	background: rgba(0,0,0,0.02);
	color: #333;
	font-size: 16px;
	outline: none;
	transition: all .2s ease;
	font-family: 'Helvetica Neue', Arial, sans-serif;
	box-sizing: border-box;
}

.input-group input::placeholder {
	color: rgba(0,0,0,0.4);
}

.input-group input:focus,
.input-group select:focus {
	border-color: #000;
	background: rgba(0,0,0,0.02);
	box-shadow: 0 0 0 2px rgba(0,0,0,0.08);
	transform: translateY(-1px);
}

.input-group input:invalid:not(:placeholder-shown),
.input-group select:invalid:not(:placeholder-shown) {
	border-color: #e74c3c;
	box-shadow: 0 0 0 2px rgba(231,76,60,0.1);
}

.input-group input:valid:not(:placeholder-shown),
.input-group select:valid:not(:placeholder-shown) {
	border-color: #27ae60;
	box-shadow: 0 0 0 2px rgba(39,174,96,0.1);
}

.submit-btn {
	width: 100%;
	padding: 18px;
	background: #000;
	color: #fff;
	border: none;
	border-radius: 12px;
	font-size: 16px;
	font-weight: 700;
	cursor: pointer;
	transition: all .2s ease;
	margin-bottom: 20px;
	font-family: 'Helvetica Neue', Arial, sans-serif;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	position: relative;
	overflow: hidden;
	box-sizing: border-box;
}

.submit-btn::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
	transition: left 0.5s;
}

.submit-btn:hover:not(:disabled)::before {
	left: 100%;
}

.submit-btn:hover:not(:disabled) {
	background: #333;
	transform: translateY(-2px);
	box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.submit-btn:disabled {
	background: rgba(0,0,0,0.2);
	color: rgba(0,0,0,0.5);
	cursor: not-allowed;
	transform: none;
	box-shadow: none;
}

.form-links {
	display: flex;
	justify-content: space-between;
	margin-bottom: 20px;
	padding: 0 4px;
	box-sizing: border-box;
}

.link-btn {
	background: transparent;
	border: none;
	color: rgba(0,0,0,0.7);
	cursor: pointer;
	font-size: 13px;
	font-weight: 500;
	text-decoration: none;
	transition: all .2s ease;
	font-family: 'Helvetica Neue', Arial, sans-serif;
	text-transform: uppercase;
	letter-spacing: 0.3px;
	position: relative;
	white-space: nowrap;
}

.link-btn::after {
	content: '';
	position: absolute;
	bottom: -2px;
	left: 0;
	width: 0;
	height: 1px;
	background: #000;
	transition: width .2s ease;
}

.link-btn:hover {
	color: #000;
}

.link-btn:hover::after {
	width: 100%;
}

.error-message {
	color: #e74c3c;
	font-size: 13px;
	margin-top: 12px;
	text-align: left;
	background: transparent;
	padding: 0;
	border: none;
	font-family: 'Helvetica Neue', Arial, sans-serif;
	font-weight: 500;
	position: relative;
	padding-left: 20px;
	box-sizing: border-box;
}

.error-message::before {
	content: '⚠';
	position: absolute;
	left: 0;
	top: 0;
	color: #e74c3c;
	font-size: 14px;
	font-weight: bold;
}

.success-message {
	color: #27ae60;
	font-size: 13px;
	margin-top: 12px;
	text-align: left;
	background: transparent;
	padding: 0;
	border: none;
	font-family: 'Helvetica Neue', Arial, sans-serif;
	font-weight: 500;
	position: relative;
	padding-left: 20px;
	box-sizing: border-box;
}

.success-message::before {
	content: '✓';
	position: absolute;
	left: 0;
	top: 0;
	color: #27ae60;
	font-size: 14px;
	font-weight: bold;
}

/* 自定义滚动条 */
.drawer-content::-webkit-scrollbar {
	width: 6px;
}

.drawer-content::-webkit-scrollbar-track {
	background: rgba(0,0,0,0.05);
}

.drawer-content::-webkit-scrollbar-thumb {
	background: rgba(0,0,0,0.2);
	border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-thumb:hover {
	background: rgba(0,0,0,0.3);
}

@keyframes fadeIn {
	from { 
		opacity: 0; 
		backdrop-filter: blur(0px);
	}
	to { 
		opacity: 1; 
		backdrop-filter: blur(8px);
	}
}

/* 响应式设计 */
@media (max-width: 768px) {
	.drawer {
		width: 100%;
		max-width: 400px;
	}
	
	.drawer-content {
		padding: 24px;
	}
	
	.drawer-header {
		padding: 24px 24px 20px;
	}
	
	.drawer-title {
		font-size: 24px;
	}
	
	.close-btn {
		top: 20px;
		right: 20px;
		width: 36px;
		height: 36px;
		font-size: 18px;
	}
	
	.input-group input,
	.input-group select {
		padding: 14px 16px;
		font-size: 15px;
	}
	
	.submit-btn {
		padding: 16px;
		font-size: 15px;
	}
}

@media (max-width: 480px) {
	.drawer {
		width: 100%;
		max-width: none;
	}
	
	.drawer-content {
		padding: 20px;
	}
	
	.drawer-header {
		padding: 20px 20px 16px;
	}
	
	.drawer-title {
		font-size: 22px;
	}
	
	.close-btn {
		top: 16px;
		right: 16px;
		width: 32px;
		height: 32px;
		font-size: 16px;
	}
	
	.input-group {
		margin-bottom: 20px;
	}
	
	.input-group input,
	.input-group select {
		padding: 12px 14px;
		font-size: 14px;
	}
	
	.submit-btn {
		padding: 14px;
		font-size: 14px;
		margin-bottom: 16px;
	}
	
	.form-links {
		margin-bottom: 16px;
		flex-direction: column;
		gap: 8px;
		align-items: flex-start;
	}
	
	.link-btn {
		font-size: 12px;
	}
}

@media (max-width: 360px) {
	.drawer-content {
		padding: 16px;
	}
	
	.drawer-header {
		padding: 16px 16px 12px;
	}
	
	.drawer-title {
		font-size: 20px;
	}
	
	.input-group {
		margin-bottom: 16px;
	}
	
	.input-group input,
	.input-group select {
		padding: 10px 12px;
		font-size: 13px;
	}
	
	.submit-btn {
		padding: 12px;
		font-size: 13px;
	}
}

/* 添加一些微妙的动画效果 */
.input-group {
	animation: slideInUp 0.3s ease-out;
}

.input-group:nth-child(1) { animation-delay: 0.1s; }
.input-group:nth-child(2) { animation-delay: 0.2s; }
.input-group:nth-child(3) { animation-delay: 0.3s; }
.input-group:nth-child(4) { animation-delay: 0.4s; }

.error-message,
.success-message {
	animation: fadeInUp 0.3s ease-out;
}

@keyframes slideInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(10px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 添加玻璃态效果 */
.drawer::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.01) 100%);
	pointer-events: none;
	z-index: -1;
}
</style>

<!-- 锁定背景滚动样式（非scoped，需全局影响）-->
<style>
body.drawer-lock {
	overflow: hidden !important;
}
</style>


