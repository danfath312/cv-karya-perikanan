// =====================================================
// CV KARYA PERIKANAN INDONESIA - JavaScript
// Main JavaScript File
// =====================================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // =====================================================
    // MOBILE MENU TOGGLE
    // =====================================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
    
    // =====================================================
    // NAVBAR SCROLL EFFECT
    // =====================================================
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add shadow on scroll
        if (currentScroll > 50) {
            navbar.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }
        
        lastScroll = currentScroll;
    });
    
    // =====================================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // =====================================================
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if href is just "#"
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // =====================================================
    // ORDER FORM HANDLING (WhatsApp Integration)
    // =====================================================
    const orderForm = document.getElementById('orderForm');
    
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const nama = document.getElementById('nama').value.trim();
            const whatsapp = document.getElementById('whatsapp').value.trim();
            const email = document.getElementById('email').value.trim();
            const produk = document.getElementById('produk').value;
            const jumlah = document.getElementById('jumlah').value;
            const alamat = document.getElementById('alamat').value.trim();
            const catatan = document.getElementById('catatan').value.trim();
            
            // Validate required fields
            if (!nama || !whatsapp || !produk || !jumlah || !alamat) {
                alert('Mohon lengkapi semua field yang wajib diisi (*)');
                return;
            }
            
            // Validate phone number (basic)
            const phoneRegex = /^[0-9]{10,13}$/;
            const cleanPhone = whatsapp.replace(/[-\s]/g, '');
            
            if (!phoneRegex.test(cleanPhone)) {
                alert('Nomor WhatsApp tidak valid. Gunakan format: 08xxxxxxxxxx');
                return;
            }
            
            // Format WhatsApp message
            let message = `*PESANAN BARU - CV KARYA PERIKANAN INDONESIA*\n\n`;
            message += `📋 *Detail Pesanan:*\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Nama: ${nama}\n`;
            message += `📱 WhatsApp: ${whatsapp}\n`;
            
            if (email) {
                message += `📧 Email: ${email}\n`;
            }
            
            message += `\n🐟 *Produk:* ${produk}\n`;
            message += `📦 *Jumlah:* ${jumlah} kg\n`;
            message += `\n📍 *Alamat Pengiriman:*\n${alamat}\n`;
            
            if (catatan) {
                message += `\n📝 *Catatan:*\n${catatan}\n`;
            }
            
            message += `\n━━━━━━━━━━━━━━━━━━━━\n`;
            message += `Mohon konfirmasi ketersediaan dan harga. Terima kasih! 🙏`;
            
            // Encode message for URL
            const encodedMessage = encodeURIComponent(message);
            
            // WhatsApp number (format: country code + number without leading 0)
            const waNumber = '6287808228699';
            
            // Create WhatsApp URL
            const waURL = `https://wa.me/${waNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp in new tab
            window.open(waURL, '_blank');
            
            // Show success message
            alert('Anda akan diarahkan ke WhatsApp untuk mengirim pesanan');
            
            // Optional: Reset form after submit
            // orderForm.reset();
        });
        
        // Real-time phone number formatting
        const whatsappInput = document.getElementById('whatsapp');
        if (whatsappInput) {
            whatsappInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                // Limit to 13 digits
                if (value.length > 13) {
                    value = value.slice(0, 13);
                }
                
                // Format: 08xx-xxxx-xxxx
                if (value.length > 4 && value.length <= 8) {
                    value = value.slice(0, 4) + '-' + value.slice(4);
                } else if (value.length > 8) {
                    value = value.slice(0, 4) + '-' + value.slice(4, 8) + '-' + value.slice(8);
                }
                
                e.target.value = value;
            });
        }
        
        // Number input validation
        const jumlahInput = document.getElementById('jumlah');
        if (jumlahInput) {
            jumlahInput.addEventListener('input', function(e) {
                if (e.target.value < 1) {
                    e.target.value = 1;
                }
            });
        }
    }
    
    // =====================================================
    // SCROLL ANIMATIONS (Fade In on Scroll)
    // =====================================================
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
    const animatedElements = document.querySelectorAll('.product-card, .vm-card, .stat-card, .contact-item');
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
    
    // =====================================================
    // BACK TO TOP BUTTON
    // =====================================================
    const createBackToTopButton = () => {
        const button = document.createElement('button');
        button.innerHTML = '↑';
        button.className = 'back-to-top';
        button.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-blue);
            color: white;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(button);
        
        // Show/hide button on scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                button.style.opacity = '1';
                button.style.visibility = 'visible';
            } else {
                button.style.opacity = '0';
                button.style.visibility = 'hidden';
            }
        });
        
        // Scroll to top on click
        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Hover effect
        button.addEventListener('mouseenter', () => {
            button.style.background = 'var(--dark-blue)';
            button.style.transform = 'translateY(-5px)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = 'var(--primary-blue)';
            button.style.transform = 'translateY(0)';
        });
    };
    
    createBackToTopButton();
    
    // =====================================================
    // LOADING ANIMATION
    // =====================================================
    window.addEventListener('load', function() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 100);
    });
    
    // =====================================================
    // PREVENT FORM DOUBLE SUBMISSION
    // =====================================================
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                setTimeout(() => {
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    });
    
    // =====================================================
    // CONSOLE MESSAGE
    // =====================================================
    console.log('%c CV Karya Perikanan Indonesia ', 'background: #0066B3; color: white; font-size: 16px; padding: 10px;');
    console.log('%c Website Company Profile ', 'background: #004C8C; color: white; font-size: 12px; padding: 5px;');
    console.log('%c Pengolahan Limbah Perikanan Berkualitas ', 'color: #0066B3; font-size: 12px;');
    
});

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Format currency (IDR)
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format phone number
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{4})(\d{4})(\d{4})$/);
    
    if (match) {
        return match[1] + '-' + match[2] + '-' + match[3];
    }
    
    return phone;
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Berhasil disalin ke clipboard!');
        }).catch(err => {
            console.error('Gagal menyalin:', err);
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            alert('Berhasil disalin ke clipboard!');
        } catch (err) {
            console.error('Gagal menyalin:', err);
        }
        
        document.body.removeChild(textArea);
    }
}

// Get current year (for copyright)
function getCurrentYear() {
    return new Date().getFullYear();
}

// Update copyright year
window.addEventListener('load', function() {
    const copyrightElements = document.querySelectorAll('.footer-bottom p');
    copyrightElements.forEach(element => {
        const text = element.textContent;
        if (text.includes('2026')) {
            element.textContent = text.replace('2026', getCurrentYear());
        }
    });
});

// =====================================================
// GALLERY CAROUSEL
// =====================================================
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;

function moveCarousel(direction) {
    currentSlide += direction;
    
    // Loop carousel
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    
    // Update carousel position
    const carouselTrack = document.getElementById('carouselTrack');
    if (carouselTrack) {
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
}

