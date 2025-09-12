// Main JavaScript file for Architecture Project Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeVideoPlayer();
    initializeBackgroundVideo();
    initializeScrollEffects();
    initializeResponsiveMenu();
    initializeCADCrosshair();
    initializePenMode();
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

// Background video functionality
function initializeBackgroundVideo() {
    const backgroundVideo = document.querySelector('.hero-background video');
    if (!backgroundVideo) {
        console.warn('Background video element not found');
        return;
    }

    console.log('Initializing background video...');

    // Add debugging info
    backgroundVideo.addEventListener('loadstart', () => console.log('Video load started'));
    backgroundVideo.addEventListener('loadedmetadata', () => console.log('Video metadata loaded'));
    backgroundVideo.addEventListener('loadeddata', () => console.log('Video data loaded'));
    backgroundVideo.addEventListener('canplay', () => console.log('Video can start playing'));
    backgroundVideo.addEventListener('canplaythrough', () => console.log('Video can play through without stopping'));

    // Ensure video plays on load
    backgroundVideo.addEventListener('loadeddata', function() {
        console.log('Background video loaded successfully, attempting to play...');
        this.play().catch(error => {
            console.log('Autoplay prevented:', error);
            // Try to play on user interaction
            document.addEventListener('click', function playVideo() {
                console.log('User interaction detected, attempting to play video...');
                backgroundVideo.play().catch(console.log);
                document.removeEventListener('click', playVideo);
            }, { once: true });
        });
    });

    // Handle video errors
    backgroundVideo.addEventListener('error', function(e) {
        console.error('Background video failed to load:', e);
        console.error('Video error details:', this.error);
        // Show fallback image
        const fallbackImg = this.querySelector('img');
        if (fallbackImg) {
            console.log('Showing fallback image');
            this.style.display = 'none';
            fallbackImg.style.display = 'block';
        }
    });

    // Ensure video plays when it becomes visible
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('Video is visible, attempting to play...');
                backgroundVideo.play().catch(console.log);
            }
        });
    });
    
    observer.observe(backgroundVideo);

    // Add video status display for debugging
    const statusDisplay = document.createElement('div');
    statusDisplay.id = 'video-status';
    statusDisplay.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 12px;
        z-index: 1000;
    `;
    statusDisplay.textContent = 'Video: Loading...';
    document.body.appendChild(statusDisplay);

    // Update status display
    backgroundVideo.addEventListener('loadstart', () => statusDisplay.textContent = 'Video: Loading...');
    backgroundVideo.addEventListener('loadeddata', () => statusDisplay.textContent = 'Video: Loaded');
    backgroundVideo.addEventListener('play', () => statusDisplay.textContent = 'Video: Playing');
    backgroundVideo.addEventListener('pause', () => statusDisplay.textContent = 'Video: Paused');
    backgroundVideo.addEventListener('error', () => statusDisplay.textContent = 'Video: Error');
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

    // Check if mobile menu button already exists
    if (document.querySelector('.mobile-menu-btn')) {
        return;
    }

    // Create mobile menu button
    const mobileBtn = document.createElement('button');
    mobileBtn.className = 'mobile-menu-btn';
    mobileBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    mobileBtn.setAttribute('aria-label', 'Toggle mobile menu');

    // Insert button before nav-list
    navList.parentNode.insertBefore(mobileBtn, navList);

    // Toggle mobile menu
    let isOpen = false;
    mobileBtn.addEventListener('click', function() {
        isOpen = !isOpen;
        if (isOpen) {
            navList.classList.add('mobile-open');
            mobileBtn.setAttribute('aria-expanded', 'true');
        } else {
            navList.classList.remove('mobile-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Close menu when clicking a link
    const navLinks = navList.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            isOpen = false;
            navList.classList.remove('mobile-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (isOpen && !nav.contains(e.target)) {
            isOpen = false;
            navList.classList.remove('mobile-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) {
            isOpen = false;
            navList.classList.remove('mobile-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

function removeMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');

    if (mobileBtn) {
        mobileBtn.remove();
    }
    if (navList) {
        navList.classList.remove('mobile-open');
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

// CAD Crosshair functionality - Default Mode
function initializeCADCrosshair() {
    let crosshairOverlay = null;

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
        if (!crosshairOverlay) return;
        
        const horizontal = crosshairOverlay.querySelector('.cad-crosshair-horizontal');
        const vertical = crosshairOverlay.querySelector('.cad-crosshair-vertical');
        const center = crosshairOverlay.querySelector('.cad-crosshair-center');
        
        horizontal.style.top = e.clientY + 'px';
        vertical.style.left = e.clientX + 'px';
        center.style.left = e.clientX + 'px';
        center.style.top = e.clientY + 'px';
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
            backdrop-filter: blur(10px);
            box-shadow: var(--shadow-md);
        `;
        coordDisplay.innerHTML = 'X: 0, Y: 0';
        document.body.appendChild(coordDisplay);

        // Update coordinates on mouse move
        document.addEventListener('mousemove', function(e) {
            coordDisplay.innerHTML = `X: ${e.clientX}, Y: ${e.clientY}`;
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
            
            requestAnimationFrame(monitorPerformance);
        }

        // Start performance monitoring
        monitorPerformance();
    }

    // Initialize CAD crosshair system
    function init() {
        createCrosshairOverlay();
        createGridOverlay();
        
        // Show overlays immediately
        crosshairOverlay.style.display = 'block';
        const gridOverlay = document.getElementById('cad-grid-overlay');
        if (gridOverlay) {
            gridOverlay.style.display = 'block';
        }
        
        // Add mouse move listener
        document.addEventListener('mousemove', updateCrosshairPosition);
        
        // Add debugging features
        addDebugFeatures();
        
        console.log('CAD Crosshair system initialized - Default Mode Active');
    }

    // Start initialization
    init();
}

