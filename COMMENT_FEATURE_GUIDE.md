# 评论功能使用说明

## 功能概述

本系统新增了完整的商品评论功能，包括：
- 发表评论（带评分）
- 查看评论列表
- 编辑/删除自己的评论
- 评论统计信息

## 组件结构

### 1. ProductComment.vue
主要的评论组件，包含：
- 评论头部（显示平均评分和评论数量）
- 评论表单（评分 + 评论内容）
- 评论列表
- 编辑评论模态框

### 2. API 接口
在 `src/api/index.js` 中新增了 `CommentAPI` 对象，包含所有评论相关的接口：
- `addComment` - 添加评论
- `deleteComment` - 删除评论
- `updateComment` - 更新评论
- `getByShoeId` - 根据商品ID获取评论
- 等等...

## 使用方法

### 1. 在订单管理页面使用
在 `OrderManagement.vue` 中，每个订单的"申请退款"按钮后面都添加了"评论"按钮。
点击后会跳转到评论页面，自动传递商品ID。

### 2. 直接使用组件
```vue
<template>
  <ProductComment :shoeId="123" />
</template>

<script>
import ProductComment from '@/components/ProductComment.vue'

export default {
  components: {
    ProductComment
  }
}
</script>
```

### 3. 路由访问
- 评论页面：`/comment/:shoeId`
- 测试页面：`/test-comment`

## 数据库结构

评论表 `comment` 包含以下字段：
- `user_id` - 用户ID
- `shoe_id` - 商品ID
- `content` - 评论内容
- `rating` - 评分（1-5分）
- `comment_time` - 评论时间

## 功能特性

### 1. 评分系统
- 5星评分制
- 鼠标悬停预览
- 点击选择评分
- 显示评分文字说明

### 2. 评论管理
- 用户只能编辑/删除自己的评论
- 评论内容限制200字符
- 实时字符计数

### 3. 响应式设计
- 支持移动端和桌面端
- 自适应布局
- 触摸友好的交互

## 测试方法

1. 访问 `/test-comment` 页面
2. 修改测试商品ID
3. 测试发表评论功能
4. 测试编辑/删除评论功能
5. 测试评分功能

## 注意事项

1. 评论功能需要用户登录
2. 评论内容不能为空
3. 评分必须选择
4. 用户只能管理自己的评论
5. 评论时间自动设置为当前时间

## 扩展建议

1. 可以添加评论图片上传功能
2. 可以添加评论点赞功能
3. 可以添加评论回复功能
4. 可以添加评论筛选和排序功能
5. 可以添加评论举报功能

## 技术实现

- 前端：Vue 3 + Composition API
- 样式：CSS3 + Flexbox/Grid
- 状态管理：组件内部状态
- 路由：Vue Router 4
- HTTP客户端：Axios
- 响应式：CSS Media Queries

