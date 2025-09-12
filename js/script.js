// Main JavaScript file for Architecture Project Website

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeNavigation();
    initializeVideoPlayer();
    initializeBackgroundVideo();
    initializeScrollEffects();
    initializeResponsiveMenu();
    initializeCADCrosshair();
    
    // Main pen mode removed - only available in sheet enlargement modal
    
    // Only initialize sheet enlargement if the elements exist
    if (document.getElementById('sheetModal')) {
        initializeSheetEnlargement();
    }
    
    // Initialize download functionality
    initializeDownloadFunctionality();
    
    initializeReturnToTop();
    
    // Initialize search functionality (only if search elements exist)
    if (document.getElementById('searchInput')) {
        initializeSearchFunctionality();
    }

    // Assemble bottom HUD after core widgets are added
    setTimeout(setupBottomHud, 0);
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

    // Get loading indicator elements
    const loadingIndicator = document.getElementById('videoLoadingIndicator');
    const errorIndicator = document.getElementById('videoErrorIndicator');
    const progressFill = document.getElementById('videoProgressFill');
    const progressText = document.getElementById('videoProgressText');
    const retryBtn = document.getElementById('retryVideoBtn');

    console.log('Initializing background video with enhanced loading status...');

    // Show loading indicator initially
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }

    // Track loading progress
    let loadingProgress = 0;
    let isVideoReady = false;
    let loadingTimeout = null;
    let retryCount = 0;
    const maxRetries = 3;

    // Update progress display
    function updateProgress(progress) {
        loadingProgress = Math.min(100, Math.max(0, progress));
        if (progressFill) {
            progressFill.style.width = loadingProgress + '%';
        }
        if (progressText) {
            progressText.textContent = Math.round(loadingProgress) + '%';
        }
    }

    // Hide loading indicator
    function hideLoadingIndicator() {
        if (loadingIndicator) {
            loadingIndicator.style.opacity = '0';
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
            }, 300);
        }
    }

    // Show error indicator
    function showErrorIndicator() {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        if (errorIndicator) {
            errorIndicator.style.display = 'flex';
            
            // Update retry button based on retry count
            if (retryCount >= maxRetries) {
                const retryBtn = document.getElementById('retryVideoBtn');
                if (retryBtn) {
                    retryBtn.textContent = 'Max Retries Reached';
                    retryBtn.disabled = true;
                    retryBtn.style.opacity = '0.5';
                    retryBtn.style.cursor = 'not-allowed';
                }
                
                const errorText = errorIndicator.querySelector('.error-text');
                if (errorText) {
                    errorText.textContent = 'Video failed to load after multiple attempts. Please check your connection.';
                }
            }
        }
    }

    // Hide error indicator
    function hideErrorIndicator() {
        if (errorIndicator) {
            errorIndicator.style.display = 'none';
        }
    }

    // Retry video loading
    function retryVideoLoad() {
        if (retryCount >= maxRetries) {
            console.warn('Maximum retry attempts reached');
            return;
        }
        
        retryCount++;
        hideErrorIndicator();
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
            loadingIndicator.style.opacity = '1';
        }
        updateProgress(0);
        
        // Clear any existing timeout
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
        }
        
        // Set a timeout for loading
        loadingTimeout = setTimeout(() => {
            if (!isVideoReady) {
                console.warn('Video loading timeout');
                showErrorIndicator();
            }
        }, 15000); // 15 second timeout
        
        // Reset video and try to load again
        backgroundVideo.load();
    }

    // Set initial timeout for loading
    loadingTimeout = setTimeout(() => {
        if (!isVideoReady) {
            console.warn('Video loading timeout');
            showErrorIndicator();
        }
    }, 15000); // 15 second timeout

    // Video event listeners
    backgroundVideo.addEventListener('loadstart', () => {
        console.log('Video load started');
        updateProgress(10);
    });

    backgroundVideo.addEventListener('loadedmetadata', () => {
        console.log('Video metadata loaded');
        updateProgress(30);
    });

    backgroundVideo.addEventListener('loadeddata', () => {
        console.log('Video data loaded');
        updateProgress(60);
    });

    backgroundVideo.addEventListener('progress', () => {
        if (backgroundVideo.buffered.length > 0) {
            const bufferedEnd = backgroundVideo.buffered.end(backgroundVideo.buffered.length - 1);
            const duration = backgroundVideo.duration;
            if (duration > 0) {
                const progress = (bufferedEnd / duration) * 100;
                updateProgress(60 + (progress * 0.3)); // 60-90% based on buffering
            }
        }
    });

    backgroundVideo.addEventListener('canplay', () => {
        console.log('Video can start playing');
        updateProgress(90);
    });

    backgroundVideo.addEventListener('canplaythrough', () => {
        console.log('Video can play through without stopping');
        updateProgress(100);
        isVideoReady = true;
        
        // Clear loading timeout
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
        }
        
        // Hide loading indicator after a short delay
        setTimeout(() => {
            hideLoadingIndicator();
        }, 500);
    });

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
        
        // Show error indicator
        showErrorIndicator();
        
        // Show fallback image as backup
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
            if (entry.isIntersecting && isVideoReady) {
                console.log('Video is visible, attempting to play...');
                backgroundVideo.play().catch(console.log);
            }
        });
    });
    
    observer.observe(backgroundVideo);

    // Retry button functionality
    if (retryBtn) {
        retryBtn.addEventListener('click', retryVideoLoad);
    }

    // Add video status display for debugging (optional)
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
        display: none; /* Hidden by default, can be enabled for debugging */
    `;
    statusDisplay.textContent = 'Video: Loading...';
    document.body.appendChild(statusDisplay);

    // Update status display (for debugging)
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

    // Get all video player elements
    const videoOverlay = document.getElementById('videoOverlay');
    const playButton = document.getElementById('playButton');
    const videoControls = document.getElementById('videoControls');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressHandle = document.getElementById('progressHandle');
    const currentTime = document.getElementById('currentTime');
    const duration = document.getElementById('duration');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    let isPlaying = false;
    let isMuted = false;
    let isDragging = false;
    let hideControlsTimeout;

    // Initialize video player
    function init() {
        // Set initial volume
        video.volume = 1;
        if (volumeSlider) volumeSlider.value = 1;
        
        // Hide default controls
        video.controls = false;
        
        // Set up event listeners
        setupEventListeners();
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Play button (overlay)
        if (playButton) playButton.addEventListener('click', startPlayback);
        
        // Video click to play/pause
        video.addEventListener('click', togglePlayPause);
        
        // Control buttons
        if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
        if (volumeBtn) volumeBtn.addEventListener('click', toggleMute);
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
        
        // Progress bar
        if (progressBar) {
            progressBar.addEventListener('click', setProgress);
            progressBar.addEventListener('mousedown', startDragging);
            progressBar.addEventListener('mousemove', dragProgress);
            progressBar.addEventListener('mouseup', stopDragging);
            progressBar.addEventListener('mouseleave', stopDragging);
        }
        
        // Volume slider
        if (volumeSlider) volumeSlider.addEventListener('input', updateVolume);
        
        // Video events
        video.addEventListener('loadedmetadata', updateDuration);
        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded);
        video.addEventListener('volumechange', updateVolumeButton);
        
        // Mouse events for controls visibility
        video.addEventListener('mouseenter', showControls);
        video.addEventListener('mouseleave', hideControls);
        if (videoControls) {
            videoControls.addEventListener('mouseenter', showControls);
            videoControls.addEventListener('mouseleave', hideControls);
        }
        
        // Fullscreen events
        document.addEventListener('fullscreenchange', updateFullscreenButton);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
        document.addEventListener('mozfullscreenchange', updateFullscreenButton);
        document.addEventListener('MSFullscreenChange', updateFullscreenButton);
        
        // Keyboard controls
        document.addEventListener('keydown', handleKeyboard);
    }

    // Start playback (hide overlay, show controls)
    function startPlayback() {
        video.play();
        if (videoOverlay) videoOverlay.classList.add('hidden');
        showControls();
    }

    // Toggle play/pause
    function togglePlayPause() {
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    }

    // Update play/pause button
    function updatePlayPauseButton(playing) {
        if (!playPauseBtn) return;
        
        const playIcon = playPauseBtn.querySelector('.play-icon');
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        
        if (playing) {
            if (playIcon) playIcon.style.display = 'none';
            if (pauseIcon) pauseIcon.style.display = 'block';
            playPauseBtn.classList.add('video-playing');
        } else {
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
            playPauseBtn.classList.remove('video-playing');
        }
    }

    // Progress bar functionality
    function updateProgress() {
        if (isDragging || !progressFill) return;
        
        const progress = (video.currentTime / video.duration) * 100;
        progressFill.style.width = progress + '%';
        if (progressHandle) progressHandle.style.left = progress + '%';
        if (currentTime) currentTime.textContent = formatTime(video.currentTime);
    }

    function setProgress(e) {
        if (!progressBar) return;
        
        const rect = progressBar.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        video.currentTime = percent * video.duration;
    }

    // Dragging functionality
    function startDragging(e) {
        isDragging = true;
        setProgress(e);
    }

    function dragProgress(e) {
        if (isDragging) {
            setProgress(e);
        }
    }

    function stopDragging() {
        isDragging = false;
    }

    // Volume functionality
    function toggleMute() {
        video.muted = !video.muted;
        updateVolumeButton();
    }

    function updateVolume() {
        if (!volumeSlider) return;
        
        video.volume = volumeSlider.value;
        video.muted = video.volume === 0;
        updateVolumeButton();
    }

    function updateVolumeButton() {
        if (!volumeBtn) return;
        
        const volumeOn = volumeBtn.querySelector('.volume-on');
        const volumeOff = volumeBtn.querySelector('.volume-off');
        
        if (video.muted || video.volume === 0) {
            if (volumeOn) volumeOn.style.display = 'none';
            if (volumeOff) volumeOff.style.display = 'block';
            volumeBtn.classList.add('video-muted');
        } else {
            if (volumeOn) volumeOn.style.display = 'block';
            if (volumeOff) volumeOff.style.display = 'none';
            volumeBtn.classList.remove('video-muted');
        }
    }

    // Fullscreen functionality
    function toggleFullscreen() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && !document.msFullscreenElement) {
            const elem = video.parentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    function updateFullscreenButton() {
        if (!fullscreenBtn) return;
        
        const fullscreenEnter = fullscreenBtn.querySelector('.fullscreen-enter');
        const fullscreenExit = fullscreenBtn.querySelector('.fullscreen-exit');
        
        if (document.fullscreenElement || document.webkitFullscreenElement || 
            document.mozFullScreenElement || document.msFullscreenElement) {
            if (fullscreenEnter) fullscreenEnter.style.display = 'none';
            if (fullscreenExit) fullscreenExit.style.display = 'block';
            fullscreenBtn.classList.add('video-fullscreen');
        } else {
            if (fullscreenEnter) fullscreenEnter.style.display = 'block';
            if (fullscreenExit) fullscreenExit.style.display = 'none';
            fullscreenBtn.classList.remove('video-fullscreen');
        }
    }

    // Controls visibility
    function showControls() {
        if (videoControls) {
            videoControls.classList.add('show');
            clearTimeout(hideControlsTimeout);
            hideControlsTimeout = setTimeout(hideControls, 3000);
        }
    }

    function hideControls() {
        if (videoControls && !video.paused) {
            videoControls.classList.remove('show');
        }
    }

    // Video event handlers
    function onPlay() {
        isPlaying = true;
        updatePlayPauseButton(true);
    }

    function onPause() {
        isPlaying = false;
        updatePlayPauseButton(false);
    }

    function onEnded() {
        isPlaying = false;
        updatePlayPauseButton(false);
        if (videoOverlay) videoOverlay.classList.remove('hidden');
    }

    function updateDuration() {
        if (duration) duration.textContent = formatTime(video.duration);
    }

    // Keyboard controls
    function handleKeyboard(e) {
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'KeyM':
                e.preventDefault();
                toggleMute();
                break;
            case 'KeyF':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                video.currentTime = Math.max(0, video.currentTime - 10);
                break;
            case 'ArrowRight':
                e.preventDefault();
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
                break;
        }
    }

    // Utility functions
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    // Initialize the player
    init();
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
    // Check if this is the landing page
    const isLandingPage = document.querySelector('.landing-hero') !== null;
    
    // Check if this is the presentation page (has side navigation)
    const isPresentationPage = document.querySelector('.side-nav') !== null;
    
    // Create navigation menu button for all pages except landing page
    if (!isLandingPage) {
        if (window.innerWidth <= 768) {
            createMobileMenu();
        } else {
            createHamburgerMenu();
        }
    }
    
    // Create side navigation mobile button for presentation page
    if (isPresentationPage) {
        createSideNavMobileButton();
    }

    // Use debounced resize handler for better performance
    const debouncedResize = debounce(function() {
        if (!isLandingPage) {
            if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-btn')) {
                // Switch to mobile menu
                removeHamburgerMenu();
                createMobileMenu();
            } else if (window.innerWidth > 768 && !document.querySelector('.hamburger-menu-btn')) {
                // Switch to hamburger menu
                removeMobileMenu();
                createHamburgerMenu();
            }
        }
        
        // Handle side navigation mobile button
        if (isPresentationPage) {
            if (window.innerWidth <= 768 && !document.querySelector('.side-nav-mobile-btn')) {
                createSideNavMobileButton();
            } else if (window.innerWidth > 768 && document.querySelector('.side-nav-mobile-btn')) {
                // Remove side nav mobile button on desktop
                const sideNavBtn = document.querySelector('.side-nav-mobile-btn');
                const sideNavCloseBtn = document.querySelector('.side-nav-close-btn');
                const fabBtn = document.querySelector('.side-nav-fab');
                if (sideNavBtn) sideNavBtn.remove();
                if (sideNavCloseBtn) sideNavCloseBtn.remove();
                if (fabBtn) fabBtn.remove();
                // Reset side nav position
                const sideNav = document.querySelector('.side-nav');
                if (sideNav) {
                    sideNav.classList.remove('mobile-open');
                    sideNav.style.left = '';
                }
            }
        }
        
        // Handle hamburger menu visibility
        if (!isLandingPage) {
            if (window.innerWidth <= 768) {
                // Hide hamburger menu on mobile, show mobile menu instead
                const hamburgerBtn = document.querySelector('.hamburger-menu-btn');
                if (hamburgerBtn) {
                    hamburgerBtn.style.display = 'none';
                }
            } else {
                // Show hamburger menu on desktop
                const hamburgerBtn = document.querySelector('.hamburger-menu-btn');
                if (hamburgerBtn) {
                    hamburgerBtn.style.display = 'flex';
                }
            }
        }
    }, 250);

    window.addEventListener('resize', debouncedResize);
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
    mobileBtn.setAttribute('aria-expanded', 'false');

    // Add close button to mobile menu
    const closeBtn = document.createElement('button');
    closeBtn.className = 'mobile-close-btn';
    closeBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    closeBtn.setAttribute('aria-label', 'Close mobile menu');

    // Insert button before nav-list
    navList.parentNode.insertBefore(mobileBtn, navList);

    // Add close button to the beginning of nav list
    navList.insertBefore(closeBtn, navList.firstChild);

    // Toggle mobile menu
    let isOpen = false;
    
    function toggleMenu() {
        isOpen = !isOpen;
        console.log('Mobile menu toggled:', isOpen ? 'open' : 'closed');
        if (isOpen) {
            navList.classList.add('mobile-open');
            mobileBtn.setAttribute('aria-expanded', 'true');
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
        } else {
            navList.classList.remove('mobile-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    function closeMenu() {
        if (isOpen) {
            isOpen = false;
            navList.classList.remove('mobile-open');
            mobileBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    // Add event listeners
    mobileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Touch support for mobile
    mobileBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    // Close button event listeners
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeMenu();
    });

    closeBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
    });

    // Close menu when clicking a link
    const navLinks = navList.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (isOpen && !nav.contains(e.target)) {
            closeMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) {
            closeMenu();
        }
    });

    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(closeMenu, 100);
    });

    console.log('Mobile menu initialized successfully');
}

function createHamburgerMenu() {
    const nav = document.querySelector('.nav');
    const navList = document.querySelector('.nav-list');

    // Check if hamburger menu button already exists
    if (document.querySelector('.hamburger-menu-btn')) {
        return;
    }

    // Create hamburger menu button
    const hamburgerBtn = document.createElement('button');
    hamburgerBtn.className = 'hamburger-menu-btn';
    hamburgerBtn.innerHTML = `
        <span class="icon-burger" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </span>
        <span class="icon-close" aria-hidden="true" style="display:none;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </span>
    `;
    hamburgerBtn.setAttribute('aria-label', 'Toggle navigation menu');
    hamburgerBtn.setAttribute('aria-expanded', 'false');

    // Insert button before nav-list
    navList.parentNode.insertBefore(hamburgerBtn, navList);

    // Toggle hamburger menu
    let isOpen = false;
    
    function toggleMenu() {
        isOpen = !isOpen;
        console.log('Hamburger menu toggled:', isOpen ? 'open' : 'closed');
        if (isOpen) {
            navList.classList.add('mobile-open');
            hamburgerBtn.setAttribute('aria-expanded', 'true');
            hamburgerBtn.classList.add('is-open');
            const burgerIcon = hamburgerBtn.querySelector('.icon-burger');
            const closeIcon = hamburgerBtn.querySelector('.icon-close');
            if (burgerIcon) burgerIcon.style.display = 'none';
            if (closeIcon) closeIcon.style.display = 'inline-flex';
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
        } else {
            navList.classList.remove('mobile-open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            hamburgerBtn.classList.remove('is-open');
            const burgerIcon = hamburgerBtn.querySelector('.icon-burger');
            const closeIcon = hamburgerBtn.querySelector('.icon-close');
            if (burgerIcon) burgerIcon.style.display = 'inline-flex';
            if (closeIcon) closeIcon.style.display = 'none';
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    function closeMenu() {
        if (isOpen) {
            isOpen = false;
            navList.classList.remove('mobile-open');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
            hamburgerBtn.classList.remove('is-open');
            const burgerIcon = hamburgerBtn.querySelector('.icon-burger');
            const closeIcon = hamburgerBtn.querySelector('.icon-close');
            if (burgerIcon) burgerIcon.style.display = 'inline-flex';
            if (closeIcon) closeIcon.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Add event listeners
    hamburgerBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Touch support for mobile
    hamburgerBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking a link
    const navLinks = navList.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (isOpen && !nav.contains(e.target)) {
            closeMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) {
            closeMenu();
        }
    });

    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(closeMenu, 100);
    });

    console.log('Hamburger menu initialized successfully');
}

function createSideNavMobileButton() {
    const sideNav = document.querySelector('.side-nav');
    const mainContent = document.querySelector('.main-content');
    
    if (!sideNav || !mainContent) {
        console.log('Side navigation or main content not found');
        return;
    }
    
    // Check if side nav mobile button already exists
    if (document.querySelector('.side-nav-mobile-btn') || document.querySelector('.side-nav-fab')) {
        return;
    }
    
    // Create side navigation mobile button (burger that toggles to X)
    const sideNavBtn = document.createElement('button');
    sideNavBtn.className = 'side-nav-mobile-btn';
    sideNavBtn.innerHTML = `
        <span class="icon-burger" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </span>
        <span class="icon-close" aria-hidden="true" style="display:none;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </span>
        <span>Navigation</span>
    `;
    sideNavBtn.setAttribute('aria-label', 'Toggle side navigation');
    sideNavBtn.setAttribute('aria-expanded', 'false');
    
    // Insert button at the top of main content
    mainContent.insertBefore(sideNavBtn, mainContent.firstChild);
    
    // Floating action button (FAB) removed per design request
    
    // No dedicated close button; toggle same control
    
    // Toggle side navigation
    let isSideNavOpen = false;
    
    function toggleSideNav() {
        isSideNavOpen = !isSideNavOpen;
        console.log('Side navigation toggled:', isSideNavOpen ? 'open' : 'closed');
        
        if (isSideNavOpen) {
            sideNav.classList.add('mobile-open');
            sideNavBtn.setAttribute('aria-expanded', 'true');
            sideNavBtn.classList.add('active');
            const burgerIcon = sideNavBtn.querySelector('.icon-burger');
            const closeIcon = sideNavBtn.querySelector('.icon-close');
            if (burgerIcon) burgerIcon.style.display = 'none';
            if (closeIcon) closeIcon.style.display = 'inline-flex';
            // Prevent body scroll when side nav is open
            document.body.style.overflow = 'hidden';
        } else {
            sideNav.classList.remove('mobile-open');
            sideNavBtn.setAttribute('aria-expanded', 'false');
            sideNavBtn.classList.remove('active');
            const burgerIcon = sideNavBtn.querySelector('.icon-burger');
            const closeIcon = sideNavBtn.querySelector('.icon-close');
            if (burgerIcon) burgerIcon.style.display = 'inline-flex';
            if (closeIcon) closeIcon.style.display = 'none';
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }
    
    function closeSideNav() {
        if (isSideNavOpen) {
            isSideNavOpen = false;
            sideNav.classList.remove('mobile-open');
            sideNavBtn.setAttribute('aria-expanded', 'false');
            sideNavBtn.classList.remove('active');
            const burgerIcon = sideNavBtn.querySelector('.icon-burger');
            const closeIcon = sideNavBtn.querySelector('.icon-close');
            if (burgerIcon) burgerIcon.style.display = 'inline-flex';
            if (closeIcon) closeIcon.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    // Add event listeners
    sideNavBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSideNav();
    });
    
    // Touch support for mobile
    sideNavBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleSideNav();
    });
    
    // FAB and dedicated close button removed
    
    // Close side nav when clicking a link
    const sideNavLinks = sideNav.querySelectorAll('.side-nav-link');
    sideNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeSideNav();
        });
    });
    
    // Close side nav when clicking outside
    document.addEventListener('click', function(e) {
        if (isSideNavOpen && !sideNav.contains(e.target) && !sideNavBtn.contains(e.target)) {
            closeSideNav();
        }
    });
    
    // Close side nav on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isSideNavOpen) {
            closeSideNav();
        }
    });
    
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(closeSideNav, 100);
    });
    
    console.log('Side navigation mobile button initialized successfully');
}

function removeMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const closeBtn = document.querySelector('.mobile-close-btn');
    const navList = document.querySelector('.nav-list');

    if (mobileBtn) {
        mobileBtn.remove();
    }
    if (closeBtn) {
        closeBtn.remove();
    }
    if (navList) {
        navList.classList.remove('mobile-open');
        navList.style.cssText = '';
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
}

function removeHamburgerMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-menu-btn');
    const closeBtn = document.querySelector('.mobile-close-btn');
    const navList = document.querySelector('.nav-list');

    if (hamburgerBtn) {
        hamburgerBtn.remove();
    }
    if (closeBtn) {
        closeBtn.remove();
    }
    if (navList) {
        navList.classList.remove('mobile-open');
        navList.style.cssText = '';
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
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
    let isInitialized = false;

    // Create crosshair overlay
    function createCrosshairOverlay() {
        // Remove existing overlay if it exists
        const existingOverlay = document.querySelector('.cad-crosshair-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        crosshairOverlay = document.createElement('div');
        crosshairOverlay.className = 'cad-crosshair-overlay';
        crosshairOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
            display: block;
        `;
        
        const horizontal = document.createElement('div');
        horizontal.className = 'cad-crosshair-horizontal';
        horizontal.style.cssText = `
            position: absolute;
            width: 100vw;
            height: 1px;
            background: #ff6b35;
            opacity: 0.9;
            box-shadow: 0 0 4px rgba(255, 107, 53, 0.8);
            top: 0;
            left: 0;
        `;
        
        const vertical = document.createElement('div');
        vertical.className = 'cad-crosshair-vertical';
        vertical.style.cssText = `
            position: absolute;
            width: 1px;
            height: 100vh;
            background: #ff6b35;
            opacity: 0.9;
            box-shadow: 0 0 4px rgba(255, 107, 53, 0.8);
            top: 0;
            left: 0;
        `;
        
        const center = document.createElement('div');
        center.className = 'cad-crosshair-center';
        center.style.cssText = `
            position: absolute;
            width: 12px;
            height: 12px;
            border: 2px solid #ff6b35;
            border-radius: 50%;
            background: rgba(255, 107, 53, 0.3);
            transform: translate(-50%, -50%);
            box-shadow: 0 0 8px rgba(255, 107, 53, 0.8);
        `;
        
        crosshairOverlay.appendChild(horizontal);
        crosshairOverlay.appendChild(vertical);
        crosshairOverlay.appendChild(center);
        
        document.body.appendChild(crosshairOverlay);
        console.log('CAD Crosshair overlay created and added to DOM');
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
        coordDisplay.innerHTML = 'X: 0, Y: 0';
        document.body.appendChild(coordDisplay);
        // Ensure it's placed inside bottom HUD alignment bar
        try { setupBottomHud(); } catch (e) { /* noop */ }

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
        if (isInitialized) {
            console.log('CAD Crosshair already initialized');
            return;
        }
        
        try {
            createCrosshairOverlay();
            createGridOverlay();
            
            // Show overlays immediately with enhanced visibility
            if (crosshairOverlay) {
                crosshairOverlay.style.display = 'block';
                crosshairOverlay.style.opacity = '1';
                crosshairOverlay.style.visibility = 'visible';
                crosshairOverlay.style.zIndex = '9999';
            }
            
            const gridOverlay = document.getElementById('cad-grid-overlay');
            if (gridOverlay) {
                gridOverlay.style.display = 'block';
                gridOverlay.style.opacity = '0.3';
                gridOverlay.style.visibility = 'visible';
                gridOverlay.style.zIndex = '9998';
            }
            
            // Add mouse move listener with throttling for better performance
            let mouseMoveTimeout;
            document.addEventListener('mousemove', function(e) {
                if (mouseMoveTimeout) {
                    clearTimeout(mouseMoveTimeout);
                }
                mouseMoveTimeout = setTimeout(() => {
                    updateCrosshairPosition(e);
                }, 16); // ~60fps throttling
            });
            
            // Add debugging features
            addDebugFeatures();
            
            // Force crosshair visibility on page load with multiple attempts
            const forceVisibility = () => {
                if (crosshairOverlay) {
                    crosshairOverlay.style.display = 'block';
                    crosshairOverlay.style.opacity = '1';
                    crosshairOverlay.style.visibility = 'visible';
                    crosshairOverlay.style.zIndex = '9999';
                    console.log('CAD Crosshair overlay forced visible');
                }
            };
            
            // Multiple attempts to ensure visibility
            setTimeout(forceVisibility, 100);
            setTimeout(forceVisibility, 500);
            setTimeout(forceVisibility, 1000);
            
            // Also try on window load
            window.addEventListener('load', forceVisibility);
            
            isInitialized = true;
            console.log('CAD Crosshair system initialized - Default Mode Active');
            
        } catch (error) {
            console.error('Error initializing CAD Crosshair:', error);
            // Fallback to basic crosshair cursor
            document.body.style.cursor = 'crosshair';
        }
    }

    // Start initialization with delay to ensure DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
    // Also try on window load as backup
    window.addEventListener('load', init);
}
// Bottom HUD assembly: align XY, search bar, and return-to-top button
function setupBottomHud() {
    const coordDisplay = document.getElementById('cad-coord-display');
    const searchContainer = document.getElementById('searchContainer');
    const returnToTopBtn = document.querySelector('.return-to-top');

    if (!coordDisplay && !searchContainer && !returnToTopBtn) return;

    let hud = document.getElementById('bottomHud');
    if (!hud) {
        hud = document.createElement('div');
        hud.id = 'bottomHud';
        hud.className = 'bottom-hud';
        document.body.appendChild(hud);
    }

    // Attach XY (left)
    if (coordDisplay && coordDisplay.parentElement !== hud) {
        coordDisplay.classList.add('in-hud');
        hud.appendChild(coordDisplay);
    }

    // Attach Search (middle, only on presentation page)
    if (searchContainer && searchContainer.parentElement !== hud) {
        searchContainer.classList.add('in-hud');
        hud.appendChild(searchContainer);
    }

    // Attach Return-to-top (right)
    if (returnToTopBtn && returnToTopBtn.parentElement !== hud) {
        returnToTopBtn.classList.add('in-hud');
        hud.appendChild(returnToTopBtn);
        returnToTopBtn.classList.add('visible');
    }
}

