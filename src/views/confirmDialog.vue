<template>
    <div v-if="visible" class="confirm-dialog-overlay" @click="handleOverlayClick">
        <div class="confirm-dialog" @click.stop>
            <div class="confirm-header">
                <div class="confirm-icon">{{ icon }}</div>
                <h3 class="confirm-title">{{ title }}</h3>
                <button class="close-btn" @click="handleCancel">✕</button>
            </div>

            <div class="confirm-content">
                <p class="confirm-message">{{ message }}</p>
            </div>

            <div class="confirm-actions">
                <button class="cancel-btn" @click="handleCancel" :disabled="loading">
                    {{ cancelText }}
                </button>
                <button class="confirm-btn" @click="handleConfirm" :disabled="loading" :class="{ 'loading': loading }">
                    <span v-if="loading" class="loading-spinner"></span>
                    {{ loading ? loadingText : confirmText }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: '确认'
    },
    message: {
        type: String,
        default: '确定要执行此操作吗？'
    },
    confirmText: {
        type: String,
        default: '确定'
    },
    cancelText: {
        type: String,
        default: '取消'
    },
    loadingText: {
        type: String,
        default: '处理中...'
    },
    icon: {
        type: String,
        default: '❓'
    },
    type: {
        type: String,
        default: 'default', // default, warning, danger, success
        validator: (value) => ['default', 'warning', 'danger', 'success'].includes(value)
    },
    loading: {
        type: Boolean,
        default: false
    },
    closeOnOverlay: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

const handleConfirm = () => {
    if (!props.loading) {
        emit('confirm')
    }
}

const handleCancel = () => {
    if (!props.loading) {
        emit('cancel')
        emit('update:visible', false)
    }
}

const handleOverlayClick = () => {
    if (props.closeOnOverlay && !props.loading) {
        emit('update:visible', false)
    }
}
</script>

<style scoped>
.confirm-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(2px);
}

.confirm-dialog {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 480px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    animation: dialogSlideIn 0.3s ease-out;
    overflow: hidden;
    border: 1px solid #e9ecef;
}

@keyframes dialogSlideIn {
    from {
        opacity: 0;
        transform: translateY(-16px) scale(0.96);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.confirm-header {
    display: flex;
    align-items: center;
    padding: 16px 16px 12px;
    background: white;
    position: relative;
}

.confirm-icon {
    font-size: 1.5rem;
    margin-right: 16px;
    color: #495057;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 8px;
    border: 1px solid #dee2e6;
}

.confirm-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    flex: 1;
    color: #2c3e50;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.close-btn {
    background: none;
    border: none;
    color: #6c757d;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    background: #e9ecef;
    color: #495057;
}

.confirm-content {
    padding: 16px;
    background: white;
}

.confirm-message {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: #495057;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 500;
}

.confirm-actions {
    display: flex;
    gap: 12px;
    padding: 16px;
    background: white;
}

.cancel-btn,
.confirm-btn {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    position: relative;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cancel-btn {
    background: white;
    color: #6c757d;
    border: 1px solid #dee2e6;
}

.cancel-btn:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #adb5bd;
    color: #495057;
}

.confirm-btn {
    background: #000;
    color: white;
    border: 1px solid #000;
}

.confirm-btn:hover:not(:disabled) {
    background: #000;
    border-color: #000;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.confirm-btn:disabled,
.cancel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.confirm-btn.loading {
    background: #6c757d;
    border-color: #6c757d;
}

.loading-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 类型变体 */
.confirm-btn.type-warning {
    background: #f39c12;
    border-color: #f39c12;
}

.confirm-btn.type-warning:hover:not(:disabled) {
    background: #e67e22;
    border-color: #e67e22;
}

.confirm-btn.type-danger {
    background: #e74c3c;
    border-color: #e74c3c;
}

.confirm-btn.type-danger:hover:not(:disabled) {
    background: #c0392b;
    border-color: #c0392b;
}

.confirm-btn.type-success {
    background: #27ae60;
    border-color: #27ae60;
}

.confirm-btn.type-success:hover:not(:disabled) {
    background: #229954;
    border-color: #229954;
}

/* 响应式设计 */
@media (max-width: 480px) {
    .confirm-dialog {
        width: 95%;
        margin: 16px;
    }

    .confirm-header {
        padding: 16px 16px 12px;
    }

    .confirm-content {
        padding: 16px;
    }

    .confirm-actions {
        padding: 12px 16px 16px;
        flex-direction: column;
    }

    .cancel-btn,
    .confirm-btn {
        width: 100%;
    }

    .confirm-title {
        font-size: 1.125rem;
    }

    .confirm-message {
        font-size: 0.875rem;
    }
}
</style>
