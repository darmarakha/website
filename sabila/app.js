// ================================================================
// LANGUAGE SYSTEM
// ================================================================
let currentLang = 'id';

function getSavedLang() {
    const saved = localStorage.getItem('portfolio-lang');
    if (saved && (saved === 'id' || saved === 'en')) return saved;
    const browser = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return browser.startsWith('id') ? 'id' : 'en';
}

function t(key) {
    const entry = T[key];
    if (!entry) return key;
    return entry[currentLang] || entry.id || key;
}

function applyLang(lang, animate) {
    currentLang = lang;
    localStorage.setItem('portfolio-lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const els = document.querySelectorAll('[data-i18n]');
    if (animate) {
        els.forEach(el => el.classList.add('i18n-fading'));
        setTimeout(() => {
            els.forEach(el => {
                el.innerHTML = t(el.dataset.i18n);
                el.classList.remove('i18n-fading');
            });
        }, 150);
    } else {
        els.forEach(el => { el.innerHTML = t(el.dataset.i18n); });
    }

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        const entry = T[key];
        if (entry) el.placeholder = entry[lang] || entry.id;
    });

    renderSkills();
    renderCerts();
    renderProjects();

    document.getElementById('toast-title').textContent = t('contact.toastTitle');
    document.getElementById('toast-desc').textContent = t('contact.toastDesc');
}

function switchLang(lang) {
    if (lang === currentLang) return;
    applyLang(lang, true);
    if (typeof menuOpen !== 'undefined' && menuOpen) toggleMenu(false);
}

// ================================================================
// RENDER DYNAMIC SECTIONS
// ================================================================
function renderSkills() {
    const grid = document.getElementById('skills-grid');
    grid.innerHTML = skillsData.map((s, i) => `
        <div class="skill-item p-4 sm:p-6 bg-navy-50/50 rounded-xl sm:rounded-2xl border border-navy-100 reveal visible">
            <div class="flex items-center justify-between mb-2 sm:mb-3">
                <div class="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div class="w-8 h-8 sm:w-10 sm:h-10 bg-accent-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i data-lucide="${s.icon}" class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500"></i>
                    </div>
                    <h3 class="font-semibold text-navy-900 text-sm sm:text-base truncate">${skillsI18n[s.key][currentLang]}</h3>
                </div>
                <span class="text-xs sm:text-sm font-bold text-accent-500 flex-shrink-0 ml-2">${s.pct}%</span>
            </div>
            <div class="h-2 sm:h-2.5 bg-navy-100 rounded-full overflow-hidden">
                <div class="progress-fill h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full" data-width="${s.pct}" style="width:${s.pct}%"></div>
            </div>
        </div>
    `).join('');

    const badges = document.getElementById('skill-badges');
    badges.innerHTML = toolBadges.map(b =>
        `<span class="px-3 sm:px-4 py-1.5 sm:py-2 bg-navy-900 text-white text-[10px] sm:text-xs font-medium rounded-full">${b}</span>`
    ).join('');

    lucide.createIcons();
}

