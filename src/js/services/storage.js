/**
 * STORAGE SERVICE
 * LocalStorage persistence
 */

const Storage = {
    /**
     * Save current state to localStorage
     */
    save() {
        try {
            const data = {
                orbits: State.orbits,
                connections: State.connections,
                logs: State.logs,
                settings: {
                    audioEnabled: State.ui.audioEnabled
                },
                version: Config.STORAGE_VERSION,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem(Config.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('[Storage] Save failed:', error);
            Toast.show('Failed to save data', 'error');
            return false;
        }
    },
    
    /**
     * Load state from localStorage
     * @returns {boolean} Success status
     */
    load() {
        try {
            const raw = localStorage.getItem(Config.STORAGE_KEY);
            
            if (!raw) {
                console.log('[Storage] No saved data found');
                return false;
            }
            
            const data = JSON.parse(raw);
            
            // Validate and load data
            State.orbits = Array.isArray(data.orbits) ? data.orbits : [];
            State.connections = Array.isArray(data.connections) ? data.connections : [];
            State.logs = Array.isArray(data.logs) ? data.logs : [];
            
            // Load settings
            if (data.settings) {
                State.ui.audioEnabled = data.settings.audioEnabled ?? Config.AUDIO.ENABLED_DEFAULT;
            }
            
            console.log('[Storage] Data loaded successfully');
            return true;
        } catch (error) {
            console.error('[Storage] Load failed:', error);
            return false;
        }
    },
    
    /**
     * Export data as JSON string
     * @returns {string}
     */
    export() {
        const data = {
            orbits: State.orbits,
            connections: State.connections,
            logs: State.logs,
            exportedAt: new Date().toISOString(),
            version: Config.STORAGE_VERSION
        };
        
        return JSON.stringify(data, null, 2);
    },
    
    /**
     * Import data from JSON string
     * @param {string} jsonString
     * @returns {boolean} Success status
     */
    import(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Validate required fields
            if (!data.orbits || !Array.isArray(data.orbits)) {
                throw new Error('Invalid data format: missing orbits array');
            }
            
            // Import data
            State.orbits = data.orbits;
            State.connections = Array.isArray(data.connections) ? data.connections : [];
            State.logs = Array.isArray(data.logs) ? data.logs : [];
            
            // Save to storage
            this.save();
            
            console.log('[Storage] Data imported successfully');
            return true;
        } catch (error) {
            console.error('[Storage] Import failed:', error);
            return false;
        }
    },
    
    /**
     * Clear all stored data
     */
    clear() {
        try {
            localStorage.removeItem(Config.STORAGE_KEY);
            State.orbits = [];
            State.connections = [];
            State.logs = [];
            console.log('[Storage] Data cleared');
            return true;
        } catch (error) {
            console.error('[Storage] Clear failed:', error);
            return false;
        }
    }
};