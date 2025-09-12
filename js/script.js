// Main JavaScript file for Architecture Project Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeVideoPlayer();
    initializeScrollEffects();
    initializeResponsiveMenu();
    initializeCADCrosshair();
});

// Navigation functionality
function initializeNavigation() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update active navigation state for side nav
                updateActiveNavLink(targetId);
            }
        });
    });

    // Update active nav link on scroll (for presentation page)
    if (document.querySelector('.side-nav')) {
        window.addEventListener('scroll', updateActiveNavOnScroll);
        updateActiveNavOnScroll(); // Initial call
    }
}

function updateActiveNavLink(targetId) {
    const sideNavLinks = document.querySelectorAll('.side-nav-link');
    sideNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === targetId) {
            link.classList.add('active');
        }
    });
}

function updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = '#' + section.id;

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            updateActiveNavLink(sectionId);
        }
    });
}

// Video player functionality
function initializeVideoPlayer() {
    const video = document.getElementById('walkthroughVideo');
    if (!video) return;

    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const currentTime = document.getElementById('currentTime');
    const duration = document.getElementById('duration');
    const volumeBtn = document.getElementById('volumeBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    let isPlaying = false;
    let isMuted = false;

    // Play/Pause functionality
    function togglePlayPause() {
        if (isPlaying) {
            video.pause();
            updatePlayPauseButton(false);
        } else {
            video.play();
            updatePlayPauseButton(true);
        }
        isPlaying = !isPlaying;
    }

    function updatePlayPauseButton(playing) {
        const icon = playPauseBtn.querySelector('svg');
        if (playing) {
            // Show pause icon
            icon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        } else {
            // Show play icon
            icon.innerHTML = '<path d="M8 5v14l11-7z"/>';
        }
    }

    // Progress bar functionality
    function updateProgress() {
        const progress = (video.currentTime / video.duration) * 100;
        progressFill.style.width = progress + '%';
        currentTime.textContent = formatTime(video.currentTime);
    }

    function setProgress(e) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        video.currentTime = percent * video.duration;
    }

    // Volume functionality
    function toggleMute() {
        video.muted = !video.muted;
        isMuted = video.muted;
        updateVolumeButton();
    }

    function updateVolumeButton() {
        const icon = volumeBtn.querySelector('svg');
        if (video.muted || video.volume === 0) {
            // Show muted icon
            icon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5zm11-4.5v13c2.21-.86 3.75-3.04 3.75-5.5S18.21 4.64 16 4.5z"/><path d="M0 0h24v24H0z" fill="none"/>';
        } else {
            // Show volume icon
            icon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        }
    }

    // Fullscreen functionality
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            video.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Utility functions
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    // Event listeners
    playPauseBtn.addEventListener('click', togglePlayPause);
    video.addEventListener('click', togglePlayPause);

    progressBar.addEventListener('click', setProgress);
    video.addEventListener('timeupdate', updateProgress);

    video.addEventListener('loadedmetadata', function() {
        duration.textContent = formatTime(video.duration);
    });

    volumeBtn.addEventListener('click', toggleMute);
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    video.addEventListener('play', () => updatePlayPauseButton(true));
    video.addEventListener('pause', () => updatePlayPauseButton(false));
    video.addEventListener('volumechange', updateVolumeButton);

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName.toLowerCase() === 'input') return;

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'KeyF':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'KeyM':
                e.preventDefault();
                toggleMute();
                break;
        }
    });
}

