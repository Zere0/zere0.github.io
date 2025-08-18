// Custom JavaScript for Zere's Website

document.addEventListener('DOMContentLoaded', function() {
    
    // Enhanced Sidebar Functionality
    initializeSidebar();
    
    // Add click feedback for external links
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // Add a small visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Smooth scrolling for anchor links
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

    // Add loading animation to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 2000);
            }
        });
    });

    // Typing effect for the main title
    const titleElement = document.querySelector('.site-title');
    if (titleElement) {
        const originalText = titleElement.textContent;
        titleElement.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < originalText.length) {
                titleElement.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }

    // Add hover effects to cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.post, .card, .footer-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Dark mode toggle enhancement
    const themeToggle = document.querySelector('#theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('theme-transition');
            setTimeout(() => {
                document.body.classList.remove('theme-transition');
            }, 300);
        });
    }

    // Add theme transition styles
    const themeTransitionStyle = document.createElement('style');
    themeTransitionStyle.textContent = `
        .theme-transition * {
            transition: all 0.3s ease !important;
        }
    `;
    document.head.appendChild(themeTransitionStyle);

    // Security badge animation
    document.querySelectorAll('.security-badge').forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotate(2deg)';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });

});

// Enhanced Sidebar Functionality
function initializeSidebar() {
    const sidebar = document.querySelector('#sidebar');
    const sidebarToggle = document.querySelector('#sidebar-toggle');
    
    // Create sidebar toggle button if it doesn't exist
    if (!sidebarToggle && sidebar) {
        const toggle = document.createElement('button');
        toggle.id = 'sidebar-toggle';
        toggle.innerHTML = '<i class="fas fa-bars"></i>';
        toggle.setAttribute('aria-label', 'Toggle Sidebar');
        document.body.appendChild(toggle);
        
        toggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            this.classList.toggle('active');
            
            // Update icon
            const icon = this.querySelector('i');
            if (sidebar.classList.contains('open')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (sidebar && sidebar.classList.contains('open') && 
                !sidebar.contains(e.target) && 
                !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('open');
                if (sidebarToggle) {
                    sidebarToggle.classList.remove('active');
                    const icon = sidebarToggle.querySelector('i');
                    if (icon) icon.className = 'fas fa-bars';
                }
            }
        }
    });
    
    // Handle active navigation states
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('#sidebar .nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (currentPath === href || currentPath.startsWith(href))) {
            link.classList.add('active');
        }
        
        // Add click animation
        link.addEventListener('click', function() {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Close sidebar on mobile after navigation
            if (window.innerWidth <= 768 && sidebar) {
                setTimeout(() => {
                    sidebar.classList.remove('open');
                    if (sidebarToggle) {
                        sidebarToggle.classList.remove('active');
                        const icon = sidebarToggle.querySelector('i');
                        if (icon) icon.className = 'fas fa-bars';
                    }
                }, 300);
            }
        });
    });
    
    // Add scroll effect to sidebar
    if (sidebar) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            if (scrolled > 100) {
                sidebar.style.transform = 'translateY(-10px)';
                sidebar.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
            } else {
                sidebar.style.transform = 'translateY(0)';
                sidebar.style.boxShadow = 'none';
            }
        });
    }
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            if (sidebarToggle) {
                sidebarToggle.classList.remove('active');
                const icon = sidebarToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            }
        }
    });
    
    // Add smooth transitions for sidebar elements
    const sidebarElements = document.querySelectorAll('#sidebar .nav-link, #sidebar .site-title, #sidebar .site-subtitle');
    sidebarElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateX(0)';
        }, 100 + (index * 50));
    });
}

// Performance optimization: Lazy load images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});

// Add smooth page transitions
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        window.location.reload();
    }
});

// Add loading state for navigation
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href]:not([href^="#"])');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't show loading for external links or downloads
            if (this.hostname !== window.location.hostname || 
                this.download || 
                this.target === '_blank') {
                return;
            }
            
            // Add loading indicator
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'page-loading';
            loadingIndicator.innerHTML = '<div class="loading-spinner"></div>';
            document.body.appendChild(loadingIndicator);
            
            // Remove loading indicator after page loads
            setTimeout(() => {
                if (loadingIndicator.parentNode) {
                    loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
            }, 2000);
        });
    });
});

