/**
 * RESIZE CONTROLLER
 * Orbit resizing functionality
 */

const Resize = {
    /**
     * Start resizing an orbit
     * @param {Event} e
     * @param {string} orbitId
     */
    start(e, orbitId) {
        e.stopPropagation();
        e.preventDefault();
        
        const orbit = Orbits.get(orbitId);
        if (!orbit) return;
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        
        State.ui.resizing = {
            active: true,
            orbitId: orbitId,
            startX: clientX,
            startSize: orbit.size
        };
    },
    
    /**
     * Handle resize movement
     * @param {Event} e
     */
    move(e) {
        if (!State.ui.resizing.active) return;
        
        e.preventDefault();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const diff = clientX - State.ui.resizing.startX;
        
        const newSize = Utils.clamp(
            State.ui.resizing.startSize + diff,
            Config.ORBIT.MIN_SIZE,
            Config.ORBIT.MAX_SIZE
        );
        
        // Update DOM directly
        const orbitEl = document.querySelector(`[data-orbit-id="${State.ui.resizing.orbitId}"]`);
        if (orbitEl) {
            orbitEl.style.width = `${newSize}px`;
            orbitEl.style.height = `${newSize}px`;
            orbitEl.style.fontSize = `${Math.max(10, newSize / 10)}px`;
        }
    },
    
    /**
     * End resize operation
     */
    end() {
        if (!State.ui.resizing.active) return;
        
        const orbitEl = document.querySelector(`[data-orbit-id="${State.ui.resizing.orbitId}"]`);
        
        if (orbitEl) {
            const newSize = parseInt(orbitEl.style.width, 10);
            Orbits.updateSize(State.ui.resizing.orbitId, newSize);
        }
        
        // Re-render connections (positions may have shifted visually)
        Renderer.renderConnections();
        
        // Reset resizing state
        State.ui.resizing = {
            active: false,
            orbitId: null,
            startX: 0,
            startSize: 0
        };
    }
};