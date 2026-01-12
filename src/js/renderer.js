/**
 * RENDERER
 * DOM rendering functions
 */

const Renderer = {
    /**
     * Render all orbits in the space area
     */
    renderOrbits() {
        const container = Utils.$('orbitContainer');
        const emptyState = Utils.$('emptyState');
        
        if (State.orbits.length === 0) {
            emptyState.classList.remove('hidden');
            container.innerHTML = '';
            return;
        }
        
        emptyState.classList.add('hidden');
        
        container.innerHTML = State.orbits.map(orbit => {
            const tier = Config.TIERS[orbit.tier];
            const isLocked = Orbits.isLocked(orbit.id);
            const isLinkSource = State.ui.linkingOrbitId === orbit.id;
            const isLinkTarget = State.ui.linkingOrbitId && State.ui.linkingOrbitId !== orbit.id;
            
            // Build class list
            const classes = [
                'orbit',
                `orbit--tier-${orbit.tier}`,
                isLocked ? 'is-locked' : '',
                orbit.isSessionCompleted ? 'is-session-completed' : '',
                isLinkSource ? 'is-link-source' : '',
                isLinkTarget ? 'is-link-target' : ''
            ].filter(Boolean).join(' ');
            
            const fontSize = Math.max(10, orbit.size / 10);
            
            // Determine icon
            let icon = '●';
            if (orbit.isObjectiveAchieved) {
                icon = '★';
            } else if (orbit.isSessionCompleted) {
                icon = '✓';
            } else if (isLocked) {
                icon = '🔒';
            }
            
            return `
                <div 
                    class="${classes}"
                    data-orbit-id="${orbit.id}"
                    style="
                        left: ${orbit.x}px;
                        top: ${orbit.y}px;
                        width: ${orbit.size}px;
                        height: ${orbit.size}px;
                        font-size: ${fontSize}px;
                        --orbit-color: ${tier.color};
                        --orbit-glow: ${tier.glow};
                    "
                >
                    <div class="orbit__ring"></div>
                    <div class="orbit__ring orbit__ring--inner"></div>
                    
                    <div class="orbit__controls">
                        <button 
                            class="orbit__ctrl-btn orbit__ctrl-btn--launch"
                            data-action="launch"
                            data-orbit-id="${orbit.id}"
                            aria-label="Launch mission"
                            title="Launch (Enter)"
                            ${isLocked ? 'disabled' : ''}
                        >🚀</button>
                        <button 
                            class="orbit__ctrl-btn orbit__ctrl-btn--link ${isLinkSource ? 'is-active' : ''}"
                            data-action="link"
                            data-orbit-id="${orbit.id}"
                            aria-label="Link orbit"
                            title="Link"
                        >🔗</button>
                        <button 
                            class="orbit__ctrl-btn"
                            data-action="edit"
                            data-orbit-id="${orbit.id}"
                            aria-label="Edit orbit"
                            title="Edit"
                        >✎</button>
                        <button 
                            class="orbit__ctrl-btn orbit__ctrl-btn--delete"
                            data-action="delete"
                            data-orbit-id="${orbit.id}"
                            aria-label="Delete orbit"
                            title="Delete"
                        >×</button>
                    </div>
                    
                    <div class="orbit__core" data-action="core-click" data-orbit-id="${orbit.id}">
                        <div class="orbit__particles">
                            ${this.generateParticles(5, tier.color)}
                        </div>
                        <div class="orbit__icon">${icon}</div>
                        <div class="orbit__name">${Utils.escapeHtml(orbit.name)}</div>
                        <div class="orbit__duration">${tier.label}</div>
                    </div>
                    
                    <div 
                        class="orbit__resize" 
                        data-action="resize" 
                        data-orbit-id="${orbit.id}"
                    ></div>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Generate particle elements for orbit animation
     * @param {number} count
     * @param {string} color
     * @returns {string}
     */
    generateParticles(count, color) {
        return Array.from({ length: count }, (_, i) => {
            const angle = (360 / count) * i;
            const delay = i * 0.6;
            const left = 50 + 35 * Math.cos(angle * Math.PI / 180);
            const top = 50 + 35 * Math.sin(angle * Math.PI / 180);
            
            return `
                <div 
                    class="orbit__particle" 
                    style="
                        left: ${left}%;
                        top: ${top}%;
                        animation-delay: ${delay}s;
                        background: ${color};
                    "
                ></div>
            `;
        }).join('');
    },
    
    /**
     * Render connection lines between orbits
     */
    renderConnections() {
        const svg = Utils.$('svgConnections');
        const defs = svg.querySelector('defs');
        
        // Clear existing lines but keep defs
        svg.innerHTML = '';
        svg.appendChild(defs);
        
        State.connections.forEach(conn => {
            const source = Orbits.get(conn.sourceId);
            const target = Orbits.get(conn.targetId);
            
            if (!source || !target) return;
            
            // Calculate center points
            const sourceX = source.x + source.size / 2;
            const sourceY = source.y + source.size / 2;
            const targetX = target.x + target.size / 2;
            const targetY = target.y + target.size / 2;
            
            // Determine line state
            const isActive = source.isSessionCompleted;
            const isLocked = !source.isSessionCompleted;
            
            // Build class list
            const lineClasses = [
                'connection-line',
                isActive ? 'connection-line--active' : '',
                isLocked ? 'connection-line--locked' : ''
            ].filter(Boolean).join(' ');
            
            // Create visible line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', sourceX);
            line.setAttribute('y1', sourceY);
            line.setAttribute('x2', targetX);
            line.setAttribute('y2', targetY);
            line.setAttribute('class', lineClasses);
            line.setAttribute('marker-end', 'url(#arrowMarker)');
            
            // Create invisible hitbox for interaction
            const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            hitbox.setAttribute('x1', sourceX);
            hitbox.setAttribute('y1', sourceY);
            hitbox.setAttribute('x2', targetX);
            hitbox.setAttribute('y2', targetY);
            hitbox.setAttribute('class', 'connection-hitbox');
            hitbox.setAttribute('data-source-id', conn.sourceId);
            hitbox.setAttribute('data-target-id', conn.targetId);
            
            svg.appendChild(line);
            svg.appendChild(hitbox);
        });
    },
    
    /**
     * Render flight logs
     */
    renderLogs() {
        const container = Utils.$('logList');
        const logs = State.logs;
        
        if (logs.length === 0) {
            container.innerHTML = `
                <div class="log-empty">
                    <div class="log-empty__icon">📭</div>
                    <div class="log-empty__text">NO FLIGHT LOGS YET</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = logs.map(log => {
            const tier = Config.TIERS[log.tier];
            const statusClass = log.status.toLowerCase();
            const objectiveIcon = log.objectiveAchieved ? '★' : '○';
            const objectiveText = log.objectiveAchieved ? 'Achieved' : 'In Progress';
            
            return `
                <div class="log-entry" style="--log-color: ${tier.color}">
                    <div class="log-entry__info">
                        <div class="log-entry__name">${Utils.escapeHtml(log.orbitName)}</div>
                        <div class="log-entry__meta">
                            <span>${Utils.formatDateTime(log.timestamp)}</span>
                            <span>•</span>
                            <span>${objectiveIcon} ${objectiveText}</span>
                        </div>
                    </div>
                    <div class="log-entry__stats">
                        <div class="log-entry__score">${log.score}%</div>
                        <div class="log-entry__status log-entry__status--${statusClass}">
                            ${log.status}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Render HUD (mission active screen)
     */
    renderHUD() {
        const orbit = Orbits.get(State.mission.orbitId);
        if (!orbit) return;
        
        Utils.$('hudMissionName').textContent = orbit.name.toUpperCase();
        
        this.renderHUDChecklist();
        Mission.updateTimerDisplay();
        Mission.updateIntegrity();
    },
    
    /**
     * Render HUD checklist
     */
    renderHUDChecklist() {
        const container = Utils.$('hudChecklist');
        const checklist = State.mission.checklist;
        
        if (checklist.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--color-gray-500);">
                    No processes defined for this orbit
                </div>
            `;
            return;
        }
        
        container.innerHTML = checklist.map((item, index) => {
            const typeClass = item.type === 'negative' ? 'hud__checklist-item--negative' : '';
            const checkedClass = item.isChecked ? 'is-checked' : '';
            const typeLabel = item.type === 'positive' ? 'DO' : 'AVOID';
            const typeTagClass = `hud__checklist-type--${item.type}`;
            
            return `
                <div 
                    class="hud__checklist-item ${typeClass} ${checkedClass}"
                    data-checklist-index="${index}"
                    role="checkbox"
                    aria-checked="${item.isChecked}"
                    tabindex="0"
                >
                    <div class="hud__checklist-checkbox">
                        ${item.isChecked ? '✓' : ''}
                    </div>
                    <div class="hud__checklist-text">
                        ${Utils.escapeHtml(item.text)}
                    </div>
                    <div class="hud__checklist-type ${typeTagClass}">
                        ${typeLabel}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Render editor process list
     */
    renderEditorProcesses() {
        const container = Utils.$('processList');
        const processes = State.editor.processes;
        
        if (processes.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--color-gray-500); font-size: 0.85rem;">
                    No processes added yet
                </div>
            `;
            return;
        }
        
        container.innerHTML = processes.map((proc, index) => {
            const tagClass = `process-tag--${proc.type}`;
            const tagSymbol = proc.type === 'positive' ? '+' : '−';
            
            return `
                <div class="process-item" data-process-index="${index}">
                    <div class="process-item__content">
                        <span class="process-tag ${tagClass}">${tagSymbol}</span>
                        <span class="process-item__text">${Utils.escapeHtml(proc.text)}</span>
                    </div>
                    <button 
                        type="button"
                        class="process-item__delete"
                        data-action="delete-process"
                        data-process-index="${index}"
                        aria-label="Delete process"
                    >×</button>
                </div>
            `;
        }).join('');
    },
    
    /**
     * Update system status text
     * @param {string} message
     */
    updateStatus(message) {
        Utils.$('systemStatus').textContent = message;
    },
    
    /**
     * Render everything
     */
    renderAll() {
        this.renderOrbits();
        this.renderConnections();
        this.renderLogs();
        this.renderEditorProcesses();
    }
};