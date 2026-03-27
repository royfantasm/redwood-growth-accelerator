/* Redwood Growth Accelerator - Main JavaScript */

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!menuToggle.contains(event.target) && !navLinks.contains(event.target)) {
                navLinks.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                navLinks.classList.remove('active');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                event.preventDefault();
                
                // Track anchor link clicks
                if (typeof trackFunnelStep === 'function') {
                    trackFunnelStep('awareness', 'anchor_click', targetId);
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form handling
    setupForms();
    
    // Tier card interactions
    setupTierCards();
    
    // Testimonial carousel (if needed)
    setupTestimonials();
    
    // Resource download handling
    setupResourceDownloads();
    
    // Animation on scroll
    setupScrollAnimations();
});

// Form Handling
function setupForms() {
    const forms = document.querySelectorAll('.lead-form, .contact-form');
    
    forms.forEach(form => {
        // Add form ID if not present
        if (!form.id) {
            form.id = `form_${Date.now()}`;
        }
        
        // Add data attribute for tracking
        form.setAttribute('data-form-id', form.id);
        
        // Handle form submission
        form.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            try {
                // Simulate API call - replace with actual form submission
                await simulateFormSubmission(formData);
                
                // Show success message
                showFormMessage(this, 'success', 'Thank you! Your message has been sent successfully.');
                
                // Reset form
                this.reset();
                
                // Track successful submission
                if (typeof trackFunnelStep === 'function') {
                    trackFunnelStep('conversion', 'form_success', this.id);
                }
                
            } catch (error) {
                // Show error message
                showFormMessage(this, 'error', 'Sorry, there was an error sending your message. Please try again.');
                
                // Track failed submission
                if (typeof trackFunnelStep === 'function') {
                    trackFunnelStep('consideration', 'form_error', this.id);
                }
                
                console.error('Form submission error:', error);
            } finally {
                // Restore button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    });
}

// Simulate form submission (replace with actual API call)
async function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate 90% success rate
            if (Math.random() > 0.1) {
                resolve({ success: true });
            } else {
                reject(new Error('Simulated server error'));
            }
        }, 1500);
    });
}

// Show form message
function showFormMessage(form, type, message) {
    // Remove existing messages
    const existingMessage = form.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Insert after form or before submit button
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.parentNode.insertBefore(messageDiv, submitButton);
    } else {
        form.appendChild(messageDiv);
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Field validation
function validateField(field) {
    if (!field.value.trim()) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (field.type === 'email' && !isValidEmail(field.value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    field.classList.add('error');
}

function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
    field.classList.remove('error');
}

// Tier Card Interactions
function setupTierCards() {
    const tierCards = document.querySelectorAll('.tier-card');
    
    tierCards.forEach(card => {
        // Add hover effects
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(-8px)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(0)';
            }
        });
        
        // Click tracking
        const links = card.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function(event) {
                const tierTitle = card.querySelector('.tier-title').textContent;
                if (typeof trackFunnelStep === 'function') {
                    trackFunnelStep('consideration', 'tier_cta_click', tierTitle);
                }
            });
        });
    });
}

// Testimonial Carousel
function setupTestimonials() {
    const testimonialContainer = document.querySelector('.testimonials');
    if (!testimonialContainer || testimonialContainer.children.length <= 1) return;
    
    // Only set up carousel if there are multiple testimonials
    if (testimonialContainer.children.length > 1) {
        let currentIndex = 0;
        const testimonials = Array.from(testimonialContainer.children);
        const totalTestimonials = testimonials.length;
        
        // Create navigation dots
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'testimonial-dots';
        
        for (let i = 0; i < totalTestimonials; i++) {
            const dot = document.createElement('button');
            dot.className = `testimonial-dot ${i === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `View testimonial ${i + 1}`);
            dot.addEventListener('click', () => showTestimonial(i));
            dotsContainer.appendChild(dot);
        }
        
        testimonialContainer.parentNode.appendChild(dotsContainer);
        
        // Show specific testimonial
        function showTestimonial(index) {
            testimonials.forEach((testimonial, i) => {
                testimonial.style.display = i === index ? 'block' : 'none';
            });
            
            // Update dots
            dotsContainer.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            currentIndex = index;
        }
        
        // Auto-rotate every 5 seconds
        setInterval(() => {
            currentIndex = (currentIndex + 1) % totalTestimonials;
            showTestimonial(currentIndex);
        }, 5000);
        
        // Show first testimonial initially
        showTestimonial(0);
    }
}

// Resource Download Handling
function setupResourceDownloads() {
    const downloadLinks = document.querySelectorAll('a[data-resource-download]');
    
    downloadLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const resourceName = this.getAttribute('data-resource-download');
            const resourceType = this.getAttribute('data-resource-type') || 'template';
            
            // Track download
            if (typeof trackResourceDownload === 'function') {
                trackResourceDownload(resourceName, resourceType);
            }
            
            // Show download confirmation
            showDownloadConfirmation(resourceName);
        });
    });
}

function showDownloadConfirmation(resourceName) {
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'download-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
            <div class="modal-icon">
                <i class="fas fa-file-download"></i>
            </div>
            <h3>Download Started!</h3>
            <p>Your "${resourceName}" is being downloaded. Check your downloads folder.</p>
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="this.closest('.download-modal').remove()">
                    Continue Browsing
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on click outside or close button
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 5000);
}

// Scroll Animations
function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.tier-card, .testimonial, .stat');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .tier-card, .testimonial, .stat {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .tier-card.animate-in,
    .testimonial.animate-in,
    .stat.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .tier-card:nth-child(1) { transition-delay: 0.1s; }
    .tier-card:nth-child(2) { transition-delay: 0.2s; }
    .tier-card:nth-child(3) { transition-delay: 0.3s; }
    
    .form-message {
        padding: 12px 16px;
        border-radius: 8px;
        margin: 16px 0;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    }
    
    .form-message-success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .form-message-error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .field-error {
        color: #dc3545;
        font-size: 14px;
        margin-top: 4px;
    }
    
    input.error,
    textarea.error {
        border-color: #dc3545 !important;
    }
    
    .download-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    }
    
    .modal-content {
        background-color: white;
        padding: 32px;
        border-radius: 16px;
        max-width: 400px;
        width: 90%;
        position: relative;
        animation: slideUp 0.3s ease;
    }
    
    .modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 20px;
        color: #666;
        cursor: pointer;
    }
    
    .modal-icon {
        text-align: center;
        font-size: 48px;
        color: #2e7d32;
        margin-bottom: 20px;
    }
    
    .modal-actions {
        margin-top: 24px;
        text-align: center;
    }
    
    .testimonial-dots {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 24px;
    }
    
    .testimonial-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: none;
        background-color: #e0e0e0;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    
    .testimonial-dot.active {
        background-color: #2e7d32;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

document.head.appendChild(style);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupForms,
        setupTierCards,
        setupTestimonials,
        setupResourceDownloads,
        setupScrollAnimations
    };
}