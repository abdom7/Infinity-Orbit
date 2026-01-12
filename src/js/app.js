/**
 * APP
 * Application initialization and bootstrap
 */

const App = {
    /**
     * Initialize the application
     */
    init() {
        console.log('🌌 Infinity Orbit v2.0 - Initializing...');
        
        // Initialize services
        Toast.init();
        
        // Load saved data
        Storage.load();
        
        // Update audio button state
        Utils.$('btnToggleAudio').textContent = State.ui.audioEnabled ? '🔊' : '🔇';
        
        // Initialize event listeners
        Events.init();
        
        // Initial render
        Renderer.renderAll();
        
        // Update status
        Renderer.updateStatus('SYSTEM ONLINE');
        
        console.log('✨ Infinity Orbit v2.0 - Ready!');
        console.log(`   📊 ${State.orbits.length} orbits loaded`);
        console.log(`   🔗 ${State.connections.length} connections`);
        console.log(`   📜 ${State.logs.length} log entries`);
    }
};

// ===== BOOTSTRAP =====
// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}