<?php
session_start();

$gemu_base_path = '../';
$gemu_nav_context = [
    'mode' => 'sabila',
    'brand_text' => 'Sabila Fitriannisaa',
    'brand_badge' => 'SF',
    'show_profile' => false,
    'show_owner_tools' => false,
    'show_contact' => false,
    'compact' => true,
];
?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Sabila Fitriannisaa — Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
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
        .hero-gradient::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 500px 350px at 20% 50%,rgba(14,165,233,.12) 0%,transparent 70%),radial-gradient(ellipse 400px 400px at 80% 20%,rgba(56,189,248,.08) 0%,transparent 70%);pointer-events:none}
        .hero-gradient::after{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:50px 50px;pointer-events:none}
        .particle{position:absolute;border-radius:50%;background:rgba(14,165,233,.15);pointer-events:none;animation:float linear infinite}
        @keyframes float{0%{transform:translateY(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-100vh);opacity:0}}
        .progress-fill{width:0;transition:width 1.5s cubic-bezier(.4,0,.2,1)}
        .reveal{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease}
        .reveal.visible{opacity:1;transform:translateY(0)}
        .timeline-line{position:absolute;left:15px;top:0;bottom:0;width:2px;background:linear-gradient(to bottom,#0ea5e9,#bcccdc)}
        @media(min-width:768px){.timeline-line{left:50%;transform:translateX(-50%)}}
        .cert-card{transition:transform .3s ease,box-shadow .3s ease}
        @media(hover:hover){.cert-card:hover{transform:translateY(-8px);box-shadow:0 20px 40px rgba(10,25,41,.12)}}
        .lightbox{opacity:0;visibility:hidden;transition:opacity .3s ease,visibility .3s ease}
        .lightbox.active{opacity:1;visibility:visible}
        .lightbox-img{transform:scale(.92);transition:transform .3s ease}
        .lightbox.active .lightbox-img{transform:scale(1)}
        .toast{transform:translateX(calc(100% + 2rem));transition:transform .4s cubic-bezier(.4,0,.2,1)}
        .toast.show{transform:translateX(0)}
        .nav-link{position:relative}
        .nav-link::after{content:'';position:absolute;bottom:-4px;left:50%;width:0;height:2px;background:#0ea5e9;transition:width .3s ease,left .3s ease;border-radius:1px}
        .nav-link.active::after{width:100%;left:0}
        @media(hover:hover){.nav-link:hover::after{width:100%;left:0}}
        .pulse-dot{animation:pulse-ring 2s ease infinite}
        @keyframes pulse-ring{0%{box-shadow:0 0 0 0 rgba(14,165,233,.4)}70%{box-shadow:0 0 0 8px rgba(14,165,233,0)}100%{box-shadow:0 0 0 0 rgba(14,165,233,0)}}
        @supports(padding:env(safe-area-inset-bottom)){.mobile-safe-bottom{padding-bottom:env(safe-area-inset-bottom)}}
        html,body{overflow-x:hidden;max-width:100vw}

        /* Language toggle */
        .lang-toggle{display:flex;border-radius:8px;overflow:hidden;border:1.5px solid rgba(255,255,255,.2);background:rgba(255,255,255,.05);backdrop-filter:blur(4px)}
        .lang-toggle.scrolled{border-color:#d9e2ec;background:#f0f4f8}
        .lang-btn{padding:4px 10px;font-size:11px;font-weight:600;letter-spacing:.5px;transition:all .2s;cursor:pointer;border:none;background:transparent;color:rgba(255,255,255,.5)}
        .lang-btn.scrolled{color:#627d98}
        .lang-btn.active{background:#0ea5e9;color:#fff !important}
        .lang-btn:not(.active):hover{background:rgba(255,255,255,.1);color:rgba(255,255,255,.8)}
        .lang-btn.scrolled:not(.active):hover{background:#d9e2ec;color:#102a43}

        /* Fade transition */
        .i18n-fade{transition:opacity .15s ease}
        .i18n-fading{opacity:0}
    </style>
</head>
<body class="bg-white text-navy-900 antialiased">

    <?php require __DIR__ . '/../partials/navbar.php'; ?>

        <section id="hero" class="hero-gradient min-h-screen min-h-[100dvh] flex items-center relative overflow-hidden">
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
        <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] mix-blend-screen pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 w-full relative z-10 pt-20">
            <div class="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                <div class="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-sm font-semibold mb-6 animate-fade-in-up">
                        <span class="w-2 h-2 rounded-full bg-accent-400 pulse-dot"></span>
                        <span data-i18n="hero.status">Admin & HR Professional</span>
                    </div>
                    <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl/tight font-bold text-white mb-6">
                        <span class="block text-navy-200 text-2xl sm:text-3xl lg:text-4xl mb-2 font-sans font-medium" data-i18n="hero.greeting">Halo, saya</span>
                        <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-accent-100 to-accent-300">Sabila Fitriannisaa</span>
                    </h1>
                    <p class="text-base sm:text-lg text-navy-200 mb-10 leading-relaxed font-light" data-i18n="hero.desc">
                        Lulusan S1 Manajemen Universitas IPWIJA dengan minat besar di bidang Administrasi dan HRD. Memiliki pengalaman yang kuat dalam pengelolaan operasional, siap mendukung perusahaan dengan kemampuan komunikasi dan kerja sama tim yang baik.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <a href="#contact" class="px-8 py-3.5 bg-accent-500 hover:bg-accent-400 text-white rounded-xl font-semibold shadow-[0_8px_20px_rgba(14,165,233,0.25)] hover:shadow-[0_12px_25px_rgba(14,165,233,0.35)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                            <i data-lucide="mail" class="w-5 h-5"></i>
                            <span data-i18n="hero.ctaPrimary">Hubungi Saya</span>
                        </a>
                        <a href="#about" class="px-8 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                            <span data-i18n="hero.ctaSecondary">Lihat Profil</span>
                            <i data-lucide="arrow-right" class="w-5 h-5"></i>
                        </a>
                    </div>

                    <!-- Quick stats / highlights -->
                    <div class="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-6 text-left opacity-90">
                        <div>
                            <div class="text-accent-400 font-bold text-xl mb-1">S1 Manajemen</div>
                            <div class="text-navy-300 text-xs font-medium uppercase tracking-wider">Pendidikan</div>
                        </div>
                        <div>
                            <div class="text-accent-400 font-bold text-xl mb-1">HR & Admin</div>
                            <div class="text-navy-300 text-xs font-medium uppercase tracking-wider">Fokus Karir</div>
                        </div>
                        <div class="hidden sm:block">
                            <div class="text-accent-400 font-bold text-xl mb-1">Bekasi</div>
                            <div class="text-navy-300 text-xs font-medium uppercase tracking-wider">Lokasi</div>
                        </div>
                    </div>
                </div>

                <div class="relative max-w-md mx-auto lg:mr-0 lg:ml-auto w-full aspect-square hidden md:block">
                    <!-- Subtle decorative background element for the right side -->
                    <div class="absolute inset-0 bg-gradient-to-tr from-accent-500/20 to-transparent rounded-full border border-white/5 backdrop-blur-3xl animate-[spin_60s_linear_infinite]"></div>
                    <div class="absolute inset-4 bg-navy-900/50 rounded-full border border-white/10 flex flex-col items-center justify-center overflow-hidden">
                        <i data-lucide="sparkles" class="w-16 h-16 text-accent-500/30 mb-4"></i>
                        <p class="text-center px-8 text-navy-300 font-serif italic">"Dedikasi dan ketelitian dalam setiap tugas administratif."</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="about" class="py-16 sm:py-20 md:py-32 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
                <div class="reveal order-1">
                    <div class="relative max-w-md mx-auto lg:max-w-none">
                        <div class="aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-navy-100">
                            <img src="edit/uploads/1777446476_WhatsAppImage20260429at13.57.11.jpeg" alt="Sabila Fitriannisaa" class="w-full h-full object-cover" loading="lazy" onerror="this.src='https://via.placeholder.com/400x500?text=Foto+Sabila'">
                        </div>
                        <div class="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-24 sm:w-32 h-24 sm:h-32 bg-accent-500/10 rounded-xl sm:rounded-2xl -z-10"></div>
                        <div class="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-16 sm:w-24 h-16 sm:h-24 border-2 border-accent-500/20 rounded-xl sm:rounded-2xl -z-10"></div>
                        <div class="hidden sm:block absolute -right-3 md:-right-8 top-6 bg-white rounded-xl shadow-lg p-3 sm:p-4 border border-navy-100">
                            <div class="flex items-center gap-2 sm:gap-3">
                                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-accent-500/10 rounded-lg flex items-center justify-center flex-shrink-0"><i data-lucide="graduation-cap" class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500"></i></div>
                                <div>
                                    <p class="text-xs sm:text-sm font-semibold text-navy-900">S1 Manajemen</p>
                                    <p class="text-[10px] sm:text-xs text-navy-500">Univ. IPWIJA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="reveal order-2" style="transition-delay:.15s">
                    <p class="text-accent-500 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 i18n-fade" data-i18n="about.label">Tentang Saya</p>
                    <h2 class="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-navy-900 mb-4 sm:mb-6 leading-tight">
                        <span data-i18n="about.title1">Driven by Dedication,</span><br><span class="text-accent-500" data-i18n="about.title2">Focused on Management</span>
                    </h2>
                    <div class="space-y-3 sm:space-y-4 text-sm sm:text-base text-navy-600 leading-relaxed">
                        <p class="i18n-fade" data-i18n="about.p1">Saya adalah lulusan S1 Manajemen dari Universitas IPWIJA. Dengan latar belakang akademis yang kuat, saya berkomitmen untuk terus belajar, berprestasi, dan memperoleh pengalaman praktis yang berharga di dunia bisnis dan manajemen.</p>
                        <p class="i18n-fade" data-i18n="about.p2">Saya adalah pribadi yang cekatan, bertanggung jawab, dan cepat beradaptasi. Pengalaman magang saya sebagai Staff HRD telah melatih saya dalam mengelola data administrasi, absensi, hingga rekrutmen awal.</p>
                        <p class="i18n-fade" data-i18n="about.p3">Saat ini, saya memiliki motivasi tinggi untuk mempelajari hal-hal baru guna meningkatkan kemampuan diri dan memberikan kontribusi terbaik bagi perusahaan.</p>
                    </div>
                    <div class="grid grid-cols-2 gap-2.5 sm:gap-4 mt-6 sm:mt-8">
                        <div class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-navy-50 rounded-xl">
                            <i data-lucide="target" class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500 mt-0.5 flex-shrink-0"></i>
                            <div class="min-w-0">
                                <p class="text-xs sm:text-sm font-semibold text-navy-900 i18n-fade" data-i18n="about.h1t">Cekatan & Teliti</p>
                                <p class="text-[10px] sm:text-xs text-navy-500 mt-0.5 leading-snug i18n-fade" data-i18n="about.h1d">Bertanggung jawab dalam pekerjaan</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-navy-50 rounded-xl">
                            <i data-lucide="zap" class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500 mt-0.5 flex-shrink-0"></i>
                            <div class="min-w-0">
                                <p class="text-xs sm:text-sm font-semibold text-navy-900 i18n-fade" data-i18n="about.h2t">Adaptif</p>
                                <p class="text-[10px] sm:text-xs text-navy-500 mt-0.5 leading-snug i18n-fade" data-i18n="about.h2d">Cepat belajar hal baru</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="experience" class="py-16 sm:py-20 md:py-32 bg-navy-50/50">
        <div class="max-w-4xl mx-auto px-4 sm:px-6">
            <div class="text-center mb-10 sm:mb-16 reveal">
                <p class="text-accent-500 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 i18n-fade" data-i18n="exp.label">Perjalanan Karier</p>
                <h2 class="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-navy-900 i18n-fade" data-i18n="exp.title">Pengalaman & Pendidikan</h2>
            </div>
            <div class="relative">
                <div class="timeline-line"></div>
                <div class="relative pl-10 sm:pl-14 md:pl-0 mb-8 sm:mb-12 reveal">
                    <div class="absolute left-[11px] sm:left-[13px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-accent-500 rounded-full border-[3px] sm:border-4 border-navy-50 z-10 mt-1.5"></div>
                    <div class="md:w-[45%] md:pr-8 md:text-right">
                        <span class="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-accent-500/10 text-accent-600 text-[10px] sm:text-xs font-semibold rounded-full mb-2 sm:mb-3 i18n-fade" data-i18n="exp.tag1">Pendidikan</span>
                        <h3 class="text-base sm:text-lg font-bold text-navy-900">S1 Manajemen</h3>
                        <p class="text-accent-500 font-medium text-xs sm:text-sm mt-1">Universitas IPWIJA</p>
                        <p class="text-navy-500 text-xs sm:text-sm mt-1.5 leading-relaxed i18n-fade" data-i18n="exp.desc1">Lulusan S1 Manajemen dengan fokus pada pengelolaan Sumber Daya Manusia dan operasional bisnis perusahaan.</p>
                    </div>
                </div>
                <div class="relative pl-10 sm:pl-14 md:pl-0 mb-8 sm:mb-12 reveal" style="transition-delay:.1s">
                    <div class="absolute left-[11px] sm:left-[13px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-accent-500 rounded-full border-[3px] sm:border-4 border-navy-50 z-10 mt-1.5"></div>
                    <div class="md:w-[45%] md:ml-auto md:pl-8">
                        <span class="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-navy-900/10 text-navy-700 text-[10px] sm:text-xs font-semibold rounded-full mb-2 sm:mb-3 i18n-fade" data-i18n="exp.tag2">Magang HRD</span>
                        <h3 class="text-base sm:text-lg font-bold text-navy-900">Staff HRD</h3>
                        <p class="text-accent-500 font-medium text-xs sm:text-sm mt-1">PT. Karya Jaya Sembilan Saudara</p>
                        <p class="text-navy-500 text-xs sm:text-sm mt-1.5 leading-relaxed i18n-fade" data-i18n="exp.desc2">Mengelola absensi, rekrutmen awal, database pelamar di Excel, pengelolaan seragam, dan perhitungan jam lembur karyawan (SPL).</p>
                    </div>
                </div>
                <div class="relative pl-10 sm:pl-14 md:pl-0 reveal" style="transition-delay:.2s">
                    <div class="absolute left-[11px] sm:left-[13px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-accent-500 rounded-full border-[3px] sm:border-4 border-navy-50 z-10 mt-1.5"></div>
                    <div class="md:w-[45%] md:pr-8 md:text-right">
                        <span class="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 bg-accent-500/10 text-accent-600 text-[10px] sm:text-xs font-semibold rounded-full mb-2 sm:mb-3 i18n-fade" data-i18n="exp.tag3">Organisasi</span>
                        <h3 class="text-base sm:text-lg font-bold text-navy-900">Aktif Berorganisasi</h3>
                        <p class="text-accent-500 font-medium text-xs sm:text-sm mt-1 i18n-fade" data-i18n="exp.sub3">Kampus IPWIJA</p>
                        <p class="text-navy-500 text-xs sm:text-sm mt-1.5 leading-relaxed i18n-fade" data-i18n="exp.desc3">Aktif sebagai Sekretaris UKM Taekwondo (mengelola administrasi & proposal) serta Reporter UKM Jurnalistik (peliputan & wawancara).</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="skills" class="py-16 sm:py-20 md:py-32 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="text-center mb-10 sm:mb-16 reveal">
                <p class="text-accent-500 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 i18n-fade" data-i18n="skills.label">Kemampuan Utama</p>
                <h2 class="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-navy-900 i18n-fade" data-i18n="skills.title">Keahlian Saya</h2>
            </div>
            <div class="grid sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto" id="skills-grid"></div>
            <div class="flex flex-wrap justify-center gap-2 sm:gap-3 mt-8 sm:mt-12 reveal" style="transition-delay:.3s" id="skill-badges"></div>
        </div>
    </section>

    <section id="certifications" class="py-16 sm:py-20 md:py-32 bg-navy-950 relative overflow-hidden">
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-accent-500/5 rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-accent-500/5 rounded-full blur-3xl"></div>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div class="text-center mb-10 sm:mb-16 reveal">
                <p class="text-accent-400 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 i18n-fade" data-i18n="cert.label">Bukti Kompetensi</p>
                <h2 class="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white i18n-fade" data-i18n="cert.title">Sertifikat Saya</h2>
                <p class="text-navy-300 mt-3 sm:mt-4 max-w-lg mx-auto text-sm sm:text-base px-2 i18n-fade" data-i18n="cert.subtitle">Klik pada setiap kartu untuk melihat gambar sertifikat secara lengkap.</p>
            </div>
            <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8" id="cert-grid"></div>
        </div>
    </section>

    <section id="contact" class="py-16 sm:py-20 md:py-32 bg-navy-50/50 mobile-safe-bottom">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="text-center mb-10 sm:mb-16 reveal">
                <p class="text-accent-500 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 i18n-fade" data-i18n="contact.label">Mari Terhubung</p>
                <h2 class="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-navy-900 i18n-fade" data-i18n="contact.title">Hubungi Saya</h2>
            </div>
            <div class="grid lg:grid-cols-5 gap-8 sm:gap-12 max-w-5xl mx-auto">
                <div class="lg:col-span-2 reveal">
                    <p class="text-sm sm:text-base text-navy-600 leading-relaxed mb-6 sm:mb-8 i18n-fade" data-i18n="contact.desc">Saya sangat terbuka untuk mendiskusikan peluang karier. Jangan ragu untuk menghubungi saya.</p>
                    <div class="space-y-4 sm:space-y-5">
                        <a href="mailto:sfitriannisaa@gmail.com" class="flex items-center gap-3 sm:gap-4 group">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-accent-500/10 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"><i data-lucide="mail" class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500"></i></div>
                            <div class="min-w-0">
                                <p class="text-[10px] sm:text-xs text-navy-400 font-medium uppercase tracking-wider i18n-fade" data-i18n="contact.emailLabel">Email</p>
                                <p class="text-xs sm:text-sm font-semibold text-navy-900 truncate">sfitriannisaa@gmail.com</p>
                            </div>
                        </a>
                        <div class="flex items-center gap-3 sm:gap-4">
                            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-accent-500/10 rounded-xl flex items-center justify-center flex-shrink-0"><i data-lucide="map-pin" class="w-4 h-4 sm:w-5 sm:h-5 text-accent-500"></i></div>
                            <div>
                                <p class="text-[10px] sm:text-xs text-navy-400 font-medium uppercase tracking-wider i18n-fade" data-i18n="contact.locLabel">Lokasi</p>
                                <p class="text-xs sm:text-sm font-semibold text-navy-900 i18n-fade" data-i18n="contact.locValue">Bekasi, Jawa Barat</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="lg:col-span-3 reveal" style="transition-delay:.15s">
                    <form id="contact-form" class="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg border border-navy-100">
                        <div class="grid sm:grid-cols-2 gap-3 sm:gap-5 mb-3 sm:mb-5">
                            <div>
                                <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5 sm:mb-2 i18n-fade" data-i18n="contact.nameLabel">Nama</label>
                                <input type="text" name="name" required data-i18n-placeholder="contact.namePh" placeholder="Nama lengkap" class="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                            </div>
                            <div>
                                <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5 sm:mb-2 i18n-fade" data-i18n="contact.emailInputLabel">Email</label>
                                <input type="email" name="email" required data-i18n-placeholder="contact.emailPh" placeholder="email@contoh.com" class="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                            </div>
                        </div>
                        <div class="mb-3 sm:mb-5">
                            <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5 sm:mb-2 i18n-fade" data-i18n="contact.subjectLabel">Subjek</label>
                            <input type="text" name="subject" required data-i18n-placeholder="contact.subjectPh" placeholder="Topik pesan Anda" class="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                        </div>
                        <div class="mb-4 sm:mb-6">
                            <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1.5 sm:mb-2 i18n-fade" data-i18n="contact.msgLabel">Pesan</label>
                            <textarea name="message" rows="4" required data-i18n-placeholder="contact.msgPh" placeholder="Tulis pesan Anda di sini..." class="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all resize-none"></textarea>
                        </div>
                        <button type="submit" class="w-full flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-navy-900 text-white font-semibold rounded-lg sm:rounded-xl active:scale-[0.98] transition-all duration-200 shadow-lg shadow-navy-900/20 text-sm sm:text-base">
                            <i data-lucide="send" class="w-4 h-4"></i>
                            <span data-i18n="contact.submit">Kirim Pesan</span>
                        </button>
                        <p id="form-error" class="text-red-500 text-xs sm:text-sm mt-2 sm:mt-3 hidden"></p>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <footer class="bg-navy-950 text-white py-8 sm:py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent-500 flex items-center justify-center flex-shrink-0"><span class="text-white font-bold text-[10px] sm:text-xs">SF</span></div>
                    <span class="font-semibold text-sm sm:text-base tracking-tight">Sabila Fitriannisaa</span>
                </div>
                <p class="text-xs sm:text-sm text-navy-400">&copy; 2026 Sabila Fitriannisaa. All rights reserved.</p>
                <a href="#hero" class="flex items-center gap-1.5 text-xs sm:text-sm text-navy-400 hover:text-accent-400 transition-colors">
                    <span data-i18n="footer.backTop">Kembali ke atas</span>
                    <i data-lucide="arrow-up" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
                </a>
            </div>
        </div>
    </footer>

    <div id="lightbox" class="lightbox fixed inset-0 z-[100] bg-navy-950/95 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-8">
        <button onclick="closeLightbox()" class="absolute top-3 right-3 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-colors z-10 flex-shrink-0" aria-label="Close">
            <i data-lucide="x" class="w-4 h-4 sm:w-5 sm:h-5"></i>
        </button>
        <div class="lightbox-img w-full max-w-5xl max-h-[90vh] flex flex-col" onclick="event.stopPropagation()">
            <p id="lightbox-title" class="text-white text-center font-semibold mb-2 sm:mb-4 text-sm sm:text-lg flex-shrink-0 px-8"></p>
            <img id="lightbox-img" src="" alt="" class="w-full h-auto max-h-[80vh] object-contain rounded-lg sm:rounded-xl shadow-2xl">
            <iframe id="lightbox-pdf" src="" class="hidden w-full h-[80vh] rounded-lg sm:rounded-xl shadow-2xl bg-white" title="Certificate PDF"></iframe>
        </div>
    </div>

    <div id="auth-modal" class="lightbox fixed inset-0 z-[100] bg-navy-950/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative transition-transform transform scale-95 opacity-0" id="auth-card">
            <button onclick="closeAuthModal()" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-navy-50 hover:bg-navy-100 text-navy-500 transition-colors z-10" aria-label="Close">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
            <div class="p-6 sm:p-8">
                <div class="text-center mb-6">
                    <div class="w-12 h-12 rounded-xl bg-accent-500 flex items-center justify-center mx-auto mb-4">
                        <span class="text-white font-bold text-lg">SF</span>
                    </div>
                    <h3 class="text-xl sm:text-2xl font-bold text-navy-900" id="auth-title" data-i18n="auth.loginTitle">Selamat Datang</h3>
                    <p class="text-sm text-navy-500 mt-1" id="auth-subtitle" data-i18n="auth.loginSub">Silakan masuk ke akun Anda</p>
                </div>
                
                <form id="auth-form" class="space-y-4">
                    <div id="auth-name-group" class="hidden">
                        <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1" data-i18n="contact.nameLabel">Nama</label>
                        <input type="text" id="auth-name" class="w-full px-4 py-2.5 rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                    </div>
                    <div>
                        <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1" data-i18n="contact.emailInputLabel">Email</label>
                        <input type="email" id="auth-email" required class="w-full px-4 py-2.5 rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                    </div>
                    <div>
                        <label class="block text-xs sm:text-sm font-medium text-navy-700 mb-1" data-i18n="auth.passLabel">Kata Sandi</label>
                        <input type="password" id="auth-pass" required class="w-full px-4 py-2.5 rounded-xl border border-navy-200 bg-navy-50/50 text-navy-900 text-sm focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 transition-all">
                    </div>
                    
                    <button type="submit" class="w-full py-3 bg-navy-900 text-white font-semibold rounded-xl active:scale-[0.98] transition-all shadow-lg shadow-navy-900/20 text-sm sm:text-base mt-2" id="auth-submit-btn" data-i18n="auth.loginBtn">Masuk</button>
                </form>
                
                <div class="mt-6 text-center text-sm">
                    <span class="text-navy-500" id="auth-switch-text" data-i18n="auth.noAccount">Belum punya akun?</span>
                    <button onclick="toggleAuthMode()" class="text-accent-600 font-semibold hover:text-accent-700 transition-colors ml-1" id="auth-switch-btn" data-i18n="auth.registerNow">Daftar sekarang</button>
                </div>
            </div>
        </div>
    </div>

    <div id="toast" class="toast fixed top-3 right-3 sm:top-6 sm:right-6 z-[110] bg-white rounded-xl shadow-2xl border border-navy-100 p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 w-[calc(100vw-1.5rem)] sm:w-auto sm:max-w-sm">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0"><i data-lucide="check-circle" class="w-4 h-4 sm:w-5 sm:h-5 text-green-500"></i></div>
        <div class="min-w-0">
            <p class="text-xs sm:text-sm font-semibold text-navy-900" id="toast-title">Pesan Terkirim!</p>
            <p class="text-[10px] sm:text-xs text-navy-500 truncate" id="toast-desc">Terima kasih, saya akan segera membalas.</p>
        </div>
    </div>

    <script src="data.js"></script>
    <script src="app.js"></script>

    <script>
        // Script untuk warna teks username saat di-scroll
        const navUserName = document.getElementById('nav-user-name');
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 60;
            if(navUserName) {
                navUserName.classList.toggle('text-navy-900', scrolled);
                navUserName.classList.toggle('text-white', !scrolled);
            }
        });
    </script>
</body>
</html>
