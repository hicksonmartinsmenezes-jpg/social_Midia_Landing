// ==================== CARROSSEL DE SERVIÇOS ====================
class ServicesCarousel {
    constructor() {
        this.track = document.querySelector('.services-track');
        this.prevBtn = document.querySelector('.carousel-prev');
        this.nextBtn = document.querySelector('.carousel-next');
        this.dotsContainer = document.querySelector('.carousel-dots');
        this.carousel = document.querySelector('.services-carousel');
        
        if (!this.track) return;
        
        this.cards = Array.from(this.track.children);
        this.cardWidth = this.cards[0]?.getBoundingClientRect().width || 300;
        this.gap = 32; // gap em pixels
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.isDragging = false;
        this.startPos = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        
        this.init();
    }


    
    
    init() {
        this.setupCarousel();
        this.setupEventListeners();
        this.createDots();
        this.updateDots();
        this.startAutoPlay();
        this.setupDragScroll();
        this.handleResize();
    }
    
    setupCarousel() {
        // Configurar largura dos cards
        this.updateCardWidth();
        
        // Clonar primeiro e último card para loop infinito (opcional)
        // this.setupInfiniteLoop();
    }
    
    updateCardWidth() {
        const containerWidth = this.carousel?.parentElement?.offsetWidth || 1200;
        let cardsPerView = 3;
        
        if (window.innerWidth <= 968) cardsPerView = 2;
        if (window.innerWidth <= 768) cardsPerView = 1;
        
        const newCardWidth = (containerWidth - (this.gap * (cardsPerView - 1))) / cardsPerView;
        
        this.cards.forEach(card => {
            card.style.flex = `0 0 ${newCardWidth}px`;
        });
        
        this.cardWidth = newCardWidth;
        this.goToSlide(this.currentIndex, false);
    }
    
    setupEventListeners() {
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        window.addEventListener('resize', () => this.handleResize());
        
        // Pausar autoplay ao passar mouse
        this.carousel?.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.carousel?.addEventListener('mouseleave', () => this.startAutoPlay());
    }
    
    setupDragScroll() {
        if (!this.carousel) return;
        
        this.carousel.addEventListener('mousedown', (e) => this.dragStart(e));
        this.carousel.addEventListener('mousemove', (e) => this.dragMove(e));
        this.carousel.addEventListener('mouseup', () => this.dragEnd());
        this.carousel.addEventListener('mouseleave', () => this.dragEnd());
        
        // Touch events para mobile
        this.carousel.addEventListener('touchstart', (e) => this.dragStart(e));
        this.carousel.addEventListener('touchmove', (e) => this.dragMove(e));
        this.carousel.addEventListener('touchend', () => this.dragEnd());
    }
    
    dragStart(e) {
        this.isDragging = true;
        this.startPos = this.getPositionX(e);
        this.prevTranslate = this.currentTranslate;
        this.carousel.style.cursor = 'grabbing';
        this.stopAutoPlay();
    }
    
    dragMove(e) {
        if (!this.isDragging) return;
        
        const currentPosition = this.getPositionX(e);
        const diff = currentPosition - this.startPos;
        this.currentTranslate = this.prevTranslate + diff;
        
        // Aplicar transform
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    }
    
    dragEnd() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.carousel.style.cursor = 'grab';
        
        const movedBy = this.currentTranslate - this.prevTranslate;
        const cardWidthWithGap = this.cardWidth + this.gap;
        const threshold = cardWidthWithGap / 4;
        
        if (Math.abs(movedBy) > threshold) {
            if (movedBy > 0) {
                this.prevSlide();
            } else {
                this.nextSlide();
            }
        } else {
            this.goToSlide(this.currentIndex);
        }
        
