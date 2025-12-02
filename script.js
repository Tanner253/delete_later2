// Three.js is loaded via CDN script tag in HTML
// Navigation scroll effect
const nav = document.getElementById('nav');
let lastScroll = 0;

// Mobile menu toggle
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.getElementById('nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        const isExpanded = mobileMenuToggle.classList.contains('active');
        mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Close mobile menu when a link is clicked
    navLinks.querySelectorAll('.nav-icon').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// 3D Background Scene
let scene, camera, renderer, particles;

// Detect if device is mobile
function isMobile() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Detect if device has low performance
function isLowPerformance() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return true;
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return renderer.toLowerCase().includes('swiftshader');
    }
    return false;
}

function init3D() {
    // Three.js is available globally via CDN
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded, skipping 3D background');
        return;
    }
    
    // Skip 3D on low-performance devices
    if (isLowPerformance()) {
        console.log('Low performance detected, skipping 3D background');
        return;
    }
    
    // Scene
    scene = new THREE.Scene();
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;
    
    // Renderer
    const canvas = document.getElementById('canvas-3d');
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: !isMobile(),
        powerPreference: isMobile() ? 'low-power' : 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
    
    // Reduce particle count on mobile
    const particleCount = isMobile() ? 300 : 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color1 = new THREE.Color(0x6366f1); // Indigo
    const color2 = new THREE.Color(0x8b5cf6); // Purple
    const color3 = new THREE.Color(0xec4899); // Pink
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Position
        positions[i3] = (Math.random() - 0.5) * 20;
        positions[i3 + 1] = (Math.random() - 0.5) * 20;
        positions[i3 + 2] = (Math.random() - 0.5) * 20;
        
        // Color (random gradient)
        const colorChoice = Math.random();
        let color;
        if (colorChoice < 0.33) color = color1;
        else if (colorChoice < 0.66) color = color2;
        else color = color3;
        
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: isMobile() ? 0.07 : 0.05,
        vertexColors: true,
        transparent: true,
        opacity: isMobile() ? 0.5 : 0.6,
        blending: THREE.AdditiveBlending
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Animate with reduced frequency on mobile
    let lastFrame = Date.now();
    const targetFPS = isMobile() ? 30 : 60;
    const frameInterval = 1000 / targetFPS;
    
    function animate() {
        requestAnimationFrame(animate);
        
        const now = Date.now();
        const delta = now - lastFrame;
        
        if (delta < frameInterval) return;
        
        lastFrame = now - (delta % frameInterval);
        
        // Rotate particles
        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.001;
        
        // Reduce wave calculations on mobile
        if (!isMobile()) {
            const positions = particles.geometry.attributes.position.array;
            const time = now * 0.0001;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(time + positions[i] * 0.1) * 0.0001;
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
        }
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, 250);
    });
    
    // Pause animation when page is not visible (performance optimization)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && renderer) {
            renderer.setAnimationLoop(null);
        } else if (renderer) {
            animate();
        }
    });
}

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('.section').forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Tier item hover effects (skip transform on touch devices)
if (!('ontouchstart' in window)) {
    document.querySelectorAll('.tier-item').forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateX(10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateX(0) scale(1)';
        });
    });
} else {
    // Add touch-friendly active states
    document.querySelectorAll('.tier-item').forEach((item) => {
        item.addEventListener('touchstart', () => {
            item.style.transform = 'scale(0.98)';
        });
        
        item.addEventListener('touchend', () => {
            item.style.transform = 'scale(1)';
        });
    });
}

// Code syntax highlighting (simple version)
function highlightCode() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const text = block.textContent;
        // Simple keyword highlighting
        const keywords = ['const', 'let', 'var', 'function', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'class', 'export', 'import', 'require'];
        const types = ['string', 'number', 'boolean', 'object', 'array'];
        
        let highlighted = text;
        
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span style="color: #c792ea;">$1</span>`);
        });
        
        types.forEach(type => {
            const regex = new RegExp(`\\b(${type})\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span style="color: #82aaff;">$1</span>`);
        });
        
        // Strings
        highlighted = highlighted.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span style="color: #c3e88d;">$&</span>');
        
        // Numbers
        highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span style="color: #f78c6c;">$1</span>');
        
        block.innerHTML = highlighted;
    });
}

// Optimize scroll performance
let ticking = false;
function optimizedScroll(callback) {
    return function(...args) {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                callback.apply(this, args);
                ticking = false;
            });
            ticking = true;
        }
    };
}

// Apply optimized scroll to navigation
const navScrollHandler = optimizedScroll(() => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

window.addEventListener('scroll', navScrollHandler, { passive: true });

// Improve touch scrolling for code blocks
function improveTouchScroll() {
    const codeBlocks = document.querySelectorAll('.code-content, .code-block, .code-inline');
    codeBlocks.forEach(block => {
        block.style.webkitOverflowScrolling = 'touch';
    });
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    // Wait for Three.js to load from CDN
    if (typeof THREE !== 'undefined') {
        init3D();
    } else {
        // Fallback: wait for window load
        window.addEventListener('load', () => {
            if (typeof THREE !== 'undefined') {
                init3D();
            }
        });
    }
    
    initCodeTabs();
    highlightCode();
    improveTouchScroll();
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
    
    // Preconnect to external resources for better performance
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.gstatic.com';
    document.head.appendChild(preconnect);
});

// Code Tabs Functionality
function initCodeTabs() {
    const tabs = document.querySelectorAll('.code-tab');
    const panels = document.querySelectorAll('.code-tab-panel');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remove active class from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding panel
            tab.classList.add('active');
            const targetPanel = document.querySelector(`[data-panel="${targetTab}"]`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
    
    // Copy to clipboard functionality
    const copyButtons = document.querySelectorAll('.code-copy');
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const panel = button.closest('.code-tab-panel');
            const code = panel.querySelector('code');
            const text = code.textContent;
            
            try {
                await navigator.clipboard.writeText(text);
                button.textContent = 'Copied!';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });
    });
}

// External links
const GITHUB_URL = 'https://github.com/PayPortalWeb3/PP';
const X_URL = 'https://x.com/i/communities/1995741831796015176';
const PUMPFUN_URL = 'https://pump.fun/coin/Axa4Ebtf7Q2yvyQ8dMidu6Qf17yZtsutAKEuKgdKpump';

// Navigation links
document.getElementById('x-link').href = X_URL;
document.getElementById('github-link').href = GITHUB_URL;
document.getElementById('pumpfun-link').href = PUMPFUN_URL;

// Footer links
document.getElementById('footer-x-link').href = X_URL;
document.getElementById('footer-github-link').href = GITHUB_URL;
document.getElementById('footer-pumpfun-link').href = PUMPFUN_URL;

// CTA buttons
document.getElementById('github-cta').href = GITHUB_URL;
document.getElementById('pumpfun-cta').href = PUMPFUN_URL;

// Remove click event listeners since we're using actual hrefs now
// All external links are now configured - no click prevention needed
