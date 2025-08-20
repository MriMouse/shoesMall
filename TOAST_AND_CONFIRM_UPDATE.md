# Toast 和 ConfirmDialog 更新总结

## 概述
已将 `ViewComments.vue` 和 `ProductComment.vue` 文件中的 `alert` 替换为 `toast`，将 `confirm` 替换为 `confirmDialog`，参考了 `Cart.vue` 的实现方式。

## 修改的文件

### 1. src/views/ViewComments.vue

#### 添加的组件
- `BasicToast` - 用于显示 toast 消息
- `confirmDialog` - 用于显示确认对话框

#### 添加的数据属性
```javascript
// Toast 相关
const toast = ref(null)
const toastMessage = ref('')
const toastType = ref('info')

// ConfirmDialog 相关
const showConfirmDialog = ref(false)
const confirmDialog = ref({
  title: '',
  message: '',
  type: 'info',
  onConfirm: () => {},
  onCancel: () => {}
})
```

#### 添加的方法
- `showMessage(message, type)` - 显示 toast 消息
- `showSuccess(message)` - 显示成功消息
- `showError(message)` - 显示错误消息
- `showWarning(message)` - 显示警告消息
- `showConfirm(title, message, type)` - 显示确认对话框

### 2. src/components/ProductComment.vue

#### 添加的组件
- `BasicToast` - 用于显示 toast 消息
- `confirmDialog` - 用于显示确认对话框

#### 添加的数据属性
```javascript
// Toast 相关
toastMessage: '',
toastType: 'info',

// ConfirmDialog 相关
showConfirmDialog: false,
confirmDialog: {
  title: '',
  message: '',
  type: 'info',
  onConfirm: () => {},
  onCancel: () => {}
}
```

#### 添加的方法
- `showMessage(message, type)` - 显示 toast 消息
- `showSuccess(message)` - 显示成功消息
- `showError(message)` - 显示错误消息
- `showWarning(message)` - 显示警告消息
- `showConfirm(title, message, type)` - 显示确认对话框

#### 替换的调用
- 所有 `this.showToast()` 调用已替换为相应的 toast 方法：
  - 成功消息：`this.showSuccess()`
  - 错误消息：`this.showError()`
  - 警告消息：`this.showWarning()`
- `confirm()` 调用已替换为 `this.showConfirm()`

## 实现方式

### Toast 系统
使用 `BasicToast` 组件，通过 ref 引用调用 `show()` 方法显示消息。支持以下类型：
- `success` - 成功消息（绿色）
- `error` - 错误消息（红色）
- `warning` - 警告消息（黄色）
- `info` - 信息消息（蓝色）

### ConfirmDialog 系统
使用 `confirmDialog` 组件，通过 Promise 方式处理用户确认操作。支持以下类型：
- `default` - 默认样式
- `warning` - 警告样式
- `danger` - 危险操作样式

## 使用示例

### 显示 Toast 消息
```javascript
// 成功消息
this.showSuccess('操作成功！')

// 错误消息
this.showError('操作失败，请重试')

// 警告消息
this.showWarning('请注意...')
```

### 显示确认对话框
```javascript
const confirmed = await this.showConfirm(
  '确认删除',
  '确定要删除这条评论吗？',
  'warning'
)

if (confirmed) {
  // 用户确认，执行删除操作
  await this.deleteComment(comment)
} else {
  // 用户取消，不执行操作
}
```

## 注意事项
1. 确保 `BasicToast.vue` 和 `confirmDialog.vue` 组件文件存在于 `src/views/` 目录中
2. 所有 toast 消息都会自动消失，无需手动关闭
3. ConfirmDialog 返回 Promise，需要使用 `await` 或 `.then()` 处理用户选择
4. 保持了向后兼容性，原有的 `showToast` 方法仍然可用，但内部使用新的 toast 系统

## 文件路径
- `BasicToast.vue`: `src/views/BasicToast.vue`
- `confirmDialog.vue`: `src/views/confirmDialog.vue`
