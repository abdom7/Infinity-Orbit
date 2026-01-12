/**
 * MODAL CONTROLLER
 * Modal dialogs management
 */

const Modal = {
    /**
     * Show confirmation modal
     * @param {string} message
     * @param {Function} callback - Called if user confirms
     */
    confirm(message, callback) {
        Utils.$('confirmMessage').textContent = message;
        State.pending.confirmCallback = callback;
        Utils.$('modalConfirm').classList.add('is-active');
    },
    
    /**
     * Handle confirm OK button
     */
    handleConfirmOk() {
        const callback = State.pending.confirmCallback;
        
        // Close modal first
        Utils.$('modalConfirm').classList.remove('is-active');
        
        // Execute callback
        if (typeof callback === 'function') {
            callback();
        }
        
        // Clear pending callback
        State.pending.confirmCallback = null;
    },
    
    /**
     * Handle confirm Cancel button
     */
    handleConfirmCancel() {
        State.pending.confirmCallback = null;
        Utils.$('modalConfirm').classList.remove('is-active');
    },
    
    /**
     * Show data import/export modal
     */
    showDataModal() {
        Utils.$('dataTextarea').value = '';
        Utils.$('modalData').classList.add('is-active');
    },
    
    /**
     * Handle data export
     */
    handleExport() {
        const data = Storage.export();
        Utils.$('dataTextarea').value = data;
        
        // Select all text for easy copying
        Utils.$('dataTextarea').select();
        
        Toast.success('Data exported - copy the JSON above');
    },
    
    /**
     * Handle data import
     */
    handleImport() {
        const jsonString = Utils.$('dataTextarea').value.trim();
        
        if (!jsonString) {
            Toast.error('Please paste JSON data first');
            return;
        }
        
        const success = Storage.import(jsonString);
        
        if (success) {
            Toast.success('Data imported successfully');
            Utils.$('modalData').classList.remove('is-active');
            
            // Re-render everything
            Renderer.renderOrbits();
            Renderer.renderConnections();
            Renderer.renderLogs();
        } else {
            Toast.error('Invalid data format');
        }
    },
    
    /**
     * Close data modal
     */
    closeDataModal() {
        Utils.$('modalData').classList.remove('is-active');
    },
    
    /**
     * Show keyboard shortcuts modal
     */
    showShortcuts() {
        Utils.$('modalShortcuts').classList.add('is-active');
    },
    
    /**
     * Close shortcuts modal
     */
    closeShortcuts() {
        Utils.$('modalShortcuts').classList.remove('is-active');
    },
    
    /**
     * Close all modals
     */
    closeAll() {
        Utils.$('modalPostSession').classList.remove('is-active');
        Utils.$('modalConfirm').classList.remove('is-active');
        Utils.$('modalData').classList.remove('is-active');
        Utils.$('modalShortcuts').classList.remove('is-active');
        
        State.pending.confirmCallback = null;
    },
    
    /**
     * Check if any modal is open
     * @returns {boolean}
     */
    isAnyOpen() {
        return document.querySelector('.modal-overlay.is-active') !== null;
    }
};