// Main pen mode functionality removed - only available in sheet enlargement modal

// Sheet Enlargement and Annotation System
function initializeSheetEnlargement() {
    const sheetModal = document.getElementById('sheetModal');
    const sheetBaseCanvas = document.getElementById('sheetBaseCanvas');
    const sheetModalTitle = document.getElementById('sheetModalTitle');
    const closeSheetModalBtn = document.getElementById('closeSheetModal');
    const penModeModalBtn = document.getElementById('penModeModalBtn');
    const downloadAnnotatedBtn = document.getElementById('downloadAnnotatedBtn');
    const sheetPenModeInterface = document.getElementById('sheetPenModeInterface');
    const sheetDrawingCanvas = document.getElementById('sheetDrawingCanvas');
    
    let isSheetModalOpen = false;
    let isSheetPenModeActive = false;
    let currentSheetId = '';
    let isDrawing = false;
    let currentTool = 'pen';
    let lastX = 0;
    let lastY = 0;
    let currentImage = null;
    let imageNaturalWidth = 0;
    let imageNaturalHeight = 0;

    // Initialize sheet modal pen mode
    function initializeSheetPenMode() {
        const sheetPenTool = document.getElementById('sheetPenTool');
        const sheetEraserTool = document.getElementById('sheetEraserTool');
        const sheetPenSize = document.getElementById('sheetPenSize');
        const sheetPenSizeValue = document.getElementById('sheetPenSizeValue');
        const sheetPenColor = document.getElementById('sheetPenColor');
        const sheetClearAll = document.getElementById('sheetClearAll');
        const sheetClosePenMode = document.getElementById('sheetClosePenMode');

        // Initialize canvas
        function initSheetCanvas() {
            const ctx = sheetDrawingCanvas.getContext('2d');
            const container = sheetDrawingCanvas.parentElement;
            
            // Set canvas size to match container
            sheetDrawingCanvas.width = container.offsetWidth;
            sheetDrawingCanvas.height = container.offsetHeight;
            
            // Set default drawing properties
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalCompositeOperation = 'source-over';
            
            // Load saved annotations for this sheet
            loadSheetAnnotations();
        }

        // Switch between pen and eraser tools
        function switchSheetTool(tool) {
            currentTool = tool;
            const ctx = sheetDrawingCanvas.getContext('2d');
            
            if (tool === 'pen') {
                sheetPenTool.classList.add('active');
                sheetEraserTool.classList.remove('active');
                sheetDrawingCanvas.classList.remove('eraser');
                ctx.globalCompositeOperation = 'source-over';
            } else if (tool === 'eraser') {
                sheetEraserTool.classList.add('active');
                sheetPenTool.classList.remove('active');
                sheetDrawingCanvas.classList.add('eraser');
                ctx.globalCompositeOperation = 'destination-out';
            }
        }

        // Start drawing
        function startSheetDrawing(e) {
            if (!isSheetPenModeActive) return;
            
            isDrawing = true;
            const rect = sheetDrawingCanvas.getBoundingClientRect();
            lastX = e.clientX - rect.left;
            lastY = e.clientY - rect.top;
            
            const ctx = sheetDrawingCanvas.getContext('2d');
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
        }

        // Draw
        function drawSheet(e) {
            if (!isDrawing || !isSheetPenModeActive) return;
            
            const rect = sheetDrawingCanvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            const ctx = sheetDrawingCanvas.getContext('2d');
            ctx.strokeStyle = currentTool === 'pen' ? sheetPenColor.value : 'rgba(0,0,0,0)';
            ctx.lineWidth = parseInt(sheetPenSize.value);
            
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            
            lastX = currentX;
            lastY = currentY;
            
            // Save to localStorage
            saveSheetAnnotations();
        }

        // Stop drawing
        function stopSheetDrawing() {
            if (!isDrawing) return;
            
            isDrawing = false;
            const ctx = sheetDrawingCanvas.getContext('2d');
            ctx.beginPath();
        }

        // Clear all annotations
        function clearAllSheetAnnotations() {
            const ctx = sheetDrawingCanvas.getContext('2d');
            ctx.clearRect(0, 0, sheetDrawingCanvas.width, sheetDrawingCanvas.height);
            localStorage.removeItem(`sheetAnnotations_${currentSheetId}`);
        }

        // Save annotations to localStorage
        function saveSheetAnnotations() {
            const dataURL = sheetDrawingCanvas.toDataURL();
            localStorage.setItem(`sheetAnnotations_${currentSheetId}`, dataURL);
        }

        // Load annotations from localStorage
        function loadSheetAnnotations() {
            const savedData = localStorage.getItem(`sheetAnnotations_${currentSheetId}`);
            if (savedData) {
                const img = new Image();
                img.onload = function() {
                    const ctx = sheetDrawingCanvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                };
                img.src = savedData;
            }
        }

        // Update pen size display
        function updateSheetPenSizeDisplay() {
            sheetPenSizeValue.textContent = sheetPenSize.value;
        }

        // Toggle sheet pen mode
        function toggleSheetPenMode() {
            isSheetPenModeActive = !isSheetPenModeActive;
            
            if (isSheetPenModeActive) {
                sheetPenModeInterface.style.display = 'block';
                sheetDrawingCanvas.classList.add('active');
                penModeModalBtn.classList.add('active');
                initSheetCanvas();
            } else {
                sheetPenModeInterface.style.display = 'none';
                sheetDrawingCanvas.classList.remove('active');
                sheetDrawingCanvas.classList.remove('eraser');
                penModeModalBtn.classList.remove('active');
            }
        }

        // Download annotated version
        function downloadAnnotatedSheet() {
            if (!currentImage) return;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to match original image resolution
            canvas.width = imageNaturalWidth;
            canvas.height = imageNaturalHeight;
            
            // Draw the original image at full resolution
            ctx.drawImage(currentImage, 0, 0, imageNaturalWidth, imageNaturalHeight);
            
            // Draw annotations on top scaled to match
            const annotationCanvas = sheetDrawingCanvas;
            const scaleX = imageNaturalWidth / annotationCanvas.width;
            const scaleY = imageNaturalHeight / annotationCanvas.height;
            ctx.save();
            ctx.scale(scaleX, scaleY);
            ctx.drawImage(annotationCanvas, 0, 0);
            ctx.restore();
            
            // Download the result
            const link = document.createElement('a');
            link.download = `annotated_${currentSheetId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }

        // Event listeners
        penModeModalBtn.addEventListener('click', toggleSheetPenMode);
        sheetPenTool.addEventListener('click', () => switchSheetTool('pen'));
        sheetEraserTool.addEventListener('click', () => switchSheetTool('eraser'));
        sheetPenSize.addEventListener('input', updateSheetPenSizeDisplay);
        sheetClearAll.addEventListener('click', clearAllSheetAnnotations);
        sheetClosePenMode.addEventListener('click', toggleSheetPenMode);
        downloadAnnotatedBtn.addEventListener('click', downloadAnnotatedSheet);

        // Drawing events
        sheetDrawingCanvas.addEventListener('mousedown', startSheetDrawing);
        sheetDrawingCanvas.addEventListener('mousemove', drawSheet);
        sheetDrawingCanvas.addEventListener('mouseup', stopSheetDrawing);
        sheetDrawingCanvas.addEventListener('mouseout', stopSheetDrawing);

        // Touch events for mobile
        sheetDrawingCanvas.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            sheetDrawingCanvas.dispatchEvent(mouseEvent);
        });

        sheetDrawingCanvas.addEventListener('touchmove', function(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            sheetDrawingCanvas.dispatchEvent(mouseEvent);
        });

        sheetDrawingCanvas.addEventListener('touchend', function(e) {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            sheetDrawingCanvas.dispatchEvent(mouseEvent);
        });

        // Initialize pen size display
        updateSheetPenSizeDisplay();
    }

    // Open sheet modal
    function openSheetModal(sheetSrc, sheetTitle, sheetId) {
        currentSheetId = sheetId;
        sheetModalTitle.textContent = sheetTitle;
        sheetModal.style.display = 'flex';
        isSheetModalOpen = true;
        
        // Load the image and draw onto base canvas
        const img = new Image();
        img.onload = function() {
            currentImage = img;
            imageNaturalWidth = img.naturalWidth;
            imageNaturalHeight = img.naturalHeight;
            drawBaseImage();
            // Initialize pen mode for this sheet
            initializeSheetPenMode();
        };
        img.src = sheetSrc;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    function drawBaseImage() {
        if (!sheetBaseCanvas || !currentImage) return;
        const container = sheetBaseCanvas.parentElement;
        const ctx = sheetBaseCanvas.getContext('2d');
        // Set canvas pixel size to container size
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        sheetBaseCanvas.width = width;
        sheetBaseCanvas.height = height;
        
        // Clear
        ctx.clearRect(0, 0, width, height);
        
        // Compute contain fit
        const scale = Math.min(width / imageNaturalWidth, height / imageNaturalHeight);
        const drawW = imageNaturalWidth * scale;
        const drawH = imageNaturalHeight * scale;
        const dx = (width - drawW) / 2;
        const dy = (height - drawH) / 2;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(currentImage, dx, dy, drawW, drawH);
    }

    // Close sheet modal
    function closeSheetModal() {
        sheetModal.style.display = 'none';
        isSheetModalOpen = false;
        isSheetPenModeActive = false;
        sheetPenModeInterface.style.display = 'none';
        sheetDrawingCanvas.classList.remove('active');
        penModeModalBtn.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    // Add click listeners to all sheet images
    function addSheetClickListeners() {
        const sheetImages = document.querySelectorAll('.sheet-card img, .rendering-card img');
        
        sheetImages.forEach((img, index) => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function() {
                const sheetTitle = this.closest('.sheet-card, .rendering-card').querySelector('h4').textContent;
                const sheetId = `sheet_${index}_${Date.now()}`;
                openSheetModal(this.src, sheetTitle, sheetId);
            });
        });
    }

    // Event listeners
    closeSheetModalBtn.addEventListener('click', closeSheetModal);
    
    // Close modal when clicking outside
    sheetModal.addEventListener('click', function(e) {
        if (e.target === sheetModal) {
            closeSheetModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isSheetModalOpen) {
            closeSheetModal();
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        if (!isSheetModalOpen) return;
        // Redraw base image to fit new size
        drawBaseImage();
        if (isSheetModalOpen && isSheetPenModeActive) {
            const container = sheetDrawingCanvas.parentElement;
            sheetDrawingCanvas.width = container.offsetWidth;
            sheetDrawingCanvas.height = container.offsetHeight;
            // Reload saved annotations after resizing
            const savedData = localStorage.getItem(`sheetAnnotations_${currentSheetId}`);
            if (savedData) {
                const img = new Image();
                img.onload = function() {
                    const ctx = sheetDrawingCanvas.getContext('2d');
                    ctx.clearRect(0, 0, sheetDrawingCanvas.width, sheetDrawingCanvas.height);
                    ctx.drawImage(img, 0, 0, sheetDrawingCanvas.width, sheetDrawingCanvas.height);
                };
                img.src = savedData;
            }
        }
    });

    // Initialize
    addSheetClickListeners();
    
    console.log('Sheet Enlargement system initialized');
}

// Return to Top functionality
function initializeReturnToTop() {
    // Only enable on presentation page (long page)
    const isPresentationPage = document.querySelector('.side-nav') !== null;
    if (!isPresentationPage) {
        return;
    }

    // Create return to top button
    const returnToTopBtn = document.createElement('button');
    returnToTopBtn.className = 'return-to-top';
    returnToTopBtn.setAttribute('aria-label', 'Return to top');
    returnToTopBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    // Add button to body
    document.body.appendChild(returnToTopBtn);
    
    // Show/hide button based on scroll position
    function toggleReturnToTop() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Show button when scrolled down more than 300px or 20% of page height
        const threshold = Math.max(300, documentHeight * 0.2);
        
        if (scrollTop > threshold) {
            returnToTopBtn.classList.add('visible');
        } else {
            returnToTopBtn.classList.remove('visible');
        }
    }
    
    // Smooth scroll to top
    function scrollToTop() {
        // Use smooth scrolling if supported
        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // Fallback for older browsers
            const scrollStep = -window.scrollY / (500 / 15);
            const scrollInterval = setInterval(function() {
                if (window.scrollY !== 0) {
                    window.scrollBy(0, scrollStep);
                } else {
                    clearInterval(scrollInterval);
                }
            }, 15);
        }
    }
    
    // Add event listeners
    window.addEventListener('scroll', debounce(toggleReturnToTop, 100));
    returnToTopBtn.addEventListener('click', scrollToTop);
    
    // Keyboard support
    returnToTopBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToTop();
        }
    });
    
    // Initial check
    toggleReturnToTop();
    
    console.log('Return to Top system initialized');

    // Place into bottom HUD alignment
    try { setupBottomHud(); } catch (e) { /* noop */ }
}

// Download functionality for renderings and PDF
function initializeDownloadFunctionality() {
    const downloadRenderingsBtn = document.getElementById('downloadRenderingsBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    
    if (!downloadRenderingsBtn && !downloadPdfBtn) {
        console.log('Download buttons not found');
        return;
    }
    
    // List of all rendering images
    const renderingImages = [
        'rendering/Villa_Bedroom-Video_Texture.png',
        'rendering/Villa_Counter.png',
        'rendering/Villa_Entrance.png',
        'rendering/Villa_Exterior-Nightime.png',
        'rendering/Villa_Exterior_01.png',
        'rendering/Villa_Exterior_02.png',
        'rendering/Villa_Exterior.png',
        'rendering/Villa_Fireplace.png',
        'rendering/Villa_Interior_01.png',
        'rendering/Villa_Interior_02.png',
        'rendering/Villa_Interior_03.png',
        'rendering/Villa_Interior_04.png',
        'rendering/Villa_Interior_05.png',
        'rendering/Villa_Kitchen_2.png',
        'rendering/Villa_Kitchen.png',
        'rendering/Villa_Living_Room.png',
        'rendering/Villa_Office-White_Mode.png'
    ];
    
    // Function to download a single image
    function downloadImage(imagePath, filename) {
        try {
            const link = document.createElement('a');
            link.href = imagePath;
            link.download = filename;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log(`Downloaded: ${filename}`);
        } catch (error) {
            console.error(`Error downloading ${filename}:`, error);
        }
    }
    
    // Function to download all renderings as a ZIP file
    async function downloadAllRenderings() {
        // Check if JSZip is available
        if (typeof JSZip === 'undefined') {
            console.error('JSZip library not loaded');
            showDownloadError('ZIP library not available. Please refresh the page and try again.');
            return;
        }

        // Show loading state
        const originalText = downloadRenderingsBtn.innerHTML;
        downloadRenderingsBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-right: var(--spacing-sm);" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Creating ZIP...
        `;
        downloadRenderingsBtn.disabled = true;

        try {
            // Create a new JSZip instance
            const zip = new JSZip();
            
            // Create a folder for the renderings
            const renderingsFolder = zip.folder("High-Resolution_Renderings");
            
            // Track progress
            let loadedCount = 0;
            const totalImages = renderingImages.length;
            
            // Function to update progress
            function updateProgress() {
                const progress = Math.round((loadedCount / totalImages) * 100);
                downloadRenderingsBtn.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-right: var(--spacing-sm);" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Creating ZIP... ${progress}%
                `;
            }

            // Load all images and add them to the ZIP
            const imagePromises = renderingImages.map(async (imagePath, index) => {
                try {
                    // Fetch the image as a blob
                    const response = await fetch(imagePath);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${imagePath}: ${response.status}`);
                    }
                    
                    const blob = await response.blob();
                    const filename = imagePath.split('/').pop();
                    
                    // Add the image to the ZIP
                    renderingsFolder.file(filename, blob);
                    
                    loadedCount++;
                    updateProgress();
                    
                    console.log(`Added to ZIP: ${filename} (${loadedCount}/${totalImages})`);
                    
                    return { success: true, filename };
                } catch (error) {
                    console.error(`Error loading ${imagePath}:`, error);
                    return { success: false, filename: imagePath.split('/').pop(), error };
                }
            });

            // Wait for all images to be loaded
            const results = await Promise.all(imagePromises);
            
            // Check if any images failed to load
            const failedImages = results.filter(result => !result.success);
            if (failedImages.length > 0) {
                console.warn(`${failedImages.length} images failed to load:`, failedImages);
            }

            // Generate the ZIP file
            downloadRenderingsBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-right: var(--spacing-sm);" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Generating ZIP...
            `;

            const zipBlob = await zip.generateAsync({ type: "blob" });
            
            // Create download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(zipBlob);
            link.download = `High-Resolution_Renderings_${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the object URL
            URL.revokeObjectURL(link.href);
            
            // Reset button
            downloadRenderingsBtn.innerHTML = originalText;
            downloadRenderingsBtn.disabled = false;
            
            // Show success message
            const successMessage = failedImages.length > 0 
                ? `ZIP downloaded! (${totalImages - failedImages.length}/${totalImages} images included)`
                : `ZIP downloaded successfully! (${totalImages} images included)`;
            showDownloadSuccess(successMessage);
            
            console.log('ZIP file created and downloaded successfully');
            
        } catch (error) {
            console.error('Error creating ZIP file:', error);
            
            // Reset button
            downloadRenderingsBtn.innerHTML = originalText;
            downloadRenderingsBtn.disabled = false;
            
            // Show error message
            showDownloadError('Failed to create ZIP file. Please try again.');
        }
    }
    
    // Function to show download error message
    function showDownloadError(message) {
        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: var(--spacing-md) var(--spacing-lg);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        errorMsg.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                </svg>
                ${message}
            </div>
        `;
        
        document.body.appendChild(errorMsg);
        
        // Animate in
        setTimeout(() => {
            errorMsg.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorMsg.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (errorMsg.parentNode) {
                    errorMsg.parentNode.removeChild(errorMsg);
                }
            }, 300);
        }, 5000);
    }

    // Function to show download success message
    function showDownloadSuccess(message = 'All renderings downloaded successfully!') {
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-primary);
            color: white;
            padding: var(--spacing-md) var(--spacing-lg);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        successMsg.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ${message}
            </div>
        `;
        
        document.body.appendChild(successMsg);
        
        // Animate in
        setTimeout(() => {
            successMsg.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successMsg.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (successMsg.parentNode) {
                    successMsg.parentNode.removeChild(successMsg);
                }
            }, 300);
        }, 3000);
    }
    
    // Function to download PDF
    function downloadPDF() {
        if (!downloadPdfBtn) return;
        
        // Show loading state
        const originalText = downloadPdfBtn.innerHTML;
        downloadPdfBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="margin-right: var(--spacing-sm);" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Downloading...
        `;
        downloadPdfBtn.disabled = true;
        
        // Try different URL formats for the PDF
        const pdfPaths = [
            'download-content/Floor%20Plan-combined.pdf',
            'download-content/Floor Plan-combined.pdf',
            'download-content/Floor%20Plan-combined.pdf'
        ];
        
        let downloadAttempted = false;
        
        pdfPaths.forEach((path, index) => {
            if (downloadAttempted) return;
            
            setTimeout(() => {
                try {
                    const link = document.createElement('a');
                    link.href = path;
                    link.download = 'Floor Plan-combined.pdf';
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    downloadAttempted = true;
                    console.log(`PDF download attempted with path: ${path}`);
                    
                    // Reset button after download attempt
                    setTimeout(() => {
                        downloadPdfBtn.innerHTML = originalText;
                        downloadPdfBtn.disabled = false;
                        
                        // Show success message
                        showDownloadSuccess('PDF downloaded successfully!');
                    }, 1000);
                } catch (error) {
                    console.error(`Error downloading PDF with path ${path}:`, error);
                }
            }, index * 500);
        });
    }
    
    // Add event listeners
    if (downloadRenderingsBtn) {
        downloadRenderingsBtn.addEventListener('click', downloadAllRenderings);
    }
    
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', downloadPDF);
    }
    
    console.log('Download functionality initialized');
    console.log('PDF download button found:', !!downloadPdfBtn);
    console.log('Renderings download button found:', !!downloadRenderingsBtn);
    console.log('JSZip library available:', typeof JSZip !== 'undefined');
    console.log('Total rendering images:', renderingImages.length);
}

// Search Functionality
function initializeSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchClear = document.getElementById('searchClear');
    
    if (!searchInput || !searchResults || !searchClear) {
        console.log('Search elements not found - searchInput:', !!searchInput, 'searchResults:', !!searchResults, 'searchClear:', !!searchClear);
        return;
    }
    
    console.log('Search functionality initializing...');
    
    let searchTimeout;
    let currentResults = [];
    
    // Search data structure
    const searchData = [];
    
    // Initialize search data from page content
    function initializeSearchData() {
        // Clear existing data
        searchData.length = 0;
        
        // Search through all sections and their content
        const sections = document.querySelectorAll('section[id]');
        
        sections.forEach(section => {
            const sectionId = section.id;
            const sectionTitle = section.querySelector('h2')?.textContent || '';
            
            // Get all gallery items in this section
            const galleryItems = section.querySelectorAll('.gallery-item');
            
            galleryItems.forEach(item => {
                const title = item.querySelector('h4')?.textContent || '';
                const description = item.querySelector('p')?.textContent || '';
                const img = item.querySelector('img');
                const imgSrc = img?.src || '';
                const imgAlt = img?.alt || '';
                
                if (title || description) {
                    searchData.push({
                        type: 'gallery-item',
                        section: sectionId,
                        sectionTitle: sectionTitle,
                        title: title,
                        description: description,
                        imgSrc: imgSrc,
                        imgAlt: imgAlt,
                        element: item,
                        searchText: `${title} ${description} ${imgAlt}`.toLowerCase()
                    });
                }
            });
            
            // Also add section titles as searchable items
            if (sectionTitle) {
                searchData.push({
                    type: 'section',
                    section: sectionId,
                    sectionTitle: sectionTitle,
                    title: sectionTitle,
                    description: `Navigate to ${sectionTitle} section`,
                    element: section,
                    searchText: sectionTitle.toLowerCase()
                });
            }
        });
        
        console.log(`Search data initialized with ${searchData.length} items`);
    }
    
    // Highlight search terms in text
    function highlightSearchTerms(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }
    
    // Get icon for search result type
    function getSearchResultIcon(type) {
        const icons = {
            'gallery-item': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
            </svg>`,
            'section': `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2"/>
                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2"/>
            </svg>`
        };
        return icons[type] || icons['gallery-item'];
    }
    
    // Perform search
    function performSearch(query) {
        if (!query || query.length < 2) {
            hideSearchResults();
            return;
        }
        
        const searchTerm = query.toLowerCase().trim();
        const results = searchData.filter(item => 
            item.searchText.includes(searchTerm)
        );
        
        currentResults = results;
        displaySearchResults(results, searchTerm);
    }
    
    // Display search results
    function displaySearchResults(results, searchTerm) {
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    No results found for "${searchTerm}"
                </div>
            `;
        } else {
            searchResults.innerHTML = results.map(item => `
                <div class="search-result-item" data-type="${item.type}" data-section="${item.section}">
                    <div class="search-result-icon">
                        ${getSearchResultIcon(item.type)}
                    </div>
                    <div class="search-result-content">
                        <div class="search-result-title">
                            ${highlightSearchTerms(item.title, searchTerm)}
                        </div>
                        <div class="search-result-description">
                            ${highlightSearchTerms(item.description, searchTerm)}
                        </div>
                        <div class="search-result-section">
                            ${item.sectionTitle}
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        searchResults.classList.add('visible');
    }
    
    // Hide search results
    function hideSearchResults() {
        searchResults.classList.remove('visible');
        currentResults = [];
    }
    
    // Jump to search result
    function jumpToResult(resultItem) {
        const type = resultItem.dataset.type;
        const section = resultItem.dataset.section;
        
        if (type === 'section') {
            // Jump to section
            const targetSection = document.getElementById(section);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active nav link
                updateActiveNavLink(`#${section}`);
            }
        } else if (type === 'gallery-item') {
            // Find the corresponding gallery item and jump to it
            const resultIndex = Array.from(searchResults.children).indexOf(resultItem);
            if (resultIndex >= 0 && currentResults[resultIndex]) {
                const targetElement = currentResults[resultIndex].element;
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    
                    // Add a temporary highlight effect
                    targetElement.style.transition = 'all 0.3s ease';
                    targetElement.style.transform = 'scale(1.02)';
                    targetElement.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.5)';
                    
                    setTimeout(() => {
                        targetElement.style.transform = 'scale(1)';
                        targetElement.style.boxShadow = '';
                    }, 2000);
                }
            }
        }
        
        // Hide search results after jumping
        hideSearchResults();
        searchInput.value = '';
        searchClear.classList.remove('visible');
    }
    
    // Event listeners
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Show/hide clear button
        if (query.length > 0) {
            searchClear.classList.add('visible');
        } else {
            searchClear.classList.remove('visible');
            hideSearchResults();
        }
        
        // Debounce search
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, 300);
    });
    
    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length > 0) {
            searchResults.classList.add('visible');
        }
    });
    
    searchClear.addEventListener('click', function() {
        searchInput.value = '';
        searchInput.focus();
        hideSearchResults();
        this.classList.remove('visible');
    });
    
    // Click on search results
    searchResults.addEventListener('click', function(e) {
        const resultItem = e.target.closest('.search-result-item');
        if (resultItem) {
            jumpToResult(resultItem);
        }
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.search-container')) {
            hideSearchResults();
        }
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            hideSearchResults();
            this.blur();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const firstResult = searchResults.querySelector('.search-result-item');
            if (firstResult) {
                firstResult.focus();
            }
        }
    });
    
    // Initialize search data
    initializeSearchData();
    
    console.log('Search functionality initialized');
}

