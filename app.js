// ================================================================
// LANGUAGE SYSTEM
// ================================================================
let currentLang = 'id';

function gemuCreateIcons() {
    // Jangan panggil diri sendiri. Ini penyebab JS bisa stack overflow,
    // lalu navbar/icon lain ikut gagal. Lucide hanya dipakai kalau library-nya berhasil load.
    try {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    } catch (error) {
        console.warn('Lucide icon gagal dibuat, UI tetap jalan:', error);
    }
}

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
    els.forEach(el => {
        const translation = t(el.dataset.i18n);
        // Find a span with i18n-text or replace text content if no icon exists
        const textSpan = el.querySelector('.i18n-text');
        if (textSpan) {
            if (animate) {
                textSpan.classList.add('i18n-fading');
                setTimeout(() => {
                    textSpan.innerHTML = translation;
                    textSpan.classList.remove('i18n-fading');
                }, 150);
            } else {
                textSpan.innerHTML = translation;
            }
        } else {
            // Fallback for simple elements
            if (animate) {
                el.classList.add('i18n-fading');
                setTimeout(() => {
                    el.innerHTML = translation;
                    el.classList.remove('i18n-fading');
                    // Re-create icons if they were wiped
                    gemuCreateIcons();
                }, 150);
            } else {
                el.innerHTML = translation;
            }
        }
    });

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

    gemuCreateIcons();
}

function renderCerts() {
    const grid = document.getElementById('cert-grid');
    grid.innerHTML = certsData.map((c, i) => `
        <div class="cert-card group cursor-pointer bg-white/5 border ${c.featured ? 'border-accent-500/30' : 'border-white/10'} rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-sm reveal visible ${c.span} flex flex-col h-full"
             onclick="openLightbox('${c.fullSrc || c.coverSrc || c.imgSrc || ''}','${certsI18n[c.titleKey][currentLang]}','${c.pdfSrc || ''}')">
            ${c.featured ? `<div class="relative flex-shrink-0"><div class="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-10 px-2 sm:px-3 py-0.5 sm:py-1 bg-accent-500 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-lg">${t('cert.featured')}</div>` : '<div class="flex-shrink-0">'}
            <div class="aspect-[4/3] overflow-hidden bg-navy-900/50 relative">
                ${(c.imgSrc || '').toLowerCase().endsWith('.pdf') || (c.pdfSrc || '').toLowerCase().endsWith('.pdf')
                    ? `<iframe src="${c.pdfSrc || c.imgSrc}#toolbar=0&navpanes=0&scrollbar=0" class="w-full h-full pointer-events-none scale-110" style="border:none;"></iframe>
                       <div class="absolute inset-0 z-10"></div>`
                    : `<img src="${c.coverSrc || c.imgSrc || c.fullSrc || ''}" alt="${certsI18n[c.titleKey][currentLang]}" class="w-full h-full object-cover transition-transform duration-500" loading="lazy">`
                }
            </div>
            ${c.featured ? '</div>' : '</div>'}
            <div class="p-4 sm:p-6 flex flex-col flex-grow">
                <div class="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-shrink-0">
                    <i data-lucide="${c.tagIcon}" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent-400"></i>
                    <span class="text-[10px] sm:text-xs font-medium text-accent-400 uppercase tracking-wider">${certsI18n[c.tagKey][currentLang]}</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-white mb-1 sm:mb-2 flex-shrink-0">${certsI18n[c.titleKey][currentLang]}</h3>
                <p class="text-xs sm:text-sm text-navy-300 leading-relaxed flex-grow">${certsI18n[c.descKey][currentLang]}</p>
                <div class="flex items-center gap-1.5 sm:gap-2 mt-4 text-accent-400 text-xs sm:text-sm font-medium flex-shrink-0">
                    <span>${t('cert.viewBtn')}</span>
                    <i data-lucide="expand" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
                </div>
            </div>
        </div>
    `).join('');
    gemuCreateIcons();
}