function renderCerts() {
    const grid = document.getElementById('cert-grid');
    grid.innerHTML = certsData.map((c, i) => `
        <div class="cert-card group cursor-pointer bg-white/5 border ${c.featured ? 'border-accent-500/30' : 'border-white/10'} rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-sm reveal visible ${c.span}"
             onclick="openLightbox('${c.fullSrc || c.coverSrc || c.imgSrc || ''}','${certsI18n[c.titleKey][currentLang]}','${c.pdfSrc || ''}')">
            ${c.featured ? `<div class="relative"><div class="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 px-2 sm:px-3 py-0.5 sm:py-1 bg-accent-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg">${t('cert.featured')}</div>` : '<div>'}
            <div class="aspect-[4/3] overflow-hidden">
                <img src="${c.coverSrc || c.imgSrc || c.fullSrc || ''}" alt="${certsI18n[c.titleKey][currentLang]}" class="w-full h-full object-cover transition-transform duration-500" loading="lazy">
             onclick="openLightbox('${c.fullSrc}','${certsI18n[c.titleKey][currentLang]}','${c.pdfSrc || ''}')">
            ${c.featured ? `<div class="relative"><div class="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 px-2 sm:px-3 py-0.5 sm:py-1 bg-accent-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg">${t('cert.featured')}</div>` : '<div>'}
            <div class="aspect-[4/3] overflow-hidden">
                <img src="${c.imgSrc}" alt="${certsI18n[c.titleKey][currentLang]}" class="w-full h-full object-cover transition-transform duration-500" loading="lazy">
            </div>
            ${c.featured ? '</div>' : '</div>'}
            <div class="p-4 sm:p-6">
                <div class="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <i data-lucide="${c.tagIcon}" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-400"></i>
                    <span class="text-[10px] sm:text-xs font-medium text-accent-400 uppercase tracking-wider">${certsI18n[c.tagKey][currentLang]}</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2">${certsI18n[c.titleKey][currentLang]}</h3>
                <p class="text-xs sm:text-sm text-navy-300 leading-relaxed">${certsI18n[c.descKey][currentLang]}</p>
                <div class="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-accent-400 text-xs sm:text-sm font-medium">
                    <span>${t('cert.viewBtn')}</span>
                    <i data-lucide="expand" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
                </div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function renderProjects() {
    const grid = document.getElementById('proj-grid');
    if (!grid) return; // Prevent error if proj-grid element is missing
    grid.innerHTML = projData.map((p, i) => `
        <div class="project-card bg-white rounded-xl sm:rounded-2xl border border-navy-100 overflow-hidden reveal visible ${p.span}">
            <div class="aspect-[16/10] overflow-hidden bg-navy-50">
                <img src="${p.imgSrc}" alt="${projI18n[p.titleKey][currentLang]}" class="w-full h-full object-cover transition-transform duration-500" loading="lazy">
            </div>
            <div class="p-4 sm:p-6">
                <div class="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    ${p.tags.map(tag => `<span class="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-accent-500/10 text-accent-600 text-[10px] sm:text-xs font-medium rounded-md">${tag}</span>`).join('')}
                </div>
                <h3 class="text-base sm:text-lg font-bold text-navy-900 mb-1 sm:mb-2">${projI18n[p.titleKey][currentLang]}</h3>
                <p class="text-xs sm:text-sm text-navy-500 leading-relaxed">${projI18n[p.descKey][currentLang]}</p>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// ================================================================
// NAVBAR SCROLL & MOBILE MENU
// ================================================================
const navbar = document.getElementById('navbar');
const navLogoText = document.getElementById('nav-logo-text');
const navLinks = document.querySelectorAll('.nav-link');
const langToggles = document.querySelectorAll('.lang-toggle');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLoginBtn = document.getElementById('nav-login-btn');

function updateNavbar() {
    const scrolled = window.scrollY > 60;
    navbar.classList.toggle('bg-white/95', scrolled);
    navbar.classList.toggle('backdrop-blur-xl', scrolled);
    navbar.classList.toggle('shadow-lg', scrolled);
    navbar.classList.toggle('shadow-navy-900/5', scrolled);
    navbar.classList.toggle('bg-transparent', !scrolled);
    navLogoText.classList.toggle('text-navy-900', scrolled);
    navLogoText.classList.toggle('text-white', !scrolled);
    
    navLinks.forEach(l => {
        l.classList.toggle('text-navy-600', scrolled);
        l.classList.toggle('hover:text-navy-900', scrolled);
        l.classList.toggle('text-white/80', !scrolled);
        l.classList.toggle('hover:text-white', !scrolled);
    });

    if (navLoginBtn) {
        navLoginBtn.classList.toggle('text-navy-900', scrolled);
        navLoginBtn.classList.toggle('border-navy-200', scrolled);
        navLoginBtn.classList.toggle('hover:bg-navy-50', scrolled);
        navLoginBtn.classList.toggle('text-white', !scrolled);
        navLoginBtn.classList.toggle('border-white/20', !scrolled);
        navLoginBtn.classList.toggle('hover:bg-white/10', !scrolled);
    }

    langToggles.forEach(tog => tog.classList.toggle('scrolled', scrolled));
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('scrolled', scrolled);
    });
    
    mobileMenuBtn.classList.toggle('text-navy-900', scrolled);
    mobileMenuBtn.classList.toggle('hover:bg-navy-100', scrolled);
    mobileMenuBtn.classList.toggle('active:bg-navy-200', scrolled);
    mobileMenuBtn.classList.toggle('text-white', !scrolled);
    mobileMenuBtn.classList.toggle('hover:bg-white/10', !scrolled);
    mobileMenuBtn.classList.toggle('active:bg-white/20', !scrolled);
}
window.addEventListener('scroll', updateNavbar, { passive: true });

