<?php
session_start(); // Wajib untuk melacak status login user
?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Katalog Bisnis — Darma Alif Rakhaa</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        navy: { 50:'#f0f4f8',100:'#d9e2ec',200:'#bcccdc',300:'#9fb3c8',400:'#829ab1',500:'#627d98',600:'#486581',700:'#334e68',800:'#243b53',900:'#102a43',950:'#0a1929' },
                        accent: { 300:'#7dd3fc',400:'#38bdf8',500:'#0ea5e9',600:'#0284c7',700:'#0369a1' }
                    },
                    fontFamily: { sans:['Inter','sans-serif'], serif:['Playfair Display','serif'] }
                }
            }
        }
    </script>
    <style>
        body{font-family:'Inter',sans-serif;-webkit-tap-highlight-color:transparent}
        ::selection{background:#0ea5e9;color:#fff}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#f0f4f8}
        ::-webkit-scrollbar-thumb{background:#9fb3c8;border-radius:4px}
        .hero-gradient{background:linear-gradient(135deg,#0a1929 0%,#102a43 30%,#1e3a5f 60%,#243b53 100%);position:relative;overflow:hidden}
        .product-card{transition:transform .3s ease,box-shadow .3s ease}
        @media(hover:hover){.product-card:hover{transform:translateY(-8px);box-shadow:0 20px 40px rgba(10,25,41,.12)}}
        
        /* Modal Gallery & Auth */
        .lightbox{opacity:0;visibility:hidden;transition:opacity .3s ease,visibility .3s ease}
        .lightbox.active{opacity:1;visibility:visible}
        .lightbox-content{transform:translateY(20px) scale(0.95);transition:transform .4s cubic-bezier(0.4, 0, 0.2, 1)}
        .lightbox.active .lightbox-content{transform:translateY(0) scale(1)}
        .gallery-img{display:none; animation: fadeIn 0.4s ease}
        .gallery-img.active{display:block}
        .pdf-pages canvas{max-width:100%;height:auto;display:block;margin:0 auto 10px auto;border-radius:8px}
        .pdf-pages{overflow:auto;height:100%;padding:8px}
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .lang-btn{padding:6px 10px;border-radius:8px;font-size:12px;font-weight:700}
        .lang-btn.active{background:#0ea5e9;color:#fff}
    </style>
</head>
<body class="bg-navy-50 text-navy-900 antialiased">

    <nav id="navbar" class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-xl shadow-lg shadow-navy-900/5">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="flex items-center justify-between h-14 sm:h-16 md:h-20">
                <a href="../index.php" class="flex items-center gap-2 group z-10">
                    <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-accent-500 flex items-center justify-center flex-shrink-0">
                        <span class="text-white font-bold text-xs sm:text-sm">DR</span>
                    </div>
                    <span class="font-semibold text-base sm:text-lg tracking-tight text-navy-900">Darma Rakhaa</span>
                </a>

                <div class="hidden md:flex items-center gap-6 lg:gap-8">
                    <a href="../index.php#about" class="text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors" data-i18n="nav.back">Kembali ke Profil</a>
                    <div class="flex items-center gap-1 border border-navy-200 rounded-lg p-1 bg-navy-50">
                        <button class="lang-btn active" data-lang="id" onclick="switchLang('id')">ID</button>
                        <button class="lang-btn" data-lang="en" onclick="switchLang('en')">EN</button>
                    </div>
                    
                    <?php if(isset($_SESSION['user_name'])): ?>
                        <?php if(isset($_SESSION['user_role']) && strtolower($_SESSION['user_role']) === 'owner'): ?>
                            <a href="edit/" class="px-3 py-1.5 bg-red-500/10 text-red-600 text-sm font-bold rounded-lg border border-red-500/30 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-1.5">
                                <i data-lucide="edit-3" class="w-4 h-4"></i> Edit Katalog
                            </a>
                        <?php endif; ?>

                        <div class="flex items-center gap-3 pl-4 border-l border-navy-200">
                            <div class="text-right">
                                <p class="text-sm font-bold text-navy-900"><?php echo htmlspecialchars($_SESSION['user_name']); ?></p>
                                <p class="text-[10px] text-accent-600 font-medium uppercase tracking-wider mt-0.5"><?php echo isset($_SESSION['user_role']) ? htmlspecialchars($_SESSION['user_role']) : 'Member'; ?></p>
                            </div>
                            <div class="w-9 h-9 rounded-full bg-accent-50 flex items-center justify-center text-accent-600 border border-accent-200">
                                <i data-lucide="user" class="w-4 h-4"></i>
                            </div>
                            <a href="../logout.php" class="ml-2 text-navy-400 hover:text-red-500 transition-colors" title="Keluar">
                                <i data-lucide="log-out" class="w-4 h-4"></i>
                            </a>
                        </div>
                    <?php else: ?>
                        <button onclick="openAuthModal()" class="px-4 py-1.5 border border-navy-200 text-navy-900 text-sm font-medium rounded-lg hover:bg-navy-50 transition-colors duration-200" data-i18n="auth.login">Login / Sign Up</button>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </nav>

    <section class="pt-28 pb-12 sm:pt-32 sm:pb-16 md:pt-40 md:pb-20 bg-white border-b border-navy-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <p class="text-accent-600 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3" data-i18n="hero.label">Layanan & Produk</p>
            <h1 class="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-navy-900 mb-4">
                <span data-i18n="hero.title">Katalog Bisnis</span>
            </h1>
            <p class="text-sm sm:text-base text-navy-600 max-w-2xl mx-auto" data-i18n="hero.desc">
                Eksplorasi layanan dan produk digital yang saya tawarkan. Dikerjakan dengan dedikasi, presisi, dan standar kualitas terbaik.
            </p>
        </div>
    </section>

    <section class="py-12 sm:py-16 md:py-20 bg-navy-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" id="product-container">
                </div>
        </div>
    </section>

    <div id="auth-modal" class="lightbox fixed inset-0 z-[100] bg-navy-950/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative transition-transform transform scale-95 opacity-0" id="auth-card">
            <button onclick="closeAuthModal()" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-navy-50 hover:bg-navy-100 text-navy-500 transition-colors z-10" aria-label="Close">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
            <div class="p-6 sm:p-8">
                <div class="text-center mb-6">
                    <div class="w-12 h-12 rounded-xl bg-accent-500 flex items-center justify-center mx-auto mb-4">
                        <span class="text-white font-bold text-lg">DR</span>
                    </div>
                    <h3 class="text-xl sm:text-2xl font-bold text-navy-900" id="auth-title">Selamat Datang</h3>
                    <p class="text-sm text-navy-500 mt-1" id="auth-subtitle">Silakan masuk ke akun Anda</p>
                </div>
                
                <form id="auth-form" class="space-y-4">
                    <input type="hidden" name="action" id="auth-action" value="login">
                    <div id="auth-name-group" class="hidden">
                        <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1">Nama</label>
                        <input type="text" name="name" id="auth-name" class="w-full px-4 py-2.5 rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                    </div>
                    <div>
                        <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1">Email</label>
                        <input type="email" name="email" id="auth-email" required class="w-full px-4 py-2.5 rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                    </div>
                    <div>
                        <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1">Kata Sandi</label>
                        <input type="password" name="password" id="auth-pass" required class="w-full px-4 py-2.5 rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                    </div>
                    
                    <button type="submit" class="w-full py-3 bg-navy-900 text-white font-semibold rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-navy-900/20 text-sm sm:text-base mt-2" id="auth-submit-btn">Masuk</button>
                </form>
                
                <div class="mt-6 text-center text-sm">
                    <span class="text-navy-500" id="auth-switch-text">Belum punya akun?</span>
                    <button onclick="toggleAuthMode()" class="text-accent-600 font-semibold hover:text-accent-700 transition-colors ml-1" id="auth-switch-btn">Daftar sekarang</button>
                </div>
            </div>
        </div>
    </div>

    <div id="product-modal" class="lightbox fixed inset-0 z-[100] bg-navy-950/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
        <div class="lightbox-content bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh]">
            <button onclick="closeProductModal()" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md hover:bg-navy-100 text-navy-900 transition-colors z-20 shadow" aria-label="Close">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
            <div class="w-full md:w-3/5 bg-navy-900 relative flex items-center justify-center min-h-[250px] md:min-h-[400px]">
                <div id="modal-gallery" class="w-full h-full flex items-center justify-center"></div>
                <button onclick="changeSlide(-1)" class="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"><i data-lucide="chevron-left" class="w-5 h-5"></i></button>
                <button onclick="changeSlide(1)" class="absolute right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"><i data-lucide="chevron-right" class="w-5 h-5"></i></button>
                <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2" id="modal-indicators"></div>
            </div>
            <div class="w-full md:w-2/5 p-6 sm:p-8 flex flex-col overflow-y-auto">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold w-fit mb-4">
                    <i data-lucide="tag" class="w-3 h-3"></i> <span data-i18n="modal.available">Tersedia</span>
                </div>
                <h2 id="modal-title" class="font-serif text-2xl sm:text-3xl font-bold text-navy-900 mb-2"></h2>
                <p id="modal-price" class="text-xl font-bold text-accent-600 mb-6"></p>
                <div class="h-px w-full bg-navy-100 mb-6"></div>
                <h3 class="text-sm font-bold text-navy-900 mb-2" data-i18n="modal.desc">Deskripsi Produk</h3>
                <div id="modal-desc" class="text-sm text-navy-600 leading-relaxed space-y-3 flex-1"></div>
                <div class="mt-8 pt-6 border-t border-navy-100">
                    <a id="modal-buy-btn" href="#" target="_blank" class="w-full flex items-center justify-center gap-2 py-3.5 bg-navy-900 text-white font-semibold rounded-xl hover:bg-navy-800 active:scale-[0.98] transition-all shadow-lg shadow-navy-900/20">
                        <i data-lucide="message-circle" class="w-4 h-4"></i> <span data-i18n="modal.order">Pesan via WhatsApp</span>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <footer class="bg-navy-950 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <p class="text-sm text-navy-400" data-i18n="footer.copy">&copy; 2026 Darma Alif Rakhaa. Divisi Bisnis & Layanan Profesional.</p>
        </div>
    </footer>

    <script>
        lucide.createIcons();

        // 1. DATA & LOGIKA PRODUK DARI PHP JSON
        const products = <?php echo file_exists('edit/produk.json') ? file_get_contents('edit/produk.json') : '[]'; ?>;
        let currentLang = localStorage.getItem('biz-catalog-lang') || 'id';
        const I18N = {
            'nav.back': {id:'Kembali ke Profil', en:'Back to Profile'},
            'auth.login': {id:'Login / Sign Up', en:'Login / Sign Up'},
            'hero.label': {id:'Layanan & Produk', en:'Services & Products'},
            'hero.title': {id:'Katalog Bisnis', en:'Business Catalog'},
            'hero.desc': {id:'Eksplorasi layanan dan produk digital yang saya tawarkan. Dikerjakan dengan dedikasi, presisi, dan standar kualitas terbaik.', en:'Explore the services and digital products I offer. Crafted with dedication, precision, and high quality standards.'},
            'modal.available': {id:'Tersedia', en:'Available'},
            'modal.desc': {id:'Deskripsi Produk', en:'Product Description'},
            'modal.order': {id:'Pesan via WhatsApp', en:'Order via WhatsApp'},
            'card.detail': {id:'Lihat Detail', en:'View Details'},
            'card.empty': {id:'Belum ada produk yang ditambahkan.', en:'No products have been added yet.'},
            'card.noFile': {id:'Tidak ada file/gambar', en:'No file/image available'},
            'card.file': {id:'File', en:'File'},
            'card.pdf': {id:'Dokumen PDF', en:'PDF Document'},
            'footer.copy': {id:'© 2026 Darma Alif Rakhaa. Divisi Bisnis & Layanan Profesional.', en:'© 2026 Darma Alif Rakhaa. Business Division & Professional Services.'}
        };
        const tr = key => (I18N[key]?.[currentLang] || I18N[key]?.id || key);
        const pickLang = (p, key) => p[`${key}_en`] && currentLang === 'en' ? p[`${key}_en`] : (p[key] || '');

        const container = document.getElementById('product-container');
        
        function renderProducts() {
            if (products.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-10 text-navy-400 font-medium">${tr('card.empty')}</div>`;
            } else {
            container.innerHTML = products.map(p => {
                // Menentukan gambar cover (atau icon PDF)
                let coverImg = '';
                if (p.images && p.images.length > 0) {
                    const coverPath = p.images.find(f => !f.toLowerCase().endsWith('.pdf')) || p.images[0];
                    const ext = coverPath.split('.').pop().toLowerCase();
                    if (ext === 'pdf') {
                        // Jika cover adalah PDF, tampilkan placeholder cantik
                        coverImg = `
                            <div class="w-full h-full flex flex-col items-center justify-center bg-navy-100 text-navy-400">
                                <i data-lucide="file-text" class="w-12 h-12 mb-2"></i>
                                <span class="text-xs font-bold uppercase tracking-widest">${tr('card.pdf')}</span>
                            </div>`;
                    } else {
                        coverImg = `<img src="edit/${coverPath}" alt="${pickLang(p,'title')}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">`;
                    }
                } else {
                    coverImg = `<div class="w-full h-full bg-navy-200"></div>`;
                }

                return `
                <div class="product-card bg-white border border-navy-100 rounded-2xl overflow-hidden flex flex-col cursor-pointer" onclick="openProduct(${p.id})">
                    <div class="aspect-[4/3] bg-navy-50 relative overflow-hidden group">
                        ${coverImg}
                        ${p.images && p.images.length > 1 ? `<div class="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"><i data-lucide="images" class="w-3 h-3"></i> ${p.images.length} ${tr('card.file')}</div>` : ''}
                    </div>
                    <div class="p-5 flex-1 flex flex-col">
                        <h3 class="text-lg font-bold text-navy-900 mb-1 line-clamp-1">${pickLang(p,'title')}</h3>
                        <p class="text-accent-600 font-bold mb-3">${p.price}</p>
                        <p class="text-sm text-navy-500 leading-relaxed mb-4 flex-1 line-clamp-2">${pickLang(p,'shortDesc')}</p>
                        <div class="pt-4 border-t border-navy-50 text-sm font-semibold text-navy-900 flex items-center gap-2 group-hover:text-accent-600 transition-colors">${tr('card.detail')} <i data-lucide="arrow-right" class="w-4 h-4"></i></div>
                    </div>
                </div>
                `;
            }).join('');
            lucide.createIcons();
            }
        }
        renderProducts();

        // 2. LOGIKA MODAL PRODUK
        const pModal = document.getElementById('product-modal');
        const mGallery = document.getElementById('modal-gallery');
        const mIndicators = document.getElementById('modal-indicators');
        let currentImages = [], currentSlide = 0;

        if (window['pdfjsLib']) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        async function renderPdfToCanvas(containerEl, pdfUrl) {
            containerEl.innerHTML = '<div class="text-white/80 text-sm p-4">Memuat PDF...</div>';
            try {
                const task = pdfjsLib.getDocument({ url: pdfUrl, disableAutoFetch: false, disableStream: false });
                const pdf = await task.promise;
                const pagesWrap = document.createElement('div');
                pagesWrap.className = 'pdf-pages';

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 1.25 });
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d', { alpha: false });
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    canvas.oncontextmenu = () => false;
                    pagesWrap.appendChild(canvas);
                }
                containerEl.innerHTML = '';
                containerEl.appendChild(pagesWrap);
            } catch (e) {
                containerEl.innerHTML = '<div class="text-center text-white p-6">PDF gagal dimuat.</div>';
            }
        }

        function openProduct(id) {
            const prod = products.find(p => p.id === id);
            if(!prod) return;
            document.getElementById('modal-title').textContent = pickLang(prod,'title');
            document.getElementById('modal-price').textContent = prod.price;
            document.getElementById('modal-desc').innerHTML = pickLang(prod,'fullDesc');
            document.getElementById('modal-buy-btn').href = `https://wa.me/6285810518855?text=${encodeURIComponent('Halo, saya tertarik dengan: ' + pickLang(prod,'title'))}`;
            
            currentImages = prod.images || []; 
            currentSlide = 0;
            
            if (currentImages.length > 0) {
                mGallery.innerHTML = currentImages.map((src, i) => {
                    const ext = src.split('.').pop().toLowerCase();
                    if (ext === 'pdf') {
                        return `
                            <div class="gallery-img w-full h-full absolute inset-0 m-auto p-2 ${i === 0 ? 'active' : ''}">
                                <div class="w-full h-full bg-navy-800 rounded-xl" data-pdf-src="edit/${src}"></div>
                            </div>`;
                    } else {
                        return `<img src="edit/${src}" class="gallery-img w-full h-full object-contain absolute inset-0 m-auto ${i === 0 ? 'active' : ''}" oncontextmenu="return false;">`;
                    }
                }).join('');
                lucide.createIcons();
                const firstSlide = mGallery.querySelector('.gallery-img.active [data-pdf-src]');
                if (firstSlide) renderPdfToCanvas(firstSlide, firstSlide.dataset.pdfSrc);
            } else {
                mGallery.innerHTML = `<div class="text-navy-400">${tr('card.noFile')}</div>`;
            }
            
            updateIndicators();
            pModal.classList.add('active'); document.body.style.overflow = 'hidden';
        }

        function closeProductModal() { pModal.classList.remove('active'); document.body.style.overflow = ''; }
        
        function changeSlide(step) {
            if(currentImages.length <= 1) return;
            currentSlide += step;
            if(currentSlide >= currentImages.length) currentSlide = 0;
            if(currentSlide < 0) currentSlide = currentImages.length - 1;
            mGallery.querySelectorAll('.gallery-img').forEach((img, i) => {
                if(i === currentSlide) img.classList.add('active');
                else img.classList.remove('active');
            });
            const activePdf = mGallery.querySelector('.gallery-img.active [data-pdf-src]');
            if (activePdf && !activePdf.dataset.rendered) {
                activePdf.dataset.rendered = '1';
                renderPdfToCanvas(activePdf, activePdf.dataset.pdfSrc);
            }
            updateIndicators();
        }
        
        function updateIndicators() {
            if(currentImages.length <= 1) { mIndicators.innerHTML = ''; return; }
            mIndicators.innerHTML = currentImages.map((_, i) => `<div class="w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-accent-500 w-4' : 'bg-white/50'}"></div>`).join('');
        }
        
        pModal.addEventListener('click', e => { if(e.target === pModal) closeProductModal(); });

        // 3. LOGIKA MODAL AUTH (LOGIN/REGISTER)
        const authModal = document.getElementById('auth-modal');
        const authCard = document.getElementById('auth-card');
        const authNameGroup = document.getElementById('auth-name-group');
        const authNameInput = document.getElementById('auth-name');
        const authTitle = document.getElementById('auth-title');
        const authSubtitle = document.getElementById('auth-subtitle');
        const authSubmitBtn = document.getElementById('auth-submit-btn');
        const authSwitchText = document.getElementById('auth-switch-text');
        const authSwitchBtn = document.getElementById('auth-switch-btn');
        const authActionInput = document.getElementById('auth-action');
        let isLoginMode = true;

        function openAuthModal() {
            authModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                authCard.classList.remove('scale-95', 'opacity-0');
                authCard.classList.add('scale-100', 'opacity-100');
            }, 10);
            lucide.createIcons();
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
                authTitle.textContent = 'Selamat Datang';
                authSubtitle.textContent = 'Silakan masuk ke akun Anda';
                authSubmitBtn.textContent = 'Masuk';
                authSwitchText.textContent = 'Belum punya akun?';
                authSwitchBtn.textContent = 'Daftar sekarang';
                authActionInput.value = 'login';
            } else {
                authNameGroup.classList.remove('hidden');
                authNameInput.required = true;
                authTitle.textContent = 'Buat Akun Baru';
                authSubtitle.textContent = 'Bergabunglah untuk melanjutkan';
                authSubmitBtn.textContent = 'Daftar';
                authSwitchText.textContent = 'Sudah punya akun?';
                authSwitchBtn.textContent = 'Masuk di sini';
                authActionInput.value = 'register';
            }
        }

        authModal.addEventListener('click', e => {
            if (e.target === authModal) closeAuthModal();
        });
        function switchLang(lang) {
            currentLang = lang;
            localStorage.setItem('biz-catalog-lang', lang);
            document.documentElement.lang = lang;
            document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
            document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = tr(el.dataset.i18n));
            renderProducts();
        }
        switchLang(currentLang);

        // Menghubungkan form ke ../auth.php (di root) menggunakan Fetch (AJAX)
        document.getElementById('auth-form').addEventListener('submit', async e => {
            e.preventDefault();
            const btn = document.getElementById('auth-submit-btn');
            const origText = btn.textContent;
            btn.textContent = 'Memproses...';
            btn.disabled = true;

            const formData = new FormData(e.target);
            
            try {
                // Mengirim data ke auth.php yang berada di folder utama
                const response = await fetch('../auth.php', {
                    method: 'POST',
                    body: formData
                });
                
                // Reload halaman agar navbar mendeteksi Session PHP yang baru login
                window.location.reload();
            } catch (error) {
                alert('Terjadi kesalahan koneksi saat login/register.');
                btn.textContent = origText;
                btn.disabled = false;
            }
        });
    </script>
</body>
</html>
