/**
 * DRAG & DROP CONTROLLER
 * Orbit dragging functionality
 */

const DragDrop = {
    /**
     * Start dragging an orbit
     * @param {Event} e
     * @param {string} orbitId
     */
    start(e, orbitId) {
        // Ignore if clicking on controls or resize handle
        if (e.target.closest('.orbit__controls') || e.target.closest('.orbit__resize')) {
            return;
        }
        
        const orbit = Orbits.get(orbitId);
        if (!orbit) return;
        
        // Don't drag locked orbits
        if (Orbits.isLocked(orbitId)) return;
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        State.ui.dragging = {
            active: true,
            orbitId: orbitId,
            offsetX: clientX - orbit.x,
            offsetY: clientY - orbit.y
        };
        
        // Add dragging class
        const orbitEl = document.querySelector(`[data-orbit-id="${orbitId}"]`);
        if (orbitEl) {
            orbitEl.classList.add('is-dragging');
        }
    },
    
    /**
     * Handle drag movement
     * @param {Event} e
     */
    move(e) {
        if (!State.ui.dragging.active) return;
        
        e.preventDefault();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const orbit = Orbits.get(State.ui.dragging.orbitId);
        if (!orbit) return;
        
        const spaceArea = Utils.$('spaceArea');
        const rect = spaceArea.getBoundingClientRect();
        
        // Calculate new position
        let x = clientX - State.ui.dragging.offsetX;
        let y = clientY - State.ui.dragging.offsetY;
        
        // Constrain to space area bounds
        const margin = Config.ORBIT.MARGIN;
        x = Utils.clamp(x, margin, rect.width - orbit.size - margin);
        y = Utils.clamp(y, margin, rect.height - orbit.size - margin);
        
        // Update DOM directly for smooth movement
        const orbitEl = document.querySelector(`[data-orbit-id="${orbit.id}"]`);
        if (orbitEl) {
            orbitEl.style.left = `${x}px`;
            orbitEl.style.top = `${y}px`;
        }
        
        // Update orbit position in memory (for connection rendering)
        orbit.x = x;
        orbit.y = y;
        
        // Re-render connections in real-time
        Renderer.renderConnections();
    },
    
    /**
     * End drag operation
     */
    end() {
        if (!State.ui.dragging.active) return;
        
        const orbitId = State.ui.dragging.orbitId;
        const orbitEl = document.querySelector(`[data-orbit-id="${orbitId}"]`);
        
        if (orbitEl) {
            orbitEl.classList.remove('is-dragging');
            
            // Save final position
            const x = parseInt(orbitEl.style.left, 10);
            const y = parseInt(orbitEl.style.top, 10);
            
            Orbits.updatePosition(orbitId, x, y);
        }
        
        // Reset dragging state
        State.ui.dragging = {
            active: false,
            orbitId: null,
            offsetX: 0,
            offsetY: 0
        };
    }
};