const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
const menuIconOpen = document.getElementById('menu-icon-open');
const menuIconClose = document.getElementById('menu-icon-close');
let menuOpen = false;

function toggleMenu(open) {
    menuOpen = typeof open === 'boolean' ? open : !menuOpen;
    if (menuOpen) {
        mobileMenu.classList.remove('translate-x-full');
        mobileMenuOverlay.classList.remove('hidden');
        requestAnimationFrame(() => mobileMenuOverlay.classList.add('opacity-100'));
        menuIconOpen.classList.add('hidden');
        menuIconClose.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        mobileMenu.classList.add('translate-x-full');
        mobileMenuOverlay.classList.remove('opacity-100');
        setTimeout(() => mobileMenuOverlay.classList.add('hidden'), 300);
        menuIconOpen.classList.remove('hidden');
        menuIconClose.classList.add('hidden');
        document.body.style.overflow = '';
    }
}
mobileMenuBtn.addEventListener('click', () => toggleMenu());
mobileMenuOverlay.addEventListener('click', () => toggleMenu(false));
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => toggleMenu(false)));

// ================================================================
// PARTICLES & SCROLL REVEAL & LIGHTBOX
// ================================================================
const particlesContainer = document.getElementById('particles');
const isMobile = window.innerWidth < 768;
function createParticle() {
    const p = document.createElement('div');
    p.classList.add('particle');
    const s = Math.random() * (isMobile ? 4 : 6) + 2;
    p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;bottom:-10px;animation-duration:${Math.random()*10+10}s`;
    particlesContainer.appendChild(p);
    setTimeout(() => p.remove(), 22000);
}
for (let i = 0; i < (isMobile ? 8 : 15); i++) setTimeout(createParticle, i * 400);
setInterval(createParticle, isMobile ? 2500 : 1500);

const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxPdf = document.getElementById('lightbox-pdf');

function detectSourceType(url) {
    const cleanUrl = (url || '').split('?')[0].split('#')[0].toLowerCase();
    if (cleanUrl.endsWith('.pdf')) return 'pdf';
    if (/\.(jpe?g|png)$/.test(cleanUrl)) return 'image';
    return '';
}

function openLightbox(src, title, pdfSrc = '') {
    const preferredPdf = (pdfSrc || '').trim();
    const fallbackSrc = (src || '').trim();
    const source = preferredPdf || fallbackSrc;

    if (!source) {
        console.warn('Certificate source is empty');
        return;
    }

    const sourceType = detectSourceType(source) || detectSourceType(fallbackSrc) || (preferredPdf ? 'pdf' : 'image');

    lightboxTitle.textContent = title;

    if (sourceType === 'pdf') {
        lightboxImg.classList.add('hidden');
        lightboxImg.src = '';
        lightboxPdf.classList.remove('hidden');
        lightboxPdf.src = source;
    } else {
        lightboxPdf.classList.add('hidden');
        lightboxPdf.src = '';
        lightboxImg.classList.remove('hidden');
        lightboxImg.src = source;
        lightboxImg.alt = title;
    }

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeLightbox(e) {
    if (e && e.target !== lightbox && !e.target.closest('button')) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lightboxImg.src = ''; lightboxPdf.src = ''; }, 300);
}
let touchStartY = 0;
lightbox.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
lightbox.addEventListener('touchend', e => { if (e.changedTouches[0].clientY - touchStartY > 80) { closeLightbox(); } }, { passive: true });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) { closeLightbox(); }
});

// ================================================================
// AUTH MODAL LOGIC (LOGIN / REGISTER)
// ================================================================
const authModal = document.getElementById('auth-modal');
const authCard = document.getElementById('auth-card');
const authForm = document.getElementById('auth-form');
const authNameGroup = document.getElementById('auth-name-group');
const authNameInput = document.getElementById('auth-name');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authSwitchText = document.getElementById('auth-switch-text');
const authSwitchBtn = document.getElementById('auth-switch-btn');
let isLoginMode = true;

function openAuthModal() {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        authCard.classList.remove('scale-95', 'opacity-0');
        authCard.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeAuthModal() {
    authCard.classList.remove('scale-100', 'opacity-100');
    authCard.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        authModal.classList.remove('active');
        document.body.style.overflow = '';
    }, 300);
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        authNameGroup.classList.add('hidden');
        authNameInput.required = false;
        authTitle.dataset.i18n = 'auth.loginTitle';
        authSubtitle.dataset.i18n = 'auth.loginSub';
        authSubmitBtn.dataset.i18n = 'auth.loginBtn';
        authSwitchText.dataset.i18n = 'auth.noAccount';
        authSwitchBtn.dataset.i18n = 'auth.registerNow';
    } else {
        authNameGroup.classList.remove('hidden');
        authNameInput.required = true;
        authTitle.dataset.i18n = 'auth.regTitle';
        authSubtitle.dataset.i18n = 'auth.regSub';
        authSubmitBtn.dataset.i18n = 'auth.regBtn';
        authSwitchText.dataset.i18n = 'auth.haveAccount';
        authSwitchBtn.dataset.i18n = 'auth.loginNow';
    }
    applyLang(currentLang, true);
}

authForm.addEventListener('submit', async e => {
    e.preventDefault();

    // Mengambil nilai input dari formulir
    const nameInput = document.getElementById('auth-name');
    const name = nameInput ? nameInput.value.trim() : '';
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-pass').value.trim();
    
    // Menentukan apakah user sedang Login atau Register
    const action = isLoginMode ? 'login' : 'register';

    // Mengubah tampilan tombol menjadi status loading
    const origText = authSubmitBtn.innerHTML;
    authSubmitBtn.innerHTML = `<svg class="animate-spin w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Memproses...`;
    authSubmitBtn.disabled = true;

    try {
        // PERUBAHAN DI SINI: Mengirim data ke ../auth.php (keluar satu folder)
        const response = await fetch('../auth.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: action,
                name: name,
                email: email,
                password: password
            })
        });

        const result = await response.json();

        // Menangani respons dari server
        if (result.status === 'success') {
            alert(result.message); // Notifikasi sukses
            if (action === 'register') {
                toggleAuthMode(); // Pindah ke layar login jika sukses daftar
            } else {
                // Paksa browser memuat ulang halaman agar sesi PHP terbaca dan navbar berubah
                window.location.reload(); 
            }
        } else {
            alert('Gagal: ' + result.message);
        }
    } catch (error) {
        alert('Terjadi kesalahan saat menghubungi server. Pastikan file auth.php sudah ada.');
        console.error('Error:', error);
    } finally {
        // Mengembalikan tombol ke wujud semula
        authSubmitBtn.innerHTML = origText;
        authSubmitBtn.disabled = false;
    }
});

