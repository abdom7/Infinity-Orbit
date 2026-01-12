/**
 * UTILITY FUNCTIONS
 * Helper functions used across the application
 */

const Utils = {
    /**
     * Generate unique ID
     * @returns {string}
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Format seconds as MM:SS or -MM:SS
     * @param {number} seconds
     * @returns {string}
     */
    formatTime(seconds) {
        const absSeconds = Math.abs(seconds);
        const mins = Math.floor(absSeconds / 60);
        const secs = absSeconds % 60;
        const sign = seconds < 0 ? '-' : '';
        return `${sign}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    
    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string}
     */
    formatDate(dateString) {
        if (!dateString) return 'No deadline';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    /**
     * Format timestamp for logs
     * @param {Date} date
     * @returns {string}
     */
    formatTimestamp(date = new Date()) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },
    
    /**
     * Format full date and time
     * @param {string} isoString
     * @returns {string}
     */
    formatDateTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    /**
     * Clamp value between min and max
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    },
    
    /**
     * Debounce function execution
     * @param {Function} func
     * @param {number} wait
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function execution
     * @param {Function} func
     * @param {number} limit
     * @returns {Function}
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Deep clone an object
     * @param {Object} obj
     * @returns {Object}
     */
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * Escape HTML to prevent XSS
     * @param {string} text
     * @returns {string}
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Get element by ID (cached)
     * @param {string} id
     * @returns {HTMLElement|null}
     */
    $(id) {
        return document.getElementById(id);
    },
    
    /**
     * Query selector shorthand
     * @param {string} selector
     * @param {HTMLElement} context
     * @returns {HTMLElement|null}
     */
    $$(selector, context = document) {
        return context.querySelector(selector);
    },
    
    /**
     * Query selector all shorthand
     * @param {string} selector
     * @param {HTMLElement} context
     * @returns {NodeList}
     */
    $$$(selector, context = document) {
        return context.querySelectorAll(selector);
    }
};