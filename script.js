// Super Mario ML Portfolio JavaScript

class MarioPortfolio {
    constructor() {
        this.mario = document.getElementById('mario');
        this.tubes = document.querySelectorAll('.tube');
        this.sections = document.querySelectorAll('.content-section');
        this.currentSection = 'home';
        this.marioPosition = { x: 50, y: 0 };
        this.marioVelocity = { x: 0, y: 0 };
        this.isJumping = false;
        this.isInTube = false;
        this.isOnGround = true;
        this.isOnTube = false;
        this.currentTube = null;
        this.gravity = 0.8;
        this.jumpPower = -30;
        this.coins = 1000;
        this.lives = '∞';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Disable idle/random animations so Mario only moves when controlled
        this.setupScrollAnimations();
        this.setupSkillBars();
        this.startBackgroundAnimations();
        this.updateGameUI();
        this.startPhysicsLoop();
        
        // Initialize Mario visibility - show on home page
        document.body.classList.add('on-home');
    }

    setupEventListeners() {
        // Tube navigation
        this.tubes.forEach(tube => {
            tube.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
                // Don't auto-jump when clicking tubes - let Mario land naturally
            });

            tube.addEventListener('mouseenter', () => {
                this.playTubeSound();
            });
        });

        // Mario click interaction
        this.mario.addEventListener('click', () => {
            this.makeMarioJump();
            this.collectCoin();
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // Add down arrow key for tube entry
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.handleTubeEntry();
            }
        });

        // Prevent page scroll with arrow keys/space globally
        window.addEventListener('keydown', (e) => {
            const keysToBlock = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
            // Ignore when typing in inputs/textareas
            const targetTag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            const isTyping = targetTag === 'input' || targetTag === 'textarea';
            if (!isTyping && keysToBlock.includes(e.key)) {
                e.preventDefault();
            }
        }, { passive: false });

        // Scroll animations
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Form submission
        const form = document.querySelector('.ml-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission();
            });
        }

        // Project card click functionality
        this.setupProjectCardClicks();
    }

    navigateToSection(sectionId) {
        // Remove active class from all tubes
        this.tubes.forEach(tube => tube.classList.remove('active'));
        
        // Add active class to clicked tube
        const activeTube = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeTube) {
            activeTube.classList.add('active');
        }

        // Scroll to section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }

        this.currentSection = sectionId;
        // Don't move Mario - let him stay on the home page
    }

    makeMarioJump() {
        if (!this.isOnGround && !this.isOnTube) return;
        
        this.marioVelocity.y = this.jumpPower;
        this.isOnGround = false;
        this.isOnTube = false;
        this.currentTube = null;
        
        // Play jump sound effect (visual feedback)
        this.createJumpEffect();
    }

    createJumpEffect() {
        // Create particle effect
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, #FFD700, #FFA500);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1001;
            left: ${this.marioPosition.x + 30}px;
            bottom: 200px;
            animation: particleFloat 1s ease-out forwards;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 1000);
    }

    collectCoin() {
        this.coins += 10;
        this.updateGameUI();
        
        // Visual feedback
        const coinEffect = document.createElement('div');
        coinEffect.textContent = '+10';
        coinEffect.style.cssText = `
            position: fixed;
            color: #FFD700;
            font-family: 'Press Start 2P', monospace;
            font-size: 12px;
            pointer-events: none;
            z-index: 1001;
            left: ${this.marioPosition.x + 20}px;
            bottom: 250px;
            animation: coinFloat 1s ease-out forwards;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.8);
        `;
        
        document.body.appendChild(coinEffect);
        
        setTimeout(() => {
            coinEffect.remove();
        }, 1000);
    }

    // Mario stays on home page - no automatic position updates

    handleKeyboard(e) {
        switch(e.key) {
            case ' ':
            case 'ArrowUp':
                e.preventDefault();
                this.makeMarioJump();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.moveMario(-40);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.moveMario(40);
                break;
            case '0':
                this.navigateToSection('home');
                break;
            case '1':
                this.navigateToSection('about');
                break;
            case '2':
                this.navigateToSection('skills');
                break;
            case '3':
                this.navigateToSection('projects');
                break;
            case '4':
                this.navigateToSection('experience');
                break;
            case '5':
                this.navigateToSection('contact');
                break;
        }
    }

    moveMario(deltaX) {
        this.marioVelocity.x = deltaX * 0.5; // Convert to velocity
    }

    handleTubeEntry() {
        if (this.isInTube) return;
        
        // Check if Mario is near a tube and on home page
        if (this.currentSection !== 'home') return;
        
        // Find the closest tube to Mario
        let closestTube = null;
        let minDistance = Infinity;
        
        this.tubes.forEach(tube => {
            const tubeRect = tube.getBoundingClientRect();
            const distance = Math.abs(this.marioPosition.x - (tubeRect.left + tubeRect.width/2));
            if (distance < minDistance && distance < 80) {
                minDistance = distance;
                closestTube = tube;
            }
        });
        
        if (closestTube) {
            const section = closestTube.dataset.section;
            this.enterTube(section);
        }
    }

    enterTube(targetSection) {
        if (this.isInTube) return;
        
        this.isInTube = true;
        this.mario.classList.add('entering-tube');
        
        // Create suction effect
        this.createSuctionEffect();
        
        setTimeout(() => {
            this.mario.style.opacity = '0';
            this.mario.style.transform = 'scale(0.5)';
        }, 300);
        
        setTimeout(() => {
            // Move Mario to target section
            this.navigateToSection(targetSection);
            this.mario.style.opacity = '1';
            this.mario.style.transform = 'scale(1)';
            this.mario.classList.remove('entering-tube');
            this.isInTube = false;
            
            // Create exit effect
            this.createExitEffect();
        }, 1000);
    }

    createSuctionEffect() {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(0,255,0,0.3), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1001;
            left: ${this.marioPosition.x - 20}px;
            bottom: 200px;
            animation: suctionEffect 1s ease-in-out forwards;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 1000);
    }

    createExitEffect() {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            width: 80px;
            height: 80px;
            background: radial-gradient(circle, rgba(0,255,0,0.5), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1001;
            left: ${this.marioPosition.x - 10}px;
            bottom: 200px;
            animation: exitEffect 0.5s ease-out forwards;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 500);
    }

    startMarioAnimations() {
        // Intentionally left empty to disable idle/random animations
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add special effects based on section
                    const sectionId = entry.target.id;
                    this.triggerSectionEffect(sectionId);
                }
            });
        }, observerOptions);

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    triggerSectionEffect(sectionId) {
        switch(sectionId) {
            case 'skills':
                this.animateSkillBars();
                break;
            case 'projects':
                this.animateProjectCards();
                break;
            case 'experience':
                this.animateTimeline();
                break;
        }
    }

    setupSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        skillBars.forEach(bar => {
            const width = bar.dataset.width;
            bar.style.width = '0%';
        });
    }

    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        skillBars.forEach((bar, index) => {
            setTimeout(() => {
                const width = bar.dataset.width;
                bar.style.width = width;
            }, index * 200);
        });
    }

    animateProjectCards() {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 150);
        });
    }

    animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('slide-in-left');
            }, index * 200);
        });
    }

    startBackgroundAnimations() {
        // Animate clouds
        const clouds = document.querySelector('.clouds');
        if (clouds) {
            setInterval(() => {
                clouds.style.animation = 'cloudMove 20s linear infinite';
            }, 20000);
        }

        // Random coin spawns
        setInterval(() => {
            this.spawnFloatingCoin();
        }, 8000);
    }

    spawnFloatingCoin() {
        const coin = document.createElement('div');
        coin.innerHTML = '🪙';
        coin.style.cssText = `
            position: fixed;
            font-size: 20px;
            pointer-events: none;
            z-index: 1001;
            left: ${Math.random() * (window.innerWidth - 40)}px;
            top: -30px;
            animation: coinFall 4s linear forwards;
        `;
        
        document.body.appendChild(coin);
        
        // Make coin collectible
        coin.addEventListener('click', () => {
            this.collectCoin();
            coin.remove();
        });
        
        setTimeout(() => {
            if (coin.parentNode) {
                coin.remove();
            }
        }, 4000);
    }

    handleScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Parallax effect for background
        const clouds = document.querySelector('.clouds');
        const mountains = document.querySelector('.mountains');
        
        if (clouds) {
            clouds.style.transform = `translateX(${scrollY * 0.1}px)`;
        }
        
        if (mountains) {
            mountains.style.transform = `translateX(${scrollY * 0.05}px)`;
        }

        // Update active section based on scroll
        this.updateActiveSection();
    }

    updateActiveSection() {
        const sections = document.querySelectorAll('.content-section, .home-section');
        let currentSection = 'home';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = section.id;
            }
        });
        
        if (currentSection !== this.currentSection) {
            this.currentSection = currentSection;
            this.updateTubeActiveState(currentSection);
            
            // Show/hide tubes and Mario based on section
            const tubeNav = document.querySelector('.tube-navigation');
            if (tubeNav) {
                if (currentSection === 'home') {
                    tubeNav.classList.remove('hidden');
                    document.body.classList.add('on-home');
                } else {
                    tubeNav.classList.add('hidden');
                    document.body.classList.remove('on-home');
                }
            }
        }
    }

    updateTubeActiveState(sectionId) {
        this.tubes.forEach(tube => {
            tube.classList.remove('active');
            if (tube.dataset.section === sectionId) {
                tube.classList.add('active');
            }
        });
    }

    playTubeSound() {
        // Visual feedback for tube interaction
        const tube = event.currentTarget;
        tube.style.transform = 'scale(1.1)';
        setTimeout(() => {
            tube.style.transform = 'scale(1)';
        }, 200);
    }

    handleFormSubmission() {
        const form = document.querySelector('.ml-form');
        const inputs = form.querySelectorAll('input, textarea');
        
        // Simple validation
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#FF0000';
            } else {
                input.style.borderColor = '#8B4513';
            }
        });
        
        if (isValid) {
            // Show success message
            this.showMessage('Message sent! Mario will get back to you soon!', 'success');
            form.reset();
        } else {
            this.showMessage('Please fill in all fields!', 'error');
        }
    }

    showMessage(text, type) {
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? '#00FF00' : '#FF0000'};
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            font-family: 'Press Start 2P', monospace;
            font-size: 12px;
            z-index: 1002;
            border: 3px solid #8B4513;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: messagePop 0.5s ease-out;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    updateGameUI() {
        const coinsDisplay = document.querySelector('.coins-count');
        const livesDisplay = document.querySelector('.lives-count');
        
        if (coinsDisplay) {
            coinsDisplay.textContent = this.coins;
        }
        
        if (livesDisplay) {
            livesDisplay.textContent = this.lives;
        }
    }

    setupProjectCardClicks() {
        const projectCards = document.querySelectorAll('.project-card');
        
        // Define project URLs/links
        const projectLinks = {
            'Num_GAN': 'https://github.com/marioramboo/number-GAN', // Replace with actual GitHub URL
            'Link': 'https://github.com/marioramboo/Link', // Replace with actual GitHub URL
            '3D-About-Us-Carousel': 'https://github.com/marioramboo/3D-About-Us-Carousel' // Replace with actual GitHub URL
        };

        projectCards.forEach(card => {
            const projectTitle = card.querySelector('.project-title').textContent;
            const projectUrl = projectLinks[projectTitle];
            
            if (projectUrl) {
                // Add click event listener
                card.addEventListener('click', () => {
                    this.handleProjectCardClick(projectTitle, projectUrl);
                });
                
                // Add visual feedback
                card.style.cursor = 'pointer';
                card.classList.add('clickable');
            }
        });
    }

    handleProjectCardClick(projectTitle, projectUrl) {
        // Create click effect
        this.createProjectClickEffect();
        
        // Show loading message
        this.showMessage(`Opening ${projectTitle}...`, 'success');
        
        // Open project in new tab after a short delay
        setTimeout(() => {
            window.open(projectUrl, '_blank');
        }, 500);
    }

    createProjectClickEffect() {
        // Create a special effect for project card clicks
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            width: 60px;
            height: 60px;
            background: radial-gradient(circle, #00FF00, #008000);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1001;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            animation: projectClickEffect 0.6s ease-out forwards;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 600);
    }

    startPhysicsLoop() {
        const gameLoop = () => {
            this.updatePhysics();
            this.checkCollisions();
            this.updateMarioPosition();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }

    updatePhysics() {
        // Apply gravity only if not on ground or tube
        if (!this.isOnGround && !this.isOnTube) {
            this.marioVelocity.y += this.gravity;
        }

        // Apply horizontal movement
        this.marioPosition.x += this.marioVelocity.x;
        this.marioPosition.y += this.marioVelocity.y;

        // Apply friction to horizontal movement
        this.marioVelocity.x *= 0.8;

        // Keep Mario within screen bounds
        this.marioPosition.x = Math.max(20, Math.min(window.innerWidth - 80, this.marioPosition.x));

        // Ground collision - only if Mario is actually falling to ground level
        if (this.marioPosition.y >= 0 && !this.isOnTube) {
            this.marioPosition.y = 0;
            this.marioVelocity.y = 0;
            this.isOnGround = true;
            this.isOnTube = false;
            this.currentTube = null;
        }
        
        // If on tube, prevent falling through
        if (this.isOnTube && this.marioVelocity.y > 0) {
            this.marioVelocity.y = 0;
        }
    }

    checkCollisions() {
        // Simple tube collision check
        this.tubes.forEach(tube => {
            const tubeRect = tube.getBoundingClientRect();
            const marioRect = this.mario.getBoundingClientRect();
            
            // Check if Mario is falling onto a tube
            if (this.marioVelocity.y >= 0 && // Mario is falling
                marioRect.bottom >= tubeRect.top - 5 && // Mario is near tube top
                marioRect.bottom <= tubeRect.top + 10 && // Mario is above tube
                marioRect.right > tubeRect.left + 20 && // Mario is not too far left
                marioRect.left < tubeRect.right - 20) { // Mario is not too far right
                
                // Mario lands on tube
                this.marioPosition.y = -90; // Tube height
                this.marioVelocity.y = 0;
                this.isOnGround = false;
                this.isOnTube = true;
                this.currentTube = tube;
                console.log('Mario landed on tube!');
            }
        });
        
        // Check if Mario should fall off tube
        if (this.isOnTube && this.currentTube) {
            const tubeRect = this.currentTube.getBoundingClientRect();
            const marioRect = this.mario.getBoundingClientRect();
            
            // If Mario moves off the tube horizontally, make him fall
            if (marioRect.right < tubeRect.left + 30 || marioRect.left > tubeRect.right - 30) {
                this.isOnTube = false;
                this.currentTube = null;
                this.isOnGround = false;
                console.log('Mario fell off tube!');
            }
        }
    }

    updateMarioPosition() {
        this.mario.style.left = `${this.marioPosition.x}px`;
        this.mario.style.bottom = `${200 - this.marioPosition.y}px`; // 200 is ground level
        
        // Debug info
        if (this.isOnTube) {
            this.mario.style.border = '3px solid red';
        } else {
            this.mario.style.border = 'none';
        }
    }

    // Easter eggs and special features
    enableEasterEggs() {
        // Konami code
        let konamiCode = [];
        const konamiSequence = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'KeyB', 'KeyA'
        ];
        
        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.code);
            if (konamiCode.length > konamiSequence.length) {
                konamiCode.shift();
            }
            
            if (konamiCode.join(',') === konamiSequence.join(',')) {
                this.activateSuperMode();
                konamiCode = [];
            }
        });
    }

    activateSuperMode() {
        this.showMessage('SUPER MODE ACTIVATED!', 'success');
        
        // Special effects
        document.body.style.animation = 'rainbow 2s linear infinite';
        
        // Increase coin value
        this.coins += 1000;
        this.updateGameUI();
        
        // Make Mario invincible (visual effect)
        this.mario.style.filter = 'hue-rotate(180deg) brightness(1.5)';
        
        setTimeout(() => {
            document.body.style.animation = '';
            this.mario.style.filter = '';
        }, 10000);
    }
}

