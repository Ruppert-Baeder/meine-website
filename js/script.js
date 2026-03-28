// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Change icon
            if (navMenu.classList.contains('active')) {
                menuToggle.textContent = '✕';
                menuToggle.setAttribute('aria-label', 'Menü schließen');
            } else {
                menuToggle.textContent = '☰';
                menuToggle.setAttribute('aria-label', 'Menü öffnen');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                navMenu.classList.remove('active');
                menuToggle.textContent = '☰';
                menuToggle.setAttribute('aria-label', 'Menü öffnen');
            }
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                menuToggle.textContent = '☰';
                menuToggle.setAttribute('aria-label', 'Menü öffnen');
            });
        });
    }
});

// Smooth Scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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

// Form Validation and Submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Basic validation
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        const privacy = document.getElementById('privacy').checked;
        
        if (!name || !email || !message) {
            showFormMessage('Bitte füllen Sie alle Pflichtfelder aus.', 'error');
            return;
        }
        
        if (!privacy) {
            showFormMessage('Bitte akzeptieren Sie die Datenschutzerklärung.', 'error');
            return;
        }
        
        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showFormMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.', 'error');
            return;
        }
        
        // Honeypot check (spam protection)
        const honeypot = document.getElementById('honeypot');
        if (honeypot && honeypot.value !== '') {
            // Bot detected - show success but don't send
            showFormMessage('Vielen Dank für Ihre Nachricht!', 'success');
            contactForm.reset();
            return;
        }
        
        // Disable button during send
        const submitButton = contactForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        // Collect form data and send via Web3Forms
        const formData = new FormData(contactForm);
        formData.append('access_key', '37946f78-c6b8-4faf-9df0-9e53851018e1');

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Trigger send animation
                submitButton.classList.add('sent');
                showFormMessage('Vielen Dank für Ihre Nachricht! Wir melden uns bald bei Ihnen.', 'success');
                contactForm.reset();
                // Reset button state after animation
                setTimeout(() => submitButton.classList.remove('sent'), 3500);
            } else {
                showFormMessage('Fehler: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Fehler:', error);
            showFormMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut oder rufen Sie uns direkt an: 05441-5929780', 'error');
        } finally {
            submitButton.disabled = false;
        }
    });
}

// Function to show form messages
function showFormMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message form-message-' + type;
    messageDiv.textContent = message;
    
    // Insert before submit button
    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.parentNode.insertBefore(messageDiv, submitButton);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 8000);
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Contact Switch Tabs
document.addEventListener('DOMContentLoaded', function() {
    const tabs = {
        'cyber-opt-1': 'tab-formular',
        'cyber-opt-2': 'tab-whatsapp',
        'cyber-opt-3': 'tab-telefon'
    };

    Object.entries(tabs).forEach(([radioId, panelId]) => {
        const radio = document.getElementById(radioId);
        if (!radio) return;
        radio.addEventListener('change', function() {
            Object.values(tabs).forEach(id => {
                const panel = document.getElementById(id);
                if (panel) panel.hidden = true;
            });
            const active = document.getElementById(panelId);
            if (active) active.hidden = false;
        });
    });
});

// Add active class to current page nav link
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// Phone Popup — zeigt Nummer als anklickbaren Link beim Klick auf tel:-Buttons
(function() {
    // Popup-HTML einmalig erstellen
    var popup = document.createElement('div');
    popup.className = 'phone-popup';
    popup.innerHTML =
        '<div class="phone-popup-inner">' +
            '<button class="phone-popup-close" aria-label="Schließen">✕</button>' +
            '<div class="phone-popup-icon">📞</div>' +
            '<p class="phone-popup-label">Jetzt anrufen</p>' +
            '<a class="phone-popup-number" id="phonePopupLink" href="#"></a>' +
            '<p class="phone-popup-hint">Nummer antippen zum Anrufen</p>' +
        '</div>' +
        '<div class="phone-popup-backdrop"></div>';
    document.body.appendChild(popup);

    var popupLink  = popup.querySelector('#phonePopupLink');
    var closeBtn   = popup.querySelector('.phone-popup-close');
    var backdrop   = popup.querySelector('.phone-popup-backdrop');

    function openPopup(number, href) {
        popupLink.textContent = number;
        popupLink.href = href;
        popup.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closePopup() {
        popup.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    // Klick auf alle tel-Links abfangen
    document.querySelectorAll('a[data-phone]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openPopup(link.dataset.phone, link.href);
        });
    });

    closeBtn.addEventListener('click', closePopup);
    backdrop.addEventListener('click', closePopup);

    // ESC-Taste
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closePopup();
    });
}());