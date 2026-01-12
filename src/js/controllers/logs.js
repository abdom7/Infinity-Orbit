/**
 * LOGS CONTROLLER
 * Flight log management
 */

const Logs = {
    /**
     * Add a new log entry
     * @param {Object} data
     * @returns {Object} Created log entry
     */
    add(data) {
        const entry = {
            id: Utils.generateId(),
            orbitId: data.orbitId,
            orbitName: data.orbitName,
            tier: data.tier,
            score: data.score,
            status: data.status, // 'COMPLETE', 'ABORTED'
            objectiveAchieved: data.objectiveAchieved || false,
            processesSnapshot: Utils.clone(data.processes || []),
            sessionDuration: data.sessionDuration, // Actual time spent
            plannedDuration: data.plannedDuration, // Original orbit duration
            timestamp: new Date().toISOString()
        };
        
        // Add to beginning of array (newest first)
        State.logs.unshift(entry);
        
        // Limit log entries
        if (State.logs.length > Config.LOGS.MAX_ENTRIES) {
            State.logs = State.logs.slice(0, Config.LOGS.MAX_ENTRIES);
        }
        
        Storage.save();
        
        console.log('[Logs] Entry added:', entry.orbitName, entry.status, entry.score + '%');
        return entry;
    },
    
    /**
     * Get all logs
     * @returns {Array}
     */
    getAll() {
        return State.logs;
    },
    
    /**
     * Get logs for a specific orbit
     * @param {string} orbitId
     * @returns {Array}
     */
    getByOrbit(orbitId) {
        return State.logs.filter(log => log.orbitId === orbitId);
    },
    
    /**
     * Clear all logs
     */
    clear() {
        State.logs = [];
        Storage.save();
        console.log('[Logs] All logs cleared');
    },
    
    /**
     * Get log statistics
     * @returns {Object}
     */
    getStats() {
        const logs = State.logs;
        
        if (logs.length === 0) {
            return {
                totalSessions: 0,
                completedSessions: 0,
                abortedSessions: 0,
                averageScore: 0,
                objectivesAchieved: 0
            };
        }
        
        const completed = logs.filter(l => l.status === 'COMPLETE');
        const aborted = logs.filter(l => l.status === 'ABORTED');
        const achieved = logs.filter(l => l.objectiveAchieved);
        
        const totalScore = logs.reduce((sum, l) => sum + l.score, 0);
        
        return {
            totalSessions: logs.length,
            completedSessions: completed.length,
            abortedSessions: aborted.length,
            averageScore: Math.round(totalScore / logs.length),
            objectivesAchieved: achieved.length
        };
    }
};