import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
});

export const UserAPI = {
  getAllUsers() {
    return api.post("/users/getAllUsers");
  },
  

  
  getUserIdByUsername(username) {
    const params = new URLSearchParams({ username });
    return api.post("/users/getUserIdByUsername", params);
  },
  
  getPersonalInfo(username) {
    const params = new URLSearchParams({ username });
    return api.post("/personal/info", params);
  },

  // 上传头像
  uploadAvatar(formData) {
    return api.post("/users/uploadAvatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // 更新用户头像
  updateAvatar(username, avatarPath) {
    const params = new URLSearchParams({ username, avatarPath });
    return api.post("/users/updateAvatar", params);
  },
  
  // 通过用户ID更新头像（与数据库 user.avatar_path 字段对应）
  updateAvatarById(userId, avatarPath) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("avatarPath", avatarPath);
    return api.post("/users/updateAvatarById", params);
  },

  // 获取用户头像路径
  getAvatarPath(username) {
    const params = new URLSearchParams({ username });
    return api.post("/users/getAvatarPath", params);
  },
  
  // 更新用户基本信息
  updateUserInfo(userId, username, email, gender) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("username", username);
    params.append("email", email);
    params.append("gender", gender);
    return api.post("/users/updateUserInfo", params);
  },
  
  // 更新用户密码
  updatePassword(userId, oldPassword, newPassword) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("oldPassword", oldPassword);
    params.append("newPassword", newPassword);
    return api.post("/users/updatePassword", params);
  },

  // 更新用户积分
  updateIntegral(userId, integral) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("integral", integral);
    return api.post("/users/updateIntegral", params);
  },

  // 根据用户ID获取用户信息
  getUserById(userId) {
    const params = new URLSearchParams();
    params.append("id", userId);
    return api.post("/users/getUsersByIds", params);
  },

  getAddresses(username) {
    const params = new URLSearchParams({ username });
    return api.post("/personal/addresses", params);
  },
  
  addAddress(address) {
    return api.post("/personal/address/add", address, {
      headers: { "Content-Type": "application/json" },
    });
  },
  
  updateAddress(address) {
    return api.post("/personal/address/update", address, {
      headers: { "Content-Type": "application/json" },
    });
  },
  
  deleteAddress(addressId) {
    const params = new URLSearchParams({ addressId });
    return api.post("/personal/address/delete", params);
  },
  
  setDefaultAddress(addressId, userId) {
    const params = new URLSearchParams({ addressId, userId });
    return api.post("/personal/address/setDefault", params);
  },
  
  getOrders(username, pageNum = 1, pageSize = 2, status = "") {
    const params = new URLSearchParams({ username, pageNum, pageSize });
    if (status) params.append("status", status);
    return api.post("/personal/orders", params);
  },
};

