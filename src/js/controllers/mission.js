/**
 * MISSION CONTROLLER
 * Active mission/session management
 */

const Mission = {
    /**
     * Start a mission for an orbit
     * @param {string} orbitId
     * @returns {boolean} Success
     */
    start(orbitId) {
        const orbit = Orbits.get(orbitId);
        
        if (!orbit) {
            Toast.error('Orbit not found');
            return false;
        }
        
        if (Orbits.isLocked(orbitId)) {
            Toast.error('Complete prerequisite missions first');
            return false;
        }
        
        if (State.mission.isActive) {
            Toast.error('A mission is already active');
            return false;
        }
        
        // Initialize mission state
        State.mission = {
            isActive: true,
            isPaused: false,
            orbitId: orbitId,
            timeRemaining: orbit.duration * 60, // Convert to seconds
            checklist: orbit.processes.map(p => ({
                ...p,
                isChecked: false
            })),
            timerId: null,
            startTime: Date.now()
        };
        
        // Play launch sound
        Audio.play('launch');
        
        // Start timer
        this.startTimer();
        
        // Update HUD
        Renderer.renderHUD();
        
        // Show HUD
        const hud = Utils.$('hud');
        hud.classList.add('is-active');
        hud.style.setProperty('--hud-color', Config.TIERS[orbit.tier].color);
        
        Toast.info('Mission launched');
        console.log('[Mission] Started:', orbit.name);
        
        return true;
    },
    
    /**
     * Start the countdown timer
     */
    startTimer() {
        if (State.mission.timerId) {
            clearInterval(State.mission.timerId);
        }
        
        State.mission.timerId = setInterval(() => {
            if (!State.mission.isPaused) {
                State.mission.timeRemaining--;
                this.updateTimerDisplay();
                
                // Warning at threshold
                if (State.mission.timeRemaining === Config.TIMER.WARNING_THRESHOLD) {
                    Audio.play('warning');
                }
            }
        }, Config.TIMER.TICK_INTERVAL);
    },
    
    /**
     * Update the timer display in HUD
     */
    updateTimerDisplay() {
        const timerEl = Utils.$('hudTimer');
        const time = State.mission.timeRemaining;
        
        timerEl.textContent = Utils.formatTime(time);
        
        // Update timer styling based on state
        timerEl.classList.remove('hud__timer--warning', 'hud__timer--expired');
        
        if (time <= Config.TIMER.WARNING_THRESHOLD && time > 0) {
            timerEl.classList.add('hud__timer--warning');
        } else if (time <= 0) {
            timerEl.classList.add('hud__timer--expired');
        }
    },
    
    /**
     * Toggle pause state
     */
    togglePause() {
        if (!State.mission.isActive) return;
        
        State.mission.isPaused = !State.mission.isPaused;
        
        const btn = Utils.$('btnPauseMission');
        btn.textContent = State.mission.isPaused ? 'RESUME' : 'PAUSE';
        
        if (State.mission.isPaused) {
            Toast.info('Mission paused');
        } else {
            Toast.info('Mission resumed');
        }
    },
    
    /**
     * Toggle a checklist item
     * @param {number} index
     */
    toggleChecklistItem(index) {
        if (!State.mission.isActive) return;
        if (index < 0 || index >= State.mission.checklist.length) return;
        
        State.mission.checklist[index].isChecked = !State.mission.checklist[index].isChecked;
        
        Audio.play('click');
        
        this.updateIntegrity();
        Renderer.renderHUDChecklist();
    },
    
    /**
     * Calculate and update integrity score
     * @returns {number} Current score
     */
    updateIntegrity() {
        const checklist = State.mission.checklist;
        const positives = checklist.filter(p => p.type === 'positive');
        const negatives = checklist.filter(p => p.type === 'negative');
        
        let score = 100;
        
        // Deduct for unchecked positives (things you should do but didn't)
        if (positives.length > 0) {
            const uncheckedPositives = positives.filter(p => !p.isChecked).length;
            const deduction = (uncheckedPositives / positives.length) * 100;
            score -= deduction;
        }
        
        // Deduct for checked negatives (things you should avoid but did)
        const checkedNegatives = negatives.filter(p => p.isChecked).length;
        score -= checkedNegatives * 15; // 15% penalty per negative
        
        score = Math.max(0, Math.round(score));
        
        // Update display
        Utils.$('hudIntegrityFill').style.width = `${score}%`;
        Utils.$('hudIntegrityValue').textContent = `${score}%`;
        
        return score;
    },
    
    /**
     * End the current mission
     * @param {string} status - 'COMPLETE' or 'ABORTED'
     */
    end(status) {
        if (!State.mission.isActive) return;
        
        // Stop timer
        if (State.mission.timerId) {
            clearInterval(State.mission.timerId);
            State.mission.timerId = null;
        }
        
        const orbit = Orbits.get(State.mission.orbitId);
        const score = this.updateIntegrity();
        const sessionDuration = Math.floor((Date.now() - State.mission.startTime) / 1000);
        
        // Play appropriate sound
        if (status === 'COMPLETE') {
            Audio.play('complete');
        } else {
            Audio.play('abort');
        }
        
        // Store data for post-session modal
        State.pending.postSessionData = {
            orbitId: orbit.id,
            orbitName: orbit.name,
            tier: orbit.tier,
            score: score,
            status: status,
            processes: State.mission.checklist,
            sessionDuration: sessionDuration,
            plannedDuration: orbit.duration * 60
        };
        
        // Mark session as completed if status is COMPLETE
        if (status === 'COMPLETE') {
            Orbits.completeSession(orbit.id);
        }
        
        // Hide HUD
        Utils.$('hud').classList.remove('is-active');
        
        // Show post-session modal
        this.showPostSessionModal(status, score);
        
        // Reset mission state
        State.resetMission();
        
        console.log('[Mission] Ended:', status, score + '%');
    },
    
    /**
     * Show post-session debrief modal
     * @param {string} status
     * @param {number} score
     */
    showPostSessionModal(status, score) {
        Utils.$('postSessionIcon').textContent = status === 'COMPLETE' ? '🎯' : '⚠️';
        Utils.$('postSessionSubtitle').textContent = `${status} • Integrity: ${score}%`;
        Utils.$('modalPostSession').classList.add('is-active');
    },
    
    /**
     * Handle post-session objective answer
     * @param {boolean} achieved
     */
    handleObjectiveAnswer(achieved) {
        const data = State.pending.postSessionData;
        
        if (!data) {
            console.error('[Mission] No pending session data');
            return;
        }
        
        data.objectiveAchieved = achieved;
        
        // Add log entry
        Logs.add(data);
        
        // Update orbit if objective achieved
        if (achieved) {
            Orbits.achieveObjective(data.orbitId);
            Toast.success('Objective achieved! Great work!');
        } else {
            Toast.info('Session logged. Keep pushing forward!');
        }
        
        // Close modal
        Utils.$('modalPostSession').classList.remove('is-active');
        
        // Clear pending data
        State.pending.postSessionData = null;
        
        // Re-render
        Renderer.renderOrbits();
        Renderer.renderConnections();
        Renderer.renderLogs();
    },
    
    /**
     * Abort mission with confirmation
     */
    abort() {
        Modal.confirm('Abort this mission? Progress will be lost.', () => {
            this.end('ABORTED');
        });
    }
};