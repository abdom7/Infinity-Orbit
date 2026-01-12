/**
 * INFINITY ORBIT - Build Script
 * Combines all source files into a single index.html
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    srcDir: 'src',
    distDir: 'dist',
    template: 'src/template.html',
    output: 'dist/index.html',
    
    cssFiles: [
        'css/_tokens.css',
        'css/_base.css',
        'css/_background.css',
        'css/_layout.css',
        'css/_panel.css',
        'css/_forms.css',
        'css/_orbit.css',
        'css/_connections.css',
        'css/_hud.css',
        'css/_modals.css',
        'css/_logs.css',
        'css/_toast.css',
        'css/_utilities.css'
    ],
    
    jsFiles: [
        'js/config.js',
        'js/state.js',
        'js/utils.js',
        'js/services/storage.js',
        'js/services/audio.js',
        'js/services/toast.js',
        'js/controllers/orbits.js',
        'js/controllers/connections.js',
        'js/controllers/logs.js',
        'js/controllers/mission.js',
        'js/controllers/editor.js',
        'js/controllers/dragdrop.js',
        'js/controllers/resize.js',
        'js/controllers/linking.js',
        'js/controllers/modal.js',
        'js/renderer.js',
        'js/events.js',
        'js/app.js'
    ]
};

// Ensure dist directory exists
if (!fs.existsSync(CONFIG.distDir)) {
    fs.mkdirSync(CONFIG.distDir, { recursive: true });
}

// Read and combine CSS
function buildCSS() {
    let css = '';
    
    CONFIG.cssFiles.forEach(file => {
        const filePath = path.join(CONFIG.srcDir, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            css += `\n/* ========== ${file} ========== */\n`;
            css += content + '\n';
        } else {
            console.warn(`⚠️  CSS file not found: ${file}`);
        }
    });
    
    return css;
}

// Read and combine JS
function buildJS() {
    let js = '';
    
    CONFIG.jsFiles.forEach(file => {
        const filePath = path.join(CONFIG.srcDir, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            js += `\n// ========== ${file} ==========\n`;
            js += content + '\n';
        } else {
            console.warn(`⚠️  JS file not found: ${file}`);
        }
    });
    
    return js;
}

// Main build function
function build() {
    console.log('🚀 Building Infinity Orbit...\n');
    
    const startTime = Date.now();
    
    // Read template
    let template = fs.readFileSync(CONFIG.template, 'utf8');
    
    // Build and inject CSS
    const css = buildCSS();
    template = template.replace('/* __CSS_INJECT__ */', css);
    console.log(`✅ CSS: ${CONFIG.cssFiles.length} files combined`);
    
    // Build and inject JS
    const js = buildJS();
    template = template.replace('/* __JS_INJECT__ */', js);
    console.log(`✅ JS: ${CONFIG.jsFiles.length} files combined`);
    
    // Write output
    fs.writeFileSync(CONFIG.output, template);
    
    const endTime = Date.now();
    const fileSize = (fs.statSync(CONFIG.output).size / 1024).toFixed(2);
    
    console.log(`\n📦 Output: ${CONFIG.output}`);
    console.log(`📊 Size: ${fileSize} KB`);
    console.log(`⏱️  Time: ${endTime - startTime}ms`);
    console.log('\n✨ Build complete!\n');
}

// Watch mode
if (process.argv.includes('--watch')) {
    console.log('👀 Watching for changes...\n');
    
    build();
    
    const watchDirs = ['src/css', 'src/js', 'src/js/services', 'src/js/controllers'];
    
    watchDirs.forEach(dir => {
        const fullPath = path.join(process.cwd(), dir);
        if (fs.existsSync(fullPath)) {
            fs.watch(fullPath, (eventType, filename) => {
                if (filename && (filename.endsWith('.css') || filename.endsWith('.js'))) {
                    console.log(`\n🔄 Changed: ${dir}/${filename}`);
                    build();
                }
            });
        }
    });
    
    // Watch template
    fs.watch(CONFIG.template, () => {
        console.log('\n🔄 Template changed');
        build();
    });
} else {
    build();
}