/* Redwood Growth Accelerator - Tracking Implementation */

// Funnel Step Tracking
function trackFunnelStep(step, action, label, value = null) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        const eventParams = {
            'event_category': 'funnel',
            'event_label': label,
            'funnel_step': step
        };
        
        if (value !== null) {
            eventParams.value = value;
        }
        
        gtag('event', action, eventParams);
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('trackCustom', 'FunnelStep', {
            step: step,
            action: action,
            label: label,
            value: value
        });
    }
    
    // Console log for debugging
    console.log(`[Funnel Tracking] ${step} - ${action} - ${label}${value ? ` - ${value}` : ''}`);
    
    // Send to dataLayer for GTM
    if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
            'event': 'funnel_interaction',
            'funnel_step': step,
            'action': action,
            'label': label,
            'value': value
        });
    }
}

// Form Tracking
function trackFormInteraction(formId, fieldName, action = 'field_start') {
    trackFunnelStep('consideration', `form_${action}`, `${formId}_${fieldName}`);
    
    // Store in session storage to track form abandonment
    if (action === 'field_start') {
        const formState = JSON.parse(sessionStorage.getItem('form_state') || '{}');
        formState[formId] = formState[formId] || {};
        formState[formId][fieldName] = true;
        sessionStorage.setItem('form_state', JSON.stringify(formState));
    }
}

// Resource Download Tracking
function trackResourceDownload(resourceName, resourceType = 'template') {
    trackFunnelStep('interest', 'resource_download', `${resourceType}_${resourceName}`);
    
    // Track in localStorage for returning visitors
    const downloads = JSON.parse(localStorage.getItem('resource_downloads') || '[]');
    downloads.push({
        name: resourceName,
        type: resourceType,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('resource_downloads', JSON.stringify(downloads));
}

// Page Engagement Tracking
function trackPageEngagement() {
    // Time on page
    let timeStart = Date.now();
    
    window.addEventListener('beforeunload', function() {
        const timeSpent = Math.round((Date.now() - timeStart) / 1000);
        if (timeSpent > 5) { // Only track if spent more than 5 seconds
            trackFunnelStep('awareness', 'time_on_page', document.title, timeSpent);
        }
    });
    
    // Scroll depth tracking
    let scroll25 = false, scroll50 = false, scroll75 = false, scroll100 = false;
    
    window.addEventListener('scroll', function() {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        if (!scroll25 && scrollPercent >= 25) {
            trackFunnelStep('awareness', 'scroll_25p', document.title);
            scroll25 = true;
        }
        if (!scroll50 && scrollPercent >= 50) {
            trackFunnelStep('interest', 'scroll_50p', document.title);
            scroll50 = true;
        }
        if (!scroll75 && scrollPercent >= 75) {
            trackFunnelStep('consideration', 'scroll_75p', document.title);
            scroll75 = true;
        }
        if (!scroll100 && scrollPercent >= 95) { // 95% to account for rounding
            trackFunnelStep('consideration', 'scroll_100p', document.title);
            scroll100 = true;
        }
    });
}

// Button Click Tracking (auto-attach to buttons with data-track attribute)
function setupButtonTracking() {
    document.addEventListener('click', function(event) {
        const button = event.target.closest('[data-track]');
        if (button) {
            const trackData = button.getAttribute('data-track');
            const [step, action, label] = trackData.split('|');
            
            if (step && action && label) {
                trackFunnelStep(step, action, label);
            }
        }
    });
}

// Form Submission Tracking
function setupFormTracking() {
    const forms = document.querySelectorAll('form[data-form-id]');
    
    forms.forEach(form => {
        const formId = form.getAttribute('data-form-id');
        
        // Track form views
        if (isElementInViewport(form)) {
            trackFunnelStep('consideration', 'form_view', formId);
        } else {
            // Use Intersection Observer to track when form comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        trackFunnelStep('consideration', 'form_view', formId);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(form);
        }
        
        // Track field interactions
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            field.addEventListener('focus', function() {
                trackFormInteraction(formId, this.name || this.id, 'field_focus');
            });
            
            field.addEventListener('input', function() {
                if (this.value.trim().length > 0) {
                    trackFormInteraction(formId, this.name || this.id, 'field_input');
                }
            });
        });
        
        // Track form submission
        form.addEventListener('submit', function(event) {
            // Allow form to submit naturally, then track
            setTimeout(() => {
                trackFunnelStep('conversion', 'form_submit', formId);
                
                // Track form completion rate
                const formState = JSON.parse(sessionStorage.getItem('form_state') || '{}');
                if (formState[formId]) {
                    const fieldCount = Object.keys(formState[formId]).length;
                    trackFunnelStep('conversion', 'form_completion', formId, fieldCount);
                }
            }, 100);
        });
    });
}

// Helper function to check if element is in viewport
function isElementInViewport(el) {
    if (!el) return false;
    
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Video Play Tracking
function setupVideoTracking() {
    const videos = document.querySelectorAll('video[data-video-id]');
    
    videos.forEach(video => {
        const videoId = video.getAttribute('data-video-id');
        
        video.addEventListener('play', function() {
            trackFunnelStep('interest', 'video_play', videoId);
        });
        
        video.addEventListener('pause', function() {
            const percentPlayed = Math.round((this.currentTime / this.duration) * 100);
            trackFunnelStep('interest', 'video_pause', videoId, percentPlayed);
        });
        
        video.addEventListener('ended', function() {
            trackFunnelStep('interest', 'video_complete', videoId);
        });
        
        // Track 25%, 50%, 75% playback
        [25, 50, 75].forEach(percent => {
            video.addEventListener('timeupdate', function() {
                const currentPercent = Math.round((this.currentTime / this.duration) * 100);
                if (currentPercent >= percent && currentPercent < percent + 5) {
                    trackFunnelStep('interest', `video_${percent}p`, videoId);
                }
            });
        });
    });
}

// External Link Tracking
function setupExternalLinkTracking() {
    document.addEventListener('click', function(event) {
        const link = event.target.closest('a[href^="http"]');
        if (link && !link.href.includes(window.location.hostname)) {
            trackFunnelStep('awareness', 'external_link_click', link.href);
            
            // Delay navigation to ensure tracking fires
            event.preventDefault();
            setTimeout(() => {
                window.location.href = link.href;
            }, 100);
        }
    });
}

// Initialize all tracking
document.addEventListener('DOMContentLoaded', function() {
    // Track initial page view
    trackFunnelStep('awareness', 'page_view', document.title);
    
    // Set up tracking
    trackPageEngagement();
    setupButtonTracking();
    setupFormTracking();
    setupVideoTracking();
    setupExternalLinkTracking();
    
    // Track returning visitors
    const returningVisitor = localStorage.getItem('returning_visitor');
    if (returningVisitor) {
        trackFunnelStep('awareness', 'returning_visitor', document.title);
    } else {
        localStorage.setItem('returning_visitor', 'true');
        trackFunnelStep('awareness', 'new_visitor', document.title);
    }
    
    // Track previous downloads for returning visitors
    const downloads = JSON.parse(localStorage.getItem('resource_downloads') || '[]');
    if (downloads.length > 0) {
        trackFunnelStep('interest', 'returning_with_downloads', document.title, downloads.length);
    }
    
    console.log('Redwood Growth Accelerator tracking initialized');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        trackFunnelStep,
        trackFormInteraction,
        trackResourceDownload,
        trackPageEngagement
    };
}