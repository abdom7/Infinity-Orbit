/**
 * AUDIO SERVICE
 * Sound effects using Web Audio API
 */

const Audio = {
    context: null,
    
    /**
     * Get or create AudioContext
     * @returns {AudioContext}
     */
    getContext() {
        if (!this.context) {
            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
            } catch (error) {
                console.warn('[Audio] Web Audio API not supported');
                return null;
            }
        }
        return this.context;
    },
    
    /**
     * Play a sound effect
     * @param {string} type - Sound type: 'launch', 'complete', 'abort', 'click', 'warning', 'link'
     */
    play(type) {
        if (!State.ui.audioEnabled) return;
        
        const ctx = this.getContext();
        if (!ctx) return;
        
        try {
            // Resume context if suspended (browser policy)
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            gainNode.gain.value = Config.AUDIO.VOLUME;
            
            const now = ctx.currentTime;
            
            switch (type) {
                case 'launch':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(220, now);
                    oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.2);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    oscillator.start(now);
                    oscillator.stop(now + 0.3);
                    break;
                    
                case 'complete':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(523, now);
                    oscillator.frequency.setValueAtTime(659, now + 0.1);
                    oscillator.frequency.setValueAtTime(784, now + 0.2);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    oscillator.start(now);
                    oscillator.stop(now + 0.4);
                    break;
                    
                case 'abort':
                    oscillator.type = 'sawtooth';
                    oscillator.frequency.setValueAtTime(400, now);
                    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                    oscillator.start(now);
                    oscillator.stop(now + 0.3);
                    break;
                    
                case 'click':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(800, now);
                    gainNode.gain.value = 0.1;
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                    oscillator.start(now);
                    oscillator.stop(now + 0.05);
                    break;
                    
                case 'warning':
                    oscillator.type = 'square';
                    oscillator.frequency.setValueAtTime(200, now);
                    oscillator.frequency.setValueAtTime(300, now + 0.1);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    oscillator.start(now);
                    oscillator.stop(now + 0.2);
                    break;
                    
                case 'link':
                    oscillator.type = 'sine';
                    oscillator.frequency.setValueAtTime(600, now);
                    oscillator.frequency.exponentialRampToValueAtTime(900, now + 0.15);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                    oscillator.start(now);
                    oscillator.stop(now + 0.2);
                    break;
                    
                default:
                    return;
            }
        } catch (error) {
            console.warn('[Audio] Playback failed:', error);
        }
    },
    
    /**
     * Toggle audio on/off
     * @returns {boolean} New state
     */
    toggle() {
        State.ui.audioEnabled = !State.ui.audioEnabled;
        Storage.save();
        return State.ui.audioEnabled;
    }
};