export const orderCache = {
  key: 'preloadedOrders',
  set(list) {
    try {
      const payload = { ts: Date.now(), list }
      localStorage.setItem(this.key, JSON.stringify(payload))
    } catch (e) {
      // ignore set error
    }
  },
  get() {
    try {
      const raw = localStorage.getItem(this.key)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed && Array.isArray(parsed.list) ? parsed : null
    } catch (e) {
      return null
    }
  },
  clear() {
    try {
      localStorage.removeItem(this.key)
    } catch (e) {
      // ignore clear error
    }
  },
}

import userManager from './userManager'
import { OrderAPI } from '@/api'

// 预加载当前用户订单摘要（轻量字段）
export async function preloadUserOrders() {
  try {
    const userId = await userManager.getUserId()
    if (!userId) return

    // 获取基础订单列表，构造轻量摘要，避免首屏卡顿
    let resp
    try {
      resp = await OrderAPI.getAll()
    } catch (e) {
      return
    }
    if (!(resp?.data?.code === 200 && Array.isArray(resp.data.data))) return

    const summaries = resp.data.data
      .filter(o => o.userId === userId)
      .map(o => ({
        orderId: o.orderId,
        orderNumber: o.orderNumber || `ORD${o.orderId}`,
        status: o.status,
        amount: Number(o.amount || o.totalAmount || 0),
        createdAt: o.createdAt || '',
        updatedAt: o.updatedAt || '',
        selected: false,
        products: null,
        address: o.address || '',
        receiver: o.receiver || o.receiverName || '',
        phone: o.phone || o.receiverPhone || '',
      }))
      // 可按时间排序，最新在前
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))

    orderCache.set(summaries)
  } catch (e) {
    // ignore preload error
  }
}
