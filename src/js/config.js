/**
 * CONFIGURATION
 * Central configuration and constants
 */

const Config = {
    // Storage
    STORAGE_KEY: 'infinityOrbit_v2',
    STORAGE_VERSION: '2.0',
    
    // Tier definitions
    TIERS: {
        '25': {
            duration: 25,
            color: '#00f0ff',
            glow: 'rgba(0, 240, 255, 0.4)',
            label: '25 MIN'
        },
        '50': {
            duration: 50,
            color: '#ffd700',
            glow: 'rgba(255, 215, 0, 0.4)',
            label: '50 MIN'
        },
        '75': {
            duration: 75,
            color: '#ff2a6d',
            glow: 'rgba(255, 42, 109, 0.4)',
            label: '75 MIN'
        },
        'infinity': {
            duration: 1440,
            color: '#d300c5',
            glow: 'rgba(211, 0, 197, 0.4)',
            label: '∞ HORIZON'
        }
    },
    
    // Orbit defaults
    ORBIT: {
        DEFAULT_SIZE: 140,
        MIN_SIZE: 80,
        MAX_SIZE: 250,
        MARGIN: 20
    },
    
    // Timer
    TIMER: {
        WARNING_THRESHOLD: 60, // seconds remaining
        TICK_INTERVAL: 1000
    },
    
    // Audio
    AUDIO: {
        ENABLED_DEFAULT: true,
        VOLUME: 0.3
    },
    
    // Logs
    LOGS: {
        MAX_ENTRIES: 100
    },
    
    // Toast
    TOAST: {
        DEFAULT_DURATION: 3000,
        ERROR_DURATION: 4000
    }
};