export const OrderAPI = {
  // 获取所有订单（用于通过唯一 orderNumber 找回刚创建的订单ID）
  getAll() {
    return api.post("/order/getAll");
  },

  // 新增：获取包含完整商品和收货信息的订单数据
  getAllWithFullDetails() {
    return api.post("/order/getAllWithFullDetails");
  },
   insertOrder(order) {
    return api.post("/order/insertOrder", order, {
      headers: { "Content-Type": "application/json" },
    });
  },
  updateOrder(order) {
    return api.post("/order/updateOrder", order, {
      headers: { "Content-Type": "application/json" },
    });
  },
  // 新增：专门更新尺码
  updateOrderSize(orderId, sizeId) {
    const params = new URLSearchParams({ orderId, sizeId });
    return api.post("/order/updateOrderSize", params);
  },
  // 新增：更新订单数量
  updateOrderQuantity(orderId, quantity) {
    const params = new URLSearchParams({ orderId, quantity });
    return api.post("/order/updateOrderQuantity", params);
  },
  // 新增：更新订单状态
  updateOrderStatus(orderId, status) {
    const params = new URLSearchParams({ orderId, status });
    return api.post("/order/updateOrderStatus", params);
  },
  // 新增：加入购物车
  addToCart(userId, sizeId, quantity) {
    const params = new URLSearchParams({ userId, sizeId, quantity });
    return api.post("/order/addToCart", params);
  },
  // 新增：获取购物车订单（status = 10）
  getCartOrders(userId) {
    const params = new URLSearchParams({ userId });
    return api.post("/order/getCartOrders", params);
  },

  // 新增：获取购物车订单详细信息
  getCartOrdersWithDetails(userId) {
    const params = new URLSearchParams({ userId });
    return api.post("/order/getCartOrdersWithDetails", params);
  },

  // 新增：从购物车移除商品
  removeFromCart(orderId) {
    const params = new URLSearchParams({ orderId });
    return api.post("/order/removeFromCart", params);
  },

  // 新增：清空用户购物车
  clearUserCart(userId) {
    const params = new URLSearchParams({ userId });
    return api.post("/order/clearUserCart", params);
  },

  // 新增：获取购物车商品总数
  getCartItemCount(userId) {
    const params = new URLSearchParams({ userId });
    return api.post("/order/getCartItemCount", params);
  },

  // 新增：批量更新订单状态
  batchUpdateOrderStatus(orderIds, status) {
    const params = new URLSearchParams();
    orderIds.forEach((id) => params.append("orderIds", id));
    params.append("status", status);
    return api.post("/order/batchUpdateOrderStatus", params);
  },

  // 购物车结算
  checkout(checkoutData) {
    return api.post("/order/checkout", checkoutData, {
      headers: { "Content-Type": "application/json" },
    });
  },

  // 确认支付
  confirmPayment(userId, orderIds) {
    return api.post(
      "/order/confirmPayment",
      { userId, orderIds },
      { headers: { "Content-Type": "application/json" } }
    );
  },

  // 购物车相关API
  CartAPI: {
    // 加入购物车
    addToCart(userId, sizeId, shoeId, quantity) {
      const params = new URLSearchParams({ userId, sizeId, shoeId, quantity });
      return api.post("/cart/addToCart", params);
    },

    // 获取用户购物车
    getUserCart(userId) {
      return api.get(`/cart/getUserCart?userId=${userId}`);
    },

    // 更新购物车商品数量
    updateCartItemQuantity(orderId, shoeId, quantity) {
      const params = new URLSearchParams({ orderId, shoeId, quantity });
      return api.post("/cart/updateCartItemQuantity", params);
    },

    // 更新购物车商品尺码
    updateOrderSize(orderId, sizeId) {
      const params = new URLSearchParams({ orderId, sizeId });
      return api.post("/cart/updateOrderSize", params);
    },

    // 从购物车删除商品
    removeFromCart(orderId, shoeId) {
      const params = new URLSearchParams({ orderId, shoeId });
      return api.post("/cart/removeFromCart", params);
    },

    // 清空购物车
    clearUserCart(userId) {
      const params = new URLSearchParams({ userId });
      return api.post("/cart/clearUserCart", params);
    },

    // 获取购物车商品数量
    getCartItemCount(userId) {
      return api.get(`/cart/getCartItemCount?userId=${userId}`);
    },

    // 获取购物车订单
    getCartOrders(userId) {
      return api.get(`/cart/getCartOrders?userId=${userId}`);
    },

    // 获取购物车订单详情
    getCartOrdersWithDetails(userId) {
      return api.get(`/cart/getCartOrdersWithDetails?userId=${userId}`);
    },

    // 批量更新订单状态
    batchUpdateOrderStatus(orderIds, status) {
      const params = new URLSearchParams();
      orderIds.forEach((id) => params.append("orderIds", id));
      params.append("status", status);
      return api.post("/cart/batchUpdateOrderStatus", params);
    },
  },

  deleteOrder(orderId) {
    const params = new URLSearchParams({ orderId });
    return api.post("/order/deleteOrder", params);
  },
  getById(orderId) {
    const params = new URLSearchParams({ orderId });
    return api.post("/order/getById", params);
  },
  // 新增：获取用户购物车订单（状态为cart的订单）
  getUserCartOrders(username) {
    const params = new URLSearchParams({
      username,
      status: "cart",
      pageNum: 1,
      pageSize: 100,
    });
    return api.post("/personal/orders", params);
  },
};

