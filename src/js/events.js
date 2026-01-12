/**
 * EVENTS
 * Event listeners and handlers
 */

const Events = {
    /**
     * Initialize all event listeners
     */
    init() {
        this.initTierSelector();
        this.initEditorEvents();
        this.initOrbitEvents();
        this.initHUDEvents();
        this.initModalEvents();
        this.initHeaderEvents();
        this.initPanelEvents();
        this.initKeyboardEvents();
        this.initGlobalEvents();
        
        console.log('[Events] All event listeners initialized');
    },
    
    /**
     * Tier selector events
     */
    initTierSelector() {
        document.querySelectorAll('.tier-option').forEach(el => {
            el.addEventListener('click', () => {
                Editor.selectTier(el.dataset.tier);
            });
        });
    },
    
    /**
     * Editor panel events
     */
    initEditorEvents() {
        // Toggle process input
        Utils.$('btnToggleProcessInput').addEventListener('click', () => {
            Editor.toggleProcessInput();
        });
        
        // Add process buttons
        Utils.$('btnAddPositive').addEventListener('click', () => {
            Editor.addProcess('positive');
        });
        
        Utils.$('btnAddNegative').addEventListener('click', () => {
            Editor.addProcess('negative');
        });
        
        // Process input enter key
        Utils.$('inputProcessText').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                Editor.addProcess('positive');
            }
        });
        
        // Process list deletion (event delegation)
        Utils.$('processList').addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('[data-action="delete-process"]');
            if (deleteBtn) {
                const index = parseInt(deleteBtn.dataset.processIndex, 10);
                Editor.deleteProcess(index);
            }
        });
        
        // Save orbit
        Utils.$('btnSaveOrbit').addEventListener('click', () => {
            Editor.save();
        });
        
        // Cancel edit
        Utils.$('btnCancelEdit').addEventListener('click', () => {
            Editor.reset();
        });
    },
    
    /**
     * Orbit interaction events
     */
    initOrbitEvents() {
        const container = Utils.$('orbitContainer');
        
        // Mouse/touch down on orbits
        container.addEventListener('mousedown', (e) => this.handleOrbitMouseDown(e));
        container.addEventListener('touchstart', (e) => this.handleOrbitMouseDown(e), { passive: false });
        
        // Click on orbits (for buttons and core)
        container.addEventListener('click', (e) => this.handleOrbitClick(e));
        
        // Global mouse/touch move and up
        document.addEventListener('mousemove', (e) => this.handleGlobalMouseMove(e));
        document.addEventListener('touchmove', (e) => this.handleGlobalMouseMove(e), { passive: false });
        document.addEventListener('mouseup', () => this.handleGlobalMouseUp());
        document.addEventListener('touchend', () => this.handleGlobalMouseUp());
        
        // Space area click (cancel link mode)
        Utils.$('spaceArea').addEventListener('click', (e) => {
            if (e.target.id === 'spaceArea' || e.target.closest('.space-area__svg')) {
                if (Linking.isActive()) {
                    Linking.cancel();
                }
            }
        });
        
        // Connection line double-click to delete
        Utils.$('svgConnections').addEventListener('dblclick', (e) => {
            const hitbox = e.target.closest('.connection-hitbox');
            if (hitbox) {
                const sourceId = hitbox.dataset.sourceId;
                const targetId = hitbox.dataset.targetId;
                
                Modal.confirm('Remove this connection?', () => {
                    Connections.remove(sourceId, targetId);
                    Renderer.renderOrbits();
                    Renderer.renderConnections();
                    Toast.info('Connection removed');
                });
            }
        });
    },
    
    /**
     * Handle mousedown/touchstart on orbit container
     * @param {Event} e
     */
    handleOrbitMouseDown(e) {
        const orbitEl = e.target.closest('.orbit');
        if (!orbitEl) return;
        
        const orbitId = orbitEl.dataset.orbitId;
        
        // Check for resize handle
        if (e.target.closest('.orbit__resize')) {
            Resize.start(e, orbitId);
            return;
        }
        
        // Check for control buttons (don't start drag)
        if (e.target.closest('.orbit__controls')) {
            return;
        }
        
        // Start drag
        DragDrop.start(e, orbitId);
    },
    
    /**
     * Handle click on orbit container
     * @param {Event} e
     */
    handleOrbitClick(e) {
        const actionEl = e.target.closest('[data-action]');
        if (!actionEl) return;
        
        const action = actionEl.dataset.action;
        const orbitId = actionEl.dataset.orbitId;
        
        switch (action) {
            case 'launch':
                Mission.start(orbitId);
                break;
                
            case 'link':
                Linking.start(orbitId);
                break;
                
            case 'edit':
                Editor.loadOrbit(orbitId);
                break;
                
            case 'delete':
                this.handleOrbitDelete(orbitId);
                break;
                
            case 'core-click':
                // If in link mode, complete the link
                if (Linking.isActive()) {
                    Linking.complete(orbitId);
                }
                break;
        }
    },
    
    /**
     * Handle orbit deletion
     * @param {string} orbitId
     */
    handleOrbitDelete(orbitId) {
        const orbit = Orbits.get(orbitId);
        if (!orbit) return;
        
        if (Orbits.canDeleteFreely(orbitId)) {
            Modal.confirm(`Delete orbit "${orbit.name}"?`, () => {
                Orbits.delete(orbitId);
                Renderer.renderOrbits();
                Renderer.renderConnections();
                Toast.info('Orbit deleted');
            });
        } else {
            // Warn about incomplete objective
            Modal.confirm(
                `"${orbit.name}" has an incomplete objective. Deleting breaks your commitment. Continue?`,
                () => {
                    Orbits.delete(orbitId);
                    Renderer.renderOrbits();
                    Renderer.renderConnections();
                    Toast.error('Orbit deleted (commitment broken)');
                }
            );
        }
    },
    
    /**
     * Handle global mouse/touch move
     * @param {Event} e
     */
    handleGlobalMouseMove(e) {
        if (State.ui.dragging.active) {
            DragDrop.move(e);
        } else if (State.ui.resizing.active) {
            Resize.move(e);
        }
    },
    
    /**
     * Handle global mouse/touch up
     */
    handleGlobalMouseUp() {
        if (State.ui.dragging.active) {
            DragDrop.end();
        } else if (State.ui.resizing.active) {
            Resize.end();
        }
    },
    
    /**
     * HUD events
     */
    initHUDEvents() {
        // Checklist item toggle
        Utils.$('hudChecklist').addEventListener('click', (e) => {
            const item = e.target.closest('.hud__checklist-item');
            if (item) {
                const index = parseInt(item.dataset.checklistIndex, 10);
                Mission.toggleChecklistItem(index);
            }
        });
        
        // Keyboard support for checklist
        Utils.$('hudChecklist').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const item = e.target.closest('.hud__checklist-item');
                if (item) {
                    e.preventDefault();
                    const index = parseInt(item.dataset.checklistIndex, 10);
                    Mission.toggleChecklistItem(index);
                }
            }
        });
        
        // HUD buttons
        Utils.$('btnPauseMission').addEventListener('click', () => {
            Mission.togglePause();
        });
        
        Utils.$('btnAbortMission').addEventListener('click', () => {
            Mission.abort();
        });
        
        Utils.$('btnCompleteMission').addEventListener('click', () => {
            Mission.end('COMPLETE');
        });
    },
    
    /**
     * Modal events
     */
    initModalEvents() {
        // Post-session modal
        Utils.$('btnObjectiveYes').addEventListener('click', () => {
            Mission.handleObjectiveAnswer(true);
        });
        
        Utils.$('btnObjectiveNo').addEventListener('click', () => {
            Mission.handleObjectiveAnswer(false);
        });
        
        // Confirm modal
        Utils.$('btnConfirmOk').addEventListener('click', () => {
            Modal.handleConfirmOk();
        });
        
        Utils.$('btnConfirmCancel').addEventListener('click', () => {
            Modal.handleConfirmCancel();
        });
        
        // Data modal
        Utils.$('btnExportData').addEventListener('click', () => {
            Modal.handleExport();
        });
        
        Utils.$('btnImportData').addEventListener('click', () => {
            Modal.handleImport();
        });
        
        Utils.$('btnCloseDataModal').addEventListener('click', () => {
            Modal.closeDataModal();
        });
        
        // Shortcuts modal
        Utils.$('btnCloseShortcuts').addEventListener('click', () => {
            Modal.closeShortcuts();
        });
        
        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    // Don't close post-session modal by clicking outside
                    if (overlay.id !== 'modalPostSession') {
                        overlay.classList.remove('is-active');
                    }
                }
            });
        });
    },
    
    /**
     * Header button events
     */
    initHeaderEvents() {
        // Data modal
        Utils.$('btnDataModal').addEventListener('click', () => {
            Modal.showDataModal();
        });
        
        // Shortcuts
        Utils.$('btnShortcuts').addEventListener('click', () => {
            Modal.showShortcuts();
        });
        
        // Audio toggle
        Utils.$('btnToggleAudio').addEventListener('click', () => {
            const enabled = Audio.toggle();
            Utils.$('btnToggleAudio').textContent = enabled ? '🔊' : '🔇';
            Toast.info(enabled ? 'Sound enabled' : 'Sound muted');
        });
    },
    
    /**
     * Panel events
     */
    initPanelEvents() {
        // Mobile panel toggles
        Utils.$('btnToggleEditor').addEventListener('click', () => {
            Utils.$('panelEditor').classList.toggle('is-active');
            Utils.$('panelLogs').classList.remove('is-active');
        });
        
        Utils.$('btnToggleLogs').addEventListener('click', () => {
            Utils.$('panelLogs').classList.toggle('is-active');
            Utils.$('panelEditor').classList.remove('is-active');
        });
        
        // Panel close buttons
        Utils.$('btnCloseEditor').addEventListener('click', () => {
            Utils.$('panelEditor').classList.remove('is-active');
        });
        
        Utils.$('btnCloseLogs').addEventListener('click', () => {
            Utils.$('panelLogs').classList.remove('is-active');
        });
        
        // Panel footer actions
        Utils.$('btnResetProgress').addEventListener('click', () => {
            Modal.confirm('Reset all orbit progress? This will unlock all orbits.', () => {
                Orbits.resetAllProgress();
                Renderer.renderOrbits();
                Renderer.renderConnections();
                Toast.success('Progress reset');
            });
        });
        
        Utils.$('btnClearLogs').addEventListener('click', () => {
            Modal.confirm('Purge all flight logs? This cannot be undone.', () => {
                Logs.clear();
                Renderer.renderLogs();
                Toast.success('Logs purged');
            });
        });
        
        Utils.$('btnClearLinks').addEventListener('click', () => {
            Modal.confirm('Sever all orbit connections?', () => {
                Connections.clearAll();
                Renderer.renderOrbits();
                Renderer.renderConnections();
                Toast.success('All connections severed');
            });
        });
    },
    
    /**
     * Keyboard shortcuts
     */
    initKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (e.target.matches('input, textarea')) return;
            
            // Escape key
            if (e.key === 'Escape') {
                if (State.mission.isActive) {
                    Mission.togglePause();
                } else if (Linking.isActive()) {
                    Linking.cancel();
                } else if (Modal.isAnyOpen()) {
                    Modal.closeAll();
                }
                return;
            }
            
            // Space key (pause/resume in mission)
            if ((e.key === ' ' || e.code === 'Space') && State.mission.isActive) {
                e.preventDefault();
                Mission.togglePause();
                return;
            }
            
            // Don't process other shortcuts if modal is open or mission is active
            if (Modal.isAnyOpen() || State.mission.isActive) return;
            
            switch (e.key.toLowerCase()) {
                case 'e':
                    Utils.$('panelEditor').classList.toggle('is-active');
                    Utils.$('panelLogs').classList.remove('is-active');
                    break;
                    
                case 'l':
                    Utils.$('panelLogs').classList.toggle('is-active');
                    Utils.$('panelEditor').classList.remove('is-active');
                    break;
                    
                case 'i':
                    Modal.showDataModal();
                    break;
                    
                case 'm':
                    Utils.$('btnToggleAudio').click();
                    break;
                    
                case '?':
                    Modal.showShortcuts();
                    break;
            }
        });
    },
    
    /**
     * Global/window events
     */
    initGlobalEvents() {
        // Window resize - update connections
        window.addEventListener('resize', Utils.debounce(() => {
            Renderer.renderConnections();
        }, 250));
        
        // Before unload - warn if mission active
        window.addEventListener('beforeunload', (e) => {
            if (State.mission.isActive) {
                e.preventDefault();
                e.returnValue = 'A mission is in progress. Are you sure you want to leave?';
            }
        });
    }
};