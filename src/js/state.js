/**
 * APPLICATION STATE
 * Centralized state management
 */

const State = {
    // ===== DATA =====
    orbits: [],
    connections: [],
    logs: [],
    
    // ===== EDITOR STATE =====
    editor: {
        isEditing: false,
        editingId: null,
        selectedTier: null,
        processes: []
    },
    
    // ===== MISSION STATE =====
    mission: {
        isActive: false,
        isPaused: false,
        orbitId: null,
        timeRemaining: 0,
        checklist: [],
        timerId: null,
        startTime: null
    },
    
    // ===== UI STATE =====
    ui: {
        linkingOrbitId: null,
        audioEnabled: Config.AUDIO.ENABLED_DEFAULT,
        
        dragging: {
            active: false,
            orbitId: null,
            offsetX: 0,
            offsetY: 0
        },
        
        resizing: {
            active: false,
            orbitId: null,
            startX: 0,
            startSize: 0
        }
    },
    
    // ===== PENDING OPERATIONS =====
    pending: {
        confirmCallback: null,
        postSessionData: null
    },
    
    // ===== METHODS =====
    
    /**
     * Reset editor state
     */
    resetEditor() {
        this.editor = {
            isEditing: false,
            editingId: null,
            selectedTier: null,
            processes: []
        };
    },
    
    /**
     * Reset mission state
     */
    resetMission() {
        if (this.mission.timerId) {
            clearInterval(this.mission.timerId);
        }
        
        this.mission = {
            isActive: false,
            isPaused: false,
            orbitId: null,
            timeRemaining: 0,
            checklist: [],
            timerId: null,
            startTime: null
        };
    },
    
    /**
     * Reset UI state
     */
    resetUI() {
        this.ui.linkingOrbitId = null;
        this.ui.dragging = { active: false, orbitId: null, offsetX: 0, offsetY: 0 };
        this.ui.resizing = { active: false, orbitId: null, startX: 0, startSize: 0 };
    }
};