export const OrderShoeNumAPI = {
  setQuantity(orderId, shoeNum) {
    return api.post(
      "/orderShoeNum/updateOrderShoeNum",
      { orderId, shoeNum },
      { headers: { "Content-Type": "application/json" } }
    );
  },
  insert(orderId, shoeNum) {
    return api.post(
      "/orderShoeNum/insertOrderShoeNum",
      { orderId, shoeNum },
      { headers: { "Content-Type": "application/json" } }
    );
  },
  getByOrderId(orderId) {
    const params = new URLSearchParams({ orderId });
    return api.post("/orderShoeNum/getByOrderId", params);
  },
};

export const ShoeAPI = {
  getById(shoeId) {
    const params = new URLSearchParams({ shoeId });
    return api.post("/shoe/getById", params);
  },
  getImages(shoeId) {
    return api.get(`/shoeImg/list/${shoeId}`);
  },
};

export const InventoryAPI = {
  checkSufficient(shoeId, sizeId, quantity) {
    return api.get("/inventory/checkInventorySufficient", {
      params: { shoeId, sizeId, quantity },
    });
  },
  decrease(shoeId, sizeId, quantity) {
    const params = new URLSearchParams({ shoeId, sizeId, quantity });
    return api.post("/inventory/decreaseInventory", params);
  },
  getInventoryByShoeId(shoeId) {
    return api.get(`/inventory/getInventoryByShoeId/${shoeId}`);
  },
};

// 新增：尺码API
export const ShoesSizeAPI = {
  getAll() {
    return api.post("/shoesSize/getAll");
  },
};

// 新增：地址API
export const AddressAPI = {
  getList(userId) {
    return api.get("/address/list", { params: { userId } });
  },
  add(address) {
    return api.post("/address/add", address, {
      headers: { "Content-Type": "application/json" },
    });
  },
  update(address) {
    return api.post("/address/update", address, {
      headers: { "Content-Type": "application/json" },
    });
  },
  delete(addressId) {
    return api.post("/address/delete", { addressId });
  },
  setDefault(addressId, userId) {
    return api.post("/address/setDefault", { addressId, userId });
  },
};

// 点击日志 API
export const ClickLogAPI = {
  // 简化记录接口
  recordClick(shoeId, userId, ip) {
    const params = new URLSearchParams({ shoeId, ip });
    if (userId != null) params.append("userId", String(userId));
    return api.post("/clickLog/recordClick", params);
  },

  // 详细添加接口（可选）
  add(shoeId, userId, ip, clickTime) {
    const params = new URLSearchParams({ shoeId, ip });
    if (userId != null) params.append("userId", String(userId));
    if (clickTime) params.append("clickTime", clickTime);
    return api.post("/clickLog/add", params);
  },
};

// 购物车相关API
export const CartAPI = {
  // 获取用户的购物车订单
  getCartOrders(userId) {
    const params = new URLSearchParams({ userId });
    return api.get("/cart/getCartOrders", { params });
  },

  // 获取用户的购物车订单详情
  getCartOrdersWithDetails(userId) {
    const params = new URLSearchParams({ userId });
    return api.get("/cart/getCartOrdersWithDetails", { params });
  },

  // 获取购物车商品数量
  getCartItemCount(userId) {
    const params = new URLSearchParams({ userId });
    return api.get("/cart/getCartItemCount", { params });
  },

  // 添加商品到购物车
  addToCart(userId, sizeId, shoeId, quantity) {
    const params = new URLSearchParams({ userId, sizeId, shoeId, quantity });
    return api.post("/cart/addToCart", params);
  },

  // 更新购物车商品数量
  updateCartItemQuantity(orderId, shoeId, quantity) {
    const params = new URLSearchParams({ orderId, shoeId, quantity });
    return api.post("/cart/updateCartItemQuantity", params);
  },

  // 从购物车移除商品
  removeFromCart(orderId, shoeId) {
    const params = new URLSearchParams({ orderId, shoeId });
    return api.post("/cart/removeFromCart", params);
  },

  // 清空用户购物车
  clearUserCart(userId) {
    const params = new URLSearchParams({ userId });
    return api.post("/cart/clearUserCart", params);
  },

  // 批量更新订单状态
  batchUpdateOrderStatus(orderIds, status) {
    const params = new URLSearchParams();
    orderIds.forEach((id) => params.append("orderIds", id));
    params.append("status", status);
    return api.post("/cart/batchUpdateOrderStatus", params);
  },

  // 更新订单尺码
  updateOrderSize(orderId, sizeId) {
    const params = new URLSearchParams({ orderId, sizeId });
    return api.post("/cart/updateOrderSize", params);
  },
};

