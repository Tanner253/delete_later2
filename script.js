// Three.js is loaded via CDN script tag in HTML
// Navigation scroll effect
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// 3D Background Scene
let scene, camera, renderer, particles;

function init3D() {
    // Three.js is available globally via CDN
    if (typeof THREE === 'undefined') {
        console.warn('Three.js not loaded, skipping 3D background');
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
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Create particle system
    const particleCount = 1000;
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
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Animate
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate particles
        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.001;
        
        // Move particles in a wave pattern
        const positions = particles.geometry.attributes.position.array;
        const time = Date.now() * 0.0001;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i] * 0.1) * 0.0001;
        }
        
        particles.geometry.attributes.position.needsUpdate = true;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
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

// Tier item hover effects
document.querySelectorAll('.tier-item').forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateX(10px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateX(0) scale(1)';
    });
});

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
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s';
        document.body.style.opacity = '1';
    }, 100);
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

// Placeholder URLs (to be updated)
document.getElementById('x-link').addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Add X/Twitter URL
    console.log('X link clicked - URL to be added');
});

document.getElementById('github-link').addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Add GitHub URL
    console.log('GitHub link clicked - URL to be added');
});

document.getElementById('pumpfun-link').addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Add Pump.fun URL
    console.log('Pump.fun link clicked - URL to be added');
});

// Footer links
document.getElementById('footer-x-link').addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Add X/Twitter URL
});

document.getElementById('footer-github-link').addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Add GitHub URL
});

document.getElementById('footer-pumpfun-link').addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Add Pump.fun URL
});

// CTA buttons
document.getElementById('github-cta').addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Add GitHub URL
});

document.getElementById('pumpfun-cta').addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Add Pump.fun URL
});
