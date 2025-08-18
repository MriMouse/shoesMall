import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})

export const UserAPI = {
  getAllUsers() {
    return api.post('/users/getAllUsers')
  },
  // 修改密码 - 使用验证码/令牌
  resetPassword(username, newPassword, code, token) {
    const params = new URLSearchParams({ username, newPassword, code, token })
    return api.post('/usersLogin/resetPassword', params)
  },
  // 直接修改密码（不走验证码）——若后端提供
  directUpdatePassword(username, newPassword) {
    const params = new URLSearchParams({ username, newPassword })
    return api.post('/usersLogin/userRegister', params) // 占位：如果你有 /users/updatePassword 接口请替换为正确路径
  },
  // 申请重置密码验证码
  getResetCode(username, email) {
    const params = new URLSearchParams({ username, email })
    return api.get('/usersLogin/getCode', { params })
  },
  // 直接修改密码（推荐你将此路径改为后端实际的修改密码接口）
  updatePassword(username, newPassword) {
    const params = new URLSearchParams({ username, newPassword })
    // TODO: 将下面的路径替换为你后端“直接修改密码”的真实地址，如 /users/updatePassword 或 /usersLogin/updatePassword
    return api.post('/usersLogin/updatePassword', params)
  },
  getUserIdByUsername(username) {
    const params = new URLSearchParams({ username })
    return api.post('/users/getUserIdByUsername', params)
  },
  getPersonalInfo(username) {
    const params = new URLSearchParams({ username })
    return api.post('/personal/info', params)
  },
  
  // 上传头像
  uploadAvatar(formData) {
    return api.post('/users/uploadAvatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 更新用户头像
  updateAvatar(username, avatarPath) {
    const params = new URLSearchParams({ username, avatarPath })
    return api.post('/users/updateAvatar', params)
  },
  // 通过用户ID更新头像（与数据库 user.avatar_path 字段对应）
  updateAvatarById(userId, avatarPath) {
    const params = new URLSearchParams({ userId, avatarPath })
    return api.post('/users/updateAvatarById', params)
  },
  
  // 获取用户头像路径
  getAvatarPath(username) {
    const params = new URLSearchParams({ username })
    return api.post('/users/getAvatarPath', params)
  },
  getAddresses(username) {
    const params = new URLSearchParams({ username })
    return api.post('/personal/addresses', params)
  },
  addAddress(address) {
    return api.post('/personal/address/add', address, { headers: { 'Content-Type': 'application/json' } })
  },
  updateAddress(address) {
    return api.post('/personal/address/update', address, { headers: { 'Content-Type': 'application/json' } })
  },
  deleteAddress(addressId) {
    const params = new URLSearchParams({ addressId })
    return api.post('/personal/address/delete', params)
  },
  setDefaultAddress(addressId, userId) {
    const params = new URLSearchParams({ addressId, userId })
    return api.post('/personal/address/setDefault', params)
  },
  getOrders(username, pageNum = 1, pageSize = 2, status = '') {
    const params = new URLSearchParams({ username, pageNum, pageSize })
    if (status) params.append('status', status)
    return api.post('/personal/orders', params)
  }
}

export const OrderAPI = {
  // 获取所有订单（用于通过唯一 orderNumber 找回刚创建的订单ID）
  getAll() {
    return api.post('/order/getAll')
  },
  
  // 新增：获取包含完整商品和收货信息的订单数据
  getAllWithFullDetails() {
    return api.post('/order/getAllWithFullDetails')
  },
  insertOrder(order) {
    return api.post('/order/insertOrder', order, { headers: { 'Content-Type': 'application/json' } })
  },
  updateOrder(order) {
    return api.post('/order/updateOrder', order, { headers: { 'Content-Type': 'application/json' } })
  },
  // 新增：专门更新尺码
  updateOrderSize(orderId, sizeId) {
    const params = new URLSearchParams({ orderId, sizeId })
    return api.post('/order/updateOrderSize', params)
  },
  // 新增：更新订单数量
  updateOrderQuantity(orderId, quantity) {
    const params = new URLSearchParams({ orderId, quantity })
    return api.post('/order/updateOrderQuantity', params)
  },
  // 新增：更新订单状态
  updateOrderStatus(orderId, status) {
    const params = new URLSearchParams({ orderId, status })
    return api.post('/order/updateOrderStatus', params)
  },
  // 新增：加入购物车
  addToCart(userId, sizeId, quantity) {
    const params = new URLSearchParams({ userId, sizeId, quantity })
    return api.post('/order/addToCart', params)
  },
  // 新增：获取购物车订单（status = 10）
  getCartOrders(userId) {
    const params = new URLSearchParams({ userId })
    return api.post('/order/getCartOrders', params)
  },
  
  // 新增：获取购物车订单详细信息
  getCartOrdersWithDetails(userId) {
    const params = new URLSearchParams({ userId })
    return api.post('/order/getCartOrdersWithDetails', params)
  },
  
  // 新增：从购物车移除商品
  removeFromCart(orderId) {
    const params = new URLSearchParams({ orderId })
    return api.post('/order/removeFromCart', params)
  },
  
  // 新增：清空用户购物车
  clearUserCart(userId) {
    const params = new URLSearchParams({ userId })
    return api.post('/order/clearUserCart', params)
  },
  
  // 新增：获取购物车商品总数
  getCartItemCount(userId) {
    const params = new URLSearchParams({ userId })
    return api.post('/order/getCartItemCount', params)
  },
  
  // 新增：批量更新订单状态
  batchUpdateOrderStatus(orderIds, status) {
    const params = new URLSearchParams()
    orderIds.forEach(id => params.append('orderIds', id))
    params.append('status', status)
    return api.post('/order/batchUpdateOrderStatus', params)
  },
  
  // 购物车结算
  checkout(checkoutData) {
    return api.post('/order/checkout', checkoutData, { headers: { 'Content-Type': 'application/json' } })
  },
  
  // 确认支付
  confirmPayment(userId, orderIds) {
    return api.post('/order/confirmPayment', { userId, orderIds }, { headers: { 'Content-Type': 'application/json' } })
  },
  
  // 购物车相关API
  CartAPI: {
    // 加入购物车
    addToCart(userId, sizeId, shoeId, quantity) {
      const params = new URLSearchParams({ userId, sizeId, shoeId, quantity })
      return api.post('/cart/addToCart', params)
    },
    
    // 获取用户购物车
    getUserCart(userId) {
      return api.get(`/cart/getUserCart?userId=${userId}`)
    },
    
    // 更新购物车商品数量
    updateCartItemQuantity(orderId, shoeId, quantity) {
      const params = new URLSearchParams({ orderId, shoeId, quantity })
      return api.post('/cart/updateCartItemQuantity', params)
    },
    
    // 更新购物车商品尺码
    updateOrderSize(orderId, sizeId) {
      const params = new URLSearchParams({ orderId, sizeId })
      return api.post('/cart/updateOrderSize', params)
    },
    
    // 从购物车删除商品
    removeFromCart(orderId, shoeId) {
      const params = new URLSearchParams({ orderId, shoeId })
      return api.post('/cart/removeFromCart', params)
    },
    
    // 清空购物车
    clearUserCart(userId) {
      const params = new URLSearchParams({ userId })
      return api.post('/cart/clearUserCart', params)
    },
    
    // 获取购物车商品数量
    getCartItemCount(userId) {
      return api.get(`/cart/getCartItemCount?userId=${userId}`)
    },
    
    // 获取购物车订单
    getCartOrders(userId) {
      return api.get(`/cart/getCartOrders?userId=${userId}`)
    },
    
    // 获取购物车订单详情
    getCartOrdersWithDetails(userId) {
      return api.get(`/cart/getCartOrdersWithDetails?userId=${userId}`)
    },
    
    // 批量更新订单状态
    batchUpdateOrderStatus(orderIds, status) {
      const params = new URLSearchParams()
      orderIds.forEach(id => params.append('orderIds', id))
      params.append('status', status)
      return api.post('/cart/batchUpdateOrderStatus', params)
    }
  },
  
  deleteOrder(orderId) {
    const params = new URLSearchParams({ orderId })
    return api.post('/order/deleteOrder', params)
  },
  getById(orderId) {
    const params = new URLSearchParams({ orderId })
    return api.post('/order/getById', params)
  },
  // 新增：获取用户购物车订单（状态为cart的订单）
  getUserCartOrders(username) {
    const params = new URLSearchParams({ username, status: 'cart', pageNum: 1, pageSize: 100 })
    return api.post('/personal/orders', params)
  }
}

export const OrderShoeNumAPI = {
  setQuantity(orderId, shoeNum) {
    return api.post('/orderShoeNum/updateOrderShoeNum', { orderId, shoeNum }, { headers: { 'Content-Type': 'application/json' } })
  },
  insert(orderId, shoeNum) {
    return api.post('/orderShoeNum/insertOrderShoeNum', { orderId, shoeNum }, { headers: { 'Content-Type': 'application/json' } })
  },
  getByOrderId(orderId) {
    const params = new URLSearchParams({ orderId })
    return api.post('/orderShoeNum/getByOrderId', params)
  }
}

export const ShoeAPI = {
  getById(shoeId) {
    const params = new URLSearchParams({ shoeId })
    return api.post('/shoe/getById', params)
  },
  getImages(shoeId) {
    return api.get(`/shoeImg/list/${shoeId}`)
  }
}

export const InventoryAPI = {
  checkSufficient(shoeId, sizeId, quantity) {
    return api.get('/inventory/checkInventorySufficient', { params: { shoeId, sizeId, quantity } })
  },
  decrease(shoeId, sizeId, quantity) {
    const params = new URLSearchParams({ shoeId, sizeId, quantity })
    return api.post('/inventory/decreaseInventory', params)
  },
  getInventoryByShoeId(shoeId) {
    return api.get(`/inventory/getInventoryByShoeId/${shoeId}`)
  }
}

// 新增：尺码API
export const ShoesSizeAPI = {
  getAll() {
    return api.post('/shoesSize/getAll')
  }
}

// 新增：地址API
export const AddressAPI = {
  getList(userId) {
    return api.get('/address/list', { params: { userId } })
  },
  add(address) {
    return api.post('/address/add', address, { headers: { 'Content-Type': 'application/json' } })
  },
  update(address) {
    return api.post('/address/update', address, { headers: { 'Content-Type': 'application/json' } })
  },
  delete(addressId) {
    return api.post('/address/delete', { addressId })
  },
  setDefault(addressId, userId) {
    return api.post('/address/setDefault', { addressId, userId })
  }
}

// 购物车相关API
export const CartAPI = {
  // 获取用户的购物车订单
  getCartOrders(userId) {
    const params = new URLSearchParams({ userId })
    return api.get('/cart/getCartOrders', { params })
  },
  
  // 获取用户的购物车订单详情
  getCartOrdersWithDetails(userId) {
    const params = new URLSearchParams({ userId })
    return api.get('/cart/getCartOrdersWithDetails', { params })
  },
  
  // 获取购物车商品数量
  getCartItemCount(userId) {
    const params = new URLSearchParams({ userId })
    return api.get('/cart/getCartItemCount', { params })
  },
  
  // 添加商品到购物车
  addToCart(userId, sizeId, shoeId, quantity) {
    const params = new URLSearchParams({ userId, sizeId, shoeId, quantity })
    return api.post('/cart/addToCart', params)
  },
  
  // 更新购物车商品数量
  updateCartItemQuantity(orderId, shoeId, quantity) {
    const params = new URLSearchParams({ orderId, shoeId, quantity })
    return api.post('/cart/updateCartItemQuantity', params)
  },
  
  // 从购物车移除商品
  removeFromCart(orderId, shoeId) {
    const params = new URLSearchParams({ orderId, shoeId })
    return api.post('/cart/removeFromCart', params)
  },
  
  // 清空用户购物车
  clearUserCart(userId) {
    const params = new URLSearchParams({ userId })
    return api.post('/cart/clearUserCart', params)
  },
  
  // 批量更新订单状态
  batchUpdateOrderStatus(orderIds, status) {
    const params = new URLSearchParams()
    orderIds.forEach(id => params.append('orderIds', id))
    params.append('status', status)
    return api.post('/cart/batchUpdateOrderStatus', params)
  },
  
  // 更新订单尺码
  updateOrderSize(orderId, sizeId) {
    const params = new URLSearchParams({ orderId, sizeId })
    return api.post('/cart/updateOrderSize', params)
  }
}

export default api



