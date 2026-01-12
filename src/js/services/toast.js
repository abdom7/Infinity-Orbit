/**
 * TOAST SERVICE
 * Notification toasts
 */

const Toast = {
    container: null,
    
    /**
     * Initialize toast container reference
     */
    init() {
        this.container = Utils.$('toastContainer');
    },
    
    /**
     * Show a toast notification
     * @param {string} message
     * @param {string} type - 'default', 'success', 'error', 'info'
     * @param {number} duration - Duration in ms
     */
    show(message, type = 'default', duration = Config.TOAST.DEFAULT_DURATION) {
        if (!this.container) {
            this.init();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        
        this.container.appendChild(toast);
        
        // Trigger enter animation
        requestAnimationFrame(() => {
            toast.classList.add('is-visible');
        });
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('is-visible');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    },
    
    /**
     * Show success toast
     * @param {string} message
     */
    success(message) {
        this.show(message, 'success');
    },
    
    /**
     * Show error toast
     * @param {string} message
     */
    error(message) {
        this.show(message, 'error', Config.TOAST.ERROR_DURATION);
    },
    
    /**
     * Show info toast
     * @param {string} message
     */
    info(message) {
        this.show(message, 'info');
    }
};