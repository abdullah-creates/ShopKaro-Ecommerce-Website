// Animations module
class Animations {
    constructor() {
        this.confettiCanvas = null;
        this.confettiCtx = null;
        this.confettiParticles = [];
        this.animationFrame = null;
        
        this.init();
    }

    init() {
        this.setupConfetti();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupPageTransitions();
    }

    setupConfetti() {
        this.confettiCanvas = document.getElementById('confettiCanvas');
        this.confettiCtx = this.confettiCanvas.getContext('2d');
        
        // Set canvas size
        this.resizeConfettiCanvas();
        window.addEventListener('resize', () => this.resizeConfettiCanvas());
    }

    resizeConfettiCanvas() {
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;
    }

    triggerConfetti() {
        // Create confetti particles
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            this.confettiParticles.push({
                x: Math.random() * this.confettiCanvas.width,
                y: -10,
                vx: (Math.random() - 0.5) * 10,
                vy: Math.random() * 3 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 4 + 2,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                gravity: 0.1,
                life: 1,
                decay: Math.random() * 0.02 + 0.005
            });
        }

        // Start animation
        this.animateConfetti();
    }

    animateConfetti() {
        this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

        for (let i = this.confettiParticles.length - 1; i >= 0; i--) {
            const particle = this.confettiParticles[i];

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            particle.rotation += particle.rotationSpeed;
            particle.life -= particle.decay;

            // Draw particle
            this.confettiCtx.save();
            this.confettiCtx.translate(particle.x, particle.y);
            this.confettiCtx.rotate(particle.rotation * Math.PI / 180);
            this.confettiCtx.globalAlpha = particle.life;
            this.confettiCtx.fillStyle = particle.color;
            this.confettiCtx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            this.confettiCtx.restore();

            // Remove dead particles
            if (particle.life <= 0 || particle.y > this.confettiCanvas.height) {
                this.confettiParticles.splice(i, 1);
            }
        }

        // Continue animation if particles exist
        if (this.confettiParticles.length > 0) {
            this.animationFrame = requestAnimationFrame(() => this.animateConfetti());
        }
    }

    setupScrollAnimations() {
        // Intersection Observer for scroll-based animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.product-card, .feature-card, .section-title').forEach(el => {
            observer.observe(el);
        });

        // Add CSS for scroll animations
        this.addScrollAnimationStyles();
    }

    addScrollAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .product-card, .feature-card {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .product-card.animate-in, .feature-card.animate-in {
                opacity: 1;
                transform: translateY(0);
            }
            
            .section-title {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .section-title.animate-in {
                opacity: 1;
                transform: translateY(0);
            }

            /* Staggered animation for product grids */
            .products-grid .product-card:nth-child(1) { transition-delay: 0.1s; }
            .products-grid .product-card:nth-child(2) { transition-delay: 0.2s; }
            .products-grid .product-card:nth-child(3) { transition-delay: 0.3s; }
            .products-grid .product-card:nth-child(4) { transition-delay: 0.4s; }
            .products-grid .product-card:nth-child(5) { transition-delay: 0.5s; }
            .products-grid .product-card:nth-child(6) { transition-delay: 0.6s; }
        `;
        document.head.appendChild(style);
    }

    setupHoverEffects() {
        // Enhanced button hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('.btn-primary, .btn-add-cart, .filter-btn')) {
                this.addButtonGlow(e.target);
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.matches('.btn-primary, .btn-add-cart, .filter-btn')) {
                this.removeButtonGlow(e.target);
            }
        });

        // Product card tilt effect
        document.addEventListener('mousemove', (e) => {
            const card = e.target.closest('.product-card');
            if (card) {
                this.tiltCard(card, e);
            }
        });

        document.addEventListener('mouseleave', (e) => {
            const card = e.target.closest('.product-card');
            if (card) {
                this.resetCardTilt(card);
            }
        });
    }

    addButtonGlow(button) {
        if (!button.querySelector('.glow-effect')) {
            const glow = document.createElement('div');
            glow.className = 'glow-effect';
            glow.style.cssText = `
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4);
                border-radius: inherit;
                z-index: -1;
                filter: blur(8px);
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            button.style.position = 'relative';
            button.appendChild(glow);
            
            setTimeout(() => {
                glow.style.opacity = '0.7';
            }, 10);
        }
    }

    removeButtonGlow(button) {
        const glow = button.querySelector('.glow-effect');
        if (glow) {
            glow.style.opacity = '0';
            setTimeout(() => {
                if (glow.parentNode) {
                    glow.remove();
                }
            }, 300);
        }
    }

    tiltCard(card, event) {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        const rotateX = (mouseY - centerY) / 10;
        const rotateY = (centerX - mouseX) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    }

    resetCardTilt(card) {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    }

    setupPageTransitions() {
        // Add transition effects when switching sections
        const originalNavigateToSection = window.luxeStore?.navigateToSection;
        
        if (originalNavigateToSection) {
            window.luxeStore.navigateToSection = (section) => {
                // Fade out current section
                const currentSection = document.querySelector('section:not(.hidden)');
                if (currentSection) {
                    currentSection.style.opacity = '0';
                    currentSection.style.transform = 'translateX(-20px)';
                }
                
                setTimeout(() => {
                    originalNavigateToSection.call(window.luxeStore, section);
                    
                    // Fade in new section
                    const newSection = document.getElementById(section);
                    if (newSection) {
                        newSection.style.opacity = '0';
                        newSection.style.transform = 'translateX(20px)';
                        
                        setTimeout(() => {
                            newSection.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                            newSection.style.opacity = '1';
                            newSection.style.transform = 'translateX(0)';
                        }, 50);
                    }
                }, 200);
            };
        }
    }

    // Utility function to create sparkle effect
    createSparkles(element, count = 5) {
        const rect = element.getBoundingClientRect();
        
        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.style.cssText = `
                position: fixed;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
                font-size: ${Math.random() * 10 + 10}px;
                pointer-events: none;
                z-index: 3000;
            `;
            
            document.body.appendChild(sparkle);
            
            sparkle.animate([
                { 
                    transform: 'translateY(0) scale(1) rotate(0deg)',
                    opacity: 1
                },
                { 
                    transform: `translateY(-${Math.random() * 100 + 50}px) scale(0) rotate(360deg)`,
                    opacity: 0
                }
            ], {
                duration: 1000 + Math.random() * 500,
                easing: 'ease-out'
            }).addEventListener('finish', () => {
                sparkle.remove();
            });
        }
    }

    // Loading animation utilities
    showLoadingAnimation(element) {
        const loader = document.createElement('div');
        loader.className = 'inline-loader';
        loader.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        
        const style = document.createElement('style');
        style.textContent = `
            .inline-loader {
                display: inline-flex;
                align-items: center;
                margin-left: 10px;
            }
            
            .loading-dots span {
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: currentColor;
                margin: 0 1px;
                animation: loadingDots 1.4s infinite ease-in-out both;
            }
            
            .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
            .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
            
            @keyframes loadingDots {
                0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
                40% { transform: scale(1); opacity: 1; }
            }
        `;
        
        if (!document.querySelector('#loading-dots-style')) {
            style.id = 'loading-dots-style';
            document.head.appendChild(style);
        }
        
        element.appendChild(loader);
        return loader;
    }

    hideLoadingAnimation(loader) {
        if (loader && loader.parentNode) {
            loader.remove();
        }
    }

    // Pulse animation for notifications
    pulseElement(element) {
        element.style.animation = 'pulse 0.6s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    // Bounce animation for errors
    bounceElement(element) {
        element.style.animation = 'bounce 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

// Add bounce animation CSS
const bounceStyle = document.createElement('style');
bounceStyle.textContent = `
    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
        40%, 43% { transform: translate3d(0, -10px, 0); }
        70% { transform: translate3d(0, -5px, 0); }
        90% { transform: translate3d(0, -2px, 0); }
    }
`;
document.head.appendChild(bounceStyle);

// Initialize and export
document.addEventListener('DOMContentLoaded', () => {
    window.animationsManager = new Animations();
});

window.Animations = Animations;

// Animation configurations
const ANIMATION_CONFIG = {
    duration: 300,
    easing: 'ease-in-out',
    confettiDuration: 3000
};

// Handle mobile menu animations
const mobileMenu = {
    init() {
        const menuBtn = document.querySelector('.menu-toggle');
        const mobileNav = document.querySelector('.mobile-nav');
        const overlay = document.querySelector('.mobile-overlay');

        if (menuBtn && mobileNav && overlay) {
            menuBtn.addEventListener('click', () => this.toggleMenu(mobileNav, overlay));
            overlay.addEventListener('click', () => this.toggleMenu(mobileNav, overlay));
        }
    },

    toggleMenu(nav, overlay) {
        nav.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }
};

// Product card animations
const productAnimations = {
    init() {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            product.addEventListener('mouseenter', () => this.animateProductCard(product, true));
            product.addEventListener('mouseleave', () => this.animateProductCard(product, false));
        });
    },

    animateProductCard(card, isHovered) {
        const image = card.querySelector('.product-image');
        const details = card.querySelector('.product-details');

        if (isHovered) {
            card.style.transform = 'translateY(-5px)';
            if (image) image.style.transform = 'scale(1.05)';
            if (details) details.style.opacity = '1';
        } else {
            card.style.transform = 'translateY(0)';
            if (image) image.style.transform = 'scale(1)';
            if (details) details.style.opacity = '0.9';
        }
    }
};