function renderProjects() {
    const grid = document.getElementById('proj-grid');
    if (!grid) return;

    grid.innerHTML = projData.map((p, i) => {
        const title = projI18n[p.titleKey]?.[currentLang] || p.titleKey || 'Project';
        const desc = projI18n[p.descKey]?.[currentLang] || '';
        const detail = p.detailKey ? (projI18n[p.detailKey]?.[currentLang] || '') : '';
        const fileUrl = p.fileUrl || p.linkUrl || '';
        const payload = encodeURIComponent(JSON.stringify({
            title,
            image: p.fullSrc || p.imgSrc,
            desc,
            detail,
            tags: p.tags || [],
            fileUrl,
            fileLabel: p.fileLabel || title,
            linkUrl: p.linkUrl || fileUrl
        }));

        return `
            <div class="project-card bg-white rounded-xl sm:rounded-2xl border border-navy-100 overflow-hidden reveal visible ${p.span || ''} flex flex-col h-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <button type="button" onclick="openProjectModalFromData('${payload}')" class="block text-left aspect-[16/10] overflow-hidden bg-navy-50 group w-full flex-shrink-0" aria-label="${t('proj.openFileBtn')}: ${title}">
                    <img src="${p.imgSrc}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy">
                </button>
                <div class="p-4 sm:p-6 flex flex-col flex-grow">
                    <div class="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-shrink-0">
                        ${(p.tags || []).map(tag => `<span class="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-accent-500/10 text-accent-600 text-[10px] sm:text-xs font-medium rounded-md">${tag}</span>`).join('')}
                    </div>
                    <h3 class="text-base sm:text-lg font-bold text-navy-900 mb-1 sm:mb-2 leading-snug flex-shrink-0">${title}</h3>
                    <p class="text-xs sm:text-sm text-navy-500 leading-relaxed line-clamp-3 flex-grow">${desc}</p>
                    <div class="mt-auto pt-4 border-t border-navy-100 flex flex-col sm:flex-row gap-2 sm:items-center flex-shrink-0">
                        <button type="button" onclick="openProjectModalFromData('${payload}')" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-900 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-navy-800 active:scale-[0.98] transition-all">
                            <i data-lucide="folder-open" class="w-4 h-4"></i>
                            <span>${t('proj.openFileBtn')}</span>
                        </button>
                        <button type="button" onclick="openProjectModalFromData('${payload}')" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-50 text-navy-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-navy-100 active:scale-[0.98] transition-all">
                            <i data-lucide="info" class="w-4 h-4"></i>
                            <span>${t('proj.detailBtn')}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    gemuCreateIcons();
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
    if (!navbar) return;
    const scrolled = window.scrollY > 60;
    const isMenuOpen = document.body.classList.contains('menu-locked');

    navbar.classList.toggle('bg-white/95', scrolled && !isMenuOpen);
    navbar.classList.toggle('backdrop-blur-xl', scrolled || isMenuOpen);
    navbar.classList.toggle('shadow-lg', scrolled || isMenuOpen);
    navbar.classList.toggle('shadow-navy-900/5', scrolled && !isMenuOpen);
    navbar.classList.toggle('bg-transparent', !scrolled && !isMenuOpen);

    if (navLogoText) {
        navLogoText.classList.toggle('text-navy-900', scrolled && !isMenuOpen);
        navLogoText.classList.toggle('text-white', !scrolled || isMenuOpen);
    }

    navLinks.forEach(l => {
        l.classList.toggle('text-navy-600', scrolled && !isMenuOpen);
        l.classList.toggle('hover:text-navy-900', scrolled && !isMenuOpen);
        l.classList.toggle('text-white/80', !scrolled || isMenuOpen);
        l.classList.toggle('hover:text-white', !scrolled || isMenuOpen);
    });

    if (navLoginBtn) {
        navLoginBtn.classList.toggle('text-navy-900', scrolled && !isMenuOpen);
        navLoginBtn.classList.toggle('border-navy-200', scrolled && !isMenuOpen);
        navLoginBtn.classList.toggle('hover:bg-navy-50', scrolled && !isMenuOpen);
        navLoginBtn.classList.toggle('text-white', !scrolled || isMenuOpen);
        navLoginBtn.classList.toggle('border-white/20', !scrolled || isMenuOpen);
        navLoginBtn.classList.toggle('hover:bg-white/10', !scrolled || isMenuOpen);
    }

    langToggles.forEach(tog => tog.classList.toggle('scrolled', scrolled && !isMenuOpen));
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('scrolled', scrolled && !isMenuOpen);
    });

    if (mobileMenuBtn) {
        mobileMenuBtn.classList.toggle('text-navy-900', scrolled && !isMenuOpen);
        mobileMenuBtn.classList.toggle('hover:bg-navy-100', scrolled && !isMenuOpen);
        mobileMenuBtn.classList.toggle('active:bg-navy-200', scrolled && !isMenuOpen);
        mobileMenuBtn.classList.toggle('text-white', !scrolled || isMenuOpen);
        mobileMenuBtn.classList.toggle('hover:bg-white/10', !scrolled || isMenuOpen);
        mobileMenuBtn.classList.toggle('active:bg-white/20', !scrolled || isMenuOpen);
    }
}
window.addEventListener('scroll', updateNavbar, { passive: true });

const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
const menuIconOpen = document.getElementById('menu-icon-open');
const menuIconClose = document.getElementById('menu-icon-close');
let menuOpen = false;
let menuTimer = null;

function setMenuVisualState(isOpen) {
    if (!mobileMenu || !mobileMenuOverlay || !mobileMenuBtn) return;

    mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    mobileMenuOverlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');

    mobileMenu.classList.toggle('menu-open', isOpen);
    mobileMenu.classList.toggle('gemu-menu-open', isOpen);
    mobileMenu.classList.toggle('translate-x-full', !isOpen);
    mobileMenuOverlay.classList.toggle('gemu-overlay-open', isOpen);
    mobileMenuOverlay.classList.toggle('opacity-100', isOpen);
    document.body.classList.toggle('menu-locked', isOpen);
    document.documentElement.classList.toggle('menu-locked', isOpen);
    if (navbar) navbar.classList.toggle('gemu-navbar-open', isOpen);

    if (menuIconOpen) menuIconOpen.classList.toggle('hidden', isOpen);
    if (menuIconClose) menuIconClose.classList.toggle('hidden', !isOpen);

    mobileMenu.style.visibility = isOpen ? 'visible' : 'hidden';
    mobileMenu.style.opacity = isOpen ? '1' : '0';
    mobileMenu.style.pointerEvents = isOpen ? 'auto' : 'none';
    mobileMenu.style.transform = isOpen ? 'translateX(0)' : 'translateX(110%)';
    mobileMenuOverlay.style.display = isOpen ? 'block' : 'none';
    mobileMenuOverlay.style.opacity = isOpen ? '1' : '0';
    mobileMenuOverlay.style.pointerEvents = isOpen ? 'auto' : 'none';
}

function toggleMenu(open) {
    if (!mobileMenu || !mobileMenuOverlay || !mobileMenuBtn) return;
    const nextState = typeof open === 'boolean' ? open : !menuOpen;
    menuOpen = nextState;
    clearTimeout(menuTimer);

    if (menuOpen) {
        mobileMenuOverlay.classList.remove('hidden');
        mobileMenu.style.visibility = 'visible';
        mobileMenu.style.display = 'block';
        mobileMenuOverlay.style.display = 'block';
        requestAnimationFrame(() => {
            setMenuVisualState(true);
            updateNavbar();
        });
        return;
    }

    setMenuVisualState(false);
    updateNavbar();
    menuTimer = setTimeout(() => {
        if (!menuOpen) {
            mobileMenuOverlay.classList.add('hidden');
            mobileMenu.classList.remove('menu-open', 'gemu-menu-open');
        }
    }, 330);
}

function bindMenuCloseLinks() {
    document.querySelectorAll('.mobile-link').forEach(link => {
        if (link.dataset.menuBound === '1') return;
        link.dataset.menuBound = '1';
        link.addEventListener('click', () => toggleMenu(false));
    });
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });
}
if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMenu(false);
    });
}
bindMenuCloseLinks();
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggleMenu(false); });
window.addEventListener('resize', () => { if (menuOpen) toggleMenu(false); }, { passive: true });
window.addEventListener('hashchange', () => toggleMenu(false), { passive: true });
window.addEventListener('pageshow', () => toggleMenu(false), { passive: true });

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
const lightboxPdf = document.getElementById('lightbox-pdf');
const lightboxTitle = document.getElementById('lightbox-title');

function openLightbox(src, title, pdfSrc = '') {
    const hasPdf = typeof pdfSrc === 'string' && pdfSrc.trim().toLowerCase().endsWith('.pdf');
    const source = (hasPdf ? pdfSrc : src || pdfSrc || '').trim();

    if (!source) return;

    if (hasPdf) {
        lightboxImg.classList.add('hidden');
        lightboxPdf.classList.remove('hidden');
        lightboxPdf.src = `${source}#toolbar=0&navpanes=0&scrollbar=0`;
    } else {
        lightboxPdf.classList.add('hidden');
        lightboxImg.classList.remove('hidden');
        lightboxImg.src = source;
        lightboxImg.alt = title;
    }

    lightboxTitle.textContent = title;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeLightbox(e) {
    if (e && e.target !== lightbox && !e.target.closest('button')) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
        lightboxImg.src = '';
        lightboxPdf.src = '';
        lightboxPdf.classList.add('hidden');
        lightboxImg.classList.remove('hidden');
    }, 300);
}
let touchStartY = 0;
lightbox.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
lightbox.addEventListener('touchend', e => { if (e.changedTouches[0].clientY - touchStartY > 80) { closeLightbox(); } }, { passive: true });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) { closeLightbox(); }
});

