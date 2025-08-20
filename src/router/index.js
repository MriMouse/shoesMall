import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Profile from "../views/Profile.vue";
import MenShoes from "../views/MenShoes.vue";
import WomenShoes from "../views/WomenShoes.vue";
import KidsShoes from "../views/KidsShoes.vue";
import ProductListPage from "../components/ProductListPage.vue";
import MainNav from "../views/layout/MainNav.vue";
import ProductDetail from "../components/ProductDetail.vue";
import OrderConfirmation from "../views/OrderConfirmation.vue";
import Cart from "../views/Cart.vue";
import TestCart from "../views/TestCart.vue";
import TestUserCart from "../views/TestUserCart.vue";
import TestAPI from "../views/TestAPI.vue";
import TestAddress from "../views/TestAddress.vue";
import TestOrderManagement from "../views/TestOrderManagement.vue";

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
    children: [
      {
        path: "",
        name: "ProfileOverview",
        component: () => import("@/components/profile/ProfileOverview.vue"),
      },
      {
        path: "info",
        name: "ProfileInfo",
        component: () => import("@/components/profile/UserInfoCard.vue"),
      },
      {
        path: "orders",
        name: "ProfileOrders",
        component: () => import("@/components/profile/OrderManagement.vue"),
      },
      {
        path: "address",
        name: "ProfileAddress",
        component: () => import("@/components/profile/AddressManagement.vue"),
      },
      {
        path: "settings",
        name: "ProfileSettings",
        component: () => import("@/components/profile/AccountSettings.vue"),
      },
    ],
  },
  {
    path: "/cart",
    name: "Cart",
    component: Cart,
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
    path: "/products",
    component: MainNav,
    children: [
      {
        path: "",
        name: "ProductListPage",
        component: ProductListPage,
      },
    ],
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
  {
    path: "/test-cart",
    name: "TestCart",
    component: TestCart,
  },
  {
    path: "/test-user-cart",
    name: "TestUserCart",
    component: TestUserCart,
  },
  {
    path: "/test-api",
    name: "TestAPI",
    component: TestAPI,
  },
  {
    path: "/test-address",
    name: "TestAddress",
    component: TestAddress,
  },
  {
    path: "/test-order-management",
    name: "TestOrderManagement",
    component: TestOrderManagement,
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