// CSS animations for JavaScript effects
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        100% { transform: translateY(-100px) scale(0); opacity: 0; }
    }
    
    @keyframes coinFloat {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-50px); opacity: 0; }
    }
    
    @keyframes coinFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
    
    @keyframes messagePop {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
    
    @keyframes suctionEffect {
        0% { transform: scale(1); opacity: 0.3; }
        50% { transform: scale(1.5); opacity: 0.6; }
        100% { transform: scale(2); opacity: 0; }
    }
    
    @keyframes exitEffect {
        0% { transform: scale(0.5); opacity: 0.5; }
        100% { transform: scale(1.5); opacity: 0; }
    }
    
    @keyframes projectClickEffect {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
        100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const portfolio = new MarioPortfolio();
    portfolio.enableEasterEggs();
    
    // Add some initial animations
    setTimeout(() => {
        document.querySelector('.hero-section').classList.add('fade-in');
    }, 500);
    
    // Welcome message
    setTimeout(() => {
        portfolio.showMessage('Welcome to Mario\'s ML Adventure!', 'success');
    }, 1000);
});

// Add touch support for mobile
document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (element && element.closest('.tube')) {
            const tube = element.closest('.tube');
            const section = tube.dataset.section;
            if (section) {
                portfolio.navigateToSection(section);
                portfolio.makeMarioJump();
            }
        }
    }
});

// Performance optimization
let ticking = false;

function updateAnimations() {
    // Throttle scroll events
    if (!ticking) {
        requestAnimationFrame(() => {
            ticking = false;
        });
        ticking = true;
    }
}

window.addEventListener('scroll', updateAnimations);