        this.startAutoPlay();
    }
    
    getPositionX(e) {
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        return clientX;
    }
    
    nextSlide() {
        if (this.currentIndex < this.cards.length - this.getCardsPerView()) {
            this.goToSlide(this.currentIndex + 1);
        } else {
            // Voltar ao início (efeito infinito)
            this.goToSlide(0);
        }
    }
    
    prevSlide() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        } else {
            // Ir para o final (efeito infinito)
            this.goToSlide(this.cards.length - this.getCardsPerView());
        }
    }
    
    goToSlide(index, animate = true) {
        const cardsPerView = this.getCardsPerView();
        const maxIndex = Math.max(0, this.cards.length - cardsPerView);
        this.currentIndex = Math.min(Math.max(0, index), maxIndex);
        
        const cardWidthWithGap = this.cardWidth + this.gap;
        const translateX = -(this.currentIndex * cardWidthWithGap);
        
        this.currentTranslate = translateX;
        
        if (animate) {
            this.track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        } else {
            this.track.style.transition = 'none';
        }
        
        this.track.style.transform = `translateX(${translateX}px)`;
        
        // Reset transition após animação
        setTimeout(() => {
            if (this.track) {
                this.track.style.transition = '';
            }
        }, 500);
        
        this.updateDots();
        this.updateButtonsState();
    }
    
    getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 968) return 2;
        return 3;
    }
    
    updateButtonsState() {
        const cardsPerView = this.getCardsPerView();
        const isAtStart = this.currentIndex === 0;
        const isAtEnd = this.currentIndex >= this.cards.length - cardsPerView;
        
        if (this.prevBtn) {
            this.prevBtn.style.opacity = isAtStart ? '0.5' : '1';
            this.prevBtn.style.cursor = isAtStart ? 'not-allowed' : 'pointer';
        }
        
        if (this.nextBtn) {
            this.nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
            this.nextBtn.style.cursor = isAtEnd ? 'not-allowed' : 'pointer';
        }
    }
    
    createDots() {
        if (!this.dotsContainer) return;
        
        const cardsPerView = this.getCardsPerView();
        const dotsCount = Math.ceil(this.cards.length / cardsPerView);
        
        this.dotsContainer.innerHTML = '';
        
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            dot.addEventListener('click', () => {
                this.goToSlide(i * cardsPerView);
                this.startAutoPlay();
            });
            this.dotsContainer.appendChild(dot);
        }
    }
    
    updateDots() {
        if (!this.dotsContainer) return;
        
        const cardsPerView = this.getCardsPerView();
        const currentDotIndex = Math.floor(this.currentIndex / cardsPerView);
        const dots = this.dotsContainer.children;
        
        Array.from(dots).forEach((dot, index) => {
            dot.classList.toggle('active', index === currentDotIndex);
        });
    }
    
    startAutoPlay() {
        if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
        
        this.autoPlayInterval = setInterval(() => {
            if (!this.isDragging) {
                this.nextSlide();
            }
        }, 5000);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.updateCardWidth();
            this.createDots();
            this.goToSlide(this.currentIndex, false);
        }, 250);
    }
}

// ==================== MOBILE MENU ====================
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        mobileMenu.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        
        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
}

document.addEventListener('click', (e) => {
    if (navLinks && navLinks.classList.contains('active')) {
        if (!navLinks.contains(e.target) && !mobileMenu.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileMenu.textContent = '☰';
            document.body.style.overflow = '';
        }
    }
});

// ==================== SCROLL SUAVE ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenu.textContent = '☰';
                document.body.style.overflow = '';
            }
            
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('load', () => {
    document.querySelector('.loader').classList.add('hidden');
});
// ==================== FUNÇÕES GLOBAIS ====================
function scrollToContact() {
    const contactSection = document.getElementById('contato');
    if (contactSection) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = contactSection.offsetTop - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
}

function scrollToServices() {
    const servicesSection = document.getElementById('servicos');
    if (servicesSection) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = servicesSection.offsetTop - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
}

// ==================== FORMULÁRIO ====================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nome = this.querySelector('input[placeholder*="nome"]')?.value.trim();
        const email = this.querySelector('input[type="email"]')?.value.trim();
        
        if (!nome || !email) {
            alert('✨ Por favor, preencha seu nome e e-mail ✨');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('📧 Por favor, insira um e-mail válido');
            return;
        }
        
        alert(`✨ Obrigado ${nome}! Em até 24h um de nossos especialistas entrará em contato. ✨`);
        this.reset();
    });
}

// ==================== ANIMAÇÕES SCROLL ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.case-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ==================== DETECTAR SEÇÃO ATIVA ====================
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

function updateActiveSection() {
    let current = '';
    const scrollPosition = window.scrollY + 150;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', () => {
    requestAnimationFrame(updateActiveSection);
});

// ==================== HEADER SCROLL EFFECT ====================
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    }
});

// ==================== INICIALIZAR CARROSSEL ====================
let servicesCarousel;
document.addEventListener('DOMContentLoaded', () => {
    servicesCarousel = new ServicesCarousel();
});

// ==================== RESIZE HANDLER ====================
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenu.textContent = '☰';
            document.body.style.overflow = '';
        }
    }, 250);
});

console.log('✨ Domínio Digital - Carrossel de serviços ativado! ✨');

