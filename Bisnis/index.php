<?php
session_start();

$gemu_base_path = '../';
$gemu_nav_context = [
    'mode' => 'business',
    'brand_text' => 'Gemu Business',
    'brand_badge' => 'GB',
    'show_profile' => true,
    'show_owner_tools' => true,
    'show_contact' => true,
    'compact' => false,
];

// Load products
$products = file_exists(__DIR__ . '/edit/produk.json') ? json_decode(file_get_contents(__DIR__ . '/edit/produk.json'), true) : [];
$publishedProducts = array_filter($products, function($p) { return !isset($p['status']) || $p['status'] === 'published'; });
// Sort slightly: featured first, then by date descending
usort($publishedProducts, function($a, $b) {
    if (($a['featured'] ?? false) !== ($b['featured'] ?? false)) {
        return ($a['featured'] ?? false) ? -1 : 1;
    }
    return ($b['id'] ?? 0) <=> ($a['id'] ?? 0);
});
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

    <?php require __DIR__ . '/../partials/navbar.php'; ?>

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

            <div class="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
                <div class="relative w-full md:w-96">
                    <input type="text" id="search-input" placeholder="Cari layanan/produk..." class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-navy-200 bg-white text-sm focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-shadow">
                    <i data-lucide="search" class="w-4 h-4 text-navy-400 absolute left-3.5 top-3"></i>
                </div>
                <div class="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    <select id="filter-category" class="px-4 py-2.5 rounded-xl border border-navy-200 bg-white text-sm text-navy-700 outline-none focus:border-accent-500">
                        <option value="">Semua Kategori</option>
                    </select>
                    <select id="filter-type" class="px-4 py-2.5 rounded-xl border border-navy-200 bg-white text-sm text-navy-700 outline-none focus:border-accent-500">
                        <option value="">Semua Tipe</option>
                        <option value="digital">Produk Digital</option>
                        <option value="service">Jasa</option>
                        <option value="document">Dokumen / PDF</option>
                        <option value="package">Paket Layanan</option>
                    </select>
                    <select id="sort-items" class="px-4 py-2.5 rounded-xl border border-navy-200 bg-white text-sm text-navy-700 outline-none focus:border-accent-500">
                        <option value="newest">Terbaru</option>
                        <option value="price_asc">Harga Termurah</option>
                        <option value="price_desc">Harga Tertinggi</option>
                        <option value="recommended">Rekomendasi</option>
                    </select>
                </div>
            </div>

            <div class="flex justify-end mb-6">
                 <button onclick="toggleMinatPanel()" class="flex items-center gap-2 px-4 py-2 bg-navy-800 text-white rounded-xl text-sm font-medium hover:bg-navy-900 transition-colors">
                     <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                     <span id="minat-count">0</span> Minat
                 </button>
            </div>

            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" id="product-container">
            </div>

            <div id="empty-state" class="hidden py-16 text-center">
                <div class="w-16 h-16 bg-navy-100 text-navy-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="package-x" class="w-8 h-8"></i>
                </div>
                <h3 class="text-lg font-bold text-navy-900 mb-1">Tidak ada produk ditemukan</h3>
                <p class="text-sm text-navy-500">Coba ubah kata kunci atau filter pencarian Anda.</p>
            </div>
        </div>
    </section>

    <!-- Panel Minat -->
    <div id="minat-panel" class="fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[100] transform translate-x-full transition-transform duration-300 flex flex-col">
        <div class="p-4 border-b border-navy-100 flex justify-between items-center bg-navy-50">
            <h3 class="font-bold text-navy-900 flex items-center gap-2"><i data-lucide="shopping-bag" class="w-5 h-5 text-accent-500"></i> Minat Pembeli</h3>
            <button onclick="toggleMinatPanel()" class="p-2 hover:bg-navy-200 rounded-lg text-navy-600"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>
        <div id="minat-items" class="flex-1 overflow-y-auto p-4 space-y-3">
        </div>
        <div class="p-4 border-t border-navy-100 bg-white">
            <button onclick="checkoutMinat()" class="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                <i data-lucide="message-circle" class="w-5 h-5"></i> Pesan via WhatsApp
            </button>
            <button onclick="clearMinat()" class="w-full mt-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors">Kosongkan Daftar</button>
        </div>
    </div>
    <div id="minat-overlay" onclick="toggleMinatPanel()" class="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-[99] hidden opacity-0 transition-opacity duration-300"></div>


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
        function tr(key) { const dictionary = window.dic || window.translations || {}; return currentLang === 'en' && dictionary[key]?.en ? dictionary[key].en : (dictionary[key]?.id || key); }
        function pickLang(obj, field) { return currentLang === 'en' && obj[field+'_en'] ? obj[field+'_en'] : (obj[field] || ''); }

        // Cart State
        const BUSINESS_INTEREST_KEY = 'gy_business_interest_v1';
        let minatList = JSON.parse(localStorage.getItem(BUSINESS_INTEREST_KEY) || '[]');

        function updateMinatCount() {
            document.getElementById('minat-count').textContent = minatList.length;
        }

        function toggleMinatPanel() {
            const panel = document.getElementById('minat-panel');
            const overlay = document.getElementById('minat-overlay');
            if (panel.classList.contains('translate-x-full')) {
                panel.classList.remove('translate-x-full');
                overlay.classList.remove('hidden');
                setTimeout(() => overlay.classList.remove('opacity-0'), 10);
                renderMinatItems();
            } else {
                panel.classList.add('translate-x-full');
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.classList.add('hidden'), 300);
            }
        }

        function addToMinat(id) {
            const prod = products.find(p => p.id === id);
            if (!prod) return;
            if (!minatList.find(i => i.id === id)) {
                minatList.push(prod);
                localStorage.setItem(BUSINESS_INTEREST_KEY, JSON.stringify(minatList));
                updateMinatCount();

                // Animate button
                const btn = document.querySelector(`.btn-minat-${id}`);
                if (btn) {
                    btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Tersimpan`;
                    btn.classList.add('bg-green-500', 'text-white', 'border-transparent');
                    btn.classList.remove('bg-white', 'text-navy-700', 'hover:bg-navy-50');
                    lucide.createIcons();
                }
            }
        }

        function removeFromMinat(id) {
            minatList = minatList.filter(i => i.id !== id);
            localStorage.setItem(BUSINESS_INTEREST_KEY, JSON.stringify(minatList));
            updateMinatCount();
            renderMinatItems();
            renderProducts(); // refresh buttons
        }

        function clearMinat() {
            if(confirm('Kosongkan semua daftar minat?')) {
                minatList = [];
                localStorage.setItem(BUSINESS_INTEREST_KEY, JSON.stringify(minatList));
                updateMinatCount();
                renderMinatItems();
                renderProducts();
            }
        }

        function checkoutMinat() {
            if(minatList.length === 0) return alert('Daftar minat masih kosong.');
            const itemsText = minatList.map(i => `- ${i.title} (${i.price})`).join('%0A');
            const msg = `Halo Darma, saya tertarik dengan layanan/produk berikut:%0A%0A${itemsText}%0A%0AMohon informasi lebih lanjut. Terima kasih.`;
            window.open(`https://wa.me/6285810518855?text=${msg}`, '_blank');
        }

        function renderMinatItems() {
            const container = document.getElementById('minat-items');
            if (minatList.length === 0) {
                container.innerHTML = '<div class="text-center py-10 text-navy-400 text-sm">Belum ada item yang ditambahkan.</div>';
                return;
            }
            container.innerHTML = minatList.map(item => `
                <div class="flex gap-3 bg-white border border-navy-100 p-3 rounded-xl shadow-sm">
                    <img src="edit/${item.cover || (item.images && item.images[0]) || 'placeholder.jpg'}" class="w-16 h-16 object-cover rounded-lg bg-navy-100" onerror="this.src='https://placehold.co/100x100?text=No+Image'">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-bold text-navy-900 text-sm truncate">${item.title}</h4>
                        <p class="text-accent-600 font-medium text-xs mt-1">${item.price}</p>
                    </div>
                    <button onclick="removeFromMinat(${item.id})" class="text-red-400 hover:text-red-600 p-2"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            `).join('');
            lucide.createIcons();
        }

        // Setup filter options
        function setupFilters() {
            const cats = new Set();
            products.forEach(p => { if(p.category) cats.add(p.category); });
            const catSelect = document.getElementById('filter-category');
            cats.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c; opt.textContent = c;
                catSelect.appendChild(opt);
            });
        }

        function getFilteredProducts() {
            const search = document.getElementById('search-input').value.toLowerCase();
            const cat = document.getElementById('filter-category').value;
            const type = document.getElementById('filter-type').value;
            const sort = document.getElementById('sort-items').value;

            let filtered = products.filter(p => {
                const matchSearch = (p.title||'').toLowerCase().includes(search) || (p.title_en||'').toLowerCase().includes(search);
                const matchCat = cat === '' || p.category === cat;
                const matchType = type === '' || p.type === type;
                return matchSearch && matchCat && matchType;
            });

            filtered.sort((a, b) => {
                if (sort === 'price_asc') return (a.price_number || 0) - (b.price_number || 0);
                if (sort === 'price_desc') return (b.price_number || 0) - (a.price_number || 0);
                if (sort === 'recommended') {
                    if ((a.featured||false) !== (b.featured||false)) return (a.featured||false) ? -1 : 1;
                }
                return (b.id||0) - (a.id||0); // newest default
            });

            return filtered;
        }

        function renderProducts() {
            const container = document.getElementById('product-container');
            const emptyState = document.getElementById('empty-state');
            const filtered = getFilteredProducts();

            if (filtered.length === 0) {
                container.innerHTML = '';
                emptyState.classList.remove('hidden');
                return;
            }
            emptyState.classList.add('hidden');

            container.innerHTML = filtered.map(prod => {
                const tTitle = pickLang(prod,'title');
                const tShort = pickLang(prod,'shortDesc');
                const cover = prod.cover || (prod.images && prod.images.length > 0 ? prod.images[0] : null);
                let imgHtml = '';
                if(cover) {
                    const ext = cover.split('.').pop().toLowerCase();
                    if(ext === 'pdf') {
                        imgHtml = `<div class="w-full h-full bg-navy-800 flex flex-col items-center justify-center text-white p-4">
                                       <i data-lucide="file-text" class="w-10 h-10 mb-2 opacity-50"></i>
                                       <span class="text-xs font-medium opacity-70">Dokumen PDF</span>
                                   </div>`;
                    } else {
                        imgHtml = `<img src="edit/${cover}" alt="${tTitle}" class="w-full h-full object-cover" loading="lazy" onerror="this.src='https://placehold.co/400x300?text=No+Image'">`;
                    }
                } else {
                    imgHtml = `<div class="w-full h-full bg-navy-100 flex items-center justify-center text-navy-400"><i data-lucide="image" class="w-10 h-10 opacity-30"></i></div>`;
                }

                const badgeHtml = (prod.featured) ? `<div class="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">RECOMMENDED</div>` : '';
                const isSaved = minatList.find(i => i.id === prod.id);
                const btnSave = isSaved
                    ? `<button class="btn-minat-${prod.id} p-2 rounded-lg bg-green-500 text-white flex-1 flex justify-center items-center gap-1.5 text-xs font-bold transition-colors"><i data-lucide="check" class="w-4 h-4"></i> Tersimpan</button>`
                    : `<button onclick="addToMinat(${prod.id})" class="btn-minat-${prod.id} p-2 rounded-lg border border-navy-200 bg-white text-navy-700 hover:bg-navy-50 flex-1 flex justify-center items-center gap-1.5 text-xs font-bold transition-colors"><i data-lucide="shopping-bag" class="w-4 h-4"></i> Minat</button>`;

                return `
                <div class="product-card bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(10,25,41,0.04)] border border-navy-100 flex flex-col">
                    <div class="aspect-[4/3] bg-navy-50 relative overflow-hidden group cursor-pointer" onclick="openProduct(${prod.id})">
                        ${imgHtml}
                        ${badgeHtml}
                        <div class="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span class="bg-white/90 backdrop-blur-sm text-navy-900 text-sm font-bold px-4 py-2 rounded-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                Lihat Detail <i data-lucide="arrow-right" class="w-4 h-4"></i>
                            </span>
                        </div>
                    </div>
                    <div class="p-5 flex-1 flex flex-col">
                        <div class="flex items-start justify-between gap-3 mb-2">
                            <h3 class="font-bold text-navy-900 text-base leading-snug line-clamp-2">${tTitle}</h3>
                        </div>
                        <p class="text-accent-600 font-bold text-lg mb-3">${prod.price || 'Gratis'}</p>
                        <p class="text-navy-600 text-sm line-clamp-2 mb-4 flex-1">${tShort}</p>

                        <div class="flex items-center gap-2 mt-auto">
                            ${btnSave}
                        </div>
                    </div>
                </div>
                `;
            }).join('');
            lucide.createIcons();
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            setupFilters();
            renderProducts();
            updateMinatCount();

            // Bind filters
            document.getElementById('search-input').addEventListener('input', renderProducts);
            document.getElementById('filter-category').addEventListener('change', renderProducts);
            document.getElementById('filter-type').addEventListener('change', renderProducts);
            document.getElementById('sort-items').addEventListener('change', renderProducts);
        });

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