// Scroll effects and animations
function initializeScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    const elementsToAnimate = document.querySelectorAll('.sheet-card, .rendering-card, .video-card, .gallery-item');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });

    // Add CSS for fade-in animation
    const style = document.createElement('style');
    style.textContent = `
        .sheet-card, .rendering-card, .video-card, .gallery-item {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .fade-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    // Parallax effect for hero background
    const heroBackground = document.querySelector('.hero-background video');
    if (heroBackground) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        });
    }
}

// Responsive menu functionality
function initializeResponsiveMenu() {
    // Create mobile menu button if on mobile
    if (window.innerWidth <= 768) {
        createMobileMenu();
    }

    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-btn')) {
            createMobileMenu();
        } else if (window.innerWidth > 768 && document.querySelector('.mobile-menu-btn')) {
            removeMobileMenu();
        }
    });
}

function createMobileMenu() {
    const nav = document.querySelector('.nav');
    const navList = document.querySelector('.nav-list');

    // Create mobile menu button
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'mobile-menu-btn';
    mobileBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    mobileBtn.style.cssText = `
        background: none;
        border: none;
        color: var(--text-primary);
        cursor: pointer;
        padding: var(--spacing-sm);
        display: block;
        margin-left: auto;
    `;

    // Insert button before nav-list
    navList.parentNode.insertBefore(mobileBtn, navList);

    // Style nav-list for mobile
    navList.style.cssText = `
        position: fixed;
        top: 100%;
        left: 0;
        width: 100%;
        height: calc(100vh - 100%);
        background: var(--bg-secondary);
        flex-direction: column;
        padding: var(--spacing-xl);
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
    `;

    // Toggle mobile menu
    let isOpen = false;
    mobileBtn.addEventListener('click', function() {
        isOpen = !isOpen;
        if (isOpen) {
            navList.style.transform = 'translateY(0)';
            navList.style.opacity = '1';
            navList.style.visibility = 'visible';
        } else {
            navList.style.transform = 'translateY(-100%)';
            navList.style.opacity = '0';
            navList.style.visibility = 'hidden';
        }
    });

    // Close menu when clicking a link
    const navLinks = navList.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            isOpen = false;
            navList.style.transform = 'translateY(-100%)';
            navList.style.opacity = '0';
            navList.style.visibility = 'hidden';
        });
    });
}

function removeMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');

    if (mobileBtn) mobileBtn.remove();
    if (navList) {
        navList.style.cssText = '';
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Gallery lightbox functionality (for future enhancement)
function initializeGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item img');

    galleryItems.forEach(img => {
        img.addEventListener('click', function() {
            // Create lightbox
            const lightbox = document.createElement('div');
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                cursor: pointer;
            `;

            const lightboxImg = document.createElement('img');
            lightboxImg.src = this.src;
            lightboxImg.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
            `;

            lightbox.appendChild(lightboxImg);
            document.body.appendChild(lightbox);

            // Close lightbox on click
            lightbox.addEventListener('click', function() {
                document.body.removeChild(lightbox);
            });
        });
    });
}

// Initialize gallery lightbox if gallery exists
if (document.querySelector('.gallery')) {
    initializeGalleryLightbox();
}

// CAD Crosshair functionality
function initializeCADCrosshair() {
    let isCADMode = false;
    let crosshairOverlay = null;
    let toggleButton = null;

    // Create toggle button
    function createToggleButton() {
        toggleButton = document.createElement('button');
        toggleButton.className = 'cad-crosshair-toggle';
        toggleButton.innerHTML = '🎯 CAD Mode';
        toggleButton.title = 'Toggle CAD Crosshair Mode (Ctrl+Shift+C)';
        
        toggleButton.addEventListener('click', toggleCADMode);
        document.body.appendChild(toggleButton);
    }

    // Create crosshair overlay
    function createCrosshairOverlay() {
        crosshairOverlay = document.createElement('div');
        crosshairOverlay.className = 'cad-crosshair-overlay';
        
        const horizontal = document.createElement('div');
        horizontal.className = 'cad-crosshair-horizontal';
        
        const vertical = document.createElement('div');
        vertical.className = 'cad-crosshair-vertical';
        
        const center = document.createElement('div');
        center.className = 'cad-crosshair-center';
        
        crosshairOverlay.appendChild(horizontal);
        crosshairOverlay.appendChild(vertical);
        crosshairOverlay.appendChild(center);
        
        document.body.appendChild(crosshairOverlay);
    }

    // Create grid overlay
    function createGridOverlay() {
        const gridOverlay = document.createElement('div');
        gridOverlay.className = 'cad-grid-overlay';
        gridOverlay.id = 'cad-grid-overlay';
        document.body.appendChild(gridOverlay);
        return gridOverlay;
    }

    // Update crosshair position
    function updateCrosshairPosition(e) {
        if (!crosshairOverlay || !isCADMode) return;
        
        const horizontal = crosshairOverlay.querySelector('.cad-crosshair-horizontal');
        const vertical = crosshairOverlay.querySelector('.cad-crosshair-vertical');
        const center = crosshairOverlay.querySelector('.cad-crosshair-center');
        
        horizontal.style.top = e.clientY + 'px';
        vertical.style.left = e.clientX + 'px';
        center.style.left = e.clientX + 'px';
        center.style.top = e.clientY + 'px';
    }

    // Toggle CAD mode
    function toggleCADMode() {
        isCADMode = !isCADMode;
        
        if (isCADMode) {
            enableCADMode();
        } else {
            disableCADMode();
        }
    }

    // Enable CAD mode
    function enableCADMode() {
        // Add CAD cursor class to body
        document.body.classList.add('cad-cursor');
        
        // Show crosshair overlay
        if (crosshairOverlay) {
            crosshairOverlay.style.display = 'block';
        }
        
        // Show grid overlay
        const gridOverlay = document.getElementById('cad-grid-overlay');
        if (gridOverlay) {
            gridOverlay.style.display = 'block';
        }
        
        // Update toggle button
        if (toggleButton) {
            toggleButton.classList.add('active');
            toggleButton.innerHTML = '🎯 CAD ON';
        }
        
        // Add mouse move listener
        document.addEventListener('mousemove', updateCrosshairPosition);
        
        console.log('CAD Crosshair Mode: ON');
    }

    // Disable CAD mode
    function disableCADMode() {
        // Remove CAD cursor class from body
        document.body.classList.remove('cad-cursor');
        
        // Hide crosshair overlay
        if (crosshairOverlay) {
            crosshairOverlay.style.display = 'none';
        }
        
        // Hide grid overlay
        const gridOverlay = document.getElementById('cad-grid-overlay');
        if (gridOverlay) {
            gridOverlay.style.display = 'none';
        }
        
        // Update toggle button
        if (toggleButton) {
            toggleButton.classList.remove('active');
            toggleButton.innerHTML = '🎯 CAD Mode';
        }
        
        // Remove mouse move listener
        document.removeEventListener('mousemove', updateCrosshairPosition);
        
        console.log('CAD Crosshair Mode: OFF');
    }

    // Keyboard shortcut for CAD mode
    function handleKeyboardShortcut(e) {
        if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
            e.preventDefault();
            toggleCADMode();
        }
    }

    // Initialize CAD crosshair system
    function init() {
        createToggleButton();
        createCrosshairOverlay();
        
        // Add keyboard shortcut listener
        document.addEventListener('keydown', handleKeyboardShortcut);
        
        // Add click outside to disable (optional)
        document.addEventListener('click', function(e) {
            if (isCADMode && e.target === crosshairOverlay) {
                // Clicked on overlay, do nothing
                return;
            }
        });
        
        // Add debugging features
        addDebugFeatures();
        
        console.log('CAD Crosshair system initialized. Press Ctrl+Shift+C to toggle.');
    }

    // Add debugging features
    function addDebugFeatures() {
        // Add coordinate display
        const coordDisplay = document.createElement('div');
        coordDisplay.id = 'cad-coord-display';
        coordDisplay.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--accent-border);
            border-radius: var(--radius-md);
            padding: var(--spacing-sm) var(--spacing-md);
            color: var(--text-primary);
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            z-index: 1000;
            display: none;
            backdrop-filter: blur(10px);
        `;
        coordDisplay.innerHTML = 'X: 0, Y: 0';
        document.body.appendChild(coordDisplay);

        // Update coordinates on mouse move
        document.addEventListener('mousemove', function(e) {
            if (isCADMode) {
                coordDisplay.style.display = 'block';
                coordDisplay.innerHTML = `X: ${e.clientX}, Y: ${e.clientY}`;
            } else {
                coordDisplay.style.display = 'none';
            }
        });

        // Add performance monitoring
        let frameCount = 0;
        let lastTime = performance.now();
        
        function monitorPerformance() {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                console.log(`CAD Crosshair Performance: ${fps} FPS`);
                frameCount = 0;
                lastTime = currentTime;
            }
            
          