<template>
    <transition name="toast-fade">
        <div v-if="visible" :class="['toast', `toast-${type}`]" @mouseenter="cancelHide" @mouseleave="resumeHide">
            <div class="toast-icon">
                <svg v-if="type === 'success'" viewBox="0 0 24 24" width="22" height="22" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <svg v-if="type === 'error'" viewBox="0 0 24 24" width="22" height="22" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <svg v-if="type === 'warning'" viewBox="0 0 24 24" width="22" height="22" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path
                        d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <svg v-if="type === 'info'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                </svg>
            </div>
            <div class="toast-content">
                <p class="toast-message">{{ message }}</p>
            </div>
            <button class="toast-close" @click="hide">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    </transition>
</template>

<script setup>
/* eslint-disable */
import { ref, onUnmounted } from 'vue'

const props = defineProps({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'error' // 'success', 'error', 'warning'
    },
    duration: {
        type: Number,
        default: 3000
    }
})

const visible = ref(false)
const emit = defineEmits(['hide'])

let timer = null

const show = () => {
    visible.value = true
    if (props.duration > 0) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(hide, props.duration)
    }
}

const hide = () => {
    if (timer) clearTimeout(timer)
    timer = null
    visible.value = false
    emit('hide')
}

const cancelHide = () => {
    if (timer) clearTimeout(timer)
}

const resumeHide = () => {
    if (props.duration > 0) {
        timer = setTimeout(hide, props.duration / 2) // Resume with a shorter duration
    }
}

onUnmounted(() => {
    if (timer) clearTimeout(timer)
})

// Expose the show method to the parent component
defineExpose({
    show
})
</script>

<style scoped>
.toast {
    position: fixed;
    top: 60px;
    /* Adjusted from 20px to be below the nav */
    left: 50%;
    transform: translateX(-50%);
    min-width: 320px;
    max-width: 420px;
    border-radius: 8px;
    color: white;
    z-index: 9999;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: stretch;
    /* Stretch items to fill height */
    background-color: #333;
    /* Default background */
    font-family: "Helvetica Neue", Arial, sans-serif;
    overflow: hidden;
}

.toast-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    min-width: 36px;
    flex-shrink: 0;
}

.toast-content {
    padding: 16px 20px 16px 8px;
    flex-grow: 1;
    display: flex;
    align-items: center;
}

.toast-message {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
    line-height: 1.4;
}

.toast-close {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    padding: 16px;
    opacity: 0.7;
    transition: opacity 0.2s ease;
    flex-shrink: 0;
}

.toast-close:hover {
    opacity: 1;
}

/* Type-specific styles */
.toast-success {
    background-color: #28a745;
}

.toast-success .toast-icon {
    background-color: rgba(0, 0, 0, 0.1);
}

.toast-error {
    background-color: #dc3545;
}

.toast-error .toast-icon {
    background-color: rgba(0, 0, 0, 0.1);
}

.toast-warning {
    background-color: #ffc107;
    color: #333;
}

.toast-warning .toast-icon {
    background-color: rgba(0, 0, 0, 0.1);
}

.toast-warning .toast-close {
    color: #333;
}

/* Info type styles - 简洁的黑底白字 */
.toast-info {
    background-color: #000;
    color: white;
}

.toast-info .toast-icon {
    background-color: rgba(255, 255, 255, 0.1);
}

.toast-info .toast-close {
    color: white;
}

/* Transition */
.toast-fade-enter-active,
.toast-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
    opacity: 0;
    transform: translate(-50%, -20px);
}
</style>
