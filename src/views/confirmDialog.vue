<template>
    <div v-if="visible" class="confirm-dialog-overlay" @click="handleOverlayClick">
        <div class="confirm-dialog" @click.stop>
            <div class="confirm-header">
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
                    <span v-else>{{ confirmText }}</span>
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
        default: 'CONFIRM'
    },
    message: {
        type: String,
        default: 'Are you sure you want to perform this action?'
    },
    confirmText: {
        type: String,
        default: 'CONFIRM'
    },
    cancelText: {
        type: String,
        default: 'CANCEL'
    },
    loadingText: {
        type: String,
        default: 'PROCESSING...'
    },
    icon: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'default',
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
@import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@700&display=swap');

.confirm-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.confirm-dialog {
    background: black;
    color: white;
    border-radius: 0;
    width: 90%;
    max-width: 420px;
    animation: dialogFadeIn 0.2s ease-out;
    border: 1px solid white;
    font-family: 'Roboto Condensed', sans-serif;
    text-transform: uppercase;
}

@keyframes dialogFadeIn {
    from {
        opacity: 0;
        transform: scale(0.98);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.confirm-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid white;
}

.confirm-title {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: 1px;
}

.close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.close-btn:hover {
    transform: scale(1.2);
}

.confirm-content {
    padding: 30px 20px;
}

.confirm-message {
    margin: 0;
    font-size: 1rem;
    line-height: 1.5;
    text-align: center;
    letter-spacing: 0.5px;
    font-weight: 400;
    text-transform: none;
}

.confirm-actions {
    display: flex;
    border-top: 1px solid white;
}

.cancel-btn,
.confirm-btn {
    flex: 1;
    padding: 18px 20px;
    border: none;
    border-radius: 0;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Roboto Condensed', sans-serif;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 50px;
}

.cancel-btn {
    background: black;
    color: white;
    border-right: 1px solid white;
}

.cancel-btn:hover:not(:disabled) {
    background: #333;
}

.confirm-btn {
    background: white;
    color: black;
}

.confirm-btn:hover:not(:disabled) {
    background: #ccc;
}

.confirm-btn:disabled,
.cancel-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.confirm-btn.loading {
    background: #555;
    color: white;
}

.loading-spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Responsive Design */
@media (max-width: 480px) {
    .confirm-dialog {
        width: 100%;
        margin: 20px;
        max-width: none;
    }
}
</style>