export default api;

// 新增：积分相关API（不改后端既有接口，新增独立接口）
export const PointsAPI = {
  accrueByOrder({ userId, orderId, orderNumber } = {}) {
    const params = new URLSearchParams();
    if (userId != null) params.append("userId", userId);
    if (orderId != null) params.append("orderId", String(orderId));
    if (orderNumber) params.append("orderNumber", orderNumber);
    return api.post("/points/accrueByOrder", params);
  },
  deductByOrder({ userId, orderId, orderNumber } = {}) {
    const params = new URLSearchParams();
    if (userId != null) params.append("userId", userId);
    if (orderId != null) params.append("orderId", String(orderId));
    if (orderNumber) params.append("orderNumber", orderNumber);
    return api.post("/points/deductByOrder", params);
  },
  adjust({ userId, delta }) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("delta", String(delta));
    return api.post("/points/adjust", params);
  },
};

// 新增：评论相关API
export const CommentAPI = {
  // 添加评论
  addComment({ userId, shoeId, content, rating, commentTime }) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("shoeId", shoeId);
    params.append("content", content);
    params.append("rating", rating);
    if (commentTime) params.append("commentTime", commentTime);
    return api.post("/comment/add", params);
  },

  // 删除评论
  deleteComment({ userId, shoeId }) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("shoeId", shoeId);
    return api.post("/comment/delete", params);
  },

  // 更新评论
  updateComment({ userId, shoeId, content, rating, commentTime }) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("shoeId", shoeId);
    params.append("content", content);
    params.append("rating", rating);
    if (commentTime) params.append("commentTime", commentTime);
    return api.post("/comment/update", params);
  },

  // 根据用户ID和鞋子ID获取评论
  getComment({ userId, shoeId }) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    params.append("shoeId", shoeId);
    return api.post("/comment/get", params);
  },

  // 获取所有评论
  getAllComments() {
    return api.post("/comment/getAll");
  },

  // 分页获取评论
  getCommentPage({ pageNum = 1, pageSize = 10 }) {
    const params = new URLSearchParams();
    params.append("pageNum", pageNum);
    params.append("pageSize", pageSize);
    return api.post("/comment/getPage", params);
  },

  // 根据用户ID获取评论
  getCommentsByUserId(userId) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    return api.post("/comment/getByUserId", params);
  },

  // 根据鞋子ID获取评论
  getByShoeId(shoeId) {
    const params = new URLSearchParams();
    params.append("shoeId", shoeId);
    return api.post("/comment/getByShoeId", params);
  },

  // 根据评分获取评论
  getCommentsByRating(rating) {
    const params = new URLSearchParams();
    params.append("rating", rating);
    return api.post("/comment/getByRating", params);
  },

  // 根据评分范围获取评论
  getCommentsByRatingRange({ minRating, maxRating }) {
    const params = new URLSearchParams();
    params.append("minRating", minRating);
    params.append("maxRating", maxRating);
    return api.post("/comment/getByRatingRange", params);
  },

  // 获取鞋子的平均评分
  getAverageRatingByShoeId(shoeId) {
    const params = new URLSearchParams();
    params.append("shoeId", shoeId);
    return api.post("/comment/getAverageRating", params);
  },

  // 获取用户评论数量
  getUserCommentCount(userId) {
    const params = new URLSearchParams();
    params.append("userId", userId);
    return api.post("/comment/getUserCommentCount", params);
  },

  // 获取鞋子评论数量
  getShoeCommentCount(shoeId) {
    const params = new URLSearchParams();
    params.append("shoeId", shoeId);
    return api.post("/comment/getShoeCommentCount", params);
  },
};