// ================================================================
// UI UTILITIES
// ================================================================
function showSuccessOverlay(title, message) {
    const overlay = document.getElementById('success-overlay');
    const tEl = document.getElementById('success-title');
    const mEl = document.getElementById('success-message');
    if (overlay && tEl && mEl) {
        tEl.textContent = title;
        mEl.textContent = message;
        overlay.classList.add('active');
        if (window.lucide) window.lucide.createIcons();
    }
}

function hideSuccessOverlay() {
    const overlay = document.getElementById('success-overlay');
    if (overlay) overlay.classList.remove('active');
}

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
        // Mengirim data ke auth.php
        const response = await fetch('auth.php', {
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
            closeAuthModal();
            showSuccessOverlay(
                action === 'register' ? 'Pendaftaran Berhasil!' : 'Login Berhasil!',
                result.message
            );

            if (action === 'register') {
                setTimeout(() => {
                    hideSuccessOverlay();
                    toggleAuthMode();
                    openAuthModal();
                }, 2000);
            } else {
                // Paksa browser memuat ulang halaman agar sesi PHP terbaca dan navbar berubah
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
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
        window.location.href = `mailto:darmarakha2@gmail.com?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(`Name: ${n}\nEmail: ${em}\n\n${m}`)}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
        contactForm.reset();
        btn.innerHTML = orig;
        btn.disabled = false;
        gemuCreateIcons();
    }, 1200);
});

// ================================================================
// ACTIVE NAV LINK & INIT
// ================================================================
// ⚡ Bolt: Optimize scroll performance by:
// 1. Caching static DOM elements (allNavLinks) outside the event listener
// 2. Caching window.scrollY to prevent layout thrashing inside the loop
// 3. Using requestAnimationFrame to throttle scroll events (measurably reduces main thread blocking)
const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');
let isNavScrollThrottled = false;

window.addEventListener('scroll', () => {
    if (!isNavScrollThrottled) {
        window.requestAnimationFrame(() => {
            let cur = '';
            const scrollY = window.scrollY;
            sections.forEach(s => { if (scrollY >= s.offsetTop - 100) cur = s.id; });
            allNavLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
            isNavScrollThrottled = false;
        });
        isNavScrollThrottled = true;
    }
}, { passive: true });

gemuCreateIcons();
currentLang = getSavedLang();
applyLang(currentLang, false);
updateNavbar();