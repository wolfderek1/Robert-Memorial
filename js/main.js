// App Class - Main application controller
class App {
    constructor() {
        this.currentSection = 'home';
        this.theme = localStorage.getItem('theme') || 'light';
        this.mediaFiles = [];
        this.currentMediaIndex = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initTheme();
        this.animateStats();
        this.loadMediaFiles();
        this.showLoading();
        
        // Simulate app loading
        setTimeout(() => {
            this.hideLoading();
        }, 1000);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Hero buttons
        document.getElementById('viewLife').addEventListener('click', () => {
            this.navigateToSection('life');
        });

        document.getElementById('shareMemory').addEventListener('click', () => {
            this.navigateToSection('photos');
        });

        // Condolences form
        document.getElementById('condolencesForm').addEventListener('submit', (e) => {
            this.handleCondolencesForm(e);
        });

        // Lightbox controls
        document.getElementById('lightboxClose').addEventListener('click', () => {
            this.closeLightbox();
        });

        document.getElementById('lightboxPrev').addEventListener('click', () => {
            this.showPreviousMedia();
        });

        document.getElementById('lightboxNext').addEventListener('click', () => {
            this.showNextMedia();
        });

        // Close lightbox on backdrop click
        document.getElementById('lightbox').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeLightbox();
            }
        });

        // Keyboard navigation for lightbox
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('lightbox').classList.contains('active')) {
                switch(e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        this.showPreviousMedia();
                        break;
                    case 'ArrowRight':
                        this.showNextMedia();
                        break;
                }
            }
        });

        // Smooth scrolling for mobile
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 100));

        // Handle touch events for mobile navigation
        this.setupTouchNavigation();
    }

    navigateToSection(sectionId) {
        // Update active navigation link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Show selected section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        this.currentSection = sectionId;

        // Update URL without page reload
        history.pushState(null, null, `#${sectionId}`);
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        
        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
        
        // Add a little animation
        themeToggle.style.transform = 'scale(1.2)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 150);
    }

    initTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = this.theme === 'light' ? '🌙' : '☀️';
    }

    animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        
        const animateCount = (element) => {
            const target = parseInt(element.dataset.target);
            const duration = 2000; // 2 seconds
            const step = target / (duration / 16); // 60fps
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current);
            }, 16);
        };

        // Animate stats when they come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        stats.forEach(stat => {
            if (stat.id === 'wordsUsedStat') {
                // Skip the normal animation for words used stat
                this.startContinuousWordCounter(stat);
            } else if (stat.id === 'friendsStat') {
                // Skip the normal animation for friends stat
                this.startDecreasingFriendsCounter(stat);
            } else {
                observer.observe(stat);
            }
        });
    }

    startContinuousWordCounter(element) {
        // Get saved value from localStorage or start at 569
        let currentCount = parseInt(localStorage.getItem('robertWordsUsed')) || 569;
        element.textContent = currentCount; // Set initial value
        
        const updateCounter = () => {
            currentCount += 1; // Increment by exactly 1
            element.textContent = currentCount;
            // Save to localStorage
            localStorage.setItem('robertWordsUsed', currentCount);
        };
        
        // Start the continuous counter when the element comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Update every 1000ms (1 second)
                    setInterval(updateCounter, 1000);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(element);
    }

    startDecreasingFriendsCounter(element) {
        // Get saved value from localStorage or start at 5
        let currentCount = parseInt(localStorage.getItem('robertFriendsCount'));
        if (isNaN(currentCount)) {
            currentCount = 5; // Default starting value
        }
        element.textContent = currentCount; // Set initial value
        
        const updateCounter = () => {
            if (currentCount > 0) {
                currentCount -= 1; // Decrease by exactly 1
                element.textContent = currentCount;
                // Save to localStorage
                localStorage.setItem('robertFriendsCount', currentCount);
            }
            
            // Stop decreasing when it reaches 0
            if (currentCount <= 0) {
                element.textContent = 0;
                localStorage.setItem('robertFriendsCount', 0);
                return;
            }
        };
        
        // Start the decreasing counter when the element comes into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Only start the interval if friends count is greater than 0
                    if (currentCount > 0) {
                        // Update every 10000ms (10 seconds)
                        setInterval(updateCounter, 10000);
                    }
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(element);
    }

    handleCondolencesForm(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            relationship: formData.get('relationship'),
            message: formData.get('message')
        };

        this.showLoading();

        // Simulate form submission
        setTimeout(() => {
            this.hideLoading();
            this.showNotification('Thank you for sharing your condolences. Your message means so much to the family.', 'success');
            e.target.reset();
        }, 2000);

        console.log('Condolence data:', data);
    }

    // Media Gallery Functions
    async loadMediaFiles() {
        try {
            // Define the media files found in the pics folder
            this.mediaFiles = [
                {
                    name: '36D969B7-E130-4057-8B69-CF878BC72CEA.HEIC',
                    type: 'image',
                    caption: 'Cherished Memory'
                },
                {
                    name: 'IMG_1839.JPG',
                    type: 'image',
                    caption: 'Beautiful Moment'
                },
                {
                    name: 'IMG_1957.jpeg',
                    type: 'image',
                    caption: 'Special Occasion'
                },
                {
                    name: 'IMG_2074.png',
                    type: 'image',
                    caption: 'Precious Memory'
                },
                {
                    name: 'MRG013~C41E4672-79A0-4429-BE97-A955A4ECF464.MOV',
                    type: 'video',
                    caption: 'Video Memory'
                },
                {
                    name: 'cm-chat-media-video-1:c069b0c8-a7d0-4a99-a0b1-0f1e5b2d6f61:49:0:0.MOV',
                    type: 'video',
                    caption: 'Shared Moments'
                },
                {
                    name: 'recorded-24121175275846.mov',
                    type: 'video',
                    caption: 'Recorded Memory'
                },
                {
                    name: 'recorded-4765782681342.mov',
                    type: 'video',
                    caption: 'Special Recording'
                }
            ];

            this.renderGallery();
        } catch (error) {
            console.error('Error loading media files:', error);
        }
    }

    renderGallery() {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        galleryGrid.innerHTML = '';

        this.mediaFiles.forEach((media, index) => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.dataset.index = index;

            const isVideo = media.type === 'video';
            const fileName = media.name;
            const filePath = `pics/${fileName}`;

            if (isVideo) {
                mediaItem.innerHTML = `
                    <div class="media-content">
                        <video preload="metadata">
                            <source src="${filePath}" type="video/mp4">
                            <source src="${filePath}" type="video/quicktime">
                        </video>
                        <button class="play-button">▶</button>
                        <div class="media-overlay">
                            <h4>${media.caption}</h4>
                            <p>Video • Click to play</p>
                        </div>
                    </div>
                `;
            } else {
                // For HEIC files, we'll show a placeholder since browsers don't natively support HEIC
                const isHEIC = fileName.toLowerCase().endsWith('.heic');
                const imgSrc = isHEIC ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xNTAgNzVMMTc1IDEyNUgxMjVMMTUwIDc1WiIgZmlsbD0iIzZiNzI4MCIvPgo8Y2lyY2xlIGN4PSIyMjUiIGN5PSI3NSIgcj0iMTUiIGZpbGw9IiM2YjcyODAiLz4KPHR4dCB4PSIxNTAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZiNzI4MCIgZm9udC1mYW1pbHk9IkludGVyLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5IRUlDIEltYWdlPC90ZXh0Pgo8L3N2Zz4=' : filePath;
                
                mediaItem.innerHTML = `
                    <div class="media-content">
                        <img src="${imgSrc}" alt="${media.caption}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xNTAgNzVMMTc1IDEyNUgxMjVMMTUwIDc1WiIgZmlsbD0iIzZiNzI4MCIvPgo8Y2lyY2xlIGN4PSIyMjUiIGN5PSI3NSIgcj0iMTUiIGZpbGw9IiM2YjcyODAiLz4KPHR4dCB4PSIxNTAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZiNzI4MCIgZm9udC1mYW1pbHk9IkludGVyLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+Cjwvc3ZnPg=='">
                        <div class="media-overlay">
                            <h4>${media.caption}</h4>
                            <p>Photo ${isHEIC ? '• HEIC format' : ''}</p>
                        </div>
                    </div>
                `;
            }

            // Add click event to open lightbox
            mediaItem.addEventListener('click', () => {
                this.openLightbox(index);
            });

            galleryGrid.appendChild(mediaItem);
        });
    }

    openLightbox(index) {
        this.currentMediaIndex = index;
        const media = this.mediaFiles[index];
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxVideo = document.getElementById('lightboxVideo');

        // Hide both elements first
        lightboxImage.style.display = 'none';
        lightboxVideo.style.display = 'none';

        if (media.type === 'video') {
            lightboxVideo.src = `pics/${media.name}`;
            lightboxVideo.style.display = 'block';
            lightboxVideo.load(); // Reload the video
        } else {
            const isHEIC = media.name.toLowerCase().endsWith('.heic');
            lightboxImage.src = isHEIC ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0zMDAgMTUwTDM1MCAyNTBIMjUwTDMwMCAxNTBaIiBmaWxsPSIjNmI3MjgwIi8+CjxjaXJjbGUgY3g9IjQ1MCIgY3k9IjE1MCIgcj0iMzAiIGZpbGw9IiM2YjcyODAiLz4KPHR4dCB4PSIzMDAiIHk9IjMyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZiNzI4MCIgZm9udC1mYW1pbHk9IkludGVyLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0Ij5IRUlDIEltYWdlIC0gQ29udmVydCB0byBKUEcgZm9yIGJyb3dzZXIgc3VwcG9ydDwvdHh0Pgo8L3N2Zz4=' : `pics/${media.name}`;
            lightboxImage.alt = media.caption;
            lightboxImage.style.display = 'block';
            
            // Handle image load errors
            lightboxImage.onerror = function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0zMDAgMTUwTDM1MCAyNTBIMjUwTDMwMCAxNTBaIiBmaWxsPSIjNmI3MjgwIi8+CjxjaXJjbGUgY3g9IjQ1MCIgY3k9IjE1MCIgcj0iMzAiIGZpbGw9IiM2YjcyODAiLz4KPHR4dCB4PSIzMDAiIHk9IjMyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZiNzI4MCIgZm9udC1mYW1pbHk9IkludGVyLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0Ij5JbWFnZSBOb3QgRm91bmQ8L3R4dD4KPC9zdmc+';
            };
        }

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent body scrolling
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxVideo = document.getElementById('lightboxVideo');
        
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore body scrolling
        
        // Pause video if playing
        if (lightboxVideo.src) {
            lightboxVideo.pause();
            lightboxVideo.src = '';
        }
    }

    showPreviousMedia() {
        this.currentMediaIndex = (this.currentMediaIndex - 1 + this.mediaFiles.length) % this.mediaFiles.length;
        this.openLightbox(this.currentMediaIndex);
    }

    showNextMedia() {
        this.currentMediaIndex = (this.currentMediaIndex + 1) % this.mediaFiles.length;
        this.openLightbox(this.currentMediaIndex);
    }

    setupTouchNavigation() {
        let touchStartX = 0;
        let touchEndX = 0;

        const lightbox = document.getElementById('lightbox');
        
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
    }

    handleSwipe() {
        const swipeThreshold = 50;
        const touchStartX = this.touchStartX || 0;
        const touchEndX = this.touchEndX || 0;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - next image
            this.showNextMedia();
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - previous image
            this.showPreviousMedia();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            backgroundColor: type === 'success' ? '#28a745' : '#17a2b8',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    handleScroll() {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 10px var(--shadow-color)';
        } else {
            header.style.boxShadow = 'none';
        }
    }

    // Utility function to throttle function calls
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// Utility Functions
const Utils = {
    // Format date
    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },

    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Generate random ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Local storage helpers
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error getting from localStorage:', error);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error setting to localStorage:', error);
                return false;
            }
        },

        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        }
    },

    // API helpers
    api: {
        async get(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('API GET error:', error);
                throw error;
            }
        },

        async post(url, data) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                console.error('API POST error:', error);
                throw error;
            }
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const hash = window.location.hash.slice(1) || 'home';
    if (window.app) {
        window.app.navigateToSection(hash);
    }
});

// Export for use in other modules (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, Utils };
}