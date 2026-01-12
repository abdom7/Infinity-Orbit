/**
 * ORBITS CONTROLLER
 * Orbit CRUD operations
 */

const Orbits = {
    /**
     * Get orbit by ID
     * @param {string} id
     * @returns {Object|undefined}
     */
    get(id) {
        return State.orbits.find(o => o.id === id);
    },
    
    /**
     * Get all orbits
     * @returns {Array}
     */
    getAll() {
        return State.orbits;
    },
    
    /**
     * Create a new orbit
     * @param {Object} data
     * @returns {Object} Created orbit
     */
    create(data) {
        const tier = Config.TIERS[data.tier];
        
        const orbit = {
            id: Utils.generateId(),
            name: data.name,
            objective: data.objective || '',
            deadline: data.deadline || null,
            tier: data.tier,
            duration: tier.duration,
            processes: Utils.clone(data.processes || []),
            x: data.x ?? 100,
            y: data.y ?? 100,
            size: Config.ORBIT.DEFAULT_SIZE,
            isSessionCompleted: false, // Completed a session (unlocks next orbit)
            isObjectiveAchieved: false, // Achieved the objective
            createdAt: new Date().toISOString()
        };
        
        State.orbits.push(orbit);
        Storage.save();
        
        console.log('[Orbits] Created:', orbit.name);
        return orbit;
    },
    
    /**
     * Update an existing orbit
     * @param {string} id
     * @param {Object} data
     * @returns {Object|null} Updated orbit
     */
    update(id, data) {
        const orbit = this.get(id);
        if (!orbit) return null;
        
        // Update allowed fields
        if (data.name !== undefined) orbit.name = data.name;
        if (data.objective !== undefined) orbit.objective = data.objective;
        if (data.deadline !== undefined) orbit.deadline = data.deadline;
        if (data.tier !== undefined) {
            orbit.tier = data.tier;
            orbit.duration = Config.TIERS[data.tier].duration;
        }
        if (data.processes !== undefined) orbit.processes = Utils.clone(data.processes);
        
        Storage.save();
        
        console.log('[Orbits] Updated:', orbit.name);
        return orbit;
    },
    
    /**
     * Update orbit position
     * @param {string} id
     * @param {number} x
     * @param {number} y
     */
    updatePosition(id, x, y) {
        const orbit = this.get(id);
        if (!orbit) return;
        
        orbit.x = x;
        orbit.y = y;
        Storage.save();
    },
    
    /**
     * Update orbit size
     * @param {string} id
     * @param {number} size
     */
    updateSize(id, size) {
        const orbit = this.get(id);
        if (!orbit) return;
        
        orbit.size = Utils.clamp(size, Config.ORBIT.MIN_SIZE, Config.ORBIT.MAX_SIZE);
        Storage.save();
    },
    
    /**
     * Mark orbit session as completed (unlocks dependent orbits)
     * @param {string} id
     */
    completeSession(id) {
        const orbit = this.get(id);
        if (!orbit) return;
        
        orbit.isSessionCompleted = true;
        Storage.save();
        
        console.log('[Orbits] Session completed:', orbit.name);
    },
    
    /**
     * Mark orbit objective as achieved
     * @param {string} id
     */
    achieveObjective(id) {
        const orbit = this.get(id);
        if (!orbit) return;
        
        orbit.isObjectiveAchieved = true;
        Storage.save();
        
        console.log('[Orbits] Objective achieved:', orbit.name);
    },
    
    /**
     * Delete an orbit
     * @param {string} id
     * @returns {boolean} Success
     */
    delete(id) {
        const index = State.orbits.findIndex(o => o.id === id);
        if (index === -1) return false;
        
        const orbit = State.orbits[index];
        
        // Remove associated connections
        Connections.removeAllForOrbit(id);
        
        // Remove orbit
        State.orbits.splice(index, 1);
        Storage.save();
        
        console.log('[Orbits] Deleted:', orbit.name);
        return true;
    },
    
    /**
     * Check if orbit is locked (has incomplete prerequisite session)
     * @param {string} id
     * @returns {boolean}
     */
    isLocked(id) {
        // Find all connections where this orbit is the target
        const incomingConnections = State.connections.filter(c => c.targetId === id);
        
        if (incomingConnections.length === 0) return false;
        
        // Locked if ANY source orbit has not completed a session
        return incomingConnections.some(conn => {
            const sourceOrbit = this.get(conn.sourceId);
            return sourceOrbit && !sourceOrbit.isSessionCompleted;
        });
    },
    
    /**
     * Check if orbit can be deleted (no objective or objective achieved or confirmed)
     * @param {string} id
     * @returns {boolean}
     */
    canDeleteFreely(id) {
        const orbit = this.get(id);
        if (!orbit) return false;
        
        // Can delete freely if:
        // 1. Objective is achieved
        // 2. No objective set
        // 3. Session already completed
        if (orbit.isObjectiveAchieved) return true;
        if (!orbit.objective || orbit.objective.trim() === '') return true;
        if (orbit.isSessionCompleted) return true;
        
        return false;
    },
    
    /**
     * Reset all orbit progress (session completed + objective achieved)
     */
    resetAllProgress() {
        State.orbits.forEach(orbit => {
            orbit.isSessionCompleted = false;
            orbit.isObjectiveAchieved = false;
        });
        Storage.save();
        
        console.log('[Orbits] All progress reset');
    }
};