// Add CSS for loading indicator
const loadingStyles = document.createElement('style');
loadingStyles.textContent = `
    .page-loading {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        backdrop-filter: blur(5px);
    }
    
    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(0, 212, 170, 0.3);
        border-top: 3px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(loadingStyles);

// Enhanced Mermaid diagram functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Mermaid diagrams with enhanced styling
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            },
            sequence: {
                diagramMarginX: 50,
                diagramMarginY: 10,
                actorMargin: 50,
                width: 150,
                height: 65,
                boxMargin: 10,
                boxTextMargin: 5,
                noteMargin: 10,
                messageMargin: 35,
                mirrorActors: true,
                bottomMarginAdj: 1,
                useMaxWidth: true,
                rightAngles: false,
                showSequenceNumbers: false
            },
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif'
        });
        
        // Add custom styling to Mermaid diagrams
        const mermaidDiagrams = document.querySelectorAll('.mermaid');
        mermaidDiagrams.forEach((diagram, index) => {
            // Add loading animation
            diagram.style.opacity = '0';
            diagram.style.transform = 'translateY(20px)';
            
            // Animate diagrams on scroll
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, index * 200);
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(diagram);
            
            // Add hover effects
            diagram.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-4px) scale(1.01)';
            });
            
            diagram.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    // Enhanced code block functionality
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        // Add copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.setAttribute('aria-label', 'Copy code');
        
        copyButton.addEventListener('click', function() {
            navigator.clipboard.writeText(block.textContent).then(() => {
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.style.background = 'var(--accent-color)';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i>';
                    this.style.background = '';
                }, 2000);
            });
        });
        
        block.parentNode.style.position = 'relative';
        block.parentNode.appendChild(copyButton);
    });
    
    // Add CSS for copy button
    const copyButtonStyles = document.createElement('style');
    copyButtonStyles.textContent = `
        .copy-code-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: 0;
        }
        
        pre:hover .copy-code-btn {
            opacity: 1;
        }
        
        .copy-code-btn:hover {
            background: var(--accent-color);
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(copyButtonStyles);
    
    // Enhanced table of contents
    const toc = document.querySelector('#toc');
    if (toc) {
        const tocLinks = toc.querySelectorAll('a');
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        // Highlight current section in TOC
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('id');
                const tocLink = toc.querySelector(`a[href="#${id}"]`);
                
                if (entry.isIntersecting) {
                    tocLinks.forEach(link => link.classList.remove('active'));
                    if (tocLink) tocLink.classList.add('active');
                }
            });
        }, { threshold: 0.5 });
        
        headings.forEach(heading => observer.observe(heading));
        
        // Add smooth scrolling to TOC links
        tocLinks.forEach(link => {
            link.addEventListener('click', function(e) {
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
    }
    
    // Add reading time calculation
    const postContent = document.querySelector('.post-content, .content');
    if (postContent) {
        const text = postContent.textContent;
        const wordCount = text.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed
        
        const readingTimeElement = document.createElement('div');
        readingTimeElement.className = 'reading-time';
        readingTimeElement.innerHTML = `<i class="fas fa-clock"></i> ${readingTime} min read`;
        
        // Insert after the title
        const title = document.querySelector('h1');
        if (title) {
            title.parentNode.insertBefore(readingTimeElement, title.nextSibling);
        }
    }
    
    // Enhanced security badges
    const securityBadges = document.querySelectorAll('.security-badge');
    securityBadges.forEach(badge => {
        badge.addEventListener('click', function() {
            // Add pulse animation
            this.style.animation = 'pulse 0.6s ease-in-out';
            setTimeout(() => {
                this.style.animation = '';
            }, 600);
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('#search-input, input[type="search"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape to close modals/sidebar
        if (e.key === 'Escape') {
            const sidebar = document.querySelector('#sidebar');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
    });
}); 