// Confetti animation for successful actions
const confetti = {
    create(x, y) {
        const confettiCount = 50;
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = `${x}px`;
            confetti.style.top = `${y}px`;
            
            const angle = Math.random() * Math.PI * 2;
            const velocity = 3 + Math.random() * 2;
            confetti.angle = angle;
            confetti.velocity = velocity;
            confetti.rotation = 0;
            confetti.rotationSpeed = (Math.random() - 0.5) * 10;
            
            document.body.appendChild(confetti);
            
            this.animateConfetti(confetti);
        }
    },

    animateConfetti(confetti) {
        let posX = parseFloat(confetti.style.left);
        let posY = parseFloat(confetti.style.top);
        let rotation = confetti.rotation;
        
        const animate = () => {
            posX += Math.cos(confetti.angle) * confetti.velocity;
            posY += Math.sin(confetti.angle) * confetti.velocity + 0.5;
            rotation += confetti.rotationSpeed;
            
            confetti.style.left = `${posX}px`;
            confetti.style.top = `${posY}px`;
            confetti.style.transform = `rotate(${rotation}deg)`;
            
            if (posY < window.innerHeight) {
                requestAnimationFrame(animate);
            } else {
                confetti.remove();
            }
        };
        
        requestAnimationFrame(animate);
    },

    showAt(x, y) {
        this.create(x, y);
        setTimeout(() => {
            const confettiElements = document.querySelectorAll('.confetti');
            confettiElements.forEach(el => el.remove());
        }, ANIMATION_CONFIG.confettiDuration);
    }
};

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    mobileMenu.init();
    productAnimations.init();
});
