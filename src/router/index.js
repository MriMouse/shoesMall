import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Profile from "../views/Profile.vue";
import MenShoes from "../views/MenShoes.vue";
import WomenShoes from "../views/WomenShoes.vue";
import KidsShoes from "../views/KidsShoes.vue";
import ProductListPage from "../components/ProductListPage.vue";
import ProductDetail from "../components/ProductDetail.vue";
import OrderConfirmation from "../views/OrderConfirmation.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/home",
    redirect: "/",
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
  {
    path: "/products",  // 修改为 /products
    name: "ProductListPage",
    component: ProductListPage,
  },
  {
    path: "/product/:id",
    name: "ProductDetail",
    component: ProductDetail,
  },
  {
    path: "/order-confirmation",
    name: "OrderConfirmation",
    component: OrderConfirmation,
  },
  // 添加一个重定向，兼容旧的路由
  {
    path: "/product-list",
    redirect: "/products"
  }
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
      // 重定向到首页，用户可以通过抽屉式登录进行登录
      next("/");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;