/**
 * CONNECTIONS CONTROLLER
 * Manage orbit dependencies
 */

const Connections = {
    /**
     * Check if connection exists between two orbits (either direction)
     * @param {string} sourceId
     * @param {string} targetId
     * @returns {boolean}
     */
    exists(sourceId, targetId) {
        return State.connections.some(c =>
            (c.sourceId === sourceId && c.targetId === targetId) ||
            (c.sourceId === targetId && c.targetId === sourceId)
        );
    },
    
    /**
     * Get connection between two orbits
     * @param {string} sourceId
     * @param {string} targetId
     * @returns {Object|undefined}
     */
    get(sourceId, targetId) {
        return State.connections.find(c =>
            (c.sourceId === sourceId && c.targetId === targetId) ||
            (c.sourceId === targetId && c.targetId === sourceId)
        );
    },
    
    /**
     * Create a new connection
     * @param {string} sourceId
     * @param {string} targetId
     * @returns {boolean} Success
     */
    create(sourceId, targetId) {
        if (sourceId === targetId) {
            console.warn('[Connections] Cannot connect orbit to itself');
            return false;
        }
        
        if (this.exists(sourceId, targetId)) {
            console.warn('[Connections] Connection already exists');
            return false;
        }
        
        State.connections.push({
            id: Utils.generateId(),
            sourceId,
            targetId
        });
        
        Storage.save();
        console.log('[Connections] Created connection:', sourceId, '->', targetId);
        return true;
    },
    
    /**
     * Remove a connection between two orbits
     * @param {string} sourceId
     * @param {string} targetId
     * @returns {boolean} Success
     */
    remove(sourceId, targetId) {
        const index = State.connections.findIndex(c =>
            (c.sourceId === sourceId && c.targetId === targetId) ||
            (c.sourceId === targetId && c.targetId === sourceId)
        );
        
        if (index === -1) return false;
        
        State.connections.splice(index, 1);
        Storage.save();
        
        console.log('[Connections] Removed connection:', sourceId, '<->', targetId);
        return true;
    },
    
    /**
     * Toggle connection (create if not exists, remove if exists)
     * @param {string} sourceId
     * @param {string} targetId
     * @returns {Object} { action: 'created' | 'removed' }
     */
    toggle(sourceId, targetId) {
        if (this.exists(sourceId, targetId)) {
            this.remove(sourceId, targetId);
            return { action: 'removed' };
        } else {
            this.create(sourceId, targetId);
            return { action: 'created' };
        }
    },
    
    /**
     * Remove all connections for a specific orbit
     * @param {string} orbitId
     */
    removeAllForOrbit(orbitId) {
        State.connections = State.connections.filter(c =>
            c.sourceId !== orbitId && c.targetId !== orbitId
        );
        Storage.save();
    },
    
    /**
     * Clear all connections
     */
    clearAll() {
        State.connections = [];
        Storage.save();
        console.log('[Connections] All connections cleared');
    },
    
    /**
     * Get all connections
     * @returns {Array}
     */
    getAll() {
        return State.connections;
    }
};