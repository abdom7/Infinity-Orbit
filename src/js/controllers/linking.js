/**
 * LINKING CONTROLLER
 * Orbit connection/linking functionality
 */

const Linking = {
    /**
     * Start or cancel link mode
     * @param {string} orbitId
     */
    start(orbitId) {
        if (State.ui.linkingOrbitId === orbitId) {
            // Cancel link mode if clicking same orbit
            this.cancel();
        } else {
            // Start link mode
            State.ui.linkingOrbitId = orbitId;
            Toast.info('Select target orbit to connect/disconnect');
            
            // Re-render to show link mode UI
            Renderer.renderOrbits();
            Renderer.renderConnections();
        }
    },
    
    /**
     * Complete link to target orbit
     * @param {string} targetId
     */
    complete(targetId) {
        if (!State.ui.linkingOrbitId) return;
        
        const sourceId = State.ui.linkingOrbitId;
        
        if (sourceId === targetId) {
            Toast.error('Cannot link orbit to itself');
            return;
        }
        
        // Toggle connection
        const result = Connections.toggle(sourceId, targetId);
        
        if (result.action === 'created') {
            Toast.success('Orbits connected');
            Audio.play('link');
        } else {
            Toast.info('Connection severed');
        }
        
        // Exit link mode
        this.cancel();
    },
    
    /**
     * Cancel link mode
     */
    cancel() {
        State.ui.linkingOrbitId = null;
        
        // Re-render to hide link mode UI
        Renderer.renderOrbits();
        Renderer.renderConnections();
    },
    
    /**
     * Check if currently in link mode
     * @returns {boolean}
     */
    isActive() {
        return State.ui.linkingOrbitId !== null;
    }
};