authModal.addEventListener('click', e => {
    if (e.target === authModal) closeAuthModal();
});

// ================================================================
// CONTACT FORM
// ================================================================
const contactForm = document.getElementById('contact-form');
const formError = document.getElementById('form-error');
const toast = document.getElementById('toast');

contactForm.addEventListener('submit', e => {
    e.preventDefault();
    formError.classList.add('hidden');
    const n = contactForm.name.value.trim(), em = contactForm.email.value.trim(), s = contactForm.subject.value.trim(), m = contactForm.message.value.trim();
    if (!n || !em || !s || !m) { formError.textContent = t('contact.errorEmpty'); formError.classList.remove('hidden'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { formError.textContent = t('contact.errorEmail'); formError.classList.remove('hidden'); return; }
    const btn = contactForm.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg class="animate-spin w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> ${t('contact.sending')}`;
    btn.disabled = true;
    setTimeout(() => {
        // PERUBAHAN DI SINI: Email tujuan diganti ke sfitriannisaa@gmail.com
        window.location.href = `mailto:sfitriannisaa@gmail.com?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(`Name: ${n}\nEmail: ${em}\n\n${m}`)}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
        contactForm.reset();
        btn.innerHTML = orig;
        btn.disabled = false;
        lucide.createIcons();
    }, 1200);
});

// ================================================================
// ACTIVE NAV LINK & INIT
// ================================================================
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) cur = s.id; });
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
}, { passive: true });

lucide.createIcons();
currentLang = getSavedLang();
applyLang(currentLang, false);
updateNavbar();
