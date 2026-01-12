/**
 * EDITOR CONTROLLER
 * Orbit creation and editing
 */

const Editor = {
    /**
     * Select a tier
     * @param {string} tier
     */
    selectTier(tier) {
        State.editor.selectedTier = tier;
        
        // Update UI
        document.querySelectorAll('.tier-option').forEach(el => {
            const isSelected = el.dataset.tier === tier;
            el.classList.toggle('is-selected', isSelected);
            el.setAttribute('aria-checked', isSelected.toString());
        });
        
        Audio.play('click');
    },
    
    /**
     * Toggle process input visibility
     */
    toggleProcessInput() {
        const row = Utils.$('processInputRow');
        const btn = Utils.$('btnToggleProcessInput');
        
        const isVisible = row.classList.toggle('is-visible');
        btn.setAttribute('aria-expanded', isVisible.toString());
        
        if (isVisible) {
            Utils.$('inputProcessText').focus();
        }
    },
    
    /**
     * Add a process to the editor
     * @param {string} type - 'positive' or 'negative'
     */
    addProcess(type) {
        const input = Utils.$('inputProcessText');
        const text = input.value.trim();
        
        if (!text) {
            input.focus();
            return;
        }
        
        State.editor.processes.push({
            text: text,
            type: type
        });
        
        input.value = '';
        input.focus();
        
        Audio.play('click');
        Renderer.renderEditorProcesses();
    },
    
    /**
     * Delete a process from the editor
     * @param {number} index
     */
    deleteProcess(index) {
        if (index < 0 || index >= State.editor.processes.length) return;
        
        State.editor.processes.splice(index, 1);
        Renderer.renderEditorProcesses();
    },
    
    /**
     * Load an orbit into the editor for editing
     * @param {string} orbitId
     */
    loadOrbit(orbitId) {
        const orbit = Orbits.get(orbitId);
        if (!orbit) return;
        
        // Set editor state
        State.editor.isEditing = true;
        State.editor.editingId = orbitId;
        State.editor.selectedTier = orbit.tier;
        State.editor.processes = Utils.clone(orbit.processes);
        
        // Populate form fields
        Utils.$('inputOrbitName').value = orbit.name;
        Utils.$('inputOrbitObjective').value = orbit.objective || '';
        Utils.$('inputOrbitDeadline').value = orbit.deadline || '';
        
        // Select tier
        this.selectTier(orbit.tier);
        
        // Update UI
        Utils.$('editorPanelTitle').textContent = 'EDIT ORBIT';
        Utils.$('btnSaveOrbit').textContent = 'UPDATE ORBIT';
        Utils.$('btnCancelEdit').classList.remove('hidden');
        Utils.$('panelEditor').classList.add('is-focused');
        
        // Render processes
        Renderer.renderEditorProcesses();
        
        // Show panel on mobile
        Utils.$('panelEditor').classList.add('is-active');
        
        console.log('[Editor] Loaded orbit for editing:', orbit.name);
    },
    
    /**
     * Save the current editor state (create or update orbit)
     */
    save() {
        const name = Utils.$('inputOrbitName').value.trim();
        const objective = Utils.$('inputOrbitObjective').value.trim();
        const deadline = Utils.$('inputOrbitDeadline').value;
        const tier = State.editor.selectedTier;
        const processes = State.editor.processes;
        
        // Validation
        if (!name) {
            Toast.error('Please enter a codename');
            Utils.$('inputOrbitName').focus();
            return;
        }
        
        if (!tier) {
            Toast.error('Please select a duration tier');
            return;
        }
        
        const data = {
            name,
            objective,
            deadline,
            tier,
            processes
        };
        
        if (State.editor.isEditing) {
            // Update existing orbit
            Orbits.update(State.editor.editingId, data);
            Toast.success('Orbit updated');
        } else {
            // Create new orbit with random position
            const spaceArea = Utils.$('spaceArea');
            const rect = spaceArea.getBoundingClientRect();
            
            data.x = Math.random() * (rect.width - Config.ORBIT.DEFAULT_SIZE - 100) + 50;
            data.y = Math.random() * (rect.height - Config.ORBIT.DEFAULT_SIZE - 100) + 50;
            
            Orbits.create(data);
            Toast.success('Orbit initialized');
        }
        
        Audio.play('launch');
        
        // Reset editor and re-render
        this.reset();
        Renderer.renderOrbits();
        Renderer.renderConnections();
    },
    
    /**
     * Reset editor to default state
     */
    reset() {
        // Reset state
        State.resetEditor();
        
        // Clear form fields
        Utils.$('inputOrbitName').value = '';
        Utils.$('inputOrbitObjective').value = '';
        Utils.$('inputOrbitDeadline').value = '';
        Utils.$('inputProcessText').value = '';
        
        // Reset tier selection
        document.querySelectorAll('.tier-option').forEach(el => {
            el.classList.remove('is-selected');
            el.setAttribute('aria-checked', 'false');
        });
        
        // Update UI
        Utils.$('editorPanelTitle').textContent = 'MISSION COMMAND';
        Utils.$('btnSaveOrbit').textContent = 'INITIALIZE ORBIT';
        Utils.$('btnCancelEdit').classList.add('hidden');
        Utils.$('panelEditor').classList.remove('is-focused');
        Utils.$('processInputRow').classList.remove('is-visible');
        Utils.$('btnToggleProcessInput').setAttribute('aria-expanded', 'false');
        
        // Re-render processes (empty)
        Renderer.renderEditorProcesses();
    }
};