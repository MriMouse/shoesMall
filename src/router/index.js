import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Profile from "../views/Profile.vue";
import MenShoes from "../views/MenShoes.vue";
import WomenShoes from "../views/WomenShoes.vue";
import KidsShoes from "../views/KidsShoes.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/men-shoes",
    name: "MenShoes",
    component: MenShoes,
  },
  {
    path: "/women-shoes",
    name: "WomenShoes",
    component: WomenShoes,
  },
  {
    path: "/kids-shoes",
    name: "KidsShoes",
    component: KidsShoes,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫 - 检查需要身份验证的路由
router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // 检查用户是否登录（这里简单使用localStorage检查）
    const isLoggedIn = localStorage.getItem("user");
    if (!isLoggedIn) {
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