// Pen Mode functionality
function initializePenMode() {
    const penModeBtn = document.getElementById('penModeBtn');
    const penModeInterface = document.getElementById('penModeInterface');
    const drawingCanvas = document.getElementById('drawingCanvas');
    const penTool = document.getElementById('penTool');
    const eraserTool = document.getElementById('eraserTool');
    const penSize = document.getElementById('penSize');
    const penSizeValue = document.getElementById('penSizeValue');
    const penColor = document.getElementById('penColor');
    const clearAll = document.getElementById('clearAll');
    const closePenMode = document.getElementById('closePenMode');

    let isPenModeActive = false;
    let isDrawing = false;
    let currentTool = 'pen';
    let lastX = 0;
    let lastY = 0;
    let brushSizeIndicator = null;

    // Initialize canvas
    function initCanvas() {
        const ctx = drawingCanvas.getContext('2d');
        // Set canvas size to match the entire document
        drawingCanvas.width = Math.max(document.documentElement.scrollWidth, window.innerWidth);
        drawingCanvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
        
        // Set default drawing properties
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'source-over';
        
        // Create brush size indicator
        createBrushSizeIndicator();
        
        // Load saved annotations
        loadAnnotations();
    }

    // Create brush size indicator
    function createBrushSizeIndicator() {
        if (brushSizeIndicator) {
            brushSizeIndicator.remove();
        }
        
        brushSizeIndicator = document.createElement('div');
        brushSizeIndicator.id = 'brush-size-indicator';
        brushSizeIndicator.style.cssText = `
            position: fixed;
            width: ${parseInt(penSize.value) * 2}px;
            height: ${parseInt(penSize.value) * 2}px;
            border: 2px solid var(--accent-primary);
            border-radius: 50%;
            background: rgba(255, 107, 53, 0.1);
            pointer-events: none;
            z-index: 10000;
            display: none;
            transform: translate(-50%, -50%);
            transition: all 0.1s ease;
        `;
        document.body.appendChild(brushSizeIndicator);
    }

    // Update brush size indicator
    function updateBrushSizeIndicator(e) {
        if (!isPenModeActive || !brushSizeIndicator) return;
        
        const size = parseInt(penSize.value);
        brushSizeIndicator.style.width = `${size * 2}px`;
        brushSizeIndicator.style.height = `${size * 2}px`;
        brushSizeIndicator.style.left = e.clientX + 'px';
        brushSizeIndicator.style.top = e.clientY + 'px';
        brushSizeIndicator.style.display = 'block';
    }

    // Hide brush size indicator
    function hideBrushSizeIndicator() {
        if (brushSizeIndicator) {
            brushSizeIndicator.style.display = 'none';
        }
    }

    // Toggle pen mode
    function togglePenMode() {
        isPenModeActive = !isPenModeActive;
        
        if (isPenModeActive) {
            penModeInterface.style.display = 'block';
            drawingCanvas.classList.add('active');
            penModeBtn.classList.add('active');
            initCanvas();
        } else {
            penModeInterface.style.display = 'none';
            drawingCanvas.classList.remove('active');
            drawingCanvas.classList.remove('eraser');
            penModeBtn.classList.remove('active');
        }
    }

    // Switch between pen and eraser tools
    function switchTool(tool) {
        currentTool = tool;
        const ctx = drawingCanvas.getContext('2d');
        
        if (tool === 'pen') {
            penTool.classList.add('active');
            eraserTool.classList.remove('active');
            drawingCanvas.classList.remove('eraser');
            ctx.globalCompositeOperation = 'source-over';
        } else if (tool === 'eraser') {
            eraserTool.classList.add('active');
            penTool.classList.remove('active');
            drawingCanvas.classList.add('eraser');
            ctx.globalCompositeOperation = 'destination-out';
        }
    }

    // Start drawing
    function startDrawing(e) {
        if (!isPenModeActive) return;
        
        isDrawing = true;
        // Use page coordinates instead of canvas-relative coordinates
        lastX = e.pageX;
        lastY = e.pageY;
        
        const ctx = drawingCanvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }

    // Draw
    function draw(e) {
        if (!isDrawing || !isPenModeActive) return;
        
        // Use page coordinates for consistent positioning
        const currentX = e.pageX;
        const currentY = e.pageY;
        
        const ctx = drawingCanvas.getContext('2d');
        ctx.strokeStyle = currentTool === 'pen' ? penColor.value : 'rgba(0,0,0,0)';
        ctx.lineWidth = parseInt(penSize.value);
        
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        
        lastX = currentX;
        lastY = currentY;
        
        // Save to localStorage
        saveAnnotations();
    }

    // Stop drawing
    function stopDrawing() {
        if (!isDrawing) return;
        
        isDrawing = false;
        const ctx = drawingCanvas.getContext('2d');
        ctx.beginPath();
    }

    // Clear all annotations
    function clearAllAnnotations() {
        const ctx = drawingCanvas.getContext('2d');
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
        localStorage.removeItem('penAnnotations');
    }

    // Save annotations to localStorage
    function saveAnnotations() {
        const dataURL = drawingCanvas.toDataURL();
        localStorage.setItem('penAnnotations', dataURL);
    }

    // Load annotations from localStorage
    function loadAnnotations() {
        const savedData = localStorage.getItem('penAnnotations');
        if (savedData) {
            const img = new Image();
            img.onload = function() {
                const ctx = drawingCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
            };
            img.src = savedData;
        }
    }

    // Update pen size display
    function updatePenSizeDisplay() {
        penSizeValue.textContent = penSize.value;
        // Update brush indicator size
        if (brushSizeIndicator) {
            const size = parseInt(penSize.value);
            brushSizeIndicator.style.width = `${size * 2}px`;
            brushSizeIndicator.style.height = `${size * 2}px`;
        }
    }

    // Handle window resize
    function handleResize() {
        if (isPenModeActive) {
            const ctx = drawingCanvas.getContext('2d');
            const currentData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
            
            // Update canvas size to match document dimensions
            drawingCanvas.width = Math.max(document.documentElement.scrollWidth, window.innerWidth);
            drawingCanvas.height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
            
            ctx.putImageData(currentData, 0, 0);
        }
    }

    // Event listeners
    penModeBtn.addEventListener('click', togglePenMode);
    penTool.addEventListener('click', () => switchTool('pen'));
    eraserTool.addEventListener('click', () => switchTool('eraser'));
    penSize.addEventListener('input', updatePenSizeDisplay);
    clearAll.addEventListener('click', clearAllAnnotations);
    closePenMode.addEventListener('click', togglePenMode);

    // Drawing events
    drawingCanvas.addEventListener('mousedown', startDrawing);
    drawingCanvas.addEventListener('mousemove', draw);
    drawingCanvas.addEventListener('mouseup', stopDrawing);
    drawingCanvas.addEventListener('mouseout', stopDrawing);

    // Mouse move for brush indicator
    document.addEventListener('mousemove', function(e) {
        if (isPenModeActive) {
            updateBrushSizeIndicator(e);
        }
    });

    // Hide brush indicator when mouse leaves the page
    document.addEventListener('mouseleave', hideBrushSizeIndicator);

    // Touch events for mobile
    drawingCanvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        drawingCanvas.dispatchEvent(mouseEvent);
    });

    drawingCanvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        drawingCanvas.dispatchEvent(mouseEvent);
    });

    drawingCanvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        drawingCanvas.dispatchEvent(mouseEvent);
    });

    // Window resize handler
    window.addEventListener('resize', handleResize);

    // Initialize pen size display
    updatePenSizeDisplay();

    console.log('Pen Mode